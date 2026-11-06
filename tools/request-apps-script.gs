const SHEET_NAME = "Requests";
const HEADERS = ["Received", "Type", "Category", "Squad", "Player / league", "Notes", "Squad id", "Page", "Status"];
const TYPES = { team: "Squad request", player: "Missing player" };
const STATUSES = ["New", "Added", "Not adding"];
const MAX_PER_MINUTE = 30;

const RANKINGS_SHEET = "Rankings";
const RANKING_HEADERS = ["Updated", "Squad id", "Players", "Ranking", "Key"];
const RANKINGS_PER_MINUTE = 120;
const STATS_MIN = 20;
const STATS_CACHE_SECONDS = 900;
const ID_PATTERN = /^[a-z0-9-]{1,60}$/;

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (data.website) return reply_(true);
    if (data.type === "ranking") return reply_(saveRanking_(data));

    const type = TYPES[data.type];
    if (!type) return reply_(false);
    if (data.type === "team" && !clean_(data.squad)) return reply_(false);
    if (data.type === "player" && !clean_(data.name)) return reply_(false);
    if (overLimit_("requests", MAX_PER_MINUTE)) return reply_(false);

    const sheet = getSheet_();
    sheet.appendRow([
      new Date(),
      type,
      clean_(data.category, 60),
      clean_(data.squad, 120),
      clean_(data.name, 120),
      clean_(data.notes, 500),
      clean_(data.squadId, 60),
      clean_(data.page, 200),
      "New"
    ]);
    return reply_(true);
  } catch (error) {
    return reply_(false);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.action === "stats") return json_(stats_(String(params.squad || "")));
  return reply_(true);
}

function setup() {
  getSheet_();
  getRankingsSheet_();
}

function saveRanking_(data) {
  const squad = String(data.squadId || "");
  const device = String(data.device || "");
  if (!ID_PATTERN.test(squad) || !/^[A-Za-z0-9-]{8,64}$/.test(device)) return false;
  if (!Array.isArray(data.order) || !data.order.length) return false;

  const seen = {};
  const order = [];
  for (const group of data.order) {
    if (!Array.isArray(group) || !group.length) return false;
    const ids = [];
    for (const id of group) {
      if (typeof id !== "string" || !ID_PATTERN.test(id) || seen[id]) return false;
      seen[id] = true;
      ids.push(id);
    }
    order.push(ids);
  }
  const total = Object.keys(seen).length;
  if (total < 2 || total > 80) return false;
  if (overLimit_("rankings", RANKINGS_PER_MINUTE)) return false;

  const sheet = getRankingsSheet_();
  const key = squad + "|" + device;
  const row = [new Date(), squad, total, JSON.stringify(order), key];
  const last = sheet.getLastRow();
  const hit = last > 1
    ? sheet.getRange(2, 5, last - 1, 1).createTextFinder(key).matchEntireCell(true).findNext()
    : null;
  if (hit) sheet.getRange(hit.getRow(), 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
  return true;
}

function stats_(squad) {
  if (!ID_PATTERN.test(squad)) return { ok: false };
  const cache = CacheService.getScriptCache();
  const cacheKey = "stats-" + squad;
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const sheet = getRankingsSheet_();
  const last = sheet.getLastRow();
  const rows = last > 1 ? sheet.getRange(2, 2, last - 1, 3).getValues() : [];
  const players = {};
  let count = 0;

  rows.forEach(r => {
    if (r[0] !== squad) return;
    let order;
    try {
      order = JSON.parse(r[2]);
    } catch (err) {
      return;
    }
    const total = order.reduce((n, g) => n + g.length, 0);
    let before = 0;
    count++;
    order.forEach(group => {
      const rank = before + 1;
      const after = total - before - group.length;
      group.forEach(id => {
        const p = players[id] || (players[id] = { n: 0, sum: 0, sq: 0, top1: 0, top3: 0, bottom3: 0, min: rank, max: rank });
        p.n++;
        p.sum += rank;
        p.sq += rank * rank;
        if (rank === 1) p.top1++;
        if (rank <= 3) p.top3++;
        if (after < 3) p.bottom3++;
        p.min = Math.min(p.min, rank);
        p.max = Math.max(p.max, rank);
      });
      before += group.length;
    });
  });

  const result = { ok: true, squad: squad, count: count, min: STATS_MIN, updated: new Date().toISOString() };
  if (count >= STATS_MIN) {
    result.players = {};
    Object.keys(players).forEach(id => {
      const p = players[id];
      const avg = p.sum / p.n;
      result.players[id] = {
        n: p.n,
        avg: Math.round(avg * 100) / 100,
        sd: Math.round(Math.sqrt(Math.max(0, p.sq / p.n - avg * avg)) * 100) / 100,
        top1: p.top1,
        top3: p.top3,
        bottom3: p.bottom3,
        min: p.min,
        max: p.max
      };
    });
  }
  cache.put(cacheKey, JSON.stringify(result), STATS_CACHE_SECONDS);
  return result;
}

function getSheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (sheet) return sheet;
  sheet = book.insertSheet(SHEET_NAME);
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
  sheet.setFrozenRows(1);
  sheet.getRange("A:A").setNumberFormat("d mmm yyyy, h:mm am/pm");
  [150, 120, 120, 180, 180, 280, 130, 220, 100].forEach((w, i) => sheet.setColumnWidth(i + 1, w));
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build();
  sheet.getRange(2, HEADERS.length, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
  return sheet;
}

function getRankingsSheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(RANKINGS_SHEET);
  if (sheet) return sheet;
  sheet = book.insertSheet(RANKINGS_SHEET);
  sheet.getRange(1, 1, 1, RANKING_HEADERS.length).setValues([RANKING_HEADERS]).setFontWeight("bold");
  sheet.setFrozenRows(1);
  sheet.getRange("A:A").setNumberFormat("d mmm yyyy, h:mm am/pm");
  [150, 150, 70, 600, 260].forEach((w, i) => sheet.setColumnWidth(i + 1, w));
  return sheet;
}

function clean_(value, max) {
  let text = String(value == null ? "" : value).replace(/\s+/g, " ").trim().slice(0, max || 200);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function overLimit_(name, limit) {
  const cache = CacheService.getScriptCache();
  const key = name + "-" + Math.floor(Date.now() / 60000);
  const count = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(count), 120);
  return count > limit;
}

function reply_(ok) {
  return json_({ ok: ok });
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}