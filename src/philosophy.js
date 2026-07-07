import * as THREE from "three";
import gsap from "gsap";
import "./philosophy.css";

// ─── Tunables ────────────────────────────────────────────────────────
const IDLE_SPIN_SPEED    = 0.16;       // rad/s — never stops
const SCROLL_SPIN_MULT   = 1.35;       // extra Y rotation added by scroll
const SCROLL_TILT_MAX    = 0.20;       // rad — X tilt at scroll = 1
const SCROLL_CAM_DOLLY   = 0.55;       // camera z units traveled across scroll
const CAM_Z_BASE         = 5.6;

const ENVMAP_INTENSITY   = 1.35;
const DISPERSION         = 3.4;        // MeshPhysicalMaterial.dispersion (r166+)
const IRIDESCENCE        = 0.6;
const IRID_THICKNESS     = [220, 780];
const THICKNESS_DESKTOP  = 1.6;
const THICKNESS_MOBILE   = 0.9;

const BLOCK_REVEAL_DUR   = 1.15;
const BLOCK_REVEAL_STAG  = 0.13;
const BLOCK_REVEAL_EASE  = "power3.out";
const BLOCK_TRIGGER_PCT  = 0.35;       // block enters when 35% visible

const KEY_COLOR    = 0xfff2dc;
const FILL_COLOR   = 0x6890c8;
const RIM_COLOR    = 0xa8b0e0;

// Manifesto — each stanza is its own scroll beat
const MANIFESTO = [
  ["Some studios tell stories.",           "We work toward a single moment."],
  ["The moment a rough idea holds still —", "and becomes something finished."],
  ["It is rare. It forms under pressure.",  "The way carbon becomes a diamond."],
  ["So that is the shape we keep returning to.", "Not decoration. A reminder of what we are after."],
  ["Between sketch and masterpiece,",       "there is patience."],
  ["This takes time."],
];

// ─── Philosophy page controller ──────────────────────────────────────
export class Philosophy {
  constructor({ lenis } = {}) {
    this.lenis          = lenis || null;
    this._reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this._isMobile      = window.innerWidth < 768 || "ontouchstart" in window;

    // Three.js
    this.renderer  = null;
    this.scene     = null;
    this.camera    = null;
    this.diamond   = null;
    this.envMap    = null;
    this._lights   = [];

    // DOM
    this.container = null;
    this.canvas    = null;
    this.blocks    = [];

    // Anim state
    this._rafId       = null;
    this._active      = false;
    this._prevTime    = 0;
    this._scrollT     = 0;
    this._extraSpin   = 0;

    // Handlers (bound refs for removeEventListener)
    this._onResize     = this._onResize.bind(this);
    this._onLenisScroll = this._onLenisScroll.bind(this);
    this._onNativeScroll = this._onNativeScroll.bind(this);
    this._observer     = null;
  }

  // ── Public API ──────────────────────────────────────────────────
  init() {
    this._createDOM();
    this._createThree();
    this._bindScroll();
    this._bindResize();
    this._observeBlocks();
    this._startLoop();
  }

