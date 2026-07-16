import Lenis from "lenis";
import * as THREE from "three";
import gsap from "gsap";

import { createScene, createHalo, createProjectionPlane } from "./three/scene.js";
import { createPostProcessing } from "./three/postprocessing.js";
import { loadModel, setLoadingManager } from "./three/loader.js";
import { Loader }                       from "./loader.js";
import { Menu }                         from "./menu.js";
import { initHoverRoll }                from "./hoverRoll.js";
import { mountPageTransition, signalPageReady } from "./pageTransition.js";
import {
  createShatterEffect,
  SHATTER_T_ENTER,
  SHATTER_T_DISSOLVE_END,
} from "./three/shatter.js";

// ---------- Device detection (must precede MODEL_DEFS) ----------
const isMobile = window.innerWidth < 768 || "ontouchstart" in window;

// ---------- Model tanımları ----------
const MODEL_CAPTIONS = {
  "hand.glb":        "Every brand begins like this.",
  "monument.glb":    "Something is always missing at the beginning.",
  "hero_canvas.glb": "Between sketch and masterpiece, there's patience.",
  "void_figure.glb": "What's left unsaid shapes the rest.",
  "arm_crystal.glb": "What was missing is held at the end.",
};
function captionFor(filename) { return MODEL_CAPTIONS[filename] ?? ""; }

const MODEL_DEFS = [
  { file: "/models/hand.glb",        z:   0, scale: 3 },
  { file: "/models/monument.glb",    z: -12, scale: 0.456 },
  { file: "/models/hero_canvas.glb", z: -24, scale: 3 },
  { file: "/models/void_figure.glb", z: -36, orbitN: isMobile ? 36 : 32 },
  { file: "/models/arm_crystal.glb", z: -48 },
].map(d => ({ ...d, caption: captionFor(d.file.split("/").pop()) }));

// ---------- DOM ----------
const canvas          = document.getElementById("scene-canvas");
const captionEl       = document.getElementById("caption");
const gatheringTextEl = document.getElementById("gathering-text");
const wordmarkEl      = document.querySelector(".wordmark");

// ---------- Three.js ----------
const { scene, renderer, camera, spotLight, armSpot, ambient, hemi, wallUniforms, onResize } = createScene(canvas, isMobile);

// Base light intensities — driven down during gathering effect
const AMBIENT_INTENSITY_BASE = 75.0;
const HEMI_INTENSITY_BASE    = 55.0;
const ARM_REVEAL_INTENSITY   = 900.0;
const ARM_CRYSTAL_Z          = -48;
const SPOT_INTENSITY_BASE    = 30.0;

const post      = createPostProcessing(renderer, scene, camera, isMobile);

// Reveal factor — starts at 0 when loader finishes, eases to 1 so the scene
// gently "wakes up" behind the iris rather than snapping to full brightness.
let _revealF = 0;
const projPlane = createProjectionPlane(scene);
const shatter   = createShatterEffect(renderer, scene, camera, isMobile);
let _shatterCaptured = false;

// ---------- Orbit sabitleri ----------
const CAM_H   = 1.8;
const ORBIT_R = isMobile ? 5 : 4;
const ORBIT_N = isMobile ? 16 : 32;

// ---------- Kamera yolu ----------
function buildPath() {
  const pts = [];
  const h = CAM_H, r = ORBIT_R;

  pts.push(new THREE.Vector3(0, h, 10));
  pts.push(new THREE.Vector3(0, h,  7));

  MODEL_DEFS.forEach((def, i) => {
    const mz = def.z;
    const n  = def.orbitN ?? ORBIT_N;
    for (let s = 0; s <= n; s++) {
      const a = (s / n) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.sin(a) * r, h, mz + Math.cos(a) * r));
    }
    if (i < MODEL_DEFS.length - 1) {
      const nextZ = MODEL_DEFS[i + 1].z;
      pts.push(new THREE.Vector3(r * 1.5, h, mz));
      pts.push(new THREE.Vector3(r * 0.8, h, mz - r - 1));
      pts.push(new THREE.Vector3(0,       h, nextZ + r + 1));
    }
  });

  const lastZ = MODEL_DEFS[MODEL_DEFS.length - 1].z;
  pts.push(new THREE.Vector3(r * 1.2, h, lastZ));
  pts.push(new THREE.Vector3(0,       h, lastZ - r - 2));
  pts.push(new THREE.Vector3(0,       h, lastZ - 20));
  pts.push(new THREE.Vector3(0,       h, lastZ - 28));

  return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
}

