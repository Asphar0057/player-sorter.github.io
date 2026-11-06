const SHEET_NAME = "Requests";
const HEADERS = ["Received", "Type", "Category", "Squad", "Player / league", "Notes", "Squad id", "Page", "Status"];
const TYPES = { team: "Squad request", player: "Missing player" };
const STATUSES = ["New", "Added", "Not adding"];
const MAX_PER_MINUTE = 30;

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (data.website) return reply_(true);
    const type = TYPES[data.type];
    if (!type) return reply_(false);
    if (data.type === "team" && !clean_(data.squad)) return reply_(false);
    if (data.type === "player" && !clean_(data.name)) return reply_(false);
    if (overLimit_()) return reply_(false);

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

function doGet() {
  return reply_(true);
}

function setup() {
  getSheet_();
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

function clean_(value, max) {
  let text = String(value == null ? "" : value).replace(/\s+/g, " ").trim().slice(0, max || 200);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function overLimit_() {
  const cache = CacheService.getScriptCache();
  const key = "count-" + Math.floor(Date.now() / 60000);
  const count = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(count), 120);
  return count > MAX_PER_MINUTE;
}

function reply_(ok) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok })).setMimeType(ContentService.MimeType.JSON);
}