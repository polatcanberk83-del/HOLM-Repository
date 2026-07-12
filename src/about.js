import * as THREE from "three";
import gsap from "gsap";
import { GLTFLoader }       from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader }      from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment }  from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer }   from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass }       from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass }       from "three/examples/jsm/postprocessing/OutputPass.js";
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
    this._createThree();
    this._buildScene();
    this._bindScroll();
    this._bindResize();
    this._observeBlocks();
    this._bindCtaMagnetic();
    this._mountPosterWaves();
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
  _createDOM() {
    const container = document.createElement("div");
    container.className = "holm-about";
    if (this._reducedMotion) container.classList.add("is-reduced-motion");

    const beatsHtml = BEATS.map((beat, i) => {
      const linesHtml = beat.lines.map((ln) => {
        const cls = ln.head
          ? "holm-about__line holm-about__line--head"
          : "holm-about__line";
        return `<div class="${cls}">${splitLineToChars(ln.text)}</div>`;
      }).join("");

      // Portrait slot only on the intro beat
      const portraitHtml = beat.portrait
        ? `<div class="holm-about__portrait" aria-hidden="true">
             <img src="/portrait.png"
                  alt=""
                  onerror="this.style.display='none'" />
           </div>`
        : "";

      // Selected-work image — a subtly waving poster. CSS handles the
      // wave for now (transform + filter); a WebGL shader upgrade is
      // queued for the next iteration.
      const workImageHtml = beat.workImage
        ? `<a class="holm-about__work-image"
              href="${beat.workLink?.href || "#"}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open ${beat.eyebrow} project in a new tab">
             <span class="holm-about__work-image-frame">
               <img src="${beat.workImage}"
                    alt=""
                    loading="lazy"
                    onerror="this.closest('.holm-about__work-image').classList.add('is-empty')" />
             </span>
           </a>`
        : "";

      const workLinkHtml = beat.workLink && !beat.workImage
        ? `<a class="holm-about__work-link"
              href="${beat.workLink.href}"
              target="_blank"
              rel="noopener noreferrer"
              data-hover-roll>${beat.workLink.label}</a>`
        : beat.workLink
          ? `<a class="holm-about__work-link"
                href="${beat.workLink.href}"
                target="_blank"
                rel="noopener noreferrer"
                data-hover-roll>${beat.workLink.label}</a>`
          : "";

      const ctaHtml = beat.ctaLabel
        ? `<a class="holm-about__cta"
              href="${beat.ctaHref}"
              aria-label="${beat.ctaLabel}"
              data-hover-roll>${beat.ctaLabel}</a>`
        : "";

      const compactClass = beat.compact ? " is-compact" : "";

      // Each beat gets three tear seeds (one per layer of the stack)
      // and a distinct rotation/drift phase so the sheets read as three
      // separate physical papers piled together — not identical clones.
      const rot     = ((i % 2 === 0 ? -1 : 1) * (0.9 + (i * 0.4) % 1.3)).toFixed(2);
      const seed    = (7  + i * 11) % 97;
      const seedB1  = (23 + i * 17) % 97;
      const seedB2  = (41 + i * 13) % 97;
      // Idle-drift phase per paper — animation-delay is negative so drift
      // starts mid-cycle and papers aren't in sync
      const drift   = (-2.6 * i).toFixed(1);

      return `
        <section class="holm-about__beat${compactClass}"
                 data-beat="${i}"
                 data-side="${beat.side}"
                 data-final="${!!beat.ctaLabel}">
          <div class="holm-about__stanza">
            ${portraitHtml}
            ${workImageHtml}
            <div class="holm-about__paper"
                 style="--paper-rot:${rot}deg; --paper-drift-delay:${drift}s">
              <!-- Two backing sheets peek out behind the main sheet — the
                   torn edges + slight offset read as a real paper pile -->
              <div class="holm-about__paper-sheet holm-about__paper-sheet--back-2"
                   style="filter: url(#holm-paper-tear-${seedB2})"></div>
              <div class="holm-about__paper-sheet holm-about__paper-sheet--back-1"
                   style="filter: url(#holm-paper-tear-${seedB1})"></div>
              <div class="holm-about__paper-sheet holm-about__paper-sheet--main"
                   style="filter: url(#holm-paper-tear-${seed})"></div>
              <!-- Corner curl — a torn triangle that reads as a peeled edge -->
              <div class="holm-about__paper-curl" aria-hidden="true"></div>
              <div class="holm-about__paper-body">
                <span class="holm-about__eyebrow">${beat.eyebrow}</span>
                ${linesHtml}
                ${workLinkHtml}
              </div>
            </div>
            ${ctaHtml}
          </div>
        </section>
      `;
    }).join("");

    // A tear filter per seed used above (3 seeds × N beats). Rather than
    // enumerate manually, just emit one filter per unique seed we used.
    const seenSeeds = new Set();
    const tearFiltersHtml = BEATS.map((_b, i) => {
      const seeds = [(7 + i * 11) % 97, (23 + i * 17) % 97, (41 + i * 13) % 97];
      return seeds.map((seed) => {
        if (seenSeeds.has(seed)) return "";
        seenSeeds.add(seed);
        return `
          <filter id="holm-paper-tear-${seed}"
                  x="-8%" y="-10%" width="116%" height="120%">
            <feTurbulence type="fractalNoise"
                          baseFrequency="0.012 0.018"
                          numOctaves="4"
                          seed="${seed}"
                          result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise"
                               scale="22" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        `;
      }).join("");
    }).join("");

    container.innerHTML = `
      <canvas class="holm-about__canvas" aria-hidden="true"></canvas>
      <div class="holm-about__vignette" aria-hidden="true"></div>

      <!-- Global SVG defs — torn-paper filters (one seed per beat) -->
      <svg class="holm-about__svg-defs" width="0" height="0" aria-hidden="true">
        <defs>${tearFiltersHtml}</defs>
      </svg>

      <a class="holm-about__brand" href="/" aria-label="HOLM — home">
        <img src="${logoUrl}" alt="HOLM" />
      </a>

      <section class="holm-about__intro" aria-hidden="true"></section>

      <main id="about-content"
            class="holm-about__beats"
            tabindex="-1"
            aria-label="HOLM about — five-part introduction">
        ${beatsHtml}
      </main>
    `;
    document.body.appendChild(container);

    this.container = container;
    this.canvas    = container.querySelector(".holm-about__canvas");
    this.blocks    = [...container.querySelectorAll(".holm-about__beat")];

    // Track DOM anchors → beat indices for weighted blend
    this._beatEls = this.blocks.map((el) => ({
      el,
      beat: BEATS[parseInt(el.dataset.beat, 10)],
    }));

    // Every animatable element starts visible — the cylinder-scroll
    // handler in the render loop takes over per-element opacity/tilt
    // based on their Y position in the viewport. No reveal cascade.
    const allChars = container.querySelectorAll(".holm-about__char");
    gsap.set(allChars, { yPercent: 0, opacity: 1 });
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

        // Rescale so the laptop's longest side is ~0.33 m (real laptop width)
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
        const yOffset = -box2.min.y;                // lift base to y=0
        root.position.set(-centre.x, yOffset, -centre.z);

        // Shadows + shared material tweak — the model may ship with
        // unusual roughness; leave it, just enable shadow casting.
        root.traverse((c) => {
          if (c.isMesh) {
            c.castShadow    = !this._isMobile;
            c.receiveShadow = !this._isMobile;
          }
        });

        this.scene.add(root);
        this._props.laptop = root;
        console.log("[about] laptop loaded — scale:", scale.toFixed(3));
      },
      undefined,
      (err) => {
        console.error("[about] laptop failed to load", err);
      },
    );
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
    // Paper cards + portrait + poster ride the cylinder as whole units.
    // (Text lines live inside the paper, so they move with it — putting
    // the transform on the paper instead of each line keeps the sheet's
    // torn edges lining up with its content.) CTA is excluded because
    // it sits at the bottom of the final beat and shouldn't dim.
    const sel = [
      ".holm-about__paper",
      ".holm-about__portrait",
      ".holm-about__work-image",
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
    // Mobile: gentler curve so fast phone scrolling doesn't feel jarring
    const maxAng = this._isMobile ? 42 : 65;
    const maxZ   = this._isMobile ? 160 : 260;
    const fade   = this._isMobile ? 0.7 : 0.85;

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

      // Camera target — weighted blend across DOM-anchored beats
      this._computeCameraTarget(this._targetPos, this._targetLook);

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

      // Diamond — slow idle spin so the highlight travels around its facets
      if (this._props.diamond && !this._reducedMotion) {
        this._props.diamond.rotation.y += dt * 0.28;
      }

      // Cylinder scroll — reshape every text/image element based on its
      // viewport position so the whole page curves around an invisible
      // horizontal cylinder as the user scrolls.
      this._updateCylinder();

      this._composer.render();
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }
}
