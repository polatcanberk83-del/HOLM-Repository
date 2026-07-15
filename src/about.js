import * as THREE from "three";
import gsap from "gsap";
import { GLTFLoader }       from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader }      from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment }  from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer }   from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass }       from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass }       from "three/examples/jsm/postprocessing/OutputPass.js";
import { CSS3DRenderer,
         CSS3DObject }      from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { PosterWave }       from "./posterWave.js";
import logoUrl              from "./assets/holm new logo.svg?url";
import "./about.css";

// ─── Shared GLTF + DRACO loaders (module-level, reused across scenes) ─
const _dracoLoader = new DRACOLoader();
_dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
const _gltfLoader = new GLTFLoader();
_gltfLoader.setDRACOLoader(_dracoLoader);

// ─── Tunables ────────────────────────────────────────────────────────
const CAM_LERP        = 0.09;   // per-frame lerp toward beat target (@60fps)
const IDLE_DRIFT_AMP  = 0.04;   // camera micro-drift so the still scene feels alive
const IDLE_DRIFT_HZ   = 0.11;

// ─── Manual placement for the CSS3D screen overlay ──────────────────
// Locked to *this specific* laptop model. The mesh-selection heuristic
// keeps guessing between the inner display panel and the outer bezel
// face, so we bypass it and set the exact world-space rectangle the
// DOM overlay should sit on. Adjust these until it visually snaps to
// the laptop's screen surface.
const SCREEN = {
  centerX: 0.003,     // world X — nudged tiny bit right
  centerY: 0.140,     // world Y
  centerZ: -0.111,    // world Z (front surface, ~ bbox_centre + thin/2)
  width:   0.333,     // world width
  height:  0.220,     // world height
  // Real laptop screens lean back a bit — normal points up + forward,
  // not straight forward. This tilts the DOM overlay to match.
  tiltRad: 0.14,      // ~8° back. Increase to lean more, decrease for less.
  offsetX: 0.000,
  offsetY: 0.000,
  offsetZ: 0.000,
};

// ─── Content — the 5 fasets ─────────────────────────────────────────
// The whole page rebuilt around the diamond motif (no more "patience").
// Camera keeps roughly constant distance to the laptop across all beats —
// only pans and lifts, never dollies in — so the workbench stays the
// steady stage while the copy carries the storytelling.
const BEATS = [
  {
    id: "intro",
    side: "below",
    eyebrow: "01 / Introduction",
    portrait: true,
    lines: [
      { head: true, text: "Most websites vanish the second a tab is closed." },
      { head: true, text: "HOLM builds the ones that linger." },
      { text: "We craft digital spaces that command attention, feel intensely considered, and elevate a brand to the level it truly belongs." },
      { text: "Based in İzmir. Engineering for those who care deeply about how their work is seen." },
    ],
    cam: { pos: [0.35, 0.72, 1.05], look: [0.05, 0.13, 0.0] },
  },
  {
    id: "philosophy",
    side: "left",
    eyebrow: "02 / The Philosophy",
    lines: [
      { head: true, text: "I don't build websites. I build moments." },
      { text: "The precise moments that dictate how a brand is remembered — rare, unyielding, and formed only under immense pressure." },
      { text: "The way carbon becomes a diamond." },
      { text: "That is the whole philosophy behind HOLM." },
    ],
    cam: { pos: [0.05, 0.75, 1.10], look: [0.0, 0.13, 0.0] },
  },
  {
    id: "services",
    side: "right",
    eyebrow: "03 / What I Do",
    compact: true,
    lines: [
      { head: true, text: "Experiences, Not Pages." },
      { text: "A website shouldn't feel like a static document; it should feel like an event. The kind of experience visitors send to a friend before they've even finished scrolling." },
      { head: true, text: "Motion with Intent." },
      { text: "Movement is never decoration. Everything responds, reveals, and pulls the user deeper into the narrative through purposeful creative coding." },
      { head: true, text: "The Premium Polish." },
      { text: "The subtle, mathematical execution that makes a small studio look established, and an established brand look untouchable." },
      { head: true, text: "Undivided Execution." },
      { text: "Concept, design, and code handled by the exact same hands. Nothing gets lost in translation." },
    ],
    cam: { pos: [-0.25, 0.65, 1.05], look: [0.0, 0.13, 0.0] },
  },
  {
    id: "orwell",
    side: "left",
    eyebrow: "04 / Selected Work",
    workImage: "/orwell-poster.png",
    workLink:  { href: "https://orwell.byholm.co", label: "Visit orwell.byholm.co →" },
    lines: [
      { head: true, text: "Orwell" },
      { text: "A dark, interactive conceptualization of George Orwell's 1984. The screen watches you back — and the deeper you read, the more the digital world closes in on you." },
      { text: "Recognition: Awwwards Honorable Mention." },
    ],
    cam: { pos: [-0.15, 0.78, 1.10], look: [0.0, 0.13, 0.0] },
  },
  {
    id: "connection",
    side: "below",
    eyebrow: "05 / Connection",
    lines: [
      { head: true, text: "Ready to create a moment worth remembering." },
    ],
    cam: { pos: [0.15, 0.66, 1.05], look: [0.05, 0.13, 0.0] },
    ctaLabel: "Say Hello",
    ctaHref:  "/contact/",
  },
];
const WEIGHT_FALLOFF = 1.0;  // viewport heights — how far a beat's anchor influences the blend

