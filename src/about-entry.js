import Lenis from "lenis";
import gsap  from "gsap";

import { Menu }                                    from "./menu.js";
import { About }                                   from "./about.js";
import { initHoverRoll }                           from "./hoverRoll.js";
import { mountPageTransition, signalPageReady }    from "./pageTransition.js";

// ─── Lenis ───────────────────────────────────────────────────────────
const isMobile = window.innerWidth < 768 || "ontouchstart" in window;

const lenis = new Lenis(isMobile ? {
  smoothTouch:     false,
  touchMultiplier: 0.75,
} : {
  duration:        1.6,
  smoothWheel:     true,
  wheelMultiplier: 0.55,
  touchMultiplier: 1.2,
  smoothTouch:     false,
});
gsap.ticker.lagSmoothing(0);

function raf(now) {
  lenis.raf(now);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// ─── Room-guide menu ────────────────────────────────────────────────
const menu = new Menu({ lenis });
menu.mount();

// ─── About page ─────────────────────────────────────────────────────
const about = new About({ lenis });
about.init();

initHoverRoll(document);

mountPageTransition();

window.addEventListener("load", () => {
  setTimeout(signalPageReady, 200);
});

window.addEventListener("pagehide", () => {
  about.destroy();
  menu.destroy?.();
  lenis.destroy?.();
});
