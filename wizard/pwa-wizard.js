// Jag PWA installer — 組み込みウィザードの画面と状態。生成の中身は pwa-wizard-core.js(頭脳)。
// ⚠ 頭脳への参照(C)は**最初に**取る(代入は巻き上がらない。回覧板のウィザードで踏んだ穴)。
(function () {
  "use strict";
  var C = (typeof globalThis !== "undefined" ? globalThis : window).JagPwaWizardCore;
  if (!C) throw new Error("pwa-wizard-core.js が読み込まれていません(pwa-wizard.js より前に <script> で読むこと)");
  var KEY = "jag.pwaInstaller.wizard.v1";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var S = load() || {};
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function escHtml(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  // OS の推測(答えが無いときだけ)
  var ua = navigator.userAgent, guess = /Windows/i.test(ua) ? "win" : "mac";
  C.QUESTIONS.forEach(function (qd) { if (S[qd.key] == null) S[qd.key] = qd.key === "os" ? guess : qd.def; });

  // ───────── 質問を描く ─────────
  var form = $("#questions");
  C.QUESTIONS.forEach(function (qd) {
    var f = document.createElement("div"); f.className = "field";
    f.innerHTML = '<label>' + escHtml(qd.label) + '</label><div class="choices" role="radiogroup" aria-label="' + escHtml(qd.label) + '"></div>';
    var box = $(".choices", f);
    qd.options.forEach(function (o) {
      var l = document.createElement("label");
      l.innerHTML = '<input type="radio" name="' + qd.key + '" value="' + o[0] + '"> ' + escHtml(o[1]);
      var r = $("input", l); r.checked = S[qd.key] === o[0];
      r.addEventListener("change", function () { S[qd.key] = o[0]; save(); render(); });
      box.appendChild(l);
    });
    form.appendChild(f);
  });
  ["appName", "appUrl"].forEach(function (k) {
    var el = $("#f-" + k); if (!el) return;
    if (S[k] != null) el.value = S[k];
    el.addEventListener("input", function () { S[k] = el.value; save(); render(); });
  });

  // ───────── 結果を描く ─────────
  function render() {
    $("#out-prompt").textContent = C.genPrompt(S);
    $("#out-chat").textContent = C.genChat(S);
    $("#summary").textContent = C.genSummary(S);
    var ol = $("#verify"); ol.innerHTML = "";
    C.genVerify(S).forEach(function (sec) {
      var li = document.createElement("li");
      li.innerHTML = "<h4>" + escHtml(sec.h) + "</h4><ul>" + sec.items.map(function (t) { return "<li>" + t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") + "</li>"; }).join("") + "</ul>";
      ol.appendChild(li);
    });
    var n = Array.from(String(S.appName || "").trim()).length;
    var w = $("#title-warn"); if (w) w.hidden = !(n > 15);
    var free = S.ai === "free-chat";
    $$("[data-only=free]").forEach(function (e) { e.hidden = !free; });
    $$("[data-only=paid]").forEach(function (e) { e.hidden = free; });
    var v = $("#core-version"); if (v) v.textContent = C.CORE_VERSION;
  }
  render();

  // ───────── コピー ─────────
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-copy]") : null; if (!t) return;
    var src = $(t.getAttribute("data-copy")); if (!src) return;
    var text = src.textContent;
    var done = function () { var was = t.textContent; t.textContent = "コピーしました"; t.setAttribute("data-done", "1"); setTimeout(function () { t.textContent = was; t.removeAttribute("data-done"); }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fb); else fb();
    function fb() { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (x) {} ta.remove(); }
  });
  var reset = $("#reset"); if (reset) reset.addEventListener("click", function () { if (confirm("答えを全部消して、最初からやり直しますか？")) { try { localStorage.removeItem(KEY); } catch (x) {} location.reload(); } });
})();
