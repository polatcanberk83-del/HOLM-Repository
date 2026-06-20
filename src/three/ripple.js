import * as THREE from "three";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

// Two-layer liquid distortion:
//   Layer A — ambient noise field: always-on, slow fBm-driven warp across the whole screen
//   Layer B — cursor boost: when the mouse moves fast, amplify Layer A and add a radial push
const LiquidDistortShader = {
  uniforms: {
    tDiffuse:  { value: null },
    uTime:     { value: 0.0 },
    uMouseUV:  { value: new THREE.Vector2(0.5, 0.5) },
    uMouseVel: { value: 0.0 },
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
    uniform float     uTime;
    uniform vec2      uMouseUV;
    uniform float     uMouseVel;
    varying vec2      vUv;

    // Value noise hash
    float hash21(vec2 p) {
      p = fract(p * vec2(127.1, 311.7));
      p += dot(p, p + 19.19);
      return fract(p.x * p.y);
    }

    // Smooth value noise
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash21(i),           hash21(i + vec2(1.0, 0.0)), u.x),
        mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
        u.y
      ) * 2.0 - 1.0;
    }

    // 4-octave fBm returning a 2D distortion vector
    vec2 fbm2(vec2 p) {
      vec2 v = vec2(0.0);
      float amp = 0.5;
      for (int i = 0; i < 4; i++) {
        v.x += noise(p)                          * amp;
        v.y += noise(p + vec2(5.2, 1.3))         * amp;
        p   *= 2.1;
        amp *= 0.48;
      }
      return v;
    }

    void main() {
      // --- Layer A: ambient idle distortion ---
      vec2 scroll = vec2(uTime * 0.04, uTime * 0.028);
      vec2 ambientWarp = fbm2(vUv * 2.5 + scroll) * 0.005;

      // --- Layer B: cursor-driven boost ---
      vec2  delta    = vUv - uMouseUV;
      float distSq   = dot(delta, delta);
      float zone     = exp(-distSq * 5.0);          // soft influence zone

      vec2  amplified = ambientWarp * (1.0 + uMouseVel * 10.0 * zone);
      vec2  radial    = normalize(delta + vec2(1e-5)) * uMouseVel * 0.018 * zone;
      vec2  warp      = amplified + radial;

      // Soften toward screen edges so distortion doesn't wrap at borders
      vec2 edgeFade = smoothstep(0.0, 0.08, vUv) * smoothstep(1.0, 0.92, vUv);
      warp *= edgeFade.x * edgeFade.y;

      vec2 uv = clamp(vUv + warp, 0.001, 0.999);
      gl_FragColor = texture2D(tDiffuse, uv);
    }
  `,
};

export function createRippleEffect() {
  const pass = new ShaderPass(LiquidDistortShader);

  function update(nx, ny, vel, time) {
    pass.uniforms.uTime.value     = time;
    pass.uniforms.uMouseUV.value.set(nx, 1.0 - ny);
    pass.uniforms.uMouseVel.value = vel;
  }

  return { pass, update };
}
