import * as THREE from "three";
import marbleWallUrl from "../assets/marble-wall-exp-1.webp";

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
  // Duvarlar — düz, çok koyu gri. Ton buradan ayarlanır.
  const wallUniforms = { uTime: { value: 0 } };
  const roomMat = new THREE.MeshBasicMaterial({
    color: 0x141418,   // ince ayar — çok koyu gri
    side:  THREE.BackSide,
  });
  const room = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 102), roomMat);
  room.position.set(0, 4, -39);
  room.receiveShadow = true;
  scene.add(room);

  // Zemin — brand blue, PBR-lit
  //
  // MeshStandardMaterial ambient + hemi + spot + her modelin key
  // light'ını doğal şekilde yakalıyor. Sonuç: her modelin altında
  // bright pool of light + koridorun geri kalanı brand cobalt tint.
  // Reflection yok (Reflector shader'ı hiç ışık almadığı için taban
  // görünmüyordu — önce görünürlük). Reflection'ı sonra layered
  // material olarak eklenebilir.
  const floorMat = new THREE.MeshStandardMaterial({
    // Deep royal blue — brand family ama saturated primary değil.
    // Ambient 75 + hemi 55 + key lights bu koyu tonu bile ışık
    // pool'larında brand cobalt'a çıkarıyor; koridorun geri kalanı
    // deep navy'de kalıyor, palette dengesi bozulmuyor.
    color:     0x0e1e58,
    roughness: 0.72,       // matte polished — spekülar highlight yayılıyor
    metalness: 0.04,       // near-dielectric — enamel parlaklığı yok
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 102), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.001, -39);
  floor.receiveShadow = true;
  scene.add(floor);

  // ── Tavan — düz navy, ışık yakalamıyor.
  //    MeshBasicMaterial hiçbir light'a cevap vermediği için her modelin
  //    key light'ı tavana çember pool'u bırakmıyor. Sonuç: floor'la
  //    aynı renk kimliğinde ama üniform dome; koridorun "kapalı üst"
  //    hissini bozmuyor.
  const ceilingMat = new THREE.MeshBasicMaterial({
    color: 0x0e1e58,
  });
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(20, 102), ceilingMat);
  ceiling.rotation.x = Math.PI / 2;   // face downward
  ceiling.position.set(0, 7.99, -39);
  scene.add(ceiling);

  // ── Sol + sağ duvarlar — mermer texture (marble-wall-exp-1.webp)
  //    Tek kare kalıp, X boyunca 12 tekrar (~8.5m tile ≈ neredeyse
  //    kare) × Y boyunca 1 tekrar (8m boyu tam kaplıyor). Vite asset
  //    pipeline'ı fingerprint URL sağlıyor, TextureLoader hallediyor.
  const marbleTex = new THREE.TextureLoader().load(marbleWallUrl);
  marbleTex.colorSpace = THREE.SRGBColorSpace;
  marbleTex.wrapS = THREE.RepeatWrapping;
  marbleTex.wrapT = THREE.RepeatWrapping;
  marbleTex.repeat.set(12, 1);
  marbleTex.anisotropy = 8;  // dik açıdan bakışta blur/moire azaltır

  // color × map ile texture dimlenir — ambient 75 + hemi 55 altında
  // beyaz marble lightbox oluyordu, mid-gray multiplier ile stone-vari
  // "aydınlatılmış ama patlamayan" bir seviyeye çekiyoruz.
  // Roughness 0.90 → spekülar highlight tamamen dağılıyor, key light
  // altında bile duvar glare vermiyor.
  const marbleMat = new THREE.MeshStandardMaterial({
    map:       marbleTex,
    color:     0x656570,   // mid-tone dim — 4a4a52'den bir tık açık
    roughness: 0.78,       // matte polished, glare değil ama polish hissi var
    metalness: 0.00,
  });

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(102, 8), marbleMat);
  leftWall.rotation.y = Math.PI / 2;   // normal points +x (interior facing)
  leftWall.position.set(-9.99, 4, -39);
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(102, 8), marbleMat);
  rightWall.rotation.y = -Math.PI / 2; // normal points -x
  rightWall.position.set(9.99, 4, -39);
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  // ── End wall (was the projection wall) — same marble treatment as
  //    the corridor sides, sized 20×8 to cap the room. Cloned texture
  //    with a lower repeat so the tile size stays consistent.
  const endWallTex = new THREE.TextureLoader().load(marbleWallUrl);
  endWallTex.colorSpace = THREE.SRGBColorSpace;
  endWallTex.wrapS = THREE.RepeatWrapping;
  endWallTex.wrapT = THREE.RepeatWrapping;
  endWallTex.repeat.set(2.4, 1);   // 20 / 8.5-unit tile ≈ 2.4 repeats
  endWallTex.anisotropy = 8;
  const endWallMat = new THREE.MeshStandardMaterial({
    map:       endWallTex,
    color:     0x656570,
    roughness: 0.78,
    metalness: 0.00,
  });
  const endWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), endWallMat);
  endWall.position.set(0, 4, -89.9);   // normal defaults to +Z, facing camera
  endWall.receiveShadow = true;
  scene.add(endWall);

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
export function createProjectionPlane(scene, isMobile = false) {
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

  // Mobile: portrait viewport needs a taller + wider plane so the
  // multi-line copy overlay sits comfortably inside the glow. Desktop
  // 32×18 is calibrated for the 16:9 orbit view.
  const geo = isMobile
    ? new THREE.PlaneGeometry(48, 42)
    : new THREE.PlaneGeometry(32, 18);
  const plane = new THREE.Mesh(geo, mat);
  plane.position.set(0, isMobile ? 8 : 4, -89.5);
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
