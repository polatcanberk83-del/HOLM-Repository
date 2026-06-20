import * as THREE from "three";

export function createScene(canvas, isMobile = false) {
  // ---------- Renderer ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping        = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = isMobile ? 9.5 : 6.5;
  renderer.shadowMap.enabled  = !isMobile;
  renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace   = THREE.SRGBColorSpace;

  // ---------- Scene ----------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x06060a);
  scene.fog = new THREE.FogExp2(0x06060a, 0.022);

  // ---------- Camera ----------
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );
  camera.position.set(0, 1.8, 8);
  camera.lookAt(0, 1.5, 0);

  // ---------- Museum Room ----------
  // BoxGeometry 20w × 8h × 60d, BackSide → içi görünür
  // Merkez (0, 4, -25) → Z: 5'ten -55'e, Y: 0'dan 8'e
  const roomMat = new THREE.MeshStandardMaterial({
    color:     0x1c1c2a,
    roughness: 0.95,
    metalness: 0,
    side:      THREE.BackSide,
  });
  const room = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 102), roomMat);
  room.position.set(0, 4, -39);
  room.receiveShadow = true;
  scene.add(room);

  // Zemin — hafif yansımalı
  const floorMat = new THREE.MeshStandardMaterial({
    color:     0x101018,
    roughness: 0.9,
    metalness: 0.05,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 102), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.001, -39);
  floor.receiveShadow = true;
  scene.add(floor);

  // ---------- Lighting ----------
  // THREE.js 0.184 fiziksel birim: intensity = candela.
  // Kullanıcının belirttiği değerler (ambient:0.4, spot:80) legacy scale —
  // fiziksel modelde ~50-100x çarpan gerekiyor.

  const ambient = new THREE.AmbientLight(0x203050, isMobile ? 55.0 : 32.0);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0x304060, 0x080810, isMobile ? 42.0 : 26.0);
  scene.add(hemi);

  // Spotlight aktif modeli takip eder — pozisyon/target main.js'de lerp'leniyor
  const spotLight = new THREE.SpotLight(0xc8d8ff, 30, 22, 0.6, 0.75, 2);
  spotLight.position.set(0, 6, 0);
  spotLight.castShadow = !isMobile;
  spotLight.shadow.mapSize.set(isMobile ? 512 : 1024, isMobile ? 512 : 1024);
  spotLight.shadow.bias = -0.002;
  scene.add(spotLight);
  scene.add(spotLight.target);

  // Her model pozisyonunda sabit dolgu ışığı (Z=0,-12,-24,-36,-48,-60)
  // Spotlight aktif modeli aydınlatırken diğerleri bu ışıkla siluet verir.
  // Fill lights on left/right walls so they light the room without blasting models from above
  (isMobile ? [0, -24, -48] : [0, -12, -24, -36, -48]).forEach(z => {
    [-8, 8].forEach(x => {
      const fill = new THREE.PointLight(0x3a5080, isMobile ? 9000 : 4000, 28, 2);
      fill.position.set(x, 4, z);
      scene.add(fill);
    });
  });

  // Corridor lights
  if (!isMobile) {
    [-58, -68, -78].forEach(z => {
      [-7, 7].forEach(x => {
        const c = new THREE.PointLight(0x3a5080, 1800, 22, 2);
        c.position.set(x, 4, z);
        scene.add(c);
      });
    });
  }

  // Warm glow near the projection wall
  const wallGlow = new THREE.PointLight(0x5070b0, 3000, 30, 2);
  wallGlow.position.set(0, 5, -83);
  scene.add(wallGlow);

  // ---------- Resize ----------
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onResize);

  return { scene, renderer, camera, spotLight, onResize };
}

// ---------- Projection plane (end wall) ----------
export function createProjectionPlane(scene) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        // Soft rectangular mask — falls off toward edges
        vec2 d = abs(vUv - 0.5) * 2.0;
        float mask = (1.0 - smoothstep(0.55, 1.0, d.x))
                   * (1.0 - smoothstep(0.55, 1.0, d.y));

        // Multi-frequency flicker
        float flicker = 0.88
          + 0.07 * sin(uTime * 19.3)
          + 0.05 * sin(uTime * 7.7 + 1.2);

        // Subtle scanline noise
        float scan = 1.0 - hash(vec2(floor(vUv.y * 130.0), uTime * 25.0)) * 0.045;

        vec3 col = vec3(0.80, 0.90, 1.0) * flicker * scan;
        gl_FragColor = vec4(col, mask * 0.35);
      }
    `,
    transparent: true,
    blending:    THREE.AdditiveBlending,
    depthWrite:  false,
    side:        THREE.FrontSide,
  });

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(32, 18), mat);
  plane.position.set(0, 4, -89.5);
  plane.visible = false; // revealed via main.js when camera reaches the zone
  scene.add(plane);
  return plane;
}

// ---------- Zemin halesi (ShaderMaterial — inline GLSL, additive) ----------
export function createHalo() {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(0x1a44cc) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float alpha = pow(clamp(1.0 - d, 0.0, 1.0), 2.0) * 0.55;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    blending:    THREE.AdditiveBlending,
    depthWrite:  false,
    side:        THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}
