import * as THREE from "three";
import gsap from "gsap";
import "./loader.css";

// ─── Tunables ────────────────────────────────────────────────────────
const MIN_DURATION      = 3.0;                   // seconds — patience floor
const OVERLAY_BG        = "#000000";

// The main renderer is capped at DPR 1.0 on mobile for performance (heavy
// shadows + post-processing). The loader is only visible for ~3s and draws
// nothing but a wireframe diamond — well within budget to render at a
// higher DPR. Bumping here fixes the "blurry line-art" issue on retina
// phones without affecting main-scene perf, because we restore the
// original ratio at the top of the iris reveal before main starts drawing.
const LOADER_MOBILE_DPR = 2;

const COLLAPSE_DURATION = 0.75;
const COLLAPSE_EASE     = "power3.inOut";

// Iris reveal — a transparent circle expands from center
const REVEAL_DURATION   = 2.2;                   // longer feels less abrupt
const REVEAL_EASE       = "power2.inOut";        // softer than power3
const REVEAL_SOFT_PX    = 180;                   // wide edge softness — no hard ring

// ─── Loader dotted-diamond — high-contrast B/W stipple ─────────────
const DOTS_VERT = /* glsl */`
attribute float aSeed;
uniform float uTime;
uniform float uPixel;   // devicePixelRatio for consistent size
varying float vIntensity;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  // Perspective-scaled point size, kept small for grain
  gl_PointSize = uPixel * (260.0 / -mv.z);
  // Twinkle — deterministic per-seed, animated over time
  float phase = aSeed * 47.31 + uTime * 2.3;
  vIntensity = 0.30 + 0.70 * abs(sin(phase));
}
`;

const DOTS_FRAG = /* glsl */`
uniform float uAlpha;
varying float vIntensity;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = (1.0 - d * 2.0) * vIntensity * uAlpha;
  gl_FragColor = vec4(vec3(1.0), a);
}
`;

// Brilliant-cut vertical profile — used to sample points inside the volume.
// y positive = up. Returns the horizontal radius at height y (0 outside).
function diamondProfileRadius(y) {
  if (y > 0.55 || y < -1.10) return 0;
  if (y >= 0.10) {
    // crown: y=0.55→r=0.42, y=0.10→r=1.00
    const t = (0.55 - y) / (0.55 - 0.10);
    return 0.42 + (1.00 - 0.42) * t;
  }
  // pavilion: y=0.10→r=1.00, y=-1.10→r=0.00
  const t = (0.10 - y) / (0.10 - (-1.10));
  return 1.00 * (1 - t);
}

// ─── Volume sampler — dense points inside the diamond profile ──────
function sampleDiamondVolume(count) {
  const positions = new Float32Array(count * 3);
  const seeds     = new Float32Array(count);
  let i = 0;
  const yMin = -1.10, yMax = 0.55;
  while (i < count) {
    const y = yMin + Math.random() * (yMax - yMin);
    const rMax = diamondProfileRadius(y);
    if (rMax <= 0) continue;
    // sqrt for uniform disk density
    const r     = Math.sqrt(Math.random()) * rMax;
    const theta = Math.random() * Math.PI * 2;
    positions[i * 3    ] = Math.cos(theta) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * r;
    seeds[i] = Math.random();
    i++;
  }
  return { positions, seeds };
}

