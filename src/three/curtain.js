import * as THREE from "three";

const VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;

uniform float uProgress;
uniform float uColumns;
uniform float uTime;

float hash(float n) { return fract(sin(n * 127.1 + 19.3) * 43758.5453); }

float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash2(i),             hash2(i + vec2(1.0, 0.0)), f.x),
    mix(hash2(i + vec2(0,1)), hash2(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.52;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p  = p * 2.1 + vec2(3.2, 1.7);
    a *= 0.50;
  }
  return v;
}

void main() {
  float colId   = floor(vUv.x * uColumns);
  float colNorm = (colId + 0.5) / uColumns; // 0–1 across screen

  // Per-column delay — large spread for dramatic stagger
  float delay = hash(colId) * 0.50;
  float dur   = 0.50;
  float local = clamp((uProgress - delay) / dur, 0.0, 1.0);
  // smoothstep: gentle start and end — panel lifts with inertia
  local = local * local * (3.0 - 2.0 * local);

  // Organic wavy bottom edge (two harmonic frequencies)
  float wave = sin(colNorm * 6.28318 * 1.8 + uTime * 1.1) * 0.022
             + sin(colNorm * 6.28318 * 4.3 + uTime * 0.6) * 0.009;
  wave *= (1.0 - local); // wave fades as panel fully lifts

  float revealEdge = local * 1.22 + wave;
  float aboveEdge  = vUv.y - revealEdge;

  if (aboveEdge <= 0.0) discard;

  // ── Curtain fabric texture ───────────────────────────────────
  // Fine linen grain
  float g1 = fbm(vUv * vec2(90.0, 70.0) + uTime * 0.018);
  // Coarser weave structure
  float g2 = fbm(vUv * vec2(24.0, 18.0) + vec2(5.1, 2.3));
  float fabric = g1 * 0.55 + g2 * 0.45;

  // Subtle vertical fiber lines along each panel
  float withinCol = fract(vUv.x * uColumns);
  float fiber = abs(sin(withinCol * 3.14159 * 8.0)) * 0.018;

  vec3 col = vec3(0.018, 0.014, 0.032); // near-black base
  col += fabric * 0.065;                 // visible cloth texture
  col += fiber  * 0.5;                   // fiber shimmer along strips

  // Slight per-column blue tint so panels aren't identical
  float tint = hash(colId + 3.7) * 0.014;
  col += vec3(0.0, tint * 0.35, tint);

  // ── Reveal seam glow ─────────────────────────────────────────
  // Intense bright core right at the seam
  float core = exp(-aboveEdge * 55.0);
  col += vec3(0.60, 0.82, 1.00) * core * 3.2;

  // Mid halo — electric blue
  float halo = exp(-aboveEdge * 10.0);
  col += vec3(0.20, 0.42, 1.00) * halo * 0.72;

  // Soft wide aura — deep violet glow
  float aura = exp(-aboveEdge * 2.8);
  col += vec3(0.05, 0.10, 0.60) * aura * 0.35;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function createCurtain(renderer, isMobile) {
  const cols = isMobile ? 8 : 13;

  const uniforms = {
    uProgress: { value: 0.0 },
    uColumns:  { value: cols },
    uTime:     { value: 0.0 },
  };

  const geo = new THREE.PlaneGeometry(2, 2);
  const mat = new THREE.ShaderMaterial({
    vertexShader:   VERT,
    fragmentShader: FRAG,
    uniforms,
    depthTest:  false,
    depthWrite: false,
  });

  const mesh  = new THREE.Mesh(geo, mat);
  const scene = new THREE.Scene();
  scene.add(mesh);
  const cam = new THREE.Camera(); // identity — NDC vertex shader

  let alive = true;

  function render(elapsed) {
    if (!alive) return;
    uniforms.uTime.value = elapsed;
    const prev = renderer.autoClear;
    renderer.autoClear = false;
    renderer.render(scene, cam);
    renderer.autoClear = prev;
  }

  function teardown() {
    alive = false;
    geo.dispose();
    mat.dispose();
    scene.remove(mesh);
  }

  return { uniforms, render, teardown };
}
