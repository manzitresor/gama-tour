/* Tour detail: renders one tour from the catalogue, chosen by the URL hash (tour.html#slug). */
document.addEventListener("DOMContentLoaded", () => {
  const { TOURS, COMPANY } = window.GAMA;
  const { $, $$, esc, media, tourCard, hydrateMedia, catLabel } = window.GamaUI;
  const TBC = '<span class="tbc">To be confirmed</span>';

  function current() {
    let h = decodeURIComponent(location.hash.slice(1));
    const wantsForm = h.endsWith("-enquire");
    if (wantsForm) h = h.slice(0, -"-enquire".length);
    return { tour: TOURS.find((t) => t.slug === h), wantsForm };
  }

  let shown = null;
  function render() {
    const cur = current();
    if (!cur.tour && shown) return; // e.g. #main from the skip link: keep the current tour
    const t = cur.tour || TOURS[0], wantsForm = cur.wantsForm;
    shown = t.slug;
    document.title = `${t.title} · Gama Travel & Tour Agency`;
    $('meta[name="description"]')?.setAttribute("content", `${t.short} ${t.durationLabel}. Enquire with Gama Travel & Tour Agency, Kigali.`);

    $("#tour-hero-media").innerHTML = media(t.image, t.title, t.scene, t.seed, "", true);
    $("#tour-hero-media").firstElementChild.style.cssText = "position:absolute;inset:0;z-index:-2";
    $("#crumb-current").textContent = t.title;
    $("#tour-region").textContent = t.region;
    $("#tour-title").textContent = t.title;
    $("#tour-short").textContent = t.short;
    const waText = encodeURIComponent(`Hello Gama, I'm interested in: ${t.officialTitle}`);
    $("#tour-wa").href = `https://wa.me/${COMPANY.whatsapp}?text=${waText}`;

    const fact = (k, v, cls = "") => `<div><dt>${k}</dt><dd class="${v ? cls : "tbc"}">${v ? esc(v) : "To be confirmed"}</dd></div>`;
    $("#tour-facts").innerHTML = [
      fact("Duration", t.durationLabel.includes("confirmed") ? null : t.durationLabel),
      fact("Destination", t.country === "Rwanda" ? t.region.split(" · ")[0] : `${t.country} · ${t.region.split(" · ")[0]}`),
      fact("Group size", t.group),
      fact("Starts", t.start),
      fact("Guiding", t.guide),
      fact("Price", t.price || "On request", t.price ? "price" : ""),
    ].join("");

    const sections = [];
    if (t.detail === "summary") {
      sections.push(`<div class="notice"><span class="placeholder-tag">Itinerary to be supplied</span><h3>Full day-by-day plan available on request</h3><p>Gama currently publishes only the title of this journey. In the finished site this page would carry the full overview, itinerary, inclusions and photography, supplied by the Gama team. Until then, send an enquiry and a trip planner will share the details.</p></div>`);
    }
    if (t.overview.length) {
      sections.push(`<section aria-labelledby="ov"><p class="eyebrow">Overview</p><h2 id="ov" style="margin-top:12px">${t.detail === "full" ? "About this journey" : ""}</h2><div class="prose">${t.overview.map((p) => `<p>${esc(p)}</p>`).join("")}</div></section>`);
    }
    if (t.highlights.length) {
      sections.push(`<section aria-labelledby="hl"><p class="eyebrow">Highlights</p><h2 id="hl" style="margin-top:12px">What you'll experience</h2><ul class="highlights">${t.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></section>`);
    }
    if (t.itinerary.length) {
      const timed = t.itinerary.length === 1;
      sections.push(`<section aria-labelledby="it"><p class="eyebrow">Itinerary</p><h2 id="it" style="margin-top:12px">${timed ? "How the day unfolds" : "Day by day"}</h2>
        <ol class="itinerary ${timed ? "timed" : ""}">${t.itinerary.map((d, i) => `
          <li class="day"><div class="day__no"><span><small>${timed ? "One" : "Day"}</small><b>${timed ? "day" : i + 1}</b></span></div>
          <div><h3>${esc(d.title)}</h3><ul>${d.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></li>`).join("")}
        </ol></section>`);
    } else if (t.detail === "full") {
      sections.push(`<div class="notice"><span class="placeholder-tag">Itinerary to be supplied</span><h3>Day-by-day plan</h3><p>The current website lists highlights for this trip but no daily plan. Gama's team would supply the itinerary for this section.</p></div>`);
    }
    const gal = [{ src: t.image, scene: t.scene, alt: t.title }, ...t.gallery].filter((g) => g.src);
    if (gal.length > 1) {
      const g = gal.slice(0, 3);
      sections.push(`<section aria-labelledby="gl"><p class="eyebrow">Gallery</p><h2 id="gl" style="margin-top:12px">In pictures</h2>
        <div class="tour-gallery ${g.length === 2 ? "tour-gallery--2" : ""}">${g.map((x, i) => media(x.src, x.alt, x.scene, t.seed + i + 1)).join("")}</div></section>`);
    }
    sections.push(`<section aria-labelledby="gk"><p class="eyebrow">Good to know</p><h2 id="gk" style="margin-top:12px">Before you travel</h2>
      <div class="know">
        <div class="notice"><span class="placeholder-tag">To be supplied</span><h3>What's included</h3><p>Transport, accommodation, meals, permits and guiding, as confirmed by Gama for this tour.</p></div>
        <div class="notice"><span class="placeholder-tag">To be supplied</span><h3>Not included</h3><p>Items such as international flights, visas, tips and optional activities.</p></div>
        <div class="notice"><h3>Flights &amp; visas</h3><p>Gama's air ticketing and visa assistance can be added to this trip. Mention it in your enquiry.</p></div>
      </div></section>`);
    $("#tour-main").innerHTML = sections.join("");

    $("#aside-price").className = "price-line" + (t.price ? "" : " tbc");
    $("#aside-price").textContent = t.price || "Price on request. Quotes depend on dates, group size and accommodation.";
    $("#tour-source").innerHTML = `${t.detail === "full" ? "Tour details as published by Gama" : "Tour title as published by Gama"} on <a href="${t.source}" target="_blank" rel="noopener">gamatour.agency</a>${t.price ? ". Price as listed on the current site; confirm before launch." : "."}`;
    $("#enquire-tour").textContent = t.title;
    $("#bar-title").textContent = t.title;
    $("#bar-price").textContent = t.price || "Price on request";

    const form = $("form.enquiry");
    form.dataset.tour = t.slug;
    form.reset();
    $(".form-status", form).innerHTML = "";
    $(".form-status", form).className = "form-status";
    $$("[aria-invalid]", form).forEach((el) => el.removeAttribute("aria-invalid"));
    $$(".field-error", form).forEach((el) => (el.textContent = ""));

    // Related: same first category first, then anything else, excluding this tour
    const rel = TOURS.filter((x) => x.slug !== t.slug)
      .map((x) => ({ x, score: x.categories.filter((c) => t.categories.includes(c)).length + (x.detail === "full" ? 0.5 : 0) }))
      .sort((a, b) => b.score - a.score).slice(0, 3).map((r) => r.x);
    $("#related").innerHTML = rel.map((x) => tourCard(x)).join("");

    hydrateMedia(document);
    if (wantsForm) setTimeout(() => $("#enquire").scrollIntoView(), 50);
    else window.scrollTo(0, 0);
  }

  // Smooth scroll for in-page "Enquire" buttons
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-scroll]");
    if (!a) return;
    e.preventDefault();
    $("#" + a.dataset.scroll).scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setTimeout(() => $("#tour-name")?.focus({ preventScroll: true }), 600);
  });

  // Mobile sticky enquiry bar: visible after the hero, hidden at the form
  const bar = $("#mobile-bar");
  const update = () => {
    const enq = $("#enquire").getBoundingClientRect();
    bar.classList.toggle("is-visible", window.scrollY > 480 && enq.top > window.innerHeight * 0.6);
  };
  window.addEventListener("scroll", update, { passive: true });

  window.addEventListener("hashchange", render);
  render();
  update();
});
