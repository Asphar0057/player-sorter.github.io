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
  const MANIFEST = window.SQUAD_MANIFEST;
  const SECTIONS = MANIFEST.sections || [];
  const SHOW_FIRST = MANIFEST.showFirst || 5;
  const INDEX = {};
  const LOADING = {};
  const EXPANDED = {};

  SECTIONS.forEach(section => (section.groups || []).forEach(group => (group.teams || []).forEach(id => {
    INDEX[id] = { section, group, dir: section.id + "/" + group.id + "/" + id };
  })));

  let session = null;
  let navToken = 0;

  window.registerTeam = function (team) {
    TEAMS[team.id] = team;
  };

  function loadScript(src) {
    return new Promise(resolve => {
      const s = document.createElement("script");
      s.src = window.SITE_VERSION ? src + "?v=" + window.SITE_VERSION : src;
      s.onload = resolve;
      s.onerror = () => {
        console.warn("Could not load", src);
        resolve();
      };
      document.head.appendChild(s);
    });
  }

  function ensureTeam(id) {
    if (TEAMS[id]) return Promise.resolve(TEAMS[id]);
    const entry = INDEX[id];
    if (!entry) return Promise.resolve(null);
    if (!LOADING[id]) {
      LOADING[id] = loadScript("data/teams/" + entry.dir + ".js").then(() => {
        if (!TEAMS[id]) delete LOADING[id];
        return TEAMS[id] || null;
      });
    }
    return LOADING[id];
  }

  function assetDir(team) {
    const entry = INDEX[team.id];
    return "assets/teams/" + (entry ? entry.dir : team.id) + "/";
  }

  function sectionOf(team) {
    const entry = team && INDEX[team.id];
    return entry ? entry.section.id : "";
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

  const PHOTO_EXTS = [".webp", ".jpg", ".png"];
  const CREST_EXTS = [".png", ".svg", ".webp"];

  function crestPaths(team) {
    if (team.crest) return [team.crest];
    return CREST_EXTS.map(ext => assetDir(team) + "crest" + ext);
  }

  function photoPaths(team, player) {
    if (player.photo) return [player.photo];
    return PHOTO_EXTS.map(ext => assetDir(team) + "players/" + player.id + ext);
  }

  function imgTag(paths) {
    return '<img class="swap-img" src="' + esc(paths[0]) + '" data-alts="' + esc(paths.slice(1).join("|")) + '" alt="" decoding="async">';
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

  function render(html, keepScroll) {
    app.innerHTML = html;
    wireImages(app);
    if (!keepScroll) window.scrollTo(0, 0);
  }

  function teamTile(team) {
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
  }

  function blobColours(group) {
    const all = (group.teams || []).filter(id => INDEX[id]);
    const hidden = all.slice(SHOW_FIRST).filter(id => TEAMS[id]);
    const source = hidden.length ? hidden : all.slice(0, SHOW_FIRST).filter(id => TEAMS[id]);
    const colours = [];
    source.forEach(id => {
      const kit = Kits.get(TEAMS[id], "home");
      [kit.paper, kit.accent].forEach(c => {
        if (c && colours.indexOf(c) < 0) colours.push(c);
      });
    });
    return colours.concat(["#a55448", "#262f61", "#c8a24a"]).slice(0, 3);
  }

  function blobMarkup(colours, extraClass) {
    return (
      '<span class="glass-blobs' + (extraClass ? " " + extraClass : "") + '" aria-hidden="true">' +
        colours.map(c => '<i style="background:' + esc(c) + '"></i>').join("") +
      "</span>"
    );
  }

  function visibleIds(group) {
    const ids = (group.teams || []).filter(id => INDEX[id]);
    return EXPANDED[group.id] ? ids : ids.slice(0, SHOW_FIRST);
  }

  const SOON_ICONS = {
    shirt: '<svg viewBox="0 0 48 48"><path d="M17 6 6 11.5l4.5 9.5 5-2.2V42h17V18.8l5 2.2 4.5-9.5L31 6c-1.2 3.2-3.9 5-7 5s-5.8-1.8-7-5z" fill="currentColor"/></svg>',
    trophy: '<svg viewBox="0 0 48 48"><path d="M14 6h20v9a10 10 0 0 1-20 0z" fill="currentColor"/><path d="M14 9H8v3.5a6.5 6.5 0 0 0 7 6.5M34 9h6v3.5a6.5 6.5 0 0 1-7 6.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M21 25h6v8h-6zM15 35h18v7H15z" fill="currentColor"/></svg>'
  };

  function comingSoon(section) {
    const soon = section.soon || {};
    const live = SECTIONS.find(s => (s.groups || []).some(g => (g.teams || []).some(id => INDEX[id])));
    const back = live && live !== section
      ? '<button type="button" class="btn soon-cta" data-go="' + live.id + '">Rank ' + esc(live.name.toLowerCase()) + " instead</button>"
      : "";
    const chips = (soon.preview || []).map(name => '<span class="soon-chip">' + esc(name) + "</span>").join("");
    return (
      '<section class="soon">' +
        blobMarkup(soon.colours || ["#a55448", "#262f61", "#c8a24a"], "soon-blobs") +
        '<div class="soon-card">' +
          '<span class="soon-icon" aria-hidden="true">' + (SOON_ICONS[soon.icon] || SOON_ICONS.shirt) + "</span>" +
          '<p class="soon-eyebrow">Coming soon</p>' +
          '<h2 class="soon-title">' + esc(soon.title || section.name + " are on the way") + "</h2>" +
          '<p class="soon-text">' + esc(soon.text || "New squads are being added. Check back soon.") + "</p>" +
          (chips ? '<div class="soon-chips">' + chips + "</div>" : "") +
          back +
        "</div>" +
        '<div class="soon-ghosts" aria-hidden="true"><span></span><span></span><span></span></div>' +
      "</section>"
    );
  }

  function homeBody(section, groups) {
    const body = groups.map(group => {
      const all = (group.teams || []).filter(id => INDEX[id]);
      const tiles = visibleIds(group).filter(id => TEAMS[id]).map(id => teamTile(TEAMS[id])).join("");
      if (!tiles) return "";
      const hiddenCount = all.length - SHOW_FIRST;
      const more = hiddenCount > 0
        ? '<button type="button" class="team-tile see-more-tile" data-more="' + group.id + '" aria-expanded="' + !!EXPANDED[group.id] + '">' +
            blobMarkup(blobColours(group)) +
            '<span class="see-more-arrow' + (EXPANDED[group.id] ? " is-up" : "") + '" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            "</span>" +
            '<span class="team-tile-text">' +
              '<span class="team-tile-name">' + (EXPANDED[group.id] ? "Show less" : "See all " + all.length) + "</span>" +
              '<span class="team-tile-meta">' +
                (EXPANDED[group.id] ? "Back to the first " + SHOW_FIRST : "+" + hiddenCount + " more") +
              "</span>" +
            "</span>" +
          "</button>"
        : "";
      return (
        '<section class="league">' +
          '<h2 class="league-name">' + esc(group.name) + "</h2>" +
          '<div class="team-grid">' + tiles + more + "</div>" +
        "</section>"
      );
    }).join("");
    return body || comingSoon(section);
  }

  function placeIndicator(animate) {
    const nav = app.querySelector(".tabs");
    const pill = nav && nav.querySelector(".tab-indicator");
    const active = nav && nav.querySelector('.tab[aria-selected="true"]');
    if (!pill || !active) return;
    if (!animate) pill.style.transition = "none";
    pill.style.width = active.offsetWidth + "px";
    pill.style.transform = "translateX(" + active.offsetLeft + "px)";
    if (!animate) {
      void pill.offsetWidth;
      pill.style.transition = "";
    }
  }

  function selectTab(section) {
    app.querySelectorAll(".tabs .tab").forEach(tab => tab.setAttribute("aria-selected", String(tab.dataset.go === section.id)));
    placeIndicator(true);
  }

  window.addEventListener("resize", () => placeIndicator(false));

  function renderHome(sectionId, token, keepScroll, afterRender) {
    session = null;
    applyTheme(null);
    const section = SECTIONS.find(s => s.id === sectionId) || SECTIONS[0];
    if (!section) return;
    const groups = section.groups || [];
    const ids = groups.flatMap(visibleIds);

    const mounted = app.querySelector(".home-body");
    const fromIndex = mounted ? SECTIONS.findIndex(s => s.id === mounted.dataset.section) : -1;
    const switching = !!mounted && fromIndex !== SECTIONS.indexOf(section);
    const animateSwitch = switching && !REDUCE_MOTION;
    const started = Date.now();
    if (switching) {
      selectTab(section);
      if (animateSwitch) {
        mounted.classList.remove("enter-left", "enter-right");
        mounted.classList.add("is-leaving");
      }
    }

    Promise.all(ids.map(ensureTeam)).then(() => {
      if (token !== navToken) return;
      const wait = animateSwitch ? Math.max(0, TAB_LEAVE_MS - (Date.now() - started)) : 0;
      setTimeout(() => {
        if (token !== navToken) return;
        paintHome(section, groups, token, keepScroll, afterRender, mounted, switching, fromIndex);
      }, wait);
    });
  }

  function paintHome(section, groups, token, keepScroll, afterRender, mounted, switching, fromIndex) {
    const body = homeBody(section, groups);

    if (mounted && app.contains(mounted)) {
      mounted.innerHTML = body;
      mounted.dataset.section = section.id;
      mounted.classList.remove("is-leaving", "enter-left", "enter-right");
      wireImages(mounted);
      if (switching) {
        const hero = app.querySelector(".hero");
        const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;
        if (window.scrollY > heroBottom) window.scrollTo({ top: heroBottom, behavior: REDUCE_MOTION ? "auto" : "smooth" });
        if (!REDUCE_MOTION) {
          void mounted.offsetWidth;
          mounted.classList.add(SECTIONS.indexOf(section) > fromIndex ? "enter-right" : "enter-left");
        }
      }
    } else {
      const tabs = SECTIONS.length > 1
        ? '<nav class="tabs" role="tablist">' +
            '<span class="tab-indicator" aria-hidden="true"></span>' +
            SECTIONS.map(s =>
              '<button type="button" class="tab" role="tab" data-go="' + s.id + '" aria-selected="' + (s === section) + '">' + esc(s.name) + "</button>"
            ).join("") +
          "</nav>"
        : "";
      render(
        '<section class="hero">' +
          '<p class="eyebrow">Player Sorter by @nicsginthings</p>' +
          "<h1>Pick a squad &amp; start ranking</h1>" +
          '<p class="hero-sub">Pick your favorite of two players until, eventually, you get your full squad ranking. First team lists and positions are taken from Wikipedia and UEFA. Photos taken from UEFA.<br>More clubs coming soon.</p>' +
        "</section>" +
        tabs +
        '<div class="home-body" data-section="' + section.id + '">' + body + "</div>",
        keepScroll
      );
      placeIndicator(false);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placeIndicator(false));
    }

    groups.forEach(group => {
      const hidden = (group.teams || []).filter(id => INDEX[id]).slice(SHOW_FIRST);
      if (EXPANDED[group.id] || !hidden.length || hidden.every(id => TEAMS[id])) return;
      Promise.all(hidden.map(ensureTeam)).then(() => {
        if (token !== navToken) return;
        const blobs = app.querySelector('[data-more="' + group.id + '"] .glass-blobs');
        if (blobs) blobs.outerHTML = blobMarkup(blobColours(group));
      });
    });

    app.querySelectorAll("[data-more]").forEach(btn => btn.addEventListener("click", () => toggleGroup(btn, section)));
    if (afterRender) afterRender();
  }

  const REDUCE_MOTION = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MOVE_MS = 340;
  const LEAVE_MS = 170;
  const TAB_LEAVE_MS = 140;

  function toggleGroup(btn, section) {
    if (btn.dataset.busy) return;
    btn.dataset.busy = "1";
    const groupId = btn.dataset.more;
    const collapsing = !!EXPANDED[groupId];
    const league = btn.closest(".league");
    const grid = league.querySelector(".team-grid");
    const gridRect = grid.getBoundingClientRect();
    const moreRect = btn.getBoundingClientRect();
    const before = {
      top: league.getBoundingClientRect().top,
      height: gridRect.height,
      dx: moreRect.left - gridRect.left,
      dy: moreRect.top - gridRect.top
    };
    const rerender = () => {
      EXPANDED[groupId] = !collapsing;
      renderHome(section.id, navToken, true, () => animateGroup(groupId, before, collapsing));
    };
    if (collapsing && !REDUCE_MOTION) {
      Array.from(grid.children)
        .filter(el => !el.classList.contains("see-more-tile"))
        .slice(SHOW_FIRST)
        .forEach(el => el.classList.add("tile-leave"));
      setTimeout(rerender, LEAVE_MS);
    } else {
      rerender();
    }
  }

  function animateGroup(groupId, before, collapsing) {
    const btn = app.querySelector('[data-more="' + groupId + '"]');
    if (!btn) return;
    const league = btn.closest(".league");
    const grid = league.querySelector(".team-grid");
    if (collapsing) window.scrollBy(0, league.getBoundingClientRect().top - before.top);
    if (REDUCE_MOTION) return;

    const gridRect = grid.getBoundingClientRect();
    const moreRect = btn.getBoundingClientRect();
    const shiftX = before.dx - (moreRect.left - gridRect.left);
    const shiftY = before.dy - (moreRect.top - gridRect.top);
    const ease = "cubic-bezier(0.22, 0.8, 0.24, 1)";

    grid.style.height = before.height + "px";
    grid.style.overflow = "hidden";
    btn.style.transform = "translate(" + shiftX + "px, " + shiftY + "px)";
    btn.style.transition = "none";

    if (!collapsing) {
      Array.from(grid.children)
        .filter(el => !el.classList.contains("see-more-tile"))
        .slice(SHOW_FIRST)
        .forEach((el, i) => {
          el.style.animationDelay = (60 + i * 45) + "ms";
          el.classList.add("tile-enter");
        });
    }

    void grid.offsetHeight;
    grid.style.transition = "height " + MOVE_MS + "ms " + ease;
    grid.style.height = gridRect.height + "px";
    btn.style.transition = "transform " + MOVE_MS + "ms " + ease;
    btn.style.transform = "";

    setTimeout(() => {
      grid.style.height = "";
      grid.style.overflow = "";
      grid.style.transition = "";
      btn.style.transition = "";
    }, MOVE_MS + 40);
    grid.querySelectorAll(".tile-enter").forEach(el => el.addEventListener("animationend", () => {
      el.classList.remove("tile-enter");
      el.style.animationDelay = "";
    }, { once: true }));
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
        '<button type="button" class="back-link" data-go="' + sectionOf(team) + '">← All squads</button>' +
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
    if (MANIFEST.siteUrl) return MANIFEST.siteUrl;
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

  function rankingLink(team, state) {
    const prefix = team.id + ":";
    const groups = (state.queue[0] || []).map(g => g.map(key => key.slice(prefix.length)).join("~"));
    return location.origin + location.pathname + "?club=" + encodeURIComponent(team.id) + "&r=" + groups.join(".");
  }

  function importRanking() {
    const params = new URLSearchParams(location.search);
    const club = params.get("club");
    const raw = params.get("r");
    if (!club || !raw) return Promise.resolve();
    params.delete("club");
    params.delete("r");
    return ensureTeam(club).then(team => {
      if (!team) return;
      const known = new Set(team.players.map(p => p.id));
      const groups = raw.split(".").map(g => g.split("~").filter(id => known.has(id)).map(id => team.id + ":" + id)).filter(g => g.length);
      const count = groups.reduce((n, g) => n + g.length, 0);
      if (count < 2) return;
      storeSet(team.id, {
        state: {
          queue: [groups], left: null, right: null, merged: null, i: 0, j: 0,
          placed: count, total: count, choices: 0, done: true, history: []
        }
      });
      const rest = params.toString();
      try {
        history.replaceState(null, "", location.pathname + (rest ? "?" + rest : "") + "#/" + team.id + "/results");
      } catch (e) {}
    });
  }

  function openShare(team, entries) {
    const n = entries.length;
    const modes = [{ value: "top3", label: "Top 3" }];
    if (n > 3) modes.push({ value: "top10", label: "Top 10" });
    if (n > 10) modes.push({ value: "full", label: "Full squad" });
    const opts = { format: "story", mode: n > 10 ? "full" : modes[modes.length - 1].value, kit: kitOf(team).id };
    const kitFor = t => (t.id === team.id ? kitOf(t, opts.kit) : kitOf(t));
    const escapeHref = ShareImage.needsBrowserEscape() && session && session.state.done ? rankingLink(team, session.state) : null;
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
            segmented("format", [
              { value: "story", label: "Story 9:16" },
              { value: "post", label: "Post 4:5" },
              { value: "square", label: "Square 1:1" },
              { value: "wide", label: "Wide 16:9" }
            ], opts.format) +
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
    if (escapeHref) {
      note.innerHTML = 'This app blocks saving images. <a class="share-escape" target="_blank" rel="noopener">Open your ranking in your browser</a> to download or share it.';
      note.querySelector(".share-escape").href = ShareImage.browserIntent(escapeHref);
    } else if (ShareImage.inAppBrowser()) {
      note.textContent = "Opened inside an app? Download still works (press and hold the image), but for one-tap sharing open this page in your browser: tap ⋯ then Open in browser.";
    }

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

    function deliver(c, file) {
      if (ShareImage.prefersSaveView()) {
        ShareImage.showSaveView(c, null, escapeHref);
        return false;
      }
      ShareImage.download(file);
      return true;
    }

    async function shareFile(file, text, c) {
      try {
        await navigator.share(text ? { files: [file], text } : { files: [file] });
      } catch (e) {
        if (e && e.name !== "AbortError") {
          if (deliver(c || canvas, file)) toast("Sharing didn't open, so the image was downloaded instead.");
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
        deliver(canvas, ShareImage.canvasToFile(canvas, fileName(opts.format)));
      }

      if (act.dataset.act === "x") {
        const text = caption(team, entries) + (url ? "\n\nRank yours:" : "");
        if (fileShare) {
          await shareFile(ShareImage.canvasToFile(canvas, fileName(opts.format)), text + (url ? " " + url : ""));
        } else {
          if (ShareImage.prefersSaveView()) {
            ShareImage.showSaveView(canvas, "Press and hold to save, then attach it to your post on X", escapeHref);
          } else {
            const intent = "https://x.com/intent/tweet?text=" + encodeURIComponent(text) + (url ? "&url=" + encodeURIComponent(url) : "");
            window.open(intent, "_blank", "noopener");
            ShareImage.download(ShareImage.canvasToFile(canvas, fileName(opts.format)));
            toast("Image downloaded. Attach it to your post on X.");
          }
        }
      }

      if (act.dataset.act === "ig") {
        const c = await storyCanvas();
        const file = ShareImage.canvasToFile(c, fileName("story"));
        if (fileShare) {
          await shareFile(file, null, c);
        } else if (ShareImage.prefersSaveView()) {
          ShareImage.showSaveView(c, "Press and hold to save, then add it to your Instagram story", escapeHref);
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
        '<button type="button" class="back-link" data-go="' + sectionOf(team) + '">← All squads</button>' +
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
          '<button type="button" class="btn btn-ghost" data-go="' + sectionOf(team) + '">All squads</button>' +
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
    document.querySelectorAll(".modal .modal-close").forEach(btn => btn.click());
    document.querySelectorAll(".save-view").forEach(el => el.remove());
    show(location.hash.replace(/^#\/?/, ""));
  }

  function show(id) {
    const token = ++navToken;
    const parts = id.split("/");
    if (!INDEX[parts[0]]) {
      renderHome(parts[0], token);
      return;
    }
    ensureTeam(parts[0]).then(team => {
      if (token !== navToken) return;
      if (!team) {
        renderHome("", token);
        return;
      }
      const saved = storeGet(team.id);
      if (!isValidSaved(team, saved)) {
        storeDel(team.id);
      } else if (parts[1] === "results" && saved.state.done) {
        session = { team, state: saved.state };
        renderResults();
        return;
      }
      renderTeamSetup(team);
    });
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
  importRanking().then(route);
})();