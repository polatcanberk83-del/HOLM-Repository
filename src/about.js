import * as THREE from "three";
import gsap from "gsap";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer }  from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass }      from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass }      from "three/examples/jsm/postprocessing/OutputPass.js";
import "./about.css";

// ─── Tunables ────────────────────────────────────────────────────────
const CAM_LERP        = 0.09;   // per-frame lerp toward beat target (@60fps)
const IDLE_DRIFT_AMP  = 0.04;   // camera micro-drift so the still scene feels alive
const IDLE_DRIFT_HZ   = 0.11;

// ─── Content — the 5 fasets ─────────────────────────────────────────
// Each beat: which object is the "hero" (framed by the camera), which side
// the text sits, a small eyebrow label, and 1-3 lines of body. First line
// of each stanza is styled as a headline (`--head`).
const BEATS = [
  {
    id: "founder",
    side: "below",
    eyebrow: "The Founder",
    portrait: true,
    lines: [
      { head: true, text: "Canberk Polat." },
      { text: "I make websites for founders — the kind that hold, that stay open in three tabs a week later." },
      { text: "HOLM opened in 2025 to do this work with full attention." },
    ],
    // Camera framing target for the establishing shot — wide, high, centered
    cam: { pos: [0.0, 3.6, 5.6], look: [0.0, 0.35, -0.2] },
  },
  {
    id: "services",
    side: "right",
    eyebrow: "What I make",
    lines: [
      { head: true, text: "One thing. Websites." },
      { text: "Not templates, not themes. Every line written, every pixel placed." },
      { text: "The kind of site that becomes the reason someone remembers you." },
    ],
    // Zoom to sketchpad (left of desk)
    cam: { pos: [-1.6, 1.5, 2.2], look: [-2.15, 0.14, 0.35] },
  },
  {
    id: "process",
    side: "left",
    eyebrow: "How I work",
    lines: [
      { head: true, text: "Sketch. Wireframe. Build." },
      { text: "Every project starts with a call. Then a page of notes. No hand-offs, no committees." },
      { text: "Two to four weeks. I hold to that." },
    ],
    // Zoom to diamond (center of desk)
    cam: { pos: [-0.15, 1.15, 1.9], look: [-0.35, 0.5, -0.35] },
  },
  {
    id: "fit",
    side: "left",
    eyebrow: "Who I work with",
    lines: [
      { head: true, text: "For founders who care what their site says." },
      { text: "If you need a landing page in a hurry, I'm probably not the right fit." },
      { text: "If you need a site that stops the scroll — talk to me." },
    ],
    // Zoom to closed notebook (right of desk)
    cam: { pos: [1.9, 1.35, 2.15], look: [1.5, 0.14, 0.5] },
  },
  {
    id: "cta",
    side: "below",
    eyebrow: "Say hello",
    lines: [
      { head: true, text: "Ready to make something worth holding still." },
    ],
    // Framing pulled back a touch so the CTA has room under the text
    cam: { pos: [0.4, 2.5, 4.6], look: [0.4, 0.25, -0.2] },
    ctaLabel: "Say hello",
    ctaHref:  "/contact/",
  },
];
const WEIGHT_FALLOFF = 1.0;  // viewport heights — how far a beat's anchor influences the blend