const camPath = buildPath();

// ---------- Scroll → spline ----------
let splineT       = 0;
let splineTSmooth = 0;

const _camTarget  = new THREE.Vector3();
const _lookTarget = new THREE.Vector3(0, 1.5, 0);
const _lookNow    = new THREE.Vector3(0, 1.5, 0);
const _spotPos    = new THREE.Vector3(0, 6, 0);
const _spotLook   = new THREE.Vector3(0, 0.5, 0);

// ---------- Caption ----------
let _lastCaption = null;
function showCaption(text) {
  if (text === _lastCaption) return;
  _lastCaption = text;
  gsap.killTweensOf(captionEl);
  if (!text) { gsap.to(captionEl, { opacity: 0, duration: 0.3 }); return; }
  gsap.to(captionEl, {
    opacity: 0, duration: 0.25, ease: "power2.in",
    onComplete() {
      captionEl.textContent = text;
      gsap.to(captionEl, { opacity: 1, duration: 0.5, ease: "power2.out" });
    },
  });
}

// ---------- En yakın model ----------
function findNearest(camPos) {
  let minD = Infinity, best = null;
  for (const d of MODEL_DEFS) {
    const dist = Math.hypot(camPos.x, camPos.z - d.z);
    if (dist < minD) { minD = dist; best = d; }
  }
  return { def: best, dist: minD };
}

// ---------- Hover distortion state ----------
const raycaster    = new THREE.Raycaster();
const pointer      = new THREE.Vector2(-9, -9);
const clock        = new THREE.Clock();
const distortItems = [];
let   hoveredZ     = null;

canvas.addEventListener("pointermove", e => {
  pointer.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});
canvas.addEventListener("pointerleave", () => pointer.set(-9, -9));

// ---------- Dust Particles ----------
let dustGeometry          = null;
let dustPositions         = null;
let dustInitialPositions  = null;
let dustPoints            = null;
const PARTICLE_COUNT      = 600;

function createDustParticles() {
  dustGeometry = new THREE.BufferGeometry();
  dustPositions        = new Float32Array(PARTICLE_COUNT * 3);
  dustInitialPositions = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (Math.random() - 0.5) * 16;
    const y = Math.random() * 7;
    const z = 5 - Math.random() * 65;
    dustPositions[i*3]     = dustInitialPositions[i*3]     = x;
    dustPositions[i*3 + 1] = dustInitialPositions[i*3 + 1] = y;
    dustPositions[i*3 + 2] = dustInitialPositions[i*3 + 2] = z;
  }

  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({
    size: 0.015, color: 0x8090c0,
    transparent: true, opacity: 0.35, depthWrite: false,
  });
  dustPoints = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dustPoints);
}

function animateDust(elapsed) {
  if (!dustGeometry) return;
  const pos = dustGeometry.attributes.position;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const ix = i * 3;
    pos.array[ix + 1] += 0.001;
    pos.array[ix + 0] = dustInitialPositions[ix]     + Math.sin(elapsed * 0.3 + i * 0.17) * 0.08;
    pos.array[ix + 2] = dustInitialPositions[ix + 2] + Math.cos(elapsed * 0.2 + i * 0.13) * 0.05;
    if (pos.array[ix + 1] > 7) {
      pos.array[ix + 1] = 0;
      dustInitialPositions[ix + 1] = 0;
    }
  }
  pos.needsUpdate = true;
}

// ---------- Model references for shatter crossfade ----------
let voidFigureModel = null;
let heroCanvasModel = null;

// ---------- Per-model key light intensities — escalating toward model 5 ----------
const MODEL_KEY_INTENSITIES = [155, 255, 390, 580, 1190];

const _pedMat = new THREE.MeshStandardMaterial({
  color: 0x0d0d0f, roughness: 0.9, metalness: 0.1,
});

