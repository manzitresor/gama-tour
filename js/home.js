/* Homepage: hero rotator, manifesto scrub, Rwanda map, journeys rail, trip builder, gallery lightbox. */
document.addEventListener("DOMContentLoaded", () => {
  const { TOURS, IMG } = window.GAMA;
  const { $, $$, esc, media, tourCard, hydrateMedia, pad } = window.GamaUI;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const byslug = (s) => TOURS.find((t) => t.slug === s);

  /* ---------- Hero word rotator ---------- */
  const rot = $("[data-rotate]");
  if (rot && !reduce) {
    const words = rot.dataset.rotate.split("|");
    let i = 0;
    setInterval(() => {
      rot.classList.add("is-out");
      setTimeout(() => { i = (i + 1) % words.length; rot.textContent = words[i]; rot.classList.remove("is-out"); }, 420);
    }, 2600);
  }

  /* ---------- Hero parallax ---------- */
  const heroMedia = $(".hero__media");
  if (heroMedia && !reduce) {
    const onScroll = () => {
      const y = Math.min(window.scrollY, window.innerHeight);
      heroMedia.style.transform = `translate3d(0, ${y * 0.28}px, 0) scale(${1 + y / 6000})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Manifesto: words light up as you scroll ---------- */
  const scrub = $("[data-scrub]");
  if (scrub) {
    const words = scrub.textContent.trim().split(/\s+/);
    scrub.innerHTML = words.map((w) => `<span>${esc(w)}</span>`).join(" ");
    const spans = $$("span", scrub);
    const update = () => {
      const r = scrub.getBoundingClientRect(), vh = window.innerHeight;
      const p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle("on", i < lit));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- Rwanda map ---------- */
  const DESTS = [
    { key: "volcanoes", name: "Volcanoes National Park", dir: "North", time: "≈ 2.5 h", lon: 29.53, lat: -1.47, scene: "volcano", seed: 11,
      img: IMG + "2025/08/rwanda-gorilla-tours-750x450-1.jpg", desc: "Mountain gorillas, golden monkeys and the Virunga volcano chain, guided by park rangers.",
      tours: ["volcanoes-gorillas", "tembera-u-rwanda-7-day"], more: "tours.html#primates" },
    { key: "twin", name: "Burera & Ruhondo", dir: "North", time: "≈ 2.5 h", lon: 29.8, lat: -1.5, scene: "lake", seed: 9,
      img: IMG + "2026/03/Twin-lakes-of-Burera-and-Ruhondo-2.jpg", desc: "Twin lakes beneath the volcanoes: boat rides, fishing villages and grey crowned cranes.",
      tours: ["twin-lakes-burera-ruhondo"], more: "tours.html#lakes" },
    { key: "kivu", name: "Lake Kivu", dir: "West", time: "≈ 3 h", lon: 29.36, lat: -2.02, scene: "lake", seed: 5,
      img: IMG + "2025/08/Rwanda-Congo-Nile-Trail-Lake-Kivu-1024x576.webp", desc: "Island boat trips, hot springs and long lakeside sunsets in Karongi and Rubavu.",
      tours: ["lake-kivu-escape", "tembera-u-rwanda-7-day"], more: "tours.html#lakes" },
    { key: "kigali", name: "Kigali", dir: "Centre", time: "Start here", lon: 30.06, lat: -1.95, scene: "city", seed: 2, hub: true,
      img: IMG + "2026/05/Rwanda_upscayl_4x_realesrgan-x4plus-1024x576.png", desc: "Memorials, museums, eco-parks and rooftops. Every Gama journey begins and ends here.",
      tours: ["kigali-city-tour", "nyandungu-eco-park", "museums-5-day"], more: "tours.html#culture" },
    { key: "akagera", name: "Akagera National Park", dir: "East", time: "≈ 2.5 h", lon: 30.6, lat: -1.75, scene: "savanna", seed: 7,
      img: IMG + "2025/08/akagera-rwanda-1-1024x524.jpg", desc: "Rwanda's savannah and its Big Five country, with boat safaris on Lake Ihema.",
      tours: ["akagera-classic-safari", "tembera-u-rwanda-7-day"], more: "tours.html#wildlife" },
    { key: "nyungwe", name: "Nyungwe Forest", dir: "Southwest", time: "≈ 5 h", lon: 29.3, lat: -2.47, scene: "forest", seed: 3,
      img: IMG + "2026/01/canopy-walk-nyungwe-750x450-1.jpeg", desc: "Chimpanzees, 300+ bird species and a canopy walkway 60 m above the forest floor.",
      tours: ["nyungwe-3-day", "tembera-u-rwanda-7-day"], more: "tour.html#nyungwe-3-day" },
    { key: "beyond", name: "Beyond Rwanda", dir: "Uganda & the region", time: "Cross-border", lon: 29.92, lat: -1.12, scene: "savanna", seed: 21, edge: true,
      img: IMG + "2026/01/The-Majestic-Murchison-Falls-in-Uganda-1024x576.jpg", desc: "Gorillas in Bwindi, Lake Bunyonyi and longer itineraries across Uganda, Kenya, Tanzania and Burundi.",
      tours: ["western-uganda-5-day", "uganda-14-day"], more: "tours.html#crossborder" },
  ];

  const svg = $("#rwanda-map");
  if (svg) {
    const P = ([lon, lat]) => [((lon - 28.7) * 280).toFixed(1), ((-lat - 0.98) * 280).toFixed(1)];
    const path = (pts) => "M" + pts.map((p) => P(p).join(" ")).join(" L") + " Z";
    const smooth = (pts) => {
      const q = pts.map(P).map((a) => a.map(Number));
      let d = `M${q[0][0]} ${q[0][1]}`;
      for (let i = 0; i < q.length; i++) {
        const a = q[i], b = q[(i + 1) % q.length];
        d += ` Q${a[0]} ${a[1]} ${((a[0] + b[0]) / 2).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)}`;
      }
      return d + " Z";
    };
    const RW = [[29.26, -1.67], [29.36, -1.52], [29.45, -1.43], [29.58, -1.39], [29.72, -1.37], [29.85, -1.38], [30.0, -1.43], [30.12, -1.3], [30.27, -1.12], [30.36, -1.06], [30.47, -1.06], [30.55, -1.25], [30.68, -1.42], [30.8, -1.6], [30.84, -1.85], [30.85, -2.08], [30.89, -2.32], [30.79, -2.39], [30.57, -2.41], [30.42, -2.32], [30.2, -2.38], [30.0, -2.35], [29.92, -2.6], [29.72, -2.8], [29.45, -2.82], [29.22, -2.7], [29.02, -2.74], [28.9, -2.6], [28.9, -2.47], [29.05, -2.3], [29.24, -2.16], [29.33, -2.05], [29.3, -1.86], [29.24, -1.73]];
    const KIVU = [[29.25, -1.68], [29.12, -1.62], [28.98, -1.72], [28.86, -1.95], [28.78, -2.15], [28.82, -2.36], [28.9, -2.47], [29.05, -2.3], [29.24, -2.16], [29.33, -2.05], [29.3, -1.86]];
    const kig = P([30.06, -1.95]);

    let html = `
      <defs>
        <radialGradient id="landGlow" cx="55%" cy="45%" r="70%"><stop offset="0" stop-color="#2A4234"/><stop offset="1" stop-color="#16231C"/></radialGradient>
        <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="7" stroke="#7FA7B0" stroke-width="1" opacity=".35"/></pattern>
        <clipPath id="landClip"><path d="${smooth(RW)}"/></clipPath>
      </defs>
      <path class="map-water" d="${smooth(KIVU)}"/>
      <text class="map-water-label" x="${P([28.93, -2.05])[0]}" y="${P([28.93, -2.05])[1]}" transform="rotate(-70 ${P([28.93, -2.05]).join(" ")})">LAKE KIVU</text>
      <path class="map-land" d="${smooth(RW)}"/>
      <g clip-path="url(#landClip)" class="map-contours">${Array.from({ length: 9 }, (_, i) => `<ellipse cx="${P([29.62, -1.5])[0]}" cy="${P([29.62, -1.5])[1]}" rx="${30 + i * 34}" ry="${20 + i * 24}"/>`).join("")}${Array.from({ length: 6 }, (_, i) => `<ellipse cx="${P([29.35, -2.5])[0]}" cy="${P([29.35, -2.5])[1]}" rx="${24 + i * 30}" ry="${18 + i * 22}"/>`).join("")}</g>
      <path class="map-border" d="${smooth(RW)}"/>
      <text class="map-country" x="${P([29.5, -1.15])[0]}" y="${P([29.5, -1.15])[1]}">UGANDA</text>
      <text class="map-country" x="${P([30.95, -1.95])[0]}" y="${P([30.95, -1.95])[1]}" text-anchor="end" transform="rotate(90 ${P([30.95, -1.95]).join(" ")})">TANZANIA</text>
      <text class="map-country" x="${P([29.5, -3.02])[0]}" y="${P([29.5, -3.02])[1]}">BURUNDI</text>
      <text class="map-country" x="${P([28.75, -1.4])[0]}" y="${P([28.75, -1.4])[1]}">DR CONGO</text>
      <g class="map-routes">`;
    DESTS.filter((d) => !d.hub).forEach((d) => {
      const [x, y] = P([d.lon, d.lat]);
      const mx = ((+kig[0] + +x) / 2 + (+y - +kig[1]) * 0.18).toFixed(1), my = ((+kig[1] + +y) / 2 - (+x - +kig[0]) * 0.18).toFixed(1);
      html += `<path data-route="${d.key}" d="M${kig[0]} ${kig[1]} Q${mx} ${my} ${x} ${y}"/>`;
    });
    html += `</g><g class="map-pins">`;
    DESTS.forEach((d, i) => {
      const [x, y] = P([d.lon, d.lat]);
      const left = d.lon < 29.6 && !d.edge;
      html += `
        <g class="pin ${d.hub ? "pin--hub" : ""} ${d.edge ? "pin--edge" : ""}" data-key="${d.key}" tabindex="0" role="button" aria-label="${esc(d.name)}, ${esc(d.time)}" transform="translate(${x} ${y})">
          <circle class="pin__pulse" r="16"/>
          <circle class="pin__ring" r="11"/>
          <circle class="pin__dot" r="${d.hub ? 6 : 4.5}"/>
          ${d.edge ? '<path class="pin__arrow" d="M-5 -16 L0 -24 L5 -16"/>' : ""}
          <text class="pin__label" x="${left ? -18 : 18}" y="5" text-anchor="${left ? "end" : "start"}">${esc(d.edge ? "Beyond Rwanda" : d.name.replace(" National Park", "").replace(" Forest", ""))}</text>
          <text class="pin__no" x="${left ? -18 : 18}" y="-11" text-anchor="${left ? "end" : "start"}">${pad(i + 1)}</text>
        </g>`;
    });
    html += `</g>`;
    svg.innerHTML = html;

    const panel = $("#atlas-panel"), tabs = $("#atlas-tabs");
    tabs.innerHTML = DESTS.map((d, i) => `<button type="button" role="tab" data-key="${d.key}"><span>${pad(i + 1)}</span>${esc(d.edge ? "Beyond Rwanda" : d.name.replace(" National Park", ""))}</button>`).join("");

    const select = (key, focusPanel) => {
      const d = DESTS.find((x) => x.key === key) || DESTS[0];
      $$(".pin", svg).forEach((p) => p.classList.toggle("is-active", p.dataset.key === d.key));
      $$("[data-route]", svg).forEach((p) => p.classList.toggle("is-active", p.dataset.route === d.key));
      $$("button", tabs).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.key === d.key)));
      const ts = d.tours.map(byslug).filter(Boolean);
      panel.innerHTML = `
        <div class="atlas__card">
          ${media(d.img, d.name, d.scene, d.seed, "atlas__photo")}
          <div class="atlas__body">
            <p class="atlas__meta"><span>${esc(d.dir)}</span><span>${esc(d.time)}</span></p>
            <h3>${esc(d.name)}</h3>
            <p>${esc(d.desc)}</p>
            <ul class="atlas__tours">${ts.map((t) => `<li><a href="tour.html#${t.slug}"><span>${esc(t.title)}</span><small>${esc(t.durationLabel)}</small></a></li>`).join("")}</ul>
            <a class="link-arrow" href="${d.more}">Explore ${esc(d.edge ? "cross-border trips" : d.name.replace(" National Park", ""))}</a>
          </div>
        </div>`;
      hydrateMedia(panel);
      if (focusPanel) panel.querySelector("h3")?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    };
    svg.addEventListener("click", (e) => { const p = e.target.closest(".pin"); if (p) select(p.dataset.key); });
    svg.addEventListener("mouseover", (e) => { const p = e.target.closest(".pin"); if (p && matchMedia("(hover: hover)").matches) select(p.dataset.key); });
    svg.addEventListener("keydown", (e) => { const p = e.target.closest(".pin"); if (p && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); select(p.dataset.key); } });
    tabs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) select(b.dataset.key, window.innerWidth < 900); });
    select("volcanoes");

    // Draw routes when the map enters view
    const atlas = $(".atlas");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { atlas.classList.add("is-drawn"); io.disconnect(); } }, { threshold: 0.25 });
      io.observe(atlas);
    } else atlas.classList.add("is-drawn");
  }

  /* ---------- Journeys rail ---------- */
  const rail = $("#rail");
  if (rail) {
    const list = rail.dataset.featured.split(",").map(byslug).filter(Boolean);
    rail.innerHTML = list.map((t, i) => `<div class="rail__item"><span class="rail__index">${pad(i + 1)} / ${pad(list.length)}</span>${tourCard(t, { cls: "tour-card--tall" })}</div>`).join("");
    hydrateMedia(rail);
    const bar = $("#rail-bar");
    const step = () => (rail.querySelector(".rail__item")?.getBoundingClientRect().width || 400) + 24;
    $$("[data-rail]").forEach((b) => b.addEventListener("click", () => rail.scrollBy({ left: b.dataset.rail === "next" ? step() : -step(), behavior: reduce ? "auto" : "smooth" })));
    const prog = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const vis = rail.clientWidth / rail.scrollWidth;
      bar.style.width = `${vis * 100}%`;
      bar.style.transform = `translateX(${max > 0 ? (rail.scrollLeft / max) * ((1 - vis) / vis) * 100 : 0}%)`;
    };
    rail.addEventListener("scroll", prog, { passive: true });
    window.addEventListener("resize", prog);
    prog();
    // drag to scroll with a mouse
    let down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
    window.addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; rail.classList.add("is-dragging"); } rail.scrollLeft = sl - dx; });
    window.addEventListener("pointerup", () => { down = false; rail.classList.remove("is-dragging"); });
    rail.addEventListener("click", (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
  }
  $$("[data-count-link]").forEach((a) => (a.textContent = `All ${TOURS.length} journeys`));

  /* ---------- Trip builder ---------- */
  const form = $("#builder-form");
  if (form) {
    const daysIn = $("#days"), daysOut = $("#days-out"), out = $("#matches");
    let ranked = [];
    const state = () => ({
      interests: $$('[data-group="interests"] input:checked', form).map((i) => i.value),
      days: +daysIn.value,
      party: $('[data-group="party"] input:checked', form)?.value || "Couple",
    });
    const score = (t, s) => {
      let sc = 0;
      const hits = t.categories.filter((c) => s.interests.includes(c)).length;
      sc += s.interests.length ? (hits ? 3 + hits : -4) : 1;
      if (t.days) sc += Math.max(-2, 2 - Math.abs(t.days - s.days) / 2);
      if (s.party === "Group" && t.categories.includes("groups")) sc += 2;
      if (t.detail === "full") sc += 0.6;
      return sc;
    };
    const render = () => {
      const s = state();
      daysOut.textContent = s.days;
      daysIn.style.setProperty("--fill", `${((s.days - 1) / 13) * 100}%`);
      ranked = TOURS.map((t) => ({ t, sc: score(t, s) })).filter((r) => r.sc > 0).sort((a, b) => b.sc - a.sc);
      const top = ranked.slice(0, 4), max = ranked[0]?.sc || 1;
      $("#match-count").textContent = ranked.length;
      $("#match-label").textContent = ranked.length === 1 ? "journey matches" : "journeys match";
      out.innerHTML = top.length
        ? top.map(({ t, sc }, i) => {
            const pct = Math.round(Math.max(55, Math.min(98, (sc / max) * 96)));
            return `<li class="match" style="--d:${i * 60}ms">
              <a href="tour.html#${t.slug}">
                ${media(t.image, "", t.scene, t.seed, "match__img")}
                <span class="match__body"><b>${esc(t.title)}</b><small>${esc(t.durationLabel)} · ${esc(t.region.split(" · ")[0])}</small></span>
                <span class="match__pct" style="--p:${pct}"><span>${pct}%</span></span>
              </a></li>`;
          }).join("")
        : `<li class="match match--empty"><p>No exact match yet, which is exactly what custom trips are for. Send your picks and a planner will build it.</p></li>`;
      hydrateMedia(out);
    };
    form.addEventListener("input", render);
    form.addEventListener("submit", (e) => e.preventDefault());
    render();

    $("#builder-send").addEventListener("click", () => {
      const s = state();
      const labels = $$('[data-group="interests"] input:checked', form).map((i) => i.parentElement.textContent.trim());
      const sel = $("#plan-interest");
      if (sel) sel.value = ranked[0] && s.interests.length ? ranked[0].t.officialTitle : "Custom trip";
      const msg = $("#plan-message");
      if (msg) msg.value = `Trip builder: ${labels.length ? labels.join(", ") : "open to ideas"} · about ${s.days} ${s.days === 1 ? "day" : "days"} · ${s.party.toLowerCase()}.` +
        (ranked.length ? `\nTop matches: ${ranked.slice(0, 3).map((r) => r.t.title).join("; ")}.` : "");
      const trav = $("#plan-travellers");
      if (trav) trav.value = { Solo: 1, Couple: 2, Family: 4, Group: 10 }[s.party];
      $("#plan").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      setTimeout(() => $("#plan-name")?.focus({ preventScroll: true }), 700);
    });
  }

  /* ---------- Service shortcuts pre-select the enquiry topic ---------- */
  $$("[data-interest]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const sel = $("#plan-interest");
      if (sel) sel.value = btn.dataset.interest;
      $("#plan").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      setTimeout(() => $("#plan-name")?.focus({ preventScroll: true }), 700);
    })
  );

  /* ---------- Gallery lightbox ---------- */
  const lb = $("#lightbox");
  if (lb) {
    const stage = $(".lightbox__stage", lb);
    let opener = null;
    const close = () => { lb.hidden = true; document.body.classList.remove("no-scroll"); opener?.focus(); };
    $("#mosaic").addEventListener("click", (e) => {
      const b = e.target.closest(".mosaic__item");
      if (!b) return;
      opener = b;
      const fig = b.querySelector("figure");
      stage.innerHTML = "";
      const clone = fig.cloneNode(true);
      clone.removeAttribute("data-ready");
      clone.querySelectorAll(".scene").forEach((n) => n.remove());
      clone.className = "media";
      stage.appendChild(clone);
      hydrateMedia(stage);
      lb.hidden = false;
      document.body.classList.add("no-scroll");
      $(".lightbox__close", lb).focus();
    });
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.closest(".lightbox__close")) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) close(); });
  }
});
