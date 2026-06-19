import Lenis from "lenis";
import * as THREE from "three";
import gsap from "gsap";

import { createScene, createHalo, createProjectionPlane } from "./three/scene.js";
import { createPostProcessing } from "./three/postprocessing.js";
import { loadModel }            from "./three/loader.js";

// ---------- Model tanımları ----------
const MODEL_CAPTIONS = {
  "hand.glb":        "Every brand begins like this.",
  "monument.glb":    "Some things stay unfinished.",
  "hero_canvas.glb": "Between sketch and masterpiece, there's patience.",
  "void_figure.glb": "What's left unsaid shapes the rest.",
  "arm_crystal.glb": "This is the moment brands are remembered for.",
};
function captionFor(filename) { return MODEL_CAPTIONS[filename] ?? ""; }

const MODEL_DEFS = [
  { file: "/models/hand.glb",        z:   0, scale: 3 },
  { file: "/models/monument.glb",    z: -12, scale: 0.57 },
  { file: "/models/hero_canvas.glb", z: -24, scale: 3 },
  { file: "/models/void_figure.glb", z: -36 },
  { file: "/models/arm_crystal.glb", z: -48 },
].map(d => ({ ...d, caption: captionFor(d.file.split("/").pop()) }));

// ---------- DOM ----------
const canvas       = document.getElementById("scene-canvas");
const captionEl    = document.getElementById("caption");
const loadingEl    = document.getElementById("loading");
const wordmarkEl   = document.querySelector(".wordmark");
const scrollHintEl = document.getElementById("scroll-hint");
const diamondCursor = document.getElementById("diamond-cursor");
const isMobile      = window.innerWidth < 768 || 'ontouchstart' in window;

// ---------- Three.js ----------
const { scene, renderer, camera, spotLight, onResize } = createScene(canvas, isMobile);
const post      = createPostProcessing(renderer, scene, camera, isMobile);
const projPlane = createProjectionPlane(scene);

// ---------- Custom cursor ----------
if (!isMobile && diamondCursor) {
  canvas.style.cursor = "none";
  document.body.style.cursor = "none";
  window.addEventListener("mousemove", e => {
    diamondCursor.style.left = e.clientX + "px";
    diamondCursor.style.top  = e.clientY + "px";
  });
}

// ---------- Orbit sabitleri ----------
const CAM_H   = 1.8;
const ORBIT_R = isMobile ? 5.5 : 4;
const ORBIT_N = isMobile ? 24 : 32;

// ---------- Kamera yolu ----------
function buildPath() {
  const pts = [];
  const h = CAM_H, r = ORBIT_R;

  pts.push(new THREE.Vector3(0, h, 10));
  pts.push(new THREE.Vector3(0, h,  7));

  MODEL_DEFS.forEach((def, i) => {
    const mz = def.z;
    for (let s = 0; s <= ORBIT_N; s++) {
      const a = (s / ORBIT_N) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.sin(a) * r, h, mz + Math.cos(a) * r));
    }
    if (i < MODEL_DEFS.length - 1) {
      const nextZ = MODEL_DEFS[i + 1].z;
      // Orbit frontta (mz+r) biter; direkt arkaya gidince model içinden geçer.
      // Sağa kaydırarak dolanıyoruz.
      pts.push(new THREE.Vector3(r * 1.5, h, mz));
      pts.push(new THREE.Vector3(r * 0.8, h, mz - r - 1));
      pts.push(new THREE.Vector3(0,       h, nextZ + r + 1));
    }
  });

  // Projection approach after last model's orbit
  const lastZ = MODEL_DEFS[MODEL_DEFS.length - 1].z;
  pts.push(new THREE.Vector3(r * 1.2, h, lastZ));
  pts.push(new THREE.Vector3(0,       h, lastZ - r - 2));
  pts.push(new THREE.Vector3(0,       h, lastZ - 20));
  pts.push(new THREE.Vector3(0,       h, lastZ - 28));

  return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
}

const camPath = buildPath();

// ---------- Scroll → spline ----------
let splineT = 0;

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

// ---------- Model yükleme ----------
async function loadAllModels() {
  const pedMat = new THREE.MeshStandardMaterial({
    color: 0x0d0d0f, roughness: 0.9, metalness: 0.1,
  });

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
const lenis = new Lenis({
  duration:        isMobile ? 2.5 : 4.0,
  smoothWheel:     true,
  wheelMultiplier: 0.28,
  touchMultiplier: 1.2,
  smoothTouch:     false,
});
let _scrollHintHidden = false;
lenis.on("scroll", ({ scroll, limit }) => {
  splineT = limit > 0 ? scroll / limit : 0;
  if (!_scrollHintHidden && scroll > 80) {
    _scrollHintHidden = true;
    gsap.to(scrollHintEl, { opacity: 0, duration: 0.8, ease: "power2.out" });
  }
});
(function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);

// ---------- Render döngüsü ----------
let _lastTick = 0;
function tick(now = 0) {
  requestAnimationFrame(tick);
  // 30fps cap on mobile
  if (isMobile && now - _lastTick < 32) return;
  _lastTick = now;

  const elapsed = clock.getElapsedTime();

  // Hover raycast + distortion — desktop only
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

  // Camera spline
  _camTarget.copy(camPath.getPoint(splineT));
  camera.position.lerp(_camTarget, 0.07);

  const { def: near, dist } = findNearest(camera.position);
  const inOrbit      = near && dist < ORBIT_R + 1.5;
  // Corridor zone: camera turns to face wall; overlay fires later when closer
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

  // Update DoF focus: distance from camera to nearest model on Z axis
  if (post.bokeh) {
    post.bokeh.uniforms["focus"].value = dist;
  }

  // Update film grain time
  if (post.grainVignette) {
    post.grainVignette.uniforms.uTime.value = elapsed;
  }

  // Animate dust particles — desktop only
  if (!isMobile) animateDust(elapsed);

  // Diamond cursor — model hover state
  if (!isMobile && diamondCursor) {
    diamondCursor.classList.toggle("model-hover", hoveredZ !== null);
  }

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

  // Intro: start camera pushed back 3 units further on Z
  camera.position.copy(p0);
  camera.position.z += 3;
  _lookNow.set(0, 1.5, MODEL_DEFS[0].z);
  camera.lookAt(_lookNow);

  // Hide wordmark initially for intro animation
  if (wordmarkEl) wordmarkEl.style.opacity = "0";

  // Breathing loop on loading wordmark while assets load
  const loadingWordmark = document.getElementById("loading-wordmark");
  const breathe = gsap.to(loadingWordmark, {
    opacity: 0.9,
    duration: 2.2,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });

  await loadAllModels();
  if (!isMobile) createDustParticles();

  // Stop breathing, snap to full opacity, then fade the whole screen out
  breathe.kill();
  await gsap.to(loadingWordmark, { opacity: 1, duration: 0.4, ease: "power2.out" });
  await new Promise(r => setTimeout(r, 300));
  loadingEl.classList.add("hidden");

  // Intro animation: ease camera forward into scene
  gsap.to(camera.position, {
    z: p0.z,
    duration: 2.5,
    ease: "power2.inOut",
  });

  // Wordmark fade in
  if (wordmarkEl) {
    gsap.to(wordmarkEl, {
      opacity: 0.85,
      duration: 1.5,
      delay: 0.5,
      ease: "power2.out",
    });
  }

  // Caption fade in
  gsap.to(captionEl, {
    opacity: 1,
    duration: 1.0,
    delay: 0.8,
    ease: "power2.out",
  });

  requestAnimationFrame(tick);

  // Magnetic CTA — elastic snap-back on leave
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

boot();
