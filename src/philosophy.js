import * as THREE from "three";
import gsap from "gsap";
import { EffectComposer }   from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass }       from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass }  from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass }       from "three/examples/jsm/postprocessing/OutputPass.js";
import { createUnderwaterSystem } from "./three/underwater.js";
import logoUrl              from "./assets/holm new logo.svg?url";
import "./philosophy.css";

// ─── Tunables ────────────────────────────────────────────────────────
const IDLE_SPIN_SPEED    = 0.16;       // rad/s — never stops
const POS_LERP           = 0.09;       // per-frame lerp toward beat target (@60fps)
const SCROLL_TILT_MAX    = 0.18;       // rad — X tilt at scroll = 1

// ─── Fluid gradient backdrop tunables ────────────────────────────────
// Mobile GPUs choke on the fluid sim + display pass at half-res; drop to ~28%
// resolution on phones. The gradient is a soft background — the resolution
// hit is invisible but the frame-rate win is massive.
const _MOBILE_HINT       = typeof window !== "undefined"
  && (window.innerWidth < 768 || "ontouchstart" in window);
// Fluid backdrop is the user-facing surface — mobile keeps 0.42 so the
// gradient reads smooth. The diamond-side cuts (no bloom / no caustic /
// no watermark / no dispersion) more than compensate for the fill-rate
// cost of running the fluid at a higher resolution.
const FLUID_RES_SCALE   = _MOBILE_HINT ? 0.42 : 0.5;
const FLUID_BRUSH_SIZE  = 22.0;
const FLUID_BRUSH_STR   = 0.30;
const FLUID_DECAY       = 0.985;
const FLUID_TRAIL       = 0.90;
const FLUID_STOP_DECAY  = 0.92;
const FLUID_DISTORTION  = 1.6;
const FLUID_INTENSITY   = 0.72;
const FLUID_SOFTNESS    = 1.4;
// Palette aligned with the homepage: body bg, mid-dark transition,
// deep-royal floor navy, and the halo/logo brand cobalt as the peak.
// Ensures the fluid gradient reads as an extension of the same
// language the visitor just left in the museum.
// Matched to the About page palette — deep navy at the bottom, bright
// deep-blue at the top. Fluid sim breathes between them the same way
// About's two-stop gradient does, keeping the two pages visually kin.
const FLUID_COLOR_1     = "#070D23";   // near-black navy (About bottom)
const FLUID_COLOR_2     = "#050A3C";   // interpolated
const FLUID_COLOR_3     = "#040750";   // interpolated
const FLUID_COLOR_4     = "#030863";   // deep blue (About top)

// ─── Fluid shaders (adapted from an interactive-gradient reference) ──
const FLUID_VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FLUID_FRAG = /* glsl */`
uniform float     iTime;
uniform vec2      iResolution;
uniform vec4      iMouse;
uniform int       iFrame;
uniform sampler2D iPreviousFrame;
uniform float     uBrushSize;
uniform float     uBrushStrength;
uniform float     uFluidDecay;
uniform float     uTrailLength;
uniform float     uStopDecay;
varying vec2      vUv;

vec2 ur, U;

float ln(vec2 p, vec2 a, vec2 b) {
  return length(p - a - (b - a) * clamp(dot(p - a, b - a) / dot(b - a, b - a), 0.0, 1.0));
}
vec4 t(vec2 v, int a, int b) {
  return texture2D(iPreviousFrame, fract((v + vec2(float(a), float(b))) / ur));
}
vec4 t(vec2 v) {
  return texture2D(iPreviousFrame, fract(v / ur));
}
float area(vec2 a, vec2 b, vec2 c) {
  float A = length(b - c), B = length(c - a), C = length(a - b), s = 0.5 * (A + B + C);
  return sqrt(s * (s - A) * (s - B) * (s - C));
}

void main() {
  U  = vUv * iResolution;
  ur = iResolution.xy;
  if (iFrame < 1) {
    float w = 0.5 + sin(0.2 * U.x) * 0.5;
    float q = length(U - 0.5 * ur);
    gl_FragColor = vec4(0.1 * exp(-0.001 * q * q), 0.0, 0.0, w);
  } else {
    vec2 v = U,
         A = v + vec2( 1.0,  1.0),
         B = v + vec2( 1.0, -1.0),
         C = v + vec2(-1.0,  1.0),
         D = v + vec2(-1.0, -1.0);
    for (int i = 0; i < FLUID_ITER; i++) {
      v -= t(v).xy;
      A -= t(A).xy;
      B -= t(B).xy;
      C -= t(C).xy;
      D -= t(D).xy;
    }
    vec4 me = t(v);
    vec4 n = t(v, 0, 1),
         e = t(v, 1, 0),
         s = t(v, 0, -1),
         w = t(v, -1, 0);
    vec4 ne = 0.25 * (n + e + s + w);
    me = mix(t(v), ne, vec4(0.15, 0.15, 0.95, 0.0));
    me.z = me.z - 0.01 * ((area(A, B, C) + area(B, C, D)) - 4.0);
    vec4 pr = vec4(e.z, w.z, n.z, s.z);
    me.xy = me.xy + 100.0 * vec2(pr.x - pr.y, pr.z - pr.w) / ur;
    me.xy *= uFluidDecay;
    me.z  *= uTrailLength;

    if (iMouse.z > 0.0) {
      vec2  mousePos = iMouse.xy;
      vec2  mousePrev = iMouse.zw;
      vec2  mouseVel = mousePos - mousePrev;
      float velMag   = length(mouseVel);
      float q        = ln(U, mousePos, mousePrev);
      vec2  m        = mousePos - mousePrev;
      float l        = length(m);
      if (l > 0.0) m = min(l, 10.0) * m / l;
      float brushSizeFactor = 1e-4 / uBrushSize;
      float strengthFactor  = 0.03 * uBrushStrength;
      float falloff = exp(-brushSizeFactor * q * q * q);
      falloff = pow(falloff, 0.5);
      me.xyw += strengthFactor * falloff * vec3(m, 10.0);
      if (velMag < 2.0) {
        float distToCursor = length(U - mousePos);
        float influence    = exp(-distToCursor * 0.01);
        float cursorDecay  = mix(1.0, uStopDecay, influence);
        me.xy *= cursorDecay;
        me.z  *= cursorDecay;
      }
    }
    gl_FragColor = clamp(me, -0.4, 0.4);
  }
}
`;

