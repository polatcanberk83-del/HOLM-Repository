import * as THREE from "three";
import gsap from "gsap";
import { RoomEnvironment }  from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer }   from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass }       from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass }  from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass }       from "three/examples/jsm/postprocessing/OutputPass.js";
import "./philosophy.css";

// ─── Tunables ────────────────────────────────────────────────────────
const IDLE_SPIN_SPEED    = 0.16;       // rad/s — never stops
const POS_LERP           = 0.09;       // per-frame lerp toward beat target (@60fps)
const SCROLL_TILT_MAX    = 0.18;       // rad — X tilt at scroll = 1
const CAM_Z_BASE         = 5.6;

// Diamond material — pushed brighter/gemmier now that text lives beside it
const ENVMAP_INTENSITY   = 1.85;
const KEY_LIGHT_STR      = 4.4;
const FILL_LIGHT_STR     = 0.95;
const RIM_LIGHT_STR      = 0.75;
const DISPERSION_BASE    = 5.2;        // r166+
const DISPERSION_PRESSURE = 3.6;       // added at the "pressure" beat when scale drops
const IRIDESCENCE        = 0.72;
const IRID_THICKNESS     = [220, 780];
const THICKNESS_DESKTOP  = 1.7;
const THICKNESS_MOBILE   = 1.0;

// Beats — each has a diamond target (screen-space nx/ny/scale) and a text side.
// y positive = up, x positive = right, in normalized screen units.
// Anchored to DOM sections; a weighted blend of each section's viewport-center
// distance drives the diamond target so the gem stays aligned with its stanza.
const BEATS = [
  { x:  0.00, y:  0.00, scale: 1.20, side: null,            hasText: false },  // 0 intro
  { x:  0.34, y:  0.03, scale: 1.00, side: "left",          hasText: true  },  // 1 R / text L
  { x: -0.34, y: -0.05, scale: 1.24, side: "right",         hasText: true  },  // 2 L / text R
  { x:  0.00, y:  0.08, scale: 0.62, side: "left",          hasText: true  },  // 3 pressure small center / text L
  { x: -0.30, y:  0.06, scale: 1.18, side: "right",         hasText: true  },  // 4 L / text R
  { x:  0.28, y: -0.04, scale: 1.28, side: "left",          hasText: true  },  // 5 R / text L
  { x:  0.00, y:  0.02, scale: 1.35, side: "center-below",  hasText: true  },  // 6 center-large / text below
];
const WEIGHT_FALLOFF = 1.0;   // viewport heights — how far a beat's anchor influences the blend

const KEY_COLOR    = 0xfff2dc;
const FILL_COLOR   = 0x89b0e4;
const RIM_COLOR    = 0xb8c0ee;

// ─── Particle diamond — surface sample + facet-normal B/W shader ────
const PARTICLE_COUNT     = 6500;    // surface samples — no interior blob
const EDGE_PARTICLE_MULT = 0.55;    // extra points snapped to edges
const PARTICLE_NOISE_AMP = 0.012;   // small — just breath, not blur
const MOUSE_REPEL_RADIUS = 1.05;
const MOUSE_REPEL_FORCE  = 0.35;
const MOUSE_LERP         = 0.16;
const POINT_SIZE_SCALE   = 320.0;

