(function () {
  "use strict";

  var doc = document;
  var html = doc.documentElement;
  var body = doc.body;
  if (!body || !doc.querySelector(".bagian")) return;

  var reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var KV = (function () {
    var s = null;
    try { s = window.localStorage; var t = "__cpns_probe__"; s.setItem(t, "1"); s.removeItem(t); }
    catch (e) { s = null; }
    return {
      ok: !!s,
      get: function (k) { try { return s.getItem(k); } catch (e) { return null; } },
      set: function (k, v) { try { s.setItem(k, v); } catch (e) {} },
      del: function (k) { try { s.removeItem(k); } catch (e) {} }
    };
  })();

  var topics = Array.prototype.slice.call(doc.querySelectorAll("article.topik"));
  if (!topics.length) return;

  function el(tag) { return doc.createElement(tag); }
  function add(htmlStr) {
    var t = el("div"); t.innerHTML = htmlStr.trim();
    var n = t.firstChild; return n;
  }

  function cleanTitle(node) {
    var h = node.querySelector("h3");
    if (!h) return "";
    var raw = h.textContent.trim();
    var m = raw.match(/^(\d+[ab]?)\s*[.)\u2013-]\s*(.*)$/);
    return (m && m[2]) ? m[2] : raw;
  }



  var PILL = null;
  var BAR = null;
  var totalWords = 0;

  function countWords() {
    var n = 0;
    topics.forEach(function (t) {
      n += (t.textContent || "").trim().split(/\s+/).length;
    });
    return n;
  }

  /* ============================================================
     CSS
     ============================================================ */
  function injectStyles() {
    var style = el("style");
    style.id = "cpns-reader-css";
    style.textContent = [

      ".toc a.cpns-active{color:var(--accent);text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px}",
      ".cpns-pager{display:flex;justify-content:space-between;gap:12px;margin-top:18px;padding-top:14px;border-top:1px dashed var(--line);font-family:'IBM Plex Mono',monospace;font-size:.72rem}",
      ".cpns-pager a{color:var(--accent);text-decoration:none;max-width:46%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".cpns-pager a:hover{text-decoration:underline}",
      ".cpns-pager .cpns-ph{color:var(--line);max-width:46%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      "#cpns-resume{position:fixed;top:60px;left:50%;transform:translateX(-50%);z-index:9996;display:flex;flex-wrap:wrap;justify-content:center;gap:8px 12px;align-items:center;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:8px 12px;box-shadow:0 10px 28px rgba(31,36,48,.18);font-size:.82rem;max-width:92vw}",
      "#cpns-resume .cpns-res-go{font-family:'IBM Plex Mono',monospace;font-size:.68rem;color:#fff;background:var(--accent);border:none;border-radius:999px;padding:5px 12px;cursor:pointer;white-space:nowrap}",
      "#cpns-resume .cpns-res-x{font-family:'IBM Plex Mono',monospace;font-size:.66rem;color:var(--ink-soft);background:none;border:1px solid var(--line);border-radius:999px;padding:5px 10px;cursor:pointer;white-space:nowrap}",
      ".cpns-fakta{margin:28px 0 6px}",
      ".cpns-fakta-label{font-family:'IBM Plex Mono',monospace;font-size:.66rem;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-soft);margin:0 0 8px}",
      ".cpns-fk{position:relative;width:100%;height:140px;cursor:pointer;perspective:1000px;-webkit-tap-highlight-color:transparent}",
      ".cpns-fk-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border-radius:var(--radius);border:1px solid var(--line);padding:14px 18px;transition:transform .5s ease}",
      ".cpns-fk-front{background:var(--paper)}",
      ".cpns-fk-back{background:var(--accent-soft);transform:rotateY(180deg);font-size:.84rem;line-height:1.5;color:var(--ink)}",
      ".cpns-fk.is-flipped .cpns-fk-front{transform:rotateY(180deg)}",
      ".cpns-fk.is-flipped .cpns-fk-back{transform:rotateY(0deg)}",
      ".cpns-fk-label{font-family:'Fraunces',serif;font-weight:600;color:var(--accent);font-size:1rem}",
      ".cpns-fk-sub{font-family:'IBM Plex Mono',monospace;font-size:.66rem;color:var(--ink-soft);margin-top:6px}",
      ".cpns-fk-link{font-family:'IBM Plex Mono',monospace;font-size:.68rem;color:var(--accent);text-decoration:none;margin-top:10px;display:inline-block}",
      ".cpns-fk-link:hover{text-decoration:underline}",
      "article.topik.cpns-flash{animation:cpns-flash 1.7s ease}",
      "@keyframes cpns-flash{0%{box-shadow:0 0 0 4px rgba(43,58,103,.0)}35%{box-shadow:0 0 0 4px rgba(43,58,103,.38)}100%{box-shadow:0 0 0 0 rgba(43,58,103,0)}}",
      ".cpns-gloss{border-bottom:1px dotted var(--accent);cursor:help;color:var(--accent)}",
      "#cpns-gloss-tip{position:fixed;z-index:9999;max-width:280px;background:var(--ink);color:var(--paper);font-size:.78rem;line-height:1.55;border-radius:10px;padding:9px 13px;box-shadow:0 6px 20px rgba(0,0,0,.30);pointer-events:none;opacity:0;transition:opacity .12s ease}",
      "#cpns-gloss-tip.on{opacity:1}",
      "html.cpns-anim article.topik{opacity:0;transform:translateY(9px);transition:opacity .45s ease,transform .45s ease}",
      "html.cpns-anim article.topik.cpns-in{opacity:1;transform:none}",
      "@media (max-width:600px){.cpns-fk{height:158px}}",
      "@media (prefers-reduced-motion: reduce){.cpns-fk-face{transition:none!important}html.cpns-anim article.topik{opacity:1!important;transform:none!important}article.topik.cpns-flash{animation:none!important}}"
    ].join("\n");
    doc.head.appendChild(style);
  }

  /* ============================================================
     Tema Nusantara Museum — CSS komponen tambahan
     ============================================================ */
  function injectThemeStyles() {
    var style = el("style");
    style.id = "cpns-theme-css";
    style.textContent = [
      /* hero stats */
      ".hs-chip b{color:var(--era,var(--accent))}",
      /* lightbox */
      "#cpns-lightbox{position:fixed;inset:0;z-index:9995;background:rgba(22,17,11,.94);display:none;align-items:center;justify-content:center;padding:22px;cursor:zoom-out}",
      "#cpns-lightbox.on{display:flex}",
      "#cpns-lightbox img{max-width:92vw;max-height:84vh;width:auto;height:auto;border-radius:10px;box-shadow:0 24px 70px rgba(0,0,0,.55);background:#fff}",
      "#cpns-lightbox figcaption{position:absolute;bottom:10px;left:0;right:0;text-align:center;color:#F4EFE3;font-family:'IBM Plex Mono',monospace;font-size:.72rem;padding:6px;line-height:1.6}",
      "#cpns-lightbox figcaption .lb-title{display:block;color:#E8B64C;font-weight:500}",
      "#cpns-lightbox .lb-x{position:absolute;top:14px;right:14px;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.1);color:#fff;font-size:1.15rem;cursor:pointer;font-family:'IBM Plex Mono',monospace;line-height:1;z-index:2}",
      "@keyframes cpns-lb-in{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}",
      "#cpns-lightbox img{animation:cpns-lb-in .18s ease}",
      /* kilas bagian */
      ".cpns-kilas{background:var(--gold-soft);border:1px solid var(--gold);border-radius:var(--radius);padding:12px 16px;margin:2px 0 24px}",
      ".cpns-kilas-head{display:flex;align-items:center;gap:8px;width:100%;font-family:'IBM Plex Mono',monospace;font-size:.74rem;letter-spacing:.02em;text-transform:uppercase;color:var(--gold);background:none;border:none;padding:2px 0;cursor:pointer;text-align:left}",
      ".cpns-kilas-head:hover{text-decoration:underline}",
      ".cpns-kilas-body{margin-top:12px;display:flex;flex-direction:column;gap:10px}",
      ".cpns-kilas-item{display:flex;gap:10px;align-items:flex-start;font-size:.92rem;line-height:1.55;color:var(--ink);background:rgba(255,255,255,.55);border:1px solid rgba(185,136,31,.25);border-radius:10px;padding:9px 11px}",
      ".cpns-kilas-num{flex:0 0 auto;width:20px;height:20px;margin-top:1px;border-radius:50%;background:var(--gold);color:#fff;font-family:'IBM Plex Mono',monospace;font-size:.62rem;display:flex;align-items:center;justify-content:center}",
      ".cpns-kilas-item a{color:var(--accent);text-decoration:none;font-family:'IBM Plex Mono',monospace;font-size:.66rem;white-space:nowrap}",
      ".cpns-kilas-item a:hover{text-decoration:underline}",
      /* kalimat kunci / pull quote */
      ".cpns-quote{margin:28px 0 6px;position:relative;padding:20px 22px 16px 48px;background:linear-gradient(180deg,var(--gold-soft),var(--surface));border-left:4px solid var(--gold);border-radius:0 var(--radius) var(--radius) 0}",
      ".cpns-quote::before{content:'“';position:absolute;left:14px;top:6px;font-family:'Fraunces',serif;font-size:3rem;line-height:1;color:var(--gold);opacity:.55}",
      ".cpns-quote-label{font-family:'IBM Plex Mono',monospace;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);margin:0 0 8px}",
      ".cpns-quote blockquote{font-family:'Fraunces',serif;font-weight:400;font-size:1.14rem;line-height:1.6;margin:0 0 8px;color:var(--ink);quotes:none}",
      ".cpns-quote cite{display:block;font-family:'IBM Plex Mono',monospace;font-size:.68rem;color:var(--ink-soft);font-style:normal}",
      ".cpns-quote cite a{color:var(--accent);text-decoration:none}",
      ".cpns-quote cite a:hover{text-decoration:underline}",
      /* era rail */
      "#cpns-rail{position:fixed;left:16px;top:50%;transform:translateY(-50%);z-index:9990;display:none;flex-direction:column;gap:5px;font-family:'IBM Plex Mono',monospace}",
      ".cpns-rail-btn{display:flex;align-items:center;gap:7px;padding:5px 9px 5px 5px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink-soft);cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:.62rem;white-space:nowrap;box-shadow:0 2px 6px rgba(31,36,48,.08);transition:all .15s}",
      ".cpns-rail-btn i.rp-dot{width:10px;height:10px;border-radius:50%;background:var(--era,var(--accent));flex:0 0 auto}",
      ".cpns-rail-btn:hover{transform:translateX(2px);color:var(--ink)}",
      ".cpns-rail-btn.active{background:var(--era,var(--accent));border-color:var(--era,var(--accent));color:#fff}",
      ".cpns-rail-btn .rail-bar{height:3px;border-radius:2px;background:rgba(127,127,127,.25);overflow:hidden;width:34px;margin-left:2px;display:inline-block}",
      ".cpns-rail-btn .rp-fill{display:block;height:100%;width:0%;background:var(--era,var(--accent))}",
      ".cpns-rail-btn.active .rail-bar{background:rgba(255,255,255,.4)}",
      ".cpns-rail-btn.active .rp-fill{background:#fff}",
      /* comfort mode */

      /* toast */
      "#cpns-toast{position:fixed;left:50%;bottom:66px;transform:translateX(-50%) translateY(8px);z-index:9994;max-width:80vw;background:rgba(41,37,33,.86);color:var(--paper);font-family:'IBM Plex Mono',monospace;font-size:.62rem;line-height:1.4;border-radius:999px;padding:4px 11px;box-shadow:0 4px 12px rgba(0,0,0,.16);opacity:0;transition:opacity .16s ease,transform .16s ease;pointer-events:none;text-align:center;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}",
      "#cpns-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}",
      /* cimit mascot */
      ".cpns-cat{position:fixed;z-index:9985;bottom:56px;right:24px;width:auto;background:none;border:none;padding:0;cursor:pointer;opacity:.96;transition:opacity .2s,transform .2s,filter .2s;-webkit-tap-highlight-color:transparent;touch-action:manipulation;filter:drop-shadow(0 4px 8px rgba(31,36,48,.22));--cat-h:92px}",
      ".cpns-cat:hover{transform:translateY(-2px);opacity:1}",
      ".cpns-cat-art{display:block;height:var(--cat-h,92px);width:auto;animation:cpns-idle 4.4s ease-in-out infinite}",
      "@keyframes cpns-idle{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-1px) scale(1.012)}}",
      ".cpns-cat.play .cpns-cat-art,.cpns-cat.nap .cpns-cat-art{animation:none}",
      ".cpns-cat .cpns-eye{transform-box:fill-box;transform-origin:center;animation:cpns-blink 4.2s ease-in-out infinite}",
      "@keyframes cpns-blink{0%,88%,100%{transform:scaleY(1)}93%{transform:scaleY(.07)}96%{transform:scaleY(1)}}",
      ".cpns-cat-toys,.cpns-cat .act{pointer-events:none}",
      ".cpns-cat .act{position:absolute;z-index:1;font-size:20px;line-height:1;opacity:0}",
      ".cpns-cat .act-play{left:-10px;top:30%;font-size:18px}",
      ".cpns-cat .act-nap{right:0;top:6%;font-size:12px}",
      ".cpns-cat.play .act-play{animation:cpns-toy .5s ease 2}",
      ".cpns-cat.nap .act-nap{animation:cpns-zzz .8s ease 3}",
      "@keyframes cpns-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}",
      "@keyframes cpns-toy{0%{opacity:0;transform:translate(-6px,4px) scale(.6) rotate(-20deg)}35%{opacity:1}70%{opacity:1;transform:translate(10px,-14px) scale(1.1) rotate(14deg)}100%{opacity:0;transform:translate(18px,-28px) scale(.9) rotate(28deg)}}",
      "@keyframes cpns-zzz{0%{opacity:0;transform:translate(0,3px)}40%{opacity:1}100%{opacity:0;transform:translate(5px,-8px)}}",
      ".cpns-cat.breathe{animation:cpns-breathe 3.4s ease-in-out infinite}",
      ".cpns-cat.play{animation:cpns-bounce .42s ease 2}",
      "@keyframes cpns-bounce{0%,100%{transform:translateY(0)}45%{transform:translateY(-10px)}}",
      ".cpns-cat.nap{animation:cpns-breathe 2.6s ease-in-out infinite}",
      ".cpns-cat-hearts{position:absolute;inset:0;pointer-events:none;z-index:2}",
      ".cpns-cat-heart{position:absolute;left:50%;top:22%;font-size:15px;line-height:1;opacity:0;transform:translateX(-50%);animation:cpns-heart .95s ease forwards}",
      "@keyframes cpns-heart{0%{opacity:0;transform:translate(-50%,8px) scale(.55)}30%{opacity:1}100%{opacity:0;transform:translate(-50%,-30px) scale(1.18)}}",
      ".cpns-cat.mood-angry{animation:cpns-shake .4s linear infinite}",
      "@keyframes cpns-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}",
      ".cpns-cat.mood-jengah{animation:cpns-nod .5s ease 2}",
      "@keyframes cpns-nod{0%,100%{transform:rotate(0)}50%{transform:rotate(-2deg)}}",
      ".cpns-cat.busy{opacity:0;pointer-events:none;transform:none}",
      ".cpns-cat-toys{display:flex;justify-content:center;gap:4px;margin-top:3px}",
      ".cpns-cat-toys i{width:16px;height:16px;display:flex;align-items:center;justify-content:center}",
      ".cpns-cat-toys img{width:14px;height:14px;opacity:.32;filter:grayscale(1);transition:opacity .3s,filter .3s}",
      ".cpns-cat-toys i.on img{opacity:1;filter:none}",
      "@media (max-width:1279px){.cpns-cat-toys{display:none}}",
      "#cpns-cat-bubble{position:fixed;z-index:9990;right:24px;bottom:172px;max-width:224px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:8px 12px;font-family:'IBM Plex Mono',monospace;font-size:.7rem;line-height:1.55;color:var(--ink);box-shadow:0 8px 22px rgba(31,36,48,.2);opacity:0;transform:translateY(6px);transition:opacity .16s,transform .16s;pointer-events:none}",
      "#cpns-cat-bubble.on{opacity:1;transform:translateY(0)}",
      "@media (min-width:980px) and (max-width:1279px){.cpns-cat{--cat-h:66px}}",
      "@media (max-width:979px){.cpns-cat{--cat-h:44px;right:8px;opacity:.45}.cpns-cat:hover{opacity:.85}#cpns-cat-bubble{display:none}}",
      "@media print{.cpns-cat,#cpns-cat-bubble{display:none!important}}",
      "@media (prefers-reduced-motion: reduce){.cpns-cat,.cpns-cat.mood-angry,.cpns-cat.mood-jengah,.cpns-cat.play,.cpns-cat.nap,.cpns-cat.breathe,.cpns-cat-art,.cpns-eye{animation:none!important}.cpns-cat-heart{animation:none;opacity:0}.cpns-cat .act{display:none}}",
      /* responsive */
      "@media (max-width:1179px){#cpns-rail{display:none}}",
      "@media (min-width:1180px){#cpns-rail{display:flex}}",
      "@media (max-width:600px){.cpns-quote{padding:14px 16px 12px 38px}.cpns-quote::before{left:10px;font-size:2.2rem}#cpns-notes{right:10px;bottom:70px}#cpns-lightbox{padding:12px}}",
      "@media print{body{margin:0}#cpns-lightbox,#cpns-toast,.cpns-kilas-body{display:none!important}.cpns-kilas,.cpns-quote{border-radius:0;box-shadow:none}}",
      "@media (prefers-reduced-motion: reduce){#cpns-lightbox img{animation:none!important}mark.cpns-hl{transition:none}}",
      /* ikan Cimit — teman bertumbuh: berubah seiring dibaca */
      ".cpns-ikan{position:fixed;z-index:9986;right:24px;bottom:10px;width:auto;background:none;border:none;padding:0;opacity:.92;pointer-events:none;-webkit-tap-highlight-color:transparent;--ikan-h:34px;transition:opacity .3s}",
      ".cpns-ikan-art{display:block;height:var(--ikan-h,76px);width:auto;animation:cpns-swim 5.4s ease-in-out infinite;filter:drop-shadow(0 3px 6px rgba(31,36,48,.18))}",
      "@keyframes cpns-swim{0%,100%{transform:translateY(0) rotate(-1.4deg)}50%{transform:translateY(-5px) rotate(1.4deg)}}",
      ".cpns-ikan .era{fill:var(--era,var(--accent));transition:fill .35s}",
      ".cpns-cat.likes .cpns-cat-art{animation:cpns-toy .45s ease 2}",
      "@media (min-width:980px) and (max-width:1279px){.cpns-ikan{right:calc(var(--cat-r,24px) + 0px);bottom:calc(var(--cat-b,56px) - var(--ikan-h) - 16px);--ikan-h:26px}}",
      "@media (max-width:979px){.cpns-ikan{right:8px;bottom:calc(56px - var(--ikan-h) - 8px);--ikan-h:20px;opacity:.65}}",
      ".cpns-ikan.is-final{--ikan-h:44px}",
      "@media (min-width:980px) and (max-width:1279px){.cpns-ikan.is-final{--ikan-h:34px}}",
      "@media (max-width:979px){.cpns-ikan.is-final{--ikan-h:26px}}",
      "@media print{.cpns-ikan{display:none!important}}",
      "@media (prefers-reduced-motion: reduce){.cpns-ikan-art{animation:none!important}}"
    ].join("\n");
    doc.head.appendChild(style);
  }

  /* ============================================================
     Progress + pill (posisi, waktu, selesai)
     ============================================================ */
  function readingStats() {
    BAR = el("div"); BAR.id = "cpns-progress"; doc.body.appendChild(BAR);
    PILL = el("div"); PILL.id = "cpns-pill"; PILL.textContent = "📖 0%"; doc.body.appendChild(PILL);
    totalWords = countWords();
  }

  var sessionStart = Date.now();
  var pastSeconds = (function () { try { return parseInt(KV.get("cpns-minutes"), 10) || 0; } catch (e) { return 0; } })();
  function currentSessionSec() {
    return pastSeconds + Math.round((Date.now() - sessionStart) / 1000);
  }
  function flushSession() {
    try {
      sessionStart = Date.now();
      if (KV.ok) { KV.set("cpns-minutes", String(currentSessionSec())); }
    } catch (e) {}
  }
  function setupSession() {
    setInterval(function () { if (!doc.hidden) flushSession(); }, 30000);
    doc.addEventListener("visibilitychange", function () { if (!doc.hidden) flushSession(); });
    window.addEventListener("pagehide", flushSession);
  }



  function renderPill() {
    if (!PILL) return;
    var d = doc.documentElement;
    var max = d.scrollHeight - d.clientHeight;
    var pct = max > 0 ? Math.min(100, Math.max(0, (d.scrollTop / max) * 100)) : 0;
    var percent = Math.round(pct);
    BAR.style.width = percent + "%";
    var remaining = Math.max(0, Math.round((totalWords / 200) * (1 - pct / 100)));
    var mins = Math.max(0, Math.round(currentSessionSec() / 60));
    PILL.textContent = "📖 " + percent + "% · sisa ±" + remaining +
      " mnt · ⏱ " + mins + " mnt";
  }

  /* ============================================================
     ToC active highlight
     ============================================================ */
  var tocLinks = Array.prototype.slice.call(doc.querySelectorAll("nav.toc a"));
  var tocMap = {};
  tocLinks.forEach(function (a) {
    var href = a.getAttribute("href");
    if (href && href.charAt(0) === "#") tocMap[href.slice(1)] = a;
  });

  function highlightToc() {
    if (!tocMap) return;
    var active = 0;
    for (var i = 0; i < topics.length; i++) {
      if (topics[i].getBoundingClientRect().top <= 200) active = i; else break;
    }
    tocLinks.forEach(function (a) { a.classList.remove("cpns-active"); });
    var cur = topics[active];
    if (cur && tocMap[cur.id]) tocMap[cur.id].classList.add("cpns-active");
  }

  /* shared rAF throttle */
  var ticking = false;
  var scrollHooks = [];
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      renderPill();
      highlightToc();
      for (var i = 0; i < scrollHooks.length; i++) {
        try { scrollHooks[i](); } catch (e) {}
      }
    });
  }

  /* ============================================================
     Toolbar (A- / A+ / mode baca)
     ============================================================ */
  var curSize = parseInt(KV.get("cpns-fsize"), 10) || 16;

  function applySize() {
    curSize = Math.min(19, Math.max(15, curSize));
    html.style.fontSize = curSize + "px";
    KV.set("cpns-fsize", String(curSize));
  }

  function buildControls() {
    var wrap = el("div"); wrap.id = "cpns-controls";
    wrap.setAttribute("aria-label", "Kontrol baca");
    var minus = el("button"), plus = el("button"), mode = el("button"), comfort = el("button"), notes = el("button"), cat = el("button");
    minus.type = plus.type = mode.type = comfort.type = notes.type = cat.type = "button";
    minus.className = "cpns-btn"; plus.className = "cpns-btn"; mode.className = "cpns-btn";
    comfort.className = "cpns-btn"; notes.className = "cpns-btn"; cat.className = "cpns-btn";
    minus.title = "Perkecil teks (A-)"; plus.title = "Perbesar teks (A+)"; mode.title = "Mode baca: awal / sepia / kontras";
    comfort.title = "Mode nyaman: spasi baca lebih lega";
    notes.title = "Catatan belajar (per topik)";
    cat.title = "Tampilkan / sembunyikan Cimit";
    minus.setAttribute("aria-label", "Perkecil ukuran teks");
    plus.setAttribute("aria-label", "Perbesar ukuran teks");
    mode.setAttribute("aria-label", "Ganti mode baca");
    comfort.setAttribute("aria-label", "Mode nyaman");
    notes.setAttribute("aria-label", "Catatan belajar");
    cat.setAttribute("aria-label", "Tampilkan atau sembunyikan Cimit");
    var m = el("span"); m.className = "cpns-tt"; m.textContent = "Aa−";
    var p = el("span"); p.className = "cpns-tt"; p.textContent = "Aa+";
    var mm = el("span"); mm.className = "cpns-tt"; mm.textContent = "🎨";
    var cc = el("span"); cc.className = "cpns-tt"; cc.textContent = "😌";
    var nn = el("span"); nn.className = "cpns-tt"; nn.textContent = "📝";
    var cc2 = el("span"); cc2.className = "cpns-tt"; cc2.textContent = "🐱";
    minus.appendChild(m); plus.appendChild(p); mode.appendChild(mm);
    comfort.appendChild(cc); notes.appendChild(nn); cat.appendChild(cc2);
    minus.addEventListener("click", function () { curSize = curSize - 1; applySize(); });
    plus.addEventListener("click", function () { curSize = curSize + 1; applySize(); });
    mode.addEventListener("click", function () {
      var cur = html.getAttribute("data-cpns-mode") || "";
      var next = cur === "" ? "sepia" : "";
      if (next) html.setAttribute("data-cpns-mode", next); else html.removeAttribute("data-cpns-mode");
      KV.set("cpns-mode", next === "" ? "" : next);
    });
    comfort.addEventListener("click", function () {
      var on = html.hasAttribute("data-cpns-comfort");
      if (on) html.removeAttribute("data-cpns-comfort"); else html.setAttribute("data-cpns-comfort", "");
      KV.set("cpns-comfort", on ? "" : "1");
    });
    notes.addEventListener("click", toggleNotes);
    cat.addEventListener("click", toggleCat);
    wrap.appendChild(minus); wrap.appendChild(plus); wrap.appendChild(mode);
    wrap.appendChild(comfort); wrap.appendChild(notes); wrap.appendChild(cat);
    doc.body.appendChild(wrap);
    var saved = KV.get("cpns-mode");
    if (saved === "sepia") html.setAttribute("data-cpns-mode", "sepia");
    if (KV.get("cpns-comfort") === "1") html.setAttribute("data-cpns-comfort", "");
    if (KV.get("cpns-fsize")) applySize();
  }

  /* ============================================================
     Prev / next antar topik
     ============================================================ */
  function buildPagers() {
    topics.forEach(function (t, i) {
      var pg = el("nav"); pg.className = "cpns-pager"; pg.setAttribute("aria-label", "Navigasi topik");
      var prev = topics[i - 1], next = topics[i + 1];
      if (prev) {
        var a1 = el("a"); a1.href = "#" + prev.id;
        a1.appendChild(doc.createTextNode("← " + cleanTitle(prev)));
        pg.appendChild(a1);
      } else {
        var sp = el("span"); sp.className = "cpns-ph"; sp.textContent = "← awal materi";
        pg.appendChild(sp);
      }
      if (next) {
        var a2 = el("a"); a2.href = "#" + next.id;
        a2.appendChild(doc.createTextNode(cleanTitle(next) + " →"));
        pg.appendChild(a2);
      } else {
        var sp2 = el("span"); sp2.className = "cpns-ph"; sp2.textContent = "selesai 🎉";
        pg.appendChild(sp2);
      }
      t.appendChild(pg);
    });
  }

  /* ============================================================
     Resume posisi baca
     ============================================================ */
  function currentTopicId() {
    var id = topics[0].id;
    for (var i = 0; i < topics.length; i++) {
      if (topics[i].getBoundingClientRect().top <= 150) id = topics[i].id; else break;
    }
    return id;
  }

  function buildResume() {
    if (!KV.ok) return;
    var lastId = null;
    try { var saved = JSON.parse(KV.get("cpns-pos") || "null"); if (saved && saved.id) lastId = saved.id; }
    catch (e) {}
    var lastWrite = 0;
    function save() {
      var now = Date.now();
      if (now - lastWrite < 1000) return;
      lastWrite = now;
      KV.set("cpns-pos", JSON.stringify({ top: window.pageYOffset, id: currentTopicId(), ts: now }));
    }
    window.addEventListener("scroll", save, { passive: true });
    window.addEventListener("pagehide", save);
    var target = lastId ? doc.getElementById(lastId) : null;
    if (!target) return;
    setTimeout(function () {
      var toast = add(
        '<div id="cpns-resume" role="status">' +
        '<span>Kamu berhenti di topik <b>' + cleanTitle(target) + '</b>?</span>' +
        '<button type="button" class="cpns-res-go">Lanjut →</button>' +
        '<button type="button" class="cpns-res-x">Tutup</button></div>');
      doc.body.appendChild(toast);
      var go = toast.querySelector(".cpns-res-go");
      var x = toast.querySelector(".cpns-res-x");
      go.addEventListener("click", function () {
        var r = target.getBoundingClientRect().top + window.pageYOffset - 96;
        window.scrollTo({ top: r < 0 ? 0 : r, behavior: "smooth" });
        toast.remove();
      });
      x.addEventListener("click", function () { toast.remove(); });
    }, 900);
  }

  /* ============================================================
     Scroll reveal halus
     ============================================================ */
  function buildReveal() {
    if (reducedMotion || !("IntersectionObserver" in window)) return;
    html.classList.add("cpns-anim");
    var obs;
    try {
      obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("cpns-in");
            obs.unobserve(en.target);
          }
        });
      }, { rootMargin: "0px 0px -60px 0px", threshold: 0.01 });
    } catch (e) { html.classList.remove("cpns-anim"); return; }
    topics.forEach(function (t) {
      var r = t.getBoundingClientRect();
      if (r.top < window.innerHeight) t.classList.add("cpns-in");
      else obs.observe(t);
    });
  }