async function loadOneModel(def, modelIdx) {
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
      c.castShadow = c.receiveShadow = !isMobile;

      if (!isMobile) {
        const mat      = c.material.clone();
        const uniforms = { uTime: { value: 0 }, uIntensity: { value: 0 } };
        mat.onBeforeCompile = shader => {
          shader.uniforms.uTime      = uniforms.uTime;
          shader.uniforms.uIntensity = uniforms.uIntensity;
          shader.vertexShader =
            "uniform float uTime;\nuniform float uIntensity;\n" +
            shader.vertexShader.replace(
              "#include <begin_vertex>",
              `#include <begin_vertex>
               float _w = sin(position.x * 4.0 + uTime * 1.3)
                        * sin(position.y * 3.5 + uTime * 0.9)
                        * 0.015 * uIntensity;
               transformed += normal * _w;`,
            );
        };
        mat.customProgramCacheKey = () => "holm_distort";
        c.material = mat;
        distortItems.push({ mesh: c, uniforms, defZ: def.z });
      }
    });

    scene.add(model);

    if (def.file.includes("void_figure")) {
      voidFigureModel = model;
      shatter.setSurface(model);
    }
    if (def.file.includes("hero_canvas")) {
      heroCanvasModel = model;
      shatter.setHeroCanvas(model);
    }

    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.3, 32), _pedMat);
    ped.position.set(0, 0.15, def.z);
    ped.castShadow = ped.receiveShadow = true;
    scene.add(ped);

    const halo = createHalo();
    halo.position.set(0, 0.02, def.z);
    scene.add(halo);

    const keyLight = new THREE.PointLight(0xd0e8ff, MODEL_KEY_INTENSITIES[modelIdx] ?? 500, 16, 2);
    keyLight.position.set(0, 6.5, def.z);
    scene.add(keyLight);

    console.log(`[HOLM] ✓ ${def.file} @ z=${def.z}`);
  } catch (err) {
    console.error(`[HOLM] ✗ ${def.file}`, err);
  }
}

// ---------- Projection ----------
let projectionShown = false;
const projOverlay   = document.getElementById("projection-overlay");

function showProjection() {
  projPlane.visible = true;
  projOverlay.classList.add("active");
  gsap.to(projOverlay, { opacity: 1, duration: 1.2, ease: "power2.out" });
  const lines = projOverlay.querySelectorAll(".proj-line");
  gsap.fromTo(lines,
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 1.0, stagger: 0.4, delay: 0.4, ease: "power2.out" },
  );
  gsap.fromTo(projOverlay.querySelector(".proj-cta"),
    { opacity: 0, y: 8 },
    { opacity: 1, y: 0, duration: 1.0, delay: 2.6, ease: "power2.out" },
  );
}

function hideProjection() {
  gsap.to(projOverlay, {
    opacity: 0, duration: 0.5,
    onComplete: () => {
      projOverlay.classList.remove("active");
      projPlane.visible = false;
      gsap.set(".proj-line, .proj-cta", { opacity: 0, y: 0 });
    },
  });
}

// ---------- Lenis ----------
const lenis = new Lenis(isMobile ? {
  smoothTouch:     false,
  touchMultiplier: 0.65,
} : {
  duration:        4.0,
  smoothWheel:     true,
  wheelMultiplier: 0.28,
  touchMultiplier: 1.2,
  smoothTouch:     false,
});
gsap.ticker.lagSmoothing(0);

// Wrap every [data-hover-roll] target with the two-line stagger effect
initHoverRoll(document);

// Read the transition flag BEFORE mounting the transition — mount()
// consumes (removes) the flag when it enters "pending reveal" mode,
// so boot() below wouldn't see it otherwise.
const arrivedViaTransition = (() => {
  try { return sessionStorage.getItem("holm:transition") === "1"; }
  catch (_) { return false; }
})();

// Site-wide page transition — grid shutter cover-and-hold on nav
mountPageTransition();

// Room-guide menu — mounted everywhere (dev + prod behave the same).
// #book-call is hidden while the menu takes the corner slot.
const menu = new Menu({ lenis });
menu.mount();
// Re-scan for [data-hover-roll] targets now that the menu DOM exists
initHoverRoll(document);
const bookCall = document.getElementById("book-call");
if (bookCall) bookCall.style.display = "none";

lenis.on("scroll", ({ scroll, limit }) => {
  splineT = limit > 0 ? scroll / limit : 0;
});

