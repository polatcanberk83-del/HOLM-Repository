import gsap from "gsap";
import "./menu.css";

// ─── Tunables ────────────────────────────────────────────────────────
const OPEN_DUR      = 0.55;
const CLOSE_DUR     = 0.42;
const OPEN_EASE     = "power3.out";
const CLOSE_EASE    = "power3.in";
const DIM_OPACITY   = 1.0;                         // css already sets 0.28 rgba
const DIM_FADE_DUR  = 0.35;
const ROW_STAGGER   = 0.055;
const ROW_DELAY     = 0.18;                        // after panel starts opening
const ROW_DUR       = 0.5;
const ICON_MORPH_DUR = 0.35;
const MAGNET_STRENGTH = 0.18;

const ROOMS = [
  {
    num:  "01",
    name: "Home",
    href: "/",
    match: (p) => p === "/" || p === "" || p === "/index.html",
  },
  {
    num:  "02",
    name: "Philosophy",
    href: "/philosophy/",
    match: (p) => p.startsWith("/philosophy"),
  },
  // About room parked — restore below Philosophy when about page ships.
  //   {
  //     num:  "03",
  //     name: "About",
  //     href: "/about/",
  //     match: (p) => p.startsWith("/about"),
  //   },
  {
    num:  "03",
    name: "Contact",
    href: "/contact/",
    match: (p) => p.startsWith("/contact"),
  },
];

// ─── Menu class ──────────────────────────────────────────────────────
export class Menu {
  constructor({ lenis } = {}) {
    this.lenis        = lenis || null;
    this.isOpen       = false;
    this.isAnimating  = false;
    this._prevFocus   = null;
    this._reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.container    = null;
    this.trigger      = null;
    this.diamondPath  = null;
    this.xPath1       = null;
    this.xPath2       = null;
    this.panel        = null;
    this.dim          = null;
    this.rowsInner    = [];
    this.links        = [];

    this._onKey   = this._onKey.bind(this);
    this._onClick = this._onClick.bind(this);
  }

  mount() {
    this._createDOM();
    this._bindEvents();
    this._setActive();
  }

  destroy() {
    document.removeEventListener("keydown", this._onKey);
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
  }

  // ── DOM ─────────────────────────────────────────────────────────
  _createDOM() {
    const container = document.createElement("div");
    container.className = "holm-menu";

    container.innerHTML = `
      <div class="holm-menu__dim" aria-hidden="true"></div>
      <button class="holm-menu__trigger"
              type="button"
              aria-expanded="false"
              aria-controls="holm-menu-panel"
              aria-label="Open menu">
        <svg class="holm-menu__icon" width="28" height="28" viewBox="0 0 40 40" fill="none">
          <path class="holm-menu__diamond"
                d="M20 6 L34 20 L20 34 L6 20 Z"
                stroke="currentColor" stroke-width="1.2"
                stroke-linejoin="round" fill="none"/>
          <path class="holm-menu__x1"
                d="M11 11 L29 29"
                stroke="currentColor" stroke-width="1.2"
                stroke-linecap="round" fill="none" opacity="0"/>
          <path class="holm-menu__x2"
                d="M29 11 L11 29"
                stroke="currentColor" stroke-width="1.2"
                stroke-linecap="round" fill="none" opacity="0"/>
        </svg>
      </button>
      <div class="holm-menu__panel"
           id="holm-menu-panel"
           role="dialog"
           aria-modal="false"
           aria-label="Museum rooms">
        <ol class="holm-menu__rooms">
          ${ROOMS.map((r, i) => `
            <li class="holm-menu__row" data-idx="${i}">
              <span class="holm-menu__row-inner">
                <a class="holm-menu__link" href="${r.href}" data-idx="${i}">
                  <span class="holm-menu__num">${r.num}</span>
                  <span class="holm-menu__name" data-hover-roll>${r.name}</span>
                </a>
              </span>
            </li>
          `).join("")}
        </ol>
      </div>
    `;
    document.body.appendChild(container);

    this.container   = container;
    this.trigger     = container.querySelector(".holm-menu__trigger");
    this.diamondPath = container.querySelector(".holm-menu__diamond");
    this.xPath1      = container.querySelector(".holm-menu__x1");
    this.xPath2      = container.querySelector(".holm-menu__x2");
    this.panel       = container.querySelector(".holm-menu__panel");
    this.dim         = container.querySelector(".holm-menu__dim");
    this.rowsInner   = [...container.querySelectorAll(".holm-menu__row-inner")];
    this.links       = [...container.querySelectorAll(".holm-menu__link")];

    // Initial rows: pushed below their row's overflow → hidden until reveal
    gsap.set(this.rowsInner, { yPercent: 110, opacity: 0 });
  }

  _setActive() {
    const path = window.location.pathname;
    const rows = this.container.querySelectorAll(".holm-menu__row");
    rows.forEach((row, i) => {
      row.classList.toggle("is-active", ROOMS[i].match(path));
    });
  }

