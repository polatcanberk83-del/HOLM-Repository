import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

// ── Tunable timing constants (scroll T, 0–1) ──────────────────────────────────
// These are tuned so the dissolve crossfade happens while the camera is still
// in the front-quarter of the void_figure orbit (~0–25% around).
export const SHATTER_T_ENTER        = 0.51; // capture fires, tiles freeze on screen
const        SHATTER_T_SCATTER_START = 0.53; // freeze hold ends → tiles fly apart
export const SHATTER_T_DARK_DONE    = 0.56; // BG fully dark, tiles fully scattered
export const SHATTER_T_TEXT_IN      = 0.55; // gathering text starts fading in
export const SHATTER_T_TEXT_FULL    = 0.57; // text fully visible (hold begins)
export const SHATTER_T_TEXT_OUT     = 0.58; // text starts fading out
export const SHATTER_T_TEXT_GONE    = 0.60; // text gone → gather begins
export const SHATTER_T_GATHER_DONE  = 0.62; // cubes fully at void_figure surface
export const SHATTER_T_DISSOLVE_END = 0.65; // crossfade complete, BG fully restored

const GRID_DEPTH     = 3.5;
const SCATTER_DIST   = 8;
const CUBE_THICKNESS = 0.04;

const COLS_D = 32, ROWS_D = 18; // 576 desktop
const COLS_M = 10, ROWS_M =  6; //  60 mobile
const SCATTER_DIST_M = 5;

const TINT_COLOR = new THREE.Color(0x203050); // cool stone blue during gather
const TINT_MAX   = 0.55;

function smoothstep(t) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