// ─── Brilliant-cut diamond geometry (kept for reference/reuse) ─────
function createBrilliantDiamond(N = 16) {
  const positions = [];
  const indices   = [];
  const halfStep  = Math.PI / N;

  //           y      r     angleOffset
  const layers = [
    [ 0.55,  0.00,  0            ], // 0 table center (top point)
    [ 0.55,  0.42,  0            ], // 1 table ring
    [ 0.36,  0.68,  halfStep     ], // 2 upper crown ring (offset)
    [ 0.08,  1.00,  0            ], // 3 girdle
    [-0.18,  0.88,  halfStep     ], // 4 upper pavilion
    [-0.68,  0.42,  0            ], // 5 lower pavilion
    [-0.98,  0.00,  0            ], // 6 culet
  ];

  const ringStarts = [];
  for (const [y, r, a] of layers) {
    ringStarts.push(positions.length / 3);
    if (r === 0) {
      positions.push(0, y, 0);
    } else {
      for (let i = 0; i < N; i++) {
        const th = (i / N) * Math.PI * 2 + a;
        positions.push(Math.cos(th) * r, y, Math.sin(th) * r);
      }
    }
  }

  for (let li = 0; li < layers.length - 1; li++) {
    const [ , r1] = layers[li];
    const [ , r2] = layers[li + 1];
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

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  return geom;
}

// ─── Loader class ────────────────────────────────────────────────────
export class Loader {
  constructor({ renderer, onReveal }) {
    this.renderer  = renderer;
    this._onReveal = onReveal;

    this.loadingManager   = new THREE.LoadingManager();
    this._realProgress    = 0;
    this._displayProgress = { value: 0 };
    this._loadDone        = false;
    this._startTime       = 0;

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.camera.position.set(0, 0, 3.9);

    this.overlay   = null;
    this.frameEl   = null;
    this.counterEl = null;
    this.diamond   = null;

    this._rafId  = null;
    this._active = false;
    this._resize = null;
  }

  getLoadingManager() { return this.loadingManager; }

  // Called by main.js once all assets are loaded — gates Phase 1 completion.
  // (LoadingManager.onLoad can fire multiple times with sequential awaits,
  // so we rely on an explicit signal for the phase transition.)
  markComplete() {
    this._realProgress = 1.0;
    this._loadDone     = true;
  }

  async run() {
    // Bump renderer DPR for the loader phase — the main renderer was capped
    // at 1.0 on mobile to keep the heavy museum scene playable, but the loader
    // shows nothing but thin white lines, which alias badly at 1.0 on a 3×
    // screen. Restored inside _runPhase3 before the main scene draws.
    this._prevPixelRatio = this.renderer.getPixelRatio();
    const targetDpr = Math.min(
      window.devicePixelRatio,
      window.innerWidth < 768 || "ontouchstart" in window ? LOADER_MOBILE_DPR : 2,
    );
    if (targetDpr > this._prevPixelRatio) {
      this.renderer.setPixelRatio(targetDpr);
      // false → don't touch the canvas CSS size, only the drawing buffer
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    }

    this._createDOM();
    this._createDiamond();
    this._bindLoadingManager();
    this._startLoop();

    await this._runPhase1();
    await this._runPhase2();
    await this._runPhase3();

    this._destroy();
  }

  // ── Phase 1: diamond + hairline bar, gated by load AND min duration ─
  _runPhase1() {
    return new Promise((resolve) => {
      const poll = () => {
        const elapsed = (performance.now() - this._startTime) / 1000;
        if (this._loadDone && elapsed >= MIN_DURATION) {
          gsap.to(this._displayProgress, {
            value: 1.0,
            duration: 0.45,
            ease: "power2.out",
            onComplete: () => gsap.delayedCall(0.25, resolve),
          });
        } else {
          setTimeout(poll, 60);
        }
      };
      poll();
    });
  }

  // ── Phase 2: clip-path collapse + 3D diamond shrink/fade ────────
  _runPhase2() {
    return new Promise((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve });

      tl.to(this.diamond.scale, {
        x: 0.05, y: 0.05, z: 0.05,
        duration: COLLAPSE_DURATION,
        ease: COLLAPSE_EASE,
      }, 0);

      tl.to(this.diamond.material, {
        opacity: 0,
        duration: COLLAPSE_DURATION * 0.85,
        ease: "power2.in",
      }, COLLAPSE_DURATION * 0.15);

      tl.to(this.frameEl, {
        clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
        duration: COLLAPSE_DURATION,
        ease: COLLAPSE_EASE,
      }, 0);

      tl.to(this.barEl, {
        opacity: 0,
        scaleY: 0.4,
        duration: COLLAPSE_DURATION * 0.7,
        ease: "power3.in",
        transformOrigin: "50% 50%",
      }, COLLAPSE_DURATION * 0.15);
    });
  }

  // ── Phase 3: iris reveal — transparent circle grows from center ─
  _runPhase3() {
    return new Promise((resolve) => {
      // Stop loader RAF, hand canvas to main scene BEFORE the iris opens
      this._active = false;
      if (this._rafId) cancelAnimationFrame(this._rafId);

      // Restore the renderer's pixel ratio to whatever main.js set up so the
      // museum scene renders at its perf-tuned resolution. Do this BEFORE
      // _onReveal() so the main scene's first frame draws at the right size.
      if (this._prevPixelRatio != null
          && this.renderer.getPixelRatio() !== this._prevPixelRatio) {
        this.renderer.setPixelRatio(this._prevPixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight, false);
      }

      if (this._onReveal) this._onReveal();

      const overlay = this.overlay;
      const maxR    = Math.hypot(window.innerWidth, window.innerHeight) * 0.6;

      // Radial gradient mask: transparent inside the growing circle, opaque outside.
      // As the circle grows, the overlay fades away from the center outward.
      const applyMask = (r) => {
        const soft = REVEAL_SOFT_PX;
        const inner = Math.max(0, r);
        const outer = r + soft;
        const mask  = `radial-gradient(circle at 50% 50%, ` +
                      `transparent ${inner}px, black ${outer}px)`;
        overlay.style.maskImage       = mask;
        overlay.style.webkitMaskImage = mask;
      };
      applyMask(0);

      const state = { r: 0 };
      const tl = gsap.timeline({
        onComplete: () => gsap.delayedCall(0.05, resolve),
      });

      tl.to(state, {
        r: maxR,
        duration: REVEAL_DURATION,
        ease: REVEAL_EASE,
        onUpdate: () => applyMask(state.r),
      }, 0);

      // Overlay whole-opacity fade in the last portion — softens any residue
      tl.to(overlay, {
        opacity: 0,
        duration: 0.75,
        ease: "power2.out",
      }, REVEAL_DURATION - 0.55);
    });
  }

  // ── Setup helpers ────────────────────────────────────────────────

  _createDOM() {
    document.body.classList.add("holm-loading");

    const overlay = document.createElement("div");
    overlay.className = "holm-loader";
    overlay.style.setProperty("--holm-loader-bg", OVERLAY_BG);
    // Silent loader: no number counter. A single hairline sits below the
    // diamond and grows from the centre outward as load progresses. The
    // diamond stays the hero; progress is a whisper, not a headline.
    overlay.innerHTML = `
      <div class="holm-loader__frame">
        <div class="holm-loader__bar" aria-hidden="true">
          <div class="holm-loader__bar-fill"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    this.overlay = overlay;
    this.frameEl = overlay.querySelector(".holm-loader__frame");
    this.barEl   = overlay.querySelector(".holm-loader__bar");
    this.fillEl  = overlay.querySelector(".holm-loader__bar-fill");
  }

  _createDiamond() {
    // Hollow line-art diamond — white edge strokes on black, rotating 360°.
    // EdgesGeometry extracts every facet boundary from the brilliant-cut mesh
    // so we get the classic "wireframe SVG" look.
    const solid = createBrilliantDiamond(16);
    solid.scale(0.85, 0.98, 0.85);

    const edges = new THREE.EdgesGeometry(solid, 1);  // 1° so every facet shows
    const mat = new THREE.LineBasicMaterial({
      color:       0xffffff,
      transparent: true,
      opacity:     0.94,
    });

    this.diamond = new THREE.LineSegments(edges, mat);
    this.diamond.rotation.x = -0.28;
    this.diamond.scale.setScalar(1 / 3);   // 3× smaller — jewel accent, not a hero element
    this.scene.add(this.diamond);
    solid.dispose();

    this._resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const aspect = w / h;
      this.camera.aspect = aspect;
      // Portrait: pull the camera back so the gem doesn't crop / overflow.
      // Extra pull-back on all breakpoints — the diamond used to fill too
      // much of the frame; the counter reads better with more negative
      // space around the gem. Phone gets the biggest bump (7.4) so the
      // wireframe stays a jewel-sized accent, not a foreground element.
      this.camera.position.z = aspect < 0.75
        ? 7.4
        : aspect < 1.0
          ? 5.8
          : 6.2;
      this.camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", this._resize);
    this._resize();
  }

  _bindLoadingManager() {
    // onProgress feeds fine-grained progress into the visible counter.
    // onLoad is intentionally not used to gate Phase 1 (fires multiple times
    // with sequential awaits) — see markComplete().
    this.loadingManager.onProgress = (_url, loaded, total) => {
      if (this._loadDone) return;
      const p = total > 0 ? loaded / total : 0;
      this._realProgress = Math.max(this._realProgress, p);
    };
  }

  _startLoop() {
    this._active    = true;
    this._startTime = performance.now();
    let last = this._startTime;

    const tick = (now) => {
      if (!this._active) return;
      const dt      = (now - last) / 1000;
      const elapsed = (now - this._startTime) / 1000;
      last = now;

      // Ease displayed progress toward real
      this._displayProgress.value += (this._realProgress - this._displayProgress.value) * 0.06;

      // Time-gate: never advance faster than elapsed / MIN_DURATION
      const timeGate = Math.min(elapsed / MIN_DURATION, 1);
      const shown    = Math.min(this._displayProgress.value, timeGate);

      // Hairline progress bar — 0..1 drives scaleX from the centre outward.
      // scaleX (not width) so the animation stays on the GPU compositor and
      // the bar never triggers layout on the sibling canvas.
      if (this.fillEl) {
        this.fillEl.style.transform = `scaleX(${shown})`;
      }

      // Diamond animation — slow gleaming spin, subtle wobble
      // Continuous 360° spin — line-art wireframe rotates on Y only for clarity
      this.diamond.rotation.y += dt * 0.52;
      this.diamond.rotation.x  = -0.28 + Math.sin(elapsed * 0.35) * 0.05;

      this.renderer.autoClear = true;
      this.renderer.setClearColor(OVERLAY_BG, 1);
      this.renderer.render(this.scene, this.camera);

      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  _destroy() {
    this._active = false;
    document.body.classList.remove("holm-loading");
    if (this._rafId) cancelAnimationFrame(this._rafId);
    if (this._resize) window.removeEventListener("resize", this._resize);
    if (this.diamond) {
      this.diamond.geometry.dispose();
      this.diamond.material.dispose();
    }
    if (this.overlay?.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.scene   = null;
    this.camera  = null;
    this.diamond = null;
    this.overlay = null;
  }
}
