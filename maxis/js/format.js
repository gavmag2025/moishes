/* format.js - small formatting + escaping helpers (no dependencies). */
(function (root) {
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var DAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Shabbos"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* R1 234.50 (non-breaking space thousands separator) */
  function money(n) {
    n = Number(n) || 0;
    var neg = n < 0;
    var parts = Math.abs(n).toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return (neg ? "-" : "") + "R" + parts.join(".");
  }
  function num(n) { return String(Math.round(Number(n) * 100) / 100); }
  /* 1.5 kg  /  2 */
  function qty(n, unit) { return unit === "kg" ? num(n) + " kg" : num(n); }
  function unitLabel(unit) { return unit === "kg" ? "/ kg" : "each"; }
  function parseISO(iso) { var p = String(iso).split("-"); return { y: +p[0], m: +p[1], d: +p[2] }; }
  function dow(iso) { var p = parseISO(iso); return new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay(); }
  /* Fri 9 Oct */
  function dateShort(iso) { var p = parseISO(iso); return DAYS[dow(iso)] + " " + p.d + " " + MONTHS[p.m - 1]; }
  function dateLong(iso) { var p = parseISO(iso); return DAYS_LONG[dow(iso)] + " " + p.d + " " + MONTHS[p.m - 1] + " " + p.y; }
  function dateTime(ts) {
    var d = new Date(new Date(ts).getTime() + 2 * 3600000);
    var pad = function (x) { return (x < 10 ? "0" : "") + x; };
    return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear() + ", " + pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes());
  }
  function csvCell(v) {
    var s = String(v == null ? "" : v);
    /* neutralise spreadsheet formula injection */
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  var api = { esc: esc, money: money, num: num, qty: qty, unitLabel: unitLabel, dateShort: dateShort, dateLong: dateLong, dateTime: dateTime, csvCell: csvCell, DAYS: DAYS, DAYS_LONG: DAYS_LONG, MONTHS: MONTHS };
  root.MaxisFormat = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
