import * as THREE from "three";

// ── Tunable scroll-T constants ────────────────────────────────────────────────
export const SB_ENTER    = 0.50;
export const SB_EXIT     = 0.63;
export const HOLD_COPIES = 5;   // duplicate control pts at reveal = longer hold

const CAM_H      = 1.8;
const REVEAL_Z   = 28;
const MOUTH_Z    = 12;   // corridor entrance (BoxGeometry center -39 + half-depth 51)
const BOX_CY     = 4;
const BOX_CZ     = -39;

export const LOOK_VOID    = new THREE.Vector3(0, 4, 0);
export const LOOK_TRANSIT = new THREE.Vector3(0, 3.5, -10);

// ── Scale-break camera curve ──────────────────────────────────────────────────
export function buildScaleBreakCurve(camPath, isMobile) {
  const revealY = isMobile ? 4.0 : 3.4; // mobile: pull back more for full-block contrast

  const pEnter = camPath.getPoint(SB_ENTER);
  const pExit  = camPath.getPoint(SB_EXIT);
  const tgE    = camPath.getTangent(SB_ENTER).multiplyScalar(5);
  const tgX    = camPath.getTangent(SB_EXIT).multiplyScalar(5);

  const holdPt = new THREE.Vector3(0, revealY, REVEAL_Z);
  const holds  = Array.from({ length: HOLD_COPIES }, () => holdPt.clone());

  const pts = [
    pEnter.clone().sub(tgE),
    pEnter.clone(),
    new THREE.Vector3(pEnter.x * 0.3, CAM_H, -14),
    new THREE.Vector3(0, CAM_H, -3),
    new THREE.Vector3(0, CAM_H, MOUTH_Z),
    new THREE.Vector3(0, CAM_H + 0.5, 19),
    new THREE.Vector3(0, revealY - 0.5, 24),
    ...holds,
    new THREE.Vector3(0, revealY - 0.5, 24),
    new THREE.Vector3(0, CAM_H + 0.5, 19),
    new THREE.Vector3(0, CAM_H, MOUTH_Z),
    new THREE.Vector3(0, CAM_H, 3),
    new THREE.Vector3(0, CAM_H, -8),
    pExit.clone(),
    pExit.clone().add(tgX),
  ];

  return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
}

