// HOLM — Atölye yolculuğu: 7 beat'in tüm verisi
// scroll progress (0..1) bu beat'lerin arasında interpolasyon yapacak

export const BEATS = [
  {
    id: 0,
    name: "entry",
    label: "Giriş",
    caption: "We craft the moment—",
    captionHold: true, // cümle kesik, beat 5'te tamamlanacak
    camera: { x: 0, y: 1.7, z: -29 },
    look:   { x: 0, y: 1.7, z: -15 },
    fogDensity: 0.02,
    fogColor: 0x1a0f08,
    warmth: 1.0, // 1 = tam sıcak, 0 = tam soğuk (final)
    model: null,
  },
  {
    id: 1,
    name: "chaos",
    label: "Dağınıklık",
    caption: "Every brand starts unfinished",
    camera: { x: 4.5, y: 2.4, z: -17 },
    look:   { x: -2, y: 1.8, z: -8 },
    fogDensity: 0.018,
    fogColor: 0x1f1208,
    warmth: 1.0,
    model: null, // atölye objeleri sahnenin kendisi
  },
  {
    id: 1.5,
    name: "labor",
    label: "Emek",
    caption: "This takes time",
    camera: { x: -3.6, y: 1.3, z: -10.4 },
    look:   { x: -5.14, y: 0.99, z: -10.99 },
    fogDensity: 0.06, // yakın çekim, daha yoğun toz hissi
    fogColor: 0x241405,
    warmth: 1.0,
    model: "/models/hand.glb",
    orbit: true, // kamera modelin etrafında dönecek
  },
  {
    id: 2,
    name: "monument",
    label: "Anıt",
    caption: "Something is always missing.",
    camera: { x: -9.5, y: 2.0, z: -4.0 },
    look:   { x: -9.5, y: 5.5, z: 1.0 },
    fogDensity: 0.03,
    fogColor: 0x1c0f06,
    warmth: 0.9,
    model: "/models/monument.glb",
  },
  {
    id: 3,
    name: "focus",
    label: "Odaklanma",
    caption: "Then it comes into focus",
    camera: { x: -1.6, y: 1.7, z: -16.7 },
    look:   { x: -1.6, y: 1.7, z: -17 },
    fogDensity: 0.04,
    fogColor: 0x180f08,
    warmth: 0.75,
    model: "/models/hero_canvas.glb",
    captionExtra: "Between sketch and masterpiece, there's patience",
  },
  {
    id: 3.5,
    name: "unsaid",
    label: "Söylenmemiş",
    caption: "What's left unsaid shapes the rest",
    camera: { x: 3.5, y: 1.8, z: 5.0 },
    look:   { x: 3.5, y: 1.8, z: 9.0 },
    fogDensity: 0.05,
    fogColor: 0x120c10,
    warmth: 0.4,
    model: "/models/void_figure.glb",
  },
  {
    id: 4,
    name: "approach",
    label: "Yaklaşma",
    caption: "Almost there",
    camera: { x: 0, y: 2.2, z: 12 },
    look:   { x: 0, y: 2.6, z: 18 },
    fogDensity: 0.025,
    fogColor: 0x0a0a14,
    warmth: 0.15,
    model: null,
  },
  {
    id: 5,
    name: "moment",
    label: "An",
    caption: "What was lost, is held at the end.",
    captionHold: false,
    camera: { x: 0, y: 2.0, z: 20 },
    look:   { x: 0, y: 2.6, z: 18 },
    fogDensity: 0.012,
    fogColor: 0x06080f,
    warmth: 0.0, // tam soğuk — tek ve son cyan an
    model: "/models/arm_crystal.glb",
  },
];

// Beat'ler arası ekstra atölye objeleri (sahnede sabit duran, tek seferlik yüklenen)
export const STATIC_PROPS = [
  { model: "/models/drape.glb", position: [9.5, 0, 9.9] },
];

export const TOTAL_BEATS = BEATS.length;
