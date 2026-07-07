import * as THREE from "three";
import gsap from "gsap";
import "./loader.css";

// ─── Tunables ────────────────────────────────────────────────────────
const MIN_DURATION      = 3.0;                   // seconds — patience floor
const OVERLAY_BG        = "#000000";

const COLLAPSE_DURATION = 0.75;
const COLLAPSE_EASE     = "power3.inOut";

// Iris reveal — a transparent circle expands from center
const REVEAL_DURATION   = 1.5;
const REVEAL_EASE       = "power3.inOut";
const REVEAL_SOFT_PX    = 60;                    // edge softness of the iris

// ─── Diamond shader — refraction + dispersion + fresnel ─────────────
const DIAMOND_VERT = /* glsl */`
varying vec3 vWorldPos;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const DIAMOND_FRAG = /* glsl */`
varying vec3 vWorldPos;
uniform float uTime;
uniform float uAlpha;

// Cinematic procedural env — cool sky, warm rim, subtle stars for sparkle catch
vec3 sampleEnv(vec3 dir) {
  float t    = dir.y * 0.5 + 0.5;
  vec3 lowSky  = vec3(0.015, 0.028, 0.06);
  vec3 midSky  = vec3(0.20, 0.32, 0.55);
  vec3 highSky = vec3(0.72, 0.85, 1.05);

  vec3 sky = mix(lowSky, midSky, smoothstep(0.0, 0.55, t));
  sky      = mix(sky,     highSky, smoothstep(0.55, 1.0, t));

  // warm horizon glow — golden fringe near the equator
  float horiz = 1.0 - abs(dir.y);
  float warm  = pow(smoothstep(0.35, 0.95, horiz), 2.2);
  sky += vec3(1.10, 0.50, 0.18) * warm * 0.55;

  // key-light hotspot — moves slowly so facets catch it as the gem turns
  vec3  keyDir  = normalize(vec3(sin(uTime * 0.35) * 0.7, 0.55, cos(uTime * 0.35) * 0.7));
  float keyFall = pow(max(dot(dir, keyDir), 0.0), 24.0);
  sky += vec3(1.4, 1.25, 1.05) * keyFall * 0.9;

  // secondary cool fill from opposite side
  vec3  fillDir  = vec3(-keyDir.x, 0.2, -keyDir.z);
  float fillFall = pow(max(dot(dir, fillDir), 0.0), 8.0);
  sky += vec3(0.35, 0.55, 0.85) * fillFall * 0.35;

  return sky;
}

