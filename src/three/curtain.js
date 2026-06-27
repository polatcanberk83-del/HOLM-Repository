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

float hash(float n) {
  return fract(sin(n * 127.1 + 43.7) * 43758.5453);
}

float grain(vec2 uv, float t) {
  vec2 p = floor(uv * vec2(900.0, 700.0));
  return fract(sin(dot(p, vec2(127.1, 311.7)) + t * 17.3) * 43758.5453);
}

void main() {
  float colId = floor(vUv.x * uColumns);
  float delay = hash(colId) * 0.38;
  float dur   = 0.62;
  float local = clamp((uProgress - delay) / dur, 0.0, 1.0);
  // smoothstep ease
  local = local * local * (3.0 - 2.0 * local);

  // blind slides up: subtract from y, discard below 0
  vec2 uv = vUv;
  uv.y -= local * 1.18;
  if (uv.y <= 0.0) discard;

  // deep dark background matching site bg
  vec3 col = vec3(0.024, 0.020, 0.040);

  // procedural grain / paper texture
  float g = grain(uv, uTime);
  col += (g - 0.5) * 0.032;

  // subtle vertical stripe seams between columns
  float seam = abs(fract(vUv.x * uColumns) - 0.5);
  col += vec3(0.006, 0.008, 0.016) * smoothstep(0.48, 0.50, seam);

  // glowing seam at the reveal edge (where uv.y is near 0)
  float seamGlow = smoothstep(0.025, 0.0, uv.y) * (1.0 - local * 0.7);
  col += vec3(0.28, 0.50, 1.0) * seamGlow * 0.55;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function createCurtain(renderer, isMobile) {
  const cols = isMobile ? 10 : 18;

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
  // identity camera — NDC vertex shader handles projection
  const cam = new THREE.Camera();

  let alive = true;

  function render(elapsed) {
    if (!alive) return;
    uniforms.uTime.value = elapsed;
    const wasAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.render(scene, cam);
    renderer.autoClear = wasAutoClear;
  }

  function teardown() {
    alive = false;
    geo.dispose();
    mat.dispose();
    scene.remove(mesh);
  }

  return { uniforms, render, teardown };
}
