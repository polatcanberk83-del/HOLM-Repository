import * as THREE from "three";
import gsap from "gsap";
import { createBrilliantDiamond } from "./loader.js";

// ─── Transition Veil ────────────────────────────────────────────────
// A fixed full-screen WebGL layer that:
//   • cover()   → grows a noisy-edged dark radial cover from the top-left
//                 corner, revealing edge-glow debris at the boundary,
//                 then fades in the same brilliant-cut diamond used in
//                 the entry loader
//   • reveal()  → runs the sequence in reverse: fade diamond out, then
//                 retract the noisy cover back into the top-left
//
// Runs its own WebGLRenderer so it never contends with the main
// composer / museum scene. All timing gates + click intercept live in
// pageTransition.js — this file is just the visual choreography.

const VEIL_VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Cover shader — pure black fill with a noisy-edged radial dissolve
// from uCenter (top-left). No glyph field, no sparkle — the wireframe
// diamond in the second scene carries the whole visual.
const VEIL_FRAG = /* glsl */`
uniform vec2 uResolution;
uniform vec2 uCenter;      // radial dissolve origin (in UV, 0..1)
uniform float uDissolve;   // 0 = fully clear, 1 = fully covered
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    v += amp * noise2(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 centered = vUv - uCenter;
  float aspect = uResolution.x / uResolution.y;
  centered.x *= aspect;
  float dist = length(centered);
  float angle = atan(centered.y, centered.x);

  // Jag the leading edge — one blocky/pixelated component, one angular.
  // This is the only "distortion" texture left; the interior is uniformly
  // black so the wireframe diamond reads without competition.
  vec2 pxUv = floor(vUv * uResolution / 6.0) * 6.0 / uResolution;
  float blockNoise = fbm(pxUv * 100.0) * 0.14;
  float angNoise   = fbm(vec2(angle * 5.0, 0.0)) * 0.14;
  float noisyDist  = dist + blockNoise + angNoise;

  float maxDist = sqrt(aspect * aspect + 1.0);
  float normalizedDist = noisyDist / maxDist;
  float threshold = uDissolve * 1.15;

  float coverMask = 1.0 - smoothstep(threshold - 0.03, threshold, normalizedDist);

  gl_FragColor = vec4(0.0, 0.0, 0.0, coverMask);
}
`;

// ─── Public class ────────────────────────────────────────────────────
export class TransitionVeil {
  constructor() {
    this.canvas = null;
    this.renderer = null;

    // Two scenes composited in one canvas: dissolve fills the frame,
    // diamond floats on top when the cover reaches saturation.
    this.veilScene   = new THREE.Scene();
    this.veilCamera  = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    this.veilCamera.position.z = 1;

    this.diamondScene  = new THREE.Scene();
    this.diamondCamera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.diamondCamera.position.set(0, 0, 6.2);

    this.veilMaterial = null;
    this.diamond      = null;
    this.diamondOpacity = { value: 0 };

    this._rafId  = null;
    this._active = false;
    this._startedAt = 0;
  }