void main() {
  // Flat-shaded per-facet normal via screen-space derivatives
  vec3 N = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
  vec3 V = normalize(cameraPosition - vWorldPos);

  float ndotv = max(dot(N, V), 0.0);
  float fres  = pow(1.0 - ndotv, 4.5);

  // Dispersion — three IORs for R/G/B, wider spread than before
  vec3 refrR = refract(-V, N, 1.0 / 1.395);
  vec3 refrG = refract(-V, N, 1.0 / 1.470);
  vec3 refrB = refract(-V, N, 1.0 / 1.560);

  // Fake secondary internal bounce — reflect the refracted ray off the
  // opposite facet and sample the env again. Cheap but gives depth.
  vec3 innerN  = -N;
  vec3 bounceR = reflect(refrR, innerN);
  vec3 bounceG = reflect(refrG, innerN);
  vec3 bounceB = reflect(refrB, innerN);

  float bounceMix = 0.42;
  vec3 refractionColor = vec3(
    mix(sampleEnv(refrR).r, sampleEnv(bounceR).r, bounceMix),
    mix(sampleEnv(refrG).g, sampleEnv(bounceG).g, bounceMix),
    mix(sampleEnv(refrB).b, sampleEnv(bounceB).b, bounceMix)
  );

  vec3 reflColor = sampleEnv(reflect(-V, N));

  vec3 col = mix(refractionColor, reflColor, fres);

  // Bright rim — pushes the edge toward white as facets meet the camera
  col += fres * vec3(0.98, 0.99, 1.05) * 0.85;

  // Body absorption tint — a whisper of blue in the "glass"
  col *= mix(vec3(0.92, 0.96, 1.02), vec3(1.0), fres);

  // Tone curve — subtle contrast boost so the fire pops on dark bg
  col = pow(col, vec3(0.92));

  gl_FragColor = vec4(col, uAlpha);
}
`;

// ─── Brilliant-cut diamond geometry ──────────────────────────────────
// N-sided rings stacked by height; alternating rings rotate half-facet
// so adjacent facets zig-zag — the shape a "round brilliant" would have.
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
    this._createDOM();
    this._createDiamond();
    this._bindLoadingManager();
    this._startLoop();

    await this._runPhase1();
    await this._runPhase2();
    await this._runPhase3();

    this._destroy();
  }

  // ── Phase 1: diamond + counter, gated by load AND min duration ───
  _runPhase1() {
    return new Promise((resolve) => {
      const poll = () => {
        const elapsed = (performance.now() - this._startTime) / 1000;
        if (this._loadDone && elapsed >= MIN_DURATION) {
          gsap.to(this._displayProgress, {
            value: 1.0,
            duration: 0.45,
            ease: "power2.out",
            onComplete: () => {
              if (this.counterEl) this.counterEl.textContent = "100";
              gsap.delayedCall(0.25, resolve);
            },
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

      tl.to(this.diamond.material.uniforms.uAlpha, {
        value: 0,
        duration: COLLAPSE_DURATION * 0.85,
        ease: "power2.in",
      }, COLLAPSE_DURATION * 0.15);

      tl.to(this.frameEl, {
        clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
        duration: COLLAPSE_DURATION,
        ease: COLLAPSE_EASE,
      }, 0);

      tl.to(this.counterEl.parentElement, {
        scale: 0.6,
        opacity: 0,
        duration: COLLAPSE_DURATION * 0.7,
        ease: "power3.in",
      }, COLLAPSE_DURATION * 0.15);
    });
  }

  // ── Phase 3: iris reveal — transparent circle grows from center ─
  _runPhase3() {
    return new Promise((resolve) => {
      // Stop loader RAF, hand canvas to main scene BEFORE the iris opens
      this._active = false;
      if (this._rafId) cancelAnimationFrame(this._rafId);
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
        duration: 0.55,
        ease: "power2.out",
      }, REVEAL_DURATION - 0.4);
    });
  }

  // ── Setup helpers ────────────────────────────────────────────────

  _createDOM() {
    document.body.classList.add("holm-loading");

    const overlay = document.createElement("div");
    overlay.className = "holm-loader";
    overlay.style.setProperty("--holm-loader-bg", OVERLAY_BG);
    overlay.innerHTML = `
      <div class="holm-loader__frame">
        <div class="holm-loader__counter">
          <span class="holm-loader__num">0</span><span class="holm-loader__pct">%</span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    this.overlay   = overlay;
    this.frameEl   = overlay.querySelector(".holm-loader__frame");
    this.counterEl = overlay.querySelector(".holm-loader__num");
  }

  _createDiamond() {
    // Multi-ring brilliant cut — table + crown + girdle + pavilion + culet
    const geom = createBrilliantDiamond(16);
    geom.scale(0.82, 0.98, 0.82);

    const mat = new THREE.ShaderMaterial({
      vertexShader:   DIAMOND_VERT,
      fragmentShader: DIAMOND_FRAG,
      uniforms: {
        uTime:  { value: 0 },
        uAlpha: { value: 1 },
      },
      transparent: true,
    });

    this.diamond = new THREE.Mesh(geom, mat);
    // Tilt slightly toward the viewer so the crown facets catch the key light
    this.diamond.rotation.x = -0.28;
    this.scene.add(this.diamond);

    this._resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const aspect = w / h;
      this.camera.aspect = aspect;
      // Portrait: pull the camera back so the gem doesn't crop / overflow
      this.camera.position.z = aspect < 0.75
        ? 5.6
        : aspect < 1.0
          ? 4.6
          : 3.9;
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
      const pct      = Math.floor(shown * 100);
      if (this.counterEl) this.counterEl.textContent = String(pct);

      // Diamond animation — slow gleaming spin, subtle wobble
      this.diamond.rotation.y += dt * 0.32;
      this.diamond.rotation.x  = -0.28 + Math.sin(elapsed * 0.45) * 0.08;
      this.diamond.rotation.z  = Math.sin(elapsed * 0.30) * 0.05;
      this.diamond.material.uniforms.uTime.value = elapsed;

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
