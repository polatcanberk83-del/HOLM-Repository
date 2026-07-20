// ─── src/contactScene.js ──────────────────────────────────────────────
// Contact page: the ENTIRE homepage entry scene as the backdrop, with
// two medallions dangling from off-screen chains in front of it.
//
// User-approved deviation from the original "self-contained" rule:
// this file now imports the shared corridor scene + postprocessing +
// loader + underwater compositor from src/three/*. See the imports for
// exactly which modules are shared.
//
// What it does:
//   • createScene()  → marble corridor walls, navy floor + ceiling,
//                      ACES tonemapping (exposure 6.5), fog, base lights,
//                      camera at homepage's entry pose.
//   • Loads the same 5 sculptures the homepage entry shows, with the
//     same pedestal + halo + per-model key light setup.
//   • Adds dust particles + underwater refraction post.
//   • Static camera (no scroll) — body overflow is locked to hidden.
//   • Two silver medallions (TALK / WRITE) hang from a Verlet chain
//     with off-screen anchors. Cursor motion imparts a subtle "air
//     movement" impulse to the chain.

import * as THREE from "three";
import { RGBELoader }     from "three/examples/jsm/loaders/RGBELoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

// RectAreaLight uses a LUT for its BRDF integration — must be inited
// once before any RectAreaLight is added to a scene.
RectAreaLightUniformsLib.init();

// Shared homepage modules — user-approved direct import.
import { createScene, createHalo, createProjectionPlane } from "./three/scene.js";
import { createPostProcessing }   from "./three/postprocessing.js";
import { loadModel }              from "./three/loader.js";
import { createUnderwaterSystem } from "./three/underwater.js";

const MEDALLION_URL = "/models/madalyon.glb"; // Draco-compressed (854KB → 64KB)
const HDRI_URL      = "/hdri/studio.hdr";

// Homepage's entry-view models — mirrored 1:1 from main.js.
const HOMEPAGE_MODELS = [
  { file: "/models/hand.glb",        z:   0, scale: 3     },
  { file: "/models/monument.glb",    z: -12, scale: 0.456 },
  { file: "/models/hero_canvas.glb", z: -24, scale: 3     },
  { file: "/models/void_figure.glb", z: -36                },
  { file: "/models/arm_crystal.glb", z: -48                },
];
const HOMEPAGE_KEY_INTENSITIES = [155, 255, 390, 580, 1190];

// Pedestal — dark rough dielectric, same as main.js.
const PEDESTAL_MAT = new THREE.MeshStandardMaterial({
  color: 0x0d0d0f, roughness: 0.9, metalness: 0.1,
});

