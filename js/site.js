/* Shared behaviour for every page: header, mobile menu, images, cards and enquiry forms. */
(function () {
  const { TOURS, CATEGORIES, COMPANY } = window.GAMA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Header & mobile menu ---------- */
  function initHeader() {
    const header = $(".site-header");
    if (!header) return;
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle("is-solid", y > 40);
      if (y > 600 && y > last + 4 && !document.body.classList.contains("menu-open")) header.classList.add("is-hidden");
      else if (y < last - 4 || y < 600) header.classList.remove("is-hidden");
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const toggle = $(".menu-toggle"), panel = $("#mobile-menu");
    if (!toggle || !panel) return;
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
      document.body.classList.toggle("menu-open", open);
      if (open) $("a", panel)?.focus();
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    panel.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
    });
    window.addEventListener("resize", () => { if (window.innerWidth > 960) setOpen(false); });
  }

  /* ---------- Images with illustrated fallback ---------- */
  function hydrateMedia(root = document) {
    $$(".media:not([data-ready])", root).forEach((fig) => {
      fig.dataset.ready = "1";
      fig.insertAdjacentHTML("afterbegin", window.GamaScene(fig.dataset.scene || "hills", +fig.dataset.seed || 1));
      const img = $("img", fig);
      const fail = () => {
        fig.classList.add("is-fallback");
        if (img) img.hidden = true;
      };
      if (!img || !img.getAttribute("src")) return fail();
      if (img.complete) img.naturalWidth ? fig.classList.add("is-loaded") : fail();
      img.addEventListener("load", () => fig.classList.add("is-loaded"));
      img.addEventListener("error", fail);
    });
  }

  function media(src, alt, scene, seed, cls = "", eager = false) {
    const img = src ? `<img src="${esc(src)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">` : "";
    return `<figure class="media ${cls}" data-scene="${esc(scene)}" data-seed="${seed}">${img}</figure>`;
  }

  /* ---------- Tour cards ---------- */
  const catLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

  const pad = (n) => String(n).padStart(2, "0");

  function tourCard(t, opts = {}) {
    const href = `tour.html#${t.slug}`;
    const tag = t.country === "Rwanda" ? catLabel(t.categories[0]) : `Beyond Rwanda · ${t.country}`;
    const days = t.days ? `<span class="tour-card__days"><b>${pad(t.days)}</b>${t.days === 1 ? "day" : "days"}</span>` : "";
    return `
      <article class="tour-card ${opts.cls || ""}" data-slug="${t.slug}">
        <a class="tour-card__media" href="${href}" tabindex="-1" aria-hidden="true">
          ${media(t.image, "", t.scene, t.seed)}
          ${days}
          <span class="tour-card__go" aria-hidden="true">↗</span>
        </a>
        <div class="tour-card__body">
          <p class="tour-card__tag">${esc(tag)}</p>
          <h3 class="tour-card__title"><a href="${href}">${esc(t.title)}</a></h3>
          <p class="tour-card__text">${esc(t.short)}</p>
          <p class="tour-card__meta"><span>${esc(t.region.split(" · ")[0])}</span><span>${esc(t.durationLabel)}</span>${t.price ? `<span class="tour-card__price">${esc(t.price.replace(", based on 2 sharing", ""))}</span>` : ""}</p>
        </div>
      </article>`;
  }

  /* ---------- Topographic contour art (the "thousand hills" motif) ---------- */
  function drawContours(root = document) {
    $$("svg[data-contours]", root).forEach((svg) => {
      const n = +svg.dataset.contours || 12, W = 1600, H = 1000;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
      let seed = n * 7 + 3;
      const r = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
      const centres = [[W * 0.72, H * 0.38], [W * 0.18, H * 0.82]];
      let d = "";
      centres.forEach(([cx, cy], ci) => {
        const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
        for (let i = 1; i <= n; i++) {
          const R = i * (ci ? 46 : 58);
          let p = "";
          for (let a = 0; a <= 64; a++) {
            const th = (a / 64) * Math.PI * 2;
            const k = 1 + 0.16 * Math.sin(3 * th + ph[0] + i * 0.15) + 0.09 * Math.sin(5 * th + ph[1]) + 0.05 * Math.sin(8 * th + ph[2] + i * 0.3);
            const x = cx + Math.cos(th) * R * k * 1.25, y = cy + Math.sin(th) * R * k * 0.85;
            p += (a ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
          }
          d += p + "Z";
        }
      });
      svg.innerHTML = `<path d="${d}" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
    });
  }

  /* ---------- Enquiry forms ---------- */
  const rules = {
    name: (v) => (v.trim().length >= 2 ? "" : "Please tell us your name."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter an email address like name@example.com."),
    phone: (v) => (!v.trim() || /^[+()\d\s-]{7,}$/.test(v.trim()) ? "" : "Use digits, spaces and an optional + country code."),
    month: (v) => (v ? "" : "Choose roughly when you'd like to travel."),
    travellers: (v) => (+v >= 1 && +v <= 60 ? "" : "Enter a group size between 1 and 60."),
    consent: (v, el) => (el.checked ? "" : "Please confirm we may contact you about this trip."),
  };

  function validateField(el) {
    const rule = rules[el.name];
    if (!rule) return true;
    const msg = rule(el.value, el);
    const err = document.getElementById(`${el.id}-error`);
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg;
    return !msg;
  }

  function initForms() {
    $$("form.enquiry").forEach((form) => {
      const status = $(".form-status", form);
      $$("input, select, textarea", form).forEach((el) => {
        el.addEventListener("blur", () => { if (el.value || el.type === "checkbox") validateField(el); });
        el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") validateField(el); });
      });
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fields = $$("input, select, textarea", form);
        const bad = fields.filter((el) => !validateField(el));
        if (bad.length) {
          status.className = "form-status is-error";
          status.innerHTML = `<strong>${bad.length === 1 ? "One detail needs" : bad.length + " details need"} attention.</strong> Check the highlighted fields and try again.`;
          bad[0].focus();
          return;
        }
        const data = Object.fromEntries(new FormData(form));
        const tourTitle = form.dataset.tour ? TOURS.find((t) => t.slug === form.dataset.tour)?.officialTitle : data.interest;
        const lines = [
          `Hello Gama, I'd like to plan a trip.`,
          tourTitle ? `Tour: ${tourTitle}` : "",
          `Name: ${data.name}`,
          `When: ${data.month}`,
          `Travellers: ${data.travellers}`,
          data.message ? `Notes: ${data.message}` : "",
        ].filter(Boolean);
        const wa = `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
        status.className = "form-status is-demo";
        status.innerHTML = `
          <strong>Your details look good, ${esc(data.name.split(" ")[0])}.</strong>
          This is a design prototype, so the form is not connected to Gama's inbox yet and nothing has been sent.
          To reach the team today, send the same details on WhatsApp:
          <a class="btn btn--small" href="${wa}" target="_blank" rel="noopener">Open WhatsApp with this message</a>`;
        status.focus();
      });
    });
  }

  /* ---------- Gentle reveal on scroll (content is visible by default) ---------- */
  function initReveal() {
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight) { el.classList.add("is-pending"); io.observe(el); }
    });
  }

  /* ---------- Copy buttons for phone numbers ---------- */
  function initCopy() {
    document.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-copy]");
      if (!b) return;
      const text = b.dataset.copy;
      try { await navigator.clipboard.writeText(text); b.dataset.state = "Copied"; }
      catch { b.dataset.state = "Select & copy"; const r = document.createRange(); const t = b.previousElementSibling; if (t) { r.selectNodeContents(t); getSelection().removeAllRanges(); getSelection().addRange(r); } }
      setTimeout(() => delete b.dataset.state, 1800);
    });
  }


  /* ---------- Fill shared selects ---------- */
  function fillSelects() {
    const { DURATIONS } = window.GAMA;
    $$('select[data-fill="months"]').forEach((sel) => {
      const now = new Date();
      const opts = ['<option value="">Choose a month</option>'];
      for (let i = 0; i < 15; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const label = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
        opts.push(`<option>${label}</option>`);
      }
      opts.push("<option>My dates are flexible</option>");
      sel.innerHTML = opts.join("");
    });
    $$('select[data-fill="categories"]').forEach((sel) => {
      sel.innerHTML = CATEGORIES.map((c) => `<option value="${c.id}">${c.id === "all" ? "Any style" : esc(c.label)}</option>`).join("");
    });
    $$('select[data-fill="durations"]').forEach((sel) => {
      sel.innerHTML = DURATIONS.map((d) => `<option value="${d.id}">${esc(d.label)}</option>`).join("");
    });
    $$('select[data-fill="interest"]').forEach((sel) => {
      const services = ["Custom trip", "Group tour", "Night camping", "Air ticketing", "Visa assistance", "Cross-border tour"];
      sel.innerHTML =
        '<option value="Not sure yet">Not sure yet, help me choose</option>' +
        `<optgroup label="Tours">${TOURS.map((t) => `<option value="${esc(t.officialTitle)}">${esc(t.title)}</option>`).join("")}</optgroup>` +
        `<optgroup label="Services">${services.map((s) => `<option>${s}</option>`).join("")}</optgroup>`;
    });
  }

  /* ---------- Kigali clock (Africa/Kigali, UTC+2) ---------- */
  function initClock() {
    const els = $$("[data-kigali-time]");
    if (!els.length) return;
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Kigali" });
    const tick = () => els.forEach((el) => (el.textContent = fmt.format(new Date())));
    tick(); setInterval(tick, 20000);
  }

  window.GamaUI = { $, $$, esc, media, tourCard, hydrateMedia, catLabel, fillSelects, drawContours, pad };

  document.addEventListener("DOMContentLoaded", () => {
    fillSelects();
    drawContours();
    initClock();
    initHeader();
    initForms();
    initCopy();
    hydrateMedia();
    initReveal();
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  });
})();
