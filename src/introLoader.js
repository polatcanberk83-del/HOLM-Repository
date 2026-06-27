import * as THREE from "three";
import gsap from "gsap";
import logoUrl from "./assets/holm-logo.svg";

// ── Vertex shader ────────────────────────────────────────────────────────────
const VERT = /* glsl */`
uniform float uTime, uWindStrength, uFabricFreq, uTear;
varying vec2  vUv;
varying float vZ;

void main() {
  vUv = uv;
  vec3 pos = position;

  float looseFactor  = 1.0 - uv.y;
  float pinInfluence = pow(looseFactor, 1.4);

  float wave1   = sin(uv.x *  5.0 + uTime * 2.0);
  float wave2   = sin(uv.x * 12.0 + uTime * 4.0 + uv.y * 5.0);
  float wave3   = sin(uTime * 1.5);
  float ripples = wave1 * 0.5 + wave2 * 0.2 + wave3 * 0.3;

  float windAmp = uWindStrength * (1.0 + uTear * 5.0);
  float disp    = (windAmp * 2.0 + ripples * uFabricFreq) * pinInfluence;

  pos.y += sin(disp) * 0.1 * pinInfluence;
  pos.z += disp;

  float side = sign(uv.x - 0.5);
  float te   = uTear * uTear;
  pos.x += side * te * 0.5;
  pos.z += te * 0.7 * abs(uv.x - 0.5) * 2.0;

  vZ = disp;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// ── Noise helpers ────────────────────────────────────────────────────────────
const FRAG_NOISE = /* glsl */`
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                          + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                           dot(x12.zw,x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x   + h.x  * x0.y;
  g.yz = a0.yz * x12.xz  + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 x, float seed) {
  float v = 0.0, a = 0.5;
  vec2  shift = vec2(100.0);
  mat2  rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 5; i++) {
    v += a * snoise(x + vec2(seed));
    x  = rot * x * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}
`;

// ── Fragment shader ──────────────────────────────────────────────────────────
const FRAG_MAIN = /* glsl */`
uniform sampler2D uLogoTex;
uniform float uLogoReady, uLogoH, uLogoAspect, uSheetAspect;
uniform vec3  uPaperColor, uInk, uEdgeShadowColor;
uniform float uEdgeScale, uEdgeAmp, uFrameSize;
uniform float uScratchAmp, uGrainAmp, uVignette;
uniform float uSeed, uShadowOpacity, uEdgeShadowOpacity, uTear;

varying vec2  vUv;
varying float vZ;