// ─── Split a line into per-word masks + per-char spans (from Philosophy) ─
function splitLineToChars(text) {
  return text.split(" ").map((word) => {
    if (!word) return "";
    const chars = Array.from(word).map((ch) => {
      const safe = ch
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<span class="holm-about__char">${safe}</span>`;
    }).join("");
    return `<span class="holm-about__word">${chars}</span>`;
  }).join(" ");
}

// ─── About page controller ──────────────────────────────────────────
export class About {
  constructor({ lenis } = {}) {
    this.lenis          = lenis || null;
    this._reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this._isMobile      = window.innerWidth < 768 || "ontouchstart" in window;

    // Three.js
    this.renderer  = null;
    this.scene     = null;
    this.camera    = null;
    this.envMap    = null;
    this._composer = null;
    this._lights   = [];
    this._props    = {};       // sketchpad, diamond, notebook, letter, pencil

    // DOM
    this.container = null;
    this.canvas    = null;
    this.blocks    = [];

    // Scroll / animation state
    this._rafId       = null;
    this._active      = false;
    this._prevTime    = 0;
    this._elapsed     = 0;
    this._scrollT     = 0;

    // Camera target — blended per frame
    this._targetPos   = new THREE.Vector3();
    this._targetLook  = new THREE.Vector3();
    this._lookNow     = new THREE.Vector3();

    // CTA magnetic
    this._ctaEl     = null;
    this._ctaMove   = null;
    this._ctaLeave  = null;
    this._ctaSetX   = null;
    this._ctaSetY   = null;

    // Handlers
    this._onResize       = this._onResize.bind(this);
    this._onLenisScroll  = this._onLenisScroll.bind(this);
    this._onNativeScroll = this._onNativeScroll.bind(this);
    this._observer       = null;
  }

  // ── Public API ──────────────────────────────────────────────────
  init() {
    this._createDOM();
    // Mobile skips the entire WebGL + CSS3D stack. The mobile article
    // in the DOM below is what the reader actually gets — pure editorial,
    // fast to boot, easy on phone GPUs.
    if (this._isMobile) return;
    this._createThree();
    this._buildScene();
    this._bindScroll();
    this._bindResize();
    this._startLoop();
  }

  // ── Mount WebGL wave shaders on any selected-work poster ───────
  _mountPosterWaves() {
    this._posterWaves = [];
    if (this._reducedMotion) return;
    const frames = this.container.querySelectorAll(".holm-about__work-image-frame");
    frames.forEach((frame) => {
      const img = frame.querySelector("img");
      if (!img || !img.src) return;
      try {
        const wave = new PosterWave(frame, { imageUrl: img.src });
        this._posterWaves.push(wave);
      } catch (err) {
        console.warn("[about] PosterWave init failed, keeping fallback img", err);
      }
    });
  }

  destroy() {
    this._active = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    window.removeEventListener("resize", this._onResize);
    if (this.lenis && this._lenisScrollBound) {
      this.lenis.off("scroll", this._onLenisScroll);
    } else {
      window.removeEventListener("scroll", this._onNativeScroll);
    }
    if (this._observer)  this._observer.disconnect();
    if (this._ctaMove)  window.removeEventListener("mousemove", this._ctaMove);
    if (this._ctaLeave) window.removeEventListener("mouseleave", this._ctaLeave);

    // Tear down every poster-wave renderer we mounted
    this._posterWaves?.forEach((w) => w.destroy());
    this._posterWaves = [];

    // Dispose scene geometries/materials
    this.scene?.traverse((o) => {
      o.geometry?.dispose?.();
      const m = o.material;
      if (Array.isArray(m)) m.forEach(mm => mm.dispose?.());
      else m?.dispose?.();
    });
    for (const l of this._lights) this.scene?.remove(l);
    this.envMap?.dispose?.();

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss?.();
    }
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.renderer = this.scene = this.camera = null;
    this.container = this.canvas = null;
  }

  // ── DOM ─────────────────────────────────────────────────────────
  // Two content trees, one source of truth: the CSS3D screen used on
  // desktop (text projected onto the laptop display) and a mobile-only
  // fallback article that sits directly in the page flow.
  _createDOM() {
    const container = document.createElement("div");
    container.className = "holm-about";
    if (this._reducedMotion) container.classList.add("is-reduced-motion");
    if (this._isMobile)      container.classList.add("is-mobile");

    // One section template, rendered into both content trees. Parent
    // class + CSS media queries handle desktop vs mobile styling.
    const sectionHtml = (beat) => {
      const linesHtml = beat.lines.map((ln) => {
        const cls = ln.head ? "holm-about__scr-head" : "holm-about__scr-body";
        return `<div class="${cls}">${ln.text}</div>`;
      }).join("");
      const portraitHtml = beat.portrait
        ? `<div class="holm-about__scr-portrait" aria-hidden="true">
             <img src="/portrait.png" alt="" onerror="this.style.display='none'" />
           </div>`
        : "";
      const workImageHtml = beat.workImage
        ? `<a class="holm-about__scr-work"
              href="${beat.workLink?.href || "#"}"
              target="_blank" rel="noopener noreferrer">
             <img src="${beat.workImage}" alt="Orwell — Awwwards Honorable Mention" loading="lazy" />
           </a>`
        : "";
      const workLinkHtml = beat.workLink
        ? `<a class="holm-about__scr-link"
              href="${beat.workLink.href}"
              target="_blank" rel="noopener noreferrer">${beat.workLink.label}</a>`
        : "";
      const ctaHtml = beat.ctaLabel
        ? `<a class="holm-about__scr-cta"
              href="${beat.ctaHref}"
              aria-label="${beat.ctaLabel}">${beat.ctaLabel}</a>`
        : "";
      return `
        <section class="holm-about__scr-section">
          ${portraitHtml}
          <span class="holm-about__scr-eyebrow">${beat.eyebrow}</span>
          ${linesHtml}
          ${workImageHtml}
          ${workLinkHtml}
          ${ctaHtml}
        </section>
      `;
    };
    const screenSectionsHtml = BEATS.map(sectionHtml).join("");

    // Screen-reader-only version so the WebGL content is still discoverable
    const srHtml = BEATS.map((beat) => {
      const lines = beat.lines.map((l) => `<p>${l.text}</p>`).join("");
      return `<section><h2>${beat.eyebrow}</h2>${lines}</section>`;
    }).join("");

    // The screen DOM lives on its own element that we'll wrap in a
    // CSS3DObject — fixed pixel size, aspect ~16:10 to match a laptop
    // display. CSS3DObject scales this down to world size.
    this._screenEl = document.createElement("div");
    this._screenEl.className = "holm-about__screen";
    this._screenEl.innerHTML = `
      <div class="holm-about__screen-scroll">
        ${screenSectionsHtml}
      </div>
    `;

    // Mobile fallback article — reuses the same section renderer but
    // shows in normal page flow when the CSS3D screen would be too small
    // to read. Desktop hides it via CSS.
    const mobileArticleHtml = `
      <article class="holm-about__mobile-article">
        ${BEATS.map(sectionHtml).join("")}
      </article>
    `;

    container.innerHTML = `
      <canvas class="holm-about__canvas" aria-hidden="true"></canvas>
      <div class="holm-about__vignette" aria-hidden="true"></div>

      <a class="holm-about__brand" href="/" aria-label="HOLM — home">
        <img src="${logoUrl}" alt="HOLM" />
      </a>

      <main id="about-content"
            class="holm-about__scroll"
            tabindex="-1"
            aria-label="HOLM about — the article is displayed on the 3D laptop screen">
        <!-- Desktop: empty spacers drive scroll length for camera + on-screen
             text scroll. Mobile: the same scroll length carries a real
             editorial article below (mobile-article overlays the spacers). -->
        <div class="holm-about__spacer"></div>
        <div class="holm-about__spacer"></div>
        <div class="holm-about__spacer"></div>
        <div class="holm-about__spacer"></div>
        <div class="holm-about__spacer"></div>
        <div class="holm-about__spacer"></div>
        ${mobileArticleHtml}
      </main>

      <!-- Plain text version for screen readers -->
      <div class="sr-only">${srHtml}</div>
    `;
    document.body.appendChild(container);

    this.container = container;
    this.canvas    = container.querySelector(".holm-about__canvas");
    this._screenScrollEl = this._screenEl.querySelector(".holm-about__screen-scroll");
  }

  // ── Three.js ────────────────────────────────────────────────────
  _createThree() {
    this.renderer = new THREE.WebGLRenderer({
      canvas:          this.canvas,
      antialias:       true,
      alpha:           false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this._isMobile ? 1.5 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace    = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled   = !this._isMobile;
    this.renderer.shadowMap.type      = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x040608);
    this.scene.fog = new THREE.FogExp2(0x040608, 0.45);

    // 32° FoV = ~85mm equivalent — a "cinema close-up" lens compression
    // that flatters the laptop and pushes the wall into a softer blur.
    this.camera = new THREE.PerspectiveCamera(
      32, window.innerWidth / window.innerHeight, 0.05, 12,
    );
    this.camera.position.set(0.35, 0.72, 1.05);
    this.camera.lookAt(0.05, 0.13, 0.0);

    // Env for subtle reflections on the diamond
    const pmrem  = new THREE.PMREMGenerator(this.renderer);
    const room   = new RoomEnvironment();
    this.envMap  = pmrem.fromScene(room, 0.04).texture;
    pmrem.dispose();
    this.scene.environment          = this.envMap;
    this.scene.environmentIntensity = 0.35;

    this._composer = new EffectComposer(this.renderer);
    this._composer.setPixelRatio(this.renderer.getPixelRatio());
    this._composer.setSize(window.innerWidth, window.innerHeight);
    this._composer.addPass(new RenderPass(this.scene, this.camera));
    this._composer.addPass(new OutputPass());

    // ── CSS3D renderer — desktop-only. Mobile uses the DOM fallback
    // article instead of trying to render readable text onto a phone-
    // sized laptop screen.
    if (!this._isMobile) {
      this._css3d = new CSS3DRenderer();
      this._css3d.setSize(window.innerWidth, window.innerHeight);
      Object.assign(this._css3d.domElement.style, {
        position: "fixed",
        top:      "0",
        left:     "0",
        width:    "100%",
        height:   "100%",
        pointerEvents: "none",
        zIndex:   "3",
      });
      this.container.appendChild(this._css3d.domElement);
    }
  }

  // ── Workbench scene — clean desk + laptop hero prop ──────────────
  _buildScene() {
    // ── Desk ──────────────────────────────────────────────────────
    // Cinematic close-up: desk sized only for what the camera sees.
    // Bigger (2m×1.4m) means clean edges under the vignette but small
    // enough that the model dominates and no "table diorama" is visible.
    // Subdivided so lighting curvature reads smooth, not banded.
    const deskMat = new THREE.MeshStandardMaterial({
      color:     0x131b2c,
      roughness: 0.72,
      metalness: 0.15,
    });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.6, 16, 1, 12), deskMat);
    desk.position.set(0, -0.04, 0);
    desk.receiveShadow = !this._isMobile;
    this.scene.add(desk);

    // Ground below — near-black navy, catches falloff
    const groundMat = new THREE.MeshStandardMaterial({
      color:     0x03050b,
      roughness: 1.0,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.35;
    this.scene.add(ground);

    // Wall behind — pulled closer so the vignette hides its edges
    const wallMat = new THREE.MeshStandardMaterial({
      color:     0x080f1a,
      roughness: 1.0,
      metalness: 0.0,
    });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), wallMat);
    wall.position.set(0, 0.8, -1.2);
    this.scene.add(wall);

    // ── Props: Laptop + Mug (GLBs) ───────────────────────────────
    // Loaded async — each is normalised on arrival then placed on the
    // desk relative to the composition centre.
    this._loadLaptop();
    this._loadMug();

    // ── Lights ────────────────────────────────────────────────────
    // Tight key from close-up: cone barely wider than the laptop, with
    // penumbra ~0.95 so the falloff is a smooth vignette rather than a
    // visible arc across the desk. This is what killed the "amateur"
    // banded cutoff in the previous render.
    const spot = new THREE.SpotLight(0xdce4ff, 260, 3.5, 0.42, 0.95, 1.6);
    spot.position.set(0.05, 1.15, 0.55);
    spot.target.position.set(0.0, 0, 0.0);
    spot.castShadow = !this._isMobile;
    if (spot.castShadow) {
      spot.shadow.mapSize.set(2048, 2048);
      spot.shadow.bias   = -0.0008;
      spot.shadow.radius = 6;
    }
    this.scene.add(spot);
    this.scene.add(spot.target);
    this._lights.push(spot);

    // Cool rim from off-frame right — separates the laptop from the wall
    const rim = new THREE.PointLight(0x6f8dbe, 90, 2.2, 2);
    rim.position.set(0.9, 0.5, -0.55);
    this.scene.add(rim);
    this._lights.push(rim);

    // Warm-neutral bounce from below the desk edge — very small, just
    // lifts the black bottom of the laptop chassis so it isn't a hole
    const bounce = new THREE.PointLight(0x88a4d4, 24, 1.2, 2);
    bounce.position.set(0.0, 0.05, 0.5);
    this.scene.add(bounce);
    this._lights.push(bounce);

    // Ambient — deep navy so unlit surfaces stay in-palette
    const amb = new THREE.AmbientLight(0x1a2540, 0.8);
    this.scene.add(amb);
    this._lights.push(amb);

    // Env map contribution boosted so PBR materials read as lit
    this.scene.environmentIntensity = 0.55;
  }

  // Load the laptop, normalise its transform so it lands centred on the
  // desk regardless of how it was exported (Aspose conversions rarely
  // ship with a clean base-centre origin at real-world scale).
  _loadLaptop() {
    _gltfLoader.load(
      "/models/about/laptop.glb",
      (gltf) => {
        const root = gltf.scene;

        // Rescale so the laptop's longest side is ~0.36 m (real laptop width)
        const box  = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetLong = 0.36;
        const scale = maxDim > 0 ? targetLong / maxDim : 1;
        root.scale.setScalar(scale);

        // Recompute bounds after scale, then translate so the model sits
        // on the desk (y=0) and centred at the placement point.
        root.updateMatrixWorld(true);
        const box2 = new THREE.Box3().setFromObject(root);
        const centre = new THREE.Vector3();
        box2.getCenter(centre);
        const yOffset = -box2.min.y;
        root.position.set(-centre.x, yOffset, -centre.z);

        // Shadows + collect meshes so we can find the screen surface
        const meshes = [];
        root.traverse((c) => {
          if (c.isMesh) {
            c.castShadow    = !this._isMobile;
            c.receiveShadow = !this._isMobile;
            meshes.push(c);
          }
        });

        this.scene.add(root);
        this._props.laptop = root;
        console.log("[about] laptop loaded — scale:", scale.toFixed(3));

        // Find the screen mesh + attach the CSS3D content
        this._mountScreenOnLaptop(root, meshes);
      },
      undefined,
      (err) => {
        console.error("[about] laptop failed to load", err);
      },
    );
  }

  // ── Screen mesh discovery + CSS3D content placement ──────────────
  // Walks the laptop meshes to find the largest thin flat rectangle
  // sitting high in Y — that's the display. Brightens its material so
  // it reads as "on", then places a CSS3DObject over it holding all the
  // page's content.
  _mountScreenOnLaptop(root, meshes) {
    root.updateMatrixWorld(true);
    // Get the laptop's world bounding box so we can score meshes by how
    // high they sit relative to the whole laptop — the screen is always
    // in the top half of the open laptop.
    const rootBox = new THREE.Box3().setFromObject(root);
    const rootBottom = rootBox.min.y;
    const rootTop    = rootBox.max.y;
    const rootHeight = Math.max(1e-6, rootTop - rootBottom);

    let screenMesh = null;
    let bestScore  = -Infinity;

    console.log("[about] laptop meshes:");
    for (const c of meshes) {
      const g = c.geometry;
      if (!g) continue;

      // World-space bounding box + centre + size — this handles the
      // mesh's own transform + parent transforms + scale in one shot.
      const wbox    = new THREE.Box3().setFromObject(c);
      const wsize   = new THREE.Vector3(); wbox.getSize(wsize);
      const wcenter = new THREE.Vector3(); wbox.getCenter(wcenter);

      const dims = [wsize.x, wsize.y, wsize.z].sort((a, b) => a - b);
      const thin = dims[0], mid = dims[1], wide = dims[2];
      const heightRatio = (wcenter.y - rootBottom) / rootHeight;

      console.log(
        `  ${c.name || "(unnamed)"} · size ${wsize.x.toFixed(3)}×${wsize.y.toFixed(3)}×${wsize.z.toFixed(3)}`
        + ` · centerY ${wcenter.y.toFixed(3)} · h-ratio ${heightRatio.toFixed(2)}`,
      );

      // Filter: reasonable-size flat rectangle, aspect roughly panel-like
      if (wide < 0.15) continue;
      // Thin filter — the visible display panel is thin relative to its
      // face, but "thin" for a modelled laptop screen is up to ~10-15% of
      // its width (accounting for bezel + lid thickness). 0.22 is roomy.
      if (thin > 0.22 * wide) continue;
      const aspect = wide / mid;
      if (aspect < 1.15 || aspect > 2.6) continue;
      // Reject anything in the bottom half — that's the base + keyboard.
      if (heightRatio < 0.45) continue;

      // Score: prefer the LARGEST face in the upper half. That's the
      // outer bezel-inclusive screen face, which matches the perimeter
      // the viewer actually reads as "the screen".
      const area  = wide * mid;
      const score = heightRatio * 100 + area * 10000;
      if (score > bestScore) {
        bestScore  = score;
        screenMesh = c;
      }
    }

    if (!screenMesh) {
      console.warn("[about] screen mesh not found — CSS3D content skipped");
      return;
    }
    console.log("[about] → screen mesh selected:", screenMesh.name || "(unnamed)");

    // On mobile we skip the CSS3D overlay entirely — the mobile-article
    // fallback in the DOM below is what the reader actually sees. The
    // laptop still gets its "screen on" material tweak for atmosphere.
    if (this._isMobile) {
      const mats0 = Array.isArray(screenMesh.material) ? screenMesh.material : [screenMesh.material];
      mats0.forEach((m) => {
        if (!m) return;
        m.color?.setHex?.(0xe8e4d8);
        if ("emissive" in m)          m.emissive?.setHex?.(0xbfb9a8);
        if ("emissiveIntensity" in m) m.emissiveIntensity = 0.28;
        m.roughness = 0.6;
        m.metalness = 0.0;
        m.needsUpdate = true;
      });
      this._screenMesh = screenMesh;
      return;
    }

    // Brighten the screen material so it reads as "screen on"
    const mats = Array.isArray(screenMesh.material) ? screenMesh.material : [screenMesh.material];
    mats.forEach((m) => {
      if (!m) return;
      m.color?.setHex?.(0xf3f0e6);          // warm off-white
      if ("emissive" in m)          m.emissive?.setHex?.(0xd8d2c2);
      if ("emissiveIntensity" in m) m.emissiveIntensity = 0.35;
      m.roughness   = 0.55;
      m.metalness   = 0.0;
      m.map         = null;
      m.needsUpdate = true;
    });

    // Manual placement — no more mesh-selection guessing. Values live at
    // the top of this file (SCREEN) and are tuned visually.
    const w      = SCREEN.width;
    const h      = SCREEN.height;
    const center = new THREE.Vector3(
      SCREEN.centerX + SCREEN.offsetX,
      SCREEN.centerY + SCREEN.offsetY,
      SCREEN.centerZ + SCREEN.offsetZ,
    );
    // Screen leans back: normal points up + forward (not straight +Z)
    const t = SCREEN.tiltRad;
    const normal = new THREE.Vector3(0, Math.sin(t), Math.cos(t));

    const PIXEL_W = 1400;
    const PIXEL_H = Math.round(PIXEL_W * (h / w));
    this._screenEl.style.width  = `${PIXEL_W}px`;
    this._screenEl.style.height = `${PIXEL_H}px`;

    const css3dObj = new CSS3DObject(this._screenEl);
    css3dObj.position.copy(center);
    css3dObj.scale.setScalar(w / PIXEL_W);
    const lookMatrix = new THREE.Matrix4();
    lookMatrix.lookAt(center, center.clone().sub(normal), new THREE.Vector3(0, 1, 0));
    css3dObj.quaternion.setFromRotationMatrix(lookMatrix);

    this._css3dScreen = css3dObj;
    this._screenMesh  = screenMesh;
    this.scene.add(css3dObj);
  }

  // World-space plane normal of a mesh — derived from its axis-aligned
  // bounding box's thinnest axis. Robust against front/back face normals
  // cancelling out (which killed the previous averaging heuristic) as
  // long as the mesh is close to axis-aligned in world space, which the
  // laptop's display panel is.
  _computeMeshWorldNormal(mesh) {
    const wbox = new THREE.Box3().setFromObject(mesh);
    const wsize = new THREE.Vector3();
    wbox.getSize(wsize);
    const center = new THREE.Vector3();
    wbox.getCenter(center);

    let normal;
    if (wsize.x < wsize.y && wsize.x < wsize.z) {
      normal = new THREE.Vector3(1, 0, 0);
    } else if (wsize.y < wsize.z) {
      normal = new THREE.Vector3(0, 1, 0);
    } else {
      normal = new THREE.Vector3(0, 0, 1);
    }

    // Sign convention: normal must point toward the camera (out of the
    // screen), not into the laptop body. Flip if it points the wrong way.
    const toCam = new THREE.Vector3().subVectors(this.camera.position, center);
    if (normal.dot(toCam) < 0) normal.negate();

    return normal;
  }

  // Coffee mug — sits on the right of the laptop, small but readable in the
  // establishing shot. Same normalisation pipeline as the laptop.
  _loadMug() {
    _gltfLoader.load(
      "/models/about/mug.glb",
      (gltf) => {
        const root = gltf.scene;

        // Target ~9cm tallest side — real mug scale
        const box  = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetLong = 0.10;
        const scale = maxDim > 0 ? targetLong / maxDim : 1;
        root.scale.setScalar(scale);

        // Place on the desk to the right of the laptop, slightly back
        root.updateMatrixWorld(true);
        const box2 = new THREE.Box3().setFromObject(root);
        const centre = new THREE.Vector3();
        box2.getCenter(centre);
        const placeX = 0.32;
        const placeZ = -0.05;
        const yOffset = -box2.min.y;
        root.position.set(placeX - centre.x, yOffset, placeZ - centre.z);

        // Shadows + material tuning. From the debug inspection the coffee
        // ships as Sphere008 / Material.009 (#6d4b33 warm brown). Target
        // it by name — bulletproof against colour-space quirks.
        root.traverse((c) => {
          if (!c.isMesh) return;
          c.castShadow    = !this._isMobile;
          c.receiveShadow = !this._isMobile;

          const mats = Array.isArray(c.material) ? c.material : [c.material];
          mats.forEach((m) => {
            if (!m || !m.color) return;

            // The liquid mesh. Swap to a near-black espresso and give it
            // just enough sheen to catch the key light as reflection.
            const isLiquid =
              c.name === "Sphere008" ||
              m.name === "Material.009" ||
              /coffee|liquid|kahve|espresso/i.test((m.name || "") + " " + (c.name || ""));
            if (isLiquid) {
              m.color.setHex(0x0a0503);
              m.map = null;
              // Fully matte — kill every specular/highlight pathway.
              // Also strip normal + roughness maps in case they carve a
              // fake depression into the surface that reads as a hole.
              m.roughness    = 1.0;
              m.metalness    = 0.0;
              m.normalMap    = null;
              m.roughnessMap = null;
              m.aoMap        = null;
              m.envMapIntensity = 0.15;   // barely reflect the env
              m.transparent = false;
              m.opacity     = 1.0;
              m.side        = THREE.FrontSide;
              if ("clearcoat" in m)         m.clearcoat = 0.0;
              if ("iridescence" in m)       m.iridescence = 0.0;
              if ("specularIntensity" in m) m.specularIntensity = 0.0;
              if ("sheen" in m)             m.sheen = 0.0;
              if ("transmission" in m)      m.transmission = 0.0;
              if ("thickness" in m)         m.thickness = 0.0;
              m.needsUpdate = true;
              console.log("[about] mug: darkened coffee liquid →", c.name, "/", m.name);
            }
          });
        });

        this.scene.add(root);
        this._props.mug = root;
        console.log("[about] mug loaded — scale:", scale.toFixed(3));
      },
      undefined,
      (err) => {
        console.error("[about] mug failed to load", err);
      },
    );
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
    if (this._css3d)    this._css3d.setSize(w, h);
    this._isMobile = w < 768 || "ontouchstart" in window;
  }

  // ── Cylinder scroll — collect every element that will ride the
  //    invisible cylinder. Each frame the render loop re-computes its
  //    position in the viewport and applies rotateX + translateZ +
  //    opacity so lines flow into and out of frame on a curved surface.
  //    quickSetter is used so gsap can compose our rotationX/z with
  //    any other transform gsap is already writing (e.g. the CTA's
  //    magnetic x/y).
  _observeBlocks() {
    // Every text line, eyebrow, portrait and poster rides the cylinder on
    // its own — each moves independently along the same vertical axis as
    // the user scrolls, giving the "single line of scrolling type" read
    // the user asked for. CTA is left off — it's the bottom of the last
    // section and shouldn't fade with the rest.
    const sel = [
      ".holm-about__line",
      ".holm-about__eyebrow",
      ".holm-about__portrait",
      ".holm-about__work-image",
      ".holm-about__work-link",
    ].join(",");
    const nodes = [...this.container.querySelectorAll(sel)];

    // Seed perspective + initial visible state; then build one quickSetter
    // per property per element. This is by far the fastest way to write
    // 30+ elements each frame.
    this._cylSetters = nodes.map((el) => {
      el.style.willChange         = "transform, opacity";
      el.style.backfaceVisibility = "hidden";
      // transformPerspective must be set via gsap (not raw CSS) so it's
      // part of the gsap-tracked matrix — otherwise magnetic x/y on the
      // CTA would collide with a raw CSS `perspective(...)` prefix.
      gsap.set(el, {
        opacity:              1,
        // Tighter perspective → the same rotation feels much more
        // dramatic. 700 gives a real "wrapped on a cylinder" read.
        transformPerspective: 700,
        transformOrigin:      "50% 50%",
      });
      return {
        el,
        rotX:    gsap.quickSetter(el, "rotationX", "deg"),
        z:       gsap.quickSetter(el, "z", "px"),
        opacity: gsap.quickSetter(el, "opacity"),
      };
    });
  }

  // ── Per-frame cylinder update — read every element's viewport Y and
  //    write rotationX + z + opacity so elements curve around a virtual
  //    horizontal cylinder centred on the viewport middle.
  _updateCylinder() {
    if (this._reducedMotion || !this._cylSetters) return;
    const vh     = window.innerHeight;
    const halfVh = vh * 0.5;
    // Restrained motion — a subtle rise/tilt as elements approach viewport
    // centre, not a dramatic tumble. "Tek bir çizgide kaysınlar."
    const maxAng = this._isMobile ? 14 : 22;
    const maxZ   = this._isMobile ? 60  : 110;
    const fade   = this._isMobile ? 0.7 : 0.8;

    for (let i = 0; i < this._cylSetters.length; i++) {
      const s = this._cylSetters[i];
      const rect = s.el.getBoundingClientRect();
      const cy   = rect.top + rect.height * 0.5;
      const t    = (cy - halfVh) / halfVh;    // -1 top, 0 middle, +1 bottom

      if (t < -1.35 || t > 1.35) { s.opacity(0); continue; }

      // Clamp into [-1.1, 1.1] then square the sign-preserved value so
      // the middle 40% stays almost flat and the outer 60% curves hard —
      // this is what makes the cylinder read as a real shape, not a
      // uniform tilt.
      const c = t < -1.1 ? -1.1 : (t > 1.1 ? 1.1 : t);
      const curved = Math.sign(c) * Math.pow(Math.abs(c), 1.35);

      const ang = -curved * maxAng;               // top rotates away, bottom leans forward
      const zv  = -Math.pow(Math.abs(curved), 1.2) * maxZ;
      const op  = Math.max(0, 1 - Math.pow(Math.abs(curved), 1.3) * fade);

      s.rotX(ang);
      s.z(zv);
      s.opacity(op);
    }
  }

  // ── CTA magnetic hover (same pattern as philosophy) ─────────────
  _bindCtaMagnetic() {
    if (this._reducedMotion) return;
    const cta = this.container.querySelector(".holm-about__cta");
    if (!cta) return;

    this._ctaEl = cta;
    // No opacity 0 seed — the cylinder scroll controls visibility. Just
    // reset the magnetic offsets so pointer follow starts from centre.
    gsap.set(cta, { x: 0, y: 0 });

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
    window.addEventListener("mousemove",  this._ctaMove,  { passive: true });
    window.addEventListener("mouseleave", this._ctaLeave);
  }

  // ── Beat blend — weighted average of DOM-anchored beat targets ─
  // Each beat contributes to the camera pose based on how close its DOM
  // section's centre is to the viewport centre. Smooth transitions with
  // no keyframe midpoint mismatch.
  _computeCameraTarget(outPos, outLook) {
    if (!this._beatEls.length) {
      outPos.set(0, 3.6, 5.6);
      outLook.set(0, 0.35, -0.2);
      return;
    }
    const vh       = window.innerHeight;
    const vpCenter = vh / 2;
    const maxDist  = vh * WEIGHT_FALLOFF;

    let totalW = 0;
    let px = 0, py = 0, pz = 0;
    let lx = 0, ly = 0, lz = 0;

    for (const { el, beat } of this._beatEls) {
      const rect = el.getBoundingClientRect();
      const cy   = rect.top + rect.height / 2;
      const dist = Math.abs(cy - vpCenter);
      const raw  = Math.max(0, 1 - dist / maxDist);
      const w    = raw * raw * (3 - 2 * raw);   // smoothstep

      totalW += w;
      px += beat.cam.pos[0]  * w;
      py += beat.cam.pos[1]  * w;
      pz += beat.cam.pos[2]  * w;
      lx += beat.cam.look[0] * w;
      ly += beat.cam.look[1] * w;
      lz += beat.cam.look[2] * w;
    }

    if (totalW < 0.001) {
      // No beat is close — snap to nearest by centre distance
      let bestIdx = 0, bestDist = Infinity;
      this._beatEls.forEach(({ el }, i) => {
        const rect = el.getBoundingClientRect();
        const cy   = rect.top + rect.height / 2;
        const d    = Math.abs(cy - vpCenter);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      });
      const b = this._beatEls[bestIdx].beat;
      outPos.set (b.cam.pos[0],  b.cam.pos[1],  b.cam.pos[2]);
      outLook.set(b.cam.look[0], b.cam.look[1], b.cam.look[2]);
      return;
    }
    outPos.set (px / totalW, py / totalW, pz / totalW);
    outLook.set(lx / totalW, ly / totalW, lz / totalW);
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
      this._elapsed += dt;

      // Camera target — scroll-driven zoom from wide to screen close-up.
      this._computeCameraTargetFromScroll(this._targetPos, this._targetLook);

      // Idle micro-drift — tiny lateral sway so the still scene breathes
      if (!this._reducedMotion) {
        const drift = Math.sin(this._elapsed * IDLE_DRIFT_HZ * Math.PI * 2) * IDLE_DRIFT_AMP;
        this._targetPos.x += drift;
      }

      // Frame-rate-independent lerp toward target pose
      const k = 1 - Math.pow(1 - CAM_LERP, dt * 60);
      this.camera.position.lerp(this._targetPos, k);
      this._lookNow.lerp(this._targetLook, k);
      this.camera.lookAt(this._lookNow);

      // Screen text scroll — slide the article up inside the display as the
      // page scrolls past the "camera has arrived" point.
      this._updateScreenTextScroll();

      this._composer.render();
      // CSS3D pass — has to run *after* the composer so the DOM overlay
      // sits above the WebGL frame in screen-space.
      if (this._css3d) this._css3d.render(this.scene, this.camera);

      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  // ── Camera path — one straight lerp from wide shot to screen close-up
  //    driven by the page's scroll progress. The first 25% of scroll does
  //    the zoom; after that the camera holds and the text scrolls on-screen.
  _computeCameraTargetFromScroll(outPos, outLook) {
    // Mobile: camera stays framed on the laptop as a dark backdrop; the
    // article is rendered in the DOM overlay, so zooming into the screen
    // does nothing but shake the backdrop.
    if (this._isMobile) {
      outPos.set(0.35, 0.72, 1.05);
      outLook.set(0.05, 0.13, 0.0);
      return;
    }
    const scrollT = this._scrollT ?? 0;
    // Zoom-in eases across the opening quarter of scroll
    const zt = Math.min(1, scrollT / 0.25);
    const eased = zt * zt * (3 - 2 * zt);
    outPos.set(
      0.35 + (0.02 - 0.35) * eased,
      0.72 + (0.16 - 0.72) * eased,
      1.05 + (0.30 - 1.05) * eased,
    );
    outLook.set(
      0.05 + (0.0  - 0.05) * eased,
      0.13 + (0.13 - 0.13) * eased,
      0.0  + (-0.02 - 0.0) * eased,
    );
  }

  // ── Text scroll on the laptop screen — translates the article column
  //    up so successive sections come into view as the user scrolls the
  //    page past the initial camera zoom-in.
  _updateScreenTextScroll() {
    if (!this._screenScrollEl) return;
    const scrollT = this._scrollT ?? 0;
    // Reading phase runs 15% → 80% of the scroll. Under 15% is the camera
    // zoom; the last 20% is a "hold" period where the CTA sits comfortably
    // at the bottom of the screen so the reader has time to click without
    // the page ending abruptly.
    const readT = Math.max(0, Math.min(1, (scrollT - 0.15) / 0.65));
    const total   = this._screenScrollEl.scrollHeight;
    const parent  = this._screenScrollEl.parentElement;
    const visH    = parent ? parent.clientHeight : 900;
    // Nudge the final position up ~90px so the CTA doesn't kiss the bottom
    // bezel — reads as a resting position rather than an overflow.
    const travel  = Math.max(0, total - visH + 90);
    const y       = travel * readT;
    this._screenScrollEl.style.transform = `translate3d(0, ${(-y).toFixed(1)}px, 0)`;
  }
}