const PARTICLE_VERT = /* glsl */`
attribute vec3  aNormal;
attribute float aSeed;
attribute float aEdge;              // 1.0 for edge-snapped points, 0.0 for surface
uniform   float uTime;
uniform   vec3  uMouseLocal;
uniform   float uPixel;
varying   float vShade;
varying   float vRepel;
varying   float vEdge;
varying   float vSeed;

void main() {
  vec3 base = position;

  // Tiny idle wobble along the local normal so the surface breathes
  float breathe = sin(uTime * 0.6 + aSeed * 9.3) * ${PARTICLE_NOISE_AMP.toFixed(4)};
  base += aNormal * breathe;

  // Mouse repel — along the local normal for a "poke" feel
  vec3  toMouse = base - uMouseLocal;
  float d       = length(toMouse);
  float repel   = 0.0;
  if (d < ${MOUSE_REPEL_RADIUS.toFixed(4)}) {
    float t = 1.0 - d / ${MOUSE_REPEL_RADIUS.toFixed(4)};
    repel   = t * t;
    base   += normalize(toMouse + vec3(0.0001)) * repel * ${MOUSE_REPEL_FORCE.toFixed(4)};
  }

  vec4 mv = modelViewMatrix * vec4(base, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPixel * (${POINT_SIZE_SCALE.toFixed(1)} / -mv.z)
                 * (1.0 + repel * 0.9)
                 * (1.0 + aEdge * 0.6);

  // Facet shading — normal in view space vs view direction
  vec3 nView = normalize(mat3(normalMatrix) * aNormal);
  vec3 vDir  = normalize(-mv.xyz);
  float ndotv = clamp(dot(nView, vDir), 0.0, 1.0);
  float fres  = pow(1.0 - ndotv, 2.6);           // rim highlight

  // B/W grayscale ramp: dark interior → mid facet → bright at rim/edge
  vShade = 0.06 + ndotv * 0.42 + fres * 0.72;
  vShade = clamp(vShade, 0.0, 1.0);
  vRepel = repel;
  vEdge  = aEdge;
  vSeed  = aSeed;
}
`;

const PARTICLE_FRAG = /* glsl */`
uniform float uTime;
varying float vShade;
varying float vRepel;
varying float vEdge;
varying float vSeed;

void main() {
  vec2  c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;

  // Soft sprite with a hot core
  float core  = pow(1.0 - d * 2.0, 1.7);
  float alpha = core * vShade;

  // Edge-snapped points punch harder so facet borders read clearly
  alpha *= (1.0 + vEdge * 0.9);

  // Tiny per-particle twinkle — keeps the surface alive without glitter
  float twinkle = 0.85 + 0.15 * sin(vSeed * 43.1 + uTime * 1.4);
  alpha *= twinkle;

  // Repel adds a whisper of warmth — otherwise strictly grayscale
  vec3 col = mix(vec3(vShade), vec3(1.02, 0.94, 0.82), vRepel * 0.6);

  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`;

