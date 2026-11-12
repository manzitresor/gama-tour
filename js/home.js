/* Homepage: featured tours, destination index, trip finder, service shortcuts. */
document.addEventListener("DOMContentLoaded", () => {
  const { TOURS } = window.GAMA;
  const { $, $$, tourCard, hydrateMedia } = window.GamaUI;

  // Featured journeys: one lead story and three supporting cards
  const featured = $("#featured");
  if (featured) {
    const slugs = featured.dataset.featured.split(",");
    const [lead, ...rest] = slugs.map((s) => TOURS.find((t) => t.slug === s)).filter(Boolean);
    featured.innerHTML = `
      <div class="featured__main">${tourCard(lead)}</div>
      <div class="featured__side">${rest.map((t) => tourCard(t)).join("")}</div>`;
    hydrateMedia(featured);
  }
  $$("[data-count-link]").forEach((a) => (a.textContent = `See all ${TOURS.length} journeys`));

  // Destination index: hovering or focusing a row changes the large photo
  const items = $$(".dest-item");
  const frames = $$(".dest-stage .media");
  const activate = (key) => {
    items.forEach((li) => li.classList.toggle("is-active", li.dataset.dest === key));
    frames.forEach((f) => f.classList.toggle("is-active", f.dataset.dest === key));
  };
  items.forEach((li) => {
    li.addEventListener("mouseenter", () => activate(li.dataset.dest));
    li.addEventListener("focusin", () => activate(li.dataset.dest));
  });

  // Trip finder -> tours page with filters in the hash, e.g. tours.html#primates--short
  const finder = $("#finder");
  finder?.addEventListener("submit", (e) => {
    e.preventDefault();
    const style = $("#finder-style").value, len = $("#finder-length").value;
    const parts = [style];
    if (len !== "any") parts.push(len);
    window.location.href = `tours.html#${parts.join("--")}`;
  });

  // "Ask about ..." on service cards pre-selects the enquiry topic
  $$("[data-interest]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const sel = $("#plan-interest");
      if (sel) sel.value = btn.dataset.interest;
      $("#plan").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      setTimeout(() => $("#plan-name")?.focus({ preventScroll: true }), 600);
    })
  );
});