const FLUID_DISPLAY_FRAG = /* glsl */`
uniform float     iTime;
uniform vec2      iResolution;
uniform sampler2D iFluid;
uniform float     uDistortionAmount;
uniform vec3      uColor1;
uniform vec3      uColor2;
uniform vec3      uColor3;
uniform vec3      uColor4;
uniform float     uColorIntensity;
uniform float     uSoftness;
varying vec2      vUv;

void main() {
  vec2 fragCoord = vUv * iResolution;
  vec4 fluid = texture2D(iFluid, vUv);
  vec2 fluidVel = fluid.xy;
  float mr = min(iResolution.x, iResolution.y);
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / mr;
  uv += fluidVel * (0.5 * uDistortionAmount);

  float d = -iTime * 0.5;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += iTime * 0.5;

  float mixer1 = cos(uv.x * d) * 0.5 + 0.5;
  float mixer2 = cos(uv.y * a) * 0.5 + 0.5;
  float mixer3 = sin(d + a) * 0.5 + 0.5;

  float smoothAmount = clamp(uSoftness * 0.1, 0.0, 0.9);
  mixer1 = mix(mixer1, 0.5, smoothAmount);
  mixer2 = mix(mixer2, 0.5, smoothAmount);
  mixer3 = mix(mixer3, 0.5, smoothAmount);

  vec3 col = mix(uColor1, uColor2, mixer1);
  col = mix(col, uColor3, mixer2);
  col = mix(col, uColor4, mixer3 * 0.4);
  col *= uColorIntensity;
  gl_FragColor = vec4(col, 1.0);
}
`;

function hexToVec3(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return new THREE.Vector3(r, g, b);
}
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

// ─── Particle diamond — surface sample + facet-normal B/W shader ────
const PARTICLE_COUNT     = 6500;    // surface samples — no interior blob
const EDGE_PARTICLE_MULT = 0.55;    // extra points snapped to edges
const PARTICLE_NOISE_AMP = 0.012;   // small — just breath, not blur
const MOUSE_REPEL_RADIUS = 1.05;
const MOUSE_REPEL_FORCE  = 0.35;
const MOUSE_LERP         = 0.16;
const POINT_SIZE_SCALE   = 320.0;

const PARTICLE_VERT = /* glsl */`
attribute vec3  aNormal;
attribute float aSeed;
attribute float aEdge;              // 1.0 for edge-snapped points, 0.0 for surface
uniform   float uTime;
uniform   vec3  uMouseLocal;
uniform   float uPixel;
varying   float vShade;
varying   float vRepel;
varying   float vEdge;
varying   float vSeed;

void main() {
  vec3 base = position;

  // Tiny idle wobble along the local normal so the surface breathes
  float breathe = sin(uTime * 0.6 + aSeed * 9.3) * ${PARTICLE_NOISE_AMP.toFixed(4)};
  base += aNormal * breathe;

  // Mouse repel — along the local normal for a "poke" feel
  vec3  toMouse = base - uMouseLocal;
  float d       = length(toMouse);
  float repel   = 0.0;
  if (d < ${MOUSE_REPEL_RADIUS.toFixed(4)}) {
    float t = 1.0 - d / ${MOUSE_REPEL_RADIUS.toFixed(4)};
    repel   = t * t;
    base   += normalize(toMouse + vec3(0.0001)) * repel * ${MOUSE_REPEL_FORCE.toFixed(4)};
  }

  vec4 mv = modelViewMatrix * vec4(base, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPixel * (${POINT_SIZE_SCALE.toFixed(1)} / -mv.z)
                 * (1.0 + repel * 0.9)
                 * (1.0 + aEdge * 0.6);

  // Facet shading — normal in view space vs view direction
  vec3 nView = normalize(mat3(normalMatrix) * aNormal);
  vec3 vDir  = normalize(-mv.xyz);
  float ndotv = clamp(dot(nView, vDir), 0.0, 1.0);
  float fres  = pow(1.0 - ndotv, 2.6);           // rim highlight

  // B/W grayscale ramp: dark interior → mid facet → bright at rim/edge
  vShade = 0.06 + ndotv * 0.42 + fres * 0.72;
  vShade = clamp(vShade, 0.0, 1.0);
  vRepel = repel;
  vEdge  = aEdge;
  vSeed  = aSeed;
}
`;

const PARTICLE_FRAG = /* glsl */`
uniform float uTime;
varying float vShade;
varying float vRepel;
varying float vEdge;
varying float vSeed;

void main() {
  vec2  c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;

  // Soft sprite with a hot core
  float core  = pow(1.0 - d * 2.0, 1.7);
  float alpha = core * vShade;

  // Edge-snapped points punch harder so facet borders read clearly
  alpha *= (1.0 + vEdge * 0.9);

  // Tiny per-particle twinkle — keeps the surface alive without glitter
  float twinkle = 0.85 + 0.15 * sin(vSeed * 43.1 + uTime * 1.4);
  alpha *= twinkle;

  // Repel adds a whisper of warmth — otherwise strictly grayscale
  vec3 col = mix(vec3(vShade), vec3(1.02, 0.94, 0.82), vRepel * 0.6);

  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`;

// Sample points on the brilliant-cut *surface*, area-weighted, with each
// point carrying its face normal. Also snap a fraction of them to facet
// edges so the outline reads sharply.
function sampleDiamondSurface(mesh, surfaceCount, edgeCount) {
  const geom    = mesh.geometry;
  const posAttr = geom.getAttribute("position");
  const idxAttr = geom.getIndex();
  const triN    = idxAttr.count / 3;

  const v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
  const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), n = new THREE.Vector3();

  const areas = new Float32Array(triN);
  const norms = [];
  let total = 0;
  for (let t = 0; t < triN; t++) {
    v0.fromBufferAttribute(posAttr, idxAttr.getX(t * 3    ));
    v1.fromBufferAttribute(posAttr, idxAttr.getX(t * 3 + 1));
    v2.fromBufferAttribute(posAttr, idxAttr.getX(t * 3 + 2));
    e1.subVectors(v1, v0);
    e2.subVectors(v2, v0);
    n.copy(e1).cross(e2);
    const area = n.length() * 0.5;
    areas[t] = area;
    total += area;
    n.normalize();
    norms.push([n.x, n.y, n.z]);
  }

  const totalCount = surfaceCount + edgeCount;
  const positions  = new Float32Array(totalCount * 3);
  const normals    = new Float32Array(totalCount * 3);
  const seeds      = new Float32Array(totalCount);
  const edgeMark   = new Float32Array(totalCount);

  const write = (i, p, nrm, isEdge) => {
    positions[i * 3    ] = p[0];
    positions[i * 3 + 1] = p[1];
    positions[i * 3 + 2] = p[2];
    normals  [i * 3    ] = nrm[0];
    normals  [i * 3 + 1] = nrm[1];
    normals  [i * 3 + 2] = nrm[2];
    seeds[i]    = Math.random();
    edgeMark[i] = isEdge;
  };

  // Interior barycentric samples
  for (let i = 0; i < surfaceCount; i++) {
    let r = Math.random() * total;
    let ti = 0;
    while (r > areas[ti] && ti < triN - 1) { r -= areas[ti]; ti++; }
    const a = idxAttr.getX(ti * 3    );
    const b = idxAttr.getX(ti * 3 + 1);
    const c = idxAttr.getX(ti * 3 + 2);
    v0.fromBufferAttribute(posAttr, a);
    v1.fromBufferAttribute(posAttr, b);
    v2.fromBufferAttribute(posAttr, c);
    let u = Math.random(), vv = Math.random();
    if (u + vv > 1) { u = 1 - u; vv = 1 - vv; }
    const px = v0.x + u * (v1.x - v0.x) + vv * (v2.x - v0.x);
    const py = v0.y + u * (v1.y - v0.y) + vv * (v2.y - v0.y);
    const pz = v0.z + u * (v1.z - v0.z) + vv * (v2.z - v0.z);
    write(i, [px, py, pz], norms[ti], 0.0);
  }

  // Edge-snapped samples — points along the shared edges of each triangle
  for (let i = 0; i < edgeCount; i++) {
    const ti = Math.floor(Math.random() * triN);
    const a = idxAttr.getX(ti * 3    );
    const b = idxAttr.getX(ti * 3 + 1);
    const c = idxAttr.getX(ti * 3 + 2);
    v0.fromBufferAttribute(posAttr, a);
    v1.fromBufferAttribute(posAttr, b);
    v2.fromBufferAttribute(posAttr, c);
    // Pick one of three edges, then a random position along it
    const eIdx = Math.floor(Math.random() * 3);
    const pA = eIdx === 0 ? v0 : (eIdx === 1 ? v1 : v2);
    const pB = eIdx === 0 ? v1 : (eIdx === 1 ? v2 : v0);
    const s  = Math.random();
    const px = pA.x + (pB.x - pA.x) * s;
    const py = pA.y + (pB.y - pA.y) * s;
    const pz = pA.z + (pB.z - pA.z) * s;
    write(surfaceCount + i, [px, py, pz], norms[ti], 1.0);
  }

  return { positions, normals, seeds, edgeMark };
}

