(function () {
  const FORMATS = {
    story: { w: 1080, h: 1920, head: 340, foot: 120 },
    post: { w: 1080, h: 1350, head: 240, foot: 96 }
  };
  const LIMITS = { top3: 3, top10: 10, full: Infinity };
  const GROWTH = 0.9;
  const MIN_ROW = 66;
  const MAX_ROW = 104;
  const PAD = 64;
  const DISPLAY = '"Barlow Condensed", "Arial Narrow", sans-serif';
  const BODY = '"Barlow", system-ui, sans-serif';
  const cache = new Map();

  function isRemote(src) {
    try {
      const url = new URL(src, location.href);
      return /^https?:$/.test(url.protocol) && url.origin !== location.origin;
    } catch (e) {
      return false;
    }
  }

  function loadOne(src) {
    if (cache.has(src)) return cache.get(src);
    const p = new Promise(resolve => {
      const img = new Image();
      if (isRemote(src)) img.crossOrigin = "anonymous";
      img.onload = () => resolve(img.naturalWidth ? img : null);
      img.onerror = () => resolve(null);
      img.src = src;
    });
    cache.set(src, p);
    return p;
  }

  async function loadImage(srcs) {
    const list = Array.isArray(srcs) ? srcs : srcs ? [srcs] : [];
    for (const src of list) {
      const img = await loadOne(src);
      if (img) return img;
    }
    return null;
  }

  async function loadFonts() {
    if (!document.fonts || !document.fonts.load) return;
    try {
      await Promise.all([
        document.fonts.load('800 italic 80px "Barlow Condensed"'),
        document.fonts.load('800 80px "Barlow Condensed"'),
        document.fonts.load('600 40px "Barlow Condensed"'),
        document.fonts.load('700 40px "Barlow"'),
        document.fonts.load('500 40px "Barlow"')
      ]);
    } catch (e) {}
  }

  function rr(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  function font(weight, size, family, italic) {
    return (italic ? "italic " : "") + weight + " " + Math.round(size) + "px " + family;
  }

  function fitSize(ctx, text, maxW, weight, start, min, family, italic) {
    let size = start;
    ctx.font = font(weight, size, family, italic);
    while (size > min && ctx.measureText(text).width > maxW) {
      size -= 2;
      ctx.font = font(weight, size, family, italic);
    }
    return size;
  }

  function ellipsize(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
    return t.trimEnd() + "…";
  }

  function drawAvatar(ctx, cx, cy, r, img, player, kit, ring) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    if (img) {
      ctx.fillStyle = kit.accent;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      const scale = Math.max((r * 2) / img.naturalWidth, (r * 2) / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, cx - dw / 2, cy - r, dw, dh);
    } else {
      Kits.draw(ctx, cx - r, cy - r, r * 2, r * 2, kit.pattern);
      const num = player.number != null ? String(player.number) : "";
      const size = r * 0.78;
      ctx.font = font(800, size, DISPLAY, true);
      const tw = ctx.measureText(num).width;
      const pw = tw + size * 0.5;
      const ph = size * 1.05;
      ctx.fillStyle = kit.accent;
      rr(ctx, cx - pw / 2, cy - ph / 2, pw, ph, ph * 0.3);
      ctx.fill();
      ctx.fillStyle = kit.onAccent;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(num, cx, cy + size * 0.04);
    }
    ctx.restore();
    if (ring) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.lineWidth = ring;
      ctx.strokeStyle = kit.card;
      ctx.stroke();
    }
  }

  function headerPattern(ctx, f, k) {
    const p = k.pattern || {};
    const band = (p.bands && p.bands[0]) || k.onHeader;
    const h = f.head - 14;
    ctx.save();
    if (p.type === "stripes") {
      ctx.globalAlpha = k.headerPatternAlpha != null ? k.headerPatternAlpha : 0.1;
      ctx.fillStyle = k.headerPatternAlpha != null ? band : k.onHeader;
      for (let x = 54; x < f.w; x += 108) ctx.fillRect(x, 0, 54, h);
    } else if (p.type === "pinstripe") {
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = band;
      for (let x = 46; x < f.w; x += 64) ctx.fillRect(x, 0, 4, h);
    } else if (p.type === "bolts") {
      const zig = [[0, 0], [-8, 0.12], [5, 0.24], [-8, 0.36], [5, 0.48], [-8, 0.6], [5, 0.72], [-8, 0.84], [5, 0.96], [0, 1]];
      ctx.strokeStyle = band;
      ctx.lineWidth = 5;
      ctx.lineJoin = "miter";
      [30, f.w - 30].forEach((cx, i) => {
        ctx.beginPath();
        zig.forEach(([dx, fy], j) => {
          const X = cx + (i ? -dx : dx);
          const Y = fy * h;
          if (j) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
        });
        ctx.stroke();
      });
    } else if (p.type === "zigzag") {
      const colors = p.bands && p.bands.length ? p.bands : [k.onHeader];
      const teeth = 9;
      const amp = 14;
      ctx.lineWidth = 6;
      ctx.lineJoin = "miter";
      ctx.globalAlpha = 0.9;
      [0.3, 0.55].forEach((fy, i) => {
        ctx.strokeStyle = colors[i % colors.length];
        ctx.beginPath();
        for (let t = 0; t <= teeth * 2; t++) {
          const X = f.w * 0.5 + (t * f.w * 0.5) / (teeth * 2);
          const Y = h * fy + (t % 2 ? -amp : amp);
          if (t) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
        }
        ctx.stroke();
      });
    } else if (p.type === "tipping") {
      const colors = p.bands && p.bands.length ? p.bands : [k.onHeader];
      const bandH = Math.round(f.head * 0.035);
      colors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(0, h - bandH * (2 * colors.length - 2 * i), f.w, bandH);
      });
    } else if (p.type === "gradient") {
      const g = ctx.createLinearGradient(0, 0, f.w, 0);
      g.addColorStop(0, p.base);
      g.addColorStop(1, band);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, f.w, h);
    } else if (p.type === "split") {
      const amp = 26;
      const steps = 6;
      const cx = f.w * 0.72;
      ctx.globalAlpha = k.headerPatternAlpha != null ? k.headerPatternAlpha : 0.9;
      ctx.fillStyle = band;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      for (let i = 1; i < steps; i++) ctx.lineTo(cx + (i % 2 ? amp : -amp), (h * i) / steps);
      ctx.lineTo(cx, h);
      ctx.lineTo(f.w, h);
      ctx.lineTo(f.w, 0);
      ctx.closePath();
      ctx.fill();
    } else if (p.type === "hoops") {
      const colors = p.bands && p.bands.length ? p.bands : [k.onHeader];
      const bandH = Math.round(f.head * 0.028);
      const gap = Math.round(bandH * 0.7);
      let y = h - 6 * bandH - 5 * gap - Math.round(f.head * 0.06);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.globalAlpha = 0.9;
        ctx.fillRect(f.w * 0.62, y, f.w * 0.38, bandH);
        y += bandH + gap;
      }
    }
    ctx.restore();
  }

  function drawHeader(ctx, f, k, team, crestImg, subtitle) {
    const t = { secondary: k.onHeader };
    ctx.fillStyle = k.header;
    ctx.fillRect(0, 0, f.w, f.head);
    headerPattern(ctx, f, k);
    ctx.fillStyle = k.headerBand;
    ctx.fillRect(0, f.head - 14, f.w, 14);

    let textX = PAD;
    const crestSize = f.head * 0.52;
    if (crestImg) {
      const s = Math.min(crestSize / crestImg.naturalWidth, crestSize / crestImg.naturalHeight);
      const w = crestImg.naturalWidth * s;
      const h = crestImg.naturalHeight * s;
      ctx.drawImage(crestImg, PAD + (crestSize - w) / 2, (f.head - 14 - h) / 2, w, h);
      textX = PAD + crestSize + 36;
    }
    const maxW = f.w - textX - PAD;
    const mid = (f.head - 14) / 2;
    const title = team.name.toUpperCase();
    const eSize = f.head * 0.075;
    const sSize = f.head * 0.07;
    const tSize = fitSize(ctx, title, maxW, 800, f.head * 0.26, 40, DISPLAY, true);
    const blockH = eSize + tSize * 0.95 + sSize * 1.7;
    const eBase = mid - blockH / 2 + eSize;
    const tBase = eBase + tSize * 0.95;
    const sBase = tBase + sSize * 1.7;

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = t.secondary;
    ctx.globalAlpha = 0.85;
    ctx.font = font(600, eSize, DISPLAY);
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = "4px";
    ctx.fillText("MY RANKING", textX, eBase);
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = "0px";
    ctx.globalAlpha = 1;

    ctx.font = font(800, tSize, DISPLAY, true);
    ctx.fillText(title, textX, tBase);

    ctx.globalAlpha = 0.85;
    ctx.font = font(500, sSize, BODY);
    ctx.fillText(subtitle, textX, sBase);
    ctx.globalAlpha = 1;
  }

  function rankScale(rank) {
    return Math.max(0, (4 - rank) / 3);
  }

  function columns(hMax) {
    const pad = Math.min(hMax * 0.28, 44);
    const rankW = Math.min(hMax * 0.5, 120) * 1.65;
    const slot = Math.min(hMax * 0.36, 96) * 2;
    const gap = Math.min(hMax * 0.26, 36);
    return { pad, rankW, slot, gap, nameOff: pad + rankW + slot + gap, twoLine: hMax >= 84 };
  }

  function weight(entry) {
    return 1 + GROWTH * rankScale(entry.rank);
  }

  function drawRow(ctx, x, y, w, h, entry, img, theme, showPos, cols) {
    const m = cols || columns(h);
    const sc = rankScale(entry.rank);
    const floor = theme.rowTintFloor || 0;
    const amount = sc > 0 ? (theme.rowTintStrength != null ? theme.rowTintStrength : 0.07) * (floor + (1 - floor) * sc) : 0;
    ctx.fillStyle = Kits.mix(theme.rowTint || theme.primary, theme.card, amount);
    rr(ctx, x, y, w, h, Math.min(20, h * 0.24));
    ctx.fill();

    const mid = y + h / 2;
    const pad = m.pad;
    const label = entry.rank + (entry.tied ? "=" : "");
    ctx.fillStyle = theme.primary;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const rankSize = Math.min(h * 0.5, 120);
    ctx.font = font(800, fitSize(ctx, label, m.rankW, 800, rankSize, 18, DISPLAY, true), DISPLAY, true);
    ctx.fillText(label, x + pad + m.rankW / 2, mid + h * 0.03);
    ctx.textAlign = "left";

    const ar = Math.min(h * 0.36, 96);
    const ax = x + pad + m.rankW + m.slot / 2;
    drawAvatar(ctx, ax, mid, ar, img, entry.player, entry.kit, 0);

    const nameX = x + m.nameOff;
    const twoLine = m.twoLine && h >= 56;
    const posInline = showPos && !twoLine;
    const posW = posInline ? h * 2.3 : 0;
    const maxName = x + w - nameX - posW - pad;
    const name = entry.player.name.toUpperCase();
    const size = fitSize(ctx, name, maxName, 800, Math.min(h * (twoLine ? 0.3 : 0.4), 84), 20, DISPLAY);
    ctx.fillStyle = theme.ink;
    ctx.font = font(800, size, DISPLAY);
    const nameText = ellipsize(ctx, name, maxName);

    if (twoLine) {
      const metaSize = Math.min(Math.max(18, h * 0.14), 32);
      ctx.textBaseline = "alphabetic";
      ctx.fillText(nameText, nameX, mid + size * 0.12);
      ctx.fillStyle = theme.muted;
      ctx.font = font(500, metaSize, BODY);
      ctx.fillText(entry.positionLabel + " · #" + entry.player.number, nameX, mid + size * 0.12 + metaSize * 1.35);
    } else {
      ctx.fillText(nameText, nameX, mid + h * 0.02);
      if (posInline) {
        ctx.fillStyle = theme.muted;
        ctx.textAlign = "right";
        ctx.font = font(600, h * 0.28, DISPLAY);
        ctx.fillText(entry.positionLabel.toUpperCase(), x + w - pad, mid);
      }
    }
  }

  function layoutList(ctx, f, shown, imgs, top, bottom, theme) {
    const avail = bottom - top;
    const fullW = f.w - PAD * 2;
    const maxFirst = f.h * 0.17;
    const sumW = shown.reduce((sum, e) => sum + weight(e), 0);
    const gapOf = h => Math.max(8, h * 0.1);

    let base = (avail - gapOf(70) * (shown.length - 1)) / sumW;
    base = Math.min(base, MAX_ROW, maxFirst / weight(shown[0]));

    if (base >= MIN_ROW) {
      const heights = shown.map(e => base * weight(e));
      const gaps = heights.slice(1).map(gapOf);
      const used = heights.reduce((a, h) => a + h, 0) + gaps.reduce((a, g) => a + g, 0);
      let y = top + Math.max(0, (avail - used) / 2);
      const cols = columns(heights[0]);
      shown.forEach((e, i) => {
        drawRow(ctx, PAD, y, fullW, heights[i], e, imgs.get(e.key), theme, true, cols);
        y += heights[i] + (gaps[i] || 0);
      });
      return;
    }

    const lead = shown.slice(0, Math.min(3, shown.length));
    const rest = shown.slice(lead.length);
    const perCol = Math.ceil(rest.length / 2);
    const colGap = 20;
    const colW = (fullW - colGap) / 2;
    const leadW = lead.reduce((sum, e) => sum + weight(e), 0);
    let c = avail / (leadW * 1.1 + perCol * 1.12 + 0.3);
    c = Math.min(c, MAX_ROW, maxFirst / weight(lead[0]));
    const leadH = lead.map(e => c * weight(e));
    const leadGaps = leadH.map(gapOf);
    const restGap = gapOf(c);
    const used = leadH.reduce((a, h) => a + h, 0) + leadGaps.reduce((a, g) => a + g, 0) + perCol * c + (perCol - 1) * restGap;
    let y = top + Math.max(0, (avail - used) / 2);
    const leadCols = columns(leadH[0]);
    const restCols = columns(c);
    lead.forEach((e, i) => {
      drawRow(ctx, PAD, y, fullW, leadH[i], e, imgs.get(e.key), theme, true, leadCols);
      y += leadH[i] + leadGaps[i];
    });
    rest.forEach((e, i) => {
      const col = Math.floor(i / perCol);
      const row = i % perCol;
      drawRow(ctx, PAD + col * (colW + colGap), y + row * (c + restGap), colW, c, e, imgs.get(e.key), theme, false, restCols);
    });
  }

  function drawFooter(ctx, f, siteUrl, creditNote, theme) {
    const y = f.h - f.foot;
    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD, y);
    ctx.lineTo(f.w - PAD, y);
    ctx.stroke();
    ctx.textBaseline = "middle";
    const lineY = y + f.foot / 2;
    ctx.textAlign = "left";
    ctx.fillStyle = theme.onPaper;
    ctx.font = font(800, 34, DISPLAY, true);
    ctx.fillText(siteUrl ? "RANK YOURS" : "bit.ly/player-sorter", PAD, creditNote ? lineY - 14 : lineY);
    if (siteUrl) {
      ctx.textAlign = "right";
      ctx.fillStyle = theme.paperPrimary;
      ctx.font = font(600, 28, BODY);
      ctx.fillText(siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""), f.w - PAD, creditNote ? lineY - 14 : lineY);
    }
    if (creditNote) {
      ctx.textAlign = "left";
      ctx.fillStyle = theme.onPaperMuted;
      ctx.font = font(500, 20, BODY);
      ctx.fillText(creditNote, PAD, lineY + 24);
    }
  }

  async function render(opts, allowImages) {
    const { format, mode, team, entries, siteUrl, subtitleExtra } = opts;
    const kitFor = opts.kitFor || (t => Kits.get(t));
    const kit = kitFor(team);
    const f = FORMATS[format];
    const useImages = allowImages !== false;
    await loadFonts();

    const limit = LIMITS[mode];
    const shown = entries.slice(0, Math.min(limit, entries.length));
    shown.forEach(e => { e.kit = kitFor(e.team); });

    const imgs = new Map();
    let crestImg = null;
    if (useImages) {
      crestImg = await loadImage(opts.crestSrc);
      await Promise.all(shown.map(async e => imgs.set(e.key, await loadImage(e.photoSrc))));
    }

    const canvas = document.createElement("canvas");
    canvas.width = f.w;
    canvas.height = f.h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = kit.paper;
    ctx.fillRect(0, 0, f.w, f.h);

    const modeLabel = mode === "top3" ? "Top 3" : mode === "top10" ? "Top 10" : "Full squad";
    drawHeader(ctx, f, kit, team, crestImg, team.season + " squad · " + modeLabel + (subtitleExtra || ""));

    layoutList(ctx, f, shown, imgs, f.head + 36, f.h - f.foot - 28, kit);

    const credited = shown.some(e => imgs.get(e.key) && e.player.credit);
    drawFooter(ctx, f, siteUrl, credited ? "Player photos via Wikimedia Commons. Full credits on the site." : "", kit);

    if (useImages) {
      try {
        ctx.getImageData(0, 0, 1, 1);
      } catch (e) {
        const fallback = await render(opts, false);
        fallback.photosDropped = true;
        return fallback;
      }
    }
    return canvas;
  }

  function canvasToFile(canvas, name) {
    const data = canvas.toDataURL("image/png");
    const bin = atob(data.split(",")[1]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new File([bytes], name, { type: "image/png" });
  }

  function canShareFiles() {
    try {
      const probe = new File([new Uint8Array(1)], "probe.png", { type: "image/png" });
      return !!(navigator.canShare && navigator.share && navigator.canShare({ files: [probe] }));
    } catch (e) {
      return false;
    }
  }

  function download(file) {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  window.ShareImage = { render, canvasToFile, canShareFiles, download, LIMITS };
})();