  destroy() {
    this._active = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    window.removeEventListener("resize", this._onResize);
    if (this.lenis && this._lenisScrollBound) {
      this.lenis.off("scroll", this._onLenisScroll);
    } else {
      window.removeEventListener("scroll", this._onNativeScroll);
    }
    if (this._observer) this._observer.disconnect();

    if (this.diamond) {
      this.diamond.geometry.dispose();
      this.diamond.material.dispose();
    }
    if (this.envMap) this.envMap.dispose();
    for (const l of this._lights) this.scene?.remove(l);

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss?.();
    }
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.renderer = this.scene = this.camera = null;
    this.diamond  = this.envMap = null;
    this.container = this.canvas = null;
  }

  // ── DOM ─────────────────────────────────────────────────────────
  _createDOM() {
    const container = document.createElement("div");
    container.className = "holm-philosophy";
    const finalIdx = MANIFESTO.length - 1;
    container.innerHTML = `
      <canvas class="holm-philosophy__canvas" aria-hidden="true"></canvas>
      <div class="holm-philosophy__vignette" aria-hidden="true"></div>
      <main class="holm-philosophy__content">
        ${MANIFESTO.map((stanza, i) => `
          <section class="holm-philosophy__block"
                   data-idx="${i}"
                   data-final="${i === finalIdx}">
            ${stanza.map(line => `
              <div class="holm-philosophy__line">
                <span class="holm-philosophy__line-inner">${line}</span>
              </div>
            `).join("")}
          </section>
        `).join("")}
        <div class="holm-philosophy__end">
          <a class="holm-philosophy__contact" href="/contact/">Contact</a>
        </div>
      </main>
    `;
    document.body.appendChild(container);

    this.container = container;
    this.canvas    = container.querySelector(".holm-philosophy__canvas");
    this.blocks    = [...container.querySelectorAll(".holm-philosophy__block")];

    // Hide lines initially so reveal has something to animate FROM
    if (!this._reducedMotion) {
      const allLines = container.querySelectorAll(".holm-philosophy__line-inner");
      gsap.set(allLines, { yPercent: 110, opacity: 0 });
    }
  }

  // ── Three.js ────────────────────────────────────────────────────
  _createThree() {
    this.renderer = new THREE.WebGLRenderer({
      canvas:           this.canvas,
      antialias:        true,
      alpha:            false,
      powerPreference:  "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this._isMobile ? 1.5 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping        = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace   = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(
      36, window.innerWidth / window.innerHeight, 0.1, 100,
    );
    this.camera.position.set(0, 0, CAM_Z_BASE);
    this.camera.lookAt(0, 0, 0);

    // Environment (procedural — no external HDR dependency)
    this.envMap = this._buildProceduralEnv();
    this.scene.environment          = this.envMap;
    this.scene.environmentIntensity = ENVMAP_INTENSITY;

    this._createDiamond();
    this._addLights();
  }

  _buildProceduralEnv() {
    // Studio-lit equirect: dark deep, warm horizon, cool sky, one soft hotspot
    const cv  = document.createElement("canvas");
    cv.width  = 1024;
    cv.height = 512;
    const ctx = cv.getContext("2d");

    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0.00, "#f4f0e0");   // sky-top warm
    g.addColorStop(0.20, "#9db4d8");
    g.addColorStop(0.45, "#3a4a6c");
    g.addColorStop(0.55, "#1a2138");
    g.addColorStop(0.80, "#0a0e18");
    g.addColorStop(1.00, "#000000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 512);

    // Warm horizon rim
    const horiz = ctx.createLinearGradient(0, 200, 0, 320);
    horiz.addColorStop(0, "rgba(0,0,0,0)");
    horiz.addColorStop(0.5, "rgba(255, 170, 90, 0.24)");
    horiz.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = horiz;
    ctx.fillRect(0, 200, 1024, 120);

    // Soft key-light hotspot
    const hi = ctx.createRadialGradient(320, 140, 8, 320, 140, 130);
    hi.addColorStop(0,   "rgba(255, 245, 220, 1.0)");
    hi.addColorStop(0.4, "rgba(255, 230, 190, 0.4)");
    hi.addColorStop(1,   "rgba(255, 230, 190, 0)");
    ctx.fillStyle = hi;
    ctx.fillRect(0, 0, 1024, 512);

    // Cooler back-fill hotspot
    const back = ctx.createRadialGradient(770, 180, 6, 770, 180, 110);
    back.addColorStop(0,   "rgba(180, 210, 255, 0.75)");
    back.addColorStop(1,   "rgba(180, 210, 255, 0)");
    ctx.fillStyle = back;
    ctx.fillRect(0, 0, 1024, 512);

    const tex = new THREE.CanvasTexture(cv);
    tex.mapping    = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    pmrem.compileEquirectangularShader();
    const envMap = pmrem.fromEquirectangular(tex).texture;
    tex.dispose();
    pmrem.dispose();
    return envMap;
  }

  _createDiamond() {
    const geom = this._createBrilliantGeometry(28);
    // Fill the viewport — dominant, monumental
    geom.scale(1.25, 1.4, 1.25);
    geom.computeVertexNormals();

    const mat = new THREE.MeshPhysicalMaterial({
      color:                       0xffffff,
      metalness:                   0,
      roughness:                   0.03,
      transmission:                1.0,
      thickness:                   this._isMobile ? THICKNESS_MOBILE : THICKNESS_DESKTOP,
      ior:                         2.4,
      attenuationDistance:         3.5,
      attenuationColor:            new THREE.Color(0xe8f0ff),
      envMapIntensity:             ENVMAP_INTENSITY,
      iridescence:                 IRIDESCENCE,
      iridescenceIOR:              2.15,
      iridescenceThicknessRange:   IRID_THICKNESS,
      clearcoat:                   0.85,
      clearcoatRoughness:          0.04,
      transparent:                 true,
      side:                        THREE.DoubleSide,
    });

    // Dispersion is r166+; older builds silently ignore it
    if ("dispersion" in mat) mat.dispersion = DISPERSION;

    this.diamond = new THREE.Mesh(geom, mat);
    this.diamond.rotation.x = -0.18;
    this.scene.add(this.diamond);
  }

  // Brilliant-cut geometry — table, crown, girdle, pavilion, culet
  _createBrilliantGeometry(N = 24) {
    const positions = [];
    const indices   = [];
    const halfStep  = Math.PI / N;

    const layers = [
      [ 0.62,  0.00,  0        ], // 0 table center
      [ 0.62,  0.40,  0        ], // 1 table ring
      [ 0.40,  0.70,  halfStep ], // 2 upper crown
      [ 0.08,  1.00,  0        ], // 3 girdle
      [-0.22,  0.88,  halfStep ], // 4 upper pavilion
      [-0.72,  0.42,  0        ], // 5 lower pavilion
      [-1.08,  0.00,  0        ], // 6 culet
    ];

    const ringStarts = [];
    for (const [y, r, a] of layers) {
      ringStarts.push(positions.length / 3);
      if (r === 0) positions.push(0, y, 0);
      else for (let i = 0; i < N; i++) {
        const th = (i / N) * Math.PI * 2 + a;
        positions.push(Math.cos(th) * r, y, Math.sin(th) * r);
      }
    }
    for (let li = 0; li < layers.length - 1; li++) {
      const [, r1] = layers[li];
      const [, r2] = layers[li + 1];
      const s1 = ringStarts[li];
      const s2 = ringStarts[li + 1];
      if (r1 === 0 && r2 > 0) {
        for (let i = 0; i < N; i++) {
          const nxt = (i + 1) % N;
          indices.push(s1, s2 + i, s2 + nxt);
        }
      } else if (r1 > 0 && r2 === 0) {
        for (let i = 0; i < N; i++) {
          const nxt = (i + 1) % N;
          indices.push(s1 + i, s1 + nxt, s2);
        }
      } else {
        for (let i = 0; i < N; i++) {
          const nxt = (i + 1) % N;
          indices.push(s1 + i,   s1 + nxt, s2 + i);
          indices.push(s1 + nxt, s2 + nxt, s2 + i);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    return g;
  }

  _addLights() {
    const key = new THREE.DirectionalLight(KEY_COLOR, 3.0);
    key.position.set(3.5, 4.0, 3.2);
    this.scene.add(key);
    this._lights.push(key);

    const fill = new THREE.DirectionalLight(FILL_COLOR, 0.65);
    fill.position.set(-4, 1, -2);
    this.scene.add(fill);
    this._lights.push(fill);

    const rim = new THREE.DirectionalLight(RIM_COLOR, 0.5);
    rim.position.set(0, -3, -4);
    this.scene.add(rim);
    this._lights.push(rim);

    const amb = new THREE.AmbientLight(0x0e131b, 0.25);
    this.scene.add(amb);
    this._lights.push(amb);
  }

  // ── Scroll wiring ───────────────────────────────────────────────
  _bindScroll() {
    if (this.lenis && typeof this.lenis.on === "function") {
      this.lenis.on("scroll", this._onLenisScroll);
      this._lenisScrollBound = true;
    } else {
      window.addEventListener("scroll", this._onNativeScroll, { passive: true });
    }
  }
  _onLenisScroll({ scroll, limit }) {
    this._scrollT = limit > 0 ? Math.min(scroll / limit, 1) : 0;
  }
  _onNativeScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    this._scrollT = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  }

  // ── Resize ──────────────────────────────────────────────────────
  _bindResize() {
    window.addEventListener("resize", this._onResize);
  }
  _onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    if (this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    if (this.renderer) this.renderer.setSize(w, h);
    // Track mobile status changes (rotation etc.)
    this._isMobile = w < 768 || "ontouchstart" in window;
  }

  // ── Block reveal ────────────────────────────────────────────────
  _observeBlocks() {
    this._observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting || e.target.classList.contains("is-revealed")) return;
        e.target.classList.add("is-revealed");
        if (this._reducedMotion) {
          e.target.classList.add("is-in");   // css-only fade
          return;
        }
        const lines = e.target.querySelectorAll(".holm-philosophy__line-inner");
        gsap.to(lines, {
          yPercent: 0,
          opacity:  1,
          duration: BLOCK_REVEAL_DUR,
          stagger:  BLOCK_REVEAL_STAG,
          ease:     BLOCK_REVEAL_EASE,
        });
      });
    }, {
      threshold: BLOCK_TRIGGER_PCT,
      rootMargin: "0px 0px -8% 0px",
    });
    this.blocks.forEach((b) => this._observer.observe(b));
  }

  // ── Render loop ─────────────────────────────────────────────────
  _startLoop() {
    this._active   = true;
    this._prevTime = performance.now();

    const tick = (now) => {
      if (!this._active) return;
      const dt = Math.min((now - this._prevTime) / 1000, 0.05);
      this._prevTime = now;

      // Idle spin — constant, scroll-independent, never stops
      this._extraSpin += IDLE_SPIN_SPEED * dt;

      // Scroll layered on top — a small extra Y offset + X tilt + camera dolly
      const scrollT = this._scrollT;
      let extraY = 0, tiltX = 0, camZ = CAM_Z_BASE;

      if (!this._reducedMotion) {
        extraY = scrollT * SCROLL_SPIN_MULT;
        tiltX  = -0.18 + Math.sin(scrollT * Math.PI) * SCROLL_TILT_MAX;
        camZ   = CAM_Z_BASE - scrollT * SCROLL_CAM_DOLLY;
      } else {
        tiltX = -0.18;
      }

      this.diamond.rotation.y = this._extraSpin + extraY;
      this.diamond.rotation.x = tiltX;
      this.camera.position.z  = camZ;

      this.renderer.render(this.scene, this.camera);
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }
}
