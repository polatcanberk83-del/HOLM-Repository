import * as THREE from "three";

export function createScene(canvas, isMobile = false) {
  // ---------- Renderer ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping        = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 6.5;
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
  //
  // WALL_EMISSIVE: duvarın kendi içinden gelen homojen mavi parıltı.
  // Point light'lardan bağımsız, tüm yüzey eşit tonda aydınlanır.
  // Bloom eşiği (threshold=0.9, exposure=6.5): mavi kanal 0x1c (0.11 linear)
  // × WALL_EMISSIVE × 6.5 ≈ 0.43 — eşiğin çok altında, bloom şişirmez.
  // İnce ayar: bu tek değeri değiştir.
  const wallUniforms = { uTime: { value: 0 } };

  // Tamamen custom ShaderMaterial — MeshStandardMaterial injection yerine
  // domain-warped 5-oktav FBM, derinlik karartması, kenar vignette
  const roomMat = new THREE.ShaderMaterial({
    uniforms: wallUniforms,
    side: THREE.BackSide,
    vertexShader: /* glsl */`
      varying vec3 vWorldPos;
      void main() {
        vWorldPos   = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform float uTime;
      varying vec3  vWorldPos;

      float hash(vec2 p) {
        p = fract(p * vec2(234.34, 435.35));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                   mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.3 + vec2(1.7, 0.9); a *= 0.45; }
        return v;
      }

      void main() {
        float z = clamp((vWorldPos.z + 80.0) / 90.0, 0.0, 1.0); // 0=uzak, 1=yakın
        float y = vWorldPos.y / 8.0;

        // Domain-warped FBM: her katman bir öncekini bükuyor
        float n1 = fbm(vec2(z * 2.5  - uTime * 0.08,  y * 1.5  + uTime * 0.05));
        float n2 = fbm(vec2(z * 5.0  + uTime * 0.13  + n1 * 0.8, y * 3.0 - uTime * 0.09));
        float n3 = fbm(vec2(z * 3.5  - uTime * 0.06  + n2 * 0.5, y * 2.0 + uTime * 0.07));
        float g  = n1 * 0.50 + n2 * 0.30 + n3 * 0.20;

        // Renk paleti: derin lacivert → elektrik mavi → indigo
        vec3 c1  = vec3(0.018, 0.028, 0.10);
        vec3 c2  = vec3(0.040, 0.100, 0.32);
        vec3 c3  = vec3(0.080, 0.200, 0.52);
        vec3 col = mix(c1, c2, smoothstep(0.0, 0.45, g));
        col      = mix(col, c3, smoothstep(0.45, 0.85, g));
        col      = mix(col, c2 * 0.7, smoothstep(0.75, 1.0, g) * n3);

        // Koridor derinliği: uzaklaştıkça kararır
        col *= (0.22 + z * 0.78);

        // Üst/alt kenar karartması
        col *= (0.35 + smoothstep(0.0, 0.20, y) * smoothstep(1.0, 0.80, y) * 0.65);

        // Kir/grunge katmanı — statik yüksek frekanslı leke deseni
        float dirt = fbm(vec2(vWorldPos.x * 5.5 + vWorldPos.z * 1.2, vWorldPos.y * 9.0));
        float dirt2 = fbm(vec2(vWorldPos.z * 3.0 + dirt * 0.6, vWorldPos.x * 7.0 + vWorldPos.y * 4.0));
        col *= (0.93 + dirt * 0.04 + dirt2 * 0.03);

        col *= 5.2; // genel parlaklık — ince ayar buradan
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const room = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 102), roomMat);
  room.position.set(0, 4, -39);
  room.receiveShadow = true;
  scene.add(room);

  // Zemin — hafif yansımalı
  const floorMat = new THREE.MeshStandardMaterial({
    color:             0x252530, // açık gri-mavi
    roughness:         0.85,
    metalness:         0.10,
    emissive:          new THREE.Color(0x181820), // gri glow
    emissiveIntensity: 10.0, // ince ayar buradan
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

  const ambient = new THREE.AmbientLight(0x203050, 75.0);  // ince ayar — modellere vuran taban ışık
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0x304060, 0x080810, 55.0); // ince ayar — orijinal 26
  scene.add(hemi);

  // Spotlight aktif modeli takip eder — pozisyon/target main.js'de lerp'leniyor
  const spotLight = new THREE.SpotLight(0xc8d8ff, 30, 22, 0.6, 0.75, 2);
  spotLight.position.set(0, 6, 0);
  spotLight.castShadow = !isMobile;
  spotLight.shadow.mapSize.set(isMobile ? 512 : 1024, isMobile ? 512 : 1024);
  spotLight.shadow.bias = -0.002;
  scene.add(spotLight);
  scene.add(spotLight.target);

  // Fill PointLight'lar kaldırıldı — nokta nokta leke yapıyorlardı.
  // Oda genel ışığı artık ambient + hemi + WALL_EMISSIVE'den geliyor (homojen).

  // arm_crystal reveal spotlight — intensity=0 başlar, main.js kamera yaklaşınca açar
  // ARM_REVEAL_INTENSITY: ince ayar main.js'de
  const armSpot = new THREE.SpotLight(0xd0e8ff, 0, 18, 0.50, 0.85, 2);
  armSpot.position.set(0, 7, -48);
  armSpot.target.position.set(0, 0, -48);
  armSpot.castShadow = !isMobile;
  armSpot.shadow.mapSize.set(isMobile ? 512 : 1024, isMobile ? 512 : 1024);
  armSpot.shadow.bias = -0.002;
  armSpot.target.updateMatrixWorld();
  scene.add(armSpot);
  scene.add(armSpot.target);

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

  return { scene, renderer, camera, spotLight, armSpot, ambient, hemi, wallUniforms, onResize };
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