// Sample points on the brilliant-cut *surface*, area-weighted, with each
// point carrying its face normal. Also snap a fraction of them to facet
// edges so the outline reads sharply.
function sampleDiamondSurface(mesh, surfaceCount, edgeCount) {
  const geom    = mesh.geometry;
  const posAttr = geom.getAttribute("position");
  const idxAttr = geom.getIndex();
  const triN    = idxAttr.count / 3;

  const v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
  const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), n = new THREE.Vector3();

  const areas = new Float32Array(triN);
  const norms = [];
  let total = 0;
  for (let t = 0; t < triN; t++) {
    v0.fromBufferAttribute(posAttr, idxAttr.getX(t * 3    ));
    v1.fromBufferAttribute(posAttr, idxAttr.getX(t * 3 + 1));
    v2.fromBufferAttribute(posAttr, idxAttr.getX(t * 3 + 2));
    e1.subVectors(v1, v0);
    e2.subVectors(v2, v0);
    n.copy(e1).cross(e2);
    const area = n.length() * 0.5;
    areas[t] = area;
    total += area;
    n.normalize();
    norms.push([n.x, n.y, n.z]);
  }

  const totalCount = surfaceCount + edgeCount;
  const positions  = new Float32Array(totalCount * 3);
  const normals    = new Float32Array(totalCount * 3);
  const seeds      = new Float32Array(totalCount);
  const edgeMark   = new Float32Array(totalCount);

  const write = (i, p, nrm, isEdge) => {
    positions[i * 3    ] = p[0];
    positions[i * 3 + 1] = p[1];
    positions[i * 3 + 2] = p[2];
    normals  [i * 3    ] = nrm[0];
    normals  [i * 3 + 1] = nrm[1];
    normals  [i * 3 + 2] = nrm[2];
    seeds[i]    = Math.random();
    edgeMark[i] = isEdge;
  };

  // Interior barycentric samples
  for (let i = 0; i < surfaceCount; i++) {
    let r = Math.random() * total;
    let ti = 0;
    while (r > areas[ti] && ti < triN - 1) { r -= areas[ti]; ti++; }
    const a = idxAttr.getX(ti * 3    );
    const b = idxAttr.getX(ti * 3 + 1);
    const c = idxAttr.getX(ti * 3 + 2);
    v0.fromBufferAttribute(posAttr, a);
    v1.fromBufferAttribute(posAttr, b);
    v2.fromBufferAttribute(posAttr, c);
    let u = Math.random(), vv = Math.random();
    if (u + vv > 1) { u = 1 - u; vv = 1 - vv; }
    const px = v0.x + u * (v1.x - v0.x) + vv * (v2.x - v0.x);
    const py = v0.y + u * (v1.y - v0.y) + vv * (v2.y - v0.y);
    const pz = v0.z + u * (v1.z - v0.z) + vv * (v2.z - v0.z);
    write(i, [px, py, pz], norms[ti], 0.0);
  }

  // Edge-snapped samples — points along the shared edges of each triangle
  for (let i = 0; i < edgeCount; i++) {
    const ti = Math.floor(Math.random() * triN);
    const a = idxAttr.getX(ti * 3    );
    const b = idxAttr.getX(ti * 3 + 1);
    const c = idxAttr.getX(ti * 3 + 2);
    v0.fromBufferAttribute(posAttr, a);
    v1.fromBufferAttribute(posAttr, b);
    v2.fromBufferAttribute(posAttr, c);
    // Pick one of three edges, then a random position along it
    const eIdx = Math.floor(Math.random() * 3);
    const pA = eIdx === 0 ? v0 : (eIdx === 1 ? v1 : v2);
    const pB = eIdx === 0 ? v1 : (eIdx === 1 ? v2 : v0);
    const s  = Math.random();
    const px = pA.x + (pB.x - pA.x) * s;
    const py = pA.y + (pB.y - pA.y) * s;
    const pz = pA.z + (pB.z - pA.z) * s;
    write(surfaceCount + i, [px, py, pz], norms[ti], 1.0);
  }

  return { positions, normals, seeds, edgeMark };
}

const MANIFESTO = [
  ["Some studios tell stories.",                    "We work toward a single moment."],
  ["The moment a rough idea holds still —",         "and becomes something finished."],
  ["It is rare. It forms under pressure.",          "The way carbon becomes a diamond."],
  ["So that is the shape we keep returning to.",    "Not decoration. A reminder of what we are after."],
  ["Between sketch and masterpiece,",               "there is patience."],
  ["Ready to create your moment."],
];

// Closing CTA — appended after the last stanza inside the final beat
const CTA_LABEL = "Let's talk";
const CTA_HREF  = "/contact/";

// ─── Philosophy page controller ──────────────────────────────────────
export class Philosophy {
  constructor({ lenis } = {}) {
    this.lenis          = lenis || null;
    this._reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this._isMobile      = window.innerWidth < 768 || "ontouchstart" in window;

    // Three.js
    this.renderer  = null;
    this.scene     = null;
    this.camera    = null;
    this.diamond   = null;
    this.envMap    = null;
    this._lights    = [];
    this._heroPlane = null;            // philosophy watermark plane

    // DOM
    this.container = null;
    this.canvas    = null;
    this.blocks    = [];               // beat sections carrying stanzas

    // Anim state
    this._rafId       = null;
    this._active      = false;
    this._prevTime    = 0;
    this._scrollT     = 0;
    this._idleSpin    = 0;
    // CTA magnetic
    this._ctaEl          = null;
    this._ctaMove        = null;
    this._ctaLeave       = null;
    this._ctaSetX        = null;
    this._ctaSetY        = null;
    this._ctaInnerSetX   = null;
    this._ctaInnerSetY   = null;

    // Diamond target (world-space) and current smoothed values
    this._targetPos   = new THREE.Vector3();
    this._targetScale = new THREE.Vector3(1, 1, 1);
    this._targetTilt  = 0;
    this._pressure    = 0;             // 0..1 — how compressed the diamond is

    // Mouse (interactive particle repel)
    this._mouseNdc         = new THREE.Vector2(-99, -99);   // off-screen until move
    this._mouseWorld       = new THREE.Vector3();
    this._mouseWorldSmooth = new THREE.Vector3(999, 999, 999);
    this._invMat           = new THREE.Matrix4();

    // Elapsed time driven off dt so we're timeline-consistent
    this._elapsed = 0;

    // Handlers
    this._onResize       = this._onResize.bind(this);
    this._onLenisScroll  = this._onLenisScroll.bind(this);
    this._onNativeScroll = this._onNativeScroll.bind(this);
    this._onPointerMove  = this._onPointerMove.bind(this);
    this._observer       = null;
  }

