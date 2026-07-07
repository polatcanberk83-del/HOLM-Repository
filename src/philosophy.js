import * as THREE from "three";
import gsap from "gsap";
import "./philosophy.css";

// ─── Tunables ────────────────────────────────────────────────────────
const IDLE_SPIN_SPEED    = 0.16;       // rad/s — never stops
const POS_LERP           = 0.09;       // per-frame lerp toward beat target (@60fps)
const SCROLL_TILT_MAX    = 0.18;       // rad — X tilt at scroll = 1
const CAM_Z_BASE         = 5.6;

// Diamond material — pushed brighter/gemmier now that text lives beside it
const ENVMAP_INTENSITY   = 1.85;
const KEY_LIGHT_STR      = 4.4;
const FILL_LIGHT_STR     = 0.95;
const RIM_LIGHT_STR      = 0.75;
const DISPERSION_BASE    = 5.2;        // r166+
const DISPERSION_PRESSURE = 3.6;       // added at the "pressure" beat when scale drops
const IRIDESCENCE        = 0.72;
const IRID_THICKNESS     = [220, 780];
const THICKNESS_DESKTOP  = 1.7;
const THICKNESS_MOBILE   = 1.0;

// Cue
const CUE_BOB            = 9;          // px yoyo travel
const CUE_BOB_DUR        = 1.25;       // s

// Beats — each has a diamond target (screen-space nx/ny/scale) and a text side.
// y positive = up, x positive = right, in normalized screen units.
// Anchored to DOM sections; a weighted blend of each section's viewport-center
// distance drives the diamond target so the gem stays aligned with its stanza.
const BEATS = [
  { x:  0.00, y:  0.00, scale: 1.20, side: null,            hasText: false },  // 0 intro
  { x:  0.34, y:  0.03, scale: 1.00, side: "left",          hasText: true  },  // 1 R / text L
  { x: -0.34, y: -0.05, scale: 1.24, side: "right",         hasText: true  },  // 2 L / text R
  { x:  0.00, y:  0.08, scale: 0.62, side: "left",          hasText: true  },  // 3 pressure small center / text L
  { x: -0.30, y:  0.06, scale: 1.18, side: "right",         hasText: true  },  // 4 L / text R
  { x:  0.28, y: -0.04, scale: 1.28, side: "left",          hasText: true  },  // 5 R / text L
  { x:  0.00, y:  0.02, scale: 1.35, side: "center-below",  hasText: true  },  // 6 center-large / text below
];
const WEIGHT_FALLOFF = 1.0;   // viewport heights — how far a beat's anchor influences the blend

const KEY_COLOR    = 0xfff2dc;
const FILL_COLOR   = 0x89b0e4;
const RIM_COLOR    = 0xb8c0ee;

