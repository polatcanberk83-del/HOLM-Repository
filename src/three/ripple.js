import * as THREE from "three";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

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

    float hash21(vec2 p) {
      p = fract(p * vec2(127.1, 311.7));
      p += dot(p, p + 19.19);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash21(i),                    hash21(i + vec2(1.0, 0.0)), u.x),
        mix(hash21(i + vec2(0.0, 1.0)),   hash21(i + vec2(1.0, 1.0)), u.x),
        u.y
      ) * 2.0 - 1.0;
    }

    vec2 fbm2(vec2 p) {
      vec2  v   = vec2(0.0);
      float amp = 0.5;
      v.x += noise(p)                        * amp;
      v.y += noise(p + vec2(5.2, 1.3))       * amp;
      p *= 2.1; amp *= 0.5;
      v.x += noise(p)                        * amp;
      v.y += noise(p + vec2(5.2, 1.3))       * amp;
      p *= 2.1; amp *= 0.5;
      v.x += noise(p)                        * amp;
      v.y += noise(p + vec2(5.2, 1.3))       * amp;
      p *= 2.1; amp *= 0.5;
      v.x += noise(p)                        * amp;
      v.y += noise(p + vec2(5.2, 1.3))       * amp;
      return v;
    }

    void main() {
      // Layer A — ambient: drifting noise, always visible even with no mouse input
      vec2 scroll   = vec2(uTime * 0.12, uTime * 0.08);
      vec2 ambWarp  = fbm2(vUv * 1.8 + scroll) * 0.032;

      // Layer B — cursor zone: gentle amplify + small radial push
      vec2  delta   = vUv - uMouseUV;
      float distSq  = dot(delta, delta);
      float zone    = exp(-distSq * 4.0);

      vec2  warp    = ambWarp * (1.0 + uMouseVel * 3.5 * zone)
                    + normalize(delta + vec2(1e-5)) * uMouseVel * 0.012 * zone;

      // Fade near edges so UV wrapping doesn't show
      vec2 ef  = smoothstep(0.0, 0.07, vUv) * smoothstep(1.0, 0.93, vUv);
      warp    *= ef.x * ef.y;

      gl_FragColor = texture2D(tDiffuse, clamp(vUv + warp, 0.001, 0.999));
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