  // ── Public API ──────────────────────────────────────────────────
  init() {
    this._createDOM();
    this._createThree();
    this._bindScroll();
    this._bindResize();
    this._bindPointer();
    this._observeBlocks();
    this._bindCtaMagnetic();
    this._startLoop();
  }

  _bindPointer() {
    window.addEventListener("pointermove", this._onPointerMove, { passive: true });
  }
  _onPointerMove(e) {
    this._mouseNdc.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -((e.clientY / window.innerHeight) * 2 - 1),
    );
  }

  destroy() {
    this._active = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("pointermove", this._onPointerMove);
    if (this.lenis && this._lenisScrollBound) {
      this.lenis.off("scroll", this._onLenisScroll);
    } else {
      window.removeEventListener("scroll", this._onNativeScroll);
    }
    if (this._observer)  this._observer.disconnect();
    if (this._ctaMove)  window.removeEventListener("mousemove", this._ctaMove);
    if (this._ctaLeave) window.removeEventListener("mouseleave", this._ctaLeave);

    if (this.diamond) {
      this.diamond.geometry.dispose();
      this.diamond.material.dispose();
    }
    if (this._heroPlane) {
      this._heroPlane.geometry.dispose();
      this._heroPlane.material.map?.dispose();
      this._heroPlane.material.dispose();
    }
    if (this.envMap) this.envMap.dispose();
    for (const l of this._lights) this.scene?.remove(l);

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss?.();
    }
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.renderer = this.scene = this.camera = null;
    this.diamond  = this.envMap = null;
    this.container = this.canvas = null;
  }

  // ── DOM ─────────────────────────────────────────────────────────
  _createDOM() {
    const container = document.createElement("div");
    container.className = "holm-philosophy";
    if (this._reducedMotion) container.classList.add("is-reduced-motion");

    // Text-bearing beats get MANIFESTO stanzas in order
    let textCounter = 0;
    const beatsHtml = BEATS
      .map((beat, scrollIdx) => {
        if (!beat.hasText) return "";
        const stanza  = MANIFESTO[textCounter];
        const isFinal = textCounter === MANIFESTO.length - 1;
        textCounter++;
        const stanzaLines = stanza.map(line => `
          <div class="holm-philosophy__line">
            <span class="holm-philosophy__line-inner">${line}</span>
          </div>
        `).join("");
        const ctaHtml = isFinal ? `
          <a class="holm-philosophy__cta"
             href="${CTA_HREF}"
             aria-label="${CTA_LABEL}"
             data-hover-roll>${CTA_LABEL}</a>
        ` : "";
        return `
          <section class="holm-philosophy__beat"
                   data-beat="${scrollIdx}"
                   data-side="${beat.side}"
                   data-final="${isFinal}">
            <div class="holm-philosophy__stanza">
              ${stanzaLines}
              ${ctaHtml}
            </div>
          </section>
        `;
      }).join("");

    container.innerHTML = `
      <canvas class="holm-philosophy__canvas" aria-hidden="true"></canvas>

      <section class="holm-philosophy__intro" data-beat="0" aria-hidden="true"></section>

      <main class="holm-philosophy__beats">
        ${beatsHtml}
      </main>
    `;
    document.body.appendChild(container);

    this.container = container;
    this.canvas    = container.querySelector(".holm-philosophy__canvas");
    this.blocks    = [...container.querySelectorAll(".holm-philosophy__beat")];
    // Beat DOM anchors — one element per BEATS entry (intro + each text beat).
    // Weighted-blend uses each element's viewport-center distance.
    this._beatEls = [];
    container.querySelectorAll("[data-beat]").forEach((el) => {
      const idx = parseInt(el.dataset.beat, 10);
      if (Number.isFinite(idx) && BEATS[idx]) {
        this._beatEls.push({ el, beat: BEATS[idx] });
      }
    });

    if (!this._reducedMotion) {
      const allLines = container.querySelectorAll(".holm-philosophy__line-inner");
      gsap.set(allLines, { yPercent: 108, opacity: 0 });
    }
  }

  // ── Three.js ────────────────────────────────────────────────────
  _createThree() {
    this.renderer = new THREE.WebGLRenderer({
      canvas:           this.canvas,
      antialias:        true,
      alpha:            false,
      powerPreference:  "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this._isMobile ? 1.5 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.55;
    this.renderer.outputColorSpace    = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = this._buildBackdrop();

    this.camera = new THREE.PerspectiveCamera(
      36, window.innerWidth / window.innerHeight, 0.1, 100,
    );
    this.camera.position.set(0, 0, CAM_Z_BASE);
    this.camera.lookAt(0, 0, 0);

    // Photorealistic env — RoomEnvironment baked through PMREM.
    // This is what Three.js's official glass demos use; it delivers the
    // studio-showcase reflections and refractions that a procedural
    // gradient cannot.
    const pmrem   = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.envMap   = pmrem.fromScene(roomEnv, 0.04).texture;
    pmrem.dispose();
    this.scene.environment          = this.envMap;
    this.scene.environmentIntensity = ENVMAP_INTENSITY;

    // Composer with UnrealBloomPass — makes the sparkle catches read
    // as actual light, not just bright pixels
    this._composer = new EffectComposer(this.renderer);
    this._composer.setPixelRatio(this.renderer.getPixelRatio());
    this._composer.setSize(window.innerWidth, window.innerHeight);
    this._composer.addPass(new RenderPass(this.scene, this.camera));
    this._bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.28,   // strength — a whisper, not a wash
      0.35,   // radius
      0.98,   // threshold — only near-white pixels bloom
    );
    this._composer.addPass(this._bloom);
    this._composer.addPass(new OutputPass());

    // Diamond
    this._createDiamond();

    // "philosophy" watermark plane behind the gem
    this._createHeroPlane();

    // Lights
    this._addLights();
  }

  _createHeroPlane() {
    const cv  = document.createElement("canvas");
    cv.width  = 2560;
    cv.height = 640;
    const ctx = cv.getContext("2d");

    // Canvas defaults to fully transparent — only draw the text, no rectangle
    ctx.fillStyle = "rgba(224, 236, 255, 0.28)";
    ctx.font = "italic 300 480px 'Fraunces', 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("philosophy", cv.width / 2, cv.height / 2 + 30);

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter  = THREE.LinearFilter;
    tex.magFilter  = THREE.LinearFilter;
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const mat = new THREE.MeshBasicMaterial({
      map:         tex,
      transparent: true,
      depthWrite:  false,
      opacity:     1.0,
    });

    // Size the plane to comfortably fill the visible area at its depth.
    // Camera is at z=CAM_Z_BASE, plane sits at z=-8 → distance = camZ+8.
    const HERO_Z = -8;
    const dist   = CAM_Z_BASE - HERO_Z;
    const halfFov = (this.camera.fov * Math.PI) / 360;
    const halfH   = Math.tan(halfFov) * dist;
    const halfW   = halfH * this.camera.aspect;
    const width   = Math.max(halfW * 2 * 1.15, 20);
    const height  = width / (cv.width / cv.height);

    const geo = new THREE.PlaneGeometry(width, height);
    this._heroPlane = new THREE.Mesh(geo, mat);
    this._heroPlane.position.z = HERO_Z;
    this._heroPlane.renderOrder = -1;
    this.scene.add(this._heroPlane);
  }

  _buildBackdrop() {
    // Flat pure-black scene background — the diamond's texture comes from
    // its own material + the env map (used for both reflection AND
    // transmission fallback), not from anything visible behind it.
    return new THREE.Color(0x000000);
  }

  _createDiamond() {
    // Brilliant-cut mesh, higher tessellation for cleaner facets
    const geom = this._createBrilliantGeometry(48);
    geom.scale(1.25, 1.4, 1.25);
    geom.computeVertexNormals();

    // MeshPhysicalMaterial tuned for the RoomEnvironment PMREM.
    // Every param picked to give a physically-plausible diamond that reads
    // as glass with fire, not as a smoked lump.
    const mat = new THREE.MeshPhysicalMaterial({
      color:                     0xffffff,
      metalness:                 0.0,
      roughness:                 0.0,               // mirror facets
      transmission:              1.0,
      thickness:                 this._isMobile ? 1.2 : 1.8,
      ior:                       2.417,             // real diamond
      attenuationDistance:       6.0,
      attenuationColor:          new THREE.Color(0xffffff),
      envMapIntensity:           2.2,
      iridescence:               0.35,              // subtle rainbow at grazing angles
      iridescenceIOR:            1.55,
      iridescenceThicknessRange: [400, 900],
      clearcoat:                 1.0,
      clearcoatRoughness:        0.0,
      transparent:               true,
      side:                      THREE.DoubleSide,
    });
    if ("dispersion" in mat) mat.dispersion = 3.2;  // fire without the rainbow blur

    this.diamond = new THREE.Mesh(geom, mat);
    this.diamond.rotation.x = -0.18;
    this.scene.add(this.diamond);
  }

  _createBrilliantGeometry(N = 24) {
    const positions = [];
    const indices   = [];
    const halfStep  = Math.PI / N;

    const layers = [
      [ 0.62,  0.00,  0        ],
      [ 0.62,  0.40,  0        ],
      [ 0.40,  0.70,  halfStep ],
      [ 0.08,  1.00,  0        ],
      [-0.22,  0.88,  halfStep ],
      [-0.72,  0.42,  0        ],
      [-1.08,  0.00,  0        ],
    ];
    const ringStarts = [];
    for (const [y, r, a] of layers) {
      ringStarts.push(positions.length / 3);
      if (r === 0) positions.push(0, y, 0);
      else for (let i = 0; i < N; i++) {
        const th = (i / N) * Math.PI * 2 + a;
        positions.push(Math.cos(th) * r, y, Math.sin(th) * r);
      }
    }
    for (let li = 0; li < layers.length - 1; li++) {
      const [, r1] = layers[li];
      const [, r2] = layers[li + 1];
      const s1 = ringStarts[li];
      const s2 = ringStarts[li + 1];
      if (r1 === 0 && r2 > 0) {
        for (let i = 0; i < N; i++) {
          const nxt = (i + 1) % N;
          indices.push(s1, s2 + i, s2 + nxt);
        }
      } else if (r1 > 0 && r2 === 0) {
        for (let i = 0; i < N; i++) {
          const nxt = (i + 1) % N;
          indices.push(s1 + i, s1 + nxt, s2);
        }
      } else {
        for (let i = 0; i < N; i++) {
          const nxt = (i + 1) % N;
          indices.push(s1 + i,   s1 + nxt, s2 + i);
          indices.push(s1 + nxt, s2 + nxt, s2 + i);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    return g;
  }

  _addLights() {
    const key = new THREE.DirectionalLight(KEY_COLOR, KEY_LIGHT_STR);
    key.position.set(3.5, 4.0, 3.2);
    this.scene.add(key);
    this._lights.push(key);

    const fill = new THREE.DirectionalLight(FILL_COLOR, FILL_LIGHT_STR);
    fill.position.set(-4, 1, -2);
    this.scene.add(fill);
    this._lights.push(fill);

    const rim = new THREE.DirectionalLight(RIM_COLOR, RIM_LIGHT_STR);
    rim.position.set(0, -3, -4);
    this.scene.add(rim);
    this._lights.push(rim);

    const amb = new THREE.AmbientLight(0x121826, 0.35);
    this.scene.add(amb);
    this._lights.push(amb);
  }

  // ── Scroll wiring ───────────────────────────────────────────────
  _bindScroll() {
    if (this.lenis && typeof this.lenis.on === "function") {
      this.lenis.on("scroll", this._onLenisScroll);
      this._lenisScrollBound = true;
    } else {
      window.addEventListener("scroll", this._onNativeScroll, { passive: true });
    }
  }
  _onLenisScroll({ scroll, limit }) {
    this._scrollT = limit > 0 ? Math.min(scroll / limit, 1) : 0;
  }
  _onNativeScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    this._scrollT = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  }

  // ── Resize ──────────────────────────────────────────────────────
  _bindResize() {
    window.addEventListener("resize", this._onResize);
  }
  _onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    if (this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    if (this.renderer)  this.renderer.setSize(w, h);
    if (this._composer) this._composer.setSize(w, h);
    if (this._bloom)    this._bloom.setSize(w, h);
    this._isMobile = w < 768 || "ontouchstart" in window;
  }

  // ── Beat reveal ─────────────────────────────────────────────────
  _observeBlocks() {
    this._observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting || e.target.classList.contains("is-revealed")) return;
        e.target.classList.add("is-revealed");
        const isFinal = e.target.dataset.final === "true";
        const cta     = isFinal ? e.target.querySelector(".holm-philosophy__cta") : null;

        if (this._reducedMotion) {
          e.target.classList.add("is-in");
          if (cta) gsap.set(cta, { opacity: 1 });
          return;
        }
        const lines = e.target.querySelectorAll(".holm-philosophy__line-inner");
        gsap.to(lines, {
          yPercent: 0,
          opacity:  1,
          duration: 1.15,
          stagger:  0.14,
          ease:     "power3.out",
        });
        if (cta) {
          gsap.fromTo(cta,
            { opacity: 0, scale: 0.85 },
            { opacity: 1, scale: 1, duration: 0.9, delay: 0.55, ease: "power3.out" },
          );
        }
      });
    }, { threshold: 0.35, rootMargin: "0px 0px -8% 0px" });
    this.blocks.forEach((b) => this._observer.observe(b));
  }

  // ── CTA magnetic hover ─────────────────────────────────────────
  _bindCtaMagnetic() {
    if (this._reducedMotion) return;
    const cta = this.container.querySelector(".holm-philosophy__cta");
    if (!cta) return;

    this._ctaEl = cta;
    gsap.set(cta, { opacity: 0, x: 0, y: 0 });

    this._ctaSetX = gsap.quickTo(cta, "x", { duration: 0.55, ease: "power3" });
    this._ctaSetY = gsap.quickTo(cta, "y", { duration: 0.55, ease: "power3" });

    this._ctaMove = (e) => {
      const rect = cta.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = e.clientX - cx;
      const dy   = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const R    = rect.width * 1.35;
      if (dist > R) {
        this._ctaSetX(0);
        this._ctaSetY(0);
        cta.classList.remove("is-magnetic");
        return;
      }
      const pull = (1 - dist / R) * 0.4;
      this._ctaSetX(dx * pull);
      this._ctaSetY(dy * pull);
      cta.classList.add("is-magnetic");
    };

    this._ctaLeave = () => {
      this._ctaSetX(0);
      this._ctaSetY(0);
      cta.classList.remove("is-magnetic");
    };

    window.addEventListener("mousemove", this._ctaMove, { passive: true });
    window.addEventListener("mouseleave", this._ctaLeave);
  }

  // ── Beat interpolation — weighted blend over DOM anchors ───────
  // Each beat's DOM section contributes to the diamond target based on how
  // close its center is to the viewport center. This keeps the gem aligned
  // with whichever stanza is currently on screen, and blends smoothly during
  // transitions — no keyframe midpoint mismatch.
  _computeBeatTarget() {
    if (!this._beatEls || this._beatEls.length === 0) {
      return { x: 0, y: 0, scale: 1.0 };
    }
    const vh        = window.innerHeight;
    const vpCenter  = vh / 2;
    const maxDist   = vh * WEIGHT_FALLOFF;

    let totalW = 0;
    let wx = 0, wy = 0, ws = 0;

    for (const { el, beat } of this._beatEls) {
      const rect  = el.getBoundingClientRect();
      const cy    = rect.top + rect.height / 2;
      const dist  = Math.abs(cy - vpCenter);
      const raw   = Math.max(0, 1 - dist / maxDist);
      const w     = raw * raw * (3 - 2 * raw);  // smoothstep

      totalW += w;
      wx += beat.x     * w;
      wy += beat.y     * w;
      ws += beat.scale * w;
    }

    if (totalW < 0.001) {
      // No beat within falloff — snap to the nearest by center distance
      let bestIdx = 0, bestDist = Infinity;
      this._beatEls.forEach(({ el }, i) => {
        const rect = el.getBoundingClientRect();
        const cy   = rect.top + rect.height / 2;
        const d    = Math.abs(cy - vpCenter);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      });
      const b = this._beatEls[bestIdx].beat;
      return { x: b.x, y: b.y, scale: b.scale };
    }
    return { x: wx / totalW, y: wy / totalW, scale: ws / totalW };
  }

  // ── Render loop ─────────────────────────────────────────────────
  _startLoop() {
    this._active   = true;
    this._prevTime = performance.now();

    const tick = (now) => {
      if (!this._active) return;
      const dtRaw = (now - this._prevTime) / 1000;
      const dt    = Math.min(dtRaw, 0.05);
      this._prevTime = now;

      // Idle spin — never stops
      this._idleSpin += IDLE_SPIN_SPEED * dt;

      // Beat target — weighted blend of DOM-anchored beat sections
      const target = this._reducedMotion
        ? { x: 0, y: 0, scale: 1.2 }
        : this._computeBeatTarget();

      // World-space transform
      const halfFov = (this.camera.fov * Math.PI) / 360;
      const depth   = CAM_Z_BASE;
      const halfH   = Math.tan(halfFov) * depth;
      const halfW   = halfH * this.camera.aspect;

      // On very narrow screens, collapse horizontal offset — text goes above/below
      const narrow  = this._isMobile;
      const wx      = narrow ? target.x * 0.2 : target.x;
      const wy      = target.y;

      this._targetPos.set(wx * halfW, wy * halfH, 0);

      // Frame-rate-independent lerp
      const k = 1 - Math.pow(1 - POS_LERP, dt * 60);
      this.diamond.position.lerp(this._targetPos, k);

      const curS = this.diamond.scale.x + (target.scale - this.diamond.scale.x) * k;
      this.diamond.scale.setScalar(curS);

      // Hero watermark plane — visible on the intro, fades as the user
      // scrolls into the manifesto so it doesn't compete with the stanzas
      if (this._heroPlane) {
        const introFade = Math.max(0, 1 - this._scrollT * 4.0);
        const eased     = introFade * introFade * (3 - 2 * introFade);
        this._heroPlane.material.opacity = eased;
        this._heroPlane.visible = eased > 0.005;
      }

      // Rotation — idle spin + slight tilt driven by scroll
      const tilt = this._reducedMotion
        ? -0.18
        : -0.18 + Math.sin(this._scrollT * Math.PI) * SCROLL_TILT_MAX;

      this.diamond.rotation.y = this._idleSpin;
      this.diamond.rotation.x = tilt;

      this._elapsed += dt;

      this._composer.render();
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }
}
