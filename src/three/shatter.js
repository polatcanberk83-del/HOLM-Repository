import * as THREE from "three";

// ── Tunable constants ─────────────────────────────────────────────────────────
export const SHATTER_T_ENTER        = 0.55;
export const SHATTER_T_TEXT         = 0.59;
export const SHATTER_T_GATHER_DONE  = 0.64;
export const SHATTER_T_DISSOLVE_END = 0.70;

const GRID_DEPTH     = 3.5;
const SCATTER_DIST   = 8;
const CUBE_THICKNESS = 0.04;

const COLS_D = 32, ROWS_D = 18; // 576 instances desktop
const COLS_M = 10, ROWS_M =  6; //  60 instances mobile
const SCATTER_DIST_M = 5;

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
  // V=1 is top in WebGL render targets, so row 0 (screen top) → v0 near 1.
  const du = 1 / COLS, dv = 1 / ROWS;
  const uvData = new Float32Array(N * 4);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const i = row * COLS + col;
      uvData[i * 4 + 0] = col * du;
      uvData[i * 4 + 1] = 1 - (row + 1) * dv;
      uvData[i * 4 + 2] = du;
      uvData[i * 4 + 3] = dv;
    }
  }
  const uvAttr = new THREE.InstancedBufferAttribute(uvData, 4);

  // ── Geometry ──────────────────────────────────────────────────────────────
  const geo = new THREE.BoxGeometry(1, 1, CUBE_THICKNESS);
  geo.setAttribute("instanceUV", uvAttr);

  // ── Material: MeshBasicMaterial patched via onBeforeCompile ──────────────
  // Three.js handles instanceMatrix automatically — we only inject the
  // per-tile UV attribute and replace the fragment output.
  const _su = { uOpacity: { value: 1.0 } }; // shader uniforms ref, filled on compile

  const mat = new THREE.MeshBasicMaterial({
    map:         fbo.texture, // activates USE_MAP → uv attribute declared by Three.js
    transparent: true,
    depthWrite:  false,
    side:        THREE.FrontSide,
  });

  mat.onBeforeCompile = (shader) => {
    // Share the opacity uniform object so update() can write it directly
    shader.uniforms.uOpacity = _su.uOpacity;
    // (map uniform is already in shader.uniforms via MeshBasicMaterial)

    // ── Vertex: add instanceUV attribute + vTileUv varying ──────────────
    shader.vertexShader = shader.vertexShader.replace(
      'void main() {',
      `attribute vec4 instanceUV;
varying vec2 vTileUv;
void main() {`,
    );

    // #include <begin_vertex> is stable in every Three.js version:
    // it sets "vec3 transformed = vec3(position);"
    // uv is guaranteed because USE_MAP is defined.
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTileUv = vec2(instanceUV.x + uv.x * instanceUV.z,
               instanceUV.y + uv.y * instanceUV.w);`,
    );

    // ── Fragment: replace entirely with our minimal sampler ──────────────
    // Three.js prefix handles #version, precision, gl_FragColor alias,
    // and texture2D alias — so GLSL 1.00 syntax works in WebGL2 context.
    shader.fragmentShader = `
uniform sampler2D map;
uniform float uOpacity;
varying vec2 vTileUv;
void main() {
  vec4 c = texture2D(map, vTileUv);
  gl_FragColor = vec4(c.rgb, c.a * uOpacity);
}
`;
  };

  mat.customProgramCacheKey = () => "shatter_tile";

  // ── InstancedMesh ─────────────────────────────────────────────────────────
  const mesh = new THREE.InstancedMesh(geo, mat, N);
  mesh.frustumCulled = false;
  mesh.visible = false;
  scene.add(mesh);

  // ── Per-instance world-space data ─────────────────────────────────────────
  const gridPos    = new Array(N);
  const scatterPos = new Array(N);
  const scatterRot = new Float32Array(N * 3);
  let tileW = 1, tileH = 1;
  const _dummy = new THREE.Object3D();
  const _scale  = new THREE.Vector3();

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

  // ── Public ────────────────────────────────────────────────────────────────
  function capture() {
    _buildGrid();
    _buildScatter();

    // Render scene to FBO before cubes are visible (no self-capture)
    renderer.setRenderTarget(fbo);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    _su.uOpacity.value = 1.0;

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

  // Stage A: scatter (T_ENTER → T_TEXT) then return to grid (T_TEXT → T_DISSOLVE_END)
  function update(effectT) {
    if (!mesh.visible) return;
    if (effectT < SHATTER_T_ENTER || effectT > SHATTER_T_DISSOLVE_END) {
      mesh.visible = false;
      return;
    }

    let sp;
    if (effectT < SHATTER_T_TEXT) {
      sp = smoothstep((effectT - SHATTER_T_ENTER) / (SHATTER_T_TEXT - SHATTER_T_ENTER));
    } else {
      sp = smoothstep(1 - (effectT - SHATTER_T_TEXT) / (SHATTER_T_DISSOLVE_END - SHATTER_T_TEXT));
    }

    _scale.set(tileW, tileH, CUBE_THICKNESS);
    for (let i = 0; i < N; i++) {
      _dummy.position.lerpVectors(gridPos[i], scatterPos[i], sp);
      _dummy.rotation.set(
        scatterRot[i * 3]     * sp,
        scatterRot[i * 3 + 1] * sp,
        scatterRot[i * 3 + 2] * sp,
      );
      _dummy.scale.copy(_scale);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  function dispose() {
    scene.remove(mesh);
    fbo.dispose();
    geo.dispose();
    mat.dispose();
  }

  return { capture, update, dispose, mesh };
}
