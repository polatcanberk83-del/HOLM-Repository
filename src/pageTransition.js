import { TransitionVeil } from "./transitionVeil.js";

// ─── Page transition — Sobel dissolve + diamond hold ───────────────
// A WebGL veil covers the current page from the top-left corner with a
// noisy-edged debris dissolve. Once the cover saturates, the entry
// loader's brilliant-cut diamond fades in and spins while the browser
// navigates. On the destination page the veil comes up already covered
// with the diamond present; when the controller signals ready, the
// diamond fades out and the dissolve retracts back into the top-left.
//
// Runtime API (mount / leave / pageReady / signalPageReady) is
// deliberately identical to the previous CSS-grid implementation so
// every page entry point that already calls signalPageReady() keeps
// working without changes.

const FLAG_KEY = "holm:transition";

// Max time we'll hold the cover on the new page waiting for the
// controller to call pageReady(). If it never fires (say, a page
// controller crashed) we still reveal so the visitor isn't stuck.
const MAX_HOLD_MS = 6000;

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

export class PageTransition {
  constructor() {
    this.veil          = null;
    this._navigating   = false;
    this._entering     = false;
    this._pendingEnter = false;   // veil covered on new page waiting for pageReady()
    this._readyFired   = false;
    this._holdTimer    = null;
    this._onClick      = this._onClick.bind(this);
    this._reducedMotion = false;
  }

  mount() {
    if (SINGLETON) return SINGLETON;
    SINGLETON = this;

    this._reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.addEventListener("click", this._onClick, true);

    const arrivedViaTransition = sessionStorage.getItem(FLAG_KEY) === "1";
    if (arrivedViaTransition) {
      sessionStorage.removeItem(FLAG_KEY);
      // Mount the veil already at full cover + diamond visible. Wait
      // for the page's controller to call pageReady() before running
      // reveal(). Safety timer bails if that never happens.
      this.veil = new TransitionVeil();
      this.veil.mount({ initialCovered: true });
      this._pendingEnter = true;
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
    // Small delay so the first paint of the new page has time to
    // settle behind the cover before the reveal begins.
    requestAnimationFrame(() => this._playEnter());
  }

  destroy() {
    document.removeEventListener("click", this._onClick, true);
    if (this.veil) { this.veil.destroy(); this.veil = null; }
    if (SINGLETON === this) SINGLETON = null;
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
  async leave(nextPath) {
    if (this._navigating) return;
    this._navigating = true;
    document.documentElement.style.overflow = "hidden";

    // Warm the destination HTML cache while the veil animates — cuts
    // down "hang time" between navigate + the new page's first paint.
    try {
      fetch(nextPath, { credentials: "same-origin", cache: "reload" }).catch(() => {});
    } catch (_) { /* noop */ }

    if (this._reducedMotion) {
      sessionStorage.setItem(FLAG_KEY, "1");
      window.location.href = nextPath;
      return;
    }

    // Mount veil in clear state, then animate cover in. Kick navigate
    // once the diamond has been visible for a beat so the visitor
    // registers it before the browser tears down the current page.
    if (!this.veil) {
      this.veil = new TransitionVeil();
      this.veil.mount({ initialCovered: false });
    }
    await this.veil.cover();
    sessionStorage.setItem(FLAG_KEY, "1");
    window.location.href = nextPath;
  }

  // ── Private: reveal the incoming page ────────────────────────────
  async _playEnter() {
    if (this._entering) return;
    this._entering = true;

    if (this._reducedMotion) {
      if (this.veil) { this.veil.destroy(); this.veil = null; }
      this._entering = false;
      document.documentElement.classList.remove("holm-entering");
      document.documentElement.style.overflow = "";
      return;
    }

    if (this.veil) {
      await this.veil.reveal();
      this.veil.destroy();
      this.veil = null;
    }

    this._entering = false;
    // Drop the "keep the page covered" class the inline <head> script
    // added on load so the base bg color no longer overrides.
    document.documentElement.classList.remove("holm-entering");
    document.documentElement.style.overflow = "";
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
