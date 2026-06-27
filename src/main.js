import Lenis from "lenis";
import * as THREE from "three";
import gsap from "gsap";

import { createScene, createHalo, createProjectionPlane } from "./three/scene.js";
import { createPostProcessing } from "./three/postprocessing.js";
import { loadModel }            from "./three/loader.js";
import {
  createShatterEffect,
  SHATTER_T_ENTER,
  SHATTER_T_DISSOLVE_END,
} from "./three/shatter.js";

// Progress bar refs — declared here so the loading block below can access them
const _ldFill    = document.getElementById('ld-fill');
const _ldPct     = document.getElementById('ld-percent');
const _ldCounter = { val: 0 };

// Loading: split-letter reveal — GSAP controls y/opacity, CSS handles aurora gradient
{
  const _lc = document.querySelectorAll('.ld-c');
  gsap.set(_lc, { opacity: 0, y: 28, filter: 'blur(10px)' });
  gsap.set('.ld-c--dia', { scale: 1.35, y: 28 });
  gsap.to(_lc, {
    opacity: 1, y: 0, filter: 'blur(0px)',
    duration: 0.8, stagger: 0.10, ease: 'power3.out', delay: 0.35,
  });
  // Fake progress 0 → 90% while models load
  if (_ldFill && _ldPct) {
    gsap.to(_ldCounter, {
      val: 90, duration: 1.55, ease: 'power1.inOut', delay: 0.3,
      onUpdate() {
        const v = Math.round(_ldCounter.val);
        _ldFill.style.width = v + '%';
        _ldPct.textContent  = v + '%';
      },
    });
  }
}

// ---------- Device detection (must precede MODEL_DEFS) ----------
const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

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
  { file: "/models/monument.glb",    z: -12, scale: 0.57 },
  { file: "/models/hero_canvas.glb", z: -24, scale: 3 },
  { file: "/models/void_figure.glb", z: -36, orbitN: isMobile ? 36 : 32 },
  { file: "/models/arm_crystal.glb", z: -48 },
].map(d => ({ ...d, caption: captionFor(d.file.split("/").pop()) }));

// ---------- DOM ----------
const canvas          = document.getElementById("scene-canvas");
const captionEl       = document.getElementById("caption");
const gatheringTextEl = document.getElementById("gathering-text");
const loadingEl    = document.getElementById("loading");
const wordmarkEl   = document.querySelector(".wordmark");
const scrollHintEl = document.getElementById("scroll-hint");
const diamondCursor = document.getElementById("diamond-cursor");

// ---------- Three.js ----------
const { scene, renderer, camera, spotLight, armSpot, ambient, hemi, wallUniforms, onResize } = createScene(canvas, isMobile);

// Base light intensities (must match scene.js) — driven down during gathering effect
const AMBIENT_INTENSITY_BASE  =  75.0; // scene.js ambient ile senkron
const HEMI_INTENSITY_BASE     =  55.0; // scene.js hemi ile senkron
const ARM_REVEAL_INTENSITY    = 900.0; // arm_crystal reveal spot — ince ayar buradan
const ARM_CRYSTAL_Z           = -48;   // arm_crystal model z position
const SPOT_INTENSITY_BASE    = 30.0;
const post      = createPostProcessing(renderer, scene, camera, isMobile);
const projPlane = createProjectionPlane(scene);
const shatter   = createShatterEffect(renderer, scene, camera, isMobile);
let _shatterCaptured = false;

// ---------- Custom cursor + glow trail ----------
let _mouseNX = 0.5, _mouseNY = 0.5;

const TRAIL_COUNT = 14;
const _trailEls   = [];
let   _trailIdx   = 0;
let   _lastTrailMs = 0;

if (!isMobile) {
  for (let i = 0; i < TRAIL_COUNT; i++) {
    const el = document.createElement("div");
    el.className = "cursor-trail";
    el.style.opacity = "0";
    document.body.appendChild(el);
    _trailEls.push(el);
  }
}

