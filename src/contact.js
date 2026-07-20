import * as THREE from "three";
import gsap from "gsap";
import { RoomEnvironment }  from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer }   from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass }       from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass }  from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass }       from "three/examples/jsm/postprocessing/OutputPass.js";
import logoUrl              from "./assets/holm new logo.svg?url";
import "./contact.css";

// ─── Panels — three suspended gems, each with a label pinned above ─
// Positions are hand-composed rather than derived from a grid so the
// cluster reads as a curated arrangement (gallery/atelier) instead of
// a repeating pattern.
const PANELS = [
  {
    id: "linkedin", label: "LinkedIn",
    href: "https://www.linkedin.com/in/canberk-polat-679bab403/", external: true,
    pos: new THREE.Vector3(-2.65,  1.05, -0.20),
    driftPhase: 0.0,
  },
  {
    id: "email", label: "Email",
    href: "mailto:contact@byholm.co", external: false,
    pos: new THREE.Vector3( 0.50, -0.95,  0.85),
    driftPhase: 2.1,
  },
  {
    id: "book", label: "Book a call",
    href: "https://cal.com/canberk-polat-dpsl0y/discovery-call", external: true,
    pos: new THREE.Vector3( 2.55,  0.55, -0.35),
    driftPhase: 4.2,
  },
];

// ─── Tunables ───────────────────────────────────────────────────────
const CAM_Z         = 7.0;
const GEM_SCALE     = 0.68;
const GEM_ACTIVE    = 0.82;
const DRIFT_AMP_Y   = 0.16;
const DRIFT_HZ      = 0.14;
const SPIN_SPEED    = 0.22;
const PARALLAX_MAX  = 0.35;
const PARALLAX_LERP = 0.06;

