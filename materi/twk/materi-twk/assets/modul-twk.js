/* ==========================================================================
   CPNS Learning — Modul TWK: shell seragam ala "Materi TKP"
   File ini (a) menyuntikkan chip-bar M01–M18 + "Semua Modul" di bawah header,
   (b) menyuntikkan daftar isi modul (TOC) dari judul section, dan
   (c) menambahkan label posisi "Modul NN · NN/18" ke nav bawah (.cpns-modnav).
   Dimuat via <script src="../assets/modul-twk.js" defer></script> di <head>.
   ========================================================================== */
(function () {
  'use strict';

  var MODULS = [
    { nn: '01', file: '01-peta-besar-twk.html', title: 'Peta Besar TWK' },
    { nn: '02', file: '02-fondasi-bangsa-dan-negara.html', title: 'Fondasi Bangsa dan Negara' },
    { nn: '03', file: '03-sejarah-kebangsaan-dan-pembentukan-indonesia.html', title: 'Sejarah Kebangsaan dan Pembentukan Indonesia' },
    { nn: '04', file: '04-pancasila-sebagai-sistem-nilai.html', title: 'Pancasila sebagai Sistem Nilai' },
    { nn: '05', file: '05-uud-nri-1945-dan-konstitusionalisme.html', title: 'UUD NRI 1945 dan Konstitusionalisme' },
    { nn: '06', file: '06-lembaga-negara-dan-sistem-ketatanegaraan.html', title: 'Lembaga Negara dan Sistem Ketatanegaraan' },
    { nn: '07', file: '07-demokrasi-hak-kewajiban-dan-kehidupan-konstitusional.html', title: 'Demokrasi, Hak dan Kewajiban Warga Negara' },
    { nn: '08', file: '08-nkri-bhinneka-integrasi-dan-wawasan-nusantara.html', title: 'NKRI, Bhinneka, Integrasi dan Wawasan Nusantara' },
    { nn: '09', file: '09-nasionalisme-dan-kepentingan-nasional.html', title: 'Nasionalisme dan Kepentingan Nasional' },
    { nn: '10', file: '10-bela-negara-dan-ketahanan-nasional.html', title: 'Bela Negara dan Ketahanan Nasional' },
    { nn: '11', file: '11-integritas-dan-karakter-kebangsaan.html', title: 'Integritas dan Karakter Kebangsaan' },
    { nn: '12', file: '12-hubungan-indonesia-dengan-dunia.html', title: 'Hubungan Indonesia dengan Dunia' },
    { nn: '13', file: '13-tantangan-kebangsaan-kontemporer.html', title: 'Tantangan Kebangsaan Kontemporer' },
    { nn: '14', file: '14-semantik-bahasa-dan-cara-membaca-soal-twk.html', title: 'Semantik, Bahasa dan Cara Membaca Soal' },
    { nn: '15', file: '15-aktor-scope-dan-hubungan-logis-dalam-soal-twk.html', title: 'Aktor, Scope dan Hubungan Logis' },
    { nn: '16', file: '16-berbagai-bentuk-pembentukan-soal-twk.html', title: 'Berbagai Bentuk Pembentukan Soal' },
    { nn: '17', file: '17-strategi-diskriminasi-jawaban-twk.html', title: 'Strategi Diskriminasi Jawaban' },
    { nn: '18', file: '18-integrasi-semua-konsep-dan-reasoning-twk.html', title: 'Integrasi Semua Konsep dan Reasoning' }
  ];

  function currentModNum() {
    var done = document.getElementById('cpns-done');
    if (done) {
      var m = (done.getAttribute('data-key') || '').match(/cpns_twk_m(\d{2})/);
      if (m) return m[1];
    }
    var path = (document.location.pathname || '').split('/').pop() || '';
    var f = path.match(/^(\d{2})-/);
    if (f) return f[1];
    for (var i = 0; i < MODULS.length; i++) {
      if (MODULS[i].file === path) return MODULS[i].nn;
    }
    return null;
  }

  function findEntryPoint() {
    var pick = document.querySelector('header.hero, header.top, main section.hero');
    return pick || document.querySelector('main') || document.body;
  }

  function buildChips(cur) {
    var nav = document.createElement('nav');
    nav.className = 'mod-nav';
    var inner = document.createElement('div');
    inner.className = 'mod-nav-inner';

    MODULS.forEach(function (mod) {
      var a = document.createElement('a');
      a.className = 'mod-chip' + (mod.nn === cur ? ' active' : '');
      a.href = '../materi/' + mod.file;
      a.setAttribute('aria-current', mod.nn === cur ? 'page' : 'false');
      a.title = mod.title;
      a.textContent = 'M' + mod.nn;
      inner.appendChild(a);
    });

    var all = document.createElement('a');
    all.className = 'mod-chip all';
    all.href = '../index.html';
    all.textContent = 'Semua Modul';
    inner.appendChild(all);

    nav.appendChild(inner);
    return nav;
  }

  function buildToc() {
    var main = document.getElementById('main') || document.querySelector('main');
    if (!main) return null;
    var sections = main.querySelectorAll('section[id]');
    if (!sections.length) return null;

    var items = [];
    sections.forEach(function (sec) {
      var h = sec.querySelector('h2');
      if (!h) return;
      var text = h.textContent.replace(/\s+/g, ' ').trim().replace(/^(\d+[\.\-\)]?\s*)/, '');
      if (!text) return;
      items.push({ id: sec.id, label: text });
    });
    if (!items.length) return null;

    var det = document.createElement('details');
    det.className = 'mod-toc';
    det.setAttribute('open', '');

    var sum = document.createElement('summary');
    sum.textContent = 'Daftar Isi Modul · ' + sections.length + ' bagian';
    det.appendChild(sum);

    var list = document.createElement('nav');
    list.className = 'mod-toc-list';
    items.forEach(function (it) {
      var a = document.createElement('a');
      a.className = 'mod-toc-link';
      a.href = '#' + it.id;
      a.textContent = it.label;
      list.appendChild(a);
    });
    det.appendChild(list);

    return det;
  }

  function addPositionLabel(cur) {
    var modnav = document.querySelector('.cpns-modnav');
    if (!modnav) return;
    var idx = -1;
    for (var i = 0; i < MODULS.length; i++) {
      if (MODULS[i].nn === cur) { idx = i; break; }
    }
    if (idx < 0) return;
    var span = document.createElement('span');
    span.className = 'materi-pos';
    var n = String(idx + 1).padStart(2, '0');
    span.textContent = 'Modul ' + cur + ' · Posisi ' + n + '/18 dari jalur belajar TWK';
    modnav.insertBefore(span, modnav.firstChild);
  }

  function init() {
    var cur = currentModNum();
    var entry = findEntryPoint();
    if (entry) {
      var nav = buildChips(cur);
      entry.after(nav);
      var toc = buildToc();
      if (toc) nav.after(toc);
    }
    addPositionLabel(cur);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();