if (!isMobile && diamondCursor) {
  canvas.style.cursor = "none";
  document.body.style.cursor = "none";
  window.addEventListener("mousemove", e => {
    diamondCursor.style.left = e.clientX + "px";
    diamondCursor.style.top  = e.clientY + "px";
    _mouseNX = e.clientX / window.innerWidth;
    _mouseNY = e.clientY / window.innerHeight;

    // Spawn trail dot every ~28ms
    const now = performance.now();
    if (now - _lastTrailMs > 28) {
      _lastTrailMs = now;
      const el = _trailEls[_trailIdx % TRAIL_COUNT];
      _trailIdx++;
      el.style.transition = "none";
      el.style.left    = e.clientX + "px";
      el.style.top     = e.clientY + "px";
      el.style.opacity = "0.8";
      el.style.transform = "translate(-50%, -50%) scale(1)";
      el.offsetHeight; // force reflow so transition fires
      el.style.transition = "opacity 0.55s ease-out, transform 0.55s ease-out";
      el.style.opacity   = "0";
      el.style.transform = "translate(-50%, -50%) scale(0.1)";
    }
  });
}

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
    const n  = def.orbitN ?? ORBIT_N; // per-model override, falls back to global
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

  // Projection approach — same for both
  const lastZ = MODEL_DEFS[MODEL_DEFS.length - 1].z;
  pts.push(new THREE.Vector3(r * 1.2, h, lastZ));
  pts.push(new THREE.Vector3(0,       h, lastZ - r - 2));
  pts.push(new THREE.Vector3(0,       h, lastZ - 20));
  pts.push(new THREE.Vector3(0,       h, lastZ - 28));

  return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
}

const camPath = buildPath();

// ---------- Scroll → spline ----------
let splineT       = 0; // target T (from scroll)
let splineTSmooth = 0; // smoothed T (drives camera on mobile — stays ON the path)

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
const pointer      = new THREE.Vector2(-9, -9); // off-screen by default
const clock        = new THREE.Clock();
const distortItems = []; // { mesh, uniforms: { uTime, uIntensity }, defZ }
let   hoveredZ     = null;

canvas.addEventListener("pointermove", e => {
  pointer.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});
canvas.addEventListener("pointerleave", () => pointer.set(-9, -9));

// ---------- Dust Particles ----------
let dustGeometry = null;
let dustPositions = null;
let dustInitialPositions = null;
let dustPoints = null;
const PARTICLE_COUNT = 600;

function createDustParticles() {
  dustGeometry = new THREE.BufferGeometry();
  dustPositions = new Float32Array(PARTICLE_COUNT * 3);
  dustInitialPositions = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (Math.random() - 0.5) * 16; // -8 to 8
    const y = Math.random() * 7;           //  0 to 7
    const z = 5 - Math.random() * 65;      //  5 to -60

    dustPositions[i * 3 + 0] = x;
    dustPositions[i * 3 + 1] = y;
    dustPositions[i * 3 + 2] = z;

    dustInitialPositions[i * 3 + 0] = x;
    dustInitialPositions[i * 3 + 1] = y;
    dustInitialPositions[i * 3 + 2] = z;
  }

  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));

  const dustMaterial = new THREE.PointsMaterial({
    size: 0.015,
    color: 0x8090c0,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });

  dustPoints = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dustPoints);
}

function animateDust(elapsed) {
  if (!dustGeometry) return;
  const pos = dustGeometry.attributes.position;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const ix = i * 3;

    // Slow upward drift
    pos.array[ix + 1] += 0.001;

    // Subtle sine wobble on X and Z
    const initX = dustInitialPositions[ix + 0];
    const initZ = dustInitialPositions[ix + 2];
    pos.array[ix + 0] = initX + Math.sin(elapsed * 0.3 + i * 0.17) * 0.08;
    pos.array[ix + 2] = initZ + Math.cos(elapsed * 0.2 + i * 0.13) * 0.05;

    // Reset to bottom when Y exceeds 7
    if (pos.array[ix + 1] > 7) {
      pos.array[ix + 1] = 0;
      dustInitialPositions[ix + 1] = 0;
    }
  }
  pos.needsUpdate = true;
}

// ---------- Model references for shatter crossfade ----------
let voidFigureModel  = null;
let heroCanvasModel  = null;

// ---------- Model yükleme ----------
// Per-model key light intensities — escalating toward model 5
const MODEL_KEY_INTENSITIES = [420, 720, 1050, 1550, 3200];

