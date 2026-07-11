import * as THREE from "three";

// ─── Fluid gradient backdrop ────────────────────────────────────────
// Standalone helper — ping-pong fluid advection at half-viewport-res,
// then a display pass that turns the velocity field into a flowing
// gradient. Anyone can `bg.step(elapsed)` every frame and hand
// `bg.texture` to `scene.background` on their own THREE.Scene.
//
// Ported out of the philosophy page so multiple pages can share the
// same live backdrop without duplicating the ~200 lines of shader.

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
    for (int i = 0; i < 8; i++) {
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

const DEFAULTS = {
  resScale:      0.5,
  brushSize:     22.0,
  brushStrength: 0.30,
  fluidDecay:    0.985,
  trailLength:   0.90,
  stopDecay:     0.92,
  distortion:    1.6,
  intensity:     0.85,
  softness:      1.4,
  colors: ["#000000", "#050d24", "#0e3277", "#3672d6"],
};

export class FluidBackdrop {
  constructor(renderer, opts = {}) {
    this.renderer = renderer;
    this.opts     = { ...DEFAULTS, ...opts };

    const w = Math.max(2, Math.floor(window.innerWidth  * this.opts.resScale));
    const h = Math.max(2, Math.floor(window.innerHeight * this.opts.resScale));

    const rtOpts = {
      minFilter:     THREE.LinearFilter,
      magFilter:     THREE.LinearFilter,
      format:        THREE.RGBAFormat,
      type:          THREE.HalfFloatType,
      depthBuffer:   false,
      stencilBuffer: false,
    };
    this._fluidTargetA  = new THREE.WebGLRenderTarget(w, h, rtOpts);
    this._fluidTargetB  = new THREE.WebGLRenderTarget(w, h, rtOpts);
    this._displayTarget = new THREE.WebGLRenderTarget(w, h, {
      ...rtOpts,
      type: THREE.UnsignedByteType,
    });
    this._displayTarget.texture.colorSpace = THREE.SRGBColorSpace;

    this._fluidCurrent = this._fluidTargetA;
    this._fluidPrev    = this._fluidTargetB;

    const [c1, c2, c3, c4] = this.opts.colors;
    this._fluidMat = new THREE.ShaderMaterial({
      vertexShader:   FLUID_VERT,
      fragmentShader: FLUID_FRAG,
      uniforms: {
        iTime:          { value: 0 },
        iResolution:    { value: new THREE.Vector2(w, h) },
        iMouse:         { value: new THREE.Vector4(0, 0, 0, 0) },
        iFrame:         { value: 0 },
        iPreviousFrame: { value: null },
        uBrushSize:     { value: this.opts.brushSize },
        uBrushStrength: { value: this.opts.brushStrength },
        uFluidDecay:    { value: this.opts.fluidDecay },
        uTrailLength:   { value: this.opts.trailLength },
        uStopDecay:     { value: this.opts.stopDecay },
      },
    });
    this._displayMat = new THREE.ShaderMaterial({
      vertexShader:   FLUID_VERT,
      fragmentShader: FLUID_DISPLAY_FRAG,
      uniforms: {
        iTime:             { value: 0 },
        iResolution:       { value: new THREE.Vector2(w, h) },
        iFluid:            { value: null },
        uDistortionAmount: { value: this.opts.distortion },
        uColor1:           { value: hexToVec3(c1) },
        uColor2:           { value: hexToVec3(c2) },
        uColor3:           { value: hexToVec3(c3) },
        uColor4:           { value: hexToVec3(c4) },
        uColorIntensity:   { value: this.opts.intensity },
        uSoftness:         { value: this.opts.softness },
      },
    });

    this._quadCam   = new THREE.Camera();
    this._quadScene = new THREE.Scene();
    this._quadMesh  = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this._fluidMat);
    this._quadScene.add(this._quadMesh);

    this._mousePx         = new THREE.Vector2(0, 0);
    this._prevMousePx     = new THREE.Vector2(0, 0);
    this._lastMouseMoveMs = 0;
    this._frame           = 0;
  }

  get texture() { return this._displayTarget.texture; }

  setPointer(clientX, clientY) {
    const h = window.innerHeight;
    const sx = clientX * this.opts.resScale;
    const sy = (h - clientY) * this.opts.resScale;
    this._prevMousePx.copy(this._mousePx);
    this._mousePx.set(sx, sy);
    this._lastMouseMoveMs = performance.now();
    this._fluidMat.uniforms.iMouse.value.set(
      this._mousePx.x, this._mousePx.y,
      this._prevMousePx.x, this._prevMousePx.y,
    );
  }

  resize() {
    const fw = Math.max(2, Math.floor(window.innerWidth  * this.opts.resScale));
    const fh = Math.max(2, Math.floor(window.innerHeight * this.opts.resScale));
    this._fluidTargetA.setSize(fw, fh);
    this._fluidTargetB.setSize(fw, fh);
    this._displayTarget.setSize(fw, fh);
    this._fluidMat.uniforms.iResolution.value.set(fw, fh);
    this._displayMat.uniforms.iResolution.value.set(fw, fh);
    this._frame = 0;
  }

  step(elapsed) {
    // Cursor input decays to zero if the pointer has been idle
    if (performance.now() - this._lastMouseMoveMs > 100) {
      this._fluidMat.uniforms.iMouse.value.set(0, 0, 0, 0);
    }
    this._fluidMat.uniforms.iTime.value          = elapsed;
    this._fluidMat.uniforms.iFrame.value         = this._frame;
    this._fluidMat.uniforms.iPreviousFrame.value = this._fluidPrev.texture;

    this._quadMesh.material = this._fluidMat;
    this.renderer.setRenderTarget(this._fluidCurrent);
    this.renderer.clear();
    this.renderer.render(this._quadScene, this._quadCam);

    this._displayMat.uniforms.iTime.value  = elapsed;
    this._displayMat.uniforms.iFluid.value = this._fluidCurrent.texture;
    this._quadMesh.material = this._displayMat;
    this.renderer.setRenderTarget(this._displayTarget);
    this.renderer.clear();
    this.renderer.render(this._quadScene, this._quadCam);

    this.renderer.setRenderTarget(null);

    const tmp = this._fluidCurrent;
    this._fluidCurrent = this._fluidPrev;
    this._fluidPrev    = tmp;
    this._frame++;
  }

  dispose() {
    this._fluidTargetA.dispose();
    this._fluidTargetB.dispose();
    this._displayTarget.dispose();
    this._fluidMat.dispose();
    this._displayMat.dispose();
    this._quadMesh.geometry.dispose();
  }
}