// ─── Brilliant-cut geometry (ported from philosophy.js) ────────────
const _diamondGeomCache = new Map();
function createBrilliantDiamond(N = 16) {
  const cached = _diamondGeomCache.get(N);
  if (cached) return cached;

  const halfStep = Math.PI / N;
  const layers = [
    [ 0.62,  0.00,  0        ],
    [ 0.62,  0.40,  0        ],
    [ 0.40,  0.70,  halfStep ],
    [ 0.08,  1.00,  0        ],
    [-0.22,  0.88,  halfStep ],
    [-0.72,  0.42,  0        ],
    [-1.08,  0.00,  0        ],
  ];

  const rings = layers.map(([y, r, a]) => {
    if (r === 0) return [[0, y, 0]];
    const verts = [];
    for (let i = 0; i < N; i++) {
      const th = (i / N) * Math.PI * 2 + a;
      verts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    return verts;
  });

  const positions = [];
  const indices   = [];
  const pushTri = (a, b, c) => {
    const base = positions.length / 3;
    positions.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    indices.push(base, base + 1, base + 2);
  };
  for (let li = 0; li < layers.length - 1; li++) {
    const r1 = rings[li], r2 = rings[li + 1];
    if (r1.length === 1 && r2.length > 1) {
      const c = r1[0];
      for (let i = 0; i < N; i++) pushTri(c, r2[i], r2[(i + 1) % N]);
    } else if (r1.length > 1 && r2.length === 1) {
      const c = r2[0];
      for (let i = 0; i < N; i++) pushTri(r1[i], r1[(i + 1) % N], c);
    } else {
      for (let i = 0; i < N; i++) {
        const j = (i + 1) % N;
        pushTri(r1[i], r1[j], r2[i]);
        pushTri(r1[j], r2[j], r2[i]);
      }
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.scale(0.92, 1.06, 0.92);
  g.computeVertexNormals();
  _diamondGeomCache.set(N, g);
  return g;
}

// ─── Contact page controller ───────────────────────────────────────
export class Contact {
  constructor() {
    this._reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this._isMobile      = window.innerWidth < 768 || "ontouchstart" in window;

    this.container = null;
    this.canvas    = null;
    this.renderer  = null;
    this.scene     = null;
    this.camera    = null;
    this.envMap    = null;
    this._composer = null;
    this._bloom    = null;

    this._cluster  = null;
    this._diamonds = [];
    this._lights   = [];
    this._labelEls = [];

    this._pointer         = new THREE.Vector2(-99, -99);
    this._pointerSmooth   = new THREE.Vector2(0, 0);
    this._raycaster       = new THREE.Raycaster();

    this._hoveredIdx = -1;
    this._locked     = false;
    this._elapsed    = 0;

    this._onResize      = this._onResize.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onClick       = this._onClick.bind(this);

    this._rafId  = null;
    this._active = false;

    this._projVec = new THREE.Vector3();
  }

  init() {
    this._createDOM();
    this._createThree();
    this._createCluster();
    this._addLights();
    this._bindInteraction();
    window.addEventListener("resize", this._onResize);
    this._startLoop();
  }

  destroy() {
    this._active = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    window.removeEventListener("resize", this._onResize);
    if (this.canvas) {
      this.canvas.removeEventListener("pointermove", this._onPointerMove);
      this.canvas.removeEventListener("click",       this._onClick);
    }
    for (const d of this._diamonds) d.material?.dispose();
    this._diamonds = [];
    for (const l of this._lights) this.scene?.remove(l);
    if (this.envMap) this.envMap.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss?.();
    }
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.renderer = this.scene = this.camera = null;
    this.container = this.canvas = null;
  }

  // ── DOM ─────────────────────────────────────────────────────────
  _createDOM() {
    const container = document.createElement("div");
    container.className = "holm-contact";

    const labelsHtml = PANELS.map((p, i) => `
      <a class="holm-contact__label"
         data-idx="${i}"
         href="${p.href}"
         ${p.external ? 'target="_blank" rel="noopener noreferrer"' : ''}>
        <span class="holm-contact__label-idx">0${i + 1}</span>
        <span class="holm-contact__label-text">${p.label}</span>
      </a>
    `).join("");

    container.innerHTML = `
      <canvas class="holm-contact__canvas" aria-hidden="true"></canvas>

      <a class="holm-contact__brand" href="/" aria-label="HOLM — home">
        <img src="${logoUrl}" alt="HOLM" />
      </a>

      <div class="holm-contact__eyebrow" aria-hidden="true">
        <span class="holm-contact__eyebrow-mark">◇</span>
        <span class="holm-contact__eyebrow-text">Reach out</span>
      </div>

      <div class="holm-contact__labels" aria-label="Contact links">
        ${labelsHtml}
      </div>

      <div class="holm-contact__hint" aria-hidden="true">Hover · Click</div>
    `;

    document.body.appendChild(container);
    this.container = container;
    this.canvas    = container.querySelector(".holm-contact__canvas");
    this.hintEl    = container.querySelector(".holm-contact__hint");
    this._labelEls = [...container.querySelectorAll(".holm-contact__label")];
  }

  // ── Three.js ────────────────────────────────────────────────────
  _createThree() {
    this.renderer = new THREE.WebGLRenderer({
      canvas:          this.canvas,
      antialias:       true,
      alpha:           false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this._isMobile ? 1.2 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.outputColorSpace    = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x686872);
    this.scene.fog        = new THREE.Fog(0x686872, 8, 22);

    this.camera = new THREE.PerspectiveCamera(
      38, window.innerWidth / window.innerHeight, 0.1, 100,
    );
    this.camera.position.set(0, 0, CAM_Z);
    this.camera.lookAt(0, 0, 0);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment          = this.envMap;
    this.scene.environmentIntensity = 1.4;

    this._composer = new EffectComposer(this.renderer);
    this._composer.setPixelRatio(this.renderer.getPixelRatio());
    this._composer.setSize(window.innerWidth, window.innerHeight);
    this._composer.addPass(new RenderPass(this.scene, this.camera));
    this._bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.28,   // strength
      0.32,   // radius
      0.82,   // threshold
    );
    this._composer.addPass(this._bloom);
    this._composer.addPass(new OutputPass());
  }

  // ── Suspended cluster ──────────────────────────────────────────
  _createCluster() {
    this._cluster = new THREE.Group();
    this.scene.add(this._cluster);

    const geo = createBrilliantDiamond(this._isMobile ? 12 : 16);

    for (let i = 0; i < PANELS.length; i++) {
      const spec = PANELS[i];

      const mat = new THREE.MeshPhysicalMaterial({
        color:                     0xffffff,
        metalness:                 0.0,
        roughness:                 0.02,
        transmission:              1.0,
        thickness:                 1.6,
        ior:                       2.417,
        attenuationDistance:       10.0,
        attenuationColor:          new THREE.Color(0xffffff),
        envMapIntensity:           1.6,
        iridescence:               0.35,
        iridescenceIOR:            1.55,
        iridescenceThicknessRange: [400, 900],
        clearcoat:                 0.9,
        clearcoatRoughness:        0.02,
        transparent:               true,
        side:                      THREE.FrontSide,
      });
      if ("dispersion" in mat) mat.dispersion = 3.6;

      const gem = new THREE.Mesh(geo, mat);
      gem.position.copy(spec.pos);
      gem.scale.setScalar(GEM_SCALE);
      gem.rotation.x = -0.20;
      gem.userData = {
        idx: i,
        spec,
        basePos: spec.pos.clone(),
        driftPhase: spec.driftPhase,
      };
      this._cluster.add(gem);
      this._diamonds.push(gem);
    }
  }

  _addLights() {
    const amb = new THREE.AmbientLight(0x323644, 0.5);
    this.scene.add(amb); this._lights.push(amb);

    const key = new THREE.DirectionalLight(0xffe4c0, 2.2);
    key.position.set(5, 5, 5);
    this.scene.add(key); this._lights.push(key);

    const fill = new THREE.DirectionalLight(0xa8c8ff, 1.3);
    fill.position.set(-5, 3, 3);
    this.scene.add(fill); this._lights.push(fill);

    const rim = new THREE.PointLight(0xffffff, 60, 20, 2);
    rim.position.set(0, -2, -4);
    this.scene.add(rim); this._lights.push(rim);
  }

  // ── Interaction ────────────────────────────────────────────────
  _bindInteraction() {
    this.canvas.addEventListener("pointermove", this._onPointerMove);
    this.canvas.addEventListener("click",       this._onClick);
  }
  _onPointerMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this._pointer.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    this._pointer.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    this._hideHint();
  }
  _onClick() {
    if (this._locked) return;
    this._raycaster.setFromCamera(this._pointer, this.camera);
    const hits = this._raycaster.intersectObjects(this._diamonds, false);
    if (!hits.length) return;
    this._activate(hits[0].object);
  }

  _activate(gem) {
    this._locked = true;
    const spec = gem.userData.spec;
    const target = gem.getWorldPosition(new THREE.Vector3());
    const dolly  = target.clone().multiplyScalar(0.55);

    gsap.to(gem.scale, {
      x: GEM_ACTIVE * 1.35, y: GEM_ACTIVE * 1.35, z: GEM_ACTIVE * 1.35,
      duration: 0.6, ease: "power3.inOut",
    });
    gsap.to(this.camera.position, {
      x: dolly.x, y: dolly.y, z: dolly.z + 1.0,
      duration: 0.85, ease: "power3.inOut",
      onUpdate: () => this.camera.lookAt(target),
      onComplete: () => {
        if (spec.external) window.open(spec.href, "_blank", "noopener,noreferrer");
        else               window.location.href = spec.href;

        gsap.to(this.camera.position, {
          x: 0, y: 0, z: CAM_Z,
          duration: 1.0, delay: 0.35, ease: "power3.out",
          onUpdate: () => this.camera.lookAt(0, 0, 0),
          onComplete: () => { this._locked = false; },
        });
        gsap.to(gem.scale, {
          x: GEM_SCALE, y: GEM_SCALE, z: GEM_SCALE,
          duration: 0.7, delay: 0.35, ease: "power3.out",
        });
      },
    });
  }

  _hideHint() {
    if (this._hintHidden || !this.hintEl) return;
    this._hintHidden = true;
    gsap.to(this.hintEl, { opacity: 0, duration: 0.6, ease: "power2.out" });
  }

  // ── Label projection — DOM → 3D → 2D each frame ────────────────
  _updateLabels() {
    if (!this._labelEls.length) return;
    const w = window.innerWidth, h = window.innerHeight;
    const halfW = w / 2, halfH = h / 2;

    for (let i = 0; i < this._diamonds.length; i++) {
      const gem = this._diamonds[i];
      const el  = this._labelEls[i];
      if (!el) continue;

      gem.updateMatrixWorld();
      this._projVec.setFromMatrixPosition(gem.matrixWorld);
      this._projVec.y += 1.4 * gem.scale.y;

      this._projVec.project(this.camera);
      if (this._projVec.z > 1 || this._projVec.z < -1) {
        el.style.opacity = "0";
        continue;
      }
      const x = ( this._projVec.x * halfW) + halfW;
      const y = (-this._projVec.y * halfH) + halfH;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;

      const active = i === this._hoveredIdx;
      el.classList.toggle("is-active", active);
      el.style.opacity = "1";
    }
  }

  // ── Render loop ────────────────────────────────────────────────
  _startLoop() {
    this._active = true;
    let last = performance.now();
    const tick = (now) => {
      if (!this._active) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      this._elapsed += dt;
      last = now;

      const pk = 1 - Math.pow(1 - PARALLAX_LERP, dt * 60);
      const px = Number.isFinite(this._pointer.x) && this._pointer.x > -1.5 ? this._pointer.x : 0;
      const py = Number.isFinite(this._pointer.y) && this._pointer.y > -1.5 ? this._pointer.y : 0;
      this._pointerSmooth.x += (px - this._pointerSmooth.x) * pk;
      this._pointerSmooth.y += (py - this._pointerSmooth.y) * pk;

      if (this._cluster && !this._locked) {
        this._cluster.rotation.y = this._pointerSmooth.x * PARALLAX_MAX;
        this._cluster.rotation.x = -this._pointerSmooth.y * PARALLAX_MAX * 0.7;
      }

      for (let i = 0; i < this._diamonds.length; i++) {
        const gem = this._diamonds[i];
        const ud  = gem.userData;
        const bob = Math.sin(this._elapsed * DRIFT_HZ * Math.PI * 2 + ud.driftPhase) * DRIFT_AMP_Y;
        gem.position.y = ud.basePos.y + bob;
        gem.rotation.y = this._elapsed * SPIN_SPEED + ud.driftPhase * 0.5;
      }

      if (!this._locked && this._pointer.x > -1.5) {
        this._raycaster.setFromCamera(this._pointer, this.camera);
        const hits = this._raycaster.intersectObjects(this._diamonds, false);
        const hoveredIdx = hits.length ? hits[0].object.userData.idx : -1;
        if (hoveredIdx !== this._hoveredIdx) {
          if (this._hoveredIdx >= 0) this._deemphasize(this._diamonds[this._hoveredIdx]);
          if (hoveredIdx >= 0)       this._emphasize   (this._diamonds[hoveredIdx]);
          this._hoveredIdx = hoveredIdx;
          this.canvas.style.cursor = hoveredIdx >= 0 ? "pointer" : "default";
        }
      }

      this._updateLabels();
      this._composer.render();
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  _emphasize(gem) {
    gsap.to(gem.scale, {
      x: GEM_ACTIVE, y: GEM_ACTIVE, z: GEM_ACTIVE,
      duration: 0.5, ease: "power2.out",
    });
    gsap.to(gem.material, {
      iridescence: 0.75,
      roughness:   0.0,
      duration:    0.5,
      ease:        "power2.out",
    });
  }
  _deemphasize(gem) {
    gsap.to(gem.scale, {
      x: GEM_SCALE, y: GEM_SCALE, z: GEM_SCALE,
      duration: 0.5, ease: "power2.out",
    });
    gsap.to(gem.material, {
      iridescence: 0.35,
      roughness:   0.02,
      duration:    0.5,
      ease:        "power2.out",
    });
  }

  _onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    if (this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    this.renderer?.setSize(w, h);
    this._composer?.setSize(w, h);
    this._bloom?.setSize(w, h);
    this._isMobile = w < 768 || "ontouchstart" in window;
  }
}