const MANIFESTO = [
  ["Some studios tell stories.",                    "We work toward a single moment."],
  ["The moment a rough idea holds still —",         "and becomes something finished."],
  ["It is rare. It forms under pressure.",          "The way carbon becomes a diamond."],
  ["So that is the shape we keep returning to.",    "Not decoration. A reminder of what we are after."],
  ["Between sketch and masterpiece,",               "there is patience."],
  ["Ready to create your moment."],
];

// Split a stanza line into per-word masks + per-char spans, so the reveal
// can stagger characters upward without breaking natural word wrap.
function splitLineToChars(text) {
  return text.split(" ").map((word) => {
    if (!word) return "";
    const chars = Array.from(word).map((ch) => {
      const safe = ch
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<span class="holm-philosophy__char">${safe}</span>`;
    }).join("");
    return `<span class="holm-philosophy__word">${chars}</span>`;
  }).join(" ");
}

// Closing CTA — appended after the last stanza inside the final beat
const CTA_LABEL = "Let's talk";
const CTA_HREF  = "/contact/";

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
    this._lights    = [];
    this._heroPlane = null;            // philosophy watermark plane

    // DOM
    this.container = null;
    this.canvas    = null;
    this.blocks    = [];               // beat sections carrying stanzas

    // Anim state
    this._rafId       = null;
    this._active      = false;
    this._prevTime    = 0;
    this._scrollT     = 0;
    this._idleSpin    = 0;
    // CTA magnetic
    this._ctaEl          = null;
    this._ctaMove        = null;
    this._ctaLeave       = null;
    this._ctaSetX        = null;
    this._ctaSetY        = null;
    this._ctaInnerSetX   = null;
    this._ctaInnerSetY   = null;

    // Diamond target (world-space) and current smoothed values
    this._targetPos   = new THREE.Vector3();
    this._targetScale = new THREE.Vector3(1, 1, 1);
    this._targetTilt  = 0;
    this._pressure    = 0;             // 0..1 — how compressed the diamond is

    // Mouse (interactive particle repel)
    this._mouseNdc         = new THREE.Vector2(-99, -99);   // off-screen until move
    this._mouseWorld       = new THREE.Vector3();
    this._mouseWorldSmooth = new THREE.Vector3(999, 999, 999);
    this._invMat           = new THREE.Matrix4();
    this._pointerActive    = false;   // set once the pointer has moved

    // Elapsed time driven off dt so we're timeline-consistent
    this._elapsed = 0;

    // Fluid gradient backdrop
    this._fluidQuadCam    = null;
    this._fluidQuadScene  = null;
    this._fluidQuadMesh   = null;
    this._fluidMat        = null;
    this._displayMat      = null;
    this._fluidTargetA    = null;
    this._fluidTargetB    = null;
    this._displayTarget   = null;
    this._fluidFrame      = 0;
    this._mousePx         = new THREE.Vector2(0, 0);
    this._prevMousePx     = new THREE.Vector2(0, 0);
    this._lastMouseMoveMs = 0;

    // Handlers
    this._onResize       = this._onResize.bind(this);
    this._onLenisScroll  = this._onLenisScroll.bind(this);
    this._onNativeScroll = this._onNativeScroll.bind(this);
    this._onPointerMove  = this._onPointerMove.bind(this);
    this._observer       = null;
  }

  // ── Public API ──────────────────────────────────────────────────
  init() {
    this._createDOM();
    this._createThree();
    this._bindScroll();
    this._bindResize();
    this._bindPointer();
    this._observeBlocks();
    this._bindCtaMagnetic();
    this._startLoop();
  }

  _bindPointer() {
    window.addEventListener("pointermove", this._onPointerMove, { passive: true });
  }
  _onPointerMove(e) {
    this._mouseNdc.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -((e.clientY / window.innerHeight) * 2 - 1),
    );
    this._pointerActive = true;
    this._underwater?.setMouseNorm(
      e.clientX / window.innerWidth,
      1 - e.clientY / window.innerHeight,
    );
    // Fluid input is in the fluid-sim texel space (half-viewport res, y-up)
    if (this._fluidMat) {
      const w = window.innerWidth,  h = window.innerHeight;
      const sx = e.clientX * FLUID_RES_SCALE;
      const sy = (h - e.clientY) * FLUID_RES_SCALE;
      this._prevMousePx.copy(this._mousePx);
      this._mousePx.set(sx, sy);
      this._lastMouseMoveMs = performance.now();
      this._fluidMat.uniforms.iMouse.value.set(
        this._mousePx.x, this._mousePx.y,
        this._prevMousePx.x, this._prevMousePx.y,
      );
    }
  }

  destroy() {
    this._active = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("pointermove", this._onPointerMove);
    if (this.lenis && this._lenisScrollBound) {
      this.lenis.off("scroll", this._onLenisScroll);
    } else {
      window.removeEventListener("scroll", this._onNativeScroll);
    }
    if (this._observer)  this._observer.disconnect();
    if (this._ctaMove)  window.removeEventListener("mousemove", this._ctaMove);
    if (this._ctaLeave) window.removeEventListener("mouseleave", this._ctaLeave);

    if (this.diamond) {
      // Geometry is a shared cache entry (see _getBrilliantGeometry) — don't
      // dispose it here or a re-entry of the page would rebuild it and defeat
      // the whole cache. Material is per-instance.
      this.diamond.material.dispose();
    }
    if (this._heroPlane) {
      this._heroPlane.geometry.dispose();
      this._heroPlane.material.uniforms?.uTextMap?.value?.dispose();
      this._heroPlane.material.dispose();
    }
    if (this._causticPlane) {
      this._causticPlane.geometry.dispose();
      this._causticPlane.material.dispose();
    }
    if (this.envMap) this.envMap.dispose();
    for (const l of this._lights) this.scene?.remove(l);

    // Fluid resources
    this._fluidTargetA?.dispose();
    this._fluidTargetB?.dispose();
    this._displayTarget?.dispose();
    this._fluidMat?.dispose();
    this._displayMat?.dispose();
    // Underwater + gradient
    this._underwater?.dispose?.();
    this._bgGradient?.dispose?.();
    this._fluidQuadMesh?.geometry?.dispose();

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
    if (this._reducedMotion) container.classList.add("is-reduced-motion");

    // Text-bearing beats get MANIFESTO stanzas in order
    let textCounter = 0;
    const beatsHtml = BEATS
      .map((beat, scrollIdx) => {
        if (!beat.hasText) return "";
        const stanza  = MANIFESTO[textCounter];
        const isFinal = textCounter === MANIFESTO.length - 1;
        textCounter++;
        const stanzaLines = stanza.map(line => `
          <div class="holm-philosophy__line">${splitLineToChars(line)}</div>
        `).join("");
        const ctaHtml = isFinal ? `
          <a class="holm-philosophy__cta"
             href="${CTA_HREF}"
             aria-label="${CTA_LABEL}"
             data-hover-roll>${CTA_LABEL}</a>
        ` : "";
        return `
          <section class="holm-philosophy__beat"
                   data-beat="${scrollIdx}"
                   data-side="${beat.side}"
                   data-final="${isFinal}">
            <div class="holm-philosophy__stanza">
              ${stanzaLines}
              ${ctaHtml}
            </div>
          </section>
        `;
      }).join("");

    container.innerHTML = `
      <canvas class="holm-philosophy__canvas" aria-hidden="true"></canvas>

      <a class="holm-philosophy__brand" href="/" aria-label="HOLM — home">
        <img src="${logoUrl}" alt="HOLM" />
      </a>

      <section class="holm-philosophy__intro" data-beat="0" aria-hidden="true"></section>

      <main id="philosophy-content"
            class="holm-philosophy__beats"
            tabindex="-1"
            aria-label="HOLM philosophy — six-part manifesto">
        ${beatsHtml}
      </main>
    `;
    document.body.appendChild(container);

    this.container = container;
    this.canvas    = container.querySelector(".holm-philosophy__canvas");
    this.blocks    = [...container.querySelectorAll(".holm-philosophy__beat")];
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
      const allChars = container.querySelectorAll(".holm-philosophy__char");
      gsap.set(allChars, { yPercent: 115, opacity: 0 });
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
    // Cap the DPR aggressively on mobile — 1.0 keeps the fluid + transmission
    // fill-rate manageable without a visible sharpness drop for a soft
    // gradient + glass composition.
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this._isMobile ? 1.0 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.75;
    this.renderer.outputColorSpace    = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    // Static two-stop gradient — matches the About page exactly. The
    // fluid simulation is intentionally NOT initialised here so it
    // doesn't burn GPU cycles rendering into a target nothing samples.
    // Cached so other passes (hero plane, dispersion) can sample the
    // same texture in place of the retired fluid displayTarget.
    this._bgGradient       = this._makeGradientTexture("#030863", "#070D23");
    this.scene.background  = this._bgGradient;

    this.camera = new THREE.PerspectiveCamera(
      36, window.innerWidth / window.innerHeight, 0.1, 100,
    );
    this.camera.position.set(0, 0, CAM_Z_BASE);
    this.camera.lookAt(0, 0, 0);

    // Bespoke studio HDRI — a small procedural scene of bright emissive
    // spheres (HDR color values > 1) baked through PMREM. Small, sharp
    // sources give the diamond characteristic per-facet sparkle when it
    // rotates; a soft dark-blue sky sphere prevents the reflections from
    // reading gray. Baked once, then disposed.
    const pmrem      = new THREE.PMREMGenerator(this.renderer);
    const envScene   = this._buildStudioEnvScene();
    this.envMap      = pmrem.fromScene(envScene, 0.02).texture;
    envScene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    pmrem.dispose();
    this.scene.environment          = this.envMap;
    this.scene.environmentIntensity = 1.5;

    // Composer — bloom is desktop-only. On mobile the transmission +
    // fluid + dispersion budget is already tight; an extra fullscreen
    // bloom pass would push us into a stutter zone with negligible visual
    // gain on small screens.
    this._composer = new EffectComposer(this.renderer);
    this._composer.setPixelRatio(this.renderer.getPixelRatio());
    this._composer.setSize(window.innerWidth, window.innerHeight);
    this._composer.addPass(new RenderPass(this.scene, this.camera));
    if (!this._isMobile) {
      this._bloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.18,   // strength
        0.22,   // radius
        0.92,   // threshold
      );
      this._composer.addPass(this._bloom);
    }
    // Underwater (caustics + refraction + tint) — same treatment About
    // uses so the two pages share the same living-liquid backdrop feel.
    this._underwater = createUnderwaterSystem(this.renderer, { isMobile: this._isMobile });
    this._composer.addPass(this._underwater.pass);
    this._composer.addPass(new OutputPass());

    // Caustic halo — desktop-only. It's an extra shader-plane draw with
    // a 4-iteration noise loop per pixel; small quality lift, real cost.
    if (!this._isMobile) this._createCausticPlane();

    // Diamond
    this._createDiamond();

    // "philosophy" watermark plane — desktop-only. The plane samples the
    // fluid texture per-pixel and does chromatic aberration on 3 lookups
    // of the text atlas; on mobile this is a large fill-rate hit that
    // isn't worth the decorative gain.
    if (!this._isMobile) this._createHeroPlane();

    // Lights
    this._addLights();
  }

  // Bespoke studio-lighting scene — bright emissive spheres with HDR-range
  // colors (multiplied past 1.0) around a soft dark-blue sky sphere. When
  // baked through PMREM, small sources become the sharp highlights the
  // diamond's facets sample; the sky keeps ambient reflections in the
  // cool palette that matches the fluid backdrop.
  _buildStudioEnvScene() {
    const s = new THREE.Scene();

    // Sky sphere — inside-out, vertical gradient with the site's palette
    const skyGeo = new THREE.SphereGeometry(30, 24, 12);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: /* glsl */`
        varying vec3 vP;
        void main() {
          vP = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        varying vec3 vP;
        void main() {
          vec3 d = normalize(vP);
          float t = d.y * 0.5 + 0.5;
          // Neutral dark ambient — bright enough that facets never fall
          // to pure black between hot spots, dim enough that the light
          // sources still dominate. This is what stops the gem from
          // reading matte.
          vec3 top = vec3(0.05, 0.055, 0.070);
          vec3 bot = vec3(0.010, 0.010, 0.014);
          gl_FragColor = vec4(mix(bot, top, t), 1.0);
        }
      `,
    });
    s.add(new THREE.Mesh(skyGeo, skyMat));

    const addLight = (x, y, z, colorHex, mult, size) => {
      const g = new THREE.SphereGeometry(size, 12, 8);
      const m = new THREE.MeshBasicMaterial({ color: colorHex });
      m.color.multiplyScalar(mult);
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(x, y, z);
      s.add(mesh);
    };

    // Three-point WHITE studio rig — a real diamond reads as colorless;
    // any color you see is dispersion splitting white light. So the env
    // stays 90% neutral white; warm/cool accents are small and low.
    addLight( 7,  6,  5, 0xffffff, 45, 0.85);   // Key (upper right)
    addLight(-6,  3,  4, 0xf6f8ff, 24, 1.2);    // Fill (upper left, hint cool)
    addLight( 0,  6, -7, 0xffffff, 30, 0.9);    // Rim (behind top)

    // Subtle temperature accents — small enough not to tint the whole gem,
    // just to give the pavilion a little warm/cool life
    addLight( 5, -2,  4, 0xffd8a0, 14, 0.45);   // warm accent, lower right
    addLight(-6, -1,  3, 0xa8c8ff, 14, 0.45);   // cool accent, lower left

    // Pinpoint white sparks — the "fire" the bloom pass turns into stars
    addLight(-11,  1,  0, 0xffffff, 65, 0.2);
    addLight( 11,  1,  0, 0xffffff, 65, 0.2);
    addLight(  0, -3,  9, 0xffffff, 40, 0.3);

    return s;
  }

  // Caustic halo plane — a soft radial "underwater light" pattern that
  // trails the diamond's XY position. Additively blended, low intensity;
  // its purpose is atmospheric — a hint that the gem is projecting energy
  // rather than a hard visual feature.
  _createCausticPlane() {
    const geo = new THREE.PlaneGeometry(5.0, 5.0, 1, 1);
    const mat = new THREE.ShaderMaterial({
      transparent:  true,
      depthWrite:   false,
      blending:     THREE.AdditiveBlending,
      uniforms: {
        uTime:      { value: 0 },
        uIntensity: { value: 0.55 },
      },
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uTime;
        uniform float uIntensity;
        varying vec2  vUv;

        // Caustic pattern — classic domain-warped noise (public-domain
        // technique commonly attributed to David Hoskins). Cheap: 4 iters.
        float caustic(vec2 uv, float t) {
          vec2 p = mod(uv * 6.28318 - 250.0, 6.28318) - 250.0;
          vec2 i = p;
          float c    = 1.0;
          float inten = 0.006;
          for (int n = 0; n < 4; n++) {
            float ti = t + float(n) * 0.42;
            i = p + vec2(cos(ti - i.x) + sin(ti + i.y),
                         sin(ti - i.y) + cos(ti + i.x));
            c += 1.0 / length(vec2(p.x / (sin(i.x + ti) / inten),
                                   p.y / (cos(i.y + ti) / inten)));
          }
          c /= 4.0;
          c  = 1.17 - pow(c, 1.4);
          return pow(abs(c), 7.0);
        }

        void main() {
          vec2  uv     = vUv - 0.5;
          float r      = length(uv);
          // Radial mask — bright right around the gem, gone by the edges
          float halo   = smoothstep(0.5, 0.03, r);
          float caus   = caustic(uv * 0.9, uTime * 0.16);
          // Cool blue that echoes the fluid backdrop palette
          vec3  tint   = vec3(0.38, 0.60, 1.00);
          float energy = caus * halo * uIntensity;
          gl_FragColor = vec4(tint * energy, energy * 0.75);
        }
      `,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = -1.2;
    mesh.renderOrder = -1;   // renders before the diamond → visible through refraction
    this._causticPlane = mesh;
    this.scene.add(mesh);
  }

  _createHeroPlane() {
    const cv  = document.createElement("canvas");
    cv.width  = 2560;
    cv.height = 640;
    const ctx = cv.getContext("2d");

    // Canvas defaults to fully transparent — draw as pure white; the
    // shader tints it. Higher alpha because the shader now controls
    // final opacity (was baked into the canvas before).
    ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
    ctx.font = "italic 300 480px 'Fraunces', 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("philosophy", cv.width / 2, cv.height / 2 + 30);

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter  = THREE.LinearFilter;
    tex.magFilter  = THREE.LinearFilter;
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    // Shader material — the watermark rides the same fluid as the backdrop:
    //   • fluid velocity distorts the text UVs (letters ripple with the flow)
    //   • a traveling sine adds an ambient wobble even when fluid is calm
    //   • the cursor emits a radial ring that warps nearby letters
    //   • chromatic aberration splits R/B channels along the flow, so
    //     glyphs read as light refracting through liquid
    const mat = new THREE.ShaderMaterial({
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform sampler2D uTextMap;
        uniform sampler2D uFluidMap;
        uniform float     uTime;
        uniform vec2      uMouseUv;
        uniform float     uCursorFocus;
        uniform float     uOpacity;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;

          // Fluid velocity as a base flow field distorting the letters
          vec4 fluid   = texture2D(uFluidMap, uv);
          vec2 flow    = fluid.xy;
          float flowMag = length(flow);

          // Ambient traveling wave — two sines running in orthogonal
          // directions so the whole word slowly breathes
          vec2 wave = vec2(
            sin(uv.y * 26.0 + uTime * 1.15) * 0.010,
            sin(uv.x * 18.0 - uTime * 0.85) * 0.007
          );

          // Cursor ring — radial ripple emanating from the pointer
          vec2 fromCursor = uv - uMouseUv;
          fromCursor.x *= 4.0;   // watermark is ~4:1, unwarp for round rings
          float cd = length(fromCursor);
          vec2 ripple = vec2(0.0);
          float cursorMask = 0.0;
          if (uCursorFocus > 0.001) {
            float ringPhase = cd * 34.0 - uTime * 3.6;
            float ringFall  = exp(-cd * 3.4);
            vec2  dir       = fromCursor / max(cd, 1e-4);
            ripple    = dir * sin(ringPhase) * ringFall * 0.020 * uCursorFocus;
            cursorMask = smoothstep(0.55, 0.0, cd) * uCursorFocus;
          }

          vec2 distorted = uv + wave + flow * 0.14 + ripple;

          // Chromatic aberration — grows with fluid velocity + near cursor
          float ab  = 0.0025 + flowMag * 0.055 + cursorMask * 0.014;
          float aR  = texture2D(uTextMap, distorted + vec2( ab, 0.0)).a;
          float aG  = texture2D(uTextMap, distorted).a;
          float aB  = texture2D(uTextMap, distorted - vec2( ab, 0.0)).a;

          // Base tint — pure black; cursor bleeds a whisper of warmth in
          vec3 cool = vec3(0.00, 0.00, 0.00);
          vec3 warm = vec3(0.06, 0.04, 0.03);
          vec3 tint = mix(cool, warm, cursorMask * 0.85);

          vec3 col   = tint * vec3(aR, aG, aB);
          float alpha = max(max(aR, aG), aB);

          // Black watermark needs more presence to read against the fluid
          alpha *= 0.72 + cursorMask * 0.28;
          alpha *= uOpacity;

          gl_FragColor = vec4(col, alpha);
        }
      `,
      uniforms: {
        uTextMap:     { value: tex },
        uFluidMap:    { value: this._bgGradient },
        uTime:        { value: 0 },
        uMouseUv:     { value: new THREE.Vector2(-2, -2) },
        uCursorFocus: { value: 0 },
        uOpacity:     { value: 1 },
      },
      transparent: true,
      depthWrite:  false,
    });

    // Size the plane to comfortably fill the visible area at its depth.
    // Camera is at z=CAM_Z_BASE, plane sits at z=-8 → distance = camZ+8.
    const HERO_Z = -8;
    const dist   = CAM_Z_BASE - HERO_Z;
    const halfFov = (this.camera.fov * Math.PI) / 360;
    const halfH   = Math.tan(halfFov) * dist;
    const halfW   = halfH * this.camera.aspect;
    const width   = Math.max(halfW * 2 * 1.15, 20);
    const height  = width / (cv.width / cv.height);

    // Higher subdivision so the traveling wave and cursor ring look smooth.
    // Mobile: cut way down — the ripple is very subtle at phone sizes and
    // ~2300 verts here isn't worth the vertex cost during the intro fade.
    const seg = this._isMobile ? [32, 8] : [96, 24];
    const geo = new THREE.PlaneGeometry(width, height, seg[0], seg[1]);
    this._heroPlane = new THREE.Mesh(geo, mat);
    this._heroPlane.position.z = HERO_Z;
    this._heroPlane.renderOrder = -1;
    // Store what the render-loop needs to map the cursor onto the plane
    this._heroPlaneSize  = { w: width, h: height, z: HERO_Z };
    this._heroPlaneMath  = new THREE.Plane(new THREE.Vector3(0, 0, 1), -HERO_Z);
    this._heroRaycaster  = new THREE.Raycaster();
    this._heroHitPoint   = new THREE.Vector3();
    this.scene.add(this._heroPlane);
  }

  // ── Fluid gradient backdrop ────────────────────────────────────
  // Ping-pong fluid simulation at half-viewport-res, dispatched every
  // frame BEFORE the composer renders the diamond scene. The display
  // pass output is written into a persistent render target whose
  // texture is set as scene.background — so the diamond's transmission
  // refracts a live black + blue gradient that flows on its own and
  // reacts to the cursor.
  // Vertical two-stop gradient rendered into a canvas texture. Same
  // helper as About uses so both pages share exactly one visual recipe.
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
    tex.colorSpace  = THREE.SRGBColorSpace;
    tex.minFilter   = THREE.LinearFilter;
    tex.magFilter   = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }

  _initFluid() {
    const w = Math.max(2, Math.floor(window.innerWidth  * FLUID_RES_SCALE));
    const h = Math.max(2, Math.floor(window.innerHeight * FLUID_RES_SCALE));

    const rtOpts = {
      minFilter:  THREE.LinearFilter,
      magFilter:  THREE.LinearFilter,
      format:     THREE.RGBAFormat,
      type:       THREE.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };
    this._fluidTargetA  = new THREE.WebGLRenderTarget(w, h, rtOpts);
    this._fluidTargetB  = new THREE.WebGLRenderTarget(w, h, rtOpts);
    this._displayTarget = new THREE.WebGLRenderTarget(w, h, {
      ...rtOpts,
      type: THREE.UnsignedByteType,
    });
    this._fluidCurrent = this._fluidTargetA;
    this._fluidPrev    = this._fluidTargetB;

    this._fluidMat = new THREE.ShaderMaterial({
      vertexShader:   FLUID_VERT,
      fragmentShader: FLUID_FRAG,
      defines: {
        // Mobile: 4 advection steps instead of 8. Halves the per-pixel
        // texture reads inside the fluid pass with no perceivable quality
        // change on the soft gradient we display through it.
        FLUID_ITER: this._isMobile ? 4 : 8,
      },
      uniforms: {
        iTime:          { value: 0 },
        iResolution:    { value: new THREE.Vector2(w, h) },
        iMouse:         { value: new THREE.Vector4(0, 0, 0, 0) },
        iFrame:         { value: 0 },
        iPreviousFrame: { value: null },
        uBrushSize:     { value: FLUID_BRUSH_SIZE },
        uBrushStrength: { value: FLUID_BRUSH_STR },
        uFluidDecay:    { value: FLUID_DECAY },
        uTrailLength:   { value: FLUID_TRAIL },
        uStopDecay:     { value: FLUID_STOP_DECAY },
      },
    });

    this._displayMat = new THREE.ShaderMaterial({
      vertexShader:   FLUID_VERT,
      fragmentShader: FLUID_DISPLAY_FRAG,
      uniforms: {
        iTime:             { value: 0 },
        iResolution:       { value: new THREE.Vector2(w, h) },
        iFluid:            { value: null },
        uDistortionAmount: { value: FLUID_DISTORTION },
        uColor1:           { value: hexToVec3(FLUID_COLOR_1) },
        uColor2:           { value: hexToVec3(FLUID_COLOR_2) },
        uColor3:           { value: hexToVec3(FLUID_COLOR_3) },
        uColor4:           { value: hexToVec3(FLUID_COLOR_4) },
        uColorIntensity:   { value: FLUID_INTENSITY },
        uSoftness:         { value: FLUID_SOFTNESS },
      },
    });

    this._fluidQuadCam   = new THREE.Camera();
    this._fluidQuadScene = new THREE.Scene();
    this._fluidQuadMesh  = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this._fluidMat);
    this._fluidQuadScene.add(this._fluidQuadMesh);

    this._bgGradient.colorSpace = THREE.SRGBColorSpace;
  }

  _stepFluid(elapsed) {
    if (!this._fluidMat) return;

    // Mobile: run the fluid sim every other frame. The gradient reads as
    // continuous motion at ~30Hz because the display pass is a smooth
    // function of the state — halving the update rate is invisible but
    // roughly halves the fluid-sim GPU cost.
    if (this._isMobile && (this._fluidFrame & 1) === 1) {
      this._fluidFrame++;
      return;
    }

    // Cursor input: if it's been quiet for >100ms, zero the input
    if (performance.now() - this._lastMouseMoveMs > 100) {
      this._fluidMat.uniforms.iMouse.value.set(0, 0, 0, 0);
    }
    this._fluidMat.uniforms.iTime.value          = elapsed;
    this._fluidMat.uniforms.iFrame.value         = this._fluidFrame;
    this._fluidMat.uniforms.iPreviousFrame.value = this._fluidPrev.texture;

    // Fluid advection pass → current target
    this._fluidQuadMesh.material = this._fluidMat;
    this.renderer.setRenderTarget(this._fluidCurrent);
    this.renderer.clear();
    this.renderer.render(this._fluidQuadScene, this._fluidQuadCam);

    // Display pass reads the fluid state, writes the colored gradient
    this._displayMat.uniforms.iTime.value  = elapsed;
    this._displayMat.uniforms.iFluid.value = this._fluidCurrent.texture;
    this._fluidQuadMesh.material = this._displayMat;
    this.renderer.setRenderTarget(this._displayTarget);
    this.renderer.clear();
    this.renderer.render(this._fluidQuadScene, this._fluidQuadCam);

    this.renderer.setRenderTarget(null);

    // Swap for next frame
    const tmp = this._fluidCurrent;
    this._fluidCurrent = this._fluidPrev;
    this._fluidPrev    = tmp;
    this._fluidFrame++;
  }

  _createDiamond() {
    // Brilliant-cut mesh — proper diamond proportions (wide girdle, shallow
    // crown, deeper pavilion). N sides at each ring; each triangle carries
    // its own vertex copies so computeVertexNormals gives per-face normals
    // — the crown/pavilion facets read as hard, planar sparkle surfaces
    // instead of a smooth blob. Mobile uses fewer sides.
    const N = this._isMobile ? 12 : 16;
    const geom = Philosophy._getBrilliantGeometry(N);

    // MeshPhysicalMaterial tuned for SOTD-level diamond fire:
    //   • roughness 0 + clearcoat 1  → mirror-crisp facet reflections
    //   • thickness 2.5, dispersion 6.5 → strong rainbow fire through the body
    //   • envMapIntensity 2.8         → the room lights bake as hot sparks
    //     which the bloom pass then blooms into visible sparkle
    const isMobile = this._isMobile;
    const mat = new THREE.MeshPhysicalMaterial({
      color:                     0xffffff,
      metalness:                 0.0,
      roughness:                 isMobile ? 0.02 : 0.0,
      transmission:              1.0,
      thickness:                 isMobile ? 1.0 : 2.5,
      ior:                       2.417,                    // real diamond
      attenuationDistance:       12.0,
      attenuationColor:          new THREE.Color(0xffffff),
      envMapIntensity:           isMobile ? 1.5 : 2.8,
      // Mobile: drop iridescence + clearcoat + dispersion entirely.
      // Each is a full extra lighting pass on top of transmission;
      // together they can double the fragment cost.
      iridescence:               isMobile ? 0.0 : 0.25,
      iridescenceIOR:            1.55,
      iridescenceThicknessRange: [400, 900],
      clearcoat:                 isMobile ? 0.0 : 1.0,
      clearcoatRoughness:        0.0,
      transparent:               true,
      side:                      THREE.FrontSide,
    });
    if (!isMobile && "dispersion" in mat) mat.dispersion = 6.5;

    // Facet-edge chromatic aberration — injected into the shader so that
    // at grazing angles (where facets read as edges) we add a slow-moving
    // rainbow tint. This fakes the multi-bounce dispersion three.js can't
    // simulate: real diamonds show sharp rainbow layers on edges; we
    // approximate with a fresnel-driven hue cycle on top of the material.
    if (!isMobile) {
      mat.userData.uEdgeTime = { value: 0 };
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uEdgeTime = mat.userData.uEdgeTime;
        shader.vertexShader = shader.vertexShader
          .replace(
            "#include <common>",
            `#include <common>
             varying vec3 vEdgeNormal;
             varying vec3 vEdgeViewPos;`,
          )
          .replace(
            "#include <project_vertex>",
            `#include <project_vertex>
             vEdgeNormal  = normalize(normalMatrix * normal);
             vEdgeViewPos = -mvPosition.xyz;`,
          );
        shader.fragmentShader = shader.fragmentShader
          .replace(
            "#include <common>",
            `#include <common>
             uniform float uEdgeTime;
             varying vec3 vEdgeNormal;
             varying vec3 vEdgeViewPos;`,
          )
          .replace(
            "#include <output_fragment>",
            `#include <output_fragment>
             {
               vec3 N = normalize(vEdgeNormal);
               vec3 V = normalize(vEdgeViewPos);
               float f = pow(1.0 - abs(dot(N, V)), 3.0);
               float hue = f * 8.0 + uEdgeTime * 0.6;
               vec3 rainbow = vec3(
                 sin(hue           ) * 0.5 + 0.5,
                 sin(hue + 2.0944  ) * 0.5 + 0.5,
                 sin(hue + 4.18879 ) * 0.5 + 0.5
               );
               gl_FragColor.rgb += rainbow * f * 0.28;
             }`,
          );
      };
    }

    this.diamond = new THREE.Mesh(geom, mat);
    this.diamond.rotation.x = -0.18;
    this.scene.add(this.diamond);
  }

  // Cached brilliant-cut geometry. Ring layers give proper diamond
  // proportions (table → crown → wide girdle → pavilion → culet). Each
  // triangle carries its own vertex copies so computeVertexNormals()
  // produces per-face normals — every facet is a hard, planar reflector
  // instead of a smooth-blurred surface. Adjacent layers alternate a
  // half-step angular offset, which turns each ring band into N zig-zag
  // triangular facets (the "star/bezel" pattern of a real brilliant cut).
  static _getBrilliantGeometry(N) {
    if (!Philosophy._geomCache) Philosophy._geomCache = new Map();
    let g = Philosophy._geomCache.get(N);
    if (g) return g;

    const halfStep = Math.PI / N;
    const layers = [
      [ 0.62,  0.00,  0        ],   // table center (fans out to table edge)
      [ 0.62,  0.40,  0        ],   // table edge (flat top disc)
      [ 0.40,  0.70,  halfStep ],   // upper crown ring — offset creates star facets
      [ 0.08,  1.00,  0        ],   // girdle (widest)
      [-0.22,  0.88,  halfStep ],   // upper pavilion ring — offset again
      [-0.72,  0.42,  0        ],   // lower pavilion
      [-1.08,  0.00,  0        ],   // culet point
    ];

    // Materialize each layer as an array of [x,y,z] verts (single vert if r=0)
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
      positions.push(a[0], a[1], a[2],
                     b[0], b[1], b[2],
                     c[0], c[1], c[2]);
      indices.push(base, base + 1, base + 2);
    };

    for (let li = 0; li < layers.length - 1; li++) {
      const r1 = rings[li];
      const r2 = rings[li + 1];
      if (r1.length === 1 && r2.length > 1) {
        // Fan from top center → outer ring (upward-facing table)
        const c = r1[0];
        for (let i = 0; i < N; i++) {
          const j = (i + 1) % N;
          pushTri(c, r2[i], r2[j]);
        }
      } else if (r1.length > 1 && r2.length === 1) {
        // Fan from outer ring → bottom center (culet)
        const c = r2[0];
        for (let i = 0; i < N; i++) {
          const j = (i + 1) % N;
          pushTri(r1[i], r1[j], c);
        }
      } else {
        // Two rings — connect as quad-band; per-face verts give per-facet flat shading
        for (let i = 0; i < N; i++) {
          const j = (i + 1) % N;
          pushTri(r1[i], r1[j], r2[i]);
          pushTri(r1[j], r2[j], r2[i]);
        }
      }
    }

    g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.scale(0.92, 1.06, 0.92);
    g.computeVertexNormals();
    Philosophy._geomCache.set(N, g);
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

    const amb = new THREE.AmbientLight(0x121826, 0.65);
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
    if (this._bloom)    this._bloom.setSize(w, h);

    // Fluid targets — re-size to the scaled sim resolution and reset frame
    if (this._fluidTargetA && this._fluidTargetB && this._displayTarget) {
      const fw = Math.max(2, Math.floor(w * FLUID_RES_SCALE));
      const fh = Math.max(2, Math.floor(h * FLUID_RES_SCALE));
      this._fluidTargetA.setSize(fw, fh);
      this._fluidTargetB.setSize(fw, fh);
      this._displayTarget.setSize(fw, fh);
      this._fluidMat.uniforms.iResolution.value.set(fw, fh);
      this._displayMat.uniforms.iResolution.value.set(fw, fh);
      this._fluidFrame = 0;
    }

    this._isMobile = w < 768 || "ontouchstart" in window;
  }

  // ── Beat reveal ─────────────────────────────────────────────────
  _observeBlocks() {
    this._observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting || e.target.classList.contains("is-revealed")) return;
        e.target.classList.add("is-revealed");
        const isFinal = e.target.dataset.final === "true";
        const cta     = isFinal ? e.target.querySelector(".holm-philosophy__cta") : null;

        if (this._reducedMotion) {
          e.target.classList.add("is-in");
          if (cta) gsap.set(cta, { opacity: 1 });
          return;
        }
        // Per-char stagger reveal — chars ride up from below their word-mask
        const chars = e.target.querySelectorAll(".holm-philosophy__char");
        gsap.to(chars, {
          yPercent: 0,
          opacity:  1,
          duration: 0.85,
          stagger:  0.018,      // tight cascade — reads as fluid motion
          ease:     "power3.out",
        });
        if (cta) {
          const ctaDelay = chars.length * 0.018 + 0.15;
          gsap.fromTo(cta,
            { opacity: 0, scale: 0.85 },
            { opacity: 1, scale: 1, duration: 0.9, delay: ctaDelay, ease: "power3.out" },
          );
        }
      });
    }, { threshold: 0.35, rootMargin: "0px 0px -8% 0px" });
    this.blocks.forEach((b) => this._observer.observe(b));
  }

  // ── CTA magnetic hover ─────────────────────────────────────────
  _bindCtaMagnetic() {
    if (this._reducedMotion) return;
    const cta = this.container.querySelector(".holm-philosophy__cta");
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

    window.addEventListener("mousemove", this._ctaMove, { passive: true });
    window.addEventListener("mouseleave", this._ctaLeave);
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

      // Mobile: keep full horizontal motion so the diamond visually
      // opposes the stanza's side (same rhythm as desktop). The diamond
      // is shrunk aggressively below so there's room for both on one row.
      const narrow  = this._isMobile;
      const wx      = target.x;
      const wy      = target.y;

      this._targetPos.set(wx * halfW, wy * halfH, 0);

      // Frame-rate-independent lerp
      const k = 1 - Math.pow(1 - POS_LERP, dt * 60);
      this.diamond.position.lerp(this._targetPos, k);

      // Mobile: much smaller diamond (0.42×) so it reads as a jewel on the
      // opposite side of the stanza instead of stealing the row. Biggest
      // beat 1.35 × 0.42 ≈ 0.57 world diameter — comfortably fits a
      // ~40vw column beside a ~55vw text column on a phone.
      const scaleTarget = narrow ? target.scale * 0.42 : target.scale;
      const curS = this.diamond.scale.x + (scaleTarget - this.diamond.scale.x) * k;
      this.diamond.scale.setScalar(curS);

      // Caustic halo — trail the diamond in screen-space so the glow reads
      // as an emanation from the gem itself, not a fixed backdrop element
      if (this._causticPlane) {
        this._causticPlane.position.x = this.diamond.position.x;
        this._causticPlane.position.y = this.diamond.position.y;
        this._causticPlane.scale.setScalar(Math.max(curS, 0.4) * 1.35);
        this._causticPlane.material.uniforms.uTime.value = this._elapsed;
      }

      // Facet-edge rainbow cycle
      if (this.diamond.material.userData.uEdgeTime) {
        this.diamond.material.userData.uEdgeTime.value = this._elapsed;
      }

      // Hero watermark plane — visible on the intro, fades as the user
      // scrolls into the manifesto so it doesn't compete with the stanzas.
      // Shader uniforms are driven every frame so the text rides the same
      // fluid as the backdrop and reacts to the cursor.
      if (this._heroPlane) {
        const introFade = Math.max(0, 1 - this._scrollT * 4.0);
        const eased     = introFade * introFade * (3 - 2 * introFade);
        const u         = this._heroPlane.material.uniforms;
        u.uOpacity.value = eased;
        u.uTime.value    = this._elapsed;
        this._heroPlane.visible = eased > 0.005;

        // Project the cursor onto the watermark plane, convert to its
        // local UV, and hand to the shader.
        if (this._heroPlane.visible && this._pointerActive) {
          this._heroRaycaster.setFromCamera(this._mouseNdc, this.camera);
          const hit = this._heroRaycaster.ray.intersectPlane(
            this._heroPlaneMath, this._heroHitPoint,
          );
          if (hit) {
            const { w, h } = this._heroPlaneSize;
            const uu = (hit.x + w * 0.5) / w;
            const vv = 1 - (hit.y + h * 0.5) / h;
            u.uMouseUv.value.set(uu, vv);
            // Focus follows the intro fade — ripple dies as the watermark does
            u.uCursorFocus.value = eased;
          }
        } else {
          u.uCursorFocus.value = 0;
        }
      }

      // Rotation — idle spin + slight tilt driven by scroll
      const tilt = this._reducedMotion
        ? -0.18
        : -0.18 + Math.sin(this._scrollT * Math.PI) * SCROLL_TILT_MAX;

      this.diamond.rotation.y = this._idleSpin;
      this.diamond.rotation.x = tilt;

      this._elapsed += dt;

      // Fluid simulation retired — background is a static gradient.
      // Underwater pass still runs its own wave sim every frame.
      this._underwater?.update();

      this._composer.render();
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }
}
