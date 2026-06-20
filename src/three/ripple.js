import * as THREE from "three";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

// Cloth-wind UV warp — adapted from vertex displacement shader to screen-space distortion.
// Same wave equations (wave1/wave2/wave3 + gust) but applied as UV offset instead of Z displacement.
const ClothWindShader = {
  uniforms: {
    tDiffuse:      { value: null },
    uTime:         { value: 0.0 },
    uWindStrength: { value: 0.0 },
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
    uniform float     uWindStrength;
    varying vec2      vUv;

    void main() {
      // Cloth wind waves — same math as vertex shader but mapped to UV warp
      float wave1   = sin(vUv.x * 5.0  + uTime * 2.0);
      float wave2   = sin(vUv.x * 12.0 + uTime * 4.0 + vUv.y * 5.0);
      float wave3   = sin(uTime * 1.5);
      float ripples = wave1 * 0.5 + wave2 * 0.2 + wave3 * 0.3;

      vec2 warp;
      warp.x = ripples * 0.013;
      warp.y = sin(vUv.y * 6.0 + uTime * 1.8 + wave1 * 1.2) * 0.009;
      warp  *= uWindStrength;

      // Fade at screen edges to avoid border seams
      vec2 ef = smoothstep(0.0, 0.07, vUv) * smoothstep(1.0, 0.93, vUv);
      warp   *= ef.x * ef.y;

      gl_FragColor = texture2D(tDiffuse, clamp(vUv + warp, 0.001, 0.999));
    }
  `,
};

export function createRippleEffect() {
  const pass = new ShaderPass(ClothWindShader);

  function update(time, windStrength) {
    pass.uniforms.uTime.value         = time;
    pass.uniforms.uWindStrength.value = windStrength;
  }

  return { pass, update };
}