// ─────────────────────────────────────────────────────────────────────────────
export function createShatterEffect(renderer, scene, camera, isMobile) {
  const COLS = isMobile ? COLS_M : COLS_D;
  const ROWS = isMobile ? ROWS_M : ROWS_D;
  const N    = COLS * ROWS;
  const DIST = isMobile ? SCATTER_DIST_M : SCATTER_DIST;

  // ── FBO ──────────────────────────────────────────────────────────────────
  const rSize = renderer.getSize(new THREE.Vector2());
  const fbo   = new THREE.WebGLRenderTarget(
    Math.floor(rSize.x * (isMobile ? 0.5 : 1.0)),
    Math.floor(rSize.y * (isMobile ? 0.5 : 1.0)),
    { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter },
  );

  // ── Per-instance UV tile (u0, v0, du, dv) ────────────────────────────────
  const du = 1 / COLS, dv = 1 / ROWS;
  const uvData = new Float32Array(N * 4);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const i = row * COLS + col;
      uvData[i * 4 + 0] = col * du;
      uvData[i * 4 + 1] = 1 - (row + 1) * dv; // V=1 at top in WebGL render targets
      uvData[i * 4 + 2] = du;
      uvData[i * 4 + 3] = dv;
    }
  }
  const uvAttr = new THREE.InstancedBufferAttribute(uvData, 4);

  const geo = new THREE.BoxGeometry(1, 1, CUBE_THICKNESS);
  geo.setAttribute("instanceUV", uvAttr);

  // ── Cube shader uniforms ──────────────────────────────────────────────────
  const _su = {
    uOpacity:    { value: 1.0 },
    uTintColor:  { value: TINT_COLOR.clone() },
    uTintAmount: { value: 0.0 },
  };

  const mat = new THREE.MeshBasicMaterial({
    map:         fbo.texture,
    transparent: true,
    depthWrite:  false,
    side:        THREE.FrontSide,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uOpacity    = _su.uOpacity;
    shader.uniforms.uTintColor  = _su.uTintColor;
    shader.uniforms.uTintAmount = _su.uTintAmount;

    shader.vertexShader = shader.vertexShader.replace(
      'void main() {',
      `attribute vec4 instanceUV;
varying vec2 vTileUv;
void main() {`,
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTileUv = vec2(instanceUV.x + uv.x * instanceUV.z,
               instanceUV.y + uv.y * instanceUV.w);`,
    );
    shader.fragmentShader = `
uniform sampler2D map;
uniform float uOpacity;
uniform vec3 uTintColor;
uniform float uTintAmount;
varying vec2 vTileUv;
void main() {
  vec4 c = texture2D(map, vTileUv);
  vec3 col = mix(c.rgb, uTintColor, uTintAmount);
  gl_FragColor = vec4(col, c.a * uOpacity);
}
`;
  };
  mat.customProgramCacheKey = () => "shatter_tile";

  const mesh = new THREE.InstancedMesh(geo, mat, N);
  mesh.frustumCulled = false;
  mesh.visible = false;
  scene.add(mesh);

  // ── Per-instance position arrays ──────────────────────────────────────────
  const gridPos    = new Array(N);
  const scatterPos = new Array(N);
  const gatherPos  = new Array(N);
  const scatterRot = new Float32Array(N * 3);

  let tileW = 1, tileH = 1;
  let _hasGatherTargets = false;
  let _restored = true; // guard: run restore logic only once per exit

  const _dummy = new THREE.Object3D();
  const _scale  = new THREE.Vector3();

  // ── Model material caches ─────────────────────────────────────────────────
  const _voidFigureMats = [];
  const _heroCanvasMats = [];

  function _collectMats(root, out) {
    const seen = new Set();
    root.traverse(c => {
      if (!c.isMesh) return;
      const m = c.material;
      if (m && !seen.has(m)) { seen.add(m); out.push(m); }
    });
  }

  function _setOpacity(mats, v) { for (const m of mats) m.opacity = v; }

  function _restoreMats() {
    for (const m of _heroCanvasMats) m.opacity = 1.0;
    for (const m of _voidFigureMats) m.opacity = 1.0;
  }

  // ── Grid construction ─────────────────────────────────────────────────────
  function _buildGrid() {
    camera.updateMatrixWorld();
    const fovY  = (camera.fov * Math.PI) / 180;
    const halfH = Math.tan(fovY / 2) * GRID_DEPTH;
    const halfW = halfH * camera.aspect;
    tileW = (halfW * 2) / COLS;
    tileH = (halfH * 2) / ROWS;

    const fwd = new THREE.Vector3();
    const rgt = new THREE.Vector3();
    const up  = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    rgt.setFromMatrixColumn(camera.matrixWorld, 0);
    up.setFromMatrixColumn(camera.matrixWorld, 1);

    const center = camera.position.clone().addScaledVector(fwd, GRID_DEPTH);
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const i  = row * COLS + col;
        const nx = ((col + 0.5) / COLS) * 2 - 1;
        const ny = 1 - ((row + 0.5) / ROWS) * 2;
        gridPos[i] = center.clone()
          .addScaledVector(rgt, nx * halfW)
          .addScaledVector(up,  ny * halfH);
      }
    }
  }

  function _buildScatter() {
    const dir = new THREE.Vector3();
    for (let i = 0; i < N; i++) {
      dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
         .normalize()
         .multiplyScalar(DIST * (0.4 + Math.random() * 0.6));
      scatterPos[i] = gridPos[i].clone().add(dir);
      scatterRot[i * 3]     = (Math.random() - 0.5) * Math.PI * 2;
      scatterRot[i * 3 + 1] = (Math.random() - 0.5) * Math.PI * 2;
      scatterRot[i * 3 + 2] = (Math.random() - 0.5) * Math.PI * 2;
    }
  }

  // ── Public: sample void_figure surface; prime transparency ───────────────
  function setSurface(root) {
    root.updateMatrixWorld(true);

    const meshes = [];
    root.traverse(c => {
      if (c.isMesh && c.geometry && c.geometry.attributes.position) meshes.push(c);
    });
    if (!meshes.length) {
      console.warn("[shatter] setSurface: no sampelable meshes found");
      return;
    }

    _collectMats(root, _voidFigureMats);
    for (const m of _voidFigureMats) { m.transparent = true; m.opacity = 1.0; }

    const _p   = new THREE.Vector3();
    const _nrm = new THREE.Vector3();
    const allPts = [];

    const perMesh = Math.ceil(N / meshes.length);
    for (const m of meshes) {
      if (allPts.length >= N) break;
      const sampler = new MeshSurfaceSampler(m).build();
      const cnt = Math.min(perMesh, N - allPts.length);
      for (let i = 0; i < cnt; i++) {
        sampler.sample(_p, _nrm);
        allPts.push(_p.clone().applyMatrix4(m.matrixWorld));
      }
    }

    while (allPts.length < N) {
      allPts.push(allPts[Math.floor(Math.random() * allPts.length)].clone());
    }

    // Shuffle so cube indices don't clump per mesh region — organic gather
    for (let i = allPts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPts[i], allPts[j]] = [allPts[j], allPts[i]];
    }

    for (let i = 0; i < N; i++) gatherPos[i] = allPts[i];
    _hasGatherTargets = true;
    console.log(`[shatter] surface sampled — ${N} pts across ${meshes.length} mesh(es)`);
  }

  // ── Public: register hero_canvas for scatter-phase fade-out ──────────────
  function setHeroCanvas(root) {
    _collectMats(root, _heroCanvasMats);
    for (const m of _heroCanvasMats) { m.transparent = true; m.opacity = 1.0; }
    console.log(`[shatter] hero_canvas primed — ${_heroCanvasMats.length} material(s)`);
  }

  // ── Public: capture scene → FBO, activate mosaic ─────────────────────────
  function capture() {
    _buildGrid();
    _buildScatter();

    renderer.setRenderTarget(fbo);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    _su.uOpacity.value    = 1.0;
    _su.uTintAmount.value = 0.0;

    _scale.set(tileW, tileH, CUBE_THICKNESS);
    _dummy.rotation.set(0, 0, 0);
    for (let i = 0; i < N; i++) {
      _dummy.position.copy(gridPos[i]);
      _dummy.scale.copy(_scale);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.visible = true;
  }

  // ── Public: drive animation. Returns { bgDark, textOpacity } each frame. ─
  //
  // Phase 1  [ENTER → DARK_DONE]:  scatter + BG darkens + hero_canvas fades
  // Phase 2  [DARK_DONE → TEXT_GONE]: cubes hold at scatter; text in/hold/out
  // Phase 3  [TEXT_GONE → GATHER_DONE]: gather into form; BG recovers; tint
  // Phase 4  [GATHER_DONE → DISSOLVE_END]: cubes shrink/fade; real model in
  //
  function update(effectT) {
    const OUT = { bgDark: 0, textOpacity: 0 };

    if (effectT < SHATTER_T_ENTER || effectT > SHATTER_T_DISSOLVE_END) {
      if (!_restored) {
        mesh.visible = false;
        _restoreMats();
        _su.uOpacity.value    = 1.0;
        _su.uTintAmount.value = 0.0;
        _restored = true;
      }
      return OUT;
    }

    _restored = false;
    if (!mesh.visible) mesh.visible = true;

    let sp             = 0;
    let rotP           = 0;
    let scaleMultiplier = 1.0;
    let fromPos, toPos;
    let bgDark      = 0;
    let textOpacity = 0;

    // ── Phase 1a: freeze hold — tiles cover screen as a stationary mosaic ───────
    if (effectT < SHATTER_T_SCATTER_START) {
      // sp=0 keeps all tiles at gridPos (exact screen coverage = freeze-frame).
      // Hero/void models stay at full opacity behind the tile layer.
      sp      = 0;
      rotP    = 0;
      fromPos = gridPos;
      toPos   = scatterPos;
      bgDark  = 0;

      _setOpacity(_heroCanvasMats, 1.0);
      _setOpacity(_voidFigureMats, 1.0);
      _su.uOpacity.value    = 1.0;
      _su.uTintAmount.value = 0.0;

    // ── Phase 1b: scatter — tiles fly apart, BG darkens ───────────────────────
    } else if (effectT < SHATTER_T_DARK_DONE) {
      const p1 = smoothstep(
        (effectT - SHATTER_T_SCATTER_START) / (SHATTER_T_DARK_DONE - SHATTER_T_SCATTER_START),
      );
      sp      = p1;
      rotP    = p1;
      fromPos = gridPos;
      toPos   = scatterPos;
      bgDark  = p1;

      _setOpacity(_heroCanvasMats, 1 - p1);
      _setOpacity(_voidFigureMats, 1 - p1);
      _su.uOpacity.value    = 1.0;
      _su.uTintAmount.value = 0.0;

    // ── Phase 2: hold (cubes scattered, text appears / holds / fades) ────────
    } else if (effectT < SHATTER_T_TEXT_GONE) {
      sp      = 1;
      rotP    = 0; // cubes have settled
      fromPos = gridPos;
      toPos   = scatterPos;
      bgDark  = 1.0;

      _setOpacity(_heroCanvasMats, 0.0);
      _setOpacity(_voidFigureMats, 0.0); // hidden — cubes float in dark void
      _su.uOpacity.value    = 1.0;
      _su.uTintAmount.value = 0.0;

      // Text sub-phases
      if (effectT < SHATTER_T_TEXT_FULL) {
        textOpacity = smoothstep(
          (effectT - SHATTER_T_TEXT_IN) / (SHATTER_T_TEXT_FULL - SHATTER_T_TEXT_IN),
        );
      } else if (effectT < SHATTER_T_TEXT_OUT) {
        textOpacity = 1.0;
      } else {
        textOpacity = 1 - smoothstep(
          (effectT - SHATTER_T_TEXT_OUT) / (SHATTER_T_TEXT_GONE - SHATTER_T_TEXT_OUT),
        );
      }

    // ── Phase 3: gather into void_figure form; BG recovers ───────────────────
    } else if (!_hasGatherTargets || effectT < SHATTER_T_GATHER_DONE) {

      if (_hasGatherTargets) {
        const p3 = smoothstep(
          (effectT - SHATTER_T_TEXT_GONE) / (SHATTER_T_GATHER_DONE - SHATTER_T_TEXT_GONE),
        );
        sp      = p3;
        rotP    = 1 - p3;
        fromPos = scatterPos;
        toPos   = gatherPos;
        bgDark  = 1 - p3; // BG recovers as cubes gather

        _setOpacity(_heroCanvasMats, 0.0);
        _setOpacity(_voidFigureMats, 0.0); // hidden — cube-form IS the figure
        _su.uOpacity.value    = 1.0;
        _su.uTintAmount.value = p3 * TINT_MAX;
      } else {
        // Stage A fallback: return to grid
        const backRaw = (effectT - SHATTER_T_TEXT_GONE) / (SHATTER_T_DISSOLVE_END - SHATTER_T_TEXT_GONE);
        sp      = smoothstep(1 - backRaw);
        rotP    = sp;
        fromPos = gridPos;
        toPos   = scatterPos;
        bgDark  = 1 - smoothstep(backRaw);
      }

    // ── Phase 4: dissolve — cubes shrink/fade, real model fades in ───────────
    } else {
      const p4 = smoothstep(
        (effectT - SHATTER_T_GATHER_DONE) / (SHATTER_T_DISSOLVE_END - SHATTER_T_GATHER_DONE),
      );
      sp             = 1;
      rotP           = 0;
      fromPos        = gatherPos;
      toPos          = gatherPos;
      scaleMultiplier = 1 - p4;
      bgDark         = 0;

      _setOpacity(_heroCanvasMats, 0.0);
      _setOpacity(_voidFigureMats, p4);
      _su.uOpacity.value    = 1 - p4;
      _su.uTintAmount.value = TINT_MAX * (1 - p4);
    }

    _scale.set(tileW * scaleMultiplier, tileH * scaleMultiplier, CUBE_THICKNESS * scaleMultiplier);
    for (let i = 0; i < N; i++) {
      _dummy.position.lerpVectors(fromPos[i], toPos[i], sp);
      _dummy.rotation.set(
        scatterRot[i * 3]     * rotP,
        scatterRot[i * 3 + 1] * rotP,
        scatterRot[i * 3 + 2] * rotP,
      );
      _dummy.scale.copy(_scale);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    return { bgDark, textOpacity };
  }

  function dispose() {
    scene.remove(mesh);
    fbo.dispose();
    geo.dispose();
    mat.dispose();
    _restoreMats();
  }

  return { capture, update, setSurface, setHeroCanvas, dispose, mesh };
}
