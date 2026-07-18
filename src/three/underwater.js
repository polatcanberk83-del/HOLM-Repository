import * as THREE from "three";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

// ─── Wave-simulation shaders (pressure/velocity ping-pong) ────────────────
// The sim writes RGBA:
//   .x = pressure
//   .y = pressure velocity
//   .z = ∂pressure/∂x  (used as horizontal refraction offset)
//   .w = ∂pressure/∂y  (used as vertical refraction offset)
//
// The image-space post pass reads this texture and refracts the museum
// scene by (.z, .w). Ambient wandering sources keep the surface breathing
// even when the visitor doesn't move the mouse.
const SIM_VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SIM_FRAG = /* glsl */`
uniform sampler2D textureA;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float time;
uniform int frame;
varying vec2 vUv;

const float delta = 1.35;

void main() {
  vec2 uv = vUv;
  if (frame == 0) { gl_FragColor = vec4(0.0); return; }

  vec4 data = texture2D(textureA, uv);
  float pressure = data.x;
  float pVel = data.y;

  vec2 texelSize = 1.0 / resolution;
  float p_right = texture2D(textureA, uv + vec2(texelSize.x, 0.0)).x;
  float p_left  = texture2D(textureA, uv + vec2(-texelSize.x, 0.0)).x;
  float p_up    = texture2D(textureA, uv + vec2(0.0, texelSize.y)).x;
  float p_down  = texture2D(textureA, uv + vec2(0.0, -texelSize.y)).x;

  if (uv.x <= texelSize.x)         p_left  = p_right;
  if (uv.x >= 1.0 - texelSize.x)   p_right = p_left;
  if (uv.y <= texelSize.y)         p_down  = p_up;
  if (uv.y >= 1.0 - texelSize.y)   p_up    = p_down;

  pVel += delta * (-2.0 * pressure + p_right + p_left) / 4.0;
  pVel += delta * (-2.0 * pressure + p_up    + p_down) / 4.0;
  pressure += delta * pVel;
  pVel -= 0.006 * delta * pressure;
  pVel *= 1.0 - 0.003 * delta;
  pressure *= 0.9985;

  // Five slow-wandering sources — the constant rainfall that keeps the
  // pond alive without any input. Wider radius + higher amplitude than
  // before so the resulting waves are strong enough to visibly refract
  // the scene beneath (was 0.10@0.012 which read as nothing).
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec2 src = vec2(
      0.5 + 0.44 * sin(time * 0.13 + fi * 2.093),
      0.5 + 0.42 * cos(time * 0.10 + fi * 1.731)
    );
    float d = distance(uv, src);
    if (d < 0.022) {
      pressure += 0.55 * (1.0 - d / 0.022);
    }
  }

  vec2 mouseUV = mouse / resolution;
  if (mouse.x > 0.0) {
    float dist = distance(uv, mouseUV);
    if (dist <= 0.050) {
      pressure += 1.80 * (1.0 - dist / 0.050);
    }
  }

  gl_FragColor = vec4(
    pressure, pVel,
    (p_right - p_left) / 2.0,
    (p_up    - p_down) / 2.0
  );
}
`;

