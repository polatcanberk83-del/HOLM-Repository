import gsap from "gsap";

// ─── Block reveal page transition ──────────────────────────────────
// Grid of dark blocks stagger-fade in over the current page, we
// navigate under the cover, then the same grid fades out in the same
// direction on the next page — a single continuous wave sweeping
// across the site.
//
// Ported from the Codegrid `next-transition-router` pattern (their
// CSS class names / colors are kept verbatim). Runtime is re-wired
// for a plain MPA: sessionStorage hands off between pages instead of
// a React provider.

const FLAG_KEY = "holm:transition";

const ROWS       = 5;
const COLS       = 8;
const BLOCK_DUR  = 0.55;
const STAGGER    = 0.025;
const BLOCK_BG   = "#000000";

// Four cardinal directions each block can grow from / retract into.
// axis: which scale axis is animated (the other stays at 1).
// origin: transform-origin for the collapse/grow point.
const DIRECTIONS = [
  { name: "top",    axis: "y", origin: "top center"    },
  { name: "bottom", axis: "y", origin: "bottom center" },
  { name: "left",   axis: "x", origin: "center left"   },
  { name: "right",  axis: "x", origin: "center right"  },
];
const pickDir = () => DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

// Attributes / URL patterns that should NOT trigger a transition.
function shouldSkipLink(link) {
  if (!link || !link.href) return true;
  if (link.hasAttribute("download")) return true;
  if (link.hasAttribute("data-no-transition")) return true;
  if (link.target && link.target !== "" && link.target !== "_self") return true;

  const url  = new URL(link.href, window.location.href);
  const here = window.location;

  if (url.origin !== here.origin) return true;
  if (!/^https?:$/.test(url.protocol)) return true;
  if (url.pathname === here.pathname && url.search === here.search) return true;

  return false;
}

// Prevent duplicate mounts during hot reload
let SINGLETON = null;

// Max time we'll hold the cover on the new page waiting for the
// controller to call pageReady(). If it never fires (say, a page
// controller crashed) we still reveal so the user isn't stuck on a
// dark screen forever.
const MAX_HOLD_MS = 6000;

export class PageTransition {
  constructor() {
    this.grid    = null;
    this.blocks  = [];
    this._navigating   = false;
    this._entering     = false;
    this._pendingEnter = false;   // true while blocks cover a new page waiting for pageReady()
    this._readyFired   = false;   // pageReady() has been called
    this._holdTimer    = null;
    this._onClick      = this._onClick.bind(this);
  }

  mount() {
    if (SINGLETON) return SINGLETON;
    SINGLETON = this;

    this._injectStyles();
    this._createDOM();
    document.addEventListener("click", this._onClick, true);

    const arrivedViaTransition = sessionStorage.getItem(FLAG_KEY) === "1";
    if (arrivedViaTransition) {
      sessionStorage.removeItem(FLAG_KEY);
      // Blocks are already at opacity 1 (see _createDOM). We DO NOT
      // auto-reveal — we wait for the page's controller to call
      // pageReady(). If it never does, the safety timer reveals anyway.
      this._pendingEnter = true;
      this.grid.style.pointerEvents = "auto";
      this._holdTimer = setTimeout(() => this._playEnter(), MAX_HOLD_MS);
    }
    return this;
  }

  // Public: page controllers call this once their content is ready
  // to be shown (models loaded, first frame rendered, whatever they
  // define as "ready"). Fresh loads without a transition are a no-op.
  pageReady() {
    if (this._readyFired) return;
    this._readyFired = true;
    if (!this._pendingEnter) return;
    this._pendingEnter = false;
    if (this._holdTimer) clearTimeout(this._holdTimer);
    this._holdTimer = null;
    // Small delay so the first paint of the new page has time to settle
    // beneath the cover before the reveal begins
    requestAnimationFrame(() => this._playEnter());
  }

  destroy() {
    document.removeEventListener("click", this._onClick, true);
    this.grid?.parentNode?.removeChild(this.grid);
    if (SINGLETON === this) SINGLETON = null;
  }

  // ── CSS is injected once (class names verbatim from the source) ──
  _injectStyles() {
    if (document.getElementById("holm-transition-styles")) return;
    const style = document.createElement("style");
    style.id = "holm-transition-styles";
    style.textContent = /* css */`
      .transition-grid {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
      }
      .transition-block {
        position: absolute;
        background-color: ${BLOCK_BG};
        transform: scale(0);
        will-change: transform;
      }
    `;
    document.head.appendChild(style);
  }

