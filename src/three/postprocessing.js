import * as THREE from "three";
import { EffectComposer }  from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass }      from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass }      from "three/examples/jsm/postprocessing/ShaderPass.js";
import { SSAOPass }        from "three/examples/jsm/postprocessing/SSAOPass.js";
import { BokehPass }       from "three/examples/jsm/postprocessing/BokehPass.js";

// ---------- Liquid Cursor ----------
const LiquidCursorShader = {
  uniforms: {
    tDiffuse:    { value: null },
    uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
    uTime:       { value: 0.0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
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
    uniform vec2  uMouse;
    uniform float uTime;
    uniform vec2  uResolution;
    varying vec2  vUv;

    // Low-frequency flowing noise — large slow waves for mercury feel
    float liqNoise(vec2 p) {
      float a = sin(p.x * 1.8 + uTime * 0.38) * cos(p.y * 1.5 + uTime * 0.31) * 0.55;
      float b = sin(p.x * 3.2 - uTime * 0.52 + p.y * 2.7 + 1.3)               * 0.28;
      float c = cos(p.x * 5.1 + p.y * 3.9    + uTime * 0.74 + 2.7)            * 0.17;
      return a + b + c;
    }

    // Secondary noise layer offset in space — makes the blob morph asymmetrically
    float liqNoise2(vec2 p) {
      float a = sin(p.y * 2.3 + uTime * 0.44 + 1.1) * cos(p.x * 1.9 + uTime * 0.29) * 0.55;
      float b = cos(p.x * 4.1 + p.y * 2.5    - uTime * 0.61 + 3.5)                   * 0.45;
      return a + b;
    }

    void main() {
      vec2 uv      = vUv;
      float aspect = uResolution.x / uResolution.y;

      vec2  d    = (uv - uMouse) * vec2(aspect, 1.0);
      float dist = length(d);

      // Larger blob that breathes slowly
      float radius = 0.20 + sin(uTime * 0.42) * 0.012;

      // Two noise layers shift the edge in different directions — organic morphing boundary
      float n1 = liqNoise(uv * 2.2)  * 0.052;
      float n2 = liqNoise2(uv * 1.8) * 0.038;
      float eDist = dist + n1 + n2;

      if (eDist < radius) {
        vec2  dir     = (dist > 0.001) ? d / dist : vec2(0.0);
        float falloff = smoothstep(radius, 0.0, eDist);

        // Strong swirl — blob visibly rotates as it flows
        float angle  = atan(d.y, d.x);
        float swirl  = sin(angle * 2.0 + uTime * 0.9) * 0.072 * falloff;
        vec2  perp   = vec2(-dir.y, dir.x);

        // Internal fluid turbulence (slow rolling waves inside the blob)
        vec2 turb = vec2(
          sin(uv.y * 6.0 + uTime * 0.55) * 0.018,
          cos(uv.x * 5.0 + uTime * 0.48) * 0.018
        ) * falloff;

        // Lens push + swirl + internal turbulence
        vec2 disp = dir * (0.18 * falloff) + perp * swirl + turb;
        disp.x /= aspect;

        // Chromatic split — wider split toward center (reversed: stronger magnification)
        float r = texture2D(tDiffuse, uv - disp * 1.22).r;
        float g = texture2D(tDiffuse, uv - disp        ).g;
        float b = texture2D(tDiffuse, uv - disp * 0.78 ).b;

        // Animated glow ring — pulses with the noise deformation
        float ringInner = radius * 0.80 + n1 * 0.5;
        float ringOuter = radius * 0.96 + n1 * 0.5;
        float ring = smoothstep(ringInner - 0.008, ringInner + 0.008, eDist)
                   - smoothstep(ringOuter - 0.006, ringOuter,         eDist);
        vec3 col = vec3(r, g, b) + ring * vec3(0.35, 0.50, 1.0) * 0.65;

        gl_FragColor = vec4(col, 1.0);
      } else {
        gl_FragColor = texture2D(tDiffuse, uv);
      }
    }
  `,
};

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

  // 6. Liquid cursor distortion — desktop only
  let liquid = null;
  if (!isMobile) {
    liquid = new ShaderPass(LiquidCursorShader);
    liquid.uniforms.uResolution.value.set(w, h);
    composer.addPass(liquid);
  }

  // 7. Film grain + vignette — always last pass (mobile: grain disabled, vignette only)
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
    liquid,
    grainVignette,
    setSize(newW, newH) {
      composer.setSize(newW, newH);
      if (bloom)   bloom.setSize(newW, newH);
      if (ssao)    ssao.setSize(newW, newH);
      if (liquid)  liquid.uniforms.uResolution.value.set(newW, newH);
    },
  };
}
