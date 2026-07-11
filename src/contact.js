import * as THREE from "three";
import gsap from "gsap";
import { FontLoader }       from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry }     from "three/examples/jsm/geometries/TextGeometry.js";
import { RoomEnvironment }  from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer }   from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass }       from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass }       from "three/examples/jsm/postprocessing/OutputPass.js";
import { FractalGlass }     from "./fractalGlass.js";
import logoUrl              from "./assets/holm new logo.svg?url";
import contactBgUrl         from "./assets/new contact img 3.png?url";
import fontUrl              from "three/examples/fonts/droid/droid_serif_regular.typeface.json?url";
import "./contact.css";

// ─── Tunables ─────────────────────────────────────────────────────
const CAM_Z         = 6.2;
// Camera FOV 36° at CAM_Z 6.2 → visible world-Y half-height ≈ 2.02.
// "contact" is a wide word — vertical target is smaller than height would be,
// horizontal target is much bigger. Both bounds are clamped to the viewport.
const LOGO_Y        = 1.05;          // world-Y — sits centered in the top half
const LOGO_TARGET_H = 1.15;          // world-space height cap
const LOGO_TARGET_W = 5.6;           // world-space width cap
// No full rotation and no diagonal tilt — the logo hangs upright and
// only sways within a small angle on both axes so it feels alive
// without ever losing its face to the viewer.
const LOGO_SWAY_X    = 0.09;         // rad — sway amplitude around X (nod)
const LOGO_SWAY_Y    = 0.16;         // rad — sway amplitude around Y (turn)
const LOGO_SWAY_HZ_X = 0.09;         // sway frequency around X
const LOGO_SWAY_HZ_Y = 0.13;         // sway frequency around Y (irrational ratio → non-repeating motion)
const LOGO_FLOAT_AMP = 0.09;         // world-Y bob amplitude
const LOGO_FLOAT_HZ  = 0.19;         // bob frequency (Hz)
const EXTRUDE_DEPTH  = 14;
const BEVEL_SIZE     = 0.5;

// Three equal links, in the order they appear left → right
const LINKS = [
  { id: "book",     label: "Book a call", href: "#book",                                                external: false },
  { id: "linkedin", label: "LinkedIn",    href: "https://www.linkedin.com/in/canberk-polat-679bab403/", external: true  },
  { id: "email",    label: "email",       href: "mailto:contact@byholm.co",                             external: false },
];

