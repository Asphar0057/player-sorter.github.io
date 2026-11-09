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

  // Radial ray burst on a 200x100 grid, centred near the top-right like the crest on the
  // New England Revolution home shirt. Wide wedges use the first band colour, thin streaks
  // the second (or white). Each entry is [kind, points] where kind 0 = wedge, 1 = streak.
  const BURST = (function () {
    const out = [];
    const cx = 148, cy = 34, far = 320, n = 26;
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
  })();

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
  const SHARDS = (function () {
    const out = [];
    let seed = 11;
    const rnd = function () {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const U = 5, cols = 40, rows = 20;
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
    out.push([1, 1, [[0, 0], [19, 0], [11, 100], [0, 100]]]);
    out.push([1, 1, [[200, 0], [181, 0], [189, 100], [200, 100]]]);
    for (let i = 0; i < 70; i++) {
      const left = i % 2 === 0;
      const gx = Math.floor(rnd() * 5);
      const gy = Math.floor(rnd() * 20);
      const x = left ? 20 - gx * 3.2 - gy * 0.4 : 177 + gx * 3.2 + gy * 0.4;
      out.push([0, 0.3 + rnd() * 0.3, [[x, gy * 5], [x + 3, gy * 5], [x + 3, gy * 5 + 3], [x, gy * 5 + 3]]]);
    }
    return out;
  })();

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
    for (let i = 0; i < 5; i++) {
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
    for (let i = -16; i < 60; i++) {
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
    const slope = 0.4, thick = 14.8, gap = 4;
    [-22, -7.6, 6.8].forEach((y0, kind) => {
      out.push([kind, 1, [[-1, y0 - 0.5], [100 - gap, y0 + (101 - gap) * slope], [100 - gap, y0 + (101 - gap) * slope + thick], [-1, y0 + thick - 0.5]]]);
      out.push([kind, 1, [[201, y0 - 0.5], [100 + gap, y0 + (101 - gap) * slope], [100 + gap, y0 + (101 - gap) * slope + thick], [201, y0 + thick - 0.5]]]);
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
    for (let tries = 0; tries < 900 && placed < 60; tries++) {
      const isTri = placed % 3 === 2;
      if (isTri) {
        const cx = rnd() * 200, cy = -2 + rnd() * 104;
        const s = 3.2 + rnd() * 3.6;
        if (!clear([[cx, cy, s * 1.25]])) continue;
        const flip = rnd() < 0.5 ? -1 : 1;
        out.push([1, 0.5, [[cx - s * flip, cy + s], [cx + s * flip, cy + s], [cx + (rnd() - 0.5) * s, cy - s]]]);
        taken.push([cx, cy, s * 1.25]);
      } else {
        const cx = rnd() * 200, cy = -2 + rnd() * 104;
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
  function dotGrid(ctx, ox, oy, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let row = 0, y = 1.7; y < 100; row++, y = 1.7 + row * 3.4) {
      for (let x = 1.7 + (row % 2 ? 1.7 : 0); x < 200; x += 3.4) {
        ctx.moveTo(ox + (x + 0.4) * s, oy + y * s);
        ctx.arc(ox + x * s, oy + y * s, 0.4 * s, 0, Math.PI * 2);
      }
    }
    ctx.fill();
  }

  function dotGridSvg(color) {
    return '<defs><pattern id="d" width="3.4" height="3.4" patternUnits="userSpaceOnUse"><circle cx="0.85" cy="0.85" r="0.4" fill="' + color + '"/><circle cx="2.55" cy="2.55" r="0.4" fill="' + color + '"/></pattern></defs><rect width="200" height="100" fill="url(#d)"/>';
  }

  // "raglan": white sleeve panels at both ends with three thin shoulder stripes, a checkered
  // cuff strip at the outer edges and a checkered collar band at the top centre, on the base
  // colour (Arsenal home). Kinds: 0 sleeve panel, 1 shoulder stripe, 2 check squares.
  function raglanShapes() {
    const out = [];
    const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const sq = 2.4;
    [false, true].forEach(right => {
      const mx = x => (right ? 200 - x : x);
      const poly = pts => pts.map(q => [mx(q[0]), q[1]]);
      out.push([0, 1, poly([[-1, -1], [27, -1], [36, 101], [-1, 101]])]);
      [0, 1, 2].forEach(i => {
        const o = 4 + i * 3.4;
        out.push([1, 1, poly([[27 - o - 1.6, -1], [27 - o, -1], [36 - o + 0.1, 101], [36 - o - 1.5, 101]])]);
      });
      for (let r = 0; r * sq < 101; r++) {
        for (let c = 0; c < 2; c++) {
          if ((r + c) % 2) continue;
          const x0 = c * sq;
          out.push([2, 1, right ? rect(200 - x0 - sq, r * sq - 1, sq, sq) : rect(x0, r * sq - 1, sq, sq)]);
        }
      }
    });
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 28; c++) {
        if ((r + c) % 2) continue;
        out.push([2, 1, rect(70 + c * sq, 13 + r * sq, sq, sq)]);
      }
    }
    return out;
  }

  // "ornament": delicate tone-on-tone line work (nested diamonds with small knot motifs and
  // dotted lines) in the first band colour, like the Fiorentina 2026/27 home shirt.
  function ornamentShapes() {
    const out = [];
    const A = 0.8;
    const seg = (x1, y1, x2, y2, w) => {
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
    [[100, 50], [-10, 50], [210, 50]].forEach((c, n) => {
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

  const STRIPE_SHAPES = { crosses: stripeShapes("crosses"), pinlines: stripeShapes("pinlines"), slashes: slashShapes(), vee: veeShapes(), scatter: scatterShapes(), ornament: ornamentShapes(), raglan: raglanShapes() };

  function stripeColors(p) {
    const b = p.bands || [];
    const red = b[0] || "#E31B2B";
    if (p.type === "crosses") return [red, b[1] || mix("#000000", red, 0.3)];
    if (p.type === "slashes") return [red, b[1] || red];
    if (p.type === "ornament") return [b[0] || "#000000"];
    if (p.type === "raglan") return [b[0] || "#FFFFFF", b[1] || "#7A1426", b[2] || "#8B0F1D"];
    if (p.type === "scatter") return [b[0] || "#FFFFFF", b[1] || "#F7B4BE"];
    if (p.type === "vee") return [b[0] || "#111111", b[1] || "#E31835", b[2] || "#E8A824"];
    return [red, p.base, b[1] || red];
  }

  function stripeSvg(p) {
    const c = stripeColors(p);
    const d = c.map(() => "");
    const al = c.map(() => 1);
    STRIPE_SHAPES[p.type].forEach(r => {
      al[r[0]] = r[1];
      d[r[0]] += "M" + r[2].map(q => q[0].toFixed(1) + " " + q[1].toFixed(1)).join("L") + "Z";
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice">' +
      (p.type === "scatter" ? dotGridSvg(p.dots || "rgba(255,255,255,0.32)") : "") +
      c.map((col, i) => d[i] ? '<path fill="' + col + '" opacity="' + al[i] + '" d="' + d[i] + '"/>' : "").join("") + "</svg>";
  }

  function lineList(p) {
    return (p.lines && p.lines.length ? p.lines : [[(p.bands && p.bands[0]) || "#000000", 0.3, 0.34]]);
  }

  function linesSvg(p) {
    const rects = lineList(p).map(l => '<rect x="0" y="' + (l[1] * 100) + '" width="100" height="' + ((l[2] - l[1]) * 100) + '" fill="' + l[0] + '"/>').join("");
    const fade = p.fade
      ? '<defs><linearGradient id="f" x1="0" x2="1" y1="0" y2="0"><stop offset="0.25" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>' +
        '<mask id="m"><rect width="100" height="100" fill="url(#f)"/></mask></defs><g mask="url(#m)">' + rects + "</g>"
      : rects;
    return "url('data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">' + fade + "</svg>") + "') center / 100% 100% no-repeat, " + p.base;
  }

  function pct(n) {
    return (n * 100).toFixed(2) + "%";
  }

  function css(p) {
    const b = p.bands || [];
    if (STRIPE_SHAPES[p.type]) {
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
      return "repeating-linear-gradient(90deg, " + p.base + " 0 15%, " + b[0] + " 15% 17%)";
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
      const edge = b[0] || "#FFFFFF";
      const mid = b[1] || edge;
      return "linear-gradient(90deg, " + p.base + " 0 " + pct(CB[0]) + ", " + edge + " " + pct(CB[0]) + " " + pct(CB[1]) + ", " +
        mid + " " + pct(CB[1]) + " " + pct(CB[2]) + ", " + edge + " " + pct(CB[2]) + " " + pct(CB[3]) + ", " + p.base + " " + pct(CB[3]) + " 100%)";
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
      const offset = p.type === "stripes" ? 0.6 : 15 / 17;
      const bandW = period * (p.type === "stripes" ? 0.4 : 2 / 17);
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
    } else if (STRIPE_SHAPES[p.type]) {
      const s = Math.max(w / 200, h / 100);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      if (p.type === "scatter") dotGrid(ctx, x + (w - 200 * s) / 2, y + (h - 100 * s) / 2, s, p.dots || "rgba(255,255,255,0.32)");
      paintShards(ctx, x + (w - 200 * s) / 2, y + (h - 100 * s) / 2, s, stripeColors(p), STRIPE_SHAPES[p.type]);
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
      const edge = b[0] || "#FFFFFF";
      ctx.fillStyle = edge;
      ctx.fillRect(x + w * CB[0], y, w * (CB[3] - CB[0]), h);
      ctx.fillStyle = b[1] || edge;
      ctx.fillRect(x + w * CB[1], y, w * (CB[2] - CB[1]), h);
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
        g.addColorStop(0.25, "rgba(0,0,0,1)");
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

  window.Kits = { ids, get, css, draw, mix, isLight, dots: DOTS, burst: BURST, shards: paintShards, stripes: { colors: stripeColors, shapes: STRIPE_SHAPES, dots: dotGrid } };
})();