  // ── Events ──────────────────────────────────────────────────────
  _bindEvents() {
    this.trigger.addEventListener("click", this._onClick);
    this.dim.addEventListener("click", () => this.close());
    document.addEventListener("keydown", this._onKey);

    // Magnetic hover on the trigger
    this.trigger.addEventListener("mousemove", (e) => {
      if (this.isOpen) return;
      const r = this.trigger.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width * 0.5);
      const dy = e.clientY - (r.top  + r.height * 0.5);
      gsap.to(this.trigger, {
        x: dx * MAGNET_STRENGTH,
        y: dy * MAGNET_STRENGTH,
        duration: 0.4,
        ease: "power2.out",
      });
    });
    this.trigger.addEventListener("mouseleave", () => {
      gsap.to(this.trigger, {
        x: 0, y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.5)",
      });
    });

    // Room link clicks
    this.links.forEach((link, i) => {
      link.addEventListener("click", (e) => {
        const room = ROOMS[i];
        if (room.match(window.location.pathname)) {
          e.preventDefault();
          this.close();
          if (this.lenis && typeof this.lenis.scrollTo === "function") {
            this.lenis.scrollTo(0, { duration: 1.4 });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
        // Otherwise the anchor handles navigation naturally.
      });
    });
  }

  _onClick() {
    this.toggle();
  }

  _onKey(e) {
    if (e.key === "Escape" && this.isOpen) {
      e.stopPropagation();
      this.close();
    }
  }

  // ── State transitions ───────────────────────────────────────────
  toggle() {
    if (this.isAnimating) return;
    this.isOpen ? this.close() : this.open();
  }

  open() {
    if (this.isAnimating || this.isOpen) return;
    this.isAnimating = true;
    this.isOpen      = true;
    this._prevFocus  = document.activeElement;
    this.trigger.setAttribute("aria-expanded", "true");
    this.trigger.setAttribute("aria-label", "Close menu");
    this.dim.style.pointerEvents = "auto";

    if (this._reducedMotion) {
      gsap.set(this.panel,      { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 });
      gsap.set(this.rowsInner,  { yPercent: 0, opacity: 1 });
      gsap.set(this.dim,        { opacity: DIM_OPACITY });
      gsap.set(this.diamondPath,{ opacity: 0 });
      gsap.set([this.xPath1, this.xPath2], { opacity: 1 });
      this.isAnimating = false;
      this._focusFirstLink();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;
        this._focusFirstLink();
      },
    });

    tl.to(this.dim, {
      opacity: DIM_OPACITY,
      duration: DIM_FADE_DUR,
      ease: "power2.out",
    }, 0);

    // Icon morph — diamond fades + rotates away, X fades + rotates in
    tl.to(this.diamondPath, {
      opacity: 0,
      rotation: 90,
      scale: 0.6,
      transformOrigin: "20px 20px",
      duration: ICON_MORPH_DUR,
      ease: "power2.in",
    }, 0);
    tl.fromTo([this.xPath1, this.xPath2], {
      rotation: -45,
      scale: 0.6,
      transformOrigin: "20px 20px",
    }, {
      opacity: 1,
      rotation: 0,
      scale: 1,
      duration: ICON_MORPH_DUR,
      ease: "power2.out",
    }, ICON_MORPH_DUR * 0.55);

    // Panel clip-path grows from the top-right (trigger's corner)
    tl.fromTo(this.panel, {
      clipPath: "inset(0% 0% 100% 100%)",
      opacity: 0,
    }, {
      clipPath: "inset(0% 0% 0% 0%)",
      opacity: 1,
      duration: OPEN_DUR,
      ease: OPEN_EASE,
    }, 0.05);

    // Row reveal stagger — after the panel clip finishes
    tl.to(this.rowsInner, {
      yPercent: 0,
      opacity: 1,
      duration: ROW_DUR,
      stagger: ROW_STAGGER,
      ease: "power3.out",
    }, 0.05 + ROW_DELAY);
  }

  close() {
    if (this.isAnimating || !this.isOpen) return;
    this.isAnimating = true;
    this.isOpen      = false;
    this.trigger.setAttribute("aria-expanded", "false");
    this.trigger.setAttribute("aria-label", "Open menu");

    if (this._reducedMotion) {
      gsap.set(this.panel,      { clipPath: "inset(0% 0% 100% 100%)", opacity: 0 });
      gsap.set(this.rowsInner,  { yPercent: 110, opacity: 0 });
      gsap.set(this.dim,        { opacity: 0 });
      gsap.set(this.diamondPath,{ opacity: 1, rotation: 0, scale: 1 });
      gsap.set([this.xPath1, this.xPath2], { opacity: 0, rotation: 0, scale: 1 });
      this.dim.style.pointerEvents = "none";
      this.isAnimating = false;
      this._restoreFocus();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        this.dim.style.pointerEvents = "none";
        this.isAnimating = false;
        this._restoreFocus();
      },
    });

    tl.to(this.rowsInner, {
      yPercent: 110,
      opacity: 0,
      duration: 0.25,
      stagger: { each: 0.025, from: "end" },
      ease: "power2.in",
    }, 0);

    tl.to(this.panel, {
      clipPath: "inset(0% 0% 100% 100%)",
      opacity: 0,
      duration: CLOSE_DUR,
      ease: CLOSE_EASE,
    }, 0.08);

    tl.to(this.dim, {
      opacity: 0,
      duration: DIM_FADE_DUR,
      ease: "power2.in",
    }, 0.12);

    // Icon morph back — X fades + rotates away, diamond rotates + fades in
    tl.to([this.xPath1, this.xPath2], {
      opacity: 0,
      rotation: -45,
      scale: 0.6,
      transformOrigin: "20px 20px",
      duration: ICON_MORPH_DUR * 0.8,
      ease: "power2.in",
    }, 0);
    tl.to(this.diamondPath, {
      opacity: 1,
      rotation: 0,
      scale: 1,
      duration: ICON_MORPH_DUR,
      ease: "power2.out",
    }, ICON_MORPH_DUR * 0.4);
  }

  // ── Focus management ────────────────────────────────────────────
  _focusFirstLink() {
    const first = this.panel.querySelector(".holm-menu__link");
    if (first) first.focus({ preventScroll: true });
  }
  _restoreFocus() {
    const target = this._prevFocus && this._prevFocus !== document.body
      ? this._prevFocus
      : this.trigger;
    target.focus({ preventScroll: true });
  }
}
