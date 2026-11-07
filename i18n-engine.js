/* Tagup: scelta della lingua (italiano / inglese). Le frasi originali sono in italiano; in inglese si sostituiscono al volo. */
(function () {
  var LANG = 'it';
  try { LANG = localStorage.getItem('tg_lang') || 'it'; } catch (e) { LANG = 'it'; }
  if (LANG !== 'en') LANG = 'it';
  window.TG_LANG = LANG;
  document.documentElement.lang = LANG;
  window.tgSetLang = function (l) { try { localStorage.setItem('tg_lang', l === 'en' ? 'en' : 'it'); } catch (e) { /* ok */ } location.reload(); };
  window.tgLangHtml = function (cls) {
    var en = LANG === 'en';
    return '<div class="lang-sw ' + (cls || '') + '" role="group" aria-label="' + (en ? 'Language' : 'Lingua') + '"><span class="lang-l">' + (en ? 'Language' : 'Lingua') + '</span>' +
      '<button type="button" class="lang-b' + (en ? '' : ' on') + '" data-az="lingua" data-l="it" lang="it" aria-pressed="' + (!en) + '">Italiano</button>' +
      '<button type="button" class="lang-b' + (en ? ' on' : '') + '" data-az="lingua" data-l="en" lang="en" aria-pressed="' + en + '">English</button></div>';
  };
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-az="lingua"]') : null;
    if (!b) return;
    e.stopPropagation(); e.preventDefault();
    var l = b.getAttribute('data-l'); if (l !== LANG) window.tgSetLang(l);
  }, true);
  if (LANG !== 'en') return;

  var D = window.TG_EN || {}, P = window.TG_EN_RE || [];
  var CACHE = {}, PK = null;
  function t(s) {
    var k = s.trim(); if (!k) return s;
    var v = D[k];
    if (v === undefined) {
      for (var i = 0; i < P.length; i++) { var m = P[i][0].exec(k); if (m) { v = k.replace(P[i][0], P[i][1]); break; } }
    }
    if (v === undefined && window.TG_EN_FN) { var f1 = window.TG_EN_FN(k); if (f1 != null) v = f1; }
    if (window.TG_EN_FN2 && (v !== undefined || /\d/.test(k))) { var f2 = window.TG_EN_FN2(v !== undefined ? v : k); if (f2 != null) v = f2; }
    if (v === undefined && k.length > 6 && /[a-zàèéìòù]{3}/i.test(k)) {
      var c = CACHE[k];
      if (c === undefined) {
        if (!PK) { PK = Object.keys(D).filter(function (x) { return x.length >= 14; }).sort(function (x, y) { return y.length - x.length; }); }
        var r = k, ch = false;
        for (var j = 0; j < PK.length; j++) { if (r.indexOf(PK[j]) > -1) { r = r.split(PK[j]).join(D[PK[j]]); ch = true; } }
        c = CACHE[k] = ch ? r : null;
      }
      if (c) v = c;
    }
    if (v === undefined || v === k) return s;
    var a = s.match(/^\s*/)[0], z = s.match(/\s*$/)[0];
    return a + v + z;
  }
  var ATTR = ['placeholder', 'aria-label', 'title', 'alt'];
  function giro(root) {
    if (!root) return;
    if (root.nodeType === 3) { var n0 = root.nodeValue, n1 = t(n0); if (n1 !== n0) root.nodeValue = n1; return; }
    if (root.nodeType !== 1) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT), n, tg;
    var els = [root];
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) {
        tg = n.parentNode && n.parentNode.tagName; if (tg === 'SCRIPT' || tg === 'STYLE' || tg === 'TEXTAREA') continue;
        var a0 = n.nodeValue, a1 = t(a0); if (a1 !== a0) n.nodeValue = a1;
      } else els.push(n);
    }
    els.forEach(function (el) {
      if (el.lang === 'it') return;
      ATTR.forEach(function (at) { var v = el.getAttribute && el.getAttribute(at); if (v) { var v2 = t(v); if (v2 !== v) el.setAttribute(at, v2); } });
    });
  }
  var coda = false;
  function pianifica() { if (coda) return; coda = true; (window.requestAnimationFrame || setTimeout)(function () { coda = false; giro(document.body); }); }
  function avvia() {
    giro(document.body);
    new MutationObserver(function () { pianifica(); }).observe(document.body, { childList: true, subtree: true, characterData: true });
    document.title = t(document.title);
  }
  if (document.body) avvia(); else document.addEventListener('DOMContentLoaded', avvia);
  /* messaggi di sistema */
  var al = window.alert; window.alert = function (m) { return al.call(window, t(String(m))); };
  var co = window.confirm; window.confirm = function (m) { return co.call(window, t(String(m))); };
})();