// ─── Underwater compositing pass ──────────────────────────────────────────
// Takes the scene rendered so far (tDiffuse) and:
//   • refracts UV lookup by the wave-gradient (.z, .w)
//   • adds drifting caustic filaments over lighter regions
//   • biases the palette toward a cool aquatic tint
//   • applies a very gentle vertical depth gradient
const UNDERWATER_SHADER = {
  uniforms: {
    tDiffuse:    { value: null },
    uWaveTex:    { value: null },
    uTime:       { value: 0 },
    uIntensity:  { value: 1.0 },
    uDispAmount: { value: 0.045 },
    uCausticAmp: { value: 0.38 },
    uTintAmount: { value: 0.50 },
    uAspect:     { value: 1.0 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform sampler2D uWaveTex;
    uniform float uTime;
    uniform float uIntensity;
    uniform float uDispAmount;
    uniform float uCausticAmp;
    uniform float uTintAmount;
    uniform float uAspect;
    varying vec2 vUv;

    // Layered sinusoidal caustics — cheap, organic, no texture needed.
    // Three bands at coprime-ish frequencies interfere into slow-drifting
    // bright filaments. smoothstep hardens the highs so we get filament
    // lines rather than a soft cloud.
    float caustics(vec2 uv, float t) {
      vec2 p = uv * 5.2;
      float s = 0.0;
      s += sin(p.x * 1.30 + t * 0.42 + p.y * 0.70);
      s += sin(p.x * 0.72 - t * 0.29 + p.y * 1.12);
      s += sin(p.y * 1.05 + t * 0.36 - p.x * 0.88);
      s /= 3.0;
      return smoothstep(0.42, 0.94, s * 0.5 + 0.5);
    }

    void main() {
      vec4 wave = texture2D(uWaveTex, vUv);

      // Refract the scene lookup by the wave-gradient. Aspect-correct so
      // horizontal & vertical warp read equally.
      vec2 disp = wave.zw * uDispAmount * uIntensity;
      disp.x /= uAspect;
      vec4 col = texture2D(tDiffuse, vUv + disp);

      // Drifting caustics, offset slightly by wave-gradient so filaments
      // bend where the surface ripples — exactly what happens underwater.
      vec2 causticUv = vUv + wave.zw * 0.4;
      float c = caustics(causticUv, uTime);

      // Add caustics as additive brightening. A base amount is present
      // everywhere (so even the dark corridor reads as submerged), plus
      // a stronger contribution on already-lit regions where filaments
      // would naturally focus.
      float lightness = dot(col.rgb, vec3(0.299, 0.587, 0.114));
      float causticGate = smoothstep(0.0, 0.45, lightness);
      float causticStrength = mix(0.35, 1.0, causticGate);
      col.rgb += vec3(0.55, 0.85, 1.00) * c * uCausticAmp * causticStrength * uIntensity;

      // Cool aquatic tint — desaturates warms toward teal-blue. Kept
      // subtle so the museum's own palette bleeds through.
      vec3 tinted = col.rgb * vec3(0.78, 0.94, 1.10);
      col.rgb = mix(col.rgb, tinted, uTintAmount * uIntensity);

      // Vertical light attenuation — imperceptibly darker toward the
      // bottom of the frame (further from the surface above).
      float depth = smoothstep(-0.2, 1.15, vUv.y);
      col.rgb *= mix(1.0, mix(0.88, 1.03, depth), uIntensity);

      gl_FragColor = col;
    }
  `,
};

// ─── Public factory ──────────────────────────────────────────────────────
export function createUnderwaterSystem(renderer, { isMobile = false } = {}) {
  const dpr = Math.min(window.devicePixelRatio, 2);
  // Sim resolution is a fraction of screen — wave gradients are low-freq,
  // no need to run at full DPR. Saves a lot of GPU per frame.
  const simScale = isMobile ? 0.4 : 0.6;
  const bufW = () => Math.max(64, Math.floor(window.innerWidth  * dpr * simScale));
  const bufH = () => Math.max(64, Math.floor(window.innerHeight * dpr * simScale));

  const rtOptions = {
    format: THREE.RGBAFormat,
    // HalfFloat is enough precision for wave sim + is faster to sample.
    // Falls back to Float if the driver rejects it (three does this
    // internally on the color-buffer extension check).
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false,
    depthBuffer: false,
  };
  let rtA = new THREE.WebGLRenderTarget(bufW(), bufH(), rtOptions);
  let rtB = new THREE.WebGLRenderTarget(bufW(), bufH(), rtOptions);

  const simScene = new THREE.Scene();
  const simCam   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mouse    = new THREE.Vector2();
  let frame = 0;

  const simMaterial = new THREE.ShaderMaterial({
    uniforms: {
      textureA:   { value: null },
      mouse:      { value: mouse },
      resolution: { value: new THREE.Vector2(bufW(), bufH()) },
      time:       { value: 0 },
      frame:      { value: 0 },
    },
    vertexShader:   SIM_VERT,
    fragmentShader: SIM_FRAG,
  });

  const simPlane = new THREE.PlaneGeometry(2, 2);
  const simQuad  = new THREE.Mesh(simPlane, simMaterial);
  simScene.add(simQuad);

  const pass = new ShaderPass(UNDERWATER_SHADER);
  pass.uniforms.uWaveTex.value = rtA.texture;
  pass.uniforms.uAspect.value  = window.innerWidth / window.innerHeight;

  if (isMobile) {
    // Composer chain is lighter on mobile (no SSAO/Bokeh/Chroma), so we can
    // still afford underwater — but pull the amplitudes down a touch since
    // there's less bloom+DoF to soften edges.
    pass.uniforms.uDispAmount.value = 0.035;
    pass.uniforms.uCausticAmp.value = 0.28;
    pass.uniforms.uTintAmount.value = 0.42;
  }

  const update = () => {
    const t = performance.now() / 1000;
    simMaterial.uniforms.textureA.value = rtA.texture;
    simMaterial.uniforms.frame.value    = frame++;
    simMaterial.uniforms.time.value     = t;

    const prevRT = renderer.getRenderTarget();
    renderer.setRenderTarget(rtB);
    renderer.render(simScene, simCam);
    renderer.setRenderTarget(prevRT);

    const tmp = rtA; rtA = rtB; rtB = tmp;
    pass.uniforms.uWaveTex.value = rtA.texture;
    pass.uniforms.uTime.value    = t;
  };

  // nx, ny in normalized viewport coords (0..1, y-up). Pass negatives to
  // deactivate (matches shader guard `if (mouse.x > 0.0)`).
  const setMouseNorm = (nx, ny) => {
    if (nx < 0 || ny < 0) { mouse.set(0, 0); return; }
    mouse.x = nx * bufW();
    mouse.y = ny * bufH();
  };

  const setIntensity = (v) => {
    pass.uniforms.uIntensity.value = Math.max(0, Math.min(1, v));
  };

  const onResize = () => {
    rtA.setSize(bufW(), bufH());
    rtB.setSize(bufW(), bufH());
    simMaterial.uniforms.resolution.value.set(bufW(), bufH());
    pass.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
  };
  window.addEventListener("resize", onResize);

  const dispose = () => {
    window.removeEventListener("resize", onResize);
    simPlane.dispose();
    simMaterial.dispose();
    rtA.dispose();
    rtB.dispose();
  };

  return { pass, update, setMouseNorm, setIntensity, dispose };
}
