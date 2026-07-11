import * as THREE from "three";

// ─── Fractured glass backdrop ────────────────────────────────────
// Full-viewport fragment shader that renders a light Voronoi-cell
// mosaic — thin hairline seams between cells, a slightly different
// hue per cell (like light refracted through unequal shards), and
// chromatic aberration along the seams. Cursor pushes the nearest
// cell seeds radially, so the cracks visibly bend under the pointer
// like glass flexing before it shatters.
//
// API mirrors FluidBackdrop: init once, step(elapsed) every frame,
// setPointer(clientX, clientY) on pointermove, .texture is what you
// assign to your THREE.Scene's `.background`.

const VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */`
precision highp float;

uniform vec2  iResolution;
uniform float iTime;
uniform vec2  iMouse;         // 0..1 UV space
uniform float iMouseStrength; // 0..1 — pointer influence
uniform float uCellDensity;   // cells per short-side
uniform float uEdgeSharp;     // hairline thickness
uniform float uEdgeStrength;  // hairline darkness
uniform float uChromatic;     // chromatic aberration at seams
uniform float uRefract;       // per-cell UV offset amount
uniform vec3  uColorA;        // gradient endpoints
uniform vec3  uColorB;
uniform vec3  uColorC;
uniform vec3  uColorD;

varying vec2 vUv;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)),
           dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

// Static seed offset — glass cracks don't animate. The cursor can
// still push seeds through iMouseStrength for a subtle "flex".
vec2 seedOffset(vec2 seed, vec2 f) {
  vec2 o = hash2(seed);
  if (iMouseStrength > 0.0) {
    vec2  pos = (seed - floor(f)) + o - fract(f);
    float d   = length(pos);
    float k   = exp(-d * d * 2.8) * iMouseStrength * 0.45;
    vec2  dir = normalize(iMouse - (seed + o) + 1e-4);
    o += dir * k;
  }
  return o;
}

// Voronoi in a 3×3 neighborhood — returns:
//   .xy = seed grid coord (cell id)
//   .z  = distance to nearest seed (F1)
//   .w  = distance to nearest edge (F2 — perpendicular to seam)
vec4 voronoi(vec2 uv) {
  vec2 g = floor(uv);
  vec2 f = fract(uv);

  vec2 nearestSeed = vec2(0.0);
  vec2 nearestOff  = vec2(0.0);
  float f1 = 1e9;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 gv   = vec2(float(i), float(j));
      vec2 seed = g + gv;
      vec2 o    = seedOffset(seed, uv);
      vec2 r    = gv + o - f;
      float d   = dot(r, r);
      if (d < f1) {
        f1 = d;
        nearestSeed = seed;
        nearestOff  = o;
      }
    }
  }

  // Pass 2 — perpendicular distance to the seam of the nearest cell.
  // Straight-line polygon Voronoi (this is why static seeds matter —
  // any per-frame jitter smears the edges into curvy blobs).
  float f2 = 1e9;
  vec2  toNearest = nearestSeed + nearestOff - (g + f);
  for (int j = -2; j <= 2; j++) {
    for (int i = -2; i <= 2; i++) {
      vec2 gv   = vec2(float(i), float(j));
      vec2 seed = g + gv;
      if (all(equal(seed, nearestSeed))) continue;
      vec2 o       = seedOffset(seed, uv);
      vec2 toOther = seed + o - (g + f);
      vec2 mid     = 0.5 * (toNearest + toOther);
      vec2 dir     = normalize(toOther - toNearest);
      float d      = dot(mid, dir);
      f2 = min(f2, d);
    }
  }

  return vec4(nearestSeed, sqrt(f1), f2);
}

// Rotation matrix — used to give each cell a subtle unique rotation
mat2 rot2(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = vUv;

  // Cell grid — density scales with the short side so shards look
  // roughly the same size regardless of viewport aspect
  float sh     = min(iResolution.x, iResolution.y);
  vec2  aspect = iResolution / sh;
  vec2  cellUv = uv * aspect * uCellDensity;

  vec4 v      = voronoi(cellUv);
  vec2 cellId = v.xy;
  float edgeD = v.w;

  // Per-cell random — drives refraction UV offset, brightness, tilt
  vec2  cellRand = hash2(cellId + 17.31);
  vec2  cellRand2 = hash2(cellId + 91.7);
  vec2  cellOff  = (cellRand - 0.5) * uRefract;
  vec2  refracted = uv + cellOff;

  // Base gradient
  float mixer = 0.5 + 0.5 * sin(refracted.x * 2.2 + iTime * 0.06);
  vec3  base  = mix(uColorA, uColorB, refracted.y);
  base = mix(base, uColorC, mixer * 0.55);

  // Per-cell shading variance — each shard reads as its own pane
  // catching light at a slightly different angle. Wide range so some
  // panes are visibly darker/brighter.
  float cellShade = 0.78 + cellRand.y * 0.30;
  base *= cellShade;

  // Slow specular sweep — a diagonal band of light that traverses
  // the whole surface, catching cell interiors as it passes.
  float sweepT  = fract(iTime * 0.05);
  float sweepPos = (uv.x + uv.y) * 0.5;
  float sweepD  = abs(sweepPos - sweepT);
  float sweep   = exp(-sweepD * sweepD * 60.0);
  // Bias per cell so the sweep hits some brighter than others
  sweep *= 0.6 + cellRand2.x * 0.9;
  base += sweep * 0.10;

  // ─── Crack rendering ───────────────────────────────────────────
  // Real glass shows both a dark crack line AND a bright specular
  // ridge just next to it (the shard edge catching light). Combined,
  // that's what makes a crack "read" as glass instead of mud.

  // Bright edge halo (glass shard edge catching light) — sits in a
  // narrow band just off the seam center.
  float haloD     = edgeD;
  float haloInner = smoothstep(uEdgeSharp * 0.4, uEdgeSharp * 1.4, haloD);
  float haloOuter = 1.0 - smoothstep(uEdgeSharp * 1.4, uEdgeSharp * 4.5, haloD);
  float halo      = haloInner * haloOuter;
  base += vec3(1.15, 1.08, 0.95) * halo * 0.55;

  // Dark crack core — thin, sharp
  float crack = 1.0 - smoothstep(0.0, uEdgeSharp * 0.8, edgeD);
  base = mix(base, vec3(0.02, 0.03, 0.06), crack * uEdgeStrength);

  // Chromatic aberration along the seam — R shifts one way, B the
  // other. Only apply within the halo band.
  float seamBand = haloInner * haloOuter;
  float ab       = seamBand * uChromatic;
  base.r += ab * 1.0;
  base.b -= ab * 1.0;

  // Vignette — corners feel like they hold real glass
  vec2 cc = uv - 0.5;
  float vig = 1.0 - dot(cc, cc) * 0.55;
  base *= vig;

  gl_FragColor = vec4(base, 1.0);
}
`;

