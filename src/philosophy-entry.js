import Lenis from "lenis";
import gsap  from "gsap";

import { Menu }           from "./menu.js";
import { Philosophy }     from "./philosophy.js";
import { initHoverRoll }  from "./hoverRoll.js";

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

// ─── Philosophy page ────────────────────────────────────────────────
const philosophy = new Philosophy({ lenis });
philosophy.init();

// Wrap [data-hover-roll] targets (the menu's CTA + philosophy's Let's talk)
initHoverRoll(document);

// Clean up if the tab is torn down / hot-reloaded
window.addEventListener("pagehide", () => {
  philosophy.destroy();
  menu.destroy?.();
  lenis.destroy?.();
});