// ---------- Render döngüsü ----------
function tick(now = 0) {
  requestAnimationFrame(tick);
  lenis.raf(now);

  const elapsed = clock.getElapsedTime();

  if (!isMobile) {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(distortItems.map(d => d.mesh), false);
    hoveredZ = hits.length > 0
      ? (distortItems.find(d => d.mesh === hits[0].object)?.defZ ?? null)
      : null;
    for (const item of distortItems) {
      item.uniforms.uTime.value = elapsed;
      const target = item.defZ === hoveredZ ? 1 : 0;
      const iv = item.uniforms.uIntensity;
      iv.value += (target - iv.value) * 0.12;
      if (iv.value < 0.001) iv.value = 0;
    }
  }

  if (isMobile) {
    splineTSmooth += (splineT - splineTSmooth) * 0.11;
    _camTarget.copy(camPath.getPoint(splineTSmooth));
    camera.position.copy(_camTarget);
  } else {
    _camTarget.copy(camPath.getPoint(splineT));
    camera.position.lerp(_camTarget, 0.07);
  }

  const { def: near, dist } = findNearest(camera.position);
  const inOrbit      = near && dist < ORBIT_R + 1.5;
  const inCorridor   = camera.position.z < -56;
  const inProjection = camera.position.z < -68;

  if (inCorridor) {
    _lookTarget.set(0, 4, -89.5);
    _spotPos.set(0, 7, camera.position.z);
    _spotLook.set(0, 3.5, -89.5);
    showCaption("");
    projPlane.material.uniforms.uTime.value = elapsed;
    if (inProjection && !projectionShown) { projectionShown = true;  showProjection(); }
    if (!inProjection && projectionShown)  { projectionShown = false; hideProjection(); }
  } else if (inOrbit) {
    _lookTarget.set(0, 1.5, near.z);
    _spotPos.set(0, 6, near.z);
    _spotLook.set(0, 0.5, near.z);
    showCaption(near.caption);
    if (projectionShown) { projectionShown = false; hideProjection(); }
  } else {
    const next = MODEL_DEFS.find(d => d.z < camera.position.z - 1);
    _lookTarget.set(0, 1.5, next ? next.z : camera.position.z - 10);
    _spotPos.set(0, 6, camera.position.z - 3);
    _spotLook.set(0, 0.5, camera.position.z - 8);
    if (dist > ORBIT_R * 3) showCaption("");
    if (projectionShown) { projectionShown = false; hideProjection(); }
    projPlane.visible = false;
  }

  _lookNow.lerp(_lookTarget, 0.07);
  camera.lookAt(_lookNow);

  spotLight.position.lerp(_spotPos, 0.05);
  spotLight.target.position.lerp(_spotLook, 0.05);
  spotLight.target.updateMatrixWorld();

  const _armDist = Math.hypot(camera.position.x, camera.position.z - ARM_CRYSTAL_Z);
  armSpot.intensity += (((_armDist < ORBIT_R + 3 ? ARM_REVEAL_INTENSITY : 0)) - armSpot.intensity) * 0.10;

  if (post.bokeh)         post.bokeh.uniforms["focus"].value       = dist;
  if (post.grainVignette) post.grainVignette.uniforms.uTime.value  = elapsed;
  wallUniforms.uTime.value = elapsed;

  if (!isMobile) animateDust(elapsed);

  // Shatter must follow the *raw* scroll position on both platforms.
  // Using splineTSmooth on mobile made the smoothed T interpolate through
  // the 0.51-0.65 range on its own after any fast scroll → the effect
  // played automatically, and it also missed the correct trigger point
  // relative to what the user was actually looking at. Raw splineT keeps
  // the shatter locked to the user's actual scroll position.
  const effectT = splineT;
  if (effectT >= SHATTER_T_ENTER && !_shatterCaptured) {
    _shatterCaptured = true;
    shatter.capture();
  }
  if (effectT < SHATTER_T_ENTER - 0.05) _shatterCaptured = false;

  const { bgDark, textOpacity } = shatter.update(effectT);

  const brightF = (1 - bgDark * 0.92) * _revealF;
  ambient.intensity   = AMBIENT_INTENSITY_BASE * brightF;
  hemi.intensity      = HEMI_INTENSITY_BASE    * brightF;
  spotLight.intensity = SPOT_INTENSITY_BASE    * Math.max(brightF, 0.12 * _revealF);

  if (gatheringTextEl) gatheringTextEl.style.opacity = textOpacity;
  if (textOpacity > 0.01) showCaption("");

  post.composer.render();
}

// ---------- Resize ----------
window.addEventListener("resize", () => {
  onResize();
  post.setSize(window.innerWidth, window.innerHeight);
});