  _createDOM() {
    const willEnter = sessionStorage.getItem(FLAG_KEY) === "1";

    const grid = document.createElement("div");
    grid.className = "transition-grid";
    grid.setAttribute("aria-hidden", "true");

    const w = 100 / COLS;
    const h = 100 / ROWS;
    // A hair of overlap on width/height so sub-pixel rounding never
    // shows the page below as thin bright seams between blocks
    const wPad = 0.5;
    const hPad = 0.5;

    const blocks = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const b = document.createElement("div");
        b.className = "transition-block";
        b.style.top    = `${r * h}%`;
        b.style.left   = `${c * w}%`;
        b.style.width  = `${w + wPad}%`;
        b.style.height = `${h + hPad}%`;

        // Each block gets its own random direction — up/down/left/right.
        // The other axis stays at scale 1; only the "active" axis
        // animates 0 ↔ 1.
        const dir = pickDir();
        b._dir = dir;
        b._row = r;
        b._col = c;
        b.style.transformOrigin = dir.origin;

        // Initial paint: if we're the destination page of a transition,
        // the block should be fully covering already — no flash under
        // it. Otherwise it starts collapsed on its active axis.
        if (willEnter) {
          b.style.transform = "scale(1)";
        } else {
          b.style.transform = dir.axis === "y" ? "scaleY(0)" : "scaleX(0)";
        }

        grid.appendChild(b);
        blocks.push(b);
      }
    }

    document.body.appendChild(grid);
    this.grid   = grid;
    this.blocks = blocks;
    this._reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  _onClick(e) {
    if (this._navigating) { e.preventDefault(); return; }
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (e.button !== undefined && e.button !== 0) return;

    const link = e.target.closest("a[href]");
    if (shouldSkipLink(link)) return;

    e.preventDefault();
    const url = new URL(link.href, window.location.href);
    this.leave(url.pathname + url.search + url.hash);
  }

  // ── Public: cover the page then navigate ─────────────────────────
  leave(nextPath) {
    if (this._navigating) return;
    this._navigating = true;
    document.documentElement.style.overflow = "hidden";
    this.grid.style.pointerEvents = "auto";

    // Warm the browser's cache with the destination HTML while the
    // cover animation plays — cuts down the "hang time" between
    // window.location.href and the new page's first paint.
    try {
      fetch(nextPath, { credentials: "same-origin", cache: "reload" }).catch(() => {});
    } catch (_) { /* noop */ }

    if (this._reducedMotion) {
      this.blocks.forEach((b) => { b.style.transform = "scale(1)"; });
      sessionStorage.setItem(FLAG_KEY, "1");
      window.location.href = nextPath;
      return;
    }

    // Multi-direction shutter — each block grows on its own random
    // axis from its assigned origin. Grid stagger (Chebyshev distance
    // from top-left) still coordinates the wave so it reads as one
    // motion rather than 40 uncoordinated cells.
    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem(FLAG_KEY, "1");
        window.location.href = nextPath;
      },
    });

    this.blocks.forEach((b) => {
      const dir = b._dir;
      // Reset to hidden state on the correct axis (in case a prior
      // enter animation was mid-flight)
      gsap.set(b, {
        scaleX:          dir.axis === "y" ? 1 : 0,
        scaleY:          dir.axis === "y" ? 0 : 1,
        transformOrigin: dir.origin,
      });

      const delay    = Math.max(b._row, b._col) * STAGGER;
      const scaleKey = dir.axis === "y" ? "scaleY" : "scaleX";
      tl.to(b, {
        [scaleKey]: 1,
        duration:   BLOCK_DUR,
        ease:       "power4.inOut",
      }, delay);
    });
  }

  // ── Private: reveal the incoming page ────────────────────────────
  _playEnter() {
    if (this._entering) return;
    this._entering = true;
    this.grid.style.pointerEvents = "auto";

    if (this._reducedMotion) {
      this.blocks.forEach((b) => {
        const dir = b._dir;
        b.style.transform = dir.axis === "y" ? "scaleY(0)" : "scaleX(0)";
      });
      this.grid.style.pointerEvents = "none";
      this._entering = false;
      document.documentElement.classList.remove("holm-entering");
      document.documentElement.style.overflow = "";
      return;
    }

    // Reveal — each block retracts toward the SAME origin it grew
    // from, on the same axis. Result: every cell has its own
    // "personality" (up/down/left/right) but the grid wave still
    // sweeps top-left → bottom-right for a coherent motion.
    const tl = gsap.timeline({
      onComplete: () => {
        this.grid.style.pointerEvents = "none";
        this._entering = false;
        // Now that the reveal is over, drop the "keep the page covered"
        // class the inline <head> script added on load
        document.documentElement.classList.remove("holm-entering");
        document.documentElement.style.overflow = "";
      },
    });

    this.blocks.forEach((b) => {
      const dir = b._dir;
      gsap.set(b, {
        scaleX:          1,
        scaleY:          1,
        transformOrigin: dir.origin,
      });

      const delay    = Math.max(b._row, b._col) * STAGGER;
      const scaleKey = dir.axis === "y" ? "scaleY" : "scaleX";
      tl.to(b, {
        [scaleKey]: 0,
        duration:   BLOCK_DUR,
        ease:       "power4.inOut",
      }, delay);
    });
  }
}

// One-liner for entry files
export function mountPageTransition() {
  return new PageTransition().mount();
}

// Helper for controllers — safe to call before or after mount.
// If mount hasn't happened yet, we retry once on the next frame.
export function signalPageReady() {
  if (SINGLETON) { SINGLETON.pageReady(); return; }
  requestAnimationFrame(() => SINGLETON?.pageReady());
}
