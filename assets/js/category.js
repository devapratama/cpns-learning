/* ============================================================
   CPNS Learning — category.js
   Berjalan di halaman kategori: materi/<kategori>/index.html.
   Memuat data.json pada folder yang sama (daftar topik-folder)
   lalu merender kartu topik secara dinamis.

   data.json kategori:
   {
     "name": "TWK",
     "fullName": "Tes Wawasan Kebangsaan",
     "description": "...",
     "topics": [
       { "folder": "sejarah-indonesia", "title": "...", "subtitle": "..." },
       ...
     ]
   }

   Anda bebas menambah/menghapus folder topik + entri JSON
   tanpa menyentuh kode.
   ============================================================ */

(function () {
  "use strict";

  var base = (window.CPNS && window.CPNS.basePath) || "../../";
  var grid = document.getElementById("topic-grid");
  var heroTitle = document.getElementById("category-title");
  var heroLead = document.getElementById("category-desc");
  if (!grid) return;

  fetch("data.json")
    .then(function (res) {
      if (!res.ok) throw new Error("Gagal memuat data.json");
      return res.json();
    })
    .then(fill)
    .catch(function () {
      grid.innerHTML = '<p class="loading-hint">Gagal memuat data.json kategori.</p>';
    });

  function fill(data) {
    if (heroTitle) heroTitle.textContent =
      (data.name || "Kategori") + (data.fullName ? " — " + data.fullName : "");
    if (heroLead) heroLead.textContent =
      data.description || "Pilih topik di bawah untuk mulai belajar.";

    var categories = (data && data.topics) || [];
    if (!categories.length) {
      grid.innerHTML = '<p class="loading-hint">Materi untuk kategori ini akan segera hadir.</p>';
      return;
    }

    var categoryFolder = (data.folder || data.name || "").toLowerCase();

    grid.innerHTML = "";
    categories.forEach(function (t) {
      var a = document.createElement("a");
      a.className = "materi-card";
      a.href = base + "materi/" + encodeURIComponent(categoryFolder) + "/" +
        encodeURIComponent(t.folder || "") + "/index.html";
      a.setAttribute("aria-label", t.title);
      a.innerHTML = [
        '<h3 class="materi-card-title">' + escapeHtml(t.title) + "</h3>",
        t.subtitle ? '<p class="materi-card-desc">' + escapeHtml(t.subtitle) + "</p>" : "",
      ].join("");
      grid.appendChild(a);
    });
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