// ---------- Boot ----------
async function boot() {
  const p0 = camPath.getPoint(0);
  camera.position.copy(p0);
  camera.position.z += 3;
  _lookNow.set(0, 1.5, MODEL_DEFS[0].z);
  camera.lookAt(_lookNow);

  // arrivedViaTransition is captured at module load (before mount
  // consumes the sessionStorage flag). If it's true, the block cover
  // is already holding the screen — Loader visuals would double up.

  // Cinematic preloader — diamond + counter → iris reveal
  // Camera dolly + caption fade fire at reveal-start so they play DURING
  // the iris opening (not after), producing a continuous transition
  // rather than "iris then jump-to-settled-scene".
  let mainTickStarted = false;
  const onSceneReveal = () => {
    if (mainTickStarted) return;
    mainTickStarted = true;
    requestAnimationFrame(tick);

    // Scene wakes up slowly — 4.2s ramp so lights are still climbing after
    // the iris is fully open (~2.2s). Prevents "iris then bright scene" jump.
    const rev = { v: 0 };
    gsap.to(rev, {
      v: 1,
      duration: 4.2,
      ease: "power2.out",
      onUpdate: () => { _revealF = rev.v; },
    });

    gsap.to(camera.position, {
      z: p0.z,
      duration: 3.8,
      ease: "power2.out",
    });
    gsap.to(captionEl, {
      opacity: 1,
      duration: 1.4,
      delay: 2.4,
      ease: "power2.out",
    });

    // Landing teaser — 2-line "what is HOLM" that appears in the first
    // few seconds after iris reveal so a visitor who doesn't scroll still
    // learns what this site is. Fades out once they start scrolling OR
    // after a 7s dwell, whichever comes first.
    const teaser = document.getElementById("holm-teaser");
    if (teaser) {
      teaser.setAttribute("aria-hidden", "false");
      gsap.fromTo(teaser,
        { opacity: 0, y: 12 },
        {
          opacity: 1, y: 0,
          duration: 1.2, delay: 1.6,
          ease: "power2.out",
        },
      );

      const hideTeaser = () => {
        gsap.to(teaser, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => teaser.setAttribute("aria-hidden", "true"),
        });
        window.removeEventListener("wheel",     onScrollHide, { passive: true });
        window.removeEventListener("touchmove", onScrollHide, { passive: true });
        clearTimeout(dwellTimer);
      };
      const onScrollHide = () => {
        // Ignore taps and jitter — only real scroll intent hides the teaser
        if (window.scrollY > 20) hideTeaser();
      };
      const dwellTimer = setTimeout(hideTeaser, 7000);
      window.addEventListener("wheel",     onScrollHide, { passive: true });
      window.addEventListener("touchmove", onScrollHide, { passive: true });
    }
  };

  if (arrivedViaTransition) {
    // No preloader visuals — hand GLTF progress to a bare THREE
    // loading manager so models still load. Reveal fires the moment
    // resources are ready.
    setLoadingManager(new THREE.LoadingManager());
    for (let i = 0; i < MODEL_DEFS.length; i++) {
      await loadOneModel(MODEL_DEFS[i], i);
    }
    if (!isMobile) createDustParticles();
    onSceneReveal();
    // Tell the page transition the scene is ready — block cover fades out
    signalPageReady();
  } else {
    const loader = new Loader({ renderer, onReveal: onSceneReveal });

    // Route GLTF progress into loader's UI counter
    setLoadingManager(loader.getLoadingManager());

    // Kick off loader visuals + phase gates; models load in parallel below
    const loaderPromise = loader.run();

    for (let i = 0; i < MODEL_DEFS.length; i++) {
      await loadOneModel(MODEL_DEFS[i], i);
    }

    if (!isMobile) createDustParticles();

    loader.markComplete();
    await loaderPromise;
  }

  // CTA button magnetic hover
  const ctaBtn = document.querySelector(".proj-cta");
  if (ctaBtn) {
    ctaBtn.addEventListener("mousemove", e => {
      const r  = ctaBtn.getBoundingClientRect();
      const nx = (e.clientX - r.left - r.width  * 0.5) / r.width;
      const ny = (e.clientY - r.top  - r.height * 0.5) / r.height;
      gsap.to(ctaBtn, { x: nx * 14, y: ny * 9, duration: 0.35, ease: "power2.out" });
    });
    ctaBtn.addEventListener("mouseleave", () =>
      gsap.to(ctaBtn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" }),
    );
  }
}

boot();