// ── Phase 2: Procedural marble outer shell ────────────────────────────────────
// FrontSide only — BackSide interior box (scene.js) is unaffected.
// Marble veins via fBm-distorted sine; chisel marks via high-freq noise.
// Normal perturbation from noise gradient; SSS hint + cold rim.
export function createOuterShell(scene, isMobile) {
  const mat = new THREE.ShaderMaterial({
    defines: {
      OCTAVE_COUNT: isMobile ? 3 : 5,
    },
    uniforms: {
      uBaseColor:     { value: new THREE.Color(0x0c0b09) },
      uVeinColor:     { value: new THREE.Color(0x252219) },
      uSSSStrength:   { value: 0.13 },
      uSlitIntensity: { value: isMobile ? 1.8 : 1.0 }, // no bloom on mobile → boost
    },
    vertexShader: /* glsl */`
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec3 vViewDir;
      void main() {
        vNormal    = normalize(normalMatrix * normal);
        vec4 wp    = modelMatrix * vec4(position, 1.0);
        vWorldPos  = wp.xyz;
        vViewDir   = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3  uBaseColor;
      uniform vec3  uVeinColor;
      uniform float uSSSStrength;
      uniform float uSlitIntensity;

      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec3 vViewDir;

      float hash(vec3 p) {
        p  = fract(p * 0.317);
        p += dot(p, p.yxz + 19.19);
        return fract(p.x * p.y * p.z * 3758.5453);
      }

      float noise3(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash(i),              hash(i+vec3(1,0,0)), f.x),
              mix(hash(i+vec3(0,1,0)),  hash(i+vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i+vec3(0,0,1)),  hash(i+vec3(1,0,1)), f.x),
              mix(hash(i+vec3(0,1,1)),  hash(i+vec3(1,1,1)), f.x), f.y),
          f.z
        );
      }

      float fbm(vec3 p) {
        float v = 0.0, a = 0.5, f = 1.0;
        for (int i = 0; i < OCTAVE_COUNT; i++) {
          v += a * noise3(p * f);
          f *= 2.0; a *= 0.5;
        }
        return v;
      }

      float fbm2(vec3 p) {
        float v = 0.0, a = 0.5, f = 1.0;
        int lim = max(OCTAVE_COUNT - 2, 2);
        for (int i = 0; i < OCTAVE_COUNT; i++) {
          if (i >= lim) break;
          v += a * noise3(p * f);
          f *= 2.0; a *= 0.5;
        }
        return v;
      }

      void main() {
        vec3 wp = vWorldPos * 0.055;

        float n1  = fbm(wp);
        float n2  = fbm2(wp + vec3(4.1, 1.7, 2.9) + n1 * 1.8);
        float vein = abs(sin((wp.x * 1.4 + wp.z * 0.5 + n1 * 2.5 + n2 * 1.1) * 3.5));
        vein = pow(max(0.0, 1.0 - vein), 5.0);

        // Chisel surface marks
        float chisel = noise3(vWorldPos * 0.60 + vec3(n1 * 2.0, 0.0, 0.0)) * 0.12;

        vec3 col = mix(uBaseColor, uVeinColor, vein * 0.40 + chisel);

        // Normal perturbation (cheap gradient of fbm)
        float e  = 0.014;
        float dx = fbm(wp + vec3(e,0,0)) - fbm(wp - vec3(e,0,0));
        float dy = fbm(wp + vec3(0,e,0)) - fbm(wp - vec3(0,e,0));
        float dz = fbm(wp + vec3(0,0,e)) - fbm(wp - vec3(0,0,e));
        vec3 N = normalize(vNormal + vec3(dx, dy, dz) * 0.45);

        // Grazing top-light reveals chisel texture
        vec3 grazDir = normalize(vec3(0.12, 1.0, -0.08));
        float graz   = max(dot(N, grazDir), 0.0) * 0.11;

        // Blue corridor-light leak (light comes from +Z, the opening)
        vec3 slitDir = normalize(vec3(0.0, -0.12, 1.0));
        float slit   = pow(max(dot(N, slitDir), 0.0), 1.5) * 0.24 * uSlitIntensity;
        vec3 slitCol = vec3(0.20, 0.42, 1.0) * slit;

        // Subsurface scatter: warm back-lit edges
        float sss    = max(dot(-N, grazDir), 0.0) * uSSSStrength;
        vec3 sssCol  = vec3(0.07, 0.09, 0.16) * sss;

        // Cold rim separates silhouette from void
        float rim    = pow(1.0 - max(dot(vViewDir, N), 0.0), 4.0) * 0.06;
        vec3 rimCol  = vec3(0.15, 0.25, 0.55) * rim;

        vec3 ambient = col * 0.020;
        gl_FragColor = vec4(ambient + col * graz + slitCol + sssCol + rimCol, 1.0);
      }
    `,
    side: THREE.FrontSide,
  });

  const mesh = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 102), mat);
  mesh.position.set(0, BOX_CY, BOX_CZ);
  mesh.scale.setScalar(1.005); // avoids Z-fight with interior BackSide box
  scene.add(mesh);
  return mesh;
}

