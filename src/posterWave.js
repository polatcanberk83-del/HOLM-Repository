import * as THREE from "three";

// ─── Vertex shader — paper flexing in the wind ─────────────────────
// Two orthogonal traveling sine waves displace the plane along z. A
// pointer term adds a soft bulge toward the cursor. A brightness term
// carries out to the fragment shader so the surface "shades itself"
// even without a real light — the peaks read brighter, valleys dimmer.
const VERT = /* glsl */`
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
uniform vec2  uMouse;
uniform float uMouseStrength;
varying vec2  vUv;
varying float vShade;

void main() {
  vUv = uv;
  vec3 pos = position;

  float w1 = sin(pos.x * uFreq          + uTime * 0.85);
  float w2 = sin(pos.y * uFreq * 0.82   - uTime * 0.62 + 0.5);
  float wave = (w1 + w2 * 0.72) * uAmp;

  // Radial bulge toward the mouse position (in plane space)
  float md = distance(pos.xy, uMouse);
  float mouseWave = exp(-md * 3.4) * uAmp * 3.2 * uMouseStrength;

  pos.z += wave + mouseWave;

  // Fake illumination — brighter on positive-z tilt, darker on negative
  vShade = 0.86 + wave * 3.4 + mouseWave * 2.2;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FRAG = /* glsl */`
uniform sampler2D uMap;
uniform float     uOpacity;
varying vec2      vUv;
varying float     vShade;

void main() {
  vec4 col = texture2D(uMap, vUv);
  gl_FragColor = vec4(col.rgb * vShade, col.a * uOpacity);
}
`;

// ─── PosterWave ────────────────────────────────────────────────────
// A tiny self-contained Three.js renderer that takes over a DOM
// container, loads an image as a texture, and paints it onto a
// subdivided plane with a wave shader. The <img> tag inside the
// container is used as the loading source (and hidden once WebGL is
// ready) so a broken WebGL context still leaves a usable image.
export class PosterWave {
  constructor(container, {
    imageUrl,
    subdivisions = [64, 48],
    amp          = 0.045,
    freq         = 3.4,
  } = {}) {
    this.container = container;
    this._active   = true;
    this._prevMs   = performance.now();

    this.canvas = document.createElement("canvas");
    this.canvas.className = "holm-poster-wave__canvas";
    // Fill the container. Positioned so it overlays the fallback <img>.
    Object.assign(this.canvas.style, {
      position: "absolute",
      inset:    "0",
      width:    "100%",
      height:   "100%",
      display:  "block",
    });
    container.appendChild(this.canvas);

    this.renderer = new THREE.WebGLRenderer({
      canvas:    this.canvas,
      antialias: true,
      alpha:     true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene  = new THREE.Scene();
    // Orthographic — the wave is a 2D "paper" facing the viewer, so
    // perspective would just add unwanted keystone as vertices displace
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 1;

    // Track image aspect so the plane matches the container's shape
    this._imageAspect = 4 / 3;
    this._subdiv      = subdivisions;

    this.material = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime:          { value: 0 },
        uAmp:           { value: amp },
        uFreq:          { value: freq },
        uMouse:         { value: new THREE.Vector2(-5, -5) },
        uMouseStrength: { value: 0 },
        uOpacity:       { value: 1.0 },
        uMap:           { value: null },
      },
      transparent: true,
    });

    this.geometry = new THREE.PlaneGeometry(2, 2, ...this._subdiv);
    this.mesh     = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    // Load the texture. Hide the fallback <img> once we're ready.
    new THREE.TextureLoader().load(
      imageUrl,
      (tex) => {
        tex.colorSpace   = THREE.SRGBColorSpace;
        tex.minFilter    = THREE.LinearFilter;
        tex.magFilter    = THREE.LinearFilter;
        tex.anisotropy   = this.renderer.capabilities.getMaxAnisotropy();
        this.material.uniforms.uMap.value = tex;
        if (tex.image?.width) {
          this._imageAspect = tex.image.width / tex.image.height;
        }
        this._resize();
        const img = container.querySelector("img");
        if (img) img.style.opacity = "0";
      },
      undefined,
      (err) => console.error("[posterWave] texture failed to load", err),
    );

    // Pointer + resize handlers
    this._onPointerMove  = this._onPointerMove.bind(this);
    this._onPointerLeave = this._onPointerLeave.bind(this);
    container.addEventListener("pointermove", this._onPointerMove, { passive: true });
    container.addEventListener("pointerleave", this._onPointerLeave);

    this._resizeObs = new ResizeObserver(() => this._resize());
    this._resizeObs.observe(container);

    this._resize();
    this._tick = this._tick.bind(this);
    this._rafId = requestAnimationFrame(this._tick);
  }

  _resize() {
    const rect = this.container.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    this.renderer.setSize(w, h, false);

    // Fit the image "cover"-style — plane scaled so the shorter edge
    // matches the container and the excess is cropped visually by the
    // container's overflow hidden.
    const containerAspect = w / h;
    const imgAspect       = this._imageAspect || 4 / 3;
    let planeW = 2, planeH = 2;
    if (containerAspect > imgAspect) {
      planeH = 2 * (imgAspect / containerAspect);
    } else {
      planeW = 2 * (containerAspect / imgAspect);
    }
    // Rebuild the plane geometry at the new aspect — cheap enough to do
    // on every resize and keeps subdivision density right at any size.
    this.geometry.dispose();
    this.geometry = new THREE.PlaneGeometry(planeW, planeH, ...this._subdiv);
    this.mesh.geometry = this.geometry;
  }

  _onPointerMove(e) {
    const rect = this.container.getBoundingClientRect();
    // Normalise to plane space (-1..1) matching the geometry extents
    const nx = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    const ny = -(((e.clientY - rect.top ) / rect.height) * 2 - 1);
    // Scale to plane's actual half-extents
    const planeW = this.geometry.parameters.width  * 0.5;
    const planeH = this.geometry.parameters.height * 0.5;
    this.material.uniforms.uMouse.value.set(nx * planeW, ny * planeH);
    // Ease the strength up while the cursor is inside
    this._mouseStrTarget = 1.0;
  }
  _onPointerLeave() {
    this._mouseStrTarget = 0.0;
    // Push the mouse position far off-plane so the exp() falloff dies
    this.material.uniforms.uMouse.value.set(-5, -5);
  }

  _tick(now) {
    if (!this._active) return;
    const dt = Math.min((now - this._prevMs) / 1000, 0.05);
    this._prevMs = now;

    this.material.uniforms.uTime.value += dt;

    // Ease mouse strength toward its target so entering/leaving is soft
    const target = this._mouseStrTarget ?? 0;
    const cur    = this.material.uniforms.uMouseStrength.value;
    this.material.uniforms.uMouseStrength.value = cur + (target - cur) * 0.12;

    this.renderer.render(this.scene, this.camera);
    this._rafId = requestAnimationFrame(this._tick);
  }

  destroy() {
    this._active = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this.container.removeEventListener("pointermove",  this._onPointerMove);
    this.container.removeEventListener("pointerleave", this._onPointerLeave);
    this._resizeObs?.disconnect();
    this.geometry.dispose();
    this.material.dispose();
    this.material.uniforms.uMap.value?.dispose?.();
    this.renderer.dispose();
    this.renderer.forceContextLoss?.();
    if (this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
  }
}