// ─── Small brilliant-cut generator (independent of Philosophy) ──────
function createBrilliantGeometry(N = 20) {
  const positions = [];
  const indices   = [];
  const halfStep  = Math.PI / N;
  const layers = [
    [ 0.60,  0.00,  0        ],
    [ 0.60,  0.36,  0        ],
    [ 0.40,  0.66,  halfStep ],
    [ 0.08,  0.94,  0        ],
    [-0.22,  0.82,  halfStep ],
    [-0.72,  0.42,  0        ],
    [-1.06,  0.00,  0        ],
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
  g.computeVertexNormals();
  return g;
}

// ─── Split a line into per-word masks + per-char spans (from Philosophy) ─
function splitLineToChars(text) {
  return text.split(" ").map((word) => {
    if (!word) return "";
    const chars = Array.from(word).map((ch) => {
      const safe = ch
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<span class="holm-about__char">${safe}</span>`;
    }).join("");
    return `<span class="holm-about__word">${chars}</span>`;
  }).join(" ");
}

// ─── About page controller ──────────────────────────────────────────
export class About {
  constructor({ lenis } = {}) {
    this.lenis          = lenis || null;
    this._reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this._isMobile      = window.innerWidth < 768 || "ontouchstart" in window;

    // Three.js
    this.renderer  = null;
    this.scene     = null;
    this.camera    = null;
    this.envMap    = null;
    this._composer = null;
    this._lights   = [];
    this._props    = {};       // sketchpad, diamond, notebook, letter, pencil

    // DOM
    this.container = null;
    this.canvas    = null;
    this.blocks    = [];

    // Scroll / animation state
    this._rafId       = null;
    this._active      = false;
    this._prevTime    = 0;
    this._elapsed     = 0;
    this._scrollT     = 0;

    // Camera target — blended per frame
    this._targetPos   = new THREE.Vector3();
    this._targetLook  = new THREE.Vector3();
    this._lookNow     = new THREE.Vector3();

    // CTA magnetic
    this._ctaEl     = null;
    this._ctaMove   = null;
    this._ctaLeave  = null;
    this._ctaSetX   = null;
    this._ctaSetY   = null;

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
    this._buildScene();
    this._bindScroll();
    this._bindResize();
    this._observeBlocks();
    this._bindCtaMagnetic();
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
    if (this._ctaMove)  window.removeEventListener("mousemove", this._ctaMove);
    if (this._ctaLeave) window.removeEventListener("mouseleave", this._ctaLeave);

    // Dispose scene geometries/materials
    this.scene?.traverse((o) => {
      o.geometry?.dispose?.();
      const m = o.material;
      if (Array.isArray(m)) m.forEach(mm => mm.dispose?.());
      else m?.dispose?.();
    });
    for (const l of this._lights) this.scene?.remove(l);
    this.envMap?.dispose?.();

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
    container.className = "holm-about";
    if (this._reducedMotion) container.classList.add("is-reduced-motion");

    const beatsHtml = BEATS.map((beat, i) => {
      const linesHtml = beat.lines.map((ln) => {
        const cls = ln.head
          ? "holm-about__line holm-about__line--head"
          : "holm-about__line";
        return `<div class="${cls}">${splitLineToChars(ln.text)}</div>`;
      }).join("");

      // Portrait slot only on the founder beat
      const portraitHtml = beat.portrait
        ? `<div class="holm-about__portrait" aria-hidden="true">
             <img src="/portrait.jpg"
                  alt=""
                  onerror="this.style.display='none'" />
           </div>`
        : "";

      const ctaHtml = beat.ctaLabel
        ? `<a class="holm-about__cta"
              href="${beat.ctaHref}"
              aria-label="${beat.ctaLabel}"
              data-hover-roll>${beat.ctaLabel}</a>`
        : "";

      return `
        <section class="holm-about__beat"
                 data-beat="${i}"
                 data-side="${beat.side}"
                 data-final="${!!beat.ctaLabel}">
          <div class="holm-about__stanza">
            ${portraitHtml}
            <span class="holm-about__eyebrow">${beat.eyebrow}</span>
            ${linesHtml}
            ${ctaHtml}
          </div>
        </section>
      `;
    }).join("");

    container.innerHTML = `
      <canvas class="holm-about__canvas" aria-hidden="true"></canvas>
      <div class="holm-about__vignette" aria-hidden="true"></div>

      <section class="holm-about__intro" aria-hidden="true"></section>

      <main id="about-content"
            class="holm-about__beats"
            tabindex="-1"
            aria-label="HOLM about — five-part introduction">
        ${beatsHtml}
      </main>
    `;
    document.body.appendChild(container);

    this.container = container;
    this.canvas    = container.querySelector(".holm-about__canvas");
    this.blocks    = [...container.querySelectorAll(".holm-about__beat")];

    // Track DOM anchors → beat indices for weighted blend
    this._beatEls = this.blocks.map((el) => ({
      el,
      beat: BEATS[parseInt(el.dataset.beat, 10)],
    }));

    if (!this._reducedMotion) {
      const allChars = container.querySelectorAll(".holm-about__char");
      gsap.set(allChars, { yPercent: 115, opacity: 0 });
    }
  }

  // ── Three.js ────────────────────────────────────────────────────
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
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace    = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled   = !this._isMobile;
    this.renderer.shadowMap.type      = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0806);
    this.scene.fog = new THREE.FogExp2(0x0a0806, 0.14);

    this.camera = new THREE.PerspectiveCamera(
      38, window.innerWidth / window.innerHeight, 0.1, 40,
    );
    this.camera.position.set(0, 3.6, 5.6);
    this.camera.lookAt(0, 0.35, -0.2);

    // Env for subtle reflections on the diamond
    const pmrem  = new THREE.PMREMGenerator(this.renderer);
    const room   = new RoomEnvironment();
    this.envMap  = pmrem.fromScene(room, 0.04).texture;
    pmrem.dispose();
    this.scene.environment          = this.envMap;
    this.scene.environmentIntensity = 0.35;

    this._composer = new EffectComposer(this.renderer);
    this._composer.setPixelRatio(this.renderer.getPixelRatio());
    this._composer.setSize(window.innerWidth, window.innerHeight);
    this._composer.addPass(new RenderPass(this.scene, this.camera));
    this._composer.addPass(new OutputPass());
  }

  // ── Workbench scene — desk + 4 props + warm spotlight ────────────
  _buildScene() {
    // ── Desk ──────────────────────────────────────────────────────
    // A large plane with a subtle grain — dark walnut. Slight y-tilt
    // is avoided so all props sit on y=0 with clean geometry.
    const deskMat = new THREE.MeshStandardMaterial({
      color:     0x2a1f16,
      roughness: 0.82,
      metalness: 0.05,
    });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(8, 0.12, 4.8), deskMat);
    desk.position.set(0, -0.06, 0);
    desk.receiveShadow = !this._isMobile;
    this.scene.add(desk);

    // Ground behind/below — very dark, absorbs any missed light
    const groundMat = new THREE.MeshStandardMaterial({
      color:     0x050303,
      roughness: 1.0,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.4;
    this.scene.add(ground);

    // Wall behind the desk — soft warm gradient painted via vertex colours
    const wallGeo = new THREE.PlaneGeometry(24, 12, 1, 1);
    const wallMat = new THREE.MeshStandardMaterial({
      color:     0x120a06,
      roughness: 1.0,
      metalness: 0.0,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 3, -4.2);
    this.scene.add(wall);

    // ── Prop 1: Sketchpad + pencil (left of desk) ────────────────
    const paperMat = new THREE.MeshStandardMaterial({
      color:     0xe8d9be,
      roughness: 0.95,
      metalness: 0.0,
    });
    const padBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 1.0), paperMat);
    padBase.position.set(-2.15, 0.03, 0.35);
    padBase.rotation.y = 0.14;
    padBase.castShadow = !this._isMobile;
    this.scene.add(padBase);

    // Thin darker page underneath so pad has depth
    const padSpine = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.02, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.9 }),
    );
    padSpine.position.set(-2.15, 0.02, -0.14);
    padSpine.rotation.y = 0.14;
    this.scene.add(padSpine);

    // A tiny sketch line — thin ink stroke on the pad, a subtle brand cue
    const inkMat = new THREE.MeshStandardMaterial({
      color: 0x120906, roughness: 0.6, metalness: 0.0,
    });
    const ink = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.003, 0.02),
      inkMat,
    );
    ink.position.set(-2.05, 0.058, 0.35);
    ink.rotation.y = 0.14 + 0.2;
    this.scene.add(ink);

    // Pencil — cylinder + tip
    const pencilMat = new THREE.MeshStandardMaterial({
      color: 0xb08040, roughness: 0.75, metalness: 0.05,
    });
    const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), pencilMat);
    pencil.rotation.z = Math.PI / 2;
    pencil.rotation.y = -0.55;
    pencil.position.set(-1.7, 0.06, 0.85);
    pencil.castShadow = !this._isMobile;
    this.scene.add(pencil);

    const pencilTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.03, 0.08, 8),
      new THREE.MeshStandardMaterial({ color: 0x1a1512, roughness: 0.6 }),
    );
    pencilTip.rotation.z = Math.PI / 2;
    pencilTip.rotation.y = -0.55;
    pencilTip.position.set(-1.3, 0.06, 1.075);
    this.scene.add(pencilTip);

    this._props.sketchpad = padBase;
    this._props.pencil    = pencil;

    // ── Prop 2: Diamond on a small stand (center-left of desk) ────
    const standMat = new THREE.MeshStandardMaterial({
      color:     0x1a1310,
      roughness: 0.35,
      metalness: 0.75,
    });
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 0.10, 24),
      standMat,
    );
    stand.position.set(-0.35, 0.05, -0.35);
    stand.castShadow = !this._isMobile;
    this.scene.add(stand);

    // Diamond material — physically-inspired but cheap: high metalness +
    // low roughness catches the spotlight highlight without a transmission
    // pass. Reads as polished glass under the warm cone.
    const diamondGeom = createBrilliantGeometry(this._isMobile ? 14 : 20);
    diamondGeom.scale(0.35, 0.32, 0.35);
    const diamondMat = new THREE.MeshPhysicalMaterial({
      color:              0xffffff,
      roughness:          0.05,
      metalness:          0.0,
      transmission:       this._isMobile ? 0.0 : 0.7,
      thickness:          0.6,
      ior:                1.9,
      envMapIntensity:    1.8,
      clearcoat:          this._isMobile ? 0.0 : 0.8,
      clearcoatRoughness: 0.05,
      transparent:        true,
      side:               THREE.FrontSide,
    });
    const diamond = new THREE.Mesh(diamondGeom, diamondMat);
    diamond.position.set(-0.35, 0.45, -0.35);
    diamond.castShadow = !this._isMobile;
    this.scene.add(diamond);
    this._props.diamond = diamond;

    // ── Prop 3: Closed notebook (right-center of desk) ────────────
    const leatherMat = new THREE.MeshStandardMaterial({
      color:     0x1a0d06,
      roughness: 0.55,
      metalness: 0.10,
    });
    const notebook = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 1.5), leatherMat);
    notebook.position.set(1.5, 0.08, 0.5);
    notebook.rotation.y = -0.12;
    notebook.castShadow = !this._isMobile;
    this.scene.add(notebook);

    // A subtle debossed rectangle on the cover — reads as a bookmark strap
    const strap = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.005, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x2a1610, roughness: 0.5 }),
    );
    strap.position.set(1.5 + 0.35, 0.152, 0.5);
    strap.rotation.y = -0.12;
    this.scene.add(strap);
    this._props.notebook = notebook;

    // ── Prop 4: Folded letter (front-right) ──────────────────────
    // Emulate a slight fold by using two thin planes at a shallow angle.
    const letterMat = new THREE.MeshStandardMaterial({
      color:     0xe4d1b0,
      roughness: 0.9,
      metalness: 0.0,
      side:      THREE.DoubleSide,
    });
    const letterGroup = new THREE.Group();
    const letterA = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), letterMat);
    letterA.rotation.x = -Math.PI / 2 + 0.06;
    letterA.position.set(0, 0.005, -0.12);
    letterGroup.add(letterA);
    const letterB = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), letterMat);
    letterB.rotation.x = -Math.PI / 2 - 0.06;
    letterB.position.set(0, 0.02, 0.32);
    letterGroup.add(letterB);
    letterGroup.position.set(2.6, 0.02, -0.1);
    letterGroup.rotation.y = -0.24;
    this.scene.add(letterGroup);
    this._props.letter = letterGroup;

    // ── Lights ────────────────────────────────────────────────────
    // Single warm spotlight from above — Vermeer cone lighting the desk
    const spot = new THREE.SpotLight(0xffd8a0, 8.5, 12, 0.62, 0.55, 1.4);
    spot.position.set(0.5, 4.5, 1.4);
    spot.target.position.set(0.2, 0, 0.1);
    spot.castShadow = !this._isMobile;
    if (spot.castShadow) {
      spot.shadow.mapSize.set(1024, 1024);
      spot.shadow.bias  = -0.0008;
      spot.shadow.radius = 4;
    }
    this.scene.add(spot);
    this.scene.add(spot.target);
    this._lights.push(spot);

    // A tiny cool fill from the wall behind — hints at a laptop screen or
    // window off-frame. Very dim so it doesn't fight the warm key.
    const fill = new THREE.PointLight(0x506585, 3.2, 6, 2);
    fill.position.set(2.8, 1.6, -2.5);
    this.scene.add(fill);
    this._lights.push(fill);

    // Bounce / ambient — very small so shadows stay rich
    const amb = new THREE.AmbientLight(0x2a1a10, 0.28);
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
    if (this.renderer)  this.renderer.setSize(w, h);
    if (this._composer) this._composer.setSize(w, h);
    this._isMobile = w < 768 || "ontouchstart" in window;
  }

  // ── Beat reveal — chars ride up from below word-mask ────────────
  _observeBlocks() {
    this._observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting || e.target.classList.contains("is-revealed")) return;
        e.target.classList.add("is-revealed");
        const isFinal = e.target.dataset.final === "true";
        const cta     = isFinal ? e.target.querySelector(".holm-about__cta") : null;
        const portrait = e.target.querySelector(".holm-about__portrait");
        const eyebrow  = e.target.querySelector(".holm-about__eyebrow");

        if (this._reducedMotion) {
          e.target.classList.add("is-in");
          if (cta) gsap.set(cta, { opacity: 1 });
          return;
        }
        const chars = e.target.querySelectorAll(".holm-about__char");
        gsap.to(chars, {
          yPercent: 0, opacity: 1,
          duration: 0.85,
          stagger:  0.018,
          ease:     "power3.out",
        });
        if (eyebrow) {
          gsap.fromTo(eyebrow,
            { opacity: 0, y: -8 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
          );
        }
        if (portrait) {
          gsap.fromTo(portrait,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" },
          );
        }
        if (cta) {
          const ctaDelay = chars.length * 0.018 + 0.15;
          gsap.fromTo(cta,
            { opacity: 0, scale: 0.85 },
            { opacity: 1, scale: 1, duration: 0.9, delay: ctaDelay, ease: "power3.out" },
          );
        }
      });
    }, { threshold: 0.3, rootMargin: "0px 0px -6% 0px" });
    this.blocks.forEach((b) => this._observer.observe(b));
  }

  // ── CTA magnetic hover (same pattern as philosophy) ─────────────
  _bindCtaMagnetic() {
    if (this._reducedMotion) return;
    const cta = this.container.querySelector(".holm-about__cta");
    if (!cta) return;

    this._ctaEl = cta;
    gsap.set(cta, { opacity: 0, x: 0, y: 0 });

    this._ctaSetX = gsap.quickTo(cta, "x", { duration: 0.55, ease: "power3" });
    this._ctaSetY = gsap.quickTo(cta, "y", { duration: 0.55, ease: "power3" });

    this._ctaMove = (e) => {
      const rect = cta.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = e.clientX - cx;
      const dy   = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const R    = rect.width * 1.35;
      if (dist > R) {
        this._ctaSetX(0);
        this._ctaSetY(0);
        cta.classList.remove("is-magnetic");
        return;
      }
      const pull = (1 - dist / R) * 0.4;
      this._ctaSetX(dx * pull);
      this._ctaSetY(dy * pull);
      cta.classList.add("is-magnetic");
    };
    this._ctaLeave = () => {
      this._ctaSetX(0);
      this._ctaSetY(0);
      cta.classList.remove("is-magnetic");
    };
    window.addEventListener("mousemove",  this._ctaMove,  { passive: true });
    window.addEventListener("mouseleave", this._ctaLeave);
  }

  // ── Beat blend — weighted average of DOM-anchored beat targets ─
  // Each beat contributes to the camera pose based on how close its DOM
  // section's centre is to the viewport centre. Smooth transitions with
  // no keyframe midpoint mismatch.
  _computeCameraTarget(outPos, outLook) {
    if (!this._beatEls.length) {
      outPos.set(0, 3.6, 5.6);
      outLook.set(0, 0.35, -0.2);
      return;
    }
    const vh       = window.innerHeight;
    const vpCenter = vh / 2;
    const maxDist  = vh * WEIGHT_FALLOFF;

    let totalW = 0;
    let px = 0, py = 0, pz = 0;
    let lx = 0, ly = 0, lz = 0;

    for (const { el, beat } of this._beatEls) {
      const rect = el.getBoundingClientRect();
      const cy   = rect.top + rect.height / 2;
      const dist = Math.abs(cy - vpCenter);
      const raw  = Math.max(0, 1 - dist / maxDist);
      const w    = raw * raw * (3 - 2 * raw);   // smoothstep

      totalW += w;
      px += beat.cam.pos[0]  * w;
      py += beat.cam.pos[1]  * w;
      pz += beat.cam.pos[2]  * w;
      lx += beat.cam.look[0] * w;
      ly += beat.cam.look[1] * w;
      lz += beat.cam.look[2] * w;
    }

    if (totalW < 0.001) {
      // No beat is close — snap to nearest by centre distance
      let bestIdx = 0, bestDist = Infinity;
      this._beatEls.forEach(({ el }, i) => {
        const rect = el.getBoundingClientRect();
        const cy   = rect.top + rect.height / 2;
        const d    = Math.abs(cy - vpCenter);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      });
      const b = this._beatEls[bestIdx].beat;
      outPos.set (b.cam.pos[0],  b.cam.pos[1],  b.cam.pos[2]);
      outLook.set(b.cam.look[0], b.cam.look[1], b.cam.look[2]);
      return;
    }
    outPos.set (px / totalW, py / totalW, pz / totalW);
    outLook.set(lx / totalW, ly / totalW, lz / totalW);
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
      this._elapsed += dt;

      // Camera target — weighted blend across DOM-anchored beats
      this._computeCameraTarget(this._targetPos, this._targetLook);

      // Idle micro-drift — tiny lateral sway so the still scene breathes
      if (!this._reducedMotion) {
        const drift = Math.sin(this._elapsed * IDLE_DRIFT_HZ * Math.PI * 2) * IDLE_DRIFT_AMP;
        this._targetPos.x += drift;
      }

      // Frame-rate-independent lerp toward target pose
      const k = 1 - Math.pow(1 - CAM_LERP, dt * 60);
      this.camera.position.lerp(this._targetPos, k);
      this._lookNow.lerp(this._targetLook, k);
      this.camera.lookAt(this._lookNow);

      // Diamond — slow idle spin so the highlight travels around its facets
      if (this._props.diamond && !this._reducedMotion) {
        this._props.diamond.rotation.y += dt * 0.28;
      }

      this._composer.render();
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }
}
