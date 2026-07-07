import * as THREE from "three";
import gsap from "gsap";
import { Delaunay } from "d3-delaunay";
import "./loader.css";

// ─── Tunables ────────────────────────────────────────────────────────
const MIN_DURATION      = 3.0;                   // seconds — patience floor
const SHARD_COUNT       = 48;
const IMPACT_POINT      = { x: 0.5, y: 0.5 };    // viewport ratio
const OVERLAY_BG        = "#000000";             // must match body / shard color

const COLLAPSE_DURATION = 0.75;
const COLLAPSE_EASE     = "power3.inOut";

const SHATTER_BURST_DUR = 0.28;                  // outward impulse phase
const SHATTER_FALL_DUR  = 1.05;                  // gravity fall + fade phase
const SHATTER_STAGGER   = 0.30;                  // delay range across shards

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

// Procedural environment gradient — sky above, warm horizon, cool below
vec3 sampleEnv(vec3 dir) {
  float t   = dir.y * 0.5 + 0.5;
  vec3 sky  = mix(vec3(0.03, 0.06, 0.14), vec3(0.55, 0.72, 0.95), t);
  float warm = smoothstep(0.42, 0.78, 1.0 - abs(dir.y));
  warm *= 0.5 + 0.5 * sin(dir.x * 3.2 + uTime * 0.35);
  sky  += vec3(0.85, 0.42, 0.16) * warm * 0.22;
  // subtle high-frequency sparkle
  sky  += 0.05 * sin(dir.x * 42.0 + uTime * 1.8) * sin(dir.z * 42.0 - uTime * 1.2);
  return sky;
}

