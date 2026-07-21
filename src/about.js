import * as THREE from "three";
import gsap from "gsap";
import { GLTFLoader }       from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader }      from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment }  from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer }   from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass }       from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass }       from "three/examples/jsm/postprocessing/OutputPass.js";
import { createUnderwaterSystem } from "./three/underwater.js";
import matcapUrl            from "./assets/matcap.png?url";
import logoUrl              from "./assets/holm new logo.svg?url";
import "./about.css";

// ── Scene tuning ─────────────────────────────────────────────────────
const SPIN_SPEED  = 0.28;      // baseline X-axis spin (rad/s)
const MOUSE_SPIN_INFLUENCE = 1.1;   // mouse-X (-1..+1) adds this × dt to spin rate; big enough to reverse
const MOUSE_LERP  = 0.06;      // damping for the mouse follower
const BG_TOP      = "#030863";
const BG_BOT      = "#070D23";
const GLASS_COLOR = 0xffffff;

// Locked-in pose for desktop.
const BASE_Y_TILT     = 1.124;   // ~64.4°  perspective yaw
const BASE_Z_TILT     = 0.726;   // ~41.6°  diagonal roll
const FILL_FRAC       = 1.220;
const LOOKAT_OFFSET_X = 0.370;   // +ve pushes model LEFT so essay has room on the right
const LOOKAT_OFFSET_Y = -0.360;

// Mobile / narrow overrides — sarmal lies HORIZONTALLY and is
// TRANSLATED UP in world so it clearly sits in the top ~1/3 of the
// frame, above the bottom essay band. Camera lookAt stays at origin.
const MOBILE_BREAKPOINT   = 820;
const FILL_FRAC_MOBILE    = 0.95;
const LOOKAT_OFFSET_X_M   = 0.0;
const LOOKAT_OFFSET_Y_M   = 0.0;
const MODEL_Y_OFFSET_M    = 0.65;    // model.position.y = halfH × this (positive = higher on screen)
const BASE_Y_TILT_MOBILE  = 0.25;    // gentle perspective
const BASE_Z_TILT_MOBILE  = 0.0;     // no diagonal roll → horizontal wave

// Intro
const INTRO_DELAY        = 0.25;
const ASSEMBLY_DURATION  = 1.60;
const TUBE_FADE          = 0.55;
const TEXT_OFFSET        = 1.10;
const LINE_STAGGER       = 0.055;

// Copy
const ESSAY = [
  "HOLM is new.",
  "We started in 2026, out of İzmir.",
  "One studio, a short list of obsessions.",
  "We build websites slowly, by hand, in code.",
  "Every scroll and every frame is something we decided on.",
  "We care about the parts most people never consciously notice —",
  "the weight of a transition, the patience inside a pause.",
  "Being new means we still have everything to prove.",
  "So we take on less, and hold on tighter.",
  "We'd rather make one thing that lingers than ten that don't.",
  "Somewhere between a rough sketch and a finished piece, there's a wait.",
  "That wait is where we like to live.",
  "We're early in our own story.",
  "We'd be glad if it included yours.",
  "HOLM.",
];

export class About {
  constructor({ lenis } = {}) {
    this.lenis   = lenis || null;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.container = null;
    this.canvas    = null;
    this.essayEl   = null;

    this.renderer  = null;
    this.scene     = null;
    this.camera    = null;
    this.envMap    = null;
    this.composer  = null;
    this.underwater = null;

    this._model         = null;   // outer tilt group (Y/Z tilt + mouse)
    this._spinner       = null;   // inner root (pure X spin around its own long axis)
    this._tubes         = [];
    this._tubeMats      = [];
    this._tubeRevealOrder = null;

    this._introTl = null;

    // Mouse-driven spin state
    this._mouseNormX = 0;      // -1 (left edge) .. +1 (right edge)
    this._smoothMx   = 0;      // damped follower

    this._rafId    = null;
    this._active   = false;
    this._prevTime = 0;

    this._onResize  = this._onResize.bind(this);
    this._onPointer = this._onPointer.bind(this);
  }

  init() {
    this._createDOM();
    this._createThree();
    this._loadSarmal();
    this._playTextReveal();   // independent of model load — text always appears
    window.addEventListener("resize", this._onResize);
    window.addEventListener("pointermove", this._onPointer, { passive: true });
    this._startLoop();
  }

  // Essay reveal — decoupled from the model so text lands even if the
  // GLTF is slow or fails. Uses opacity + a small y-slide (no mask),
  // so if this tween never runs the CSS default is already visible.
  _playTextReveal() {
    const lines = [...this.container.querySelectorAll(".holm-about__line")];
    if (!lines.length) return;
    if (this.reduced) return;   // CSS default is visible; nothing to do

    // Hide them just before the tween — narrow window where they might
    // flash visible for one frame is acceptable and beats leaving them
    // stuck hidden forever if this method somehow bails.
    gsap.set(lines, { opacity: 0, y: 18 });
    gsap.to(lines, {
      opacity: 1,
      y:       0,
      duration: 0.7,
      stagger:  LINE_STAGGER,
      ease:     "power3.out",
      delay:    INTRO_DELAY + TEXT_OFFSET,
    });
  }

