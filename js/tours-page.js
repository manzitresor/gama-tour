/* Tours & destinations: filter chips + length select, kept in sync with the URL hash. */
document.addEventListener("DOMContentLoaded", () => {
  const { TOURS, CATEGORIES, DURATIONS } = window.GAMA;
  const { $, tourCard, hydrateMedia } = window.GamaUI;

  const grid = $("#tour-grid"), chips = $("#chips"), lenSel = $("#length"), count = $("#results-count"), reset = $("#reset");
  const state = { cat: "all", len: "any" };

  const matches = (t, cat, len) => {
    if (cat !== "all" && !t.categories.includes(cat)) return false;
    if (len !== "any") {
      const d = DURATIONS.find((x) => x.id === len);
      if (!t.days || !d.test(t.days)) return false;
    }
    return true;
  };

  function readHash() {
    const [cat, len] = decodeURIComponent(location.hash.slice(1)).split("--");
    state.cat = CATEGORIES.some((c) => c.id === cat) ? cat : "all";
    state.len = DURATIONS.some((d) => d.id === len) ? len : "any";
  }

  function writeHash() {
    const parts = [];
    if (state.cat !== "all" || state.len !== "any") parts.push(state.cat);
    if (state.len !== "any") parts.push(state.len);
    const h = parts.length ? "#" + parts.join("--") : " ";
    try { history.replaceState(null, "", h === " " ? location.pathname : h); } catch { /* sandboxed */ }
  }

  function render() {
    chips.innerHTML = CATEGORIES.map((c) => {
      const n = TOURS.filter((t) => matches(t, c.id, state.len)).length;
      return `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="${c.id === state.cat}">${c.label}<span class="n">${n}</span></button>`;
    }).join("");
    lenSel.value = state.len;

    const list = TOURS.filter((t) => matches(t, state.cat, state.len));
    const label = CATEGORIES.find((c) => c.id === state.cat).label;
    count.textContent = list.length
      ? `Showing ${list.length} ${list.length === 1 ? "journey" : "journeys"}${state.cat === "all" ? "" : " · " + label}${state.len === "any" ? "" : " · " + DURATIONS.find((d) => d.id === state.len).label}`
      : "No journeys match these filters";
    reset.hidden = state.cat === "all" && state.len === "any";

    grid.innerHTML = list.length
      ? list.map((t, i) => tourCard(t, { cls: i === 0 && list.length > 2 && list.length % 3 === 2 ? "tour-card--feature" : "" })).join("")
      : `<div class="empty-state"><h3>Nothing here yet.</h3><p class="muted">Try another length, or ask us to build this trip for you.</p><div class="hero__actions" style="justify-content:center"><button class="btn btn--line btn--small" type="button" data-reset>Show all journeys</button><a class="btn btn--small" href="index.html#plan">Plan a custom trip</a></div></div>`;
    hydrateMedia(grid);
  }

  chips.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    state.cat = b.dataset.cat;
    writeHash(); render();
    chips.querySelector(`[data-cat="${state.cat}"]`)?.focus();
  });
  lenSel.addEventListener("change", () => { state.len = lenSel.value; writeHash(); render(); });
  const clear = () => { state.cat = "all"; state.len = "any"; writeHash(); render(); };
  reset.addEventListener("click", clear);
  grid.addEventListener("click", (e) => { if (e.target.closest("[data-reset]")) clear(); });
  window.addEventListener("hashchange", () => { readHash(); render(); });

  readHash();
  render();
});
