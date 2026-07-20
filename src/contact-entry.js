import Lenis from "lenis";
import gsap  from "gsap";

import { Menu }                                    from "./menu.js";
import { Contact }                                 from "./contact.js";
import { ContactScene }                            from "./contactScene.js";
import { initHoverRoll }                           from "./hoverRoll.js";
import { mountPageTransition, signalPageReady }    from "./pageTransition.js";

// ─── Lenis ───────────────────────────────────────────────────────
// One-viewport page — Lenis still runs for consistency with the rest
// of the site so scrolling into the menu drawer feels the same.
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
function raf(now) { lenis.raf(now); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// ─── Room-guide menu ────────────────────────────────────────────
const menu = new Menu({ lenis });
menu.mount();

// ─── Contact page ───────────────────────────────────────────────
// EXPERIMENT: swapped the original diamond-cluster Contact for an
// isolated Three.js scene that renders a single GLB medallion. Old
// Contact left imported but unused so the swap is one-line reversible.
// const contact = new Contact();
// contact.init();
const contactScene = new ContactScene();
contactScene.mount();

// Wrap [data-hover-roll] targets — the 3 huge links
initHoverRoll(document);

// Site-wide page transition — captures internal link clicks + covers
// while the next page loads
mountPageTransition();

// Give the fluid backdrop + font a moment, then reveal. The transition
// only actually plays when we arrived via a nav; a fresh load is a no-op.
window.addEventListener("load", () => {
  setTimeout(signalPageReady, 200);
});

window.addEventListener("pagehide", () => {
  contactScene.destroy();
  menu.destroy?.();
  lenis.destroy?.();
});
