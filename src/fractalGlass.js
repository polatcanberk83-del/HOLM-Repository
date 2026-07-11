import * as THREE from "three";

// ─── Fractal-glass image backdrop ───────────────────────────────────
// Ported directly from the fractal-glass reference: an image is
// distorted through summed mod-stripe displacement (giving that
// vertical-blind refracted look) with edge padding and a mouse-driven
// parallax that grows where the glass is bending most.
//
// API mirrors the other backdrops: init(url) via constructor,
// step(elapsed) every frame, setPointer(clientX, clientY) on move,
// resize() on layout change, dispose() on teardown. .texture is what
// you assign to your THREE.Scene's .background.

const VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */`
uniform sampler2D uTexture;
uniform vec2  uResolution;
uniform vec2  uTextureSize;
uniform vec2  uMouse;
uniform float uParallaxStrength;
uniform float uDistortionMultiplier;
uniform float uGlassStrength;
uniform float ustripesFrequency;
uniform float uglassSmoothness;
uniform float uEdgePadding;

varying vec2 vUv;

vec2 getCoverUV(vec2 uv, vec2 textureSize) {
  if (textureSize.x < 1.0 || textureSize.y < 1.0) return uv;

  vec2 s = uResolution / textureSize;
  float scale = max(s.x, s.y);

  vec2 scaledSize = textureSize * scale;
  vec2 offset = (uResolution - scaledSize) * 0.5;

  return (uv * uResolution - offset) / scaledSize;
}

float displacement(float x, float num_stripes, float strength) {
  float modulus = 1.0 / num_stripes;
  return mod(x, modulus) * strength;
}

float fractalGlass(float x) {
  float d = 0.0;
  for (int i = -5; i <= 5; i++) {
    d += displacement(x + float(i) * uglassSmoothness, ustripesFrequency, uGlassStrength);
  }
  d = d / 11.0;
  return x + d;
}

float smoothEdge(float x, float padding) {
  float edge = padding;
  if (x < edge) {
    return smoothstep(0.0, edge, x);
  } else if (x > 1.0 - edge) {
    return smoothstep(1.0, 1.0 - edge, x);
  }
  return 1.0;
}

void main() {
  vec2 uv = vUv;
  float originalX = uv.x;

  float edgeFactor = smoothEdge(originalX, uEdgePadding);
  float distortedX = fractalGlass(originalX);
  uv.x = mix(originalX, distortedX, edgeFactor);

  float distortionFactor = uv.x - originalX;

  float parallaxDirection = -sign(0.5 - uMouse.x);
  vec2 parallaxOffset = vec2(
    parallaxDirection * abs(uMouse.x - 0.5) * uParallaxStrength * (1.0 + abs(distortionFactor) * uDistortionMultiplier),
    0.0
  );
  parallaxOffset *= edgeFactor;
  uv += parallaxOffset;

  vec2 coverUV = getCoverUV(uv, uTextureSize);
  if (coverUV.x < 0.0 || coverUV.x > 1.0 || coverUV.y < 0.0 || coverUV.y > 1.0) {
    coverUV = clamp(coverUV, 0.0, 1.0);
  }

  gl_FragColor = texture2D(uTexture, coverUV);
}
`;

const DEFAULTS = {
  imageUrl:              null,     // required
  lerpFactor:            0.035,
  parallaxStrength:      0.1,
  distortionMultiplier:  10.0,
  glassStrength:         2.0,
  glassSmoothness:       0.0001,
  stripesFrequency:      35.0,
  edgePadding:           0.1,
  respondsToPointer:     true,
};

export class FractalGlass {
  constructor(renderer, opts = {}) {
    this.renderer = renderer;
    this.opts     = { ...DEFAULTS, ...opts };

    const w = window.innerWidth;
    const h = window.innerHeight;

    this._target = new THREE.WebGLRenderTarget(w, h, {
      minFilter:     THREE.LinearFilter,
      magFilter:     THREE.LinearFilter,
      format:        THREE.RGBAFormat,
      type:          THREE.UnsignedByteType,
      depthBuffer:   false,
      stencilBuffer: false,
    });
    this._target.texture.colorSpace = THREE.SRGBColorSpace;

    this._mat = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTexture:              { value: null },
        uResolution:           { value: new THREE.Vector2(w, h) },
        uTextureSize:          { value: new THREE.Vector2(1, 1) },
        uMouse:                { value: new THREE.Vector2(0.5, 0.5) },
        uParallaxStrength:     { value: this.opts.parallaxStrength },
        uDistortionMultiplier: { value: this.opts.distortionMultiplier },
        uGlassStrength:        { value: this.opts.glassStrength },
        ustripesFrequency:     { value: this.opts.stripesFrequency },
        uglassSmoothness:      { value: this.opts.glassSmoothness },
        uEdgePadding:          { value: this.opts.edgePadding },
      },
    });

    this._quadCam   = new THREE.Camera();
    this._quadScene = new THREE.Scene();
    this._quadMesh  = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this._mat);
    this._quadScene.add(this._quadMesh);

    // Pointer lerp state
    this._mouse       = new THREE.Vector2(0.5, 0.5);
    this._targetMouse = new THREE.Vector2(0.5, 0.5);

    if (this.opts.imageUrl) this._loadImage(this.opts.imageUrl);
  }

  _loadImage(url) {
    new THREE.TextureLoader().load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter  = THREE.LinearFilter;
      tex.magFilter  = THREE.LinearFilter;
      tex.wrapS      = THREE.ClampToEdgeWrapping;
      tex.wrapT      = THREE.ClampToEdgeWrapping;

      this._mat.uniforms.uTexture.value = tex;
      const w = tex.image?.naturalWidth  || tex.image?.width  || 1;
      const h = tex.image?.naturalHeight || tex.image?.height || 1;
      this._mat.uniforms.uTextureSize.value.set(w, h);
      this._texture = tex;
    });
  }

  get texture() { return this._target.texture; }

  setPointer(clientX, clientY) {
    if (!this.opts.respondsToPointer) return;
    this._targetMouse.x = clientX / window.innerWidth;
    this._targetMouse.y = 1 - clientY / window.innerHeight;
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this._target.setSize(w, h);
    this._mat.uniforms.uResolution.value.set(w, h);
  }

  step(/* elapsed */) {
    // Lerp mouse toward the pointer target — matches the reference feel
    const k = this.opts.lerpFactor;
    this._mouse.x += (this._targetMouse.x - this._mouse.x) * k;
    this._mouse.y += (this._targetMouse.y - this._mouse.y) * k;
    this._mat.uniforms.uMouse.value.copy(this._mouse);

    this.renderer.setRenderTarget(this._target);
    this.renderer.clear();
    this.renderer.render(this._quadScene, this._quadCam);
    this.renderer.setRenderTarget(null);
  }

  dispose() {
    this._target.dispose();
    this._mat.dispose();
    this._quadMesh.geometry.dispose();
    this._texture?.dispose();
  }
}