const MANIFESTO = [
  ["Some studios tell stories.",                    "We work toward a single moment."],
  ["The moment a rough idea holds still —",         "and becomes something finished."],
  ["It is rare. It forms under pressure.",          "The way carbon becomes a diamond."],
  ["So that is the shape we keep returning to.",    "Not decoration. A reminder of what we are after."],
  ["Between sketch and masterpiece,",               "there is patience."],
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
    this._glow     = null;             // radial aura sprite

    // DOM
    this.container = null;
    this.canvas    = null;
    this.blocks    = [];               // beat sections carrying stanzas
    this.scrollCue = null;

    // Anim state
    this._rafId       = null;
    this._active      = false;
    this._prevTime    = 0;
    this._scrollT     = 0;
    this._idleSpin    = 0;
    this._cueFaded    = false;
    this._cueTween    = null;

    // Diamond target (world-space) and current smoothed values
    this._targetPos   = new THREE.Vector3();
    this._targetScale = new THREE.Vector3(1, 1, 1);
    this._targetTilt  = 0;
    this._pressure    = 0;             // 0..1 — how compressed the diamond is

    // Handlers
    this._onResize       = this._onResize.bind(this);
    this._onLenisScroll  = this._onLenisScroll.bind(this);
    this._onNativeScroll = this._onNativeScroll.bind(this);
    this._observer       = null;
  }

  // ── Public API ──────────────────────────────────────────────────
  init() {
    this._createDOM();
    this._createThree();
    this._bindScroll();
    this._bindResize();
    this._observeBlocks();
    this._startCue();
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
    if (this._observer)  this._observer.disconnect();
    if (this._cueTween)  this._cueTween.kill();

    if (this.diamond) {
      this.diamond.geometry.dispose();
      this.diamond.material.dispose();
    }
    if (this._glow) {
      this._glow.geometry.dispose();
      this._glow.material.dispose();
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
    this.diamond  = this.envMap = this._glow = null;
    this.container = this.canvas = null;
  }

  // ── DOM ─────────────────────────────────────────────────────────
  _createDOM() {
    const container = document.createElement("div");
    container.className = "holm-philosophy";
    if (this._reducedMotion) container.classList.add("is-reduced-motion");

    // Text-bearing beats get MANIFESTO stanzas in order
    let textCounter = 0;
    const beatsHtml = BEATS
      .map((beat, scrollIdx) => {
        if (!beat.hasText) return "";
        const stanza  = MANIFESTO[textCounter];
        const isFinal = textCounter === MANIFESTO.length - 1;
        textCounter++;
        return `
          <section class="holm-philosophy__beat"
                   data-beat="${scrollIdx}"
                   data-side="${beat.side}"
                   data-final="${isFinal}">
            <div class="holm-philosophy__stanza">
              ${stanza.map(line => `
                <div class="holm-philosophy__line">
                  <span class="holm-philosophy__line-inner">${line}</span>
                </div>
              `).join("")}
            </div>
          </section>
        `;
      }).join("");

    container.innerHTML = `
      <div class="holm-philosophy__hero-title" aria-hidden="true">philosophy</div>
      <canvas class="holm-philosophy__canvas" aria-hidden="true"></canvas>
      <div class="holm-philosophy__vignette" aria-hidden="true"></div>

      <section class="holm-philosophy__intro" data-beat="0" aria-hidden="true">
        <div class="holm-philosophy__cue">
          <span class="holm-philosophy__cue-word">scroll to discover</span>
          <span class="holm-philosophy__cue-line"></span>
        </div>
      </section>

      <main class="holm-philosophy__beats">
        ${beatsHtml}
      </main>

      <div class="holm-philosophy__end">
        <a class="holm-philosophy__contact" href="/contact/">Contact</a>
      </div>
    `;
    document.body.appendChild(container);

    this.container = container;
    this.canvas    = container.querySelector(".holm-philosophy__canvas");
    this.blocks    = [...container.querySelectorAll(".holm-philosophy__beat")];
    this.scrollCue = container.querySelector(".holm-philosophy__cue");

    // Beat DOM anchors — one element per BEATS entry (intro + each text beat).
    // Weighted-blend uses each element's viewport-center distance.
    this._beatEls = [];
    container.querySelectorAll("[data-beat]").forEach((el) => {
      const idx = parseInt(el.dataset.beat, 10);
      if (Number.isFinite(idx) && BEATS[idx]) {
        this._beatEls.push({ el, beat: BEATS[idx] });
      }
    });

    if (!this._reducedMotion) {
      const allLines = container.querySelectorAll(".holm-philosophy__line-inner");
      gsap.set(allLines, { yPercent: 108, opacity: 0 });
    }
  }

  // ── Three.js ────────────────────────────────────────────────────
  _createThree() {
    this.renderer = new THREE.WebGLRenderer({
      canvas:           this.canvas,
      antialias:        true,
      alpha:            true,           // transparent so the hero title reads through
      powerPreference:  "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this._isMobile ? 1.5 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace    = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    // No scene.background — canvas stays transparent so the hero title shows through

    this.camera = new THREE.PerspectiveCamera(
      36, window.innerWidth / window.innerHeight, 0.1, 100,
    );
    this.camera.position.set(0, 0, CAM_Z_BASE);
    this.camera.lookAt(0, 0, 0);

    // Env
    this.envMap = this._buildProceduralEnv();
    this.scene.environment          = this.envMap;
    this.scene.environmentIntensity = ENVMAP_INTENSITY;

    // Soft radial glow sprite that follows the gem — grounds it in space
    this._createGlow();

    // Diamond
    this._createDiamond();

    // Lights
    this._addLights();
  }

  _buildProceduralEnv() {
    const cv  = document.createElement("canvas");
    cv.width  = 1024;
    cv.height = 512;
    const ctx = cv.getContext("2d");

    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0.00, "#faf5e8");
    g.addColorStop(0.20, "#a4bcdc");
    g.addColorStop(0.45, "#3f5074");
    g.addColorStop(0.55, "#1c2340");
    g.addColorStop(0.80, "#0b1220");
    g.addColorStop(1.00, "#000000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 512);

    const horiz = ctx.createLinearGradient(0, 200, 0, 320);
    horiz.addColorStop(0,   "rgba(0,0,0,0)");
    horiz.addColorStop(0.5, "rgba(255, 178, 96, 0.34)");
    horiz.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = horiz;
    ctx.fillRect(0, 200, 1024, 120);

    const hi = ctx.createRadialGradient(300, 130, 8, 300, 130, 150);
    hi.addColorStop(0,   "rgba(255, 250, 232, 1.0)");
    hi.addColorStop(0.35, "rgba(255, 235, 200, 0.55)");
    hi.addColorStop(1,   "rgba(255, 235, 200, 0)");
    ctx.fillStyle = hi;
    ctx.fillRect(0, 0, 1024, 512);

    const back = ctx.createRadialGradient(760, 170, 6, 760, 170, 130);
    back.addColorStop(0, "rgba(190, 220, 255, 0.85)");
    back.addColorStop(1, "rgba(190, 220, 255, 0)");
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

  _createGlow() {
    // Additive-blend sprite that hovers behind the gem — soft aura
    const cv  = document.createElement("canvas");
    cv.width  = cv.height = 512;
    const ctx = cv.getContext("2d");
    const grd = ctx.createRadialGradient(256, 256, 8, 256, 256, 240);
    grd.addColorStop(0,   "rgba(255, 240, 220, 0.55)");
    grd.addColorStop(0.4, "rgba(140, 180, 255, 0.12)");
    grd.addColorStop(1,   "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 512, 512);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({
      map:         tex,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      depthTest:   false,
      opacity:     0.85,
    });
    this._glow = new THREE.Sprite(mat);
    this._glow.scale.set(6, 6, 1);
    this._glow.position.z = -0.6;
    this.scene.add(this._glow);
  }

  _createDiamond() {
    const geom = this._createBrilliantGeometry(28);
    geom.scale(1.25, 1.4, 1.25);
    geom.computeVertexNormals();

    const mat = new THREE.MeshPhysicalMaterial({
      color:                     0xffffff,
      metalness:                 0,
      roughness:                 0.02,
      transmission:              1.0,
      thickness:                 this._isMobile ? THICKNESS_MOBILE : THICKNESS_DESKTOP,
      ior:                       2.4,
      attenuationDistance:       4.0,
      attenuationColor:          new THREE.Color(0xe8f0ff),
      envMapIntensity:           ENVMAP_INTENSITY,
      iridescence:               IRIDESCENCE,
      iridescenceIOR:            2.15,
      iridescenceThicknessRange: IRID_THICKNESS,
      clearcoat:                 0.9,
      clearcoatRoughness:        0.03,
      transparent:               true,
      side:                      THREE.DoubleSide,
    });
    if ("dispersion" in mat) mat.dispersion = DISPERSION_BASE;

    this.diamond = new THREE.Mesh(geom, mat);
    this.diamond.rotation.x = -0.18;
    this.scene.add(this.diamond);
  }

  _createBrilliantGeometry(N = 24) {
    const positions = [];
    const indices   = [];
    const halfStep  = Math.PI / N;

    const layers = [
      [ 0.62,  0.00,  0        ],
      [ 0.62,  0.40,  0        ],
      [ 0.40,  0.70,  halfStep ],
      [ 0.08,  1.00,  0        ],
      [-0.22,  0.88,  halfStep ],
      [-0.72,  0.42,  0        ],
      [-1.08,  0.00,  0        ],
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
    const key = new THREE.DirectionalLight(KEY_COLOR, KEY_LIGHT_STR);
    key.position.set(3.5, 4.0, 3.2);
    this.scene.add(key);
    this._lights.push(key);

    const fill = new THREE.DirectionalLight(FILL_COLOR, FILL_LIGHT_STR);
    fill.position.set(-4, 1, -2);
    this.scene.add(fill);
    this._lights.push(fill);

    const rim = new THREE.DirectionalLight(RIM_COLOR, RIM_LIGHT_STR);
    rim.position.set(0, -3, -4);
    this.scene.add(rim);
    this._lights.push(rim);

    const amb = new THREE.AmbientLight(0x121826, 0.35);
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
    this._maybeFadeCue();
  }
  _onNativeScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    this._scrollT = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    this._maybeFadeCue();
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
    this._isMobile = w < 768 || "ontouchstart" in window;
  }

  // ── Cue ─────────────────────────────────────────────────────────
  _startCue() {
    if (this._reducedMotion || !this.scrollCue) return;
    this._cueTween = gsap.to(this.scrollCue, {
      y:        CUE_BOB,
      duration: CUE_BOB_DUR,
      ease:     "sine.inOut",
      yoyo:     true,
      repeat:   -1,
    });
  }
  _maybeFadeCue() {
    if (this._cueFaded || !this.scrollCue) return;
    if (this._scrollT > 0.004) {
      this._cueFaded = true;
      this._cueTween?.kill();
      gsap.to(this.scrollCue, {
        opacity:  0,
        y:        -6,
        duration: 0.6,
        ease:     "power2.out",
        onComplete: () => this.scrollCue.style.pointerEvents = "none",
      });
    }
  }

  // ── Beat reveal ─────────────────────────────────────────────────
  _observeBlocks() {
    this._observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting || e.target.classList.contains("is-revealed")) return;
        e.target.classList.add("is-revealed");
        if (this._reducedMotion) {
          e.target.classList.add("is-in");
          return;
        }
        const lines = e.target.querySelectorAll(".holm-philosophy__line-inner");
        gsap.to(lines, {
          yPercent: 0,
          opacity:  1,
          duration: 1.15,
          stagger:  0.14,
          ease:     "power3.out",
        });
      });
    }, { threshold: 0.35, rootMargin: "0px 0px -8% 0px" });
    this.blocks.forEach((b) => this._observer.observe(b));
  }

  // ── Beat interpolation — weighted blend over DOM anchors ───────
  // Each beat's DOM section contributes to the diamond target based on how
  // close its center is to the viewport center. This keeps the gem aligned
  // with whichever stanza is currently on screen, and blends smoothly during
  // transitions — no keyframe midpoint mismatch.
  _computeBeatTarget() {
    if (!this._beatEls || this._beatEls.length === 0) {
      return { x: 0, y: 0, scale: 1.0 };
    }
    const vh        = window.innerHeight;
    const vpCenter  = vh / 2;
    const maxDist   = vh * WEIGHT_FALLOFF;

    let totalW = 0;
    let wx = 0, wy = 0, ws = 0;

    for (const { el, beat } of this._beatEls) {
      const rect  = el.getBoundingClientRect();
      const cy    = rect.top + rect.height / 2;
      const dist  = Math.abs(cy - vpCenter);
      const raw   = Math.max(0, 1 - dist / maxDist);
      const w     = raw * raw * (3 - 2 * raw);  // smoothstep

      totalW += w;
      wx += beat.x     * w;
      wy += beat.y     * w;
      ws += beat.scale * w;
    }

    if (totalW < 0.001) {
      // No beat within falloff — snap to the nearest by center distance
      let bestIdx = 0, bestDist = Infinity;
      this._beatEls.forEach(({ el }, i) => {
        const rect = el.getBoundingClientRect();
        const cy   = rect.top + rect.height / 2;
        const d    = Math.abs(cy - vpCenter);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      });
      const b = this._beatEls[bestIdx].beat;
      return { x: b.x, y: b.y, scale: b.scale };
    }
    return { x: wx / totalW, y: wy / totalW, scale: ws / totalW };
  }

  // ── Render loop ─────────────────────────────────────────────────
  _startLoop() {
    this._active   = true;
    this._prevTime = performance.now();

    const tick = (now) => {
      if (!this._active) return;
      const dtRaw = (now - this._prevTime) / 1000;
      const dt    = Math.min(dtRaw, 0.05);
      this._prevTime = now;

      // Idle spin — never stops
      this._idleSpin += IDLE_SPIN_SPEED * dt;

      // Beat target — weighted blend of DOM-anchored beat sections
      const target = this._reducedMotion
        ? { x: 0, y: 0, scale: 1.2 }
        : this._computeBeatTarget();

      // World-space transform
      const halfFov = (this.camera.fov * Math.PI) / 360;
      const depth   = CAM_Z_BASE;
      const halfH   = Math.tan(halfFov) * depth;
      const halfW   = halfH * this.camera.aspect;

      // On very narrow screens, collapse horizontal offset — text goes above/below
      const narrow  = this._isMobile;
      const wx      = narrow ? target.x * 0.2 : target.x;
      const wy      = target.y;

      this._targetPos.set(wx * halfW, wy * halfH, 0);

      // Frame-rate-independent lerp
      const k = 1 - Math.pow(1 - POS_LERP, dt * 60);
      this.diamond.position.lerp(this._targetPos, k);

      const curS = this.diamond.scale.x + (target.scale - this.diamond.scale.x) * k;
      this.diamond.scale.setScalar(curS);

      // Glow follows, slightly behind, scaled with the gem
      if (this._glow) {
        this._glow.position.x = this.diamond.position.x;
        this._glow.position.y = this.diamond.position.y;
        this._glow.position.z = -0.6;
        const gs = curS * 4.4;
        this._glow.scale.set(gs, gs, 1);
      }

      // Rotation — idle spin + slight tilt driven by scroll
      const tilt = this._reducedMotion
        ? -0.18
        : -0.18 + Math.sin(this._scrollT * Math.PI) * SCROLL_TILT_MAX;

      this.diamond.rotation.y = this._idleSpin;
      this.diamond.rotation.x = tilt;

      // Pressure beat — dispersion bumps as the gem compresses
      if ("dispersion" in this.diamond.material) {
        const pressure = Math.max(0, 1 - curS / 1.0);        // 0 at scale≥1, →1 as it shrinks
        this._pressure += (pressure - this._pressure) * k;
        this.diamond.material.dispersion = DISPERSION_BASE +
          this._pressure * DISPERSION_PRESSURE;
      }

      this.renderer.render(this.scene, this.camera);
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }
}
