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
// Medallion scene replaces the old diamond cluster. Old `Contact`
// import kept for one-line rollback if we ever need it.
// const contact = new Contact();
// contact.init();
const contactScene = new ContactScene();

// Wrap [data-hover-roll] targets — the 3 huge links
initHoverRoll(document);

// Site-wide page transition — captures internal link clicks + covers
// while the next page loads
mountPageTransition();

// CRITICAL: signal READY only AFTER the scene has finished mounting.
// contactScene.mount() awaits HDRI + medallion GLB + (on non-mobile)
// the 5 corridor sculptures. If we called signalPageReady on window
// load like we used to, the transition cover would drop before models
// were ready — user would see a black flash / half-populated corridor.
contactScene.mount()
  .catch((err) => console.error("[contact] mount failed:", err))
  .finally(() => signalPageReady());

window.addEventListener("pagehide", () => {
  contactScene.destroy();
  menu.destroy?.();
  lenis.destroy?.();
});