// ─── CONFIG ───────────────────────────────────────────────────────────
export const CONFIG = {
  // Medallion base material — silver at homepage's toneMappingExposure 6.5.
  // Direct light from the dedicated medallion key (see _addMedallionLights)
  // does most of the heavy lifting; env map just adds specular character.
  material: {
    color:           0x606670,   // gunmetal / brushed steel
    metalness:       1.0,
    roughness:       0.5,        // slightly higher than 0.42 — spreads the
                                 // specular so a centered viewing angle
                                 // no longer collapses the softbox into a
                                 // pinpoint hotspot on the top of the disc
    envMapIntensity: 0.32,
  },

  // Engraved TALK / WRITE text — dark patina, still catches enough light
  // to read against the silver body.
  engravedText: {
    color:           0x0a0a0a,
    metalness:       0.2,
    roughness:       0.85,
    envMapIntensity: 0.04,
  },

  // World-scale multiplier applied to the loaded medallion template
  // BEFORE bbox measurement. Homepage's 60° FOV makes objects look
  // smaller than they did at our old 38° FOV — this compensates.
  medallionScale: 1.55,

  // Dedicated key light for the medallions (analytic, colored, high
  // intensity to compete with the homepage's aggressive ACES exposure).
  // Studio softbox rig for the medallions. A point light on shiny metal
  // creates a sharp hotspot on one facet + dark neighboring facets —
  // exactly the "some angles too bright, some too dark" problem. A big
  // RectAreaLight acts as a large emitter surface, spreading the specular
  // across the whole face. A small fill on the opposite side keeps the
  // shadow side from going black.
  medallionLight: {
    // Key — big softbox CENTERED above/in-front of the pair so both
    // medallions get identical exposure. Off-center key blows out the
    // near medallion and starves the far one.
    key: {
      color:     0xffffff,
      // Bigger emitter surface (10×5 vs 5.5×3) → the light's reflection
      // on the metal is spread across a wider angle band, so no single
      // viewing angle sees the full light source concentrated into a
      // pinpoint. Intensity dropped to compensate for the ~3× area.
      intensity: 1.6,
      width:     10.0,
      height:    5.0,
      position:  { x: 0.0, y: 3.0, z: 9.5 },
      target:    { x: 0.0, y: 2.4, z: 6.0 },
    },
    // Fill — subtle warm from below/front, evens shadow side. Kept
    // gentle so it doesn't undo the key's directionality.
    fill: {
      color:     0xf0f4ff,
      intensity: 1.5,
      width:     4.0,
      height:    2.5,
      position:  { x: 0.0, y: 1.6, z: 9.5 },
      target:    { x: 0.0, y: 2.4, z: 6.0 },
    },
  },

  // Chain physics + link geometry.
  chain: {
    segments:      16,           // 15 links
    segmentLength: 0.16,
    gravity:       9.0,
    damping:       0.985,
    ambientDrift:  0.35,
    iterations:    6,

    linkRadius:    0.09,
    linkTube:      0.023,
    linkAspect:    1.75,         // >1 = oval, elongated along chain axis
  },

  // Two pendulums, straddling the center. Anchors sit ABOVE the frame
  // top at the medallion z-plane, so the chain visibly cascades down
  // into view. z=7 is closer to camera (which sits at z=10) than the
  // first sculpture at z=0 — medallions dominate the frame.
  pendulums: [
    {
      anchor:   { x: -1.15, y: 5.0, z: 7 },
      faceBack: false,
      // TALK medallion — click / tap opens the cal.com booking page
      // in a new tab so the scene isn't destroyed under the visitor.
      action:   { type: "external", href: "https://cal.com/canberk-polat-dpsl0y/discovery-call" },
    },
    {
      anchor:   { x:  1.15, y: 5.0, z: 7 },
      faceBack: true,
      // WRITE medallion — click / tap fires a mailto:. Browsers hand
      // off to the OS mail handler; the page itself stays put.
      action:   { type: "mailto", href: "mailto:contact@byholm.co" },
    },
  ],

  twist: {
    amplitude: 0.18,
    hz:        0.22,
  },

  mouse: {
    strength:      2.2,
    radius:        1.6,
    lowerHalfOnly: true,
    maxVel:        6.0,
  },
};

export class ContactScene {
  constructor() {
    // Device tier: width-based, three buckets.
    //   mobile  : <768   → skip sculptures, use RoomEnvironment, minimal post
    //   tablet  : 768-1199 → keep sculptures, lighter post, tighter anchors
    //   desktop : >=1200 → full experience
    const w = window.innerWidth;
    this._deviceTier = w < 768 ? "mobile"
                     : w < 1200 ? "tablet"
                     : "desktop";
    // Backwards compat: many downstream helpers still expect a boolean.
    this._isMobile = this._deviceTier !== "desktop";

    this.container = null;
    this.canvas    = null;

    // Homepage scene handles.
    this.renderer      = null;
    this.scene         = null;
    this.camera        = null;
    this._spotLight    = null;
    this._armSpot      = null;
    this._ambient      = null;
    this._hemi         = null;
    this._wallUniforms = null;
    this._homeOnResize = null;

    // Post + underwater.
    this._post       = null;
    this._underwater = null;

    // Projection wall shader (from homepage). Kept for feature parity
    // but hidden — entry view is nowhere near the projection wall.
    this._projPlane = null;

    // Homepage sculptures (models, pedestals, halos, key lights).
    this._sculptures = [];

    // Medallion asset + materials.
    this._medallionTemplate = null;
    this._medallionEnv      = null;
    this._modelSize         = new THREE.Vector3();
    this.material           = null;
    this.textMaterial       = null;

    // Chain.
    this.pendulums   = [];
    this._chainGeom  = null;
    this._medallionKey  = null;
    this._medallionFill = null;

    // Dust.
    this._dustGeometry         = null;
    this._dustPositions        = null;
    this._dustInitialPositions = null;
    this._dustPoints           = null;
    this._dustMat              = null;

    // Cursor.
    this._pointerNDC     = new THREE.Vector2(-99, -99);
    this._pointerNorm    = new THREE.Vector2(-9, -9);
    this._raycaster      = new THREE.Raycaster();
    this._mousePlane     = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this._mouseWorld     = new THREE.Vector3();
    this._mouseWorldVel  = new THREE.Vector3();
    this._mouseValid     = false;

    // Loop.
    this._rafId    = null;
    this._active   = false;
    this._lastTime = 0;
    this._elapsed  = 0;

    // No-scroll bookkeeping.
    this._prevOverflow = "";
    this._prevHeight   = "";

    this._onResize      = this._onResize.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onClick       = this._onClick.bind(this);
  }

