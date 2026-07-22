import * as THREE from "three";

// Brilliant-cut diamond geometry — table + crown + girdle + pavilion +
// culet, with per-face vertex copies so computeVertexNormals() yields
// hard planar normals for that faceted sparkle. Result is cached per N.
const _geomCache = new Map();

export function createBrilliantGeometry(N = 16) {
  const hit = _geomCache.get(N);
  if (hit) return hit;

  const halfStep = Math.PI / N;
  const layers = [
    [ 0.62,  0.00,  0        ],   // table centre
    [ 0.62,  0.40,  0        ],   // table edge (flat top disc)
    [ 0.40,  0.70,  halfStep ],   // upper crown ring — half-step offset creates star facets
    [ 0.08,  1.00,  0        ],   // girdle (widest)
    [-0.22,  0.88,  halfStep ],   // upper pavilion ring
    [-0.72,  0.42,  0        ],   // lower pavilion
    [-1.08,  0.00,  0        ],   // culet point
  ];

  const rings = layers.map(([y, r, a]) => {
    if (r === 0) return [[0, y, 0]];
    const verts = [];
    for (let i = 0; i < N; i++) {
      const th = (i / N) * Math.PI * 2 + a;
      verts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    return verts;
  });

  const positions = [];
  const indices   = [];
  const pushTri = (a, b, c) => {
    const base = positions.length / 3;
    positions.push(a[0], a[1], a[2],
                   b[0], b[1], b[2],
                   c[0], c[1], c[2]);
    indices.push(base, base + 1, base + 2);
  };

  for (let li = 0; li < layers.length - 1; li++) {
    const r1 = rings[li];
    const r2 = rings[li + 1];
    if (r1.length === 1 && r2.length > 1) {
      const c = r1[0];
      for (let i = 0; i < N; i++) {
        const j = (i + 1) % N;
        pushTri(c, r2[i], r2[j]);
      }
    } else if (r1.length > 1 && r2.length === 1) {
      const c = r2[0];
      for (let i = 0; i < N; i++) {
        const j = (i + 1) % N;
        pushTri(r1[i], r1[j], c);
      }
    } else {
      for (let i = 0; i < N; i++) {
        const j = (i + 1) % N;
        pushTri(r1[i], r1[j], r2[i]);
        pushTri(r1[j], r2[j], r2[i]);
      }
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.scale(0.92, 1.06, 0.92);
  g.computeVertexNormals();
  _geomCache.set(N, g);
  return g;
}

// Physical-glass diamond material with facet-edge chromatic aberration
// injected into the shader — real diamonds show sharp rainbow layers on
// grazing edges; we approximate with a fresnel-driven hue cycle on top
// of transmission + iridescence + clearcoat.
export function createDiamondMaterial({ isMobile = false } = {}) {
  const mat = new THREE.MeshPhysicalMaterial({
    color:                     0xffffff,
    metalness:                 0.0,
    roughness:                 isMobile ? 0.02 : 0.0,
    transmission:              1.0,
    thickness:                 isMobile ? 1.0 : 2.5,
    ior:                       2.417,
    attenuationDistance:       12.0,
    attenuationColor:          new THREE.Color(0xffffff),
    envMapIntensity:           isMobile ? 1.5 : 2.8,
    iridescence:               isMobile ? 0.0 : 0.25,
    iridescenceIOR:            1.55,
    iridescenceThicknessRange: [400, 900],
    clearcoat:                 isMobile ? 0.0 : 1.0,
    clearcoatRoughness:        0.0,
    transparent:               true,
    side:                      THREE.FrontSide,
  });
  if (!isMobile && "dispersion" in mat) mat.dispersion = 6.5;

  if (!isMobile) {
    mat.userData.uEdgeTime = { value: 0 };
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uEdgeTime = mat.userData.uEdgeTime;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
           varying vec3 vEdgeNormal;
           varying vec3 vEdgeViewPos;`,
        )
        .replace(
          "#include <project_vertex>",
          `#include <project_vertex>
           vEdgeNormal  = normalize(normalMatrix * normal);
           vEdgeViewPos = -mvPosition.xyz;`,
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
           uniform float uEdgeTime;
           varying vec3 vEdgeNormal;
           varying vec3 vEdgeViewPos;`,
        )
        .replace(
          "#include <output_fragment>",
          `#include <output_fragment>
           {
             vec3 N = normalize(vEdgeNormal);
             vec3 V = normalize(vEdgeViewPos);
             float f = pow(1.0 - abs(dot(N, V)), 3.0);
             float hue = f * 8.0 + uEdgeTime * 0.6;
             vec3 rainbow = vec3(
               sin(hue           ) * 0.5 + 0.5,
               sin(hue + 2.0944  ) * 0.5 + 0.5,
               sin(hue + 4.18879 ) * 0.5 + 0.5
             );
             gl_FragColor.rgb += rainbow * f * 0.28;
           }`,
        );
    };
  }
  return mat;
}
