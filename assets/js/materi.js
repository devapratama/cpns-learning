/* ============================================================
   CPNS Learning — materi.js
   Berjalan di halaman topik materi: materi/<kategori>/<topik>/index.html.
   Memuat data.json di folder yang sama lalu merender konten ke dalam
   #materi-content. Anda cukup mengisi JSON + (jika perlu) aset
   lokal, tanpa menyentuh kode.

   data.json topik (flexible — semua field opsional):
   {
     "category": "TWK",            // nama kategori (untuk breadcrumb)
     "categoryFolder": "twk",      // folder kategori
     "title": "Pancasila",
     "subtitle": "Ringkasan singkat topik.",
     "sections": [ ... ],          // isi materi (lihat under)
     "quiz": [                     // opsional, data soal
       {
         "question": "Pertanyaan?",
         "options": ["A", "B", "C", "D"],
         "answer": 2,              // indeks jawaban benar (0-based)
         "explanation": "Pembahasan jawaban."   // opsional
       }
     ],
     "quizIntro": "Pilih jawaban lalu klik Periksa."  // opsional
   }

   Struktur sections:
   { "heading": "...", "paragraphs": ["..."], "list": ["..."], "callout": "..." }
   ============================================================ */

(function () {
  "use strict";

  var base = (window.CPNS && window.CPNS.basePath) || "../../../";
  var content = document.getElementById("materi-content");
  if (!content) return;

  fetch("data.json")
    .then(function (res) {
      if (!res.ok) throw new Error("Gagal memuat data.json");
      return res.json();
    })
    .then(fill)
    .catch(function () {
      content.innerHTML =
        '<p class="loading-hint">Gagal memuat data.json materi.</p>';
    });

  function fill(data) {
    if (data.title) {
      var t = document.getElementById("materi-title");
      if (t) t.textContent = data.title;
      document.title = (data.title || "Materi") + " | CPNS Learning";
    }
    if (data.subtitle) {
      var s = document.getElementById("materi-subtitle");
      if (s) s.textContent = data.subtitle;
    }
    renderBreadcrumb(data);

    var sections = (data && data.sections) || [];
    var quiz = (data && data.quiz) || [];

    if (!sections.length && !quiz.length) {
      content.innerHTML =
        '<p class="loading-hint">Konten belum tersedia. Isi "sections" dan/atau "quiz" pada data.json.</p>';
      return;
    }

    content.innerHTML = "";

    if (sections.length) {
      sections.forEach(function (sec) {
        content.appendChild(buildSection(sec));
      });
    }

    if (quiz.length) {
      content.appendChild(buildQuiz(data, quiz));
    }
  }

  function buildSection(sec) {
    var el = document.createElement("section");
    el.className = "materi-section";

    if (sec.heading) {
      var h = document.createElement("h2");
      h.textContent = sec.heading;
      el.appendChild(h);
    }

    (sec.paragraphs || []).forEach(function (p) {
      var node = document.createElement("p");
      node.textContent = p;
      el.appendChild(node);
    });

    if (sec.list && sec.list.length) {
      var ul = document.createElement("ul");
      sec.list.forEach(function (li) {
        var item = document.createElement("li");
        item.textContent = li;
        ul.appendChild(item);
      });
      el.appendChild(ul);
    }

    if (sec.callout) {
      var call = document.createElement("div");
      call.className = "materi-callout";
      call.textContent = sec.callout;
      el.appendChild(call);
    }

    return el;
  }

  /* ---------- Bank soal (quiz) ---------- */
  function buildQuiz(data, quiz) {
    var wrap = document.createElement("section");
    wrap.className = "quiz-wrap";
    wrap.id = "quiz";

    var h = document.createElement("h2");
    h.className = "quiz-title";
    h.textContent = "Latihan Soal";
    wrap.appendChild(h);

    if (data.quizIntro) {
      var intro = document.createElement("p");
      intro.className = "quiz-intro";
      intro.textContent = data.quizIntro;
      wrap.appendChild(intro);
    }

    var list = document.createElement("ol");
    list.className = "quiz-list";

    quiz.forEach(function (q, i) {
      list.appendChild(buildQuestion(q, i));
    });

    wrap.appendChild(list);

    var actions = document.createElement("div");
    actions.className = "quiz-actions";

    var check = document.createElement("button");
    check.type = "button";
    check.className = "btn btn-primary";
    check.textContent = "Periksa Jawaban";
    check.disabled = true;
    actions.appendChild(check);

    var reset = document.createElement("button");
    reset.type = "button";
    reset.className = "btn btn-ghost";
    reset.textContent = "Ulangi";
    reset.hidden = true;
    actions.appendChild(reset);

    wrap.appendChild(actions);

    var result = document.createElement("div");
    result.className = "quiz-result";
    result.hidden = true;
    wrap.appendChild(result);

    /* Enabling check button once every question has an answer */
    list.addEventListener("click", function () {
      var allAnswered = quiz.every(function (_, idx) {
        return getChoice(idx) !== null;
      });
      check.disabled = !allAnswered;
    });

    check.addEventListener("click", function () {
      var score = 0;
      quiz.forEach(function (q, i) {
        var choice = getChoice(i);
        var correct = choice === q.answer;
        if (correct) score++;
        markQuestion(i, correct, choice, q.answer);
      });
      showResult(score, quiz.length);
      check.hidden = true;
      reset.hidden = false;
    });

    reset.addEventListener("click", function () {
      resetQuiz(quiz);
      check.hidden = false;
      reset.hidden = true;
      result.hidden = true;
    });

    return wrap;
  }

  function buildQuestion(q, idx) {
    var li = document.createElement("li");
    li.className = "quiz-question";

    if (q.question) {
      var p = document.createElement("p");
      p.className = "quiz-question-text";
      p.textContent = q.question;
      li.appendChild(p);
    }

    var fieldset = document.createElement("fieldset");
    fieldset.className = "quiz-options";

    var options = (q.options || []).map(function (o) {
      return String(o).replace(/^[A-Da-d][\.\)]\s*/, "");
    });

    options.forEach(function (opt, oi) {
      var label = document.createElement("label");
      label.className = "quiz-option";
      label.setAttribute("data-choice", String(oi));

      var radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "q" + idx;
      radio.value = String(oi);
      label.appendChild(radio);

      var span = document.createElement("span");
      span.className = "quiz-option-letter";
      span.textContent = String.fromCharCode(65 + oi);
      label.appendChild(span);

      var text = document.createElement("span");
      text.className = "quiz-option-text";
      text.textContent = opt;
      label.appendChild(text);

      fieldset.appendChild(label);
    });

    li.appendChild(fieldset);

    var feedback = document.createElement("div");
    feedback.className = "quiz-feedback";
    feedback.hidden = true;
    li.appendChild(feedback);

    if (q.explanation) {
      var expl = document.createElement("div");
      expl.className = "quiz-explanation";
      expl.hidden = true;
      expl.textContent = q.explanation;
      li.appendChild(expl);
    }

    return li;
  }

  function getChoice(idx) {
    var radios = document.querySelectorAll('.quiz-options input[name="q' + idx + '"]');
    for (var i = 0; i < radios.length; i++) {
      if (radios.checked) return i;
    }
    return null;
  }

  function markQuestion(idx, correct, chosen, answer) {
    var li = document.querySelectorAll(".quiz-question")[idx];
    if (!li) return;

    var options = li.querySelectorAll(".quiz-option");
    options.forEach(function (opt, oi) {
      var isSelected = oi === chosen;
      var isAnswer = oi === answer;
      opt.classList.add("quiz-option-locked");
      if (isAnswer) opt.classList.add("is-correct");
      if (isSelected && !isAnswer) opt.classList.add("is-wrong");
    });

    var feedback = li.querySelector(".quiz-feedback");
    if (feedback) {
      feedback.hidden = false;
      feedback.className = "quiz-feedback " +
        (correct ? "is-right" : "is-wrong");
      feedback.textContent = correct
        ? "Benar! "
        : "Salah. ";
    }

    var expl = li.querySelector(".quiz-explanation");
    if (expl) expl.hidden = false;
  }

  function showResult(score, total) {
    var result = document.querySelector(".quiz-result");
    if (!result) return;
    result.hidden = false;
    var pct = total ? Math.round((score / total) * 100) : 0;
    var grade = pct >= 80 ? "Luar biasa! Terus pertahankan." : pct >= 60 ? "Bagus, terus berlatih!" : "Jangan menyerah, pelajari lagi materinya.";
    result.innerHTML =
      '<p class="quiz-score">Skor Anda: <strong>' + score + "</strong> / " + total +
      " (" + pct + "%)</p>" +
      '<p class="quiz-grade">' + grade + "</p>";
  }

  function resetQuiz(quiz) {
    quiz.forEach(function (_, idx) {
      var radios = document.querySelectorAll('.quiz-options input[name="q' + idx + '"]');
      radios.forEach(function (r) {
        r.checked = false;
      });
      var li = document.querySelectorAll(".quiz-question")[idx];
      if (!li) return;
      li.querySelectorAll(".quiz-option").forEach(function (opt) {
        opt.classList.remove("quiz-option-locked", "is-correct", "is-wrong");
      });
      var feedback = li.querySelector(".quiz-feedback");
      if (feedback) {
        feedback.hidden = true;
        feedback.className = "quiz-feedback";
      }
      var expl = li.querySelector(".quiz-explanation");
      if (expl) expl.hidden = true;
    });
  }

  function renderBreadcrumb(data) {
    var catFolder = data.categoryFolder || "";
    var catName = data.category
      ? escapeHtml(data.category)
      : "Kategori";

    var crumb = document.getElementById("breadcrumb");
    if (crumb) {
      crumb.innerHTML = [
        '<a href="' + base + 'index.html">Beranda</a>',
        '<span class="crumb-sep" aria-hidden="true">/</span>',
        '<a href="' + base + "materi/" + encodeURIComponent(catFolder) +
          '/index.html">' + catName + "</a>",
        '<span class="crumb-sep" aria-hidden="true">/</span>',
        '<span class="crumb-current">' + escapeHtml(data.title || "") + "</span>",
      ].join("");
    }

    var back = document.getElementById("materi-back");
    if (back && catFolder) {
      back.href = base + "materi/" + encodeURIComponent(catFolder) + "/index.html";
    }
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
