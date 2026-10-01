/* ==========================================================================
   CPNS Learning — Modul TWK: shell navigasi bersama
   Menyuntikkan ke setiap TWK_M*.html:
     (a) breadcrumb  : Beranda / TWK / Daftar Modul / Modul NN
     (b) bar lompat  : chip M01–M10 untuk pindah modul
     (c) daftar isi  : <details> berisi semua <h2> modul (dibangun sendiri)
     (d) pager bawah: modul sebelumnya / berikutnya / kembali ke daftar isi

   Modul 1 tidak punya mod-nav maupun daftar isi sama sekali, dan sebagian
   modul punya daftar isi dengan format berbeda. Semua dinormalkan di sini.

   Dimuat via <script src="../assets/modul-twk-shell.js" defer></script>.
   ========================================================================== */
(function () {
  'use strict';

  var MODULS = [
    { nn: '01', file: 'TWK_M01_Pancasila.html', title: 'Pancasila' },
    { nn: '02', file: 'TWK_M02_UUD_NRI_1945.html', title: 'UUD NRI Tahun 1945' },
    { nn: '03', file: 'TWK_M03_Lembaga_Negara_Demokrasi_Pemilu_Pembagian_Kewenangan.html', title: 'Lembaga Negara, Demokrasi, Pemilu, dan Pembagian Kewenangan' },
    { nn: '04', file: 'TWK_M04_NKRI_Wawasan_Nusantara_Bhinneka_Integrasi.html', title: 'NKRI, Wawasan Nusantara, Bhinneka Tunggal Ika, dan Integrasi' },
    { nn: '05', file: 'TWK_M05_Nasionalisme_Sejarah_Pergerakan_Tokoh_Persatuan_Patriotisme.html', title: 'Nasionalisme: Sejarah Pergerakan, Tokoh, Persatuan, dan Patriotisme' },
    { nn: '06', file: 'TWK_M06_Nasionalisme_Modern_Identitas_Budaya_Globalisasi_Kepentingan_Nasional.html', title: 'Nasionalisme Modern: Identitas Nasional, Budaya, dan Globalisasi' },
    { nn: '07', file: 'TWK_M07_Generasi_Muda_Digital_Partisipasi_Politik_Luar_Negeri.html', title: 'Generasi Muda, Dunia Digital, Politik Luar Negeri, dan Kerja Sama Internasional' },
    { nn: '08', file: 'TWK_M08_Bela_Negara.html', title: 'Bela Negara' },
    { nn: '09', file: 'TWK_M09_Integritas.html', title: 'Integritas, Etika, Akuntabilitas, dan Antikorupsi' },
    { nn: '10', file: 'TWK_M10_Pending.html', title: 'Modul 10 (Menunggu)' }
  ];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function currentIndex() {
    var path = (document.location.pathname || '').split('/').pop() || '';
    for (var i = 0; i < MODULS.length; i++) {
      if (MODULS[i].file === path) return i;
    }
    return -1;
  }

  /* ---------- (a) breadcrumb ---------- */
  function buildCrumb(cur) {
    var nav = el('nav', 'cpns-crumb');
    nav.setAttribute('aria-label', 'Remah roti');

    var home = el('a', null, '← Beranda');
    home.href = '../../../index.html';
    nav.appendChild(home);
    nav.appendChild(el('span', 'sep', '/'));

    var twk = el('a', null, 'TWK');
    twk.href = '../index.html';
    nav.appendChild(twk);
    nav.appendChild(el('span', 'sep', '/'));

    var list = el('a', null, 'Daftar Modul');
    list.href = '../index.html';
    nav.appendChild(list);

    if (cur >= 0) {
      nav.appendChild(el('span', 'sep', '/'));
      nav.appendChild(el('span', 'here', 'Modul ' + MODULS[cur].nn));
    }
    return nav;
  }

  /* ---------- (b) bar lompat modul ---------- */
  function buildJump(cur) {
    var nav = el('nav', 'cpns-jump');
    nav.setAttribute('aria-label', 'Lompat ke modul lain');
    nav.appendChild(el('span', 'cpns-jump-label', 'Modul'));

    MODULS.forEach(function (m, i) {
      var a = el('a', 'jchip', 'M' + m.nn);
      a.href = m.file;
      a.title = m.title;
      if (/Menunggu/i.test(m.title)) a.className += ' pending';
      if (i === cur) {
        a.setAttribute('aria-current', 'page');
        a.className += ' active';
      }
      nav.appendChild(a);
    });
    return nav;
  }

  /* ---------- (c) daftar isi ---------- */
  /* Dibangun dari <h2> di dalam .card, jadi ikut mengikuti isi modul. */
  function buildToc() {
    var cards = document.querySelectorAll('section.card[id]');
    if (!cards.length) return null;

    var items = [];
    cards.forEach(function (card) {
      var h = card.querySelector('h1');
      if (h) {
        items.push({ id: card.id, label: h.textContent.replace(/\s+/g, ' ').trim(), top: true });
      }
      var subs = card.querySelectorAll('h2[id]');
      if (subs.length) {
        subs.forEach(function (s) {
          items.push({ id: s.id, label: s.textContent.replace(/\s+/g, ' ').trim(), top: false });
        });
      } else {
        card.querySelectorAll('h2').forEach(function (s) {
          items.push({ id: card.id + '-h2-' + items.length, label: s.textContent.replace(/\s+/g, ' ').trim(), top: false, noAnchor: true });
        });
      }
    });

    var det = el('details', 'mod-toc');
    det.id = 'cpns-toc';
    det.setAttribute('open', '');
    var sum = el('summary', null, 'Daftar Isi · ' + cards.length + ' bagian');
    det.appendChild(sum);

    var list = el('nav', 'mod-toc-list');
    list.setAttribute('aria-label', 'Daftar isi modul');
    items.forEach(function (it) {
      var a = el('a', 'mod-toc-link' + (it.top ? '' : ' mod-toc-sub'), it.label);
      if (!it.noAnchor) a.href = '#' + it.id;
      else {
        a.href = '#';
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var target = document.getElementById(it.id.split('-h2-')[0]);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
      list.appendChild(a);
    });
    det.appendChild(list);
    return det;
  }

  /* ---------- (d) pager bawah ---------- */
  function buildPager(cur) {
    var nav = el('nav', 'cpns-pager');
    nav.setAttribute('aria-label', 'Navigasi modul');

    if (cur > 0) {
      var prev = el('a');
      prev.href = MODULS[cur - 1].file;
      prev.appendChild(el('span', 'dir', '← Modul sebelumnya'));
      prev.appendChild(el('span', 'nm', 'M' + MODULS[cur - 1].nn + ' · ' + MODULS[cur - 1].title));
      nav.appendChild(prev);
    }

    if (cur >= 0 && cur < MODULS.length - 1) {
      var next = el('a', 'next');
      next.href = MODULS[cur + 1].file;
      next.appendChild(el('span', 'dir', 'Modul berikutnya →'));
      next.appendChild(el('span', 'nm', 'M' + MODULS[cur + 1].nn + ' · ' + MODULS[cur + 1].title));
      nav.appendChild(next);
    }

    var mid = el('div', 'mid');
    var backTop = el('button', null, '↑ Kembali ke atas');
    backTop.type = 'button';
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    mid.appendChild(backTop);

    var toc = el('button', null, 'Daftar isi');
    toc.type = 'button';
    toc.addEventListener('click', function () {
      var d = document.getElementById('cpns-toc');
      if (d) {
        d.open = !d.open;
        d.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    mid.appendChild(toc);

    var home = el('a', null, '← Daftar Modul');
    home.href = '../index.html';
    mid.appendChild(home);

    if (cur >= 0) {
      mid.appendChild(el('span', 'pos', 'Modul ' + MODULS[cur].nn + ' dari ' + MODULS.length));
    }

    nav.appendChild(mid);
    return nav;
  }

  function init() {
    var wrap = document.querySelector('.wrap');
    if (!wrap) return;
    var cur = currentIndex();

    var header = document.querySelector('header.top');

    if (header) header.after(buildCrumb(cur));
    if (header) header.after(buildJump(cur));

    // Buang mod-nav & mod-toc bawaan supaya tidak dobel dengan yang dibuild di sini.
    document.querySelectorAll('nav.mod-nav, details.mod-toc').forEach(function (n) {
      if (n.id !== 'cpns-toc') n.remove();
    });

    var anchor = document.querySelector('nav.cpns-jump');
    if (anchor) {
      var toc = buildToc();
      if (toc) anchor.after(toc);
    }

    // Pager diletakkan sebelum blok <script> terakhir, jadi setelah semua isi.
    var scripts = document.getElementsByTagName('script');
    var last = scripts[scripts.length - 1];
    if (last && last.parentNode) last.parentNode.insertBefore(buildPager(cur), last);
    else wrap.appendChild(buildPager(cur));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
