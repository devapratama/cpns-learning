/* ==========================================================================
   CPNS Learning — Modul TWK: shell seragam ala "Materi TKP"
   File ini (a) menyuntikkan chip-bar M01–M10 + "Semua Modul" di bawah header,
   (b) menyuntikkan daftar isi modul (TOC) dari judul section, dan
   (c) menambahkan label posisi "Modul NN · NN/10" ke nav bawah (.cpns-modnav).
   Dimuat via <script src="../assets/modul-twk.js" defer></script> di <head>.
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
    var total = String(MODULS.length).padStart(2, '0');
    span.textContent = 'Modul ' + cur + ' · Posisi ' + n + '/' + total + ' dari jalur belajar TWK';
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