// ── Phase 3: Void lighting ────────────────────────────────────────────────────
// Only the corridor mouth + marble-grazing + rim. Void stays dark.
export function createVoidLighting(scene, isMobile) {
  const lights = [];

  // Bright blue PointLight just inside the mouth — bleeds out as the "slit"
  const mouthLight = new THREE.PointLight(0x3366ff, isMobile ? 7000 : 4500, 22, 2);
  mouthLight.position.set(0, BOX_CY, 8);
  scene.add(mouthLight);
  lights.push(mouthLight);

  // Emissive glow plane visible from outside — the actual "burning slit" visual
  const glowMat = new THREE.MeshStandardMaterial({
    color:             0x000000,
    emissive:          new THREE.Color(0x1e4acc),
    emissiveIntensity: isMobile ? 5.0 : 2.2,
    transparent:       true,
    opacity:           0.6,
    depthWrite:        false,
    blending:          THREE.AdditiveBlending,
  });
  const glowPlane = new THREE.Mesh(new THREE.PlaneGeometry(19.0, 7.5), glowMat);
  glowPlane.position.set(0, BOX_CY, 11.6); // just inside mouth, facing outward
  glowPlane.rotation.y = Math.PI;
  scene.add(glowPlane);
  lights.push(glowPlane);

  // Grazing SpotLights along top edges reveal chisel marks (desktop only — cheap on mobile)
  if (!isMobile) {
    [[-11.5, 10], [11.5, 10]].forEach(([x, y]) => {
      const g = new THREE.SpotLight(0x2244aa, 1800, 28, Math.PI * 0.09, 0.55, 2);
      g.position.set(x, y, BOX_CZ);
      g.target.position.set(x * 0.6, BOX_CY, BOX_CZ);
      scene.add(g);
      scene.add(g.target);
      lights.push(g);
    });
  } else {
    // Mobile: two simple PointLights instead of SpotLights
    [[-12, 9], [12, 9]].forEach(([x, y]) => {
      const g = new THREE.PointLight(0x1a3080, 1200, 22, 2);
      g.position.set(x, y, BOX_CZ);
      scene.add(g);
      lights.push(g);
    });
  }

  // Barely-there rim lights far behind camera position — cold silhouette separation
  [[-32, 5, 42], [32, 5, 42]].forEach(([x, y, z]) => {
    const r = new THREE.PointLight(0x08122a, isMobile ? 600 : 400, 90, 2);
    r.position.set(x, y, z);
    scene.add(r);
    lights.push(r);
  });

  return lights;
}

// ── Phase 4: Vastness cues ────────────────────────────────────────────────────

// Barely-visible floor plane far below — gives scale reference
export function createFloorHint(scene) {
  const mat  = new THREE.MeshBasicMaterial({ color: 0x010205, transparent: true, opacity: 0.45 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, -1.8, BOX_CZ); // slightly below the interior floor
  scene.add(mesh);
  return mesh;
}

// Sparse drifting particles — imply vast empty volume
const VOID_COUNT_DESKTOP = 900;
const VOID_COUNT_MOBILE  = 180;

export function createVoidDust(scene, isMobile) {
  const count = isMobile ? VOID_COUNT_MOBILE : VOID_COUNT_DESKTOP;
  const pos   = new Float32Array(count * 3);
  const vel   = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const ix = i * 3;
    pos[ix]     = (Math.random() - 0.5) * 130;
    pos[ix + 1] = Math.random() * 50 - 4;
    pos[ix + 2] = Math.random() * 120 - 65;
    vel[ix]     = (Math.random() - 0.5) * 0.004;
    vel[ix + 1] = Math.random() * 0.0018 + 0.0003;
    vel[ix + 2] = (Math.random() - 0.5) * 0.003;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    size:            0.09,
    color:           0x2a4080,
    transparent:     true,
    opacity:         0.16,
    depthWrite:      false,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);
  return { points, geo, vel, count };
}

export function updateVoidDust(voidDust, elapsed) {
  if (!voidDust) return;
  const { geo, vel, count } = voidDust;
  const pos = geo.attributes.position;
  for (let i = 0; i < count; i++) {
    const ix = i * 3;
    pos.array[ix]     += vel[ix]     + Math.sin(elapsed * 0.13 + i * 0.23) * 0.002;
    pos.array[ix + 1] += vel[ix + 1];
    pos.array[ix + 2] += vel[ix + 2];
    if (pos.array[ix + 1] > 46)   pos.array[ix + 1] = -4;
    if (Math.abs(pos.array[ix]) > 65)   vel[ix]     *= -1;
    if (pos.array[ix + 2] > 55 || pos.array[ix + 2] < -65) vel[ix + 2] *= -1;
  }
  pos.needsUpdate = true;
}

// Debug tubes — disabled for production
export function createDebugTubes() { return null; }
