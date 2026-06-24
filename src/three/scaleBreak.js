import * as THREE from "three";

// ── Tunable constants (splineT = scroll progress 0→1) ────────────────────────
// Desktop path has ~183 control points; hero_canvas orbit spans T 0.407–0.582.
// SB_ENTER cuts into it at ~T 0.50 (camera has completed half the orbit).
// SB_EXIT re-joins the void_figure orbit zone at ~T 0.63.
// Adjust both after inspecting the orange debug tube below.
export const SB_ENTER    = 0.50;
export const SB_EXIT     = 0.63;

// Number of duplicate control points at the reveal position.
// Each copy adds ~1/(total_pts) of the SB range as additional hold time.
// HOLD_COPIES = 5 gives ~30 % of the SB span at rest; raise to stretch it.
export const HOLD_COPIES = 5;

// Corridor box geometry (must match scene.js)
const BOX_CENTER = new THREE.Vector3(0, 4, -39);
const CAM_H      = 1.8;
const REVEAL_Z   = 28;  // metres outside the corridor mouth (+Z)
const REVEAL_Y   = 3.4; // slightly elevated for full-block silhouette

// Look-at targets used by main.js when camera is outside
export const LOOK_VOID    = new THREE.Vector3(0, 4,   0);  // at corridor mouth
export const LOOK_TRANSIT = new THREE.Vector3(0, 3.5, -10);

// ── Scale-break curve ─────────────────────────────────────────────────────────
export function buildScaleBreakCurve(camPath) {
  const pEnter = camPath.getPoint(SB_ENTER);
  const pExit  = camPath.getPoint(SB_EXIT);

  // Ghost points carry the existing path tangent into/out of the seam (C1 continuity)
  const tgE = camPath.getTangent(SB_ENTER).multiplyScalar(5);
  const tgX = camPath.getTangent(SB_EXIT).multiplyScalar(5);

  const holdPt = new THREE.Vector3(0, REVEAL_Y, REVEAL_Z);
  const holds  = Array.from({ length: HOLD_COPIES }, () => holdPt.clone());

  const pts = [
    pEnter.clone().sub(tgE),                         // ghost — tangent before seam
    pEnter.clone(),                                   // ← seam entry (== camPath at SB_ENTER)
    // exit pass: align toward corridor axis then fly out
    new THREE.Vector3(pEnter.x * 0.3, CAM_H, -14),
    new THREE.Vector3(0, CAM_H, -3),
    new THREE.Vector3(0, CAM_H, 12),                 // corridor mouth
    new THREE.Vector3(0, CAM_H + 0.5, 19),
    new THREE.Vector3(0, REVEAL_Y - 0.5, 24),
    // hold zone (duplicates — camera lingers here)
    ...holds,
    // re-entry pass
    new THREE.Vector3(0, REVEAL_Y - 0.5, 24),
    new THREE.Vector3(0, CAM_H + 0.5, 19),
    new THREE.Vector3(0, CAM_H, 12),                 // corridor mouth (re-entry)
    new THREE.Vector3(0, CAM_H, 3),
    new THREE.Vector3(0, CAM_H, -8),
    pExit.clone(),                                    // ← seam exit (== camPath at SB_EXIT)
    pExit.clone().add(tgX),                           // ghost — tangent after seam
  ];

  return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
}

// ── Placeholder outer shell (FrontSide — visible from outside only) ───────────
export function createOuterShell(scene) {
  const mat = new THREE.MeshStandardMaterial({
    color:     0x1c1814,
    roughness: 0.93,
    metalness: 0.0,
    side:      THREE.FrontSide,
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 102), mat);
  mesh.position.copy(BOX_CENTER);
  mesh.scale.setScalar(1.005); // 0.5 % larger avoids Z-fighting with interior BackSide box
  scene.add(mesh);
  return mesh;
}

// ── Debug visualisation (remove from production) ─────────────────────────────
export function createDebugTubes(scene, sbCurve, camPath) {
  const group = new THREE.Group();
  // Orange = scale-break curve
  group.add(new THREE.Mesh(
    new THREE.TubeGeometry(sbCurve, 300, 0.05, 6, false),
    new THREE.MeshBasicMaterial({ color: 0xff4400 }),
  ));
  // Blue = main cam path
  group.add(new THREE.Mesh(
    new THREE.TubeGeometry(camPath, 600, 0.03, 6, false),
    new THREE.MeshBasicMaterial({ color: 0x2266ff }),
  ));
  scene.add(group);
  return group;
}
