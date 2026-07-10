import "./hoverRoll.css";

/**
 * Wraps every [data-hover-roll] element with a two-line stacked text mask.
 * On hover each character translates up by 100% of its line-height with a
 * staggered delay so the copy "rolls in" from below with a fluid cascade.
 *
 * Primary text = element.textContent (or `data-hover-roll="..."` override).
 * Copy text    = `data-hover-roll-copy="..."`, defaults to the primary.
 */
export function initHoverRoll(root = document) {
  const els = root.querySelectorAll("[data-hover-roll]");
  els.forEach((el) => {
    if (el.dataset.hoverRollInit === "1") return;
    el.dataset.hoverRollInit = "1";

    const primary = (el.dataset.hoverRoll && el.dataset.hoverRoll.length
      ? el.dataset.hoverRoll
      : el.textContent
    ).trim();
    const copy = (el.dataset.hoverRollCopy || primary).trim();
    if (!primary) return;

    const build = (text) => Array.from(text).map((ch, i) => {
      const safe = ch === " " ? "&nbsp;" : escapeHtml(ch);
      return `<span class="hover-roll__char" style="--i:${i}">${safe}</span>`;
    }).join("");

    el.innerHTML = `
      <span class="hover-roll__mask" aria-hidden="true">
        <span class="hover-roll__line">${build(primary)}</span>
        <span class="hover-roll__line hover-roll__line--alt">${build(copy)}</span>
      </span>
      <span class="hover-roll__sr" style="position:absolute;left:-9999px;">${escapeHtml(primary)}</span>
    `;
  });
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