void main() {
  // Flat-shaded face normal via screen-space derivatives
  vec3 N = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
  vec3 V = normalize(cameraPosition - vWorldPos);

  float ndotv = max(dot(N, V), 0.0);
  float fres  = pow(1.0 - ndotv, 3.2);

  // Chromatic dispersion — three IORs give R/G/B fringes ("fire")
  vec3 refrR = refract(-V, N, 1.0 / 1.42);
  vec3 refrG = refract(-V, N, 1.0 / 1.47);
  vec3 refrB = refract(-V, N, 1.0 / 1.53);

  vec3 refractionColor = vec3(
    sampleEnv(refrR).r,
    sampleEnv(refrG).g,
    sampleEnv(refrB).b
  );

  vec3 reflColor = sampleEnv(reflect(-V, N));

  vec3 col = mix(refractionColor, reflColor, fres);
  col += fres * vec3(0.92, 0.96, 1.0) * 0.55;

  gl_FragColor = vec4(col, uAlpha);
}
`;

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

    this.overlay        = null;
    this.frameEl        = null;
    this.counterEl      = null;
    this.shardContainer = null;
    this.diamond        = null;

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

  // ── Phase 3: Voronoi shatter with physics — gravity + tumble ────
  _runPhase3() {
    return new Promise((resolve) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const impactPx = { x: IMPACT_POINT.x * w, y: IMPACT_POINT.y * h };

      // Seed points — 70% biased toward impact, 30% scattered
      const points = [];
      for (let i = 0; i < SHARD_COUNT; i++) {
        if (i / SHARD_COUNT < 0.7) {
          const rad   = Math.sqrt(Math.random()) * Math.min(w, h) * 0.72;
          const theta = Math.random() * Math.PI * 2;
          points.push([
            impactPx.x + Math.cos(theta) * rad,
            impactPx.y + Math.sin(theta) * rad,
          ]);
        } else {
          points.push([Math.random() * w, Math.random() * h]);
        }
      }
      const clamped = points.map(([x, y]) => [
        Math.max(0, Math.min(w, x)),
        Math.max(0, Math.min(h, y)),
      ]);

      const delaunay = Delaunay.from(clamped);
      const voronoi  = delaunay.voronoi([0, 0, w, h]);

      const shards = [];
      for (let i = 0; i < clamped.length; i++) {
        const cell = voronoi.cellPolygon(i);
        if (!cell || cell.length < 3) continue;

        const polyStr = cell.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(", ");

        const el = document.createElement("div");
        el.className = "holm-loader__shard";
        el.style.clipPath = `polygon(${polyStr})`;

        let cx = 0, cy = 0;
        for (const [x, y] of cell) { cx += x; cy += y; }
        cx /= cell.length; cy /= cell.length;

        // Pivot at cell's centroid → rotation looks like it's tumbling around itself,
        // not swinging around the middle of the viewport
        el.style.transformOrigin = `${((cx / w) * 100).toFixed(2)}% ${((cy / h) * 100).toFixed(2)}%`;
        this.shardContainer.appendChild(el);

        const dx   = cx - impactPx.x;
        const dy   = cy - impactPx.y;
        const dist = Math.hypot(dx, dy) || 1;

        shards.push({
          el,
          cx, cy, dist,
          nx: dx / dist,
          ny: dy / dist,
        });
      }

      const maxDist = Math.max(1, ...shards.map((s) => s.dist));

      // Stop the loader render loop, hand canvas off to the main scene
      this._active = false;
      if (this._rafId) cancelAnimationFrame(this._rafId);
      if (this._onReveal) this._onReveal();

      const master = gsap.timeline({
        onComplete: () => gsap.delayedCall(0.05, resolve),
      });

      shards.forEach((s) => {
        const delay     = (s.dist / maxDist) * SHATTER_STAGGER;
        const proximity = 1 - (s.dist / maxDist) * 0.6;   // 0.4 – 1.0

        // Radial impulse magnitudes
        const outward   = (280 + Math.random() * 340) * proximity;
        const upKick    = (140 + Math.random() * 220) * proximity;
        const zLiftA    = 140 + Math.random() * 260 * proximity;

        // After the burst, gravity pulls further along the same direction
        const fall      = 620 + Math.random() * 520;
        const drift     = (Math.random() - 0.5) * 180;
        const zLiftB    = 320 + Math.random() * 520 * proximity;

        // Phase A — outward burst + slight upward kick + fast tumble start
        master.to(s.el, {
          x: s.nx * outward + drift * 0.35,
          y: s.ny * outward - upKick,
          z: zLiftA,
          rotationX: (Math.random() - 0.5) * 55,
          rotationY: (Math.random() - 0.5) * 55,
          rotationZ: (Math.random() - 0.5) * 40,
          duration: SHATTER_BURST_DUR,
          ease: "power2.out",
        }, delay);

        // Phase B — gravity fall + tumble continues + fade
        master.to(s.el, {
          x: s.nx * outward * 1.35 + drift,
          y: s.ny * outward - upKick + fall,
          z: zLiftB,
          rotationX: (Math.random() - 0.5) * 320,
          rotationY: (Math.random() - 0.5) * 320,
          rotationZ: (Math.random() - 0.5) * 420,
          opacity: 0,
          duration: SHATTER_FALL_DUR,
          ease: "power2.in",
        }, delay + SHATTER_BURST_DUR);
      });
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
      <div class="holm-loader__shards"></div>
    `;
    document.body.appendChild(overlay);

    this.overlay        = overlay;
    this.frameEl        = overlay.querySelector(".holm-loader__frame");
    this.counterEl      = overlay.querySelector(".holm-loader__num");
    this.shardContainer = overlay.querySelector(".holm-loader__shards");
  }

  _createDiamond() {
    // Octahedron stretched vertically → classic diamond silhouette
    const geom = new THREE.OctahedronGeometry(1, 0);
    geom.scale(0.78, 1.15, 0.78);

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
    this.scene.add(this.diamond);

    this._resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      this.camera.aspect = w / h;
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

      // Diamond animation
      this.diamond.rotation.y += dt * 0.55;
      this.diamond.rotation.x  = Math.sin(elapsed * 0.7)  * 0.14;
      this.diamond.rotation.z  = Math.sin(elapsed * 0.42) * 0.08;
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
