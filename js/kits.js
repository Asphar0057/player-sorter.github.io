(function () {
  const ORDER = ["home", "away", "third"];
  const HOOPS = { count: 6, start: 0.275, band: 0.05, gap: 0.03 };

  function legacy(t) {
    return {
      label: "Home",
      paper: "#F5F2EC",
      card: "#FFFFFF",
      ink: t.ink || t.accent || "#111827",
      muted: "#5B6170",
      primary: t.primary || "#1F2937",
      onPrimary: t.secondary || "#FFFFFF",
      accent: t.accent || "#111827",
      onAccent: t.secondary || "#FFFFFF",
      header: t.primary || "#1F2937",
      onHeader: t.secondary || "#FFFFFF",
      pattern: {
        type: t.pattern === "stripes" ? "stripes" : "solid",
        base: t.primary || "#1F2937",
        bands: [t.secondary || "#FFFFFF"]
      }
    };
  }

  function all(team) {
    return team.kits || { home: legacy(team.theme || {}) };
  }

  function ids(team) {
    const kits = all(team);
    return ORDER.filter(id => kits[id]).concat(Object.keys(kits).filter(id => !ORDER.includes(id)));
  }

  function get(team, id) {
    const kits = all(team);
    const use = kits[id] ? id : ids(team)[0];
    const kit = kits[use];
    return Object.assign(
      {
        id: use,
        line: "rgba(17,24,39,0.12)",
        headerBand: kit.accent,
        dark: false,
        onPaper: kit.ink,
        onPaperMuted: kit.muted,
        paperPrimary: kit.primary,
        paperOnPrimary: kit.onPrimary
      },
      kit,
      { id: use }
    );
  }

  function hoops(p) {
    const bands = p.bands && p.bands.length ? p.bands : [p.base];
    const out = [];
    for (let i = 0; i < HOOPS.count; i++) {
      const from = HOOPS.start + i * (HOOPS.band + HOOPS.gap);
      out.push({ from, to: from + HOOPS.band, color: bands[i % bands.length] });
    }
    return out;
  }

  const BOLT = [[0, 0], [-3.5, 12], [2.5, 24], [-3.5, 36], [2.5, 48], [-3.5, 60], [2.5, 72], [-3.5, 84], [2.5, 96], [0, 100]];
  const BOLT_X = [14, 86];
  const BOLT_W = 2;

  function boltPoints(cx, mirror) {
    return BOLT.map(([dx, y]) => [cx + (mirror ? -dx : dx), y]);
  }

  function boltSvg(p) {
    const color = (p.bands && p.bands[0]) || "#FFFFFF";
    const lines = BOLT_X.map((cx, i) =>
      '<polyline points="' + boltPoints(cx, i === 1).map(pt => pt.join(",")).join(" ") +
      '" fill="none" stroke="' + color + '" stroke-width="' + BOLT_W + '" stroke-linejoin="miter"/>'
    ).join("");
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">' + lines + "</svg>";
    return "url('data:image/svg+xml," + encodeURIComponent(svg) + "')";
  }

  const ZIG = [[50, 0], [57, 12.5], [43, 25], [57, 37.5], [43, 50], [57, 62.5], [43, 75], [57, 87.5], [50, 100]];

  function splitSvg(p) {
    const color = (p.bands && p.bands[0]) || "#000000";
    const pts = ZIG.map(pt => pt.join(",")).concat(["100,100", "100,0"]).join(" ");
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="' + pts + '" fill="' + color + '"/></svg>';
    return "url('data:image/svg+xml," + encodeURIComponent(svg) + "')";
  }

  const CB = [0.33, 0.39, 0.61, 0.67];

  const BAND = [0.36, 0.41, 0.59, 0.64];

  const SASH = [[0, 6], [0, 34], [100, 96], [100, 68]];

  function sashSvg(p) {
    const color = (p.bands && p.bands[0]) || "#FFFFFF";
    const pts = SASH.map(pt => pt.join(",")).join(" ");
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="' + pts + '" fill="' + color + '"/></svg>';
    return "url('data:image/svg+xml," + encodeURIComponent(svg) + "')";
  }

  function diamondsSvg(p) {
    const bands = p.bands && p.bands.length ? p.bands : ["#FFFFFF"];
    const colors = bands.length >= 3 ? bands.slice(0, 3) : bands.concat(Array(3 - bands.length).fill(bands[0] || "#FFFFFF"));
    const segment = 100 / colors.length;
    const gap = 0;
    const shapes = colors.map((color, i) => {
      const x0 = i * segment + gap * 0.7;
      const x1 = (i + 1) * segment - gap * 0.7;
      const pts = [[x0, 0], [x0, 50], [x1, 100], [x1, 50]].map(pt => pt.join(",")).join(" ");
      return '<polygon points="' + pts + '" fill="' + color + '"/>';
    }).join("");
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">' + shapes + '</svg>';
    return "url('data:image/svg+xml," + encodeURIComponent(svg) + "') center / 100% 100% no-repeat, " + p.base;
  }
  const RAYO_BOLT = [[78, 0], [96, 0], [77, 38], [89, 38], [48, 100], [28, 100], [60, 52], [48, 52]];

  const TIP = [[0.24, 0.3], [0.33, 0.39]];

  const FADE = [0.4, 0.62];

  const SLEEVE_L = [[0, 0], [30, 0], [22, 46], [0, 60]];

  const ZZ_ROWS = [0.3, 0.46, 0.62, 0.78];
  const ZZ_TEETH = 5;

  function zigzagRow(y) {
    const pts = [];
    for (let i = 0; i <= ZZ_TEETH * 2; i++) pts.push([(i * 100) / (ZZ_TEETH * 2), y * 100 + (i % 2 ? -5 : 5)]);
    return pts;
  }

  function zigzagSvg(p) {
    const bands = p.bands && p.bands.length ? p.bands : ["#FFFFFF"];
    const lines = ZZ_ROWS.map((y, i) =>
      '<polyline points="' + zigzagRow(y).map(pt => pt.join(",")).join(" ") +
      '" fill="none" stroke="' + bands[i % bands.length] + '" stroke-width="3.5" stroke-linejoin="miter"/>'
    ).join("");
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">' + lines + "</svg>";
    return "url('data:image/svg+xml," + encodeURIComponent(svg) + "')";
  }

  function wavesSvg(p) {
    const color = (p.bands && p.bands[0]) || "#FFFFFF";
    const rows = 12;
    const amplitude = 6.4;
    const phase = 0.75;
    const paths = Array.from({ length: rows }, (_, i) => {
      const y = (i + 0.5) * (100 / rows);
      const d = Array.from({ length: 26 }, (_, j) => {
        const x = (j / 25) * 100;
        const yy = y + Math.sin((x / 100) * Math.PI * 4 + phase) * amplitude;
        return (j === 0 ? "M" : "L") + " " + x + " " + yy;
      }).join(" ");
      return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="1.2" stroke-linecap="round" opacity="' + (0.28 + (i % 4) * 0.14) + '"/>';
    }).join("");
    return "url('data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">' + paths + '</svg>') + "') center / 100% 100% no-repeat, " + p.base;
  }

  function thickWavesSvg(p) {
    const color = (p.bands && p.bands[0]) || "#FFFFFF";
    const rows = 6;
    const amplitude = 6.4;
    const phase = 0.75;
    const paths = Array.from({ length: rows }, (_, i) => {
      const y = (i + 0.5) * (100 / rows);
      const d = Array.from({ length: 26 }, (_, j) => {
        const x = (j / 25) * 100;
        const yy = y + Math.sin((x / 100) * Math.PI * 4 + phase) * amplitude;
        return (j === 0 ? "M" : "L") + " " + x + " " + yy;
      }).join(" ");
      return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="8" stroke-linecap="round" opacity="1"/>';
    }).join("");
    return "url('data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">' + paths + '</svg>') + "') center / 100% 100% no-repeat, " + p.base;
  }

  function chevronSvg(p) {
    const color = (p.bands && p.bands[0]) || "#FFFFFF";
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="0,0 50,100 100,0" fill="' + color + '"/></svg>';
    return "url('data:image/svg+xml," + encodeURIComponent(svg) + "') center / 100% 100% no-repeat, " + p.base;
  }

  const CHECKS = 6;

  function trianglesSvg(c, fadeTo, opacity) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs>' +
      '<pattern id="t" width="18" height="16" patternUnits="userSpaceOnUse">' +
      '<polygon points="9,0 18,16 0,16" fill="none" stroke="' + c + '" stroke-width="1.1" stroke-opacity="0.55"/>' +
      '<polygon points="9,0 9,16 0,16" fill="' + c + '" fill-opacity="0.22"/></pattern>' +
      '<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/>' +
      '<stop offset="1" stop-color="#fff" stop-opacity="' + fadeTo + '"/></linearGradient>' +
      '<mask id="m"><rect width="100%" height="100%" fill="url(#g)"/></mask></defs>' +
      '<rect width="100%" height="100%" fill="url(#t)" mask="url(#m)" opacity="' + opacity + '"/></svg>';
  }

  // Halftone dots on a 200x100 grid: small and sparse at the bottom-left, large and dense
  // toward the top-right (Orlando City's "digital storm" body pattern).
  const DOTS = (function () {
    const out = [];
    for (let row = 0, y = 4; y < 100; row++, y = 4 + row * 7) {
      for (let x = 4 + (row % 2 ? 4 : 0); x < 200; x += 8) {
        const t = Math.max(0, Math.min(1, 0.55 * (x / 200) + 0.45 * (1 - y / 100)));
        out.push([x, y, 0.5 + 3.2 * Math.pow(t, 1.15)]);
      }
    }
    return out;
  })();

  function dotsSvg(c) {
    const circles = DOTS.map(d => '<circle cx="' + d[0] + '" cy="' + d[1] + '" r="' + d[2].toFixed(2) + '"/>').join("");
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice"><g fill="' + c + '">' + circles + "</g></svg>";
  }

  // Width of the grid the shape generators below build for. Cards use 200; share banners ask
  // for a wider grid (see stripeList / shardList / burstList) so the art fills their shape.
  let GW = 200;

  // Radial ray burst on a 200x100 grid, centred near the top-right like the crest on the
  // New England Revolution home shirt. Wide wedges use the first band colour, thin streaks
  // the second (or white). Each entry is [kind, points] where kind 0 = wedge, 1 = streak.
  function burstList(W) {
    const out = [];
    const cx = W * 0.74, cy = 34, far = Math.max(320, W * 1.6), n = 26;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.11;
      const wide = (i % 3 !== 1);
      const half = wide ? 0.052 + 0.05 * ((i * 7) % 5) / 4 : 0.012;
      const pts = [[cx, cy]];
      pts.push([cx + Math.cos(a - half) * far, cy + Math.sin(a - half) * far]);
      pts.push([cx + Math.cos(a + half) * far, cy + Math.sin(a + half) * far]);
      out.push([wide ? 0 : 1, pts]);
    }
    return out;
  }

  const BURST = burstList(200);

  function burstColors(p) {
    const b = p.bands || [];
    return [b[0] || "#CE1126", b[1] || "#FFFFFF"];
  }

  function burstSvg(p) {
    const c = burstColors(p);
    const polys = BURST.map(r => '<polygon fill="' + c[r[0]] + '" opacity="' + (r[0] ? 0.9 : 0.58) + '" points="' +
      r[1].map(q => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" ") + '"/>').join("");
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice">' +
      '<defs><radialGradient id="h" cx="148" cy="34" r="46" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="' + p.base + '" stop-opacity="1"/><stop offset="1" stop-color="' + p.base + '" stop-opacity="0"/></radialGradient></defs>' +
      polys + '<circle cx="148" cy="34" r="46" fill="url(#h)"/></svg>';
  }

  // Blocky "bento shard" texture on a 200x100 grid with contrasting sleeve panels at both
  // ends (West Ham 2026/27 home). Entries are [kind, alpha, points]: kind 0 = dark block
  // (second band colour), kind 1 = sleeve panel (first band colour). Blocks of mixed sizes are
  // packed on a 5-unit grid, denser along diagonal streaks, some cut on the diagonal.
  function shardList(W) {
    const out = [];
    const E = W - 70;
    let seed = 11;
    const rnd = function () {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const U = 5, cols = Math.round(W / 5), rows = 20;
    const used = [];
    for (let r = 0; r < rows; r++) used.push(new Array(cols).fill(false));
    const sizes = [[1, 1], [2, 1], [1, 2], [2, 2], [2, 2], [3, 2], [2, 3], [3, 1], [1, 3]];
    function free(c, r, w, h) {
      if (c + w > cols || r + h > rows) return false;
      for (let j = r; j < r + h; j++) for (let i = c; i < c + w; i++) if (used[j][i]) return false;
      return true;
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 4; c < cols - 4; c++) {
        if (used[r][c]) continue;
        const streak = 0.5 + 0.5 * Math.sin((c + r * 0.9) * 0.5);
        if (rnd() > 0.3 + 0.7 * streak) continue;
        const pick = sizes[Math.floor(rnd() * sizes.length)];
        let w = pick[0], h = pick[1];
        if (!free(c, r, w, h)) { w = 1; h = 1; }
        for (let j = r; j < r + h; j++) for (let i = c; i < c + w; i++) used[j][i] = true;
        const x = c * U + 0.5, y = r * U + 0.5, bw = w * U - 1, bh = h * U - 1;
        const a = 0.28 + rnd() * 0.62;
        const cut = rnd();
        let pts = [[x, y], [x + bw, y], [x + bw, y + bh], [x, y + bh]];
        if (cut > 0.72 && bw >= 4 && bh >= 4) pts = [[x, y], [x + bw, y], [x, y + bh]];
        else if (cut > 0.5 && bw >= 4 && bh >= 4) pts = [[x + bw, y], [x + bw, y + bh], [x, y + bh]];
        out.push([0, a, pts]);
      }
    }
    // Sleeve panels (no shapes on them) with a checkered strip along their inner edge.
    const sq = 2.6;
    out.push([1, 1, [[-1, 0], [19, 0], [11, 100], [-1, 100]]]);
    out.push([1, 1, [[W + 1, 0], [E, 0], [E + 8, 100], [W + 1, 100]]]);
    for (let r = 0; r * sq < 100; r++) {
      const y = r * sq;
      [0, 1].forEach(c => {
        if ((r + c) % 2) return;
        const lx = 19 - (y + sq / 2) * 0.08 - (c + 1) * sq;
        const rx = E + (y + sq / 2) * 0.08 + c * sq;
        out.push([0, 0.85, [[lx, y], [lx + sq, y], [lx + sq, y + sq], [lx, y + sq]]]);
        out.push([0, 0.85, [[rx, y], [rx + sq, y], [rx + sq, y + sq], [rx, y + sq]]]);
      });
    }
    return out;
  }

  const SHARDS = shardList(200);

  function shardColors(p) {
    const b = p.bands || [];
    return [b[1] || "#000000", b[0] || "#FFFFFF"];
  }

  function shardsSvg(p) {
    const c = shardColors(p);
    const polys = SHARDS.map(r => '<polygon fill="' + c[r[0]] + '" opacity="' + r[1].toFixed(2) + '" points="' +
      r[2].map(q => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" ") + '"/>').join("");
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice">' + polys + "</svg>";
  }

  function paintShards(ctx, ox, oy, s, colors, list) {
    (list || SHARDS).forEach(r => {
      ctx.globalAlpha = r[1];
      ctx.fillStyle = colors[r[0]];
      ctx.beginPath();
      r[2].forEach((q, i) => {
        if (i === 0) ctx.moveTo(ox + q[0] * s, oy + q[1] * s); else ctx.lineTo(ox + q[0] * s, oy + q[1] * s);
      });
      ctx.closePath();
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // Vertical stripe patterns built from shapes on a 200x100 grid. Entries are [kind, alpha, points].
  // "crosses": thick stripes whose lower part fills with a fading lattice of plus signs
  // (Leverkusen home). "pinlines": thick stripes cut by a thin line in the base colour, with a
  // thin line in the stripe colour running down the gap between stripes (Frankfurt home).
  function stripeShapes(kind) {
    const out = [];
    const period = 44, width = 20, first = 6;
    const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    for (let i = 0; i < Math.ceil((GW - first) / period); i++) {
      const x0 = first + i * period;
      out.push([0, 1, rect(x0, -1, width, 102)]);
      if (kind === "crosses") {
        const step = 5.6;
        for (let r = 0; r * step < 104; r++) {
          const y = r * step;
          const t = Math.max(0, Math.min(1, (y - 10) / 74));
          if (t < 0.1) continue;
          const arm = 0.4 + 1.9 * Math.pow(t, 1.2);
          const th = 0.5 + 1.0 * t;
          const off = r % 2 ? step / 2 : 0;
          for (let x = x0 + step / 2 + off - (off ? step : 0); x < x0 + width; x += step) {
            if (x - arm < x0 || x + arm > x0 + width) continue;
            out.push([1, 1, rect(x - arm, y - th / 2, arm * 2, th)]);
            out.push([1, 1, rect(x - th / 2, y - arm, th, arm * 2)]);
          }
        }
      } else {
        out.push([1, 1, rect(x0 + width / 2 - 0.9, -1, 1.8, 102)]);
        out.push([2, 1, rect(x0 + width + (period - width) / 2 - 0.7, -1, 1.4, 102)]);
      }
    }
    return out;
  }

  // "slashes": dense steep diagonal lines that switch between thick (kind 0) and thin (kind 1)
  // in horizontal zones whose edges step across the card (France 2026 home).
  function slashShapes() {
    const out = [];
    const lean = 0.55, gap = 4.2, zone = 21;
    for (let i = -16; i < Math.ceil(GW / gap) + 13; i++) {
      const xr = i * gap;
      const xAt = y => xr + (y - 50) * lean;
      let ya = -10, kind = -1;
      const bandOf = y => Math.floor((y + xr * 0.34 + 60) / zone);
      const wide = y => (bandOf(y) % 2 + 2) % 2 === 0;
      const flush = (yb) => {
        if (kind < 0) return;
        const w = kind === 0 ? 2.5 : 1.0;
        out.push([kind, 1, [[xAt(ya) - w / 2, ya], [xAt(ya) + w / 2, ya], [xAt(yb) + w / 2, yb], [xAt(yb) - w / 2, yb]]]);
      };
      for (let y = -10; y <= 110; y += 1) {
        const kk = wide(y + 0.5) ? 0 : 1;
        if (kk !== kind) { flush(y); ya = y; kind = kk; }
      }
      flush(110);
    }
    return out;
  }

  // "vee": three chevron bands pointing down with a white gap at the centre, like the 1990
  // style Germany shirt. Kinds 0, 1, 2 take the three band colours from top to bottom.
  function veeShapes() {
    const out = [];
    const slope = 40 / (GW / 2), thick = 14.8, gap = 4, mid = GW / 2;
    [-14, 0.4, 14.8].forEach((y0, kind) => {
      out.push([kind, 1, [[-1, y0 - 0.5], [mid - gap, y0 + (mid + 1 - gap) * slope], [mid - gap, y0 + (mid + 1 - gap) * slope + thick], [-1, y0 + thick - 0.5]]]);
      out.push([kind, 1, [[GW + 1, y0 - 0.5], [mid + gap, y0 + (mid + 1 - gap) * slope], [mid + gap, y0 + (mid + 1 - gap) * slope + thick], [GW + 1, y0 + thick - 0.5]]]);
    });
    return out;
  }

  // "scatter": thin white slashes at assorted angles plus small pale triangles scattered over the
  // base, never touching each other, like the Liverpool 2026/27 home shirt. Kind 0 = slash,
  // kind 1 = triangle. A grid of tiny dots sits behind them (see dotGrid).
  function scatterShapes() {
    const out = [];
    const taken = [];
    let seed = 41;
    const rnd = function () {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const clear = function (circles) {
      return circles.every(c => taken.every(t => Math.hypot(c[0] - t[0], c[1] - t[1]) > c[2] + t[2] + 1.6));
    };
    let placed = 0;
    for (let tries = 0; tries < 900 * GW / 200 && placed < Math.round(60 * GW / 200); tries++) {
      const isTri = placed % 3 === 2;
      if (isTri) {
        const cx = rnd() * GW, cy = -2 + rnd() * 104;
        const s = 3.2 + rnd() * 3.6;
        if (!clear([[cx, cy, s * 1.25]])) continue;
        const flip = rnd() < 0.5 ? -1 : 1;
        out.push([1, 0.5, [[cx - s * flip, cy + s], [cx + s * flip, cy + s], [cx + (rnd() - 0.5) * s, cy - s]]]);
        taken.push([cx, cy, s * 1.25]);
      } else {
        const cx = rnd() * GW, cy = -2 + rnd() * 104;
        const len = 8 + rnd() * 22;
        const ang = (rnd() < 0.5 ? 1 : -1) * (0.5 + rnd() * 0.95);
        const dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2;
        const circles = [];
        for (let i = -2; i <= 2; i++) circles.push([cx + dx * i / 2, cy + dy * i / 2, len / 8 + 0.6]);
        if (!clear(circles)) continue;
        const nx = -Math.sin(ang) * 0.4, ny = Math.cos(ang) * 0.4;
        out.push([0, 0.9, [[cx - dx + nx, cy - dy + ny], [cx + dx + nx, cy + dy + ny], [cx + dx - nx, cy + dy - ny], [cx - dx - nx, cy - dy - ny]]]);
        circles.forEach(c => taken.push(c));
      }
      placed++;
    }
    return out;
  }

  // Tiny vector dots on a staggered grid behind the scatter shapes.
  function dotGrid(ctx, ox, oy, s, color, W) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let row = 0, y = 1.7; y < 100; row++, y = 1.7 + row * 3.4) {
      for (let x = 1.7 + (row % 2 ? 1.7 : 0); x < (W || 200); x += 3.4) {
        ctx.moveTo(ox + (x + 0.4) * s, oy + y * s);
        ctx.arc(ox + x * s, oy + y * s, 0.4 * s, 0, Math.PI * 2);
      }
    }
    ctx.fill();
  }

  function dotGridSvg(color, W) {
    return '<defs><pattern id="d" width="3.4" height="3.4" patternUnits="userSpaceOnUse"><circle cx="0.85" cy="0.85" r="0.4" fill="' + color + '"/><circle cx="2.55" cy="2.55" r="0.4" fill="' + color + '"/></pattern></defs><rect width="' + (W || 200) + '" height="100" fill="url(#d)"/>';
  }

  // "raglan": a white band with a checkered edge on both sides and a thick maroon band
  // either side, on the base colour (Arsenal home). It is centred in the middle of the grid so
  // it survives the cropping a home-page card applies. Kinds: 0 band, 1 stripe, 2 check squares.
  function raglanShapes() {
    const out = [];
    const lean = 0.09, sq = GW > 300 ? 3.4 : 2.6;
    const shear = (x, y) => [x + (y - 50) * lean, y];
    const quad = (x1, x2, y1, y2) => [shear(x1, y1), shear(x2, y1), shear(x2, y2), shear(x1, y2)];
    const K = GW > 300 ? 2.2 : 1;
    const x0 = GW - 62 * K, x1 = GW - 22 * K;
    out.push([0, 1, quad(x0, x1, -10, 110)]);
    [[x0 - 12 * K, x0], [x1, x1 + 12 * K]].forEach(p => out.push([1, 1, quad(p[0], p[1], -10, 110)]));
    for (let r = 0; r * sq < 120; r++) {
      const y = -10 + r * sq;
      [x0, x0 + sq, x1 - sq * 2, x1 - sq].forEach((cx, c) => {
        if ((r + c) % 2) return;
        out.push([2, 1, quad(cx, cx + sq, y, y + sq)]);
      });
    }
    return out;
  }

  // "streaks": fine parallel lines that sweep through the card in a big "S" curve, broken into
  // runs so the texture stays faint and tone-on-tone (the Villarreal 2026/27 home shirt print).
  // Kind 0 = line (first band colour).
  function streakShapes() {
    const out = [];
    let seed = 5;
    const rnd = function () {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const gap = 4.2, w = 1.5, step = 4;
    const curve = (xr, y) => xr + 16 * Math.sin((y / 100) * Math.PI * 2 + xr * 0.012) + 5 * Math.sin(y * 0.13 + xr * 0.02);
    for (let xr = -20; xr < GW + 20; xr += gap) {
      let run = null;
      const flush = () => {
        if (run && run.length > 2) {
          const left = run.map(q => [q[0] - w / 2, q[1]]);
          const right = run.map(q => [q[0] + w / 2, q[1]]).reverse();
          out.push([0, 0.85, left.concat(right)]);
        }
        run = null;
      };
      for (let y = -4; y <= 104; y += step) {
        const x = curve(xr, y);
        const f = 0.5 + 0.5 * Math.sin(y * 0.05 + xr * 0.045) * Math.cos(xr * 0.03 - y * 0.02);
        if (f > 0.34 + rnd() * 0.12) {
          if (!run) run = [];
          run.push([x, y]);
        } else {
          flush();
        }
      }
      flush();
    }
    return out;
  }

  // "swell": wide rolling bands in the first band colour with a darker shadow under each one,
  // like the USA 2026 home shirt. Kind 0 = band, kind 1 = shadow edge (second band colour).
  function swellShapes() {
    const out = [];
    const period = 21, band = 11.5, amp = 7, k = (Math.PI * 2) / 105, phase = 0.9;
    const wave = (x, y) => y + amp * Math.sin(x * k + phase);
    for (let y = -30; y < 135; y += period) {
      const top = [], bot = [], shadow = [];
      for (let x = -10; x <= GW + 10; x += 4) {
        top.push([x, wave(x, y)]);
        bot.push([x, wave(x, y) + band]);
      }
      const botRev = bot.slice().reverse();
      out.push([1, 0.85, bot.map(q => [q[0], q[1] - 0.6]).concat(bot.slice().reverse().map(q => [q[0], q[1] + 2.6]))]);
      out.push([0, 1, top.concat(botRev)]);
    }
    return out;
  }

  // "stars": upright five-point stars, all the same size, on a regular staggered grid in the
  // first band colour on the base, like the USA 2026 away shirt. Kind 0 = star.
  function starShapes() {
    const out = [];
    const K = GW > 300 ? 1.7 : 1;
    const r = 5.2 * K, dx = 23 * K, dy = 17 * K;
    for (let row = 0, y = 4; y < 112; row++, y += dy) {
      for (let x = (row % 2 ? dx / 2 : 0) + 4; x < GW + 14; x += dx) {
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const rr = i % 2 ? r * 0.4 : r;
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
        }
        out.push([0, 0.85, pts]);
      }
    }
    return out;
  }

  // "ornament": delicate tone-on-tone line work (nested diamonds with small knot motifs and
  // dotted lines) in the first band colour, like the Fiorentina 2026/27 home shirt.
  function ornamentShapes() {
    const out = [];
    const A = 0.8;
    const LW = GW > 300 ? 1.7 : 1;
    const seg = (x1, y1, x2, y2, w0) => {
      const w = w0 * LW;
      const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1;
      const nx = -dy / l * w / 2, ny = dx / l * w / 2;
      out.push([0, A, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]]]);
    };
    const diamond = (cx, cy, rx, ry, w) => {
      seg(cx, cy - ry, cx + rx, cy, w); seg(cx + rx, cy, cx, cy + ry, w);
      seg(cx, cy + ry, cx - rx, cy, w); seg(cx - rx, cy, cx, cy - ry, w);
    };
    const dots = (x1, y1, x2, y2, n, s) => {
      for (let i = 0; i <= n; i++) {
        const x = x1 + (x2 - x1) * i / n, y = y1 + (y2 - y1) * i / n;
        out.push([0, A, [[x - s, y], [x, y - s], [x + s, y], [x, y + s]]]);
      }
    };
    const knot = (cx, cy, r) => {
      diamond(cx, cy, r, r, 0.45);
      diamond(cx, cy, r * 0.55, r * 0.55, 0.4);
      seg(cx - r * 1.5, cy, cx + r * 1.5, cy, 0.4);
      seg(cx, cy - r * 1.5, cx, cy + r * 1.5, 0.4);
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(q => {
        out.push([0, A, [[cx + q[0] * r * 0.5 - 0.7, cy + q[1] * r * 0.5 - 0.7], [cx + q[0] * r * 0.5 + 0.7, cy + q[1] * r * 0.5 - 0.7], [cx + q[0] * r * 0.5 + 0.7, cy + q[1] * r * 0.5 + 0.7], [cx + q[0] * r * 0.5 - 0.7, cy + q[1] * r * 0.5 + 0.7]]]);
      });
    };
    const centres = [];
    for (let c = GW / 2; c < GW + 120; c += 110) centres.push([c, 50]);
    for (let c = GW / 2 - 110; c > -120; c -= 110) centres.push([c, 50]);
    centres.forEach((c, n) => {
      const cx = c[0], cy = c[1];
      [[10, 0.5], [15, 0.4], [34, 0.5], [38, 0.4], [60, 0.5], [64, 0.4], [86, 0.5]].forEach(d => diamond(cx, cy, d[0] * 1.9 / 1.9 * 1.4, d[0] * 0.95, d[1]));
      knot(cx, cy, 4.2);
      [24, 49, 75].forEach(r => {
        const rx = r * 1.4, ry = r * 0.95;
        dots(cx, cy - ry, cx + rx, cy, 7 + Math.round(r / 12), 0.55);
        dots(cx + rx, cy, cx, cy + ry, 7 + Math.round(r / 12), 0.55);
        dots(cx, cy + ry, cx - rx, cy, 7 + Math.round(r / 12), 0.55);
        dots(cx - rx, cy, cx, cy - ry, 7 + Math.round(r / 12), 0.55);
      });
      [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(q => {
        knot(cx + q[0] * 49 * 1.4 * 0.5 + (q[0] ? 0 : 0), cy + q[1] * 49 * 0.95 * 0.5, 3.4);
        knot(cx + q[0] * 75 * 1.4 * 0.5, cy + q[1] * 75 * 0.95 * 0.5, 3.4);
      });
    });
    return out;
  }

  // ---- away / third kit art -------------------------------------------------------------

  function seeded(seed) {
    let s = seed;
    return function () {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  }

  // "bruise": jagged zig-zag strokes and small triangles scattered over the base, in the first
  // band colour (Arsenal away, after the 1991-93 "bruised banana" print). Kind 0.
  function bruiseShapes() {
    const out = [];
    const rnd = seeded(3);
    const K = GW > 300 ? 1.5 : 1;
    const n = Math.round((GW / 8.5) / K);
    for (let i = 0; i < n; i++) {
      let x = rnd() * (GW + 40) - 20, y = -10 + rnd() * 90;
      const segs = 5 + Math.floor(rnd() * 5), w = (1.6 + rnd() * 1.4) * K, amp = (4 + rnd() * 4) * K;
      const pts = [[x, y]];
      for (let s = 0; s < segs; s++) {
        x += (3.2 + rnd() * 2) * K;
        y += (6 + rnd() * 3) * K;
        pts.push([x + (s % 2 ? amp : -amp), y]);
      }
      const left = pts.map(q => [q[0] - w / 2, q[1]]);
      const right = pts.map(q => [q[0] + w / 2, q[1]]).reverse();
      out.push([0, 0.85, left.concat(right)]);
      if (rnd() < 0.5) {
        const tx = pts[pts.length - 1][0] + 2 * K, ty = pts[pts.length - 1][1];
        out.push([0, 0.85, [[tx, ty], [tx + 5 * K, ty + 2 * K], [tx + 1 * K, ty + 7 * K]]]);
      }
    }
    return out;
  }

  // "pole": one vertical stripe whose colour fades away downward, white base around it (Man City
  // third). Kind 0 = top colour, kind 1 = fade colour.
  function poleShapes() {
    const out = [];
    const K = GW > 300 ? 2.2 : 1;
    const cx = GW > 300 ? GW * 0.7 : GW / 2;
    const bar = 2.6 * K, mid = 7.5 * K;
    const N = 34;
    for (let i = 0; i < N; i++) {
      const y0 = -4 + (i * 108) / N, y1 = -4 + ((i + 1) * 108) / N + 0.3;
      const ym = (y0 + y1) / 2;
      const t = Math.min(1, Math.abs(ym - 48) / 50);
      const a = 0.12 + 0.88 * Math.pow(t, 1.1);
      const sq = (x0, x1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
      out.push([1, a * 0.9, sq(cx - mid, cx + mid)]);
      out.push([0, a, sq(cx - mid - bar, cx - mid)]);
      out.push([0, a, sq(cx + mid, cx + mid + bar)]);
    }
    return out;
  }

  // "swirls": soft overlapping watercolour blobs in up to three band colours (West Ham third,
  // Leverkusen away). Kinds 0-2.
  function swirlShapes() {
    const out = [];
    const rnd = seeded(17);
    const K = GW > 300 ? 1.6 : 1;
    const n = Math.round((14 * GW) / 200 / (K > 1 ? 1.5 : 1));
    for (let i = 0; i < n; i++) {
      const x0 = -10 + rnd() * (GW + 20), y0 = 5 + rnd() * 90;
      const len = (45 + rnd() * 55) * K, amp = (7 + rnd() * 9) * K, f = 0.05 + rnd() * 0.05, ph = rnd() * 6.28;
      const w0 = (5 + rnd() * 6) * K, dir = rnd() < 0.5 ? -1 : 1;
      const left = [], right = [];
      for (let t = 0; t <= 1.0001; t += 0.05) {
        const x = x0 + t * len, y = y0 + dir * amp * Math.sin(t * len * f + ph) + (t - 0.5) * 8 * K;
        const w = w0 * (0.25 + 0.75 * Math.sin(Math.PI * t));
        left.push([x, y - w / 2]);
        right.push([x, y + w / 2]);
      }
      out.push([i % 3, 0.35 + rnd() * 0.4, left.concat(right.reverse())]);
    }
    return out;
  }

  // "ticks": small diagonal zig-zag marks on a staggered grid, tone-on-tone (Germany away).
  function tickShapes() {
    const out = [];
    const K = GW > 300 ? 1.7 : 1;
    const dx = 11 * K, dy = 9 * K, l = 3.4 * K, w = 0.9 * K;
    for (let row = 0, y = 4; y < 106; row++, y += dy) {
      for (let x = (row % 2 ? dx / 2 : 0) + 3; x < GW + 6; x += dx) {
        out.push([0, 0.75, [[x, y], [x + w, y], [x + l + w, y + l], [x + l, y + l]]]);
        out.push([0, 0.75, [[x + l, y + l], [x + l + w, y + l], [x + w, y + 2 * l], [x, y + 2 * l]]]);
      }
    }
    return out;
  }

  // "gridiron": diagonal navy and red stripes across the end of the card, like the striped
  // sleeves on the Cagliari away shirt. Kind 0 = first colour, kind 1 = second colour.
  function gridironShapes() {
    const out = [];
    const K = GW > 300 ? 1.7 : 1;
    const len = 62 * K, w = 4.6 * K, gap = 3.2 * K, lean = 0.5;
    const q = (x0, x1) => [[x0, -5], [x1, -5], [x1 - 110 * lean, 105], [x0 - 110 * lean, 105]];
    let x = GW - len, i = 0;
    while (x < GW + 120) {
      out.push([i % 2, 1, q(x, x + w)]);
      x += w + gap;
      i++;
    }
    return out;
  }

  // "hexes": a honeycomb of faintly lit hexagons in the first band colour (Man City away bees).
  function hexShapes() {
    const out = [];
    const rnd = seeded(29);
    const K = GW > 300 ? 1.6 : 1;
    const r = 6.2 * K, h = r * Math.sqrt(3) / 2;
    for (let row = 0, y = 0; y < 112; row++, y += h * 1.0) {
      for (let x = (row % 2 ? r * 1.5 : 0); x < GW + r * 2; x += r * 3) {
        if (rnd() < 0.42) continue;
        const pts = [];
        for (let a = 0; a < 6; a++) pts.push([x + Math.cos((a * Math.PI) / 3) * (r - 0.5), y + Math.sin((a * Math.PI) / 3) * (r - 0.5)]);
        out.push([0, 0.12 + rnd() * 0.5, pts]);
      }
    }
    return out;
  }

  // ---- second round of kit art ----------------------------------------------------------

  // Smooth 2D value noise in [0, 1].
  function noise2(seed) {
    const h = (ix, iy) => {
      let n = (ix * 374761393 + iy * 668265263 + seed * 2147483647) | 0;
      n = (n ^ (n >>> 13)) * 1274126177;
      n = n ^ (n >>> 16);
      return ((n >>> 0) % 100000) / 100000;
    };
    const sm = t => t * t * (3 - 2 * t);
    return (x, y) => {
      const ix = Math.floor(x), iy = Math.floor(y), fx = sm(x - ix), fy = sm(y - iy);
      const a = h(ix, iy), b = h(ix + 1, iy), c = h(ix, iy + 1), d = h(ix + 1, iy + 1);
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    };
  }

  // "contours": fine wavy lines that follow a drifting noise field, so neighbouring lines run
  // together like contour lines and break up in places (the Villarreal 2026/27 kits). Kind 0.
  function contourShapes() {
    const out = [];
    const K = GW > 300 ? 1.7 : 1;
    const warp = noise2(7), warp2 = noise2(19), gate = noise2(31);
    const gap = 3.3 * K, w = 0.85 * K;
    for (let yb = -10; yb < 112; yb += gap) {
      let run = null;
      const flush = () => {
        if (run && run.length > 2) {
          out.push([0, 0.55, run.map(q => [q[0], q[1] - w / 2]).concat(run.map(q => [q[0], q[1] + w / 2]).reverse())]);
        }
        run = null;
      };
      for (let x = -6; x <= GW + 6; x += 3) {
        const y = yb + 8 * K * (warp(x * 0.03 / K, yb * 0.025) * 2 - 1) + 3.2 * K * (warp2(x * 0.1 / K, yb * 0.05) * 2 - 1);
        if (gate(x * 0.045 / K + 3, yb * 0.05) > 0.3) {
          if (!run) run = [];
          run.push([x, y]);
        } else {
          flush();
        }
      }
      flush();
    }
    return out;
  }

  // "golden": the golden-ratio construction (golden rectangle, squares, circle and spiral arcs)
  // drawn in fine lines, with small fleurons and a tile patch around it (Fiorentina third).
  function goldenShapes() {
    const out = [];
    const A = 0.8, lw = GW > 300 ? 1.25 : 0.95;
    const seg = (x1, y1, x2, y2, w) => {
      const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1;
      const nx = -dy / l * w / 2, ny = dx / l * w / 2;
      out.push([0, A, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]]]);
    };
    const arc = (cx, cy, r, a0, a1, w) => {
      const n = 14;
      let px = cx + Math.cos(a0) * r, py = cy + Math.sin(a0) * r;
      for (let i = 1; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        seg(px, py, x, y, w);
        px = x; py = y;
      }
    };
    const fleuron = (x, y, r) => {
      out.push([0, 0.6, [[x, y - r * 1.5], [x + r * 0.45, y], [x, y + r * 1.5], [x - r * 0.45, y]]]);
      out.push([0, 0.6, [[x - r * 1.5, y], [x, y - r * 0.45], [x + r * 1.5, y], [x, y + r * 0.45]]]);
      out.push([0, 0.6, [[x + r * 2.1, y - r * 0.5], [x + r * 2.6, y], [x + r * 2.1, y + r * 0.5], [x + r * 1.6, y]]]);
    };
    const phi = 1.6180339887;
    const H = GW > 300 ? 74 : 66;
    const W = H * phi;
    const cx = GW > 300 ? GW * 0.68 : GW / 2;
    let x0 = cx - W / 2, y0 = 17, w = W, h = H;
    seg(x0, y0, x0 + w, y0, lw); seg(x0 + w, y0, x0 + w, y0 + h, lw); seg(x0 + w, y0 + h, x0, y0 + h, lw); seg(x0, y0 + h, x0, y0, lw);
    let side = 0;
    for (let i = 0; i < 8; i++) {
      const s = Math.min(w, h);
      if (side === 0) {
        arc(x0 + s, y0 + s, s, Math.PI, Math.PI * 1.5, lw * 1.25);
        seg(x0 + s, y0, x0 + s, y0 + h, lw * 0.8);
        x0 += s; w -= s;
      } else if (side === 1) {
        arc(x0 + s, y0 + s, s, -Math.PI / 2, 0, lw * 1.25);
        seg(x0, y0 + s, x0 + w, y0 + s, lw * 0.8);
        y0 += s; h -= s;
      } else if (side === 2) {
        arc(x0 + w - s, y0 + h - s, s, 0, Math.PI / 2, lw * 1.25);
        seg(x0 + w - s, y0, x0 + w - s, y0 + h, lw * 0.8);
        w -= s;
      } else {
        arc(x0 + s, y0 + h - s, s, Math.PI / 2, Math.PI, lw * 1.25);
        seg(x0, y0 + h - s, x0 + w, y0 + h - s, lw * 0.8);
        h -= s;
      }
      side = (side + 1) % 4;
      if (Math.min(w, h) < 2) break;
    }
    arc(cx - W / 2 + H / 2, 17 + H / 2, H / 2, 0, Math.PI * 2, lw);
    [[-0.78, 0.2], [-0.62, 0.62], [0.74, 0.28], [0.64, 0.7], [-0.9, 0.85]].forEach(p => fleuron(cx + p[0] * W * 0.62, p[1] * 100, 2.4));
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const px = cx + W * 0.62 + c * 5.5, py = 60 + r * 5.5;
        out.push([0, 0.4, [[px, py + 2.7], [px + 2.7, py], [px + 5.4, py + 2.7], [px + 2.7, py + 5.4]]]);
      }
    }
    return out;
  }

  // "vtex": rows of downward-pointing dark triangles with thin light rules, tone-on-tone (the
  // Arsenal away "V" texture). Kind 0 = triangle, kind 1 = rule.
  function vtexShapes() {
    const out = [];
    const K = GW > 300 ? 1.5 : 1;
    const rowH = 19 * K, tw = 28 * K;
    for (let row = 0, y = -4; y < 108; row++, y += rowH) {
      for (let x = (row % 2 ? tw / 2 : 0) - tw; x < GW + tw; x += tw) {
        out.push([0, 0.75, [[x, y], [x + tw, y], [x + tw / 2, y + rowH - 1]]]);
      }
      out.push([1, 0.4, [[-2, y + rowH - 1.2], [GW + 2, y + rowH - 1.2], [GW + 2, y + rowH - 0.2], [-2, y + rowH - 0.2]]]);
      const off = row % 2 ? 0 : tw / 2;
      for (let x = 0; x < GW + tw; x += tw) {
        out.push([1, 0.22, [[x + off - 0.4, y + rowH * 0.3], [x + off + 0.4, y + rowH * 0.3], [x + off + 0.4, y + rowH], [x + off - 0.4, y + rowH]]]);
      }
    }
    return out;
  }

  // "skewchecks": a skewed, blurred-looking checkerboard of uneven cells (Liverpool third).
  function skewcheckShapes() {
    const out = [];
    const rnd = seeded(13);
    const K = GW > 300 ? 1.6 : 1;
    for (let y = -6, row = 0; y < 106; row++) {
      const rh = (10 + rnd() * 9) * K, sk = (rnd() - 0.5) * 10 * K;
      let x = -20 + rnd() * 10;
      let on = row % 2 === 0;
      while (x < GW + 20) {
        const cw = (11 + rnd() * 10) * K;
        if (on) {
          const a = 0.35 + rnd() * 0.6;
          out.push([0, a, [[x + sk, y], [x + cw + sk, y], [x + cw - sk, y + rh], [x - sk, y + rh]]]);
        }
        x += cw;
        on = !on;
      }
      y += rh;
    }
    return out;
  }

  // "bees": a tone-on-tone grid of worker bees (Man City away). Kind 0 = body, kind 1 = wings.
  function beeShapes() {
    const out = [];
    const K = GW > 300 ? 1.5 : 1;
    const dx = 40 * K, dy = 34 * K, s = 1.25 * K;
    const ell = (cx, cy, rx, ry, rot) => {
      const pts = [];
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
        pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
      }
      return pts;
    };
    for (let row = 0, y = 6; y < 112; row++, y += dy) {
      for (let x = (row % 2 ? dx / 2 : 0) + 8; x < GW + dx; x += dx) {
        out.push([1, 0.65, ell(x - 6.5 * s, y - 1 * s, 7.5 * s, 3.4 * s, -0.55)]);
        out.push([1, 0.65, ell(x + 6.5 * s, y - 1 * s, 7.5 * s, 3.4 * s, 0.55)]);
        out.push([0, 0.8, ell(x, y + 3 * s, 3.4 * s, 6.6 * s, 0)]);
        out.push([0, 0.8, ell(x, y - 5 * s, 2.6 * s, 2.6 * s, 0)]);
        [0, 3, 6].forEach(o => out.push([1, 0.9, [[x - 3.4 * s, y + (o + 1) * s], [x + 3.4 * s, y + (o + 1) * s], [x + 3.4 * s, y + (o + 1.8) * s], [x - 3.4 * s, y + (o + 1.8) * s]]]));
      }
    }
    return out;
  }

  // "vbars": wide soft vertical bars each flanked by a thin rule, tone-on-tone (Dortmund third).
  function vbarShapes() {
    const out = [];
    const K = GW > 300 ? 1.7 : 1;
    const p = 14 * K;
    for (let x = 2; x < GW + p; x += p) {
      out.push([0, 0.55, [[x, -2], [x + 6 * K, -2], [x + 6 * K, 102], [x, 102]]]);
      out.push([0, 0.35, [[x + 10 * K, -2], [x + 10.9 * K, -2], [x + 10.9 * K, 102], [x + 10 * K, 102]]]);
    }
    return out;
  }

  // "marble": flowing, ink-marbling-like ribbons in up to three band colours that swell and thin
  // along a drifting noise field (Leverkusen away). Kinds: 0 = deepest, 1 = middle, 2 = lightest.
  // On banners it thickens toward the right edge, where the sleeves are.
  function marbleShapes() {
    const out = [];
    const warp = noise2(3), warp2 = noise2(11), tone = noise2(23), width = noise2(37);
    const K = GW > 300 ? 1.6 : 1;
    const gap = 2.6 * K;
    for (let yb = -12; yb < 114; yb += gap) {
      const parts = [];
      let run = null;
      for (let x = -6; x <= GW + 6; x += 3) {
        const rt = GW > 300 ? Math.min(1, Math.max(0, (x / GW - 0.05) / 0.7)) : 0.8;
        const rightness = rt * rt * (3 - 2 * rt);
        const y = yb + 12 * K * (warp(x * 0.028 / K, yb * 0.02) * 2 - 1) + 4.5 * K * (warp2(x * 0.09 / K, yb * 0.05) * 2 - 1);
        const t = tone(x * 0.04 / K, yb * 0.045);
        const w = (2.7 + 4.6 * width(x * 0.07 / K + 5, yb * 0.06)) * K * (0.15 + 0.95 * rightness);
        const kind = t > 0.6 ? 0 : t > 0.38 ? 1 : 2;
        if (w > 0.7 * K) {
          if (run && run.kind !== kind) { parts.push(run); run = null; }
          if (!run) run = { kind, pts: [] };
          run.pts.push([x, y, w]);
        } else if (run) {
          parts.push(run);
          run = null;
        }
      }
      if (run) parts.push(run);
      parts.forEach(r => {
        if (r.pts.length < 2) return;
        out.push([r.kind, 0.88, r.pts.map(q => [q[0], q[1] - q[2] / 2]).concat(r.pts.map(q => [q[0], q[1] + q[2] / 2]).reverse())]);
      });
    }
    return out;
  }

  // "rings": soft spray-paint circles drawn as feathered rings, plus a solid side panel at the
  // right end (West Ham third). Kind 0 = ring, kind 1 = panel.
  function ringShapes() {
    const out = [];
    const rnd = seeded(23);
    const K = GW > 300 ? 1.7 : 1;
    const circle = (cx, cy, r, n) => {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      return pts;
    };
    const taken = [];
    const count = Math.round((5 * GW) / 200 / (K > 1 ? 1.2 : 1));
    for (let tries = 0; tries < 400 && taken.length < count; tries++) {
      const r = (20 + rnd() * 26) * K, cx = rnd() * GW, cy = rnd() * 100;
      if (taken.some(t => Math.hypot(cx - t[0], cy - t[1]) < (r + t[2]) * 0.7)) continue;
      taken.push([cx, cy, r]);
      [[5.2, 0.12], [3.6, 0.2], [2.4, 0.3], [1.4, 0.45]].forEach(b => {
        const o = circle(cx, cy, r + b[0] * K, 36), i = circle(cx, cy, r - b[0] * K, 36);
        for (let j = 0; j < 36; j++) {
          const j2 = (j + 1) % 36;
          out.push([0, b[1], [o[j], o[j2], i[j2], i[j]]]);
        }
      });
    }
    out.push([1, 1, [[GW + 1, -1], [GW - 34 * K, -1], [GW - 28 * K, 101], [GW + 1, 101]]]);
    return out;
  }

  const STRIPE_GEN = {
    crosses: () => stripeShapes("crosses"), pinlines: () => stripeShapes("pinlines"), slashes: slashShapes,
    vee: veeShapes, scatter: scatterShapes, ornament: ornamentShapes, raglan: raglanShapes,
    streaks: streakShapes, swell: swellShapes, stars: starShapes,
    bruise: bruiseShapes, pole: poleShapes, swirls: swirlShapes, ticks: tickShapes, gridiron: gridironShapes, hexes: hexShapes,
    contours: contourShapes, golden: goldenShapes, vtex: vtexShapes, skewchecks: skewcheckShapes, bees: beeShapes,
    vbars: vbarShapes, marble: marbleShapes, rings: ringShapes
  };
  const STRIPE_CACHE = {};

  // Shapes for a pattern on a grid W units wide (100 high). Cards use the default 200.
  function stripeList(type, W) {
    const w = Math.round(W || 200);
    const key = type + ":" + w;
    if (!STRIPE_CACHE[key]) {
      GW = w;
      try { STRIPE_CACHE[key] = STRIPE_GEN[type](); } finally { GW = 200; }
    }
    return STRIPE_CACHE[key];
  }

  function stripeColors(p) {
    const b = p.bands || [];
    const red = b[0] || "#E31B2B";
    if (p.type === "crosses") return [red, b[1] || mix("#000000", red, 0.3)];
    if (p.type === "slashes") return [red, b[1] || red];
    if (p.type === "ornament") return [b[0] || "#000000"];
    if (p.type === "stars") return [b[0] || "#FFFFFF"];
    if (p.type === "bruise" || p.type === "ticks" || p.type === "hexes") return [b[0] || "#FFFFFF"];
    if (p.type === "pole") return [b[0] || "#1C2C5B", b[1] || "#6CABDD"];
    if (p.type === "contours" || p.type === "golden" || p.type === "skewchecks" || p.type === "vbars") return [b[0] || "#FFFFFF"];
    if (p.type === "vtex") return [b[0] || "#0E1642", b[1] || "#3E5CB0"];
    if (p.type === "bees") return [b[0] || "#2E2B28", b[1] || b[0] || "#2E2B28"];
    if (p.type === "marble") return [b[0] || "#1B3358", b[1] || "#4F7FA6", b[2] || "#CFE3EA"];
    if (p.type === "rings") return [b[0] || "#1FA6C4", b[1] || "#1A9AB0"];
    if (p.type === "swirls") return [b[0] || "#2BB3E0", b[1] || b[0] || "#6FD0F0", b[2] || b[0] || "#BFE9F7"];
    if (p.type === "gridiron") return [b[0] || "#14233F", b[1] || "#C8102E"];
    if (p.type === "swell") return [b[0] || "#BB2534", b[1] || "#7A1220"];
    if (p.type === "streaks") return [b[0] || "#FFFFFF", b[1] || "#005187"];
    if (p.type === "raglan") return [b[0] || "#FFFFFF", b[1] || "#7A1426", b[2] || "#8B0F1D"];
    if (p.type === "scatter") return [b[0] || "#FFFFFF", b[1] || "#F7B4BE"];
    if (p.type === "vee") return [b[0] || "#111111", b[1] || "#E31835", b[2] || "#E8A824"];
    return [red, p.base, b[1] || red];
  }

  function stripeSvg(p) {
    const c = stripeColors(p);
    const groups = {};
    const order = [];
    stripeList(p.type).forEach(r => {
      const key = r[0] + "|" + r[1].toFixed(2);
      if (!groups[key]) { groups[key] = ""; order.push(key); }
      groups[key] += "M" + r[2].map(q => q[0].toFixed(1) + " " + q[1].toFixed(1)).join("L") + "Z";
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice">' +
      (p.type === "scatter" ? dotGridSvg(p.dots || "rgba(255,255,255,0.32)") : "") +
      order.map(key => {
        const parts = key.split("|");
        return '<path fill="' + c[+parts[0]] + '" opacity="' + parts[1] + '" d="' + groups[key] + '"/>';
      }).join("") + "</svg>";
  }

  function lineList(p) {
    return (p.lines && p.lines.length ? p.lines : [[(p.bands && p.bands[0]) || "#000000", 0.3, 0.34]]);
  }

  function linesSvg(p) {
    const rects = lineList(p).map(l => '<rect x="0" y="' + (l[1] * 100) + '" width="100" height="' + ((l[2] - l[1]) * 100) + '" fill="' + l[0] + '"/>').join("");
    const fade = p.fade
      ? '<defs><linearGradient id="f" x1="0" x2="1" y1="0" y2="0"><stop offset="0.55" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>' +
        '<mask id="m"><rect width="100" height="100" fill="url(#f)"/></mask></defs><g mask="url(#m)">' + rects + "</g>"
      : rects;
    return "url('data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">' + fade + "</svg>") + "') center / 100% 100% no-repeat, " + p.base;
  }

  function pct(n) {
    return (n * 100).toFixed(2) + "%";
  }

  function css(p) {
    const b = p.bands || [];
    if (STRIPE_GEN[p.type]) {
      return "url('data:image/svg+xml," + encodeURIComponent(stripeSvg(p)) + "') center / cover no-repeat, " + p.base;
    }
    if (p.type === "shards") {
      return "url('data:image/svg+xml," + encodeURIComponent(shardsSvg(p)) + "') center / cover no-repeat, " + p.base;
    }
    if (p.type === "burst") {
      return "url('data:image/svg+xml," + encodeURIComponent(burstSvg(p)) + "') center / cover no-repeat, " + p.base;
    }
    if (p.type === "dots") {
      return "url('data:image/svg+xml," + encodeURIComponent(dotsSvg(b[0] || "#FFFFFF")) + "') center / cover no-repeat, " + p.base;
    }
    if (p.type === "stripes") {
      return "repeating-linear-gradient(90deg, " + p.base + " 0 18%, " + b[0] + " 18% 30%)";
    }
    if (p.type === "pinstripe") {
      const start = pct(0.17 - (p.width ?? 0.02));
      return "repeating-linear-gradient(90deg, " + p.base + " 0 " + start + ", " + b[0] + " " + start + " 17%)";
    }
    if (p.type === "bolts") {
      return boltSvg(p) + " center / 100% 100% no-repeat, " + p.base;
    }
    if (p.type === "gradient") {
      return "linear-gradient(180deg, " + p.base + ", " + (b[0] || p.base) + ")";
    }
    if (p.type === "fade") {
      // left half base colour, softly blending into the band colour on the right (Cagliari)
      const fr = p.range || FADE;
      return "linear-gradient(90deg, " + p.base + " 0 " + pct(fr[0]) + ", " + (b[0] || p.base) + " " + pct(fr[1]) + " 100%)";
    }
    if (p.type === "sleeves") {
      const c = b[0] || "#FFFFFF";
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">' +
        '<polygon points="' + SLEEVE_L.map(pt => pt.join(",")).join(" ") + '" fill="' + c + '"/>' +
        '<polygon points="' + SLEEVE_L.map(([px, py]) => [100 - px, py].join(",")).join(" ") + '" fill="' + c + '"/></svg>';
      return "url('data:image/svg+xml," + encodeURIComponent(svg) + "') center / 100% 100% no-repeat, " + p.base;
    }
    if (p.type === "zigzag") {
      return zigzagSvg(p) + " center / 100% 100% no-repeat, " + p.base;
    }
    if (p.type === "waves") {
      return wavesSvg(p);
    }
    if (p.type === "thick-waves") {
      return thickWavesSvg(p);
    }
    if (p.type === "lightning") {
      const c = b[0] || "#FFFFFF";
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="' +
        RAYO_BOLT.map(pt => pt.join(",")).join(" ") + '" fill="' + c + '"/></svg>';
      return "url('data:image/svg+xml," + encodeURIComponent(svg) + "') right center / auto 100% no-repeat, " + p.base;
    }
    if (p.type === "triangles") {
      const c = b[0] || "#FFFFFF";
      const svg = trianglesSvg(c, 0.12, 1);
      return "url('data:image/svg+xml," + encodeURIComponent(svg) + "') center / 100% 100% no-repeat, " + p.base;
    }
    if (p.type === "chevron") {
      return chevronSvg(p);
    }
    if (p.type === "centreband") {
      const stops = p.stops || CB;
      const edge = b[0] || "#FFFFFF";
      const mid = b[1] || edge;
      return "linear-gradient(90deg, " + p.base + " 0 " + pct(stops[0]) + ", " + edge + " " + pct(stops[0]) + " " + pct(stops[1]) + ", " +
        mid + " " + pct(stops[1]) + " " + pct(stops[2]) + ", " + edge + " " + pct(stops[2]) + " " + pct(stops[3]) + ", " + p.base + " " + pct(stops[3]) + " 100%)";
    }
    if (p.type === "band") {
      const edge = b[0] || "#FFFFFF";
      const mid = b[1] || edge;
      return "linear-gradient(180deg, " + p.base + " 0 " + pct(BAND[0]) + ", " + edge + " " + pct(BAND[0]) + " " + pct(BAND[1]) + ", " +
        mid + " " + pct(BAND[1]) + " " + pct(BAND[2]) + ", " + edge + " " + pct(BAND[2]) + " " + pct(BAND[3]) + ", " + p.base + " " + pct(BAND[3]) + " 100%)";
    }
    if (p.type === "sash") {
      return sashSvg(p) + " center / 100% 100% no-repeat, " + p.base;
    }
    if (p.type === "diamonds") {
      return diamondsSvg(p);
    }
    if (p.type === "lines") {
      return linesSvg(p);
    }
    if (p.type === "tipping") {
      const c = b.length ? b : ["#000000"];
      const stops = [p.base + " 0 " + pct(TIP[0][0])];
      TIP.forEach(([from, to], i) => {
        stops.push(c[i % c.length] + " " + pct(from) + " " + pct(to));
        stops.push(p.base + " " + pct(to) + " " + pct(i + 1 < TIP.length ? TIP[i + 1][0] : 1));
      });
      return "linear-gradient(180deg, " + stops.join(", ") + ")";
    }
    if (p.type === "split") {
      return splitSvg(p) + " center / 100% 100% no-repeat, " + p.base;
    }
    if (p.type === "cross") {
      const white = b[0] || "#FFFFFF";
      const blue = b[1] || "#00205B";
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">' +
        '<rect width="100" height="100" fill="' + p.base + '"/>' +
        '<rect x="0" y="42" width="100" height="16" fill="' + white + '"/>' +
        '<rect x="28" y="0" width="16" height="100" fill="' + white + '"/>' +
        '<rect x="0" y="47" width="100" height="6" fill="' + blue + '"/>' +
        '<rect x="33" y="0" width="6" height="100" fill="' + blue + '"/>' +
        '</svg>';
      return "url('data:image/svg+xml," + encodeURIComponent(svg) + "') center / 100% 100% no-repeat, " + p.base;
    }
    if (p.type === "checks") {
      const c = b[0] || "#000000";
      let cells = "";
      for (let r = 0; r < CHECKS; r++) {
        for (let q = r % 2; q < CHECKS; q += 2) cells += '<rect x="' + q + '" y="' + r + '" width="1" height="1"/>';
      }
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + CHECKS + " " + CHECKS + '" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges"><g fill="' + c + '">' + cells + "</g></svg>";
      return "url('data:image/svg+xml," + encodeURIComponent(svg) + "') center / cover no-repeat, " + p.base;
    }
    if (p.type === "hoops") {
      const stops = [];
      let pos = 0;
      hoops(p).forEach(h => {
        stops.push(p.base + " " + pct(pos) + " " + pct(h.from));
        stops.push(h.color + " " + pct(h.from) + " " + pct(h.to));
        pos = h.to;
      });
      stops.push(p.base + " " + pct(pos) + " 100%");
      return "linear-gradient(180deg, " + stops.join(", ") + ")";
    }
    return p.base;
  }

  function draw(ctx, x, y, w, h, p) {
    const b = p.bands || [];
    ctx.fillStyle = p.base;
    ctx.fillRect(x, y, w, h);
    if (p.type === "stripes" || p.type === "pinstripe") {
      const period = w * (p.type === "stripes" ? 0.3 : 0.17);
      const bandW = p.type === "stripes" ? period * 0.4 : w * (p.width ?? 0.02);
      const offset = 1 - bandW / period;
      ctx.fillStyle = b[0];
      for (let sx = x; sx < x + w; sx += period) ctx.fillRect(sx + period * offset, y, bandW, h);
    } else if (p.type === "diamonds") {
      const colors = b.length >= 3 ? b.slice(0, 3) : b.concat(Array(3 - b.length).fill(b[0] || "#FFFFFF"));
      const segment = w / colors.length;
      const gap = 2.5;
      colors.forEach((color, i) => {
        const x0 = x + i * segment + gap * 0.7;
        const x1 = x + (i + 1) * segment - gap * 0.7;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x0, y + h * 0.06);
        ctx.lineTo(x0, y + h * 0.34);
        ctx.lineTo(x1, y + h * 0.96);
        ctx.lineTo(x1, y + h * 0.68);
        ctx.closePath();
        ctx.fill();
      });
    } else if (p.type === "bolts") {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.strokeStyle = b[0] || "#FFFFFF";
      ctx.lineJoin = "miter";
      ctx.lineWidth = BOLT_W * (w + h) / 200;
      BOLT_X.forEach((cx, i) => {
        ctx.beginPath();
        boltPoints(cx, i === 1).forEach(([px, py], j) => {
          const X = x + (px / 100) * w;
          const Y = y + (py / 100) * h;
          if (j) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
        });
        ctx.stroke();
      });
      ctx.restore();
    } else if (p.type === "hoops") {
      hoops(p).forEach(hp => {
        ctx.fillStyle = hp.color;
        ctx.fillRect(x, y + h * hp.from, w, h * (hp.to - hp.from));
      });
    } else if (p.type === "sleeves") {
      ctx.fillStyle = b[0] || "#FFFFFF";
      [false, true].forEach(mirror => {
        ctx.beginPath();
        SLEEVE_L.forEach(([px, py], j) => {
          const X = x + ((mirror ? 100 - px : px) / 100) * w;
          const Y = y + (py / 100) * h;
          if (j) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
        });
        ctx.closePath();
        ctx.fill();
      });
    } else if (p.type === "zigzag") {
      const bands = b.length ? b : ["#FFFFFF"];
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.lineWidth = 3.5 * (w + h) / 200;
      ctx.lineJoin = "miter";
      ZZ_ROWS.forEach((ry, i) => {
        ctx.strokeStyle = bands[i % bands.length];
        ctx.beginPath();
        zigzagRow(ry).forEach(([px, py], j) => {
          const X = x + (px / 100) * w;
          const Y = y + (py / 100) * h;
          if (j) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
        });
        ctx.stroke();
      });
      ctx.restore();
    } else if (p.type === "waves") {
      const color = b[0] || "#FFFFFF";
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      const rows = Math.max(8, Math.round(h / 12));
      const amplitude = h * 0.04;
      const phase = 0.75;
      for (let i = 0; i < rows; i++) {
        const waveY = y + ((i + 0.5) / rows) * h;
        ctx.beginPath();
        for (let q = 0; q <= 80; q++) {
          const px = x + (q / 80) * w;
          const py = waveY + Math.sin((q / 80) * Math.PI * 2 * 2 + phase) * amplitude;
          if (q === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1.0, h * 0.006);
        ctx.lineCap = "round";
        ctx.globalAlpha = 0.24 + ((i % 4) + 1) * 0.14;
        ctx.stroke();
      }
      ctx.restore();
    } else if (p.type === "thick-waves") {
      const color = b[0] || "#FFFFFF";
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      const rows = Math.max(8, Math.round(h / 12));
      const amplitude = h * 0.04;
      const phase = 0.75;
      for (let i = 0; i < rows; i++) {
        const waveY = y + ((i + 0.5) / rows) * h;
        ctx.beginPath();
        for (let q = 0; q <= 80; q++) {
          const px = x + (q / 80) * w;
          const py = waveY + Math.sin((q / 80) * Math.PI * 2 * 2 + phase) * amplitude;
          if (q === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(5, h * 0.03);
        ctx.lineCap = "round";
        ctx.globalAlpha = 1;
        ctx.stroke();
      }
      ctx.restore();
    } else if (p.type === "lightning") {
      ctx.fillStyle = b[0] || "#FFFFFF";
      ctx.beginPath();
      RAYO_BOLT.forEach(([px, py], j) => {
        const X = x + w - h + (px / 100) * h;
        const Y = y + (py / 100) * h;
        if (j) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
      });
      ctx.closePath();
      ctx.fill();
    } else if (STRIPE_GEN[p.type]) {
      const s = Math.max(w / 200, h / 100);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      if (p.type === "scatter") dotGrid(ctx, x + (w - 200 * s) / 2, y + (h - 100 * s) / 2, s, p.dots || "rgba(255,255,255,0.32)");
      paintShards(ctx, x + (w - 200 * s) / 2, y + (h - 100 * s) / 2, s, stripeColors(p), stripeList(p.type));
      ctx.restore();
    } else if (p.type === "shards") {
      const s = Math.max(w / 200, h / 100);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      paintShards(ctx, x + (w - 200 * s) / 2, y + (h - 100 * s) / 2, s, shardColors(p));
      ctx.restore();
    } else if (p.type === "burst") {
      const c = burstColors(p);
      const s = Math.max(w / 200, h / 100);
      const ox = x + (w - 200 * s) / 2;
      const oy = y + (h - 100 * s) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      BURST.forEach(r => {
        ctx.globalAlpha = r[0] ? 0.9 : 0.58;
        ctx.fillStyle = c[r[0]];
        ctx.beginPath();
        r[1].forEach((q, i) => {
          if (i === 0) ctx.moveTo(ox + q[0] * s, oy + q[1] * s); else ctx.lineTo(ox + q[0] * s, oy + q[1] * s);
        });
        ctx.closePath();
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      const hx = ox + 148 * s, hy = oy + 34 * s;
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 46 * s);
      g.addColorStop(0, p.base);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      ctx.restore();
    } else if (p.type === "dots") {
      const s = Math.max(w / 200, h / 100);
      const ox = x + (w - 200 * s) / 2;
      const oy = y + (h - 100 * s) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.fillStyle = b[0] || "#FFFFFF";
      DOTS.forEach(d => {
        ctx.beginPath();
        ctx.arc(ox + d[0] * s, oy + d[1] * s, d[2] * s, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    } else if (p.type === "triangles") {
      const c = b[0] || "#FFFFFF";
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.ceil(w));
      off.height = Math.max(1, Math.ceil(h));
      const o = off.getContext("2d");
      for (let ty = 0; ty < off.height; ty += 16) {
        for (let tx = 0; tx < off.width; tx += 18) {
          o.beginPath();
          o.moveTo(tx + 9, ty);
          o.lineTo(tx + 18, ty + 16);
          o.lineTo(tx, ty + 16);
          o.closePath();
          o.globalAlpha = 0.55;
          o.strokeStyle = c;
          o.lineWidth = 1.1;
          o.stroke();
          o.beginPath();
          o.moveTo(tx + 9, ty);
          o.lineTo(tx + 9, ty + 16);
          o.lineTo(tx, ty + 16);
          o.closePath();
          o.globalAlpha = 0.22;
          o.fillStyle = c;
          o.fill();
        }
      }
      o.globalAlpha = 1;
      o.globalCompositeOperation = "destination-in";
      const fade = o.createLinearGradient(0, 0, 0, off.height);
      fade.addColorStop(0, "rgba(0,0,0,1)");
      fade.addColorStop(1, "rgba(0,0,0,0.12)");
      o.fillStyle = fade;
      o.fillRect(0, 0, off.width, off.height);
      ctx.drawImage(off, x, y, w, h);
    } else if (p.type === "chevron") {
      ctx.fillStyle = b[0] || "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w / 2, y + h);
      ctx.lineTo(x + w, y);
      ctx.closePath();
      ctx.fill();
    } else if (p.type === "centreband") {
      const stops = p.stops || CB;
      const edge = b[0] || "#FFFFFF";
      ctx.fillStyle = edge;
      ctx.fillRect(x + w * stops[0], y, w * (stops[3] - stops[0]), h);
      ctx.fillStyle = b[1] || edge;
      ctx.fillRect(x + w * stops[1], y, w * (stops[2] - stops[1]), h);
    } else if (p.type === "band") {
      const edge = b[0] || "#FFFFFF";
      ctx.fillStyle = edge;
      ctx.fillRect(x, y + h * BAND[0], w, h * (BAND[3] - BAND[0]));
      ctx.fillStyle = b[1] || edge;
      ctx.fillRect(x, y + h * BAND[1], w, h * (BAND[2] - BAND[1]));
    } else if (p.type === "sash") {
      ctx.fillStyle = b[0] || "#FFFFFF";
      ctx.beginPath();
      SASH.forEach(([px, py], j) => {
        const X = x + (px / 100) * w;
        const Y = y + (py / 100) * h;
        if (j) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
      });
      ctx.closePath();
      ctx.fill();
    } else if (p.type === "lines") {
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.round(w));
      off.height = Math.max(1, Math.round(h));
      const o = off.getContext("2d");
      lineList(p).forEach(l => {
        o.fillStyle = l[0];
        o.fillRect(0, off.height * l[1], off.width, off.height * (l[2] - l[1]));
      });
      if (p.fade) {
        const g = o.createLinearGradient(0, 0, off.width, 0);
        g.addColorStop(0.55, "rgba(0,0,0,1)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        o.globalCompositeOperation = "destination-in";
        o.fillStyle = g;
        o.fillRect(0, 0, off.width, off.height);
      }
      ctx.drawImage(off, x, y, w, h);
    } else if (p.type === "tipping") {
      const c = b.length ? b : ["#000000"];
      TIP.forEach(([from, to], i) => {
        ctx.fillStyle = c[i % c.length];
        ctx.fillRect(x, y + h * from, w, h * (to - from));
      });
    } else if (p.type === "fade") {
      const g = ctx.createLinearGradient(x, y, x + w, y);
      g.addColorStop((p.range || FADE)[0], p.base);
      g.addColorStop((p.range || FADE)[1], b[0] || p.base);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
    } else if (p.type === "gradient") {
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, p.base);
      g.addColorStop(1, b[0] || p.base);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
    } else if (p.type === "checks") {
      const cell = Math.max(w, h) / CHECKS;
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      ctx.fillStyle = b[0] || "#000000";
      for (let r = 0; r < rows; r++) {
        for (let q = r % 2; q < cols; q += 2) ctx.fillRect(x + q * cell, y + r * cell, cell, cell);
      }
    } else if (p.type === "split") {
      ctx.fillStyle = b[0] || p.base;
      ctx.beginPath();
      ZIG.forEach(([px, py], j) => {
        const X = x + (px / 100) * w;
        const Y = y + (py / 100) * h;
        if (j) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
      });
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y);
      ctx.closePath();
      ctx.fill();
    } else if (p.type === "cross") {
      const white = b[0] || "#FFFFFF";
      const blue = b[1] || "#00205B";
      ctx.fillStyle = p.base;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = white;
      ctx.fillRect(x, y + h * 0.42, w, h * 0.16);
      ctx.fillRect(x + w * 0.28, y, w * 0.16, h);
      ctx.fillStyle = blue;
      ctx.fillRect(x, y + h * 0.47, w, h * 0.06);
      ctx.fillRect(x + w * 0.33, y, w * 0.06, h);
    }
  }

  function hexRgb(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function mix(a, b, amount) {
    const x = hexRgb(a);
    const y = hexRgb(b);
    if (!x || !y) return b;
    const c = x.map((v, i) => Math.round(v * amount + y[i] * (1 - amount)));
    return "rgb(" + c.join(",") + ")";
  }

  function isLight(hex) {
    const c = hexRgb(hex);
    return !!c && (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255 > 0.85;
  }

  window.Kits = { ids, get, css, draw, mix, isLight, dots: DOTS, burst: BURST, burstList, shardList, shardColors, burstColors, shards: paintShards, stripes: { colors: stripeColors, list: stripeList, has: type => !!STRIPE_GEN[type], dots: dotGrid } };
})();