async function loadAllModels() {
  const pedMat = new THREE.MeshStandardMaterial({
    color: 0x0d0d0f, roughness: 0.9, metalness: 0.1,
  });

  let modelIdx = 0;
  for (const def of MODEL_DEFS) {
    try {
      const model = await loadModel(def.file);

      if (def.scale) model.scale.setScalar(def.scale);
      model.updateMatrixWorld(true);

      const bbox = new THREE.Box3().setFromObject(model);
      const cx   = isFinite(bbox.min.x) ? (bbox.min.x + bbox.max.x) / 2 : 0;
      const cz   = isFinite(bbox.min.z) ? (bbox.min.z + bbox.max.z) / 2 : 0;
      const yOff = isFinite(bbox.min.y) ? -bbox.min.y + 0.3 : 0.3;
      model.position.set(-cx, yOff, def.z - cz);

      // Shadows + hover distortion material
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

      if (def.file.includes("void_figure")) voidFigureModel = model;
      if (def.file.includes("hero_canvas")) heroCanvasModel = model;

      // Podyum
      const ped = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 0.3, 32), pedMat,
      );
      ped.position.set(0, 0.15, def.z);
      ped.castShadow = ped.receiveShadow = true;
      scene.add(ped);

      // Zemin halesi
      const halo = createHalo();
      halo.position.set(0, 0.02, def.z);
      scene.add(halo);

      // Per-model overhead key light — intensity escalates toward model 5
      const keyLight = new THREE.PointLight(0xd0e8ff, MODEL_KEY_INTENSITIES[modelIdx] ?? 500, 16, 2);
      keyLight.position.set(0, 6.5, def.z);
      scene.add(keyLight);

      modelIdx++;
      console.log(`[HOLM] ✓ ${def.file} @ z=${def.z}`);
    } catch (err) {
      console.error(`[HOLM] ✗ ${def.file}`, err);
    }
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
  gsap.to(projOverlay, { opacity: 0, duration: 0.5, onComplete: () => {
    projOverlay.classList.remove("active");
    projPlane.visible = false;
    gsap.set(".proj-line, .proj-cta", { opacity: 0, y: 0 });
  }});
}

// ---------- Lenis ----------
if (isMobile) scrollHintEl.textContent = 'SWIPE TO EXPLORE';
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

let _scrollHintHidden = false;
lenis.on("scroll", ({ scroll, limit }) => {
  splineT = limit > 0 ? scroll / limit : 0;
  if (!_scrollHintHidden && scroll > 80) {
    _scrollHintHidden = true;
    gsap.to(scrollHintEl, { opacity: 0, duration: 0.8, ease: "power2.out" });
  }
});

