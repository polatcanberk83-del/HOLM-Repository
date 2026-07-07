import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const dracoLoader = new DRACOLoader();
// three.js'in kendi CDN'deki draco decoder'ı — offline çalışman gerekirse
// bunu /public/draco/'ya kopyalayıp yolu değiştiririz
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

let gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Called once from main.js before loading — routes progress into loader UI
export function setLoadingManager(manager) {
  gltfLoader = new GLTFLoader(manager);
  gltfLoader.setDRACOLoader(dracoLoader);
}

const cache = new Map();

/**
 * GLB yükler, sahneye ekler. Aynı path tekrar istenirse cache'den klonlar.
 * Lazy-load mantığı: sadece o beat'e gelince çağrılmalı.
 */
export function loadModel(path, { onProgress } = {}) {
  if (cache.has(path)) {
    return Promise.resolve(cache.get(path).clone(true));
  }
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      path,
      (gltf) => {
        const root = gltf.scene;
        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        const box = new THREE.Box3().setFromObject(root);
        const center = new THREE.Vector3();
        box.getCenter(center);
        console.log(`[loader] ✓ ${path} | bbox center:`, center.toArray().map(v => v.toFixed(2)));
        cache.set(path, root);
        resolve(root.clone(true));
      },
      onProgress,
      (err) => {
        console.error(`[loader] ✗ ${path}`, err);
        reject(err);
      }
    );
  });
}

export function preload(paths) {
  return Promise.all(paths.map((p) => loadModel(p).catch(() => null)));
}