// ─── Contact page controller ──────────────────────────────────────
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
    this._bg       = null;

    this._logoGroup = null;
    this._lights    = [];

    this._rafId    = null;
    this._active   = false;
    this._prevTime = 0;
    this._elapsed  = 0;

    this._onResize      = this._onResize.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
  }

  init() {
    this._createDOM();
    this._createThree();
    this._createLogo();
    window.addEventListener("resize",      this._onResize);
    window.addEventListener("pointermove", this._onPointerMove, { passive: true });
    this._revealButtons();
    this._startLoop();
  }

  destroy() {
    this._active = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    window.removeEventListener("resize",      this._onResize);
    window.removeEventListener("pointermove", this._onPointerMove);

    if (this._logoGroup) {
      this._logoGroup.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
    }
    this.envMap?.dispose();
    this._bg?.dispose();
    for (const l of this._lights) this.scene?.remove(l);

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

  // ── DOM ────────────────────────────────────────────────────────
  _createDOM() {
    const container = document.createElement("div");
    container.className = "holm-contact";
    if (this._reducedMotion) container.classList.add("is-reduced-motion");

    const orb = (link) => `
      <a class="holm-contact__orb"
         href="${link.href}"
         data-link="${link.id}"
         ${link.external ? 'target="_blank" rel="noopener noreferrer"' : ""}
         data-hover-roll
         data-hover-roll-copy="${link.label} →">
        <span class="holm-contact__orb-label">${link.label}</span>
      </a>
    `;

    container.innerHTML = `
      <canvas class="holm-contact__canvas" aria-hidden="true"></canvas>
      <a class="holm-contact__brand" href="/" aria-label="HOLM — home">
        <img src="${logoUrl}" alt="HOLM" />
      </a>
      <main class="holm-contact__stage">
        <div class="holm-contact__logo-anchor" aria-hidden="true"></div>
        <nav class="holm-contact__links" aria-label="Contact">
          ${LINKS.map(orb).join("")}
        </nav>
      </main>
    `;
    document.body.appendChild(container);

    this.container = container;
    this.canvas    = container.querySelector(".holm-contact__canvas");
  }

  _revealButtons() {
    const orbs = this.container.querySelectorAll(".holm-contact__orb");
    if (this._reducedMotion) {
      gsap.set(orbs, { opacity: 1, scale: 1, y: 0 });
      return;
    }
    gsap.set(orbs, { opacity: 0, y: 40, scale: 0.85 });
    gsap.to(orbs, {
      opacity: 1,
      y:       0,
      scale:   1,
      duration: 0.9,
      stagger:  0.12,
      delay:    0.35,
      ease:     "back.out(1.4)",
      // Release inline transform once reveal finishes so the CSS float
      // keyframe on each orb can take over.
      onComplete: () => {
        orbs.forEach((o) => { o.style.transform = ""; });
      },
    });
  }

  // ── Three.js ───────────────────────────────────────────────────
  _createThree() {
    this.renderer = new THREE.WebGLRenderer({
      canvas:          this.canvas,
      antialias:       true,
      alpha:           false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this._isMobile ? 1.5 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.7;
    this.renderer.outputColorSpace    = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();

    // Fractal-glass backdrop over the contact background image
    this._bg = new FractalGlass(this.renderer, {
      imageUrl: contactBgUrl,
    });
    this.scene.background = this._bg.texture;

    this.camera = new THREE.PerspectiveCamera(
      36, window.innerWidth / window.innerHeight, 0.1, 100,
    );
    this.camera.position.set(0, 0, CAM_Z);
    this.camera.lookAt(0, 0, 0);

    // PMREM env for glassy reflections on the extruded logo
    const pmrem  = new THREE.PMREMGenerator(this.renderer);
    const room   = new RoomEnvironment();
    this.envMap  = pmrem.fromScene(room, 0.04).texture;
    pmrem.dispose();
    this.scene.environment          = this.envMap;
    this.scene.environmentIntensity = 1.4;

    this._composer = new EffectComposer(this.renderer);
    this._composer.setPixelRatio(this.renderer.getPixelRatio());
    this._composer.setSize(window.innerWidth, window.innerHeight);
    this._composer.addPass(new RenderPass(this.scene, this.camera));
    this._composer.addPass(new OutputPass());

    // Lights — a key + fill so the extrude sides pick up shadow gradient
    const key = new THREE.DirectionalLight(0xffe6c8, 3.6);
    key.position.set(3.0, 4.0, 3.0);
    this.scene.add(key);
    this._lights.push(key);

    const fill = new THREE.DirectionalLight(0x88a6d6, 1.2);
    fill.position.set(-3.5, 0.5, -1.5);
    this.scene.add(fill);
    this._lights.push(fill);

    const rim = new THREE.DirectionalLight(0xd0dcff, 0.9);
    rim.position.set(0, -2.5, -3);
    this.scene.add(rim);
    this._lights.push(rim);

    const amb = new THREE.AmbientLight(0x1a2038, 0.5);
    this.scene.add(amb);
    this._lights.push(amb);
  }

  // ── 3D logo: extrude from the SVG ──────────────────────────────
  _createLogo() {
    new FontLoader().load(fontUrl, (font) => {
      // Dark, matte-graphite word — reads as sculpted ink on the pale
      // fluid backdrop
      const mat = new THREE.MeshPhysicalMaterial({
        color:              0x1a1f2c,
        metalness:          0.10,
        roughness:          0.25,
        clearcoat:          1.0,
        clearcoatRoughness: 0.09,
        envMapIntensity:    1.10,
      });

      const textGeo = new TextGeometry("contact", {
        font,
        size:           40,
        depth:          EXTRUDE_DEPTH,
        curveSegments:  24,
        bevelEnabled:   true,
        bevelThickness: BEVEL_SIZE,
        bevelSize:      BEVEL_SIZE,
        bevelSegments:  4,
      });
      textGeo.center();

      const inner = new THREE.Group();
      inner.add(new THREE.Mesh(textGeo, mat));

      const box    = new THREE.Box3().setFromObject(inner);
      const size   = new THREE.Vector3();
      box.getSize(size);

      // Wrapper holds resting position; inner group carries sway + float
      const wrapper = new THREE.Group();
      wrapper.position.y = LOGO_Y;
      wrapper.add(inner);
      this._logoBaseY = LOGO_Y;
      this._logoSize  = size.clone();
      const scale = this._computeLogoScale();
      wrapper.scale.setScalar(scale);
      this._logoScale = scale;

      this._logoInner = inner;
      this._logoGroup = wrapper;
      this.scene.add(wrapper);

      if (this._reducedMotion) {
        wrapper.scale.setScalar(scale);
      } else {
        mat.transparent = true;
        mat.opacity     = 0;
        wrapper.scale.setScalar(scale * 0.85);
        gsap.to(mat, { opacity: 1, duration: 1.1, delay: 0.25, ease: "power2.out" });
        gsap.to(wrapper.scale, { x: scale, y: scale, z: scale, duration: 1.3, delay: 0.2, ease: "power3.out" });
      }
    });
  }

  _onPointerMove(e) {
    this._bg?.setPointer(e.clientX, e.clientY);
  }

  // Width-aware scale so the logo fits both the vertical and horizontal
  // budget of the current viewport. Recomputed on resize.
  _computeLogoScale() {
    if (!this._logoSize) return 1;
    const aspect  = window.innerWidth / window.innerHeight;
    const targetH = window.innerWidth < 640 ? 0.72 : LOGO_TARGET_H;
    const targetW = Math.min(LOGO_TARGET_W, aspect * 3.9);
    const scaleH  = targetH / Math.max(this._logoSize.y, 0.001);
    const scaleW  = targetW / Math.max(this._logoSize.x, 0.001);
    return Math.min(scaleH, scaleW);
  }

  _onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this._composer.setSize(w, h);
    this._bg?.resize();
    this._isMobile = w < 768 || "ontouchstart" in window;

    // Rescale the logo to fit the new viewport
    if (this._logoGroup) {
      const scale = this._computeLogoScale();
      this._logoGroup.scale.setScalar(scale);
      this._logoScale = scale;
    }
  }

  // ── Render loop ────────────────────────────────────────────────
  _startLoop() {
    this._active   = true;
    this._prevTime = performance.now();
    const tick = (now) => {
      if (!this._active) return;
      const dtRaw = (now - this._prevTime) / 1000;
      const dt    = Math.min(dtRaw, 0.05);
      this._prevTime = now;
      this._elapsed += dt;

      // Advance the fractal-glass backdrop (mouse lerp + render-to-target)
      this._bg?.step(this._elapsed);

      // Logo motion — no full rotation. Two low-frequency sines drive
      // sway on X and Y (irrational ratio → non-repeating drift), plus
      // a soft vertical bob. The whole thing looks suspended in the
      // fluid, like a piece caught in a slow current.
      if (this._logoInner && !this._reducedMotion) {
        const PI2 = Math.PI * 2;
        this._logoInner.rotation.x = Math.sin(this._elapsed * LOGO_SWAY_HZ_X * PI2) * LOGO_SWAY_X;
        this._logoInner.rotation.y = Math.sin(this._elapsed * LOGO_SWAY_HZ_Y * PI2) * LOGO_SWAY_Y;
      }
      if (this._logoGroup && this._logoBaseY != null && !this._reducedMotion) {
        const bob = Math.sin(this._elapsed * LOGO_FLOAT_HZ * Math.PI * 2) * LOGO_FLOAT_AMP;
        this._logoGroup.position.y = this._logoBaseY + bob;
      }

      this._composer.render();
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }
}