void main() {
  vec2 uv = vUv - 0.5;

  // ── Tear gap ──────────────────────────────────────────────────
  float seam  = 0.5 + snoise(vec2(vUv.y * 7.0, uSeed)) * 0.04;
  // Increased jag multiplier (0.10 vs 0.06) for more ragged tear edge
  float jag   = fbm(vec2(vUv.y * 16.0, uSeed + 3.0), uSeed) * 0.10;
  float gap   = uTear * 0.55;
  float dseam = abs(vUv.x - seam);
  if (dseam < gap + jag * uTear) discard;

  // ── Ragged cloth edge ─────────────────────────────────────────
  float noise       = fbm(uv * uEdgeScale, uSeed);
  float dist        = max(abs(uv.x), abs(uv.y));
  float raggedDist  = dist + noise * uEdgeAmp;
  float borderLimit = 0.5 - uFrameSize;
  float a = 1.0 - smoothstep(borderLimit, borderLimit + 0.01, raggedDist);
  if (a < 0.01) discard;

  // ── Paper base ────────────────────────────────────────────────
  float paperGrain = fbm(vUv * 60.0, uSeed);
  vec3  col = uPaperColor - paperGrain * 0.05;

  // ── Ink logo (deforms with cloth) ────────────────────────────
  vec2  cc  = vUv - 0.5;
  float lh  = uLogoH;
  float lw  = lh * uLogoAspect / uSheetAspect;
  vec2  luv = vec2(cc.x / lw, cc.y / lh) + 0.5;
  float inR = step(0.0, luv.x) * step(luv.x, 1.0)
            * step(0.0, luv.y) * step(luv.y, 1.0);
  vec4  lt  = texture2D(uLogoTex, luv);
  col = mix(col, uInk, lt.a * inR * uLogoReady);

  // ── Surface detail ────────────────────────────────────────────
  float scratches = snoise(vec2(vUv.x * 300.0, vUv.y * 3.0));
  float dust      = fbm(vUv * 40.0 + vec2(uSeed), uSeed);
  col = mix(col, vec3(0.6, 0.5, 0.4), dust * uGrainAmp);
  col -= scratches * uScratchAmp;
  col -= length(uv) * uVignette;
  col += vZ * uShadowOpacity;

  // ── Outer edge darkening ──────────────────────────────────────
  float edgeShadow = smoothstep(borderLimit - 0.05, borderLimit, raggedDist);
  col = mix(col, uEdgeShadowColor, edgeShadow * uEdgeShadowOpacity);

  // ── Tear edge shadow ──────────────────────────────────────────
  float tearEdge = 1.0 - smoothstep(0.0, 0.045, dseam - (gap + jag * uTear));
  col = mix(col, uEdgeShadowColor, tearEdge * 0.55 * step(0.01, uTear));

  gl_FragColor = vec4(col, a);
}
`;

// Diamond SVG path (84×84 viewBox, top → right → bottom → left → top)
const DIAMOND_PATH  = "M42,5 L79,42 L42,79 L5,42 Z";
// Perimeter: 4 × √(37² + 37²) = 4 × 37√2 ≈ 209.3
const DIAMOND_PERIM = 4 * 37 * Math.SQRT2;

// ── IntroLoader class ────────────────────────────────────────────────────────
export class IntroLoader {
  constructor(opts = {}) {
    this.tearDuration = opts.tearDuration ?? 2.8;   // slow, cinematic
    this.edgeAmp      = opts.edgeAmp      ?? 0.04;
    this.grainAmp     = opts.grainAmp     ?? 0.05;
    this.logoH        = opts.logoH        ?? 0.24;

    this.active = false;
    this.scene  = null;
    this.camera = null;

    this._mat       = null;
    this._mesh      = null;
    this._container = null;
    this._diamondFill = null;
    this._ringPct   = null;
    this._blobUrl   = null;

    this._targetProgress = 0;
    this._dispProgress   = 0;
    this._frames         = 0;

    this._lenis         = null;
    this._onComplete    = null;
    this._isMobile      = false;
    this._resizeHandler = null;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  init({ renderer, composer, lenis, isMobile, onComplete }) {
    this._renderer   = renderer;
    this._lenis      = lenis;
    this._onComplete = onComplete;
    this._isMobile   = isMobile;

    this.camera = new THREE.PerspectiveCamera(
      45, window.innerWidth / window.innerHeight, 0.1, 10,
    );
    this.camera.position.z = 2.5;
    this.scene = new THREE.Scene();

    // Blank 1×1 texture so sampler never gets null before logo loads
    const blankTex = new THREE.DataTexture(
      new Uint8Array([255, 255, 255, 0]), 1, 1, THREE.RGBAFormat,
    );
    blankTex.needsUpdate = true;

    this._mat = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG_NOISE + FRAG_MAIN,
      uniforms: {
        uTime:              { value: 0 },
        uWindStrength:      { value: 0.18 },
        uFabricFreq:        { value: 0.45 },
        uTear:              { value: 0 },
        uLogoTex:           { value: blankTex },
        uLogoReady:         { value: 0 },
        uLogoH:             { value: this.logoH },
        uLogoAspect:        { value: 441 / 180 },
        uSheetAspect:       { value: 1.0 },
        uPaperColor:        { value: new THREE.Color(0xeae3d4) },
        uInk:               { value: new THREE.Color(0x161510) },
        uEdgeShadowColor:   { value: new THREE.Color(0x000000) },
        uEdgeScale:         { value: 8.8 },
        uEdgeAmp:           { value: this.edgeAmp },
        uFrameSize:         { value: 0.0 },
        uScratchAmp:        { value: 0.012 },
        uGrainAmp:          { value: this.grainAmp },
        uVignette:          { value: 0.25 },
        uSeed:              { value: Math.random() * 5 },
        uShadowOpacity:     { value: 0.42 },
        uEdgeShadowOpacity: { value: 0.12 },
      },
      transparent: true,
      side:        THREE.DoubleSide,
      depthTest:   false,
      depthWrite:  false,
    });

    const segs = isMobile ? 48 : 80;
    this._mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1, segs, segs),
      this._mat,
    );
    this.scene.add(this._mesh);

    this._resizeHandler = () => this._recomputeSize();
    window.addEventListener("resize", this._resizeHandler);
    this._recomputeSize();

    this._loadLogo();
    this._createDOM();

    this.active = true;
  }

  setProgress(t) {
    this._targetProgress = Math.max(0, Math.min(1, t));
  }

  update(elapsed) {
    if (!this.active) return;
    this._frames++;

    // Wind gust — two overlapping sine harmonics for organic feel
    const g = Math.max(0,
      Math.sin(elapsed * 0.7) + 0.5 * Math.sin(elapsed * 2.3) + 0.5,
    );
    this._mat.uniforms.uWindStrength.value = g * 0.18 * 0.3 + 0.05;
    this._mat.uniforms.uTime.value = elapsed;

    // Lerped progress → diamond ring
    this._dispProgress += (this._targetProgress - this._dispProgress) * 0.08;
    const pct    = Math.min(Math.round(this._dispProgress * 100), 100);
    const offset = (DIAMOND_PERIM * (1 - this._dispProgress)).toFixed(2);
    if (this._diamondFill) {
      this._diamondFill.setAttribute("stroke-dashoffset", offset);
    }
    if (this._ringPct) this._ringPct.textContent = pct + "%";
  }

  start() {
    if (!this.active || this._frames < 2) return;

    const mat      = this._mat;
    const indicator = this._container?.querySelector(".intro-diamond-wrap");
    const dur      = this._isMobile ? 2.0 : this.tearDuration;
    const self     = this;

    const tl = gsap.timeline();
    if (indicator) {
      tl.to(indicator, { opacity: 0, duration: 0.5, ease: "power2.out" });
    }
    // Slight pause at zero tear so user registers the cloth before it tears
    tl.to(mat.uniforms.uTear, {
      value: 1,
      duration: dur,
      ease: "power1.in",   // very gradual start — feels like resistance giving way
    }, "-=0.05")
      .add(() => {
        self.active = false;
        if (self._onComplete) self._onComplete();
        if (self._lenis)      self._lenis.start();
        self.destroy();
      });
  }

  destroy() {
    this.active = false;
    if (this._resizeHandler) {
      window.removeEventListener("resize", this._resizeHandler);
      this._resizeHandler = null;
    }
    if (this._mesh) {
      this._mesh.geometry.dispose();
      this._mat.uniforms.uLogoTex.value?.dispose();
      this._mat.dispose();
      this.scene?.remove(this._mesh);
      this._mesh = null;
    }
    if (this._blobUrl) {
      URL.revokeObjectURL(this._blobUrl);
      this._blobUrl = null;
    }
    if (this._container?.parentNode) {
      this._container.parentNode.removeChild(this._container);
      this._container = null;
    }
  }

  // ── Private ──────────────────────────────────────────────────────────────

  _recomputeSize() {
    if (!this.camera || !this._mesh || !this._mat) return;

    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    const dist = 2.5;
    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(45) / 2) * dist;
    const visW = visH * aspect;

    // 95% of viewport — nearly full coverage, still shows edges
    let sheetW = visW * 0.95;
    let sheetH = visH * 0.95;
    // Portrait / mobile guard — never overflow horizontally
    if (sheetW > visW * 0.97) sheetW = visW * 0.97;

    this._mesh.scale.set(sheetW, sheetH, 1);
    this._mat.uniforms.uSheetAspect.value = sheetW / sheetH;
  }

  async _loadLogo() {
    try {
      const resp    = await fetch(logoUrl);
      const svgText = await resp.text();
      const whiteSvg = svgText.replace(/currentColor/g, "#ffffff");
      const blob     = new Blob([whiteSvg], { type: "image/svg+xml" });
      this._blobUrl  = URL.createObjectURL(blob);

      const W = 1024;
      const H = Math.round(1024 / (441 / 180));

      const img = new Image();
      img.onload = () => {
        if (!this._mat) return;
        const cv = document.createElement("canvas");
        cv.width  = W; cv.height = H;
        cv.getContext("2d").drawImage(img, 0, 0, W, H);
        const tex = new THREE.CanvasTexture(cv);
        tex.minFilter = tex.magFilter = THREE.LinearFilter;
        this._mat.uniforms.uLogoTex.value   = tex;
        this._mat.uniforms.uLogoReady.value = 1;
      };
      img.src = this._blobUrl;
    } catch (err) {
      console.warn("[IntroLoader] logo load failed:", err);
    }
  }

  _createDOM() {
    const perim = DIAMOND_PERIM.toFixed(2); // ≈ 209.3

    const container = document.createElement("div");
    container.id    = "holm-intro-overlay";

    // Diamond SVG: top → right → bottom → left, drawn with ink tones on cream
    container.innerHTML = `
      <div class="intro-diamond-wrap">
        <svg class="intro-diamond-svg" width="72" height="72" viewBox="0 0 84 84">
          <!-- track outline -->
          <path d="${DIAMOND_PATH}"
            fill="none"
            stroke="rgba(22,21,16,0.18)"
            stroke-width="1"
            stroke-linejoin="miter"/>
          <!-- progress fill — drawn like ink from top point, clockwise -->
          <path class="intro-diamond-fill"
            d="${DIAMOND_PATH}"
            fill="none"
            stroke="rgba(22,21,16,0.82)"
            stroke-width="2"
            stroke-dasharray="${perim}"
            stroke-dashoffset="${perim}"
            stroke-linecap="round"
            stroke-linejoin="round"/>
        </svg>
        <span class="intro-diamond-pct">0%</span>
      </div>
    `;

    Object.assign(container.style, {
      position: "fixed", inset: "0",
      pointerEvents: "none", zIndex: "20",
    });

    const wrap = container.querySelector(".intro-diamond-wrap");
    Object.assign(wrap.style, {
      position:       "absolute",
      bottom:         "5vh",
      right:          "5vw",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      gap:            "6px",
    });

    const pct = container.querySelector(".intro-diamond-pct");
    Object.assign(pct.style, {
      fontFamily:    "'Helvetica Neue', Arial, sans-serif",
      fontSize:      "0.58rem",
      letterSpacing: "0.16em",
      color:         "rgba(22,21,16,0.52)",
    });

    document.body.appendChild(container);
    this._container   = container;
    this._diamondFill = container.querySelector(".intro-diamond-fill");
    this._ringPct     = pct;
  }
}