function hexToVec3(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return new THREE.Vector3(r, g, b);
}

const DEFAULTS = {
  resScale:      0.75,
  cellDensity:   5.0,
  edgeSharp:     0.010,
  edgeStrength:  0.90,
  chromatic:     0.070,
  refract:       0.014,
  colors: ["#ffffff", "#f0f2f6", "#dde3ee", "#c4cddd"],
  pointerFalloffMs: 900,
};

export class FracturedGlass {
  constructor(renderer, opts = {}) {
    this.renderer = renderer;
    this.opts     = { ...DEFAULTS, ...opts };

    const w = Math.max(2, Math.floor(window.innerWidth  * this.opts.resScale));
    const h = Math.max(2, Math.floor(window.innerHeight * this.opts.resScale));

    this._target = new THREE.WebGLRenderTarget(w, h, {
      minFilter:     THREE.LinearFilter,
      magFilter:     THREE.LinearFilter,
      format:        THREE.RGBAFormat,
      type:          THREE.UnsignedByteType,
      depthBuffer:   false,
      stencilBuffer: false,
    });
    this._target.texture.colorSpace = THREE.SRGBColorSpace;

    const [cA, cB, cC, cD] = this.opts.colors;
    this._mat = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms: {
        iResolution:    { value: new THREE.Vector2(w, h) },
        iTime:          { value: 0 },
        iMouse:         { value: new THREE.Vector2(-1, -1) },
        iMouseStrength: { value: 0 },
        uCellDensity:   { value: this.opts.cellDensity },
        uEdgeSharp:     { value: this.opts.edgeSharp },
        uEdgeStrength:  { value: this.opts.edgeStrength },
        uChromatic:     { value: this.opts.chromatic },
        uRefract:       { value: this.opts.refract },
        uColorA:        { value: hexToVec3(cA) },
        uColorB:        { value: hexToVec3(cB) },
        uColorC:        { value: hexToVec3(cC) },
        uColorD:        { value: hexToVec3(cD) },
      },
    });

    this._quadCam   = new THREE.Camera();
    this._quadScene = new THREE.Scene();
    this._quadMesh  = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this._mat);
    this._quadScene.add(this._quadMesh);

    this._lastPointerMs = -Infinity;
  }

  get texture() { return this._target.texture; }

  setPointer(clientX, clientY) {
    const u = clientX / window.innerWidth;
    const v = 1 - clientY / window.innerHeight;
    this._mat.uniforms.iMouse.value.set(u, v);
    this._mat.uniforms.iMouseStrength.value = 1;
    this._lastPointerMs = performance.now();
  }

  resize() {
    const fw = Math.max(2, Math.floor(window.innerWidth  * this.opts.resScale));
    const fh = Math.max(2, Math.floor(window.innerHeight * this.opts.resScale));
    this._target.setSize(fw, fh);
    this._mat.uniforms.iResolution.value.set(fw, fh);
  }

  step(elapsed) {
    this._mat.uniforms.iTime.value = elapsed;

    // Pointer influence decays over ~pointerFalloffMs after idle
    const idleMs = performance.now() - this._lastPointerMs;
    if (idleMs > this.opts.pointerFalloffMs) {
      this._mat.uniforms.iMouseStrength.value = 0;
    } else {
      const k = 1 - idleMs / this.opts.pointerFalloffMs;
      this._mat.uniforms.iMouseStrength.value = Math.max(0, Math.min(1, k));
    }

    this.renderer.setRenderTarget(this._target);
    this.renderer.clear();
    this.renderer.render(this._quadScene, this._quadCam);
    this.renderer.setRenderTarget(null);
  }

  dispose() {
    this._target.dispose();
    this._mat.dispose();
    this._quadMesh.geometry.dispose();
  }
}
