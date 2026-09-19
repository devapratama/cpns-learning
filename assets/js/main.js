/* ============================================================
   CPNS Learning — main.js
   Berjalan di SEMUA halaman (home, kategori, topik materi).
   Menggunakan `window.CPNS.basePath` yang dideklarasikan setiap
   halaman untuk menghitung path relatif ke root project dengan
   benar, apa pun kedalaman foldernya.

   Fitur:
   - Inisialisasi header/navbar (brand, navigasi)
   - Footer tahun otomatis
   ============================================================ */

(function () {
  "use strict";

  var base = (window.CPNS && window.CPNS.basePath) || "./";

  /* Helper: amend path dari asset relatif terhadap halaman aktual.
     `path` ditulis relatif terhadap root project ("assets/..."). */
  function url(path) {
    return base + path;
  }

  /* Build header + footer secara konsisten di semua halaman.
     Menghindari duplikasi markup di tiap file HTML. */
  function mountCommon() {
    var head = document.querySelector(".site-header");
    var footer = document.querySelector(".site-footer");
    if (head) head.innerHTML = headerHTML();
    if (footer) footer.innerHTML = footerHTML();
  }

  function headerHTML() {
    return [
      '<div class="container header-inner">',
      '  <a class="brand" href="' + url("index.html") + '" aria-label="CPNS Learning — Beranda">',
      '    <span class="brand-mark" aria-hidden="true"></span>',
      '    <span class="brand-text">CPNS Learning</span>',
      "  </a>",
      '  <button class="nav-toggle" aria-label="Buka menu navigasi"',
      '    aria-controls="primary-nav" aria-expanded="false">',
      '    <span class="nav-toggle-bar"></span>',
      '    <span class="nav-toggle-bar"></span>',
      '    <span class="nav-toggle-bar"></span>',
      "  </button>",
      '  <nav id="primary-nav" class="primary-nav" aria-label="Navigasi utama">',
      "    <ul>",
      '      <li><a href="' + url("index.html") + '">Beranda</a></li>',
      '      <li><a href="' + url("index.html") + '#kategori">Kategori</a></li>',
      "    </ul>",
      "  </nav>",
      "</div>",
    ].join("\n");
  }

  function footerHTML() {
    return [
      '<div class="container footer-inner">',
      '  <p class="footer-brand">CPNS Learning</p>',
      '  <p class="footer-note">Dibuat untuk membantu Anda belajar dengan tenang.</p>',
      '  <p class="footer-copy">© <span id="year"></span> CPNS Learning.</p>',
      "</div>",
    ].join("\n");
  }

  /* ---------- Mobile navigation ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Tutup menu navigasi" : "Buka menu navigasi");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Footer tahun ---------- */
  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    mountCommon();
    initNav();
    setYear();
  });
})();