/*
 * Illustrated landscape fallbacks.
 * Every photo sits on top of a generated "thousand hills" scene, so a slow or
 * missing image still shows an intentional, on-brand picture instead of a gap.
 */
(function () {
  const PALETTES = {
    volcano: { sky: ["#E9CF9B", "#C7865A"], sun: "#F6E2B3", ridges: ["#8C9A8E", "#5E7466", "#3A5446", "#22382D", "#14211B"] },
    forest:  { sky: ["#D7DED3", "#AFBFAE"], sun: "#EEF1E8", ridges: ["#94A898", "#6C8A73", "#47684F", "#2B4A35", "#16291E"] },
    savanna: { sky: ["#F3D08F", "#DE9358"], sun: "#FBEACB", ridges: ["#C79A62", "#A47A4A", "#7A5A37", "#4E3C26", "#2A2117"] },
    lake:    { sky: ["#DCE3DD", "#E9C896"], sun: "#FBF0D6", ridges: ["#8E9F9A", "#677F78", "#46605A", "#2C443F", "#172723"], water: ["#7E979A", "#4B6668"] },
    city:    { sky: ["#E5BE97", "#9C6E63"], sun: "#F7DEC0", ridges: ["#7F7A78", "#5C5B5C", "#3E4246", "#272C31", "#15191D"] },
    hills:   { sky: ["#E2DDC0", "#B9C3A0"], sun: "#F4F0DC", ridges: ["#9EAE8C", "#7A9468", "#55744A", "#365333", "#1C3020"] },
    night:   { sky: ["#1B2A3A", "#3E4B5C"], sun: "#F1E6C8", ridges: ["#2E3C46", "#24323A", "#1A262D", "#121B20", "#0B1114"] },
  };

  function rng(seed) {
    let s = (seed * 9301 + 49297) % 233280 || 1;
    return () => (s = (s * 9301 + 49297) % 233280) / 233280;
  }

  function ridge(r, W, H, base, amp, step) {
    const p1 = r() * 6.28, p2 = r() * 6.28, f1 = 1.2 + r() * 1.6, f2 = 3 + r() * 3;
    let d = `M0 ${H} L0 ${base}`;
    for (let x = 0; x <= W; x += step) {
      const t = x / W;
      const y = base - amp * (0.6 * Math.sin(t * Math.PI * f1 + p1) + 0.4 * Math.sin(t * Math.PI * f2 + p2));
      d += ` L${x.toFixed(0)} ${y.toFixed(1)}`;
    }
    return d + ` L${W} ${H} Z`;
  }

  function cone(cx, base, w, h) {
    return `M${cx - w} ${base} C${cx - w * 0.45} ${base - h * 0.55} ${cx - w * 0.16} ${base - h} ${cx - w * 0.07} ${base - h} L${cx + w * 0.07} ${base - h} C${cx + w * 0.16} ${base - h} ${cx + w * 0.45} ${base - h * 0.55} ${cx + w} ${base} Z`;
  }

  function scene(kind, seed) {
    const P = PALETTES[kind] || PALETTES.hills;
    const r = rng(seed || 1);
    const W = 1200, H = 800, id = "s" + Math.floor(r() * 1e9);
    let out = `<svg class="scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">`;
    out += `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky[0]}"/><stop offset="1" stop-color="${P.sky[1]}"/></linearGradient></defs>`;
    out += `<rect width="${W}" height="${H}" fill="url(#${id})"/>`;

    const sunX = 200 + r() * 800, sunY = kind === "night" ? 150 : 250 + r() * 80;
    out += `<circle cx="${sunX.toFixed(0)}" cy="${sunY.toFixed(0)}" r="${kind === "night" ? 34 : 70}" fill="${P.sun}" opacity="0.9"/>`;
    if (kind === "night") {
      for (let i = 0; i < 70; i++) out += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * 380).toFixed(0)}" r="${(r() * 1.6 + 0.4).toFixed(1)}" fill="#F1E6C8" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
    }

    const n = P.ridges.length;
    for (let i = 0; i < n; i++) {
      const base = 360 + i * 85 + r() * 20;
      const amp = 26 + i * 10 + r() * 18;
      if (i === 0 && kind === "volcano") {
        const c1 = 260 + r() * 200, c2 = c1 + 330 + r() * 160, c3 = c2 + 260 + r() * 120;
        out += `<path d="${cone(c1, base + 40, 230, 230)}" fill="${P.ridges[0]}"/>`;
        out += `<path d="${cone(c2, base + 40, 300, 300)}" fill="${P.ridges[0]}"/>`;
        out += `<path d="${cone(c3, base + 40, 200, 190)}" fill="${P.ridges[0]}"/>`;
      }
      if (kind === "lake" && i === 2) {
        out += `<rect x="0" y="${base - 10}" width="${W}" height="${H}" fill="${P.water[0]}"/>`;
        for (let k = 0; k < 14; k++) {
          const y = base + 8 + k * 14, x = r() * W, w = 60 + r() * 220;
          out += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="2" fill="${P.sun}" opacity="${(0.15 + r() * 0.25).toFixed(2)}"/>`;
        }
        continue;
      }
      if (kind === "savanna" && i >= 2) {
        out += `<path d="${ridge(r, W, H, base, amp * 0.25, 40)}" fill="${P.ridges[i]}"/>`;
      } else {
        out += `<path d="${ridge(r, W, H, base, amp, 30)}" fill="${P.ridges[i]}"/>`;
      }
      if (kind === "forest" && i === n - 2) {
        for (let x = 0; x < W; x += 18 + r() * 14) {
          const h = 30 + r() * 40, y = base - 10 - r() * 20;
          out += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(12 + r() * 10).toFixed(0)}" ry="${h.toFixed(0)}" fill="${P.ridges[i]}"/>`;
        }
      }
      if (kind === "city" && i === 2) {
        for (let x = 140 + r() * 80; x < W - 120; x += 26 + r() * 30) {
          const h = 20 + r() * 70, w = 16 + r() * 18;
          out += `<rect x="${x.toFixed(0)}" y="${(base - h).toFixed(0)}" width="${w.toFixed(0)}" height="${(h + 40).toFixed(0)}" fill="${P.ridges[i]}"/>`;
          if (r() > 0.5) out += `<rect x="${(x + 4).toFixed(0)}" y="${(base - h + 8).toFixed(0)}" width="3" height="3" fill="${P.sun}" opacity="0.8"/>`;
        }
      }
      if (kind === "savanna" && i === n - 2) {
        for (let k = 0; k < 3; k++) {
          const x = 120 + r() * 960, y = base - 6, s = 0.7 + r() * 0.7;
          out += `<g fill="${P.ridges[n - 1]}"><rect x="${x - 3 * s}" y="${y - 70 * s}" width="${6 * s}" height="${72 * s}"/><ellipse cx="${x}" cy="${y - 74 * s}" rx="${70 * s}" ry="${14 * s}"/></g>`;
        }
      }
      if (kind === "night" && i === n - 1) {
        const x = 520 + r() * 160, y = base - 20;
        out += `<path d="M${x - 50} ${y + 40} L${x} ${y - 30} L${x + 50} ${y + 40} Z" fill="#B8873E"/><path d="M${x - 10} ${y + 40} L${x} ${y + 6} L${x + 10} ${y + 40} Z" fill="#3B2A14"/>`;
        out += `<circle cx="${x + 110}" cy="${y + 30}" r="12" fill="#E9A646" opacity="0.9"/>`;
      }
    }
    return out + "</svg>";
  }

  window.GamaScene = scene;
})();
