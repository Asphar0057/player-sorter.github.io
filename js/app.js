(function () {
  const TEAMS = {};
  const POSITIONS = {
    GK: "Goalkeeper",
    DF: "Defender",
    MF: "Midfielder",
    FW: "Forward"
  };
  const STORE_PREFIX = "squadsorter:v1:";
  const app = document.getElementById("app");

  let session = null;

  window.registerTeam = function (team) {
    TEAMS[team.id] = team;
  };

  function loadScript(src) {
    return new Promise(resolve => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => {
        console.warn("Could not load", src);
        resolve();
      };
      document.head.appendChild(s);
    });
  }

  function loadTeams() {
    const ids = window.SQUAD_MANIFEST.leagues.flatMap(l => l.teams);
    return Promise.all(ids.map(id => loadScript("data/teams/" + id + ".js")));
  }

  function esc(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function storeGet(key) {
    try {
      const raw = localStorage.getItem(STORE_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function storeSet(key, value) {
    try {
      localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value));
    } catch (e) {}
  }

  function storeDel(key) {
    try {
      localStorage.removeItem(STORE_PREFIX + key);
    } catch (e) {}
  }

  const PHOTO_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".JPG", ".PNG"];
  const CREST_EXTS = [".png", ".svg", ".webp", ".jpg", ".PNG", ".SVG"];

  function crestPaths(team) {
    if (team.crest) return [team.crest];
    return CREST_EXTS.map(ext => "assets/teams/" + team.id + "/crest" + ext);
  }

  function photoPaths(team, player) {
    if (player.photo) return [player.photo];
    return PHOTO_EXTS.map(ext => "assets/teams/" + team.id + "/players/" + player.id + ext);
  }

  function imgTag(paths) {
    return '<img class="swap-img" src="' + esc(paths[0]) + '" data-alts="' + esc(paths.slice(1).join("|")) + '" alt="">';
  }

  function kitOf(team, id) {
    return Kits.get(team, id || storeGet("kit:" + team.id));
  }

  function themeVars(team, kit) {
    if (!team) return "";
    const k = kit || kitOf(team);
    return [
      "--club-primary:" + k.primary,
      "--club-on-primary:" + k.onPrimary,
      "--club-accent:" + k.accent,
      "--club-on-accent:" + k.onAccent,
      "--club-pattern:" + Kits.css(k.pattern),
      "--paper:" + k.paper,
      "--card:" + k.card,
      "--card-ink:" + k.ink,
      "--card-muted:" + k.muted,
      "--page-ink:" + k.onPaper,
      "--page-muted:" + k.onPaperMuted,
      "--page-hi:" + k.paperPrimary,
      "--page-on-hi:" + k.paperOnPrimary,
      "--line:" + k.line,
      "--row-tint:" + (k.rowTint || k.primary),
      "--crest-bg:" + (k.crestBg || "transparent"),
      "--crest-scale:" + (k.crestBg ? "0.68" : "1"),
      "--crest-radius:" + (k.crestBg ? "50%" : "0")
    ].join(";");
  }

  function applyTheme(team) {
    const root = document.documentElement;
    if (team) {
      const kit = kitOf(team);
      root.setAttribute("style", themeVars(team, kit));
      root.dataset.club = team.id;
      root.dataset.kit = kit.id;
      root.dataset.tone = kit.dark ? "dark" : "light";
    } else {
      root.removeAttribute("style");
      delete root.dataset.club;
      delete root.dataset.kit;
      delete root.dataset.tone;
    }
  }

  function setKit(team, id) {
    storeSet("kit:" + team.id, id);
    applyTheme(team);
    const vars = themeVars(team);
    document.querySelectorAll('[data-team="' + team.id + '"]').forEach(el => el.setAttribute("style", vars));
    document.querySelectorAll('input[name="site-kit"][data-team="' + team.id + '"]').forEach(i => {
      i.checked = i.value === id;
    });
    const kit = kitOf(team);
    document.querySelectorAll(".rank-row[data-rank]").forEach(el => {
      el.style.setProperty("--t", rowTint(kit, Number(el.dataset.rank)).toFixed(3));
    });
  }

  function kitSwitch(team, name, current, attr) {
    const ids = Kits.ids(team);
    if (ids.length < 2) return "";
    return (
      '<div class="seg kit-seg" role="radiogroup" aria-label="Colour mode">' +
      ids.map(id => {
        const k = kitOf(team, id);
        return (
          '<label class="seg-opt"><input type="radio" name="' + name + '" value="' + id + '"' +
          (attr ? ' data-team="' + team.id + '"' : "") +
          (id === current ? " checked" : "") + ">" +
          '<span><i class="swatch" style="background:' + Kits.css(k.pattern) + '"></i>' + esc(k.label) + "</span></label>"
        );
      }).join("") +
      "</div>"
    );
  }

  function kitPicker(team) {
    const sw = kitSwitch(team, "site-kit", kitOf(team).id, true);
    return sw ? '<div class="kit-picker"><span class="kit-label">Colors</span>' + sw + "</div>" : "";
  }

  function crestMarkup(team, cls, kit) {
    return (
      '<span class="crest ' + (cls || "") + '"' + (kit ? "" : ' data-team="' + team.id + '"') + ' style="' + themeVars(team, kit) + '">' +
        '<span class="crest-fallback">' + esc(team.monogram || team.shortName.slice(0, 3)) + "</span>" +
        imgTag(crestPaths(team)) +
      "</span>"
    );
  }

  function avatarMarkup(team, player, cls) {
    return (
      '<span class="avatar ' + (cls || "") + '" data-team="' + team.id + '" style="' + themeVars(team) + '">' +
        '<span class="avatar-fallback"><span>' + esc(player.number != null ? player.number : "") + "</span></span>" +
        imgTag(photoPaths(team, player)) +
      "</span>"
    );
  }

  function wireImages(scope) {
    scope.querySelectorAll("img.swap-img").forEach(img => {
      const ok = () => img.parentElement && img.parentElement.classList.add("has-img");
      const bad = () => {
        const alts = (img.dataset.alts || "").split("|").filter(Boolean);
        if (alts.length) {
          img.dataset.alts = alts.slice(1).join("|");
          img.src = alts[0];
        } else {
          img.remove();
        }
      };
      img.addEventListener("load", ok);
      img.addEventListener("error", bad);
      if (img.complete) img.naturalWidth ? ok() : bad();
    });
  }

  function lookup(key) {
    const [teamId, playerId] = key.split(":");
    const team = TEAMS[teamId];
    const player = team && team.players.find(p => p.id === playerId);
    return player ? { team, player } : null;
  }

  function render(html) {
    app.innerHTML = html;
    wireImages(app);
    window.scrollTo(0, 0);
  }

  function renderHome() {
    session = null;
    applyTheme(null);
    const leagues = window.SQUAD_MANIFEST.leagues.map(league => {
      const tiles = league.teams.filter(id => TEAMS[id]).map(id => {
        const team = TEAMS[id];
        const home = Kits.get(team, "home");
        const tile = Object.assign(
          { bg: home.paper, fg: home.onPaper, muted: home.onPaperMuted, pattern: home.pattern },
          team.tile || {}
        );
        const tileVars = [
          "--tile-bg:" + tile.bg,
          "--tile-fg:" + tile.fg,
          "--tile-muted:" + tile.muted,
          "--tile-pattern:" + Kits.css(tile.pattern)
        ].join(";");
        return (
          '<button type="button" class="team-tile team-tile-club" data-go="' + team.id + '" style="' + tileVars + '">' +
            crestMarkup(team, "crest-md", home) +
            '<span class="team-tile-text">' +
              '<span class="team-tile-name">' + esc(team.name) + "</span>" +
              '<span class="team-tile-meta">' + team.players.length + " players · " + esc(team.season) + "</span>" +
            "</span>" +
          "</button>"
        );
      }).join("");
      return (
        '<section class="league">' +
          '<h2 class="league-name">' + esc(league.name) + '</h2>' +
          '<div class="team-grid">' + tiles +
          '</div>' +
        '</section>'
      );
    }).join("");

    render(
      '<section class="hero">' +
        '<p class="eyebrow">Player Sorter</p>' +
        "<h1>Pick a club &amp; start ranking</h1>" +
        '<p class="hero-sub">Pick your favorite of two players until, eventually, you get your full squad ranking. First team lists and positions are taken from Wikipedia and UEFA. Photos taken from UEFA.<br>More clubs coming soon.</p>' +
      "</section>" +
      leagues
    );
  }

  function creditsMarkup(team) {
    const credited = team.players.filter(p => p.credit);
    if (!credited.length) return "";
    return (
      '<details class="credits">' +
        "<summary>Photo credits</summary>" +
        "<ul>" +
          credited.map(p =>
            "<li><b>" + esc(p.name) + ":</b> " +
            (p.creditUrl
              ? '<a href="' + esc(p.creditUrl) + '" target="_blank" rel="noopener">' + esc(p.credit) + "</a>"
              : esc(p.credit)) +
            "</li>"
          ).join("") +
        "</ul>" +
      "</details>"
    );
  }

  function renderTeamSetup(team) {
    session = null;
    applyTheme(team);
    const saved = storeGet(team.id);
    const counts = {};
    team.players.forEach(p => { counts[p.position] = (counts[p.position] || 0) + 1; });

    const chips = Object.keys(POSITIONS).filter(k => counts[k]).map(k =>
      '<label class="chip"><input type="checkbox" name="pos" value="' + k + '" checked>' +
      '<span>' + POSITIONS[k] + "s <b>" + counts[k] + "</b></span></label>"
    ).join("");

    let resume = "";
    if (saved && saved.state) {
      const pct = Math.round(MergeSorter.progress(saved.state) * 100);
      resume = saved.state.done
        ? '<button class="btn btn-ghost" data-act="last">See your last ranking</button>'
        : '<button class="btn btn-ghost" data-act="resume">Resume where you left off (' + pct + "%)</button>";
    }

    render(
      '<section class="setup">' +
        '<button type="button" class="back-link" data-go="">← All clubs</button>' +
        '<div class="setup-head">' +
          crestMarkup(team, "crest-lg") +
          "<div>" +
            '<p class="eyebrow">' + esc(team.season) + " squad</p>" +
            "<h1>" + esc(team.name) + "</h1>" +
          "</div>" +
          kitPicker(team) +
        "</div>" +
        '<div class="setup-body">' +
          '<p class="setup-label">Choose who to include in your ranking:</p>' +
          '<div class="chips">' + chips + "</div>" +
          '<p class="setup-estimate" id="estimate"></p>' +
          '<div class="setup-actions">' +
            '<button class="btn btn-primary" data-act="start">Start sorting</button>' +
            resume +
          "</div>" +
        "</div>" +
        '<div class="roster">' +
          team.players.map(p =>
            '<div class="roster-item" data-pos="' + p.position + '">' + avatarMarkup(team, p, "avatar-sm") +
            '<span class="roster-name">' + esc(p.name) + "</span>" +
            '<span class="roster-pos">' + p.position + "</span></div>"
          ).join("") +
        "</div>" +
        creditsMarkup(team) +
      "</section>"
    );

    const selected = () => [...app.querySelectorAll('input[name="pos"]:checked')].map(i => i.value);
    const pool = () => team.players.filter(p => selected().includes(p.position));
    const estimate = app.querySelector("#estimate");
    const startBtn = app.querySelector('[data-act="start"]');
    const update = () => {
      const on = selected();
      app.querySelectorAll(".roster-item").forEach(el => el.classList.toggle("is-out", !on.includes(el.dataset.pos)));
      const n = pool().length;
      startBtn.disabled = n < 2;
      estimate.textContent = n < 2
        ? "Pick at least two players to rank."
        : n + " players · at most " + MergeSorter.worstChoices(n) + " matchups";
    };
    app.querySelectorAll('input[name="pos"]').forEach(i => i.addEventListener("change", update));
    update();

    startBtn.addEventListener("click", () => {
      const ids = pool().map(p => team.id + ":" + p.id);
      startSession(team, MergeSorter.create(ids));
    });
    const resumeBtn = app.querySelector('[data-act="resume"]');
    if (resumeBtn) resumeBtn.addEventListener("click", () => startSession(team, saved.state));
    const lastBtn = app.querySelector('[data-act="last"]');
    if (lastBtn) lastBtn.addEventListener("click", () => {
      session = { team, state: saved.state };
      renderResults();
    });
  }

  function startSession(team, state) {
    session = { team, state };
    renderMatchup();
  }

  function cardMarkup(side, key) {
    const { team, player } = lookup(key);
    return (
      '<button class="pick-card" data-pick="' + side + '" data-team="' + team.id + '" style="' + themeVars(team) + '">' +
        '<span class="pick-media">' +
          '<span class="avatar avatar-card">' +
            '<span class="avatar-fallback"><span>' + esc(player.number != null ? player.number : "") + "</span></span>" +
            imgTag(photoPaths(team, player)) +
          "</span>" +
          crestMarkup(team, "crest-card") +
        "</span>" +
        '<span class="pick-info">' +
          '<span class="pick-pos">' + POSITIONS[player.position] + "</span>" +
          '<span class="pick-name">' + esc(player.name) + "</span>" +
          '<span class="pick-meta">#' + esc(player.number) + " · " + esc(player.nation || "") + "</span>" +
        "</span>" +
        '<span class="pick-key">' + (side === "left" ? "←" : "→") + "</span>" +
      "</button>"
    );
  }

  function renderMatchup() {
    const { team, state } = session;
    applyTheme(team);
    storeSet(team.id, { state });
    if (state.done) {
      renderResults();
      return;
    }
    const pair = MergeSorter.current(state);
    const pct = Math.round(MergeSorter.progress(state) * 100);
    render(
      '<section class="battle">' +
        '<div class="battle-top">' +
          '<span class="battle-count">Matchup ' + (state.choices + 1) + "</span>" +
          '<span class="battle-pct">' + pct + "% sorted</span>" +
        "</div>" +
        '<div class="progress"><span style="width:' + pct + '%"></span></div>' +
        '<h2 class="battle-q">Who do you prefer?</h2>' +
        '<div class="arena">' +
          cardMarkup("left", pair.left) +
          '<span class="vs">VS</span>' +
          cardMarkup("right", pair.right) +
        "</div>" +
        '<div class="battle-actions">' +
          '<button class="btn btn-ghost" data-act="undo"' + (state.history.length ? "" : " disabled") + ">Undo</button>" +
          '<button class="btn btn-tie" data-pick="tie">Can\'t choose (tie)</button>' +
          '<button class="btn btn-ghost" data-act="quit">Save &amp; exit</button>' +
        "</div>" +
        '<div class="battle-kit">' + kitSwitch(team, "site-kit", kitOf(team).id, true) + "</div>" +
        '<p class="hint">Keyboard: ← / → to pick, ↓ for a tie, Backspace to undo</p>' +
      "</section>"
    );
    app.querySelectorAll("[data-pick]").forEach(el =>
      el.addEventListener("click", () => pick(el.dataset.pick))
    );
    app.querySelector('[data-act="undo"]').addEventListener("click", doUndo);
    app.querySelector('[data-act="quit"]').addEventListener("click", () => renderTeamSetup(team));
  }

  function pick(which) {
    if (!session || session.state.done) return;
    MergeSorter.choose(session.state, which);
    renderMatchup();
  }

  function doUndo() {
    if (session && MergeSorter.undo(session.state)) renderMatchup();
  }

  function siteUrl() {
    if (window.SQUAD_MANIFEST.siteUrl) return window.SQUAD_MANIFEST.siteUrl;
    const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    return location.protocol.startsWith("http") && !local ? location.origin + location.pathname : "";
  }

  function shareEntries(ranking) {
    const out = [];
    ranking.forEach(row => row.ids.forEach(key => {
      const hit = lookup(key);
      if (!hit) return;
      out.push({
        key,
        rank: row.rank,
        tied: row.ids.length > 1,
        team: hit.team,
        player: hit.player,
        positionLabel: POSITIONS[hit.player.position],
        photoSrc: photoPaths(hit.team, hit.player)
      });
    }));
    return out;
  }

  function caption(team, entries) {
    const top = entries.slice(0, 3).map(e => e.rank + (e.tied ? "=" : "") + ". " + e.player.name).join("\n");
    return "My " + team.shortName + " ranking (" + team.season + ")\n" + top;
  }

  function toast(message) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 4200);
  }

  function segmented(name, options, value) {
    return (
      '<div class="seg" role="radiogroup">' +
      options.map(o =>
        '<label class="seg-opt"><input type="radio" name="' + name + '" value="' + o.value + '"' +
        (o.value === value ? " checked" : "") + "><span>" + o.label + "</span></label>"
      ).join("") +
      "</div>"
    );
  }

  function openShare(team, entries) {
    const n = entries.length;
    const modes = [{ value: "top3", label: "Top 3" }];
    if (n > 3) modes.push({ value: "top10", label: "Top 10" });
    if (n > 10) modes.push({ value: "full", label: "Full squad" });
    const opts = { format: "story", mode: n > 10 ? "full" : modes[modes.length - 1].value, kit: kitOf(team).id };
    const kitFor = t => (t.id === team.id ? kitOf(t, opts.kit) : kitOf(t));
    const url = siteUrl();
    let canvas = null;
    let renderId = 0;

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("style", themeVars(team));
    modal.innerHTML =
      '<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="shareTitle">' +
        '<div class="modal-head">' +
          '<h2 id="shareTitle">Share your ranking</h2>' +
          '<button type="button" class="modal-close" data-act="close" aria-label="Close">×</button>' +
        "</div>" +
        '<div class="modal-body">' +
          '<div class="share-preview"><div class="share-loading">Drawing your ranking…</div></div>' +
          '<div class="share-controls">' +
            '<p class="setup-label">Shape</p>' +
            segmented("format", [{ value: "story", label: "Story 9:16" }, { value: "post", label: "Post 4:5" }], opts.format) +
            '<p class="setup-label">Show</p>' +
            segmented("mode", modes, opts.mode) +
            (Kits.ids(team).length > 1 ? '<p class="setup-label">Colors</p>' + kitSwitch(team, "kit", opts.kit, false) : "") +
            '<div class="share-buttons">' +
              '<button type="button" class="btn btn-primary" data-act="download">Download image</button>' +
              '<button type="button" class="btn btn-social btn-ig" data-act="ig">Instagram story</button>' +
              '<button type="button" class="btn btn-social btn-x" data-act="x">Post on X</button>' +
            "</div>" +
            '<p class="share-note" id="shareNote"></p>' +
          "</div>" +
        "</div>" +
      "</div>";
    document.body.appendChild(modal);
    document.body.classList.add("modal-open");

    const preview = modal.querySelector(".share-preview");
    const note = modal.querySelector("#shareNote");
    const fileShare = ShareImage.canShareFiles();

    const fileName = format => team.id + "-ranking-" + opts.mode + "-" + opts.kit + "-" + format + ".png";

    async function draw() {
      const id = ++renderId;
      preview.classList.add("busy");
      const c = await ShareImage.render({
        format: opts.format,
        mode: opts.mode,
        team,
        entries,
        siteUrl: url,
        crestSrc: crestPaths(team),
        kitFor
      });
      if (id !== renderId) return;
      canvas = c;
      preview.innerHTML = "";
      preview.appendChild(c);
      preview.classList.remove("busy");
      preview.dataset.format = opts.format;
      if (c.photosDropped) toast("Photos can't go in the image when the page is opened as a file. They will once it's on a server or GitHub Pages.");
    }

    async function storyCanvas() {
      if (opts.format === "story" && canvas) return canvas;
      return ShareImage.render({ format: "story", mode: opts.mode, team, entries, siteUrl: url, crestSrc: crestPaths(team), kitFor });
    }

    function close() {
      modal.remove();
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKey);
    }

    function onKey(e) {
      if (e.key === "Escape") close();
    }

    async function shareFile(file, text) {
      try {
        await navigator.share(text ? { files: [file], text } : { files: [file] });
      } catch (e) {
        if (e && e.name !== "AbortError") {
          ShareImage.download(file);
          toast("Sharing didn't open, so the image was downloaded instead.");
        }
      }
    }

    modal.addEventListener("change", e => {
      if (e.target.name === "format" || e.target.name === "mode" || e.target.name === "kit") {
        opts[e.target.name] = e.target.value;
        draw();
      }
    });

    modal.addEventListener("click", async e => {
      if (e.target === modal) return close();
      const act = e.target.closest("[data-act]");
      if (!act || !canvas) {
        if (act && act.dataset.act === "close") close();
        return;
      }
      if (act.dataset.act === "close") return close();

      if (act.dataset.act === "download") {
        ShareImage.download(ShareImage.canvasToFile(canvas, fileName(opts.format)));
      }

      if (act.dataset.act === "x") {
        const text = caption(team, entries) + (url ? "\n\nRank yours:" : "");
        if (fileShare) {
          await shareFile(ShareImage.canvasToFile(canvas, fileName(opts.format)), text + (url ? " " + url : ""));
        } else {
          const intent = "https://x.com/intent/tweet?text=" + encodeURIComponent(text) + (url ? "&url=" + encodeURIComponent(url) : "");
          window.open(intent, "_blank", "noopener");
          ShareImage.download(ShareImage.canvasToFile(canvas, fileName(opts.format)));
          toast("Image downloaded. Attach it to your post on X.");
        }
      }

      if (act.dataset.act === "ig") {
        const c = await storyCanvas();
        const file = ShareImage.canvasToFile(c, fileName("story"));
        if (fileShare) {
          await shareFile(file);
        } else {
          ShareImage.download(file);
          toast("Story image downloaded. Send it to your phone and add it to your Instagram story.");
        }
      }
    });

    document.addEventListener("keydown", onKey);
    modal.querySelector(".modal-close").focus();
    draw();
  }

  function rankScale(rank) {
    return Math.max(0, (4 - rank) / 3);
  }

  function rowTint(kit, rank) {
    const sc = rankScale(rank);
    if (sc <= 0) return 0;
    const strength = kit.rowTintStrength != null ? kit.rowTintStrength : 0.07;
    const floor = kit.rowTintFloor || 0;
    return strength * (floor + (1 - floor) * sc);
  }

  function renderResults() {
    const { team, state } = session;
    const kit = kitOf(team);
    applyTheme(team);
    const ranking = MergeSorter.ranking(state);
    const rows = [];
    ranking.forEach(row => row.ids.forEach(key => {
      const hit = lookup(key);
      if (!hit) return;
      const tied = row.ids.length > 1;
      rows.push(
        '<li class="rank-row" data-rank="' + row.rank + '" style="--s:' + rankScale(row.rank).toFixed(3) + ";--t:" + rowTint(kit, row.rank).toFixed(3) + '">' +
          '<span class="rank-num">' + row.rank + (tied ? '<small>=</small>' : "") + "</span>" +
          '<span class="rank-slot">' + avatarMarkup(hit.team, hit.player, "avatar-rank") + "</span>" +
          '<span class="rank-text">' +
            '<span class="rank-name">' + esc(hit.player.name) + "</span>" +
            '<span class="rank-meta">' + POSITIONS[hit.player.position] + " · #" + esc(hit.player.number) + "</span>" +
          "</span>" +
        "</li>"
      );
    }));

    render(
      '<section class="results">' +
        '<button type="button" class="back-link" data-go="">← All clubs</button>' +
        '<div class="setup-head">' +
          crestMarkup(team, "crest-lg") +
          "<div>" +
            '<p class="eyebrow">Your ranking</p>' +
            "<h1>" + esc(team.name) + "</h1>" +
          "</div>" +
          kitPicker(team) +
        "</div>" +
        '<div class="setup-actions results-actions">' +
          '<button class="btn btn-primary" data-act="share">Share ranking</button>' +
          '<button class="btn btn-ghost" data-act="again">Sort again</button>' +
          '<button type="button" class="btn btn-ghost" data-go="">All clubs</button>' +
        "</div>" +
        '<ol class="rank-list">' + rows.join("") + "</ol>" +
      "</section>"
    );

    app.querySelector('[data-act="share"]').addEventListener("click", () => openShare(team, shareEntries(ranking)));
    app.querySelector('[data-act="again"]').addEventListener("click", () => {
      storeDel(team.id);
      renderTeamSetup(team);
    });
  }

  function isValidSaved(team, saved) {
    if (!saved || !saved.state) return false;
    try {
      return MergeSorter.allIds(saved.state).every(key => lookup(key) && key.startsWith(team.id + ":"));
    } catch (e) {
      return false;
    }
  }

  function go(id) {
    try {
      history.pushState(null, "", id ? "#/" + id : location.pathname + location.search);
    } catch (e) {}
    show(id);
  }

  function route() {
    show(location.hash.replace(/^#\/?/, ""));
  }

  function show(id) {
    const team = TEAMS[id];
    if (!team) {
      renderHome();
      return;
    }
    if (!isValidSaved(team, storeGet(team.id))) storeDel(team.id);
    renderTeamSetup(team);
  }

  document.addEventListener("keydown", e => {
    if (!session || session.state.done || !app.querySelector(".battle")) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); pick("left"); }
    else if (e.key === "ArrowRight") { e.preventDefault(); pick("right"); }
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); pick("tie"); }
    else if (e.key === "Backspace") { e.preventDefault(); doUndo(); }
  });

  app.addEventListener("change", e => {
    if (e.target.name === "site-kit" && TEAMS[e.target.dataset.team]) setKit(TEAMS[e.target.dataset.team], e.target.value);
  });

  app.addEventListener("click", e => {
    const target = e.target.closest("[data-go]");
    if (!target) return;
    e.preventDefault();
    go(target.dataset.go);
  });

  window.addEventListener("popstate", route);
  window.addEventListener("hashchange", route);
  loadTeams().then(route);
})();