/* ============================================================
     Konten bantu: kartu fakta, istilah kunci
     ============================================================ */
  var FAKTABANK = {
    "bagian-a": {
      text: "Ki Hajar Dewantara pernah diasingkan ke Belanda karena menulis 'Als ik eens Nederlander was' — 'Andaikan saya orang Belanda' — sindiran atas perayaan kemerdekaan Belanda di tengah penjajahan terhadap Indonesia.",
      srcTopic: "t3"
    },
    "bagian-b": {
      text: "Sila pertama Piagam Jakarta sempat berbunyi 'Ketuhanan, dengan kewajiban menjalankan syariat Islam bagi pemeluk-pemeluknya'. Tujuh kata itu dihapus sehari setelah Proklamasi demi persatuan bangsa.",
      srcTopic: "t8"
    },
    "bagian-c": {
      text: "Kurang dari satu minggu setelah Proklamasi, lewat 3 sidang PPKI (18–22 Agustus 1945), Indonesia sudah punya UUD, presiden, wapres, 8 provinsi, 12 kementerian, dan KNIP.",
      srcTopic: "t12"
    },
    "bagian-d": {
      text: "Saat Yogyakarta jatuh dan Presiden ditawan Belanda, PDRI di Bukittinggi membuktikan ke dunia bahwa Republik Indonesia tidak pernah mati.",
      srcTopic: "t14"
    },
    "bagian-e": {
      text: "ASEAN lahir dari Deklarasi Bangkok (8 Agustus 1967). Indonesia diwakili Menlu Adam Malik — salah satu dari lima negara pendiri, selaras dengan politik luar negeri bebas aktif.",
      srcTopic: "t19"
    }
  };

  var GLOSS = [
    { t: "VOC", d: "Vereenigde Oostindische Compagnie — kongsi dagang Belanda (1602) dengan hak istimewa: monopoli dagang, mencetak uang, mengangkat pegawai, hingga menyatakan perang.", top: "t1" },
    { t: "oktroi", d: "Hak istimewa dari pemerintah Belanda kepada VOC untuk monopoli perdagangan, mencetak uang, menyatakan perang, dan membuat perjanjian dengan penguasa lokal.", top: "t1" },
    { t: "devide et impera", d: "Politik 'memecah belah dan menguasai' — mengadu domba kerajaan-kerajaan lokal agar mudah dikuasai.", top: "t1" },
    { t: "Politik Etis", d: "Politik Balas Budi (1901) — program kolonial Belanda berisi irigasi, edukasi, dan emigrasi/transmigrasi.", top: "t2" },
    { t: "Multatuli", d: "Nama pena Eduard Douwes Dekker, penulis Max Havelaar (1860) yang mengungkap penderitaan rakyat akibat Tanam Paksa.", top: "t2" },
    { t: "Romusha", d: "Kerja paksa masa pendudukan Jepang untuk membangun infrastruktur militer; menyebabkan ratusan ribu korban jiwa.", top: "t6" },
    { t: "non-kooperasi", d: "Sikap menolak segala bentuk kerja sama dengan pemerintah kolonial, termasuk menolak duduk di badan bentukan Belanda.", top: "t3" },
    { t: "Tiga Serangkai", d: "Trio pendiri Indische Partij (1912): Douwes Dekker, dr. Cipto Mangunkusumo, dan Ki Hajar Dewantara.", top: "t3" },
    { t: "negara integralistik", d: "Paham bahwa negara adalah satu kesatuan organik yang mengatasi kepentingan golongan maupun individu — diusulkan Soepomo.", top: "t7" },
    { t: "Panitia Sembilan", d: "Panitia kecil 9 orang perumus kompromi dasar negara antara golongan nasionalis-sekuler dan golongan Islam — hasilnya Piagam Jakarta.", top: "t8" },
    { t: "Piagam Jakarta", d: "Dokumen kompromi 22 Juni 1945, cikal bakal Pembukaan UUD 1945; sila pertamanya sempat memuat 7 kata kewajiban syariat Islam.", top: "t8" },
    { t: "Garis Van Mook", d: "Garis demarkasi pembatas wilayah RI hasil Perjanjian Renville yang secara sepihak menguntungkan Belanda.", top: "t15" },
    { t: "Trikora", d: "Tri Komando Rakyat (19 Desember 1961): gagalkan negara boneka Papua, kibarkan Merah Putih di Irian Barat, dan siap mobilisasi umum.", top: "t16b" },
    { t: "Pepera", d: "Penentuan Pendapat Rakyat (1969) — jajak pendapat rakyat Irian Barat yang memilih tetap bergabung dengan NKRI dan diakui PBB.", top: "t16b" },
    { t: "Nasakom", d: "Nasionalisme, Agama, Komunisme — konsep Soekarno menyatukan tiga kekuatan politik utama, yang justru memperbesar pengaruh PKI.", top: "t18" },
    { t: "Dwikora", d: "Dwi Komando Rakyat (3 Mei 1964) sebagai respons atas pembentukan Federasi Malaysia; mengusung semboyan 'Ganyang Malaysia'.", top: "t18" },
    { t: "Tritura", d: "Tri Tuntutan Rakyat (1966): bubarkan PKI, bersihkan kabinet dari unsur G30S, dan turunkan harga kebutuhan pokok.", top: "t18" },
    { t: "Supersemar", d: "Surat Perintah Sebelas Maret (1966) dari Presiden Soekarno kepada Soeharto untuk memulihkan keamanan — landasan transisi kekuasaan.", top: "t19" },
    { t: "Dwifungsi ABRI", d: "Doktrin peran ganda militer: selain fungsi pertahanan-keamanan, juga ikut peran sosial-politik.", top: "t19" },
    { t: "Repelita", d: "Rencana Pembangunan Lima Tahun (sejak 1969) — pilar pembangunan ekonomi Orde Baru hingga tercapainya swasembada beras.", top: "t19" },
    { t: "Max Havelaar", d: "Novel Multatuli (1860) yang mengungkap penderitaan rakyat pribumi akibat Sistem Tanam Paksa.", top: "t2" },
    { t: "Een Eereschuld", d: "Utang Kehormatan — esai van Deventer (1899) yang berargumen Belanda berutang budi atas kekayaan Hindia Belanda; mendorong lahirnya Politik Etis.", top: "t2" },
    { t: "Trias Politika Etis", d: "Tiga program Politik Etis (1901): irigasi, edukasi, dan emigrasi/transmigrasi.", top: "t2" },
    { t: "Als ik eens Nederlander was", d: "Andaikan Aku Seorang Belanda — tulisan kritis Ki Hajar Dewantara yang menyindir perayaan 100 tahun kemerdekaan Belanda di tengah penjajahan atas Indonesia.", top: "t3" },
    { t: "Indonesia Merdeka", d: "Majalah terbitan Perhimpunan Indonesia sebagai media penyebaran gagasan kemerdekaan.", top: "t3" },
    { t: "Indonesia Menggugat", d: "Pidato pembelaan Soekarno di pengadilan tahun 1930 — menjadi simbol sikap nonkooperasi PNI.", top: "t3" },
    { t: "Indonesia Raya", d: "Lagu kebangsaan ciptaan W.R. Supratman; pertama kali diperdengarkan secara instrumental pada Kongres Pemuda II, 28 Oktober 1928.", top: "t4" },
    { t: "Dokuritsu Junbi Cosakai", d: "Nama Jepang BPUPKI — Badan Penyelidik Usaha-Usaha Persiapan Kemerdekaan Indonesia, dibentuk 1 Maret 1945.", top: "t7" },
    { t: "philosophische grondslag", d: "Dasar filosofis/fundamen filsafat — istilah yang dipakai sidang pertama BPUPKI untuk rumusan dasar negara.", top: "t7" },
    { t: "Dokuritsu Junbi Iinkai", d: "Nama Jepang PPKI — Panitia Persiapan Kemerdekaan Indonesia, dibentuk 7 Agustus 1945.", top: "t9" },
    { t: "staatsfundamentalnorm", d: "Norma dasar/fundamental negara — kedudukan Pancasila sebagai sumber dari segala sumber hukum di Indonesia.", top: "t13" },
    { t: "way of life", d: "Pandangan hidup bangsa — kedudukan Pancasila sebagai pedoman perilaku dan cita-cita bersama.", top: "t13" },
    { t: "de facto", d: "Pengakuan secara nyata berdasarkan keadaan yang ada — Belanda mengakui RI atas Jawa, Madura, dan Sumatra dalam Linggarjati, namun bukan pengakuan penuh (de jure).", top: "t15" },
    { t: "de jure", d: "Pengakuan secara hukum (penuh) atas kedaulatan — dalam Linggarjati, Belanda hanya mengakui secara de facto.", top: "t15" },
    { t: "Act of Free Choice", d: "Penentuan Pendapat Rakyat (Pepera) 1969 — jajak pendapat rakyat Irian Barat yang memilih tetap bergabung dengan NKRI.", top: "t16b" },
    { t: "neokolonialisme", d: "Bentuk penjajahan baru (secara tidak langsung) — dasar Soekarno memandang pembentukan Malaysia sebagai ancaman.", top: "t18" },
    { t: "checks and balances", d: "Pemisahan dan keseimbangan kekuasaan antarlembaga negara — diperkuat melalui amandemen UUD 1945 era Reformasi.", top: "t18" }
  ];

  var ERAS = {
    "bagian-a": { letter: "a", roman: "I", label: "Sebelum Kemerdekaan" },
    "bagian-b": { letter: "b", roman: "II", label: "Menjelang Kemerdekaan" },
    "bagian-c": { letter: "c", roman: "III", label: "Kemerdekaan & Pembentukan Negara" },
    "bagian-d": { letter: "d", roman: "IV", label: "Mempertahankan Kemerdekaan" },
    "bagian-e": { letter: "e", roman: "V", label: "Perkembangan Sistem Pemerintahan" }
  };

  var KILAS = {
    "bagian-a": [
      { t: "1602 — VOC didirikan; dari kongsi dagang ia bertransformasi menjadi kekuatan kolonial lewat politik devide et impera.", top: "t1" },
      { t: "1901 — Politik Etis (Trias Politika Etis): irigasi, edukasi, emigrasi — yang justru melahirkan kaum terpelajar dan kesadaran nasional.", top: "t2" },
      { t: "1908–1927 — Budi Utomo, Sarekat Islam, Indische Partij, Perhimpunan Indonesia, hingga PNI: perjuangan beralih ke organisasi modern.", top: "t3" }
    ],
    "bagian-b": [
      { t: "1 Maret 1945 — BPUPKI dibentuk; pidato 1 Juni Soekarno memperkenalkan nama \"Pancasila\".", top: "t7" },
      { t: "22 Juni 1945 — Piagam Jakarta menjadi cikal bakal Pembukaan UUD 1945; tujuh kata sila pertama dihapus pada 18 Agustus.", top: "t8" },
      { t: "7 Agustus 1945 — PPKI (27 anggota) dibentuk; Rengasdengklok (16 Agustus) mendesak kemerdekaan tanpa Jepang.", top: "t9" }
    ],
    "bagian-c": [
      { t: "17 Agustus 1945 pukul 10.00 — Proklamasi dibacakan di Jalan Pegangsaan Timur 56, Jakarta.", top: "t11" },
      { t: "Tiga sidang PPKI (18–22 Agustus) melengkapi negara: UUD 1945, presiden-wapres, 8 provinsi, 12 kementerian, KNIP.", top: "t12" },
      { t: "Pancasila berkedudukan sebagai dasar negara (staatsfundamentalnorm) dan pandangan hidup bangsa (way of life).", top: "t13" }
    ],
    "bagian-d": [
      { t: "Perjuangan fisik 1945–1949: Surabaya, Ambarawa, Bandung Lautan Api, Medan Area, Puputan Margarana, dua Agresi Militer Belanda.", top: "t14" },
      { t: "Diplomasi: Linggarjati → Renville → Roem-Royen → KMB 1949 — Belanda mengakui kedaulatan penuh Indonesia.", top: "t15" },
      { t: "Bentuk negara berubah tiga kali dalam lima tahun: NKRI (UUD 1945) → RIS (1949) → NKRI dengan UUDS 1950.", top: "t16" }
    ],
    "bagian-e": [
      { t: "1950–1959 — Demokrasi Parlementer dengan sekitar tujuh kabinet silih berganti; Pemilu 1955 dan kegagalan Konstituante.", top: "t17" },
      { t: "KAA Bandung (1955) melahirkan Dasasila Bandung; 1961 Indonesia ikut mendirikan Gerakan Non-Blok di Beograd.", top: "t17b" },
      { t: "Dekrit 1959 → Demokrasi Terpimpin → Supersemar 1966 → Orde Baru (1966–1998) → Reformasi sejak 1998.", top: "t18" }
    ]
  };

  var PULL = {
    "bagian-a": {
      quote: "Karena tidak terkoordinasi antarwilayah dan tidak memiliki visi persatuan sebagai satu bangsa, perlawanan-perlawanan ini pada akhirnya dapat dipatahkan Belanda satu per satu, meski sering setelah pertempuran yang berlangsung sangat lama dan menelan biaya besar bagi pihak kolonial.",
      src: "t1"
    },
    "bagian-b": {
      quote: "Menyerahnya Jepang menciptakan situasi kekosongan kekuasaan (vacuum of power) — Jepang sudah kalah dan kehilangan legitimasi untuk memerintah, sementara pasukan Sekutu belum tiba di Indonesia untuk mengambil alih kekuasaan secara resmi.",
      src: "t10"
    },
    "bagian-c": {
      quote: "sejak momen itulah Pancasila, UUD 1945, dan seluruh sistem pemerintahan Republik Indonesia mulai berlaku dan mengikat, menggantikan seluruh sistem hukum kolonial yang berlaku sebelumnya.",
      src: "t11"
    },
    "bagian-d": {
      quote: "setiap kali Belanda melanggar hasil perundingan lewat serangan militer, Indonesia membalasnya baik dengan perlawanan bersenjata maupun dengan memperkuat posisi tawar di meja perundingan berikutnya, hingga akhirnya kedaulatan penuh berhasil diperoleh lewat KMB.",
      src: "t15"
    },
    "bagian-e": {
      quote: "Sebagai hasil akumulasi seluruh perubahan sejak Reformasi 1998, sistem pemerintahan Indonesia saat ini menganut sistem presidensial dengan format multipartai, menyelenggarakan pemilihan umum langsung baik untuk memilih presiden/wakil presiden maupun anggota legislatif",
      src: "t20"
    }
  };

  function buildFakta() {
    Object.keys(FAKTABANK).forEach(function (id) {
      var bag = doc.getElementById(id);
      var isi = bag && bag.querySelector(".bagian-isi");
      if (!isi) return;
      var d = FAKTABANK[id];
      var card = el("section"); card.className = "cpns-fakta";
      var lab = el("p"); lab.className = "cpns-fakta-label"; lab.textContent = "Penutup bagian — flip untuk membalik";
      var fk = el("div"); fk.className = "cpns-fk";
      fk.setAttribute("role", "button");
      fk.setAttribute("aria-label", "Tahukah kamu — ketuk kartu untuk melihat fakta");
      fk.tabIndex = 0;

      var front = el("div"); front.className = "cpns-fk-face cpns-fk-front";
      var fl = el("span"); fl.className = "cpns-fk-label"; fl.textContent = "✨ Tahukah kamu?";
      var fs = el("span"); fs.className = "cpns-fk-sub"; fs.textContent = "ketuk kartu";
      front.appendChild(fl); front.appendChild(fs);

      var back = el("div"); back.className = "cpns-fk-face cpns-fk-back";
      var bp = el("p"); bp.style.margin = "0 0 4px"; bp.textContent = d.text;
      var link = el("a"); link.className = "cpns-fk-link"; link.href = "#" + d.srcTopic;
      link.textContent = "Baca ulang topik " + d.srcTopic.replace(/^t/, "") + " →";
      back.appendChild(bp); back.appendChild(link);

      fk.appendChild(front); fk.appendChild(back);
      var flipped = false;
      function flip() {
        flipped = !flipped;
        fk.classList.toggle("is-flipped", flipped);
      }
      fk.addEventListener("click", flip);
      fk.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
      });

      card.appendChild(lab); card.appendChild(fk);
      isi.appendChild(card);
    });
  }

  function buildGloss() {
    var tip = add('<div id="cpns-gloss-tip" role="tooltip"></div>');
    doc.body.appendChild(tip);
    var tipText = tip;

    function attach(span, def) {
      span.setAttribute("data-def", def);
      span.addEventListener("mouseenter", showTip);
      span.addEventListener("mouseleave", hideTip);
      span.addEventListener("focus", showTip);
      span.addEventListener("blur", hideTip);
    }
    function posTip(span) {
      var r = span.getBoundingClientRect();
      var w = tipText.offsetWidth || 240;
      var left = Math.min(Math.max(6, r.left + r.width / 2 - w / 2), window.innerWidth - w - 6);
      var top = r.top - tipText.offsetHeight - 10;
      if (top < 4) top = r.bottom + 10;
      tipText.style.left = left + "px";
      tipText.style.top = top + "px";
    }
    function showTip(e) {
      tipText.textContent = e.currentTarget.getAttribute("data-def");
      tipText.classList.add("on");
      posTip(e.currentTarget);
    }
    function hideTip() { tipText.classList.remove("on"); }

    var used = {};
    GLOSS.forEach(function (g) {
      if (used[g.t]) return;
      var topic = doc.getElementById(g.top);
      if (!topic) return;
      var termRe = new RegExp(g.t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![\\w])", "i");
      var walker = doc.createTreeWalker(topic, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          var p = node.parentNode;
          if (!p) return NodeFilter.FILTER_REJECT;
          if (p.closest && p.closest(".cpns-gloss, a, h3, h4")) return NodeFilter.FILTER_REJECT;
          if (p.textContent.trim().length < 3) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      var node;
      while ((node = walker.nextNode())) {
        var m = node.textContent.match(termRe);
        if (!m || m.index === undefined) continue;
        var st = m.index, en = st + g.t.length;
        var mid = node.splitText(st);
        var tail = mid.splitText(en - st);
        var span = el("span");
        span.className = "cpns-gloss";
        span.tabIndex = 0;
        span.textContent = mid.textContent;
        mid.parentNode.replaceChild(span, mid);
        attach(span, g.d);
        used[g.t] = true;
        break;
      }
    });
  }

  /* ============================================================
     Tema Nusantara Museum — fitur interaktif (Fase 2)
     ============================================================ */
  var toastEl = null, toastT = 0;
  function toast(msg, dur) {
    if (!toastEl) { toastEl = el("div"); toastEl.id = "cpns-toast"; toastEl.setAttribute("role", "status"); doc.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("on"); }, dur || 2600);
  }

  function scrollToAnchor(node, offset) {
    if (!node) return;
    var r = node.getBoundingClientRect().top + window.pageYOffset - (offset || 84);
    window.scrollTo({ top: r < 0 ? 0 : r, behavior: "smooth" });
  }

  function eraLetter(topic) {
    var s = topic.closest ? topic.closest("section.bagian") : null;
    return (s && s.dataset) ? s.dataset.era : "";
  }

  function buildTocGroups() {
    var ol = doc.querySelector("nav.toc ol");
    if (!ol || !ol.children.length) return;
    ol.classList.add("cpns-tocgrid");
    var curEra = null;
    var items = Array.prototype.slice.call(ol.children);
    var firstInsert = false;
    items.forEach(function (li) {
      var a = li.querySelector("a[href^='#']");
      var er = "";
      if (a) {
        var t = doc.getElementById(a.getAttribute("href").slice(1));
        if (t) er = eraLetter(t);
      }
      if (er && er !== curEra) {
        var meta = ERAS["bagian-" + er];
        if (meta) {
          var g = el("li");
          g.className = "toc-group" + (firstInsert ? "" : " first");
          firstInsert = true;
          g.dataset.era = er;
          g.textContent = "Bab " + meta.roman + " — " + meta.label;
          ol.insertBefore(g, li);
        }
        curEra = er;
      } else if (curEra && !er) {
        curEra = er;
      }
    });
  }

  function buildHeroStats() {
    var host = doc.getElementById("hero-stats");
    if (!host) return;
    var mins = Math.max(1, Math.round(totalWords / 200));
    var figs = doc.querySelectorAll(".materi-figure img").length;
    function chip(b, label) {
      var s = el("span"); s.className = "hs-chip";
      var bd = el("b"); bd.textContent = b;
      s.appendChild(bd); s.appendChild(doc.createTextNode(" " + label));
      return s;
    }
    host.appendChild(chip(String(topics.length), "topik"));
    host.appendChild(chip("5", "bab / era"));
    host.appendChild(chip("±" + mins, "mnt baca"));
    host.appendChild(chip(String(figs), "dokumentasi"));
  }

  function buildLightbox() {
    if (reducedMotion) {} // animasi hanya via CSS
    var lb = add(
      '<div id="cpns-lightbox" role="dialog" aria-modal="true" aria-label="Perbesar gambar">' +
      '<button type="button" class="lb-x" aria-label="Tutup">✕</button>' +
      '<figure><img src="" alt=""><figcaption><span class="lb-title"></span></figcaption></figure></div>');
    doc.body.appendChild(lb);
    var img = lb.querySelector("img");
    var cap = lb.querySelector(".lb-title");
    var open = false;
    function close() {
      open = false;
      lb.classList.remove("on");
      doc.body.style.overflow = "";
    }
    function show(srcEl) {
      var big = srcEl.getAttribute("data-lb") || srcEl.src;
      img.src = big;
      cap.textContent = srcEl.alt || "";
      lb.classList.add("on");
      open = true;
      doc.body.style.overflow = "hidden";
    }
    doc.querySelectorAll("figure.materi-figure img").forEach(function (im) {
      im.addEventListener("click", function (e) { e.stopPropagation(); show(im); });
    });
    lb.addEventListener("click", close);
    lb.querySelector(".lb-x").addEventListener("click", function (e) { e.stopPropagation(); close(); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) close(); });
    window.addEventListener("pagehide", close);
  }

  function buildKilas() {
    Object.keys(KILAS).forEach(function (bid) {
      var bag = doc.getElementById(bid);
      var isi = bag && bag.querySelector(".bagian-isi");
      if (!isi) return;
      var items = KILAS[bid];
      var panel = el("section"); panel.className = "cpns-kilas";
      panel.setAttribute("aria-label", "Kilas bagian");
      var head = el("button"); head.type = "button"; head.className = "cpns-kilas-head";
      head.setAttribute("aria-expanded", "false");
      head.textContent = "⚡ Kilas bagian — tiga inti bab ini";
      var body = el("div"); body.className = "cpns-kilas-body"; body.hidden = true;
      items.forEach(function (it, i) {
        var row = el("div"); row.className = "cpns-kilas-item";
        var num = el("span"); num.className = "cpns-kilas-num"; num.textContent = String(i + 1);
        var txt = el("span"); txt.textContent = it.t;
        var src = doc.getElementById(it.top);
        var link = src ? el("a") : null;
        if (link) { link.href = "#" + it.top; link.textContent = "topik " + it.top.replace(/^t/, ""); }
        row.appendChild(num); row.appendChild(txt);
        if (link) row.appendChild(link);
        body.appendChild(row);
      });
      head.addEventListener("click", function () {
        body.hidden = !body.hidden;
        head.setAttribute("aria-expanded", String(!body.hidden));
        if (!body.hidden && panel.getBoundingClientRect().top < 0) {
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      panel.appendChild(head); panel.appendChild(body);
      isi.insertBefore(panel, isi.firstChild);
    });
  }

  function buildQuotes() {
    Object.keys(PULL).forEach(function (bid) {
      var bag = doc.getElementById(bid);
      var isi = bag && bag.querySelector(".bagian-isi");
      if (!isi) return;
      var d = PULL[bid];
      var meta = ERAS[bid];
      var q = el("section"); q.className = "cpns-quote";
      q.dataset.src = d.src;
      var lab = el("p"); lab.className = "cpns-quote-label";
      lab.textContent = "Kalimat kunci — Bab " + meta.roman;
      var bq = el("blockquote"); bq.textContent = d.quote;
      var cite = el("cite");
      var a = el("a"); a.href = "#" + d.src; a.textContent = "sumber: topik " + d.src.replace(/^t/, "");
      cite.appendChild(a);
      q.appendChild(lab); q.appendChild(bq); q.appendChild(cite);
      isi.appendChild(q);
    });
  }

  function buildRail() {
    var bags = Array.prototype.slice.call(doc.querySelectorAll("section.bagian"));
    if (!bags.length) return;
    var rail = el("nav"); rail.id = "cpns-rail"; rail.setAttribute("aria-label", "Lompat antar bab (era)");
    var buttons = {};
    bags.forEach(function (bag) {
      var er = bag.dataset.era;
      var meta = ERAS[bag.id]; if (!meta) return;
      var b = el("button"); b.type = "button"; b.className = "cpns-rail-btn";
      b.dataset.era = er;
      b.setAttribute("aria-label", "Lompat ke Bab " + meta.roman + " — " + meta.label);
      b.style.setProperty("--era", "var(--era-" + er + ")");
      var dot = el("i"); dot.className = "rp-dot";
      var lab = doc.createTextNode(meta.roman);
      var bar = el("span"); bar.className = "rail-bar";
      var fill = el("b"); fill.className = "rp-fill";
      bar.appendChild(fill);
      b.appendChild(dot); b.appendChild(lab); b.appendChild(bar);
      b.addEventListener("click", function () { scrollToAnchor(bag, 60); });
      rail.appendChild(b);
      buttons[bag.id] = { btn: b, fill: fill, count: 0 };
    });
    doc.body.appendChild(rail);

    scrollHooks.push(function () {
      var activeId = null;
      for (var i = 0; i < topics.length; i++) { if (topics[i].getBoundingClientRect().top <= 160) activeId = topics[i].closest("section.bagian").id; else break; }
      var firstBag = doc.querySelector("section.bagian");
      if (!activeId && firstBag) activeId = firstBag.id;
      Object.keys(buttons).forEach(function (bid) {
        var c = buttons[bid];
        c.btn.classList.toggle("active", bid === activeId);
      });
    });
  }

  function buildKeyboard() {
    doc.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || (t.isContentEditable))) return;
      if (e.key === "[") { var p = topics[Math.max(0, topics.indexOf(currentTopic()) - 1)]; if (p) { e.preventDefault(); scrollToAnchor(p, 80); } }
      else if (e.key === "]") { var nx = topics[Math.min(topics.length - 1, topics.indexOf(currentTopic()) + 1)]; if (nx) { e.preventDefault(); scrollToAnchor(nx, 80); } }
      else if (e.key === "?") { e.preventDefault(); toast("[ ] pindah topik · 1–5 lompat bab · ? bantuan ini"); }
      else if (e.key === "/" && e.shiftKey) { e.preventDefault(); toast("[ ] pindah topik · 1–5 lompat bab · ? bantuan ini"); }
      else if (/^[1-5]$/.test(e.key)) {
        var bi = parseInt(e.key, 10) - 1;
        var bag = doc.querySelectorAll("section.bagian")[bi];
        if (bag) { e.preventDefault(); scrollToAnchor(bag, 60); }
      }
    });
  }
  function currentTopic() {
    return doc.getElementById(currentTopicId()) || topics[0];
  }

  var NOTES_DB = null;
  var NOTES_PANEL = null;
  var NOTES_TOPIC = null;
  function loadNotes() { try { return JSON.parse(KV.get("cpns-note") || "{}"); } catch (e) { return {}; } }
  function saveNotes() { KV.set("cpns-note", JSON.stringify(NOTES_DB)); }
  function notesTitle(tid) {
    var t = doc.getElementById(tid);
    return t ? ("# " + t.id + " · " + cleanTitle(t)) : ("# " + tid);
  }
  function syncNotesTopic(tid) {
    if (!NOTES_PANEL) return;
    NOTES_TOPIC = tid;
    var sel = NOTES_PANEL.querySelector(".nn-select");
    var ta = NOTES_PANEL.querySelector("textarea");
    sel.value = tid;
    var h = NOTES_PANEL.querySelector(".nn-topic");
    h.textContent = notesTitle(tid);
    ta.value = NOTES_DB[tid] || "";
  }
  function buildNotesPanel() {
    var p = el("div"); p.id = "cpns-notes";
    var head = el("div"); head.className = "nn-head";
    var title = el("span"); title.textContent = "📝 Catatan belajar";
    var x = el("button"); x.type = "button"; x.className = "nn-x"; x.setAttribute("aria-label", "Tutup catatan"); x.textContent = "✕";
    var sel = el("select"); sel.className = "nn-select"; sel.setAttribute("aria-label", "Pilih topik");
    topics.forEach(function (t) {
      var o = el("option"); o.value = t.id; o.textContent = cleanTitle(t);
      sel.appendChild(o);
    });
    var topic = el("div"); topic.className = "nn-topic"; topic.textContent = "";
    var ta = el("textarea"); ta.placeholder = "Tulis catatan untuk topik ini — tersimpan otomatis di perangkatmu…";
    var foo = el("div"); foo.className = "nn-foo";
    var saveInfo = el("span"); saveInfo.textContent = "tersimpan otomatis";
    foo.appendChild(saveInfo);
    head.appendChild(title); head.appendChild(x);
    p.appendChild(head); p.appendChild(sel); p.appendChild(topic); p.appendChild(ta); p.appendChild(foo);
    doc.body.appendChild(p);
    NOTES_PANEL = p;
    x.addEventListener("click", closeNotes);
    ta.addEventListener("input", function () {
      if (!NOTES_TOPIC) return;
      NOTES_DB[NOTES_TOPIC] = ta.value;
      saveNotes();
    });
    sel.addEventListener("change", function () { syncNotesTopic(sel.value); });
  }
  function closeNotes() { if (NOTES_PANEL) NOTES_PANEL.classList.remove("on"); }
  function toggleNotes() {
    if (!NOTES_DB) NOTES_DB = loadNotes();
    if (!NOTES_PANEL) buildNotesPanel();
    var on = NOTES_PANEL.classList.contains("on");
    if (on) { closeNotes(); return; }
    NOTES_PANEL.classList.add("on");
    syncNotesTopic(currentTopic().id);
    NOTES_PANEL.querySelector("textarea").focus();
  }

  var HL = [];
  function loadHL() { try { return JSON.parse(KV.get("cpns-hl") || "[]"); } catch (e) { return []; } }
  function saveHL() { KV.set("cpns-hl", JSON.stringify(HL)); }

  function isHlTextNode(node) {
    var p = node.parentNode;
    if (!p) return false;
    if (p.closest) {
      if (p.closest("button, a, .cpns-pager, .cpns-rail-btn")) return false;
      if (p.closest(".cpns-kilas, .cpns-fakta, .cpns-quote")) return false;
      if (!p.closest("h2, h3, h4, p, li")) return false;
    }
    return true;
  }
  function topicBuffer(topic, nodes) {
    var parts = [];
    var w = doc.createTreeWalker(topic, NodeFilter.SHOW_TEXT, { acceptNode: isHlTextNode });
    var n;
    while ((n = w.nextNode())) { nodes.push(n); parts.push(n.textContent); }
    return parts.join("\u0001");
  }
  function wrapRangeNodes(topic, start, end, cls) {
    var nodes = [];
    var buf = topicBuffer(topic, nodes);
    if (start < 0 || end > buf.length || start >= end) return;
    var acc = 0, s = null, so = 0, e = null, eo = 0;
    for (var i = 0; i < nodes.length; i++) {
      var len = nodes[i].textContent.length;
      if (!s && acc + len > start) { s = nodes[i]; so = start - acc; }
      if (s && acc + len >= end) { e = nodes[i]; eo = end - acc; break; }
      acc += len;
    }
    if (!s || !e) return;
    var r = doc.createRange();
    r.setStart(s, Math.max(0, Math.min(so, s.textContent.length)));
    r.setEnd(e, Math.max(0, Math.min(eo, e.textContent.length)));
    var frag = r.extractContents();
    var mark = el("mark"); mark.className = "cpns-hl " + cls;
    mark.appendChild(frag);
    r.insertNode(mark);
  }
  function restoreHL() {
    if (!HL.length) return;
    var byTopic = {};
    HL.forEach(function (h) { (byTopic[h.id] = byTopic[h.id] || []).push(h); });
    Object.keys(byTopic).forEach(function (tid) {
      var topic = doc.getElementById(tid);
      if (!topic) return;
      // hapus mark lama (amannya)
      Array.prototype.slice.call(topic.querySelectorAll("mark.cpns-hl")).forEach(function (mk) {
        var parent = mk.parentNode;
        while (mk.firstChild) parent.insertBefore(mk.firstChild, mk);
        mk.remove();
      });
      var nodes = [];
      var buf = topicBuffer(topic, nodes);
      var cands = byTopic[tid].map(function (h) {
        var idx = buf.indexOf(h.text);
        return idx >= 0 ? { cls: h.color, start: idx, end: idx + h.text.length } : null;
      }).filter(Boolean);
      cands.sort(function (x, y) { return y.start - x.start; });
      cands.forEach(function (c) { wrapRangeNodes(topic, c.start, c.end, c.cls); });
    });
  }

  function buildGlassHl() {
    HL = loadHL();
    var bar = el("div"); bar.id = "cpns-hlbar"; bar.hidden = true;
    var colors = [
      { cls: "c0", label: "Sinyal penting" },
      { cls: "c1", label: "Kata kunci TWK" },
      { cls: "c2", label: "Perlu ditelusuri lagi" }
    ];
    colors.forEach(function (c) {
      var b = el("button"); b.type = "button"; b.className = "cpns-hl-btn cpns-hl-" + c.cls;
      b.title = c.label;
      b.setAttribute("aria-label", "Sorot kuning — " + c.label);
      var bg = el("span"); bg.className = "cpns-hl-bg";
      b.appendChild(bg);
      b.addEventListener("click", function () { applyHl(c.cls); });
      bar.appendChild(b);
    });
    var clear = el("button"); clear.type = "button"; clear.className = "cpns-hl-clear";
    clear.textContent = "×";
    clear.title = "Hapus semua sorotan di topik ini";
    clear.setAttribute("aria-label", "Hapus semua sorotan di topik ini");
    clear.addEventListener("click", clearHl);
    bar.appendChild(clear);
    doc.body.appendChild(bar);

    var lastRange = null;
    var lastTopic = null;
    var hideT = 0;

    function hide() {
      bar.hidden = true;
      bar.classList.remove("on");
      lastRange = null; lastTopic = null;
    }
    function showAt(rect) {
      bar.hidden = false;
      bar.classList.add("on");
      var bw = bar.offsetWidth || 150;
      var left = Math.max(6, Math.min(rect.right - bw + 8, window.innerWidth - bw - 6));
      var top = rect.bottom + 8;
      if (top + bar.offsetHeight > window.innerHeight - 70) top = rect.top - bar.offsetHeight - 8;
      bar.style.left = left + "px";
      bar.style.top = Math.max(6, top) + "px";
    }
    function validSel() {
      var sel = window.getSelection();
      if (!sel || sel.rangeCount < 1 || sel.isCollapsed) return null;
      var r = sel.getRangeAt(0);
      if (!r.toString().trim()) return null;
      var c = r.commonAncestorContainer;
      var top = c.nodeType === 1 ? c : c.parentNode;
      if (!top || !top.closest) return null;
      var topic = top.closest("article.topik");
      if (!topic) return null;
      var host = top.closest("p, li, h3, h4");
      if (!host || !topic.contains(host)) return null;
      return { topic: topic, range: r, rect: r.getBoundingClientRect() };
    }
    doc.addEventListener("mouseup", function () {
      clearTimeout(hideT);
      hideT = setTimeout(update, 60);
    });
    doc.addEventListener("keyup", function () {
      clearTimeout(hideT);
      hideT = setTimeout(update, 60);
    });
    function update() {
      var ctx = validSel();
      if (!ctx) { hide(); return; }
      lastRange = ctx.range;
      lastTopic = ctx.topic;
      showAt(ctx.rect);
    }
    doc.addEventListener("mousedown", function (e) {
      if (bar.contains(e.target)) return;
      clearTimeout(hideT);
      hide();
    });
    window.addEventListener("scroll", function () { clearTimeout(hideT); hide(); }, { passive: true });

    function applyHl(cls) {
      if (!lastRange || !lastTopic) return;
      var text = (lastRange.toString() || "").trim();
      var frag = lastRange.extractContents();
      var mark = el("mark"); mark.className = "cpns-hl " + cls;
      mark.appendChild(frag);
      lastRange.insertNode(mark);
      if (text) {
        HL.push({ id: lastTopic.id, text: text, color: cls });
        saveHL();
      }
      var lbl = cls === "c0" ? "kuning" : (cls === "c1" ? "hijau" : "biru");
      toast("📖 Disorot " + lbl + " di " + lastTopic.id + " — tersimpan (" + HL.filter(function (h) { return h.id === lastTopic.id; }).length + " sorotan di sini)");
      hide();
      window.getSelection && window.getSelection().removeAllRanges && window.getSelection().removeAllRanges();
    }
    function clearHl() {
      if (!lastTopic) {
        var t = currentTopic();
        if (t) clearTopic(t);
        return;
      }
      clearTopic(lastTopic);
    }
    function clearTopic(topic) {
      Array.prototype.slice.call(topic.querySelectorAll("mark.cpns-hl")).forEach(function (mk) {
        var parent = mk.parentNode;
        while (mk.firstChild) parent.insertBefore(mk.firstChild, mk);
        mk.remove();
      });
      HL = HL.filter(function (h) { return h.id !== topic.id; });
      saveHL();
      toast("Sorotan di " + topic.id + " dibersihkan.");
      hide();
    }
  }

  function buildMilestones() {
    var hit = new Set();
    try { hit = new Set(JSON.parse(KV.get("cpns-ms") || "[]")); } catch (e) {}
    var msgs = { 25: "25% materi — lanjut santai 🐾", 50: "50% — setengah jalan 🐾", 75: "75% — tinggal sedikit 🐾", 100: "100% — sejarah selesai 🎉" };
    var lastPct = 0;
    function save() { KV.set("cpns-ms", JSON.stringify(Array.from(hit))); }
    scrollHooks.push(function () {
      var d = doc.documentElement;
      var max = d.scrollHeight - d.clientHeight;
      var pct = max > 0 ? Math.min(100, Math.max(0, Math.round(d.scrollTop / max * 100))) : 0;
      [25, 50, 75, 100].forEach(function (t) {
        if (!hit.has(t) && pct >= t) { hit.add(t); save(); toast(msgs[t], 1900); }
      });
      lastPct = pct;
    });
  }

  /* ============================================================
     Ikan Cimit — teman bertumbuh seiring dibaca
     Ikan berevolusi mengikuti pct scroll: dari ikan biasa
     kecil → berganti jenis-jenis ikan → akhirnya ikan besar
     yang Cimit suka. Era-follow, kalem, hormati reduced motion.
     ============================================================ */
  function buildIkan() {
    var ikanEl = el("span");
    ikanEl.id = "cpns-ikan";
    ikanEl.className = "cpns-ikan";
    ikanEl.setAttribute("role", "img");
    ikanEl.setAttribute("aria-hidden", "true");
    doc.body.appendChild(ikanEl);

    var artEl = el("span");
    artEl.className = "cpns-ikan-art";
    ikanEl.appendChild(artEl);

    var STAGES = [
      { at: 0,  name: "ikan biasa kecil",            k: "ikan biasa yang kecil",                fill: "#b9bec8", tail: "#8f96a4", ry: 12, tailL: 7,  h: 64, big: false },
      { at: 20, name: "ikan gupi",                   k: "gupi kecil berwarna",                  fill: "#d0667d", tail: "#b04866", ry: 13, tailL: 9,  h: 70, big: false },
      { at: 40, name: "ikan mas koki",               k: "mas koki bulat nanas hias",            fill: "#d9a13b", tail: "#b98a2e", ry: 15, tailL: 10, h: 78, big: false },
      { at: 60, name: "ikan Nemo / oskar karang",    k: "ikan karang loreng tropis",            fill: "#c96a2e", tail: "#2b6a9b", ry: 15, tailL: 11, h: 86, big: false },
      { at: 80, name: "ikan koki mas besar",         k: "mas koki besar",                       fill: "#b98a2e", tail: "#8a6016", ry: 16, tailL: 12, h: 96, big: false },
      { at: 95, name: "ikan besar favorit Cimit",    k: "ikan besar yang Cimit suka",           fill: "var(--era,var(--accent))", tail: "var(--accent)", ry: 18, tailL: 14, h: 112, big: true }
    ];
    var hitIkan = new Set();
    try { hitIkan = new Set(JSON.parse(KV.get("cpns-ikans") || "[]")); } catch (e) {}
    var curStage = -1;
    var bigSaid = false;

    function saveIkan() { KV.set("cpns-ikans", JSON.stringify(Array.from(hitIkan))); }

    function fishArt(s) {
      var extra = "";
      if (s.name === "ikan Nemo / oskar karang") {
        extra = '<path d="M27 8 Q30 16 24 24" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="2" opacity=".6"/><path d="M16 6 Q20 4 22 8 Z" fill="#fff" opacity=".7"/>';
      }
      if (s.name === "ikan besar favorit Cimit") extra = '<path d="M9 3 L7 8 L11 6 Z" fill="rgba(255,255,255,.8)" opacity=".9"/><path d="M3 30 L6 27" stroke="var(--era,var(--accent))" stroke-width="2" stroke-linecap="round"/>';
      return '<svg class="cpns-ikan-art" viewBox="0 0 64 44" width="80" role="img" aria-hidden="true">' +
        '<ellipse cx="26" cy="22" rx="' + (14 + s.ry * 0.5) + '" ry="' + s.ry + '" fill="' + s.fill + '" stroke="rgba(31,36,48,.35)" stroke-width="1.4"/>' +
        '<path d="M40 22 L' + (40 + s.tailL * 1.4) + ' 14 L' + (40 + s.tailL) + ' 22 L' + (40 + s.tailL * 1.4) + ' 30 Z" fill="' + s.tail + '" stroke="rgba(31,36,48,.3)" stroke-width="1"/>' +
        '<path d="M24 8 Q30 16 25 20" fill="none" stroke="' + s.tail + '" stroke-width="2.4" opacity=".5"/>' +
        '<circle cx="18" cy="19" r="2.6" fill="#fff"/><circle cx="17" cy="19" r="1.4" fill="#20242d"/>' +
        '<path d="M22 27 Q26 29 30 27" fill="none" stroke="rgba(31,36,48,.25)" stroke-width="1.2"/>' + extra +
        '</svg>';
    }

    function setStage(i) {
      if (i === curStage) return;
      curStage = i;
      var s = STAGES[i];
      ikanEl.style.setProperty("--ikan-h", s.h + "px");
      artEl.innerHTML = fishArt(s);
      if (reducedMotion) { artEl.style.animation = "none"; }
      ikanEl.setAttribute("aria-label", "Teman baca: " + s.name + " (" + STAGES[0].name + " → berkembang)");
      if (!hitIkan.has(i)) {
        hitIkan.add(i); saveIkan();
        if (i >= 4) { toast("Cimit: " + s.k + " 🐟", 2000); }
        if (i >= 5 && !bigSaid) {
          bigSaid = true;
          var hearts = el("span"); hearts.className = "cpns-ikan-hearts"; hearts.textContent = "💗";
          ikanEl.appendChild(hearts);
          catReact("bigfish");
        }
      }
    }

    function refresh() {
      if (!ikanEl) return;
      var d = doc.documentElement;
      var max = d.scrollHeight - d.clientHeight;
      var pct = max > 0 ? Math.min(100, Math.max(0, Math.round(d.scrollTop / max * 100))) : 0;
      var stage = 0;
      for (var i = 1; i < STAGES.length; i++) { if (pct >= STAGES[i].at) stage = i; }
      setStage(stage);
    }

    scrollHooks.push(refresh);

    /* reaksi kalem: saat ikan besar muncul, Cimit ikut gembira.
       catReact hanyalah "bigfish" — jenis reaksi lain tetap
       diteruskan ke reaksi kucing yang lama (bila ada). */
    var _prevCatReact = (typeof catReactLama === "function") ? catReactLama : null;
    function catReact(kind) {
      if (kind === "bigfish") {
        catSay(pickCat(CAT_BIGFISH) || "ikan besarr. aku mau dipeluk! 🐟💙");
        catSpawnHearts(4);
      } else if (_prevCatReact) { return _prevCatReact(kind); }
    }

    refresh();
  }

  /* ============================================================
     Cimit — maskot kucing perpustakaan
     ============================================================ */
  var catEl = null, catBubble = null, catHearts = null;
  var catMood = "idle", catPets = 0, catCalm = 0, catHideTimeout = 0;
  var catIdleTimer = 0, catActTimer = 0;

  var CAT_PURR = ["purrr… asyik bacanya 🌿", "aku nungguin kamu baca dari sini", "shh… jangan buru-buru, nikmati dulu", "√ setuju, bagian ini penting banget"];
  var CAT_JENGAH = ["ih, udah… jangan banyak-banyak ngepet ☕", "elusnya dikit-dikit aja dong", "aku bukan tombol stress ball 😾"];
  var CAT_ANGRY = ["STOP! aku lagi marah, jangan dulu ngepet 😡", "aduh, aku sampai geram kucing nih", "jangan diprovokasi! aku antre sabar"];
  var CAT_ANGRY_REPLY = ["masih marah… sabar dulu, ya", "sabar… sabar… 🐾", "jangan lagi… aku sensitif bagian ini"];
  var CAT_CALM = ["nah, gitu dong. aku ikut tenang 😌", "sip, mood-ku pulih. lanjut baca!", "makanya jangan jorok ngepet… hehe"];

  function pickCat(list) { return list[Math.floor(Math.random() * list.length)]; }

  function catSay(msg) {
    if (!catBubble) return;
    catBubble.textContent = msg;
    catBubble.classList.add("on");
    clearTimeout(catHideTimeout);
    catHideTimeout = setTimeout(function () { catBubble.classList.remove("on"); }, 1900);
  }

  function catSpawnHearts(n) {
    if (!catHearts || reducedMotion) return;
    for (var i = 0; i < n; i++) {
      var h = el("span"); h.className = "cpns-cat-heart";
      h.textContent = i % 2 ? "💗" : "✨";
      h.style.marginLeft = ((i - 1) * 12) + "px";
      catHearts.appendChild(h);
      setTimeout(function () { if (h.parentNode) h.parentNode.removeChild(h); }, 1000);
    }
  }

  function catCalmDown() {
    catMood = "idle";
    catPets = 0;
    if (catEl) catEl.classList.remove("mood-angry", "mood-jengah");
    catSay(pickCat(CAT_CALM));
  }

  function catPet() {
    if (!catEl || doc.hidden) return;
    catInterruptAct();
    catEl.classList.remove("busy");
    if (catMood === "angry") { catSay(pickCat(CAT_ANGRY_REPLY)); return; }
    catPets++;
    if (catPets >= 7) {
      catMood = "angry";
      catEl.classList.add("mood-angry");
      catEl.classList.remove("mood-jengah");
      catSay(pickCat(CAT_ANGRY));
      catCalm = setTimeout(catCalmDown, 25000);
      return;
    }
    if (catPets >= 4) {
      catMood = "jengah";
      catEl.classList.add("mood-jengah");
      catEl.classList.remove("mood-angry");
      catSay(pickCat(CAT_JENGAH));
      return;
    }
    catMood = "purr";
    catEl.classList.remove("mood-angry", "mood-jengah");
    catSpawnHearts(2);
    if (Math.random() < 0.6) catSay(pickCat(CAT_PURR));
  }

  function catPlace() {
    if (!catEl) return;
    var ww = window.innerWidth;
    if (ww >= 980) {
      var wrap = doc.querySelector(".wrap");
      var gap = 24;
      if (wrap) {
        var r = catEl.getBoundingClientRect();
        var catW = r && r.width ? r.width : 88;
        var gutter = ww - wrap.getBoundingClientRect().right;
        gap = Math.max(10, gutter - catW - 8);
      }
      catEl.style.right = gap + "px";
      if (catBubble) catBubble.style.right = gap + "px";
    } else {
      catEl.style.right = "8px";
      if (catBubble) catBubble.style.right = "14px";
    }
  }

  function catRefresh() {
    if (!catEl) return;
    if (!catEl.classList.contains("busy")) {
      var er = eraLetter(currentTopic());
      if (er) catEl.style.setProperty("--era", "var(--era-" + er + ")");
    }
  }

  /* Cimit melakukan aktivitasnya sendiri: main / bobok */
  function catInterruptAct() {
    clearTimeout(catActTimer);
    clearTimeout(catIdleTimer);
    if (catEl) catEl.classList.remove("play", "nap");
  }

  function catScheduleIdle() {
    clearTimeout(catIdleTimer);
    if (!catEl || reducedMotion) return;
    var delay = doc.hidden ? 6000 : 8000 + Math.floor(Math.random() * 12000);
    catIdleTimer = setTimeout(catDoAct, delay);
  }

  function catDoAct() {
    if (!catEl || reducedMotion || doc.hidden) { catScheduleIdle(); return; }
    if (catEl.classList.contains("busy") || catMood === "angry" || catMood === "jengah") { catScheduleIdle(); return; }
    var act, dur;
    if (Math.random() < 0.45) { act = "play"; dur = 2100; }
    else { act = "nap"; dur = 2500; }
    catEl.classList.add(act);
    clearTimeout(catActTimer);
    catActTimer = setTimeout(function () {
      if (catEl) catEl.classList.remove("play", "nap");
      catScheduleIdle();
    }, dur);
  }

  function buildCat() {
    catEl = el("button");
    catEl.type = "button";
    catEl.className = "cpns-cat";
    catEl.setAttribute("aria-label", "Cimit, teman belajar sejarah — sentuh atau tekan Enter/Space untuk berinteraksi");
    catEl.title = "Hai, aku Cimit 🐾";
    catEl.innerHTML =
      '<span class="cpns-cat-hearts"></span>' +
      '<span class="act act-play" aria-hidden="true">🧶</span>' +
      '<span class="act act-nap" aria-hidden="true">💤</span>' +
      '<svg class="cpns-cat-art" viewBox="0 0 193.0499 187.59195" role="img" aria-hidden="true">' +
      '<defs id="defs1" /><g id="layer1" transform="translate(521.24275,-200.45721)"><g id="g393"><g id="g392" transform="translate(-534.14835,387.04914)"><path style="opacity:1;fill:#cc7918;fill-opacity:1;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 41.533685,-94.292689 c 6.892539,-41.041271 -4.49013,-89.802561 -4.49013,-89.802561 0,0 35.039213,6.90358 49.391408,26.19242 21.195687,-10.80855 36.671417,-5.41056 52.010647,0.37417 10.67733,-21.02669 45.64964,-28.0633 45.64964,-28.0633 0,0 -12.58195,43.77875 -3.74177,90.925095 15.852,-4.232721 14.94582,3.823889 16.4638,10.102786 9.87369,6.327142 7.51897,13.353995 0.37418,25.069884 C 211.0445,-33.73408 202.87709,-16.947351 199.47879,0 L 19.831399,-1.122532 c -6.809141,-14.709918 -9.529737,-32.145532 1.496709,-58.745841 -1.397317,-8.269416 -6.134805,-17.373875 3.741773,-22.824818 1.197447,-7.870954 0.826822,-17.205443 16.463804,-11.599498 z" id="path109" /><g id="g155" transform="matrix(0.4385595,-0.08831955,0.08831955,0.4385595,325.90458,-215.02128)"><path style="fill:#000000" d="m -660.64146,180.78286 c -5.65334,-1.35045 -8.97673,-7.80367 -7.08912,-13.24155 1.41629,-7.03024 5.61095,-14.87732 13.22734,-16.40073 5.83465,-0.90564 11.47754,4.08422 11.50204,9.96066 0.8039,7.33688 -2.14743,15.53245 -8.52948,19.58492 -2.82999,1.40938 -6.21165,1.14527 -9.11078,0.0967 z" id="path126" /><path style="fill:#000000" d="m -683.66035,180.46338 c -6.32169,1.37898 -11.58338,-4.24883 -13.35344,-9.79071 -2.53682,-6.21513 -2.73614,-14.96022 3.34994,-19.19071 5.48262,-3.39866 12.87273,-0.31279 15.77113,5.08383 3.26482,4.96685 5.55882,11.29593 3.92855,17.22298 -1.53444,3.93093 -5.76782,5.99003 -9.69618,6.67461 z" id="path127" /><path style="fill:#000000" d="m -645.89122,200.01553 c -5.41658,-1.93644 -7.10832,-8.89343 -4.35594,-13.63655 3.174,-6.72787 10.5225,-11.78716 18.04585,-11.45803 6.14672,0.90893 7.80585,8.07719 5.72554,13.11295 -2.0596,7.28113 -9.24158,14.1354 -17.22658,12.73462 -0.75247,-0.17706 -1.48413,-0.43658 -2.18887,-0.75299 z" id="path128" /><path style="fill:#000000" d="m -699.47729,201.79456 c -8.63565,0.53941 -15.12364,-7.88515 -15.94603,-15.84679 -1.16052,-5.11566 2.11902,-11.53036 7.94447,-11.0685 6.30386,0.33507 11.55081,5.11326 14.7287,10.25287 2.70483,4.54034 3.21851,11.6751 -1.80588,14.84136 -1.48165,0.95852 -3.18429,1.54443 -4.92126,1.82106 z" id="path141" /><path style="fill:#000000" d="m -689.08474,229.04756 c -7.06699,-0.85171 -14.43503,-7.35063 -12.77738,-14.99533 1.08611,-6.06269 5.02295,-7.84293 9.76389,-11.17423 2.04065,-1.4339 7.11214,-3.09819 8.49236,-5.17066 2.0161,-3.02729 0.89674,-9.27146 2.97943,-12.22563 4.82045,-6.05732 15.45867,-5.92314 19.70475,0.73541 1.73715,3.26568 0.0908,8.11658 2.27277,11.16376 2.35913,3.29464 8.60854,4.73367 12.19177,6.81058 6.96084,4.74581 8.2149,16.31963 1.26484,21.64683 -9.56876,8.1221 -25.51482,-3.2269 -25.79169,-3.23507 -1.4784,-0.0436 -6.97327,7.16496 -18.10074,6.44434 z" id="path155" /></g><g id="g187" transform="matrix(-0.44625715,-0.03145372,-0.03145372,0.44625715,-119.31464,-180.00754)"><path style="fill:#000000" d="m -660.64146,180.78286 c -5.65334,-1.35045 -8.97673,-7.80367 -7.08912,-13.24155 1.41629,-7.03024 5.61095,-14.87732 13.22734,-16.40073 5.83465,-0.90564 11.47754,4.08422 11.50204,9.96066 0.8039,7.33688 -2.14743,15.53245 -8.52948,19.58492 -2.82999,1.40938 -6.21165,1.14527 -9.11078,0.0967 z" id="path156" /><path style="fill:#000000" d="m -683.66035,180.46338 c -6.32169,1.37898 -11.58338,-4.24883 -13.35344,-9.79071 -2.53682,-6.21513 -2.73614,-14.96022 3.34994,-19.19071 5.48262,-3.39866 12.87273,-0.31279 15.77113,5.08383 3.26482,4.96685 5.55882,11.29593 3.92855,17.22298 -1.53444,3.93093 -5.76782,5.99003 -9.69618,6.67461 z" id="path177" /><path style="fill:#000000" d="m -645.89122,200.01553 c -5.41658,-1.93644 -7.10832,-8.89343 -4.35594,-13.63655 3.174,-6.72787 10.5225,-11.78716 18.04585,-11.45803 6.14672,0.90893 7.80585,8.07719 5.72554,13.11295 -2.0596,7.28113 -9.24158,14.1354 -17.22658,12.73462 -0.75247,-0.17706 -1.48413,-0.43658 -2.18887,-0.75299 z" id="path183" /><path style="fill:#000000" d="m -699.47729,201.79456 c -8.63565,0.53941 -15.12364,-7.88515 -15.94603,-15.84679 -1.16052,-5.11566 2.11902,-11.53036 7.94447,-11.0685 6.30386,0.33507 11.55081,5.11326 14.7287,10.25287 2.70483,4.54034 3.21851,11.6751 -1.80588,14.84136 -1.48165,0.95852 -3.18429,1.54443 -4.92126,1.82106 z" id="path185" /><path style="fill:#000000" d="m -689.08474,229.04756 c -7.06699,-0.85171 -14.43503,-7.35063 -12.77738,-14.99533 1.08611,-6.06269 5.02295,-7.84293 9.76389,-11.17423 2.04065,-1.4339 7.11214,-3.09819 8.49236,-5.17066 2.0161,-3.02729 0.89674,-9.27146 2.97943,-12.22563 4.82045,-6.05732 15.45867,-5.92314 19.70475,0.73541 1.73715,3.26568 0.0908,8.11658 2.27277,11.16376 2.35913,3.29464 8.60854,4.73367 12.19177,6.81058 6.96084,4.74581 8.2149,16.31963 1.26484,21.64683 -9.56876,8.1221 -25.51482,-3.2269 -25.79169,-3.23507 -1.4784,-0.0436 -6.97327,7.16496 -18.10074,6.44434 z" id="path186" /></g><path style="opacity:1;fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 41.533685,-94.292689 c 6.671207,-5.414168 19.294444,-5.315182 24.321527,5.238483 6.791999,-2.962553 13.581096,8.64812 11.22532,15.715448 -0.721076,2.163226 -2.049493,4.098986 -2.993419,5.986837 -3.535128,7.070256 -2.626431,20.191198 0.748355,26.940768" id="path187" /><path style="opacity:1;fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 180.35348,-94.666865 c -6.88025,-4.510762 -22.34768,-1.638661 -23.50665,9.728961 -7.29918,-1.276672 -11.15765,11.607886 -7.20114,17.920006 1.21103,1.932067 2.95861,3.499812 4.32126,5.111703 5.10326,6.036751 7.3155,19.001736 5.62822,26.356937" id="path240" /><g class="cpns-eye l"><g id="g245" transform="translate(0.8598958,-0.35210382)"><circle style="opacity:1;fill:#ffffff;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" id="path241" cx="95.51458" cy="-129.64584" r="9.260417" /><circle style="opacity:1;fill:#000000;stroke:#000000;stroke-width:0.322305;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:1" id="circle242" cx="95.51458" cy="-133.08543" r="2.9846811" /></g></g><g class="cpns-eye r"><g id="g246" transform="translate(31.220833,-0.05834699)"><circle style="opacity:1;fill:#ffffff;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" id="circle245" cx="95.51458" cy="-129.64584" r="9.260417" /><circle style="opacity:1;fill:#000000;stroke:#000000;stroke-width:0.322305;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:1" id="circle246" cx="95.51458" cy="-133.08543" r="2.9846811" /></g></g><path style="fill:#000000;stroke-width:0.30439" d="m 117.12282,-123.57231 c 2.14402,0.31257 4.33699,2.34584 3.7748,4.65957 -0.37631,1.83666 -1.58773,2.34862 -3.05556,3.3265 -0.63179,0.42091 -2.1876,0.88903 -2.62325,1.50925 -0.63638,0.90595 -0.34294,2.81449 -0.99901,3.69769 -1.51262,1.8068 -4.74878,1.68558 -5.99053,-0.37268 -0.50394,-1.00687 0.0337,-2.47053 -0.60723,-3.41426 -0.69298,-1.02038 -2.58378,-1.5055 -3.65846,-2.16457 -2.08229,-1.49673 -2.37644,-5.02808 -0.22131,-6.59662 2.97311,-2.39921 7.73968,1.17474 7.82387,1.17932 0.44956,0.0243 2.17608,-2.12757 5.55668,-1.82421 z" id="path278" /><path style="opacity:1;fill:#000000;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 111.125,-111.00156 v 7.27653" id="path337" /><path style="opacity:1;fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 95.404988,-81.05371 c 18.715372,11.699181 27.088032,5.235198 36.247912,0.314694" id="path338" /><path style="opacity:1;fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 111.125,-103.72503 c 9.11947,9.018511 13.19922,4.035639 17.66257,0.24259" id="path339" /><path style="opacity:1;fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 111.125,-103.72503 c -9.11947,9.018511 -13.199223,4.035639 -17.662573,0.24259" id="path340" /><path style="opacity:1;fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 119.95628,-98.212273 c -9.11946,9.018511 -13.19922,4.035639 -17.66257,0.24259" id="path378" /><g id="g386" transform="translate(-10.676485)"><path style="opacity:1;fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 132.45878,-113.00156 49.3914,-7.48354" id="path384" /><path style="opacity:1;fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 132.48834,-112.90431 49.94951,0.74877" id="path385" /><path style="opacity:1;fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 132.50202,-112.78807 48.90431,10.19232" id="path386" /></g><g id="g389" transform="matrix(-1,0,0,1,232.90958,0)"><path style="opacity:1;fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 132.45878,-113.00156 49.3914,-7.48354" id="path387" /><path style="opacity:1;fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 132.48834,-112.90431 49.94951,0.74877" id="path388" /><path style="opacity:1;fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 132.50202,-112.78807 48.90431,10.19232" id="path389" /></g><path style="opacity:1;fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 51.262295,-172.86993 c 10.745423,3.70744 19.015343,8.52971 23.198995,22.07646 -6.798528,1.18198 -12.283492,6.30465 -16.089625,16.46381" id="path390" /><path style="opacity:1;fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" d="m 175.53209,-172.86993 c -10.74542,3.70744 -19.01534,8.52971 -23.19899,22.07646 6.79853,1.18198 12.28349,6.30465 16.08962,16.46381" id="path391" /></g></g></g>' +
      '</svg>' +
      '<span class="cpns-cat-toys" aria-hidden="true">' +
      '<i><img src="assets/cimit/toy-yarn.svg" alt=""></i>' +
      '<i><img src="assets/cimit/toy-fish.svg" alt=""></i>' +
      '<i><img src="assets/cimit/toy-crown.svg" alt=""></i>' +
      '<i><img src="assets/cimit/toy-trophy.svg" alt=""></i>' +
      '<i><img src="assets/cimit/toy-star.svg" alt=""></i>' +
      '</span>';
    doc.body.appendChild(catEl);
    catHearts = catEl.querySelector(".cpns-cat-hearts");

    catBubble = el("div");
    catBubble.id = "cpns-cat-bubble";
    catBubble.setAttribute("role", "status");
    doc.body.appendChild(catBubble);

    catEl.addEventListener("click", catPet);
    doc.addEventListener("mouseup", function (e) {
      if (catEl.contains(e.target)) return;
      var sel = window.getSelection();
      var busy = sel && !sel.isCollapsed && sel.toString().trim().length > 0;
      catEl.classList.toggle("busy", busy);
    });
    doc.addEventListener("keyup", function (e) {
      if (catEl.contains(e.target)) return;
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT")) return;
      var sel = window.getSelection();
      catEl.classList.toggle("busy", !!(sel && !sel.isCollapsed && sel.toString().trim().length > 0));
    });
    window.addEventListener("resize", catPlace);
    scrollHooks.push(catRefresh);
    doc.addEventListener("visibilitychange", function () {
      if (doc.hidden) catInterruptAct(); else catScheduleIdle();
    });
    window.__cimitAct = catDoAct;
    catPlace();
    catRefresh();
    catScheduleIdle();
  }

  function toggleCat() {
    if (!catEl) return;
    var hidden = catEl.style.display === "none";
    if (hidden) { catEl.style.display = ""; KV.set("cpns-cat", "1"); }
    else { catEl.style.display = "none"; KV.set("cpns-cat", "0"); }
  }

  function applyCatPref() {
    if (catEl) {
      if (KV.get("cpns-cat") === "0") catEl.style.display = "none";
    }
  }

  /* ============================================================
     Init
     ============================================================ */
  function boot() {
    try {
      injectStyles();
      injectThemeStyles();
      readingStats();
      setupSession();
      buildControls();
      buildPagers();
      buildResume();
      buildReveal();
      buildFakta();
      buildGloss();
      buildTocGroups();
      buildHeroStats();
      buildLightbox();
      buildKilas();
      buildQuotes();
      buildRail();
      buildKeyboard();
      if (!KV.get("cpns-note") && NOTES_DB === null) NOTES_DB = loadNotes();
      buildGlassHl();
      restoreHL();
      buildCat();
      applyCatPref();
      buildMilestones();
      buildIkan();
    } catch (e) {
      if (html.classList.contains("cpns-anim")) html.classList.remove("cpns-anim");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    if ("IntersectionObserver" in window && !reducedMotion) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { renderPill(); obs.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -400px 0px" });
      obs.observe(doc.body);
    }
    window.addEventListener("load", renderPill);
    renderPill();
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(renderPill);
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.CPNSReader = { version: "1.0.0", topics: topics.length };
})();