// ---------- Render döngüsü ----------
let _lastTick = 0;
function tick(now = 0) {
  requestAnimationFrame(tick);
  _lastTick = now;

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
    if (inProjection && !projectionShown) { projectionShown = true; showProjection(); }
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
  const _isAtArm = _armDist < ORBIT_R + 3;
  armSpot.intensity += ((_isAtArm ? ARM_REVEAL_INTENSITY : 0) - armSpot.intensity) * 0.10;

  if (post.bokeh) {
    post.bokeh.uniforms["focus"].value = dist;
  }

  if (post.grainVignette) {
    post.grainVignette.uniforms.uTime.value = elapsed;
  }
  wallUniforms.uTime.value = elapsed;

  if (!isMobile) animateDust(elapsed);

  if (!isMobile && diamondCursor) {
    diamondCursor.classList.toggle("model-hover", hoveredZ !== null);
  }

  const effectT = isMobile ? splineTSmooth : splineT;
  if (effectT >= SHATTER_T_ENTER && !_shatterCaptured) {
    _shatterCaptured = true;
    shatter.capture();
  }
  if (effectT < SHATTER_T_ENTER - 0.05) _shatterCaptured = false;

  const { bgDark, textOpacity } = shatter.update(effectT);

  const brightF = 1 - bgDark * 0.92;
  ambient.intensity   = AMBIENT_INTENSITY_BASE  * brightF;
  hemi.intensity      = HEMI_INTENSITY_BASE     * brightF;
  spotLight.intensity = SPOT_INTENSITY_BASE     * Math.max(brightF, 0.12);

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

  if (wordmarkEl) wordmarkEl.style.opacity = "0";

  const modelsPromise = loadAllModels();
  await Promise.all([
    modelsPromise,
    new Promise(r => setTimeout(r, 1800)),
  ]);
  if (voidFigureModel)  shatter.setSurface(voidFigureModel);
  if (heroCanvasModel)  shatter.setHeroCanvas(heroCanvasModel);
  if (!isMobile) createDustParticles();

  await new Promise(r => setTimeout(r, 200));

  // Snap progress bar to 100% and hold so user sees completion
  if (_ldFill && _ldPct) {
    gsap.killTweensOf(_ldCounter);
    _ldFill.style.width = '100%';
    _ldPct.textContent  = '100%';
  }
  await new Promise(r => setTimeout(r, 300));

  requestAnimationFrame(tick);
  gsap.to(camera.position, { z: p0.z, duration: 2.5, ease: "power2.inOut" });

  dissolveLoadingScreen();

  if (wordmarkEl) {
    gsap.to(wordmarkEl, { opacity: 0.85, duration: 1.4, delay: 4.0, ease: "power2.out" });
  }
  gsap.to(captionEl, { opacity: 1, duration: 1.0, delay: 4.5, ease: "power2.out" });

  const ctaBtn = document.querySelector(".proj-cta");
  if (ctaBtn) {
    ctaBtn.addEventListener("mousemove", e => {
      const r  = ctaBtn.getBoundingClientRect();
      const nx = (e.clientX - r.left - r.width  * 0.5) / r.width;
      const ny = (e.clientY - r.top  - r.height * 0.5) / r.height;
      gsap.to(ctaBtn, { x: nx * 14, y: ny * 9, duration: 0.35, ease: "power2.out" });
    });
    ctaBtn.addEventListener("mouseleave", () => {
      gsap.to(ctaBtn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" });
    });

    if (!isMobile && diamondCursor) {
      ctaBtn.addEventListener("mouseenter", () => diamondCursor.classList.add("hovering"));
      ctaBtn.addEventListener("mouseleave", () => diamondCursor.classList.remove("hovering"));
    }
  }
}

// ---------- Loading dissolve — glass crack lines then 3D shard scatter ----------
function dissolveLoadingScreen() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = vw / 2, cy = vh / 2;

  // ── Build crack segment tree ──────────────────────────────────────
  const segs = [];
  const N_ARMS = 9;
  const reach  = Math.hypot(vw, vh) * 0.62;

  function addArm(x, y, angle, remaining, depth) {
    if (remaining < 10 || depth < 0) return;
    const segLen = remaining * (0.28 + Math.random() * 0.22);
    angle += (Math.random() - 0.5) * 0.38;
    const ex = x + Math.cos(angle) * segLen;
    const ey = y + Math.sin(angle) * segLen;
    segs.push({ x1: x, y1: y, x2: ex, y2: ey, d: Math.hypot(x - cx, y - cy) });
    addArm(ex, ey, angle, remaining - segLen, depth - 1);
    if (depth >= 2 && Math.random() > 0.45) {
      const bAngle = angle + (Math.random() > 0.5 ? 1 : -1) * (0.55 + Math.random() * 0.7);
      addArm(ex, ey, bAngle, (remaining - segLen) * 0.55, depth - 2);
    }
  }
  for (let i = 0; i < N_ARMS; i++) {
    const a = (i / N_ARMS) * Math.PI * 2 + (Math.random() - 0.5) * 0.28;
    addArm(cx, cy, a, reach, 5);
  }
  segs.sort((a, b) => a.d - b.d); // draw nearest-to-center first

  // ── Canvas overlay for crack animation ───────────────────────────
  const crackCv = document.createElement('canvas');
  crackCv.width  = vw;
  crackCv.height = vh;
  crackCv.style.cssText = 'position:fixed;inset:0;z-index:101;pointer-events:none;';
  document.body.appendChild(crackCv);
  const ctx = crackCv.getContext('2d');

  function setupCtx() {
    ctx.strokeStyle = 'rgba(205, 232, 255, 0.90)';
    ctx.lineWidth   = 1.4;
    ctx.lineJoin    = 'round';
    ctx.shadowColor = 'rgba(140, 200, 255, 1.0)';
    ctx.shadowBlur  = 8;
  }
  setupCtx();

  // Impact dot
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(210, 238, 255, 0.95)';
  ctx.shadowBlur = 22; ctx.fill(); ctx.shadowBlur = 8;

  // ── Animate crack growth ──────────────────────────────────────────
  const CRACK_MS = 1100;
  const t0 = performance.now();

  function drawCracks(now) {
    const t  = Math.min((now - t0) / CRACK_MS, 1);
    const tE = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; // easeInOutQuad

    ctx.clearRect(0, 0, vw, vh);
    setupCtx();

    // Redraw impact dot
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(210, 238, 255, 0.95)';
    ctx.shadowBlur = 22; ctx.fill(); ctx.shadowBlur = 8;

    const total = segs.length;
    const showN = Math.floor(tE * total);
    for (let i = 0; i < showN; i++) {
      const s = segs[i];
      ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
    }
    // Partial last segment
    if (showN < total) {
      const frac = tE * total - showN;
      const s = segs[showN];
      ctx.beginPath(); ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x1 + (s.x2 - s.x1) * frac, s.y1 + (s.y2 - s.y1) * frac);
      ctx.stroke();
    }

    if (t < 1) requestAnimationFrame(drawCracks);
    else        setTimeout(shatterTiles, 620); // hold cracks visible then shatter
  }
  requestAnimationFrame(drawCracks);

  // ── Phase 2: shatter into gradient shards ────────────────────────
  function shatterTiles() {
    const COLS = 14, ROWS = 8;
    const wPct = 100 / COLS;
    const hPct = 100 / ROWS;
    const tiles = [];

    const gradBg = [
      'radial-gradient(ellipse 115% 80% at 10% 90%, rgba(7,18,85,0.97) 0%, transparent 50%)',
      'radial-gradient(ellipse 85% 72% at 90% 10%, rgba(26,8,106,0.84) 0%, transparent 50%)',
      'radial-gradient(ellipse 55% 55% at 50% 50%, rgba(14,36,148,0.26) 0%, transparent 65%)',
      '#06060a',
    ].join(',');

    const container = document.createElement('div');
    container.style.cssText =
      'position:fixed;inset:0;z-index:100;perspective:1200px;pointer-events:none;';
    document.body.appendChild(container);

    const J = () => (Math.random() - 0.5) * 18; // corner jitter % — irregular shard edges

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const el     = document.createElement('div');
        const leftPx = (col / COLS) * vw;
        const topPx  = (row / ROWS) * vh;
        const tl = `${J()}% ${J()}%`;
        const tr = `${100 + J()}% ${J()}%`;
        const br = `${100 + J()}% ${100 + J()}%`;
        const bl = `${J()}% ${100 + J()}%`;
        el.style.cssText =
          'position:absolute;' +
          `left:${(col * wPct).toFixed(3)}%;top:${(row * hPct).toFixed(3)}%;` +
          `width:${(wPct + 0.4).toFixed(3)}%;height:${(hPct + 0.4).toFixed(3)}%;` +
          `clip-path:polygon(${tl},${tr},${br},${bl});` +
          `background:${gradBg};` +
          `background-size:${vw}px ${vh}px;` +
          `background-position:${(-leftPx).toFixed(1)}px ${(-topPx).toFixed(1)}px;` +
          'will-change:transform,opacity;';
        container.appendChild(el);
        tiles.push(el);
      }
    }

    // Hide loading screen — tiles show the same visual
    loadingEl.style.display = 'none';
    // Crack lines linger then fade as pieces drift away
    gsap.to(crackCv, { opacity: 0, duration: 1.1, delay: 0.3, onComplete: () => crackCv.remove() });

    // Shatter from center outward — cinematic slow start, accelerating exit
    gsap.to(tiles, {
      x:         () => (Math.random() - 0.5) * vw * 2.4,
      y:         () => (Math.random() - 0.5) * vh * 2.4,
      rotationX: () => (Math.random() - 0.5) * 560,
      rotationY: () => (Math.random() - 0.5) * 560,
      rotationZ: () => (Math.random() - 0.5) * 260,
      scale:     () => 0.01 + Math.random() * 0.08,
      opacity:   0,
      duration:  2.0,
      stagger:   { each: 0.018, from: 'center', grid: [ROWS, COLS] },
      ease:      'power2.in',
      onComplete: () => container.remove(),
    });
  }
}

boot();
