import * as THREE from "three";
import { EffectComposer }  from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass }      from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass }      from "three/examples/jsm/postprocessing/ShaderPass.js";
import { SSAOPass }        from "three/examples/jsm/postprocessing/SSAOPass.js";
import { BokehPass }       from "three/examples/jsm/postprocessing/BokehPass.js";

// ---------- Chromatic Aberration ----------
const ChromaShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount:   { value: 0.010 },
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
    uniform float amount;
    varying vec2 vUv;
    void main() {
      vec2 dir   = vUv - 0.5;
      float dist = length(dir);
      vec2 off   = dir * dist * amount;
      float r = texture2D(tDiffuse, vUv + off).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - off).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
};

// ---------- Film Grain + Vignette (single pass, last in chain) ----------
const GrainVignetteShader = {
  uniforms: {
    tDiffuse:  { value: null },
    uTime:     { value: 0.0 },
    uGrainAmp: { value: 0.04 },
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
    uniform float uTime;
    uniform float uGrainAmp;
    varying vec2 vUv;

    float filmGrain(vec2 uv, float t) {
      vec2 seed = uv * vec2(t * 127.1, t * 311.7);
      return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // Film grain — skipped on mobile (uGrainAmp = 0)
      color.rgb += filmGrain(vUv, uTime) * uGrainAmp;

      // Vignette — smooth darkening toward edges
      vec2  vig         = (vUv - 0.5) * 2.0;
      float vigDist     = length(vig);
      float vignette    = 1.0 - smoothstep(0.3, 1.2, vigDist);
      color.rgb        *= vignette;

      gl_FragColor = color;
    }
  `,
};

export function createPostProcessing(renderer, scene, camera, isMobile = false) {
  const w = window.innerWidth;
  const h = window.innerHeight;

  const composer = new EffectComposer(renderer);

  // 1. Render pass
  composer.addPass(new RenderPass(scene, camera));

  let ssao = null, bokeh = null;

  if (!isMobile) {
    // 2. SSAO — desktop only
    ssao = new SSAOPass(scene, camera, w, h);
    ssao.kernelRadius  = 8;
    ssao.minDistance   = 0.005;
    ssao.maxDistance   = 0.1;
    composer.addPass(ssao);
  }

  // 3. Bloom — lighter + half-res on mobile (4× less GPU fill for blur passes)
  const bloom = new UnrealBloomPass(
    isMobile ? new THREE.Vector2(w / 2, h / 2) : new THREE.Vector2(w, h),
    isMobile ? 0.18 : 0.25,
    isMobile ? 0.35 : 0.4,
    isMobile ? 0.92 : 0.9,
  );
  composer.addPass(bloom);

  if (!isMobile) {
    // 4. Bokeh — desktop only
    bokeh = new BokehPass(scene, camera, {
      focus:    4.0,
      aperture: 0.0001,
      maxblur:  0.005,
    });
    composer.addPass(bokeh);
  }

  // 5. Chromatic aberration — desktop only
  let chroma = null;
  if (!isMobile) {
    chroma = new ShaderPass(ChromaShader);
    composer.addPass(chroma);
  }

  // 6. Film grain + vignette — always last pass (mobile: grain disabled, vignette only)
  const grainVignette = new ShaderPass(GrainVignetteShader);
  if (isMobile) grainVignette.uniforms.uGrainAmp.value = 0;
  grainVignette.renderToScreen = true;
  composer.addPass(grainVignette);

  return {
    composer,
    bloom,
    chroma,
    ssao,
    bokeh,
    grainVignette,
    setSize(newW, newH) {
      composer.setSize(newW, newH);
      if (bloom) bloom.setSize(newW, newH);
      if (ssao)  ssao.setSize(newW, newH);
    },
  };
}