  // ── Mount ─────────────────────────────────────────────────────────
  async mount(parent = document.body) {
    this._createDOM(parent);
    this._injectNoScroll();
    this._applyTierLayout();         // mutate CONFIG based on tier + aspect
    this._buildBaseScene();          // homepage createScene
    this._setupProjection();
    this._createDust();              // skipped on mobile inside helper

    await this._loadMedallionEnv();  // HDRI on desktop/tablet, RoomEnv on mobile
    if (this._deviceTier !== "mobile") {
      await this._loadHomepageSculptures();
    }
    await this._loadMedallionTemplate();
    this._createPendulums();
    this._addMedallionLights();

    this._setupPost();               // composer w/ underwater
    this._lockCamera();              // static entry pose (tier-aware)

    window.addEventListener("resize",      this._onResize);
    window.addEventListener("pointermove", this._onPointerMove, { passive: true });
    this.canvas.addEventListener("click",  this._onClick);

    this._startLoop();
  }

  // ── Tier + aspect layout ──────────────────────────────────────────
  // Mutates CONFIG so downstream helpers (framing, pendulum construction,
  // medallion scaling) all see tier-appropriate values.
  _applyTierLayout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isPortrait = (w / h) < 1;
    const tier = this._deviceTier;

    if (tier === "mobile") {
      // Portrait: push medallions WAY back (z=2 vs camera z=7) AND
      // shrink scale so two of them fit comfortably in a phone's narrow
      // horizontal FOV. Landscape phone is less extreme but still needs
      // more breathing room than desktop.
      CONFIG.medallionScale        = isPortrait ? 0.65 : 0.95;
      CONFIG.pendulums[0].anchor.x = isPortrait ? -0.42 : -0.75;
      CONFIG.pendulums[1].anchor.x = isPortrait ?  0.42 :  0.75;
      CONFIG.pendulums[0].anchor.z = isPortrait ? 2.0 : 4.0;
      CONFIG.pendulums[1].anchor.z = isPortrait ? 2.0 : 4.0;
      CONFIG.pendulums[0].anchor.y = isPortrait ? 4.2 : 4.4;
      CONFIG.pendulums[1].anchor.y = isPortrait ? 4.2 : 4.4;
      // Chain physics: cheaper on mobile so fps holds
      CONFIG.chain.segments   = 10;
      CONFIG.chain.iterations = 4;
      // Softbox rig follows the medallions back — otherwise the whole
      // key+fill sits far from the pendant plane and reads dim.
      const zNear = CONFIG.pendulums[0].anchor.z + 2;
      CONFIG.medallionLight.key.position.z    = zNear;
      CONFIG.medallionLight.key.target.z      = CONFIG.pendulums[0].anchor.z;
      CONFIG.medallionLight.fill.position.z   = zNear;
      CONFIG.medallionLight.fill.target.z     = CONFIG.pendulums[0].anchor.z;
      // Trim area intensities a touch — smaller mobile viewport doesn't
      // need as much light energy filling the frame.
      CONFIG.medallionLight.key.intensity     = 1.3;
      CONFIG.medallionLight.fill.intensity    = 1.0;
    } else if (tier === "tablet") {
      CONFIG.medallionScale        = isPortrait ? 1.35 : 1.5;
      CONFIG.pendulums[0].anchor.x = isPortrait ? -0.75 : -1.05;
      CONFIG.pendulums[1].anchor.x = isPortrait ?  0.75 :  1.05;
      CONFIG.pendulums[0].anchor.z = 7;
      CONFIG.pendulums[1].anchor.z = 7;
      CONFIG.chain.segments   = 14;
      CONFIG.chain.iterations = 5;
      // Tablet: same softbox rig, slightly dialed back key.
      CONFIG.medallionLight.key.intensity  = 1.4;
      CONFIG.medallionLight.fill.intensity = 1.1;
    }
    // desktop keeps CONFIG defaults untouched
  }

  // ── DOM / canvas ──────────────────────────────────────────────────
  _createDOM(parent) {
    const container = document.createElement("div");
    container.className = "holm-contact-scene";
    Object.assign(container.style, {
      position: "fixed", inset: "0", zIndex: "0",
      background: "#06060a", overflow: "hidden",
    });
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, { display: "block", width: "100%", height: "100%" });
    container.appendChild(canvas);
    parent.appendChild(container);
    this.container = container;
    this.canvas    = canvas;
  }

  _injectNoScroll() {
    this._prevOverflow = document.body.style.overflow;
    this._prevHeight   = document.body.style.height;
    document.body.style.overflow = "hidden";
    document.body.style.height   = "100vh";
  }
  _restoreScroll() {
    document.body.style.overflow = this._prevOverflow;
    document.body.style.height   = this._prevHeight;
  }

  // ── Base scene from homepage's createScene ────────────────────────
  _buildBaseScene() {
    const built = createScene(this.canvas, this._isMobile);
    this.renderer      = built.renderer;
    this.scene         = built.scene;
    this.camera        = built.camera;
    this._spotLight    = built.spotLight;
    this._armSpot      = built.armSpot;
    this._ambient      = built.ambient;
    this._hemi         = built.hemi;
    this._wallUniforms = built.wallUniforms;
    this._homeOnResize = built.onResize;
  }

  // Homepage's projection wall shader — the far-corridor screen. Not
  // visible from entry pose. We still create + hide it for parity, so
  // the shared scene module gets exercised the same way here.
  _setupProjection() {
    this._projPlane = createProjectionPlane(this.scene, this._isMobile);
    this._projPlane.visible = false;
  }

  // ── Env map for medallion reflections only ────────────────────────
  // NOT set on scene.environment — that would spill into sculpture
  // materials. Attached only to medallion materials.
  //
  // Mobile: procedural RoomEnvironment via PMREM — no network fetch,
  //         near-instant decode. Saves 1.6 MB HDR download + decode.
  // Tablet/desktop: real HDRI for prettier specular.
  async _loadMedallionEnv() {
    if (this._deviceTier === "mobile") {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this._medallionEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
      return;
    }
    const hdr = await new RGBELoader().loadAsync(HDRI_URL);
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    this._medallionEnv = hdr;
  }

  // ── Homepage sculptures ──────────────────────────────────────────
  // Same load recipe as main.js's loadOneModel: bbox-recenter, pedestal
  // + halo underneath, one key point light 6.5 units above.
  async _loadHomepageSculptures() {
    for (let i = 0; i < HOMEPAGE_MODELS.length; i++) {
      const def = HOMEPAGE_MODELS[i];
      try {
        const model = await loadModel(def.file);
        if (def.scale) model.scale.setScalar(def.scale);
        model.updateMatrixWorld(true);

        const bbox = new THREE.Box3().setFromObject(model);
        const cx   = isFinite(bbox.min.x) ? (bbox.min.x + bbox.max.x) / 2 : 0;
        const cz   = isFinite(bbox.min.z) ? (bbox.min.z + bbox.max.z) / 2 : 0;
        const yOff = isFinite(bbox.min.y) ? -bbox.min.y + 0.3 : 0.3;
        model.position.set(-cx, yOff, def.z - cz);

        model.traverse(c => {
          if (!c.isMesh) return;
          c.castShadow = c.receiveShadow = !this._isMobile;
        });
        this.scene.add(model);
        this._sculptures.push(model);

        const ped = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.5, 0.3, 32), PEDESTAL_MAT,
        );
        ped.position.set(0, 0.15, def.z);
        ped.castShadow = ped.receiveShadow = true;
        this.scene.add(ped);
        this._sculptures.push(ped);

        const halo = createHalo();
        halo.position.set(0, 0.02, def.z);
        this.scene.add(halo);
        this._sculptures.push(halo);

        const key = new THREE.PointLight(
          0xd0e8ff, HOMEPAGE_KEY_INTENSITIES[i] ?? 500, 16, 2,
        );
        key.position.set(0, 6.5, def.z);
        this.scene.add(key);
        this._sculptures.push(key);

        console.log(`[contactScene] loaded ${def.file} @ z=${def.z}`);
      } catch (err) {
        console.error(`[contactScene] failed to load ${def.file}`, err);
      }
    }
  }

  // ── Medallion asset ──────────────────────────────────────────────
  async _loadMedallionTemplate() {
    // loadModel from three/loader.js has DRACOLoader wired — it accepts
    // Draco-compressed GLBs transparently. Same helper the homepage uses.
    const template = await loadModel(MEDALLION_URL);

    // Uniform scale FIRST — subsequent bbox measurement + bail-top offset
    // then work in the scaled world dimensions automatically.
    template.scale.setScalar(CONFIG.medallionScale);
    template.updateMatrixWorld(true);

    this.material = new THREE.MeshStandardMaterial({
      color:           CONFIG.material.color,
      metalness:       CONFIG.material.metalness,
      roughness:       CONFIG.material.roughness,
      envMapIntensity: CONFIG.material.envMapIntensity,
      envMap:          this._medallionEnv, // ONLY on medallion materials
    });
    this.textMaterial = new THREE.MeshStandardMaterial({
      color:           CONFIG.engravedText.color,
      metalness:       CONFIG.engravedText.metalness,
      roughness:       CONFIG.engravedText.roughness,
      envMapIntensity: CONFIG.engravedText.envMapIntensity,
      envMap:          this._medallionEnv,
    });

    template.traverse((obj) => {
      if (!obj.isMesh) return;
      const name = (obj.name || "").toLowerCase();
      const isEngraved = name.includes("write") || name.includes("talk");
      obj.material = isEngraved ? this.textMaterial : this.material;
    });

    const box    = new THREE.Box3().setFromObject(template);
    const size   = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    this._modelSize.copy(size);

    console.log(
      "[contactScene] medallion bbox — size:",
      size.toArray().map(n => +n.toFixed(4)),
      "center:",
      center.toArray().map(n => +n.toFixed(4)),
    );

    template.position.sub(center);
    template.position.y -= size.y / 2;
    this._medallionTemplate = template;
  }

  // ── Pendulums (chain + medallion, one per CONFIG.pendulums entry) ─
  _createPendulums() {
    const cc = CONFIG.chain;

    const geo = new THREE.TorusGeometry(cc.linkRadius, cc.linkTube, 8, 20);
    geo.scale(1, cc.linkAspect, 1);
    this._chainGeom = geo;

    // Configure cursor plane at the medallion z so cursor impulses
    // reach the chain in the right slice of the world.
    const anchorZ = CONFIG.pendulums[0].anchor.z;
    this._mousePlane.constant = -anchorZ; // plane z = anchorZ, normal +Z

    this.pendulums = [];
    for (let pi = 0; pi < CONFIG.pendulums.length; pi++) {
      const pcfg = CONFIG.pendulums[pi];

      const points = [];
      const prev   = [];
      for (let i = 0; i < cc.segments; i++) {
        const p = new THREE.Vector3(
          pcfg.anchor.x,
          pcfg.anchor.y - i * cc.segmentLength,
          pcfg.anchor.z,
        );
        points.push(p);
        prev.push(p.clone());
      }

      const linkCount = cc.segments - 1;
      const mesh = new THREE.InstancedMesh(geo, this.material, linkCount);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false;
      this.scene.add(mesh);

      const model = pi === 0
        ? this._medallionTemplate
        : this._medallionTemplate.clone(true);

      const twist  = new THREE.Group();
      const swivel = new THREE.Group();
      const rig    = new THREE.Group();
      twist.add(model);
      swivel.add(twist);
      rig.add(swivel);
      twist.userData.faceFlip = pcfg.faceBack ? Math.PI : 0;
      this.scene.add(rig);

      const pend = { points, prev, mesh, model, rig, swivel, twist, cfg: pcfg };
      this.pendulums.push(pend);

      this._updateChainMeshFor(pend);
      this._updateMedallionFromChain(pend);
    }
  }

  // ── Medallion-only softbox rig ───────────────────────────────────
  // Two RectAreaLights (key + fill) act as a two-sided studio softbox.
  // The large emitter surface prevents the hotspot-and-shadow problem
  // that a single point light gives on shiny metal.
  _addMedallionLights() {
    const kc = CONFIG.medallionLight.key;
    const fc = CONFIG.medallionLight.fill;

    const key = new THREE.RectAreaLight(kc.color, kc.intensity, kc.width, kc.height);
    key.position.set(kc.position.x, kc.position.y, kc.position.z);
    key.lookAt(kc.target.x, kc.target.y, kc.target.z);
    this.scene.add(key);
    this._medallionKey = key;

    const fill = new THREE.RectAreaLight(fc.color, fc.intensity, fc.width, fc.height);
    fill.position.set(fc.position.x, fc.position.y, fc.position.z);
    fill.lookAt(fc.target.x, fc.target.y, fc.target.z);
    this.scene.add(fill);
    this._medallionFill = fill;
  }

  // ── Dust particles (from main.js) ────────────────────────────────
  _createDust() {
    if (this._isMobile) return; // desktop-only, same as homepage
    const PC = 600;
    this._dustGeometry = new THREE.BufferGeometry();
    this._dustPositions        = new Float32Array(PC * 3);
    this._dustInitialPositions = new Float32Array(PC * 3);

    for (let i = 0; i < PC; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = Math.random() * 7;
      const z = 5 - Math.random() * 65;
      this._dustPositions[i*3]     = this._dustInitialPositions[i*3]     = x;
      this._dustPositions[i*3 + 1] = this._dustInitialPositions[i*3 + 1] = y;
      this._dustPositions[i*3 + 2] = this._dustInitialPositions[i*3 + 2] = z;
    }
    this._dustGeometry.setAttribute("position",
      new THREE.BufferAttribute(this._dustPositions, 3),
    );
    this._dustMat = new THREE.PointsMaterial({
      size: 0.015, color: 0x8090c0,
      transparent: true, opacity: 0.35, depthWrite: false,
    });
    this._dustPoints = new THREE.Points(this._dustGeometry, this._dustMat);
    this.scene.add(this._dustPoints);
  }

  _animateDust(elapsed) {
    if (!this._dustGeometry) return;
    const pos = this._dustGeometry.attributes.position;
    const init = this._dustInitialPositions;
    const n = pos.count;
    for (let i = 0; i < n; i++) {
      const ix = i * 3;
      pos.array[ix + 1] += 0.001;
      pos.array[ix + 0] = init[ix]     + Math.sin(elapsed * 0.3 + i * 0.17) * 0.08;
      pos.array[ix + 2] = init[ix + 2] + Math.cos(elapsed * 0.2 + i * 0.13) * 0.05;
      if (pos.array[ix + 1] > 7) {
        pos.array[ix + 1] = 0;
        init[ix + 1] = 0;
      }
    }
    pos.needsUpdate = true;
  }

  // ── Post-processing (composer chain from homepage) ───────────────
  // createPostProcessing's `isMobile=true` path skips SSAO / Bokeh /
  // Chromatic aberration. We pass true for both mobile AND tablet so
  // touch devices get the reduced pipeline (render + bloom + underwater
  // + grain/vignette).
  _setupPost() {
    const reducedPost = this._deviceTier !== "desktop";
    this._underwater = createUnderwaterSystem(
      this.renderer, { isMobile: this._deviceTier === "mobile" },
    );
    this._post = createPostProcessing(
      this.renderer, this.scene, this.camera, reducedPost,
      this._underwater.pass,
    );
  }

  // ── Camera lock — homepage's entry pose, tier-adjusted ──────────
  // Portrait / smaller-screen tiers pull the camera IN and DOWN so both
  // medallions fit horizontally and stay proportionally big enough to
  // read against the tighter vertical band available.
  _lockCamera() {
    const w = window.innerWidth, h = window.innerHeight;
    const isPortrait = (w / h) < 1;
    const tier = this._deviceTier;

    let camZ = 10, camY = 1.8, lookY = 1.5;
    if (tier === "tablet")  { camZ = isPortrait ? 8.5 : 9;   camY = 1.7; lookY = 1.4; }
    if (tier === "mobile")  { camZ = isPortrait ? 7   : 8.5; camY = 1.6; lookY = 1.3; }

    this.camera.position.set(0, camY, camZ);
    this.camera.lookAt(0, lookY, 0);

    // Freeze the spot light where main.js's tick would put it during
    // the initial "in orbit around hand.glb" state.
    this._spotLight?.position.set(0, 6, 0);
    this._spotLight?.target.position.set(0, 0.5, 0);
    this._spotLight?.target.updateMatrixWorld();
  }

  // ── Chain solver (Verlet) ────────────────────────────────────────
  _stepAllChains(dt) {
    if (!this.pendulums.length) return;
    const cc    = CONFIG.chain;
    const gravY = -cc.gravity * dt * dt;
    const damp  = cc.damping;
    const drift = cc.ambientDrift * dt * dt;
    const t     = this._elapsed;

    for (const pend of this.pendulums) {
      const points = pend.points;
      const prev   = pend.prev;

      // Pin anchor.
      points[0].set(pend.cfg.anchor.x, pend.cfg.anchor.y, pend.cfg.anchor.z);
      prev[0].copy(points[0]);

      const phase = pend.cfg.anchor.x;
      const driftX = Math.sin(t * 0.31 + phase) * drift;
      const driftZ = Math.cos(t * 0.19 + phase) * drift * 0.4;

      for (let i = 1; i < points.length; i++) {
        const p  = points[i];
        const pp = prev[i];
        const vx = (p.x - pp.x) * damp;
        const vy = (p.y - pp.y) * damp;
        const vz = (p.z - pp.z) * damp;
        pp.copy(p);
        p.x += vx + driftX;
        p.y += vy + gravY;
        p.z += vz + driftZ;
      }

      this._applyMouseImpulseTo(pend, dt);

      const L = cc.segmentLength;
      for (let iter = 0; iter < cc.iterations; iter++) {
        for (let i = 1; i < points.length; i++) {
          const a = points[i - 1];
          const b = points[i];
          const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
          const d  = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
          const diff = (d - L) / d;
          if (i - 1 === 0) {
            b.x -= dx * diff;
            b.y -= dy * diff;
            b.z -= dz * diff;
          } else {
            const half = 0.5 * diff;
            a.x += dx * half;  a.y += dy * half;  a.z += dz * half;
            b.x -= dx * half;  b.y -= dy * half;  b.z -= dz * half;
          }
        }
      }
    }
  }

  _applyMouseImpulseTo(pend, dt) {
    if (!this._mouseValid) return;
    const cc     = CONFIG.chain;
    const mCfg   = CONFIG.mouse;
    const points = pend.points;

    const vLen  = this._mouseWorldVel.length();
    const scale = vLen > mCfg.maxVel ? (mCfg.maxVel / vLen) : 1;
    const startIdx = mCfg.lowerHalfOnly
      ? Math.max(1, Math.floor(cc.segments * 0.5))
      : 1;
    const r2 = mCfg.radius * mCfg.radius;

    for (let i = startIdx; i < points.length; i++) {
      const p  = points[i];
      const dx = p.x - this._mouseWorld.x;
      const dy = p.y - this._mouseWorld.y;
      const dz = p.z - this._mouseWorld.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > r2) continue;
      const falloff = 1 - Math.sqrt(d2) / mCfg.radius;
      const k = mCfg.strength * falloff * dt * scale;
      p.x += this._mouseWorldVel.x * k;
      p.y += this._mouseWorldVel.y * k;
      p.z += this._mouseWorldVel.z * k;
    }
  }

  // ── Chain rendering ──────────────────────────────────────────────
  _updateChainMeshFor(pend) {
    const points    = pend.points;
    const mesh      = pend.mesh;
    const linkCount = points.length - 1;

    for (let i = 0; i < linkCount; i++) {
      const a = points[i];
      const b = points[i + 1];
      const mx = (a.x + b.x) * 0.5;
      const my = (a.y + b.y) * 0.5;
      const mz = (a.z + b.z) * 0.5;

      _VY.set(b.x - a.x, b.y - a.y, b.z - a.z).normalize();

      let ref = _VREF_X;
      if (Math.abs(_VY.dot(ref)) > 0.98) ref = _VREF_Z;

      _VP1.crossVectors(_VY, ref).normalize();
      _VP2.crossVectors(_VY, _VP1).normalize();

      const holeAxis = (i & 1) === 0 ? _VP1 : _VP2;
      _VX.crossVectors(_VY, holeAxis).normalize();

      _MAT.makeBasis(_VX, _VY, holeAxis);
      _MAT.setPosition(mx, my, mz);
      mesh.setMatrixAt(i, _MAT);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  _updateMedallionFromChain(pend) {
    const pts = pend.points;
    const n   = pts.length;
    const p1  = pts[n - 1];
    const p0  = pts[n - 2];

    pend.rig.position.copy(p1);

    _VY.set(0, 1, 0);
    _VP1.set(p0.x - p1.x, p0.y - p1.y, p0.z - p1.z).normalize();
    pend.swivel.quaternion.setFromUnitVectors(_VY, _VP1);

    const tw = CONFIG.twist;
    const wobble = Math.sin(this._elapsed * tw.hz * Math.PI * 2) * tw.amplitude;
    pend.twist.rotation.y = pend.twist.userData.faceFlip + wobble;
  }

  // ── Cursor tracking ──────────────────────────────────────────────
  _onPointerMove(e) {
    if (!this.canvas || !this.camera) return;
    const rect = this.canvas.getBoundingClientRect();
    this._pointerNDC.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    this._pointerNDC.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    this._pointerNorm.x = (e.clientX - rect.left) / rect.width;
    this._pointerNorm.y = 1 - (e.clientY - rect.top) / rect.height;

    this._raycaster.setFromCamera(this._pointerNDC, this.camera);
    if (this._raycaster.ray.intersectPlane(this._mousePlane, _HIT)) {
      if (this._mouseValid) {
        this._mouseWorldVel.subVectors(_HIT, this._mouseWorld);
      } else {
        this._mouseWorldVel.set(0, 0, 0);
      }
      this._mouseWorld.copy(_HIT);
      this._mouseValid = true;
    }

    // Hover cursor — pointer icon over a medallion so it reads as clickable.
    const hit = this._raycastMedallion();
    this.canvas.style.cursor = hit ? "pointer" : "";
  }

  // ── Click → per-pendulum action (cal.com booking / mailto) ──────
  _onClick() {
    const hit = this._raycastMedallion();
    if (!hit) return;
    const action = hit.cfg.action;
    if (!action) return;
    if (action.type === "external") {
      window.open(action.href, "_blank", "noopener,noreferrer");
    } else if (action.type === "mailto") {
      // Same-tab mailto — browsers dispatch to the OS handler without
      // actually navigating away, so the scene keeps rendering.
      window.location.href = action.href;
    }
  }

  // Raycasts the current pointer NDC against both medallion rigs and
  // returns the hit pendulum (or null). Cheap: two rigs, small mesh
  // trees; fine to call on every pointermove.
  _raycastMedallion() {
    if (!this.pendulums.length) return null;
    this._raycaster.setFromCamera(this._pointerNDC, this.camera);
    const rigs = _RIG_SCRATCH;
    rigs.length = 0;
    for (const pend of this.pendulums) rigs.push(pend.rig);
    const hits = this._raycaster.intersectObjects(rigs, true);
    if (!hits.length) return null;
    // Walk up from the hit mesh to find which pendulum rig owns it.
    let obj = hits[0].object;
    while (obj) {
      for (const pend of this.pendulums) {
        if (pend.rig === obj) return pend;
      }
      obj = obj.parent;
    }
    return null;
  }

  // ── Loop ─────────────────────────────────────────────────────────
  _startLoop() {
    this._active = true;
    this._lastTime = performance.now();
    const tick = (now) => {
      if (!this._active) return;

      let dt = (now - this._lastTime) / 1000;
      if (!Number.isFinite(dt) || dt < 0) dt = 0;
      if (dt > 1 / 30)                    dt = 1 / 30;
      this._lastTime = now;
      this._elapsed += dt;

      this._stepAllChains(dt);
      for (const pend of this.pendulums) {
        this._updateChainMeshFor(pend);
        this._updateMedallionFromChain(pend);
      }

      this._mouseWorldVel.multiplyScalar(0.85);

      if (this._wallUniforms) this._wallUniforms.uTime.value = this._elapsed;
      if (!this._isMobile)    this._animateDust(this._elapsed);

      // Underwater sim + composer.
      if (this._underwater) {
        this._underwater.setMouseNorm(this._pointerNorm.x, this._pointerNorm.y);
        this._underwater.update();
      }
      if (this._post) this._post.composer.render();
      else            this.renderer.render(this.scene, this.camera);

      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  _onResize() {
    if (!this.renderer || !this.camera) return;
    // Homepage's createScene installed its own onResize which does aspect+size.
    this._homeOnResize?.();
    this._post?.setSize?.(window.innerWidth, window.innerHeight);
  }

  // ── Cleanup ──────────────────────────────────────────────────────
  destroy() {
    this._active = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    window.removeEventListener("resize",      this._onResize);
    window.removeEventListener("pointermove", this._onPointerMove);
    this.canvas?.removeEventListener("click", this._onClick);
    this._restoreScroll();

    // Pendulums
    for (const pend of this.pendulums) {
      this.scene?.remove(pend.mesh);
      pend.mesh.dispose?.();
      pend.model?.traverse?.((obj) => {
        if (obj.isMesh) obj.geometry?.dispose?.();
      });
      this.scene?.remove(pend.rig);
    }
    this.pendulums = [];
    this._chainGeom?.dispose();
    this._chainGeom = null;
    this._medallionTemplate = null;
    if (this._medallionKey)  { this.scene?.remove(this._medallionKey);  this._medallionKey  = null; }
    if (this._medallionFill) { this.scene?.remove(this._medallionFill); this._medallionFill = null; }

    // Sculptures
    for (const obj of this._sculptures) {
      this.scene?.remove(obj);
      if (obj.geometry) obj.geometry.dispose?.();
      // materials are shared per-model; leave GLTFLoader-owned ones alone
    }
    this._sculptures = [];

    // Dust
    if (this._dustPoints) {
      this.scene?.remove(this._dustPoints);
      this._dustGeometry?.dispose();
      this._dustMat?.dispose();
      this._dustPoints = this._dustGeometry = this._dustMat = null;
    }

    // Underwater
    if (this._underwater) {
      this._underwater.dispose();
      this._underwater = null;
    }
    // Post composer has no explicit dispose in our helper — the passes
    // and RTs are tied to the renderer which we dispose next.
    this._post = null;

    this.material?.dispose();
    this.textMaterial?.dispose();
    this._medallionEnv?.dispose();

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss?.();
    }
    this.container?.parentNode?.removeChild(this.container);

    this.renderer = this.scene = this.camera = null;
    this.container = this.canvas = null;
    this.material = this.textMaterial = null;
  }
}

// ── Scratch objects — allocated once, reused every frame ─────────────
const _VX     = new THREE.Vector3();
const _VY     = new THREE.Vector3();
const _VP1    = new THREE.Vector3();
const _VP2    = new THREE.Vector3();
const _VREF_X = new THREE.Vector3(1, 0, 0);
const _VREF_Z = new THREE.Vector3(0, 0, 1);
const _HIT    = new THREE.Vector3();
const _MAT    = new THREE.Matrix4();
const _RIG_SCRATCH = [];