  destroy() {
    this._active = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("pointermove", this._onPointer);

    this._introTl?.kill();
    this._tubeMats.forEach((m) => m?.dispose?.());
    this._matcapTex?.dispose?.();
    this.underwater?.dispose?.();

    this.scene?.traverse((o) => {
      o.geometry?.dispose?.();
      const m = o.material;
      if (Array.isArray(m)) m.forEach(mm => mm.dispose?.());
      else m?.dispose?.();
    });
    this.envMap?.dispose?.();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss?.();
    }
    this.container?.parentNode?.removeChild(this.container);
    this.renderer = this.scene = this.camera = this._model = null;
    this.composer = this.underwater = null;
    this._tubes = []; this._tubeMats = []; this._tubeRevealOrder = null;
    this.container = this.canvas = this.essayEl = null;
  }

  // ── DOM ────────────────────────────────────────────────────────────
  _createDOM() {
    const container = document.createElement("section");
    container.className = "holm-about";
    if (this.reduced) container.classList.add("is-reduced-motion");

    const essayHtml = ESSAY.map(
      (s) => `<div class="holm-about__line-wrap"><div class="holm-about__line">${s}</div></div>`,
    ).join("");

    container.innerHTML = `
      <a class="holm-about__brand" href="/" aria-label="HOLM — home">
        <img src="${logoUrl}" alt="HOLM" />
      </a>
      <canvas class="holm-about__canvas" aria-hidden="true"></canvas>
      <aside class="holm-about__essay" aria-label="About HOLM">
        ${essayHtml}
      </aside>
    `;
    document.body.appendChild(container);

    this.container = container;
    this.canvas    = container.querySelector(".holm-about__canvas");
    this.essayEl   = container.querySelector(".holm-about__essay");
  }

  // ── Three.js ───────────────────────────────────────────────────────
  _createThree() {
    const w = window.innerWidth, h = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.55;
    this.renderer.outputColorSpace    = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = this._makeGradientTexture(BG_TOP, BG_BOT);

    this.camera = new THREE.PerspectiveCamera(24, w / h, 0.05, 60);
    this.camera.position.set(0, 0, 4);
    this.camera.lookAt(0, 0, 0);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = this.envMap;

    this.composer = new EffectComposer(this.renderer);
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.composer.setSize(w, h);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const isMobile = window.innerWidth < 768 || "ontouchstart" in window;
    this.underwater = createUnderwaterSystem(this.renderer, { isMobile });
    this.composer.addPass(this.underwater.pass);
    this.composer.addPass(new OutputPass());
  }

  // Vertical two-stop gradient rendered into a canvas texture. Used as
  // scene.background so it feeds cleanly through the underwater pass.
  _makeGradientTexture(top, bottom) {
    const c = document.createElement("canvas");
    c.width = 2; c.height = 512;
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bottom);
    g.fillStyle = grad;
    g.fillRect(0, 0, 2, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter  = THREE.LinearFilter;
    tex.magFilter  = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }

  _loadSarmal() {
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    loader.load(
      "/models/about/sarmal.glb",
      (gltf) => {
        const root = gltf.scene;
        const box  = new THREE.Box3().setFromObject(root);
        const c    = new THREE.Vector3(); box.getCenter(c);
        root.position.sub(c);

        // Matcap look — a shaded sphere baked into a texture and
        // sampled by the view-space normal. Cheap, ignores scene lights
        // entirely, and reads as polished metal.
        const matcapTex = new THREE.TextureLoader().load(matcapUrl);
        matcapTex.colorSpace = THREE.SRGBColorSpace;
        this._matcapTex = matcapTex;

        this._tubes    = [];
        this._tubeMats = [];
        root.traverse((n) => {
          if (n.isMesh) {
            const m = new THREE.MeshMatcapMaterial({
              matcap:      matcapTex,
              transparent: true,      // required for the intro fade
              opacity:     0.0,       // starts invisible
            });
            n.material = m;
            this._tubes.push(n);
            this._tubeMats.push(m);
          }
        });

        // Reveal order — sort by world X so the wave draws in left→right.
        root.updateMatrixWorld(true);
        const entries = this._tubes.map((t, i) => {
          const p = new THREE.Vector3(); t.getWorldPosition(p);
          return { i, x: p.x };
        });
        entries.sort((a, b) => a.x - b.x);
        this._tubeRevealOrder = new Array(this._tubes.length);
        entries.forEach((entry, rank) => { this._tubeRevealOrder[entry.i] = rank; });

        // Nested transforms so the two rotations don't interfere:
        //   tilt (outer)   ← Y/Z base pose (mobile-aware)
        //   root (inner)   ← continuous X spin around the tubes' own
        //                    long axis, unaffected by the tilt above.
        const tilt = new THREE.Group();
        tilt.add(root);

        this.scene.add(tilt);
        this._model   = tilt;
        this._spinner = root;
        this._applyPose();
        this._frameModel();
        this._playIntro();

        // Safety net — if the intro tween is throttled or skipped by
        // the browser (some mobile Chromes with battery saver etc.),
        // force the tubes visible after a few seconds so the sarmal
        // can never be stuck invisible.
        setTimeout(() => {
          for (const m of this._tubeMats) {
            if (m && m.opacity < 0.98) m.opacity = 1.0;
          }
        }, 4000);
      },
      undefined,
      (err) => console.error("[about] sarmal load failed", err),
    );
  }

  // Frame the (rotated) model so it fills FILL_FRAC of the viewport
  // width, with a lookAt offset pushing it left/right and up/down.
  // Apply the tilt appropriate for the current viewport. Called on
  // load and again on resize so a device rotation snaps to the right
  // pose without a reload.
  _applyPose() {
    if (!this._model) return;
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const yTilt = isMobile ? BASE_Y_TILT_MOBILE : BASE_Y_TILT;
    const zTilt = isMobile ? BASE_Z_TILT_MOBILE : BASE_Z_TILT;
    this._model.rotation.set(0, yTilt, zTilt);
  }

  _frameModel() {
    if (!this._model) return;
    this._model.updateMatrixWorld(true);
    const box  = new THREE.Box3().setFromObject(this._model);
    const size = new THREE.Vector3(); box.getSize(size);
    const modelW = Math.max(size.x, size.z);
    const fovRad = THREE.MathUtils.degToRad(this.camera.fov);
    const aspect = this.camera.aspect;

    // Pick desktop or mobile framing preset. Mobile centres the sarmal
    // horizontally and shifts the camera down so the wave sits in the
    // upper half of the frame, leaving the essay a clear bottom band.
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const fill    = isMobile ? FILL_FRAC_MOBILE  : FILL_FRAC;
    const offX    = isMobile ? LOOKAT_OFFSET_X_M : LOOKAT_OFFSET_X;
    const offY    = isMobile ? LOOKAT_OFFSET_Y_M : LOOKAT_OFFSET_Y;

    const targetFrustumWidth = modelW / fill;
    const dist   = targetFrustumWidth / (2 * Math.tan(fovRad / 2) * aspect);
    const halfW  = targetFrustumWidth / 2;
    const halfH  = halfW / aspect;

    // On mobile translate the model UP in world so it sits high on
    // the screen; on desktop leave it centred and use camera lookAt
    // offsets instead.
    this._model.position.y = isMobile ? halfH * MODEL_Y_OFFSET_M : 0;

    this.camera.position.set(0, 0, dist);
    this.camera.lookAt(halfW * offX, halfH * offY, 0);
  }

  // Model-only intro — text reveal is handled separately in _playTextReveal
  // so the two beats don't rely on each other.
  _playIntro() {
    if (this.reduced) {
      this._tubeMats.forEach((m) => { m.opacity = 1.0; });
      return;
    }

    const tl = gsap.timeline({ delay: INTRO_DELAY });
    this._introTl = tl;

    const total = this._tubes.length;
    const gap   = (ASSEMBLY_DURATION - TUBE_FADE) / Math.max(1, total - 1);
    this._tubes.forEach((_, i) => {
      const rank = this._tubeRevealOrder[i];
      tl.to(this._tubeMats[i], {
        opacity: 1,
        duration: TUBE_FADE,
        ease: "power2.out",
      }, rank * gap);
    });
  }

  // ── Loop ───────────────────────────────────────────────────────────
  _startLoop() {
    this._active   = true;
    this._prevTime = performance.now();
    const tick = (now) => {
      if (!this._active) return;
      const dt = Math.min((now - this._prevTime) / 1000, 0.05);
      this._prevTime = now;

      if (this._spinner) {
        // Damped mouse follower + spin. Base spin is right; mouse X
        // adds a signed contribution big enough to slow, halt or
        // reverse it. Center mouse = default spin; edges = full swing.
        this._smoothMx += (this._mouseNormX - this._smoothMx) * MOUSE_LERP;
        const spinRate = SPIN_SPEED + this._smoothMx * MOUSE_SPIN_INFLUENCE;
        this._spinner.rotation.x += spinRate * dt;
      }

      this.underwater?.update();
      this.composer?.render();
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }


  _onPointer(e) {
    // Track normalized X (-1..+1) for spin control.
    this._mouseNormX = (e.clientX / window.innerWidth) * 2 - 1;
    this.underwater?.setMouseNorm(e.clientX / window.innerWidth,
                                  1 - e.clientY / window.innerHeight);
  }

  _onResize() {
    if (!this.renderer) return;
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    if (this._model) {
      this._applyPose();
      this._frameModel();
    }
  }
}