  // ── Mount the canvas + resources. `initialCovered=true` starts the
  //    veil at full cover + diamond visible (used on the destination
  //    page of a transition where the caller intends to run reveal()).
  mount({ initialCovered = false } = {}) {
    if (this.canvas) return;

    const canvas = document.createElement("canvas");
    canvas.className = "holm-transition-veil";
    Object.assign(canvas.style, {
      position:      "fixed",
      top:           "0",
      left:          "0",
      width:         "100vw",
      height:        "100vh",
      zIndex:        "9999",
      display:       "block",
      pointerEvents: "auto",
    });
    document.body.appendChild(canvas);
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha:     true,
      preserveDrawingBuffer: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.autoClear = false;
    this.renderer.setClearColor(0x000000, 0);

    // ── Veil (dissolve) plane
    this.veilMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uCenter:     { value: new THREE.Vector2(0.0, 1.0) },  // top-left in UV
        uDissolve:   { value: initialCovered ? 1.0 : 0.0 },
      },
      vertexShader:   VEIL_VERT,
      fragmentShader: VEIL_FRAG,
      transparent:    true,
      depthTest:      false,
      depthWrite:     false,
    });
    this._veilGeom = new THREE.PlaneGeometry(2, 2);
    this._veilMesh = new THREE.Mesh(this._veilGeom, this.veilMaterial);
    this.veilScene.add(this._veilMesh);

    // ── Diamond — identical wireframe used by the entry loader
    const solid = createBrilliantDiamond(16);
    solid.scale(0.85, 0.98, 0.85);
    const edges = new THREE.EdgesGeometry(solid, 1);
    const diaMat = new THREE.LineBasicMaterial({
      color:       0xffffff,
      transparent: true,
      opacity:     initialCovered ? 0.94 : 0,
    });
    this.diamond = new THREE.LineSegments(edges, diaMat);
    this.diamond.rotation.x = -0.28;
    this.diamond.scale.setScalar(1 / 3);
    this.diamondScene.add(this.diamond);
    solid.dispose();
    this._diamondEdges = edges;
    this._diamondMat = diaMat;
    this.diamondOpacity.value = initialCovered ? 0.94 : 0;

    this._resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      this.renderer.setSize(w, h, false);
      this.veilMaterial.uniforms.uResolution.value.set(w, h);
      const aspect = w / h;
      this.diamondCamera.aspect = aspect;
      this.diamondCamera.position.z = aspect < 0.75 ? 7.4
                                    : aspect < 1.0  ? 5.8
                                    : 6.2;
      this.diamondCamera.updateProjectionMatrix();
    };
    window.addEventListener("resize", this._resize);
    this._resize();

    this._startedAt = performance.now();
    this._active = true;
    this._loop();
  }

  _loop() {
    if (!this._active) return;
    this._rafId = requestAnimationFrame(() => this._loop());
    const t = (performance.now() - this._startedAt) / 1000;

    // Continuous slow spin — same rate as the entry-loader diamond so
    // the two moments feel like one instrument.
    this.diamond.rotation.y += 0.52 / 60;
    this.diamond.rotation.x  = -0.28 + Math.sin(t * 0.35) * 0.05;
    this._diamondMat.opacity = this.diamondOpacity.value;

    this.renderer.clear();
    this.renderer.render(this.veilScene, this.veilCamera);
    // Diamond only draws when it has any presence — skips a scene render
    // during the pure dissolve phases.
    if (this.diamondOpacity.value > 0.001) {
      this.renderer.render(this.diamondScene, this.diamondCamera);
    }
  }

  // ── Cover: dissolve 0 → 1, diamond fades in during the last 40% ────
  cover({ duration = 1.6, diamondHold = 0.65 } = {}) {
    return new Promise((resolve) => {
      const state = { d: this.veilMaterial.uniforms.uDissolve.value };
      const tl = gsap.timeline({ onComplete: resolve });
      tl.to(state, {
        d: 1.0,
        duration,
        ease: "power2.inOut",
        onUpdate: () => { this.veilMaterial.uniforms.uDissolve.value = state.d; },
      }, 0);
      tl.to(this.diamondOpacity, {
        value: 0.94,
        duration: duration * 0.45,
        ease: "power2.out",
      }, duration * 0.55);
      // Small hold with diamond visible before the promise resolves so
      // the visitor registers it as a beat rather than a strobe.
      tl.to({}, { duration: diamondHold }, ">");
    });
  }

  // ── Reveal: diamond fades out, then dissolve 1 → 0 ─────────────────
  reveal({ duration = 1.6, diamondFadeOut = 0.5 } = {}) {
    return new Promise((resolve) => {
      const state = { d: this.veilMaterial.uniforms.uDissolve.value };
      const tl = gsap.timeline({ onComplete: resolve });
      tl.to(this.diamondOpacity, {
        value: 0,
        duration: diamondFadeOut,
        ease: "power2.in",
      }, 0);
      tl.to(state, {
        d: 0.0,
        duration,
        ease: "power2.inOut",
        onUpdate: () => { this.veilMaterial.uniforms.uDissolve.value = state.d; },
      }, diamondFadeOut * 0.5);
    });
  }

  destroy() {
    this._active = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    if (this._resize) window.removeEventListener("resize", this._resize);
    if (this._veilGeom) this._veilGeom.dispose();
    if (this.veilMaterial) this.veilMaterial.dispose();
    if (this._diamondEdges) this._diamondEdges.dispose();
    if (this._diamondMat) this._diamondMat.dispose();
    if (this.renderer) this.renderer.dispose();
    if (this.canvas?.parentNode) this.canvas.parentNode.removeChild(this.canvas);
    this.canvas = null;
    this.renderer = null;
  }
}
