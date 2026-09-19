/* ============================================================
   CPNS Learning — home.js
   Berjalan HANYA di homepage (index.html).
   Memuat data/categories.json lalu merender kartu kategori
   secara dinamis. Tambah kategori cukup dengan mengubah JSON,
   tanpa menyentuh kode atau HTML.
   ============================================================ */

(function () {
  "use strict";

  var base = (window.CPNS && window.CPNS.basePath) || "./";
  var grid = document.getElementById("category-grid");
  if (!grid) return;

  fetch(base + "data/categories.json")
    .then(function (res) {
      if (!res.ok) throw new Error("Gagal memuat kategori");
      return res.json();
    })
    .then(function (data) {
      render(data.categories || []);
    })
    .catch(function () {
      grid.innerHTML =
        '<p class="loading-hint">Gagal memuat kategori. Pastikan file ' +
        "data/categories.json tersedia.</p>";
    });

  function render(categories) {
    if (!categories.length) {
      grid.innerHTML = '<p class="loading-hint">Belum ada kategori.</p>';
      return;
    }

    grid.innerHTML = "";
    categories.forEach(function (cat) {
      var card = document.createElement("a");
      card.className = "card";
      card.href = base + "materi/" + encodeURIComponent(cat.folder || "") + "/index.html";
      card.setAttribute(
        "aria-label",
        "Buka materi " + (cat.fullName || cat.name)
      );
      card.innerHTML = [
        '<span class="card-icon">' + escapeHtml(cat.icon || "•") + "</span>",
        "<h3 class=\"card-title\">" + escapeHtml(cat.name) +
          '<span class="card-title-aux">' + escapeHtml(cat.fullName || "") +
          "</span></h3>",
        '<p class="card-desc">' + escapeHtml(cat.short || "") + "</p>",
        '<span class="card-link">Mulai belajar →</span>',
      ].join("");
      grid.appendChild(card);
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
