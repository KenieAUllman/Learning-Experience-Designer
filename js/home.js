/* =====================================================================
   HOME PAGE SCRIPT: the course path, The Request scenario, the learning
   record, and the certificate.

   To change wording:
   - Section names on the path: STOPS
   - The three time options: PATHS
   - The Request questions and Dana's answers: QUESTIONS
     (good: true means a strong question; good: false means "too early")
   - "My read", "What I'd build", and "How I'd say it to Dana":
     search this file for renderMeeting
   ===================================================================== */
(function () {
  "use strict";
  var KEY = "mckena-course-v1";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var STOPS = {
    request: "The Request",
    work: "Selected work",
    approach: "How I work",
    about: "About McKena"
  };
  var PATHS = {
    "2": { name: "The highlights", minutes: 2, stops: ["request", "work"] },
    "10": { name: "The full tour", minutes: 10, stops: ["request", "work", "approach", "about"] },
    "30": { name: "The deep dive", minutes: 30, stops: ["request", "work", "approach", "about"] }
  };
  var QUESTIONS = [
    { id: "doing", good: true, tag: "Finds the behavior", short: "What are they doing now?",
      text: "What are new managers doing now that you’d like them to do differently?",
      answer: "Honestly? They avoid it. They save everything for the annual review, and then it lands as a surprise." },
    { id: "success", good: true, tag: "Defines success", short: "What would we see if it worked?",
      text: "If this worked, what would we see in the branches 90 days from now?",
      answer: "Fewer surprises at review time. Tellers who know where they stand. Maybe less first-year turnover." },
    { id: "after", good: true, tag: "Checks the environment", short: "What happens after feedback today?",
      text: "When a manager does give feedback today, what happens next?",
      answer: "Not much. Their own area managers don’t really coach them on it, so nobody follows up." },
    { id: "bright", good: true, tag: "Finds a bright spot", short: "Who does this well?",
      text: "Who already does this well, and what do they do differently?",
      answer: "Marisol at our Eastside branch. She does a quick check-in with each teller every week. Her team loves her." },
    { id: "tool", good: false, tag: "Too early", short: "Storyline or Rise?",
      text: "Should I build it in Storyline or Rise?",
      answer: "Whatever you think is best!" },
    { id: "modules", good: false, tag: "Too early", short: "How many modules?",
      text: "How many modules should it have?",
      answer: "Um, however many it takes?" }
  ];

  function fresh() {
    return { path: null, done: {}, asked: [], met: false, claimed: false, name: "", start: Date.now(), log: [] };
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && typeof s === "object") {
          var f = fresh();
          for (var k in f) if (Object.prototype.hasOwnProperty.call(s, k)) f[k] = s[k];
          return f;
        }
      }
    } catch (e) {}
    return fresh();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }

  var state = load();

  /* ---------- learning record ---------- */
  var toastEl = $("toast"), toastTimer = null, hideTimer = null;
  function toast(html) {
    toastEl.innerHTML = '<span class="label">Added to your learning record</span><span class="stmt">' + html + "</span>";
    toastEl.hidden = false;
    toastEl.classList.remove("is-hiding");
    clearTimeout(toastTimer); clearTimeout(hideTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.add("is-hiding");
      hideTimer = setTimeout(function () { toastEl.hidden = true; }, 300);
    }, 2800);
  }
  function addLog(html, quiet) {
    state.log.unshift({ t: Date.now(), h: html });
    state.log = state.log.slice(0, 60);
    save();
    renderRecord();
    if (!quiet) toast(html);
  }
  function fmtTime(t) {
    try { return new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); } catch (e) { return ""; }
  }
  function renderRecord() {
    var list = $("stmts");
    if (!state.log.length) {
      list.innerHTML = '<li class="record-empty" style="display:block">Nothing yet. Choose a path to write your first statement.</li>';
    } else {
      list.innerHTML = state.log.map(function (e) {
        return '<li><time>' + esc(fmtTime(e.t)) + '</time><span class="stmt">' + e.h + "</span></li>";
      }).join("");
    }
  }

  /* ---------- path + progress ---------- */
  function pathKey() { return state.path || "10"; }
  function progress() {
    var p = PATHS[pathKey()];
    var done = p.stops.filter(function (s) { return state.done[s]; }).length;
    return { done: done, total: p.stops.length, pct: done / p.stops.length };
  }
  function renderPath() {
    var key = pathKey(), p = PATHS[key], pr = progress(), hasPath = !!state.path;
    var pathPanel = $("path-panel");
    if (pathPanel) pathPanel.hidden = !hasPath;
    document.querySelectorAll(".choice").forEach(function (b) {
      b.setAttribute("aria-pressed", String(state.path === b.dataset.path));
    });
    $("path-title").textContent = p.name + " · about " + p.minutes + " minutes";
    $("path-count").textContent = pr.done + " of " + pr.total + " complete";
    var nextFound = false;
    var items = p.stops.map(function (id, i) {
      var isDone = !!state.done[id];
      var isNext = !isDone && !nextFound;
      if (isNext) nextFound = true;
      var status = isDone ? "done" : (isNext ? "up next" : "");
      return '<li class="' + (isDone ? "is-done" : "") + (isNext ? " is-next" : "") + '"><a href="#' + id + '"><span class="dot" aria-hidden="true"></span><span class="step-n">' + (i + 1) + "</span><span>" + STOPS[id] + "</span>" + (status ? '<span class="status">' + status + "</span>" : "") + "</a></li>";
    });
    var allDone = pr.done === pr.total;
    items.push('<li class="' + (allDone ? "is-next" : "") + '"><a href="#finish"><span class="dot" aria-hidden="true"></span><span class="step-n">' + (p.stops.length + 1) + "</span><span>Certificate</span>" + (allDone ? '<span class="status">ready</span>' : "") + "</a></li>");
    $("path-list").innerHTML = items.join("");

    var label = pr.done + " of " + pr.total + " stops";
    $("record-btn-status").textContent = hasPath ? label : "Choose a path";
    $("rec-count").textContent = label;
    $("rec-path").textContent = (state.path ? "" : "Suggested: ") + p.name;
    $("rec-bar").style.width = (pr.pct * 100) + "%";
    $("top-progress").style.width = (pr.pct * 100) + "%";
    $("ring-fill").setAttribute("stroke-dashoffset", String(94.25 * (1 - pr.pct)));
    renderCert();
  }
  document.querySelectorAll(".choice").forEach(function (b) {
    b.addEventListener("click", function () {
      var key = b.dataset.path;
      if (state.path === key) return;
      state.path = key;
      save();
      addLog("<b>You</b> <i>chose</i> " + PATHS[key].name.toLowerCase() + " (" + PATHS[key].minutes + " min)");
      renderPath();
    });
  });
  function completeStop(id, verb) {
    if (state.done[id]) return;
    state.done[id] = true;
    save();
    addLog("<b>You</b> <i>" + (verb || "experienced") + "</i> " + STOPS[id]);
    renderPath();
  }

  // A stop counts once it has filled at least half the screen for a couple of seconds.
  var dwell = {};
  if ("IntersectionObserver" in window) {
    var th = []; for (var i = 0; i <= 20; i++) th.push(i / 20);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var id = en.target.dataset.stop;
        var need = Math.min(en.boundingClientRect.height, window.innerHeight) * 0.5;
        if (en.isIntersecting && en.intersectionRect.height >= need) {
          if (!dwell[id]) dwell[id] = setTimeout(function () { completeStop(id); }, 2200);
        } else {
          clearTimeout(dwell[id]); dwell[id] = null;
        }
      });
    }, { threshold: th });
    ["work", "approach", "about"].forEach(function (id) {
      var el = $(id);
      if (el) io.observe(el);
    });
  }

  /* ---------- the request ---------- */
  var selected = state.met ? state.asked.slice() : [];
  var qsEl = $("qs"), countEl = $("ask-count"), meetBtn = $("meet-btn"), meetingEl = $("meeting");
  function qById(id) { for (var i = 0; i < QUESTIONS.length; i++) if (QUESTIONS[i].id === id) return QUESTIONS[i]; return null; }
  function renderQuestions() {
    qsEl.innerHTML = QUESTIONS.map(function (q) {
      var on = selected.indexOf(q.id) > -1;
      return '<li><button class="q" type="button" data-q="' + q.id + '" aria-pressed="' + on + '"' + (state.met ? " disabled" : "") + '><span class="q-box" aria-hidden="true"></span><span>' + esc(q.text) + "</span></button></li>";
    }).join("");
    countEl.textContent = state.met ? "Meeting held. Your notes are below." : selected.length + " of 3 chosen";
    countEl.classList.remove("flash");
    meetBtn.disabled = state.met || selected.length !== 3;
  }
  qsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".q");
    if (!b || state.met) return;
    var id = b.dataset.q, at = selected.indexOf(id);
    if (at > -1) { selected.splice(at, 1); }
    else if (selected.length >= 3) {
      countEl.textContent = "You only get three. Unselect one to swap it.";
      countEl.classList.add("flash");
      return;
    } else { selected.push(id); }
    renderQuestions();
    var again = qsEl.querySelector('[data-q="' + id + '"]');
    if (again) again.focus();
  });
  meetBtn.addEventListener("click", function () {
    if (selected.length !== 3) return;
    state.asked = selected.slice();
    state.met = true;
    save();
    state.asked.forEach(function (id) { addLog("<b>You</b> <i>asked</i> Dana: “" + esc(qById(id).short) + "”", true); });
    if (state.done.request) addLog("<b>You</b> <i>replayed</i> The Request");
    else completeStop("request", "completed");
    renderQuestions();
    renderMeeting();
    meetingEl.hidden = false;
    meetingEl.focus({ preventScroll: true });
    meetingEl.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  });
  function goodCount() { return state.asked.filter(function (id) { var q = qById(id); return q && q.good; }).length; }
  function renderMeeting() {
    if (!state.met) { meetingEl.hidden = true; meetingEl.innerHTML = ""; return; }
    var asked = state.asked.map(qById).filter(Boolean);
    var good = goodCount();
    var missed = QUESTIONS.filter(function (q) { return q.good && state.asked.indexOf(q.id) === -1; });
    var verdict = good === 3
      ? "Those three questions get past the requested format and into the actual performance problem."
      : good === 2
        ? "Two questions got to the problem. One jumped to format before the need was clear."
        : "Most of the conversation stayed at the solution level. I’d want to understand the behavior and context before choosing a format.";
    var html = '<div><h3>What Dana <em>said</em></h3><ul class="exchanges">' +
      asked.map(function (q) {
        return '<li class="exchange"><p class="exchange-q">“' + esc(q.text) + '”</p><p class="exchange-a"><b>Dana</b>' + esc(q.answer) + '</p><span class="chip' + (q.good ? "" : " chip--early") + '">' + esc(q.tag) + "</span></li>";
      }).join("") + "</ul>" +
      '<p class="verdict">' + verdict + "</p>" +
      (missed.length ? '<p class="label" style="margin-top:1.4rem">What the other questions would have told you</p><ul class="missed">' +
        missed.map(function (q) { return "<li><i>" + esc(q.short) + "</i> " + esc(q.answer) + "</li>"; }).join("") + "</ul>" : "") +
      "</div>" +
      '<div class="two-col"><div><h3>My <em>read</em></h3><div class="prose"><p>New managers don’t need convincing that feedback matters. They’re avoiding the conversation because it feels risky, they haven’t practiced it, and their own managers aren’t reinforcing the behavior.</p><p>A 30-minute course could introduce a model, but by itself it probably wouldn’t change what happens in the branches.</p></div></div>' +
      '<div><h3>What I’d <em>build</em></h3><ul class="recs">' +
      '<li><span class="label">Microlearning · 8 min</span><span><b>The First Hard Conversation.</b> A branching Storyline scenario: a new manager talks with a teller whose drawer keeps coming up short, and every choice has a consequence.</span></li>' +
      '<li><span class="label">Virtual practice · 60 min</span><span>Peers role-play the same conversation using a simple feedback model. Facilitator guide included.</span></li>' +
      '<li><span class="label">Performance support</span><span>A one-page conversation planner managers fill out five minutes before the talk.</span></li>' +
      '<li><span class="label">Leader support</span><span>Area managers ask one coaching question in monthly one-on-ones. A two-minute guide shows them how.</span></li>' +
      '<li><span class="label">Measurement</span><span>Pulse surveys of direct reports at 30, 60, and 90 days on how often feedback happens and how it lands. Completions are tracked too.</span></li>' +
      "</ul></div></div>" +
      '<div class="say-wrap"><h3>How I’d say it to <em>Dana</em></h3><blockquote class="say">“The eLearning can be part of the solution, but I don’t think it’s enough on its own. I’d pair a short scenario with practice and manager follow-up so they can use the skill before it matters.”</blockquote><button class="btn" id="replay-btn" type="button">Try different questions</button></div>';
    meetingEl.innerHTML = html;
    $("replay-btn").addEventListener("click", function () {
      state.met = false; state.asked = []; selected = [];
      save();
      renderQuestions(); renderMeeting(); renderCert();
      var first = qsEl.querySelector(".q");
      $("request").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      if (first) first.focus({ preventScroll: true });
    });
  }

  /* ---------- certificate ---------- */
  var seal = $("seal");
  function renderCert() {
    var p = PATHS[pathKey()], pr = progress();
    $("cert-name-out").textContent = state.name || "A curious reader";
    $("cs-path").textContent = state.path ? p.name : "Not chosen";
    $("cs-stops").textContent = pr.done + " of " + pr.total;
    var mins = Math.max(1, Math.round((Date.now() - state.start) / 60000));
    $("cs-time").textContent = mins > 180 ? "A while (welcome back)" : mins + " min";
    $("cs-asked").textContent = state.met ? goodCount() + " of 3 on target" : "Not yet";
    try { $("cert-date").textContent = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); } catch (e) {}
    seal.classList.toggle("is-stamped", !!state.claimed);
    $("cert-note").textContent = state.claimed
      ? (pr.done < pr.total ? "Claimed with " + pr.done + " of " + pr.total + " stops. Honor system." : "Earned in full. Nicely done.")
      : "";
  }
  var nameInput = $("cert-name");
  nameInput.value = state.name || "";
  $("claim-btn").addEventListener("click", function () {
    state.name = nameInput.value.trim().slice(0, 60);
    state.claimed = true;
    save();
    addLog("<b>" + (state.name ? esc(state.name) : "You") + "</b> <i>earned</i> a certificate in Meet McKena Ullman");
    renderCert();
    if (!reduced) { seal.classList.remove("stamp"); void seal.getBoundingClientRect(); seal.classList.add("stamp"); }
  });

  /* ---------- contact ---------- */
  var copyBtn = $("copy-btn"), emailEl = $("email");
  function selectEmail() {
    try { var r = document.createRange(); r.selectNodeContents(emailEl); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
  }
  copyBtn.addEventListener("click", function () {
    var text = emailEl.textContent.trim();
    var done = function () {
      copyBtn.textContent = "Copied";
      addLog("<b>You</b> <i>copied</i> McKena’s email.");
      setTimeout(function () { copyBtn.textContent = "Copy"; }, 2200);
    };
    var fail = function () { selectEmail(); copyBtn.textContent = "Selected. Press Ctrl+C"; setTimeout(function () { copyBtn.textContent = "Copy"; }, 3000); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail);
      else fail();
    } catch (e) { fail(); }
  });
  document.querySelectorAll("[data-case]").forEach(function (a) {
    a.addEventListener("click", function () {
      var n = a.dataset.case;
      addLog("<b>You</b> <i>opened</i> " + (n === "résumé" ? "McKena’s résumé" : "the " + esc(n) + (n === "Interaction Lab" ? "" : " case study")), true);
    });
  });

  /* ---------- drawer ---------- */
  var recordBtn = $("record-btn"), drawer = $("record"), scrim = $("scrim");
  function openRecord() {
    drawer.hidden = false; scrim.hidden = false;
    recordBtn.setAttribute("aria-expanded", "true");
    $("record-h").focus();
  }
  function closeRecord() {
    drawer.hidden = true; scrim.hidden = true;
    recordBtn.setAttribute("aria-expanded", "false");
    recordBtn.focus();
  }
  recordBtn.addEventListener("click", function () { drawer.hidden ? openRecord() : closeRecord(); });
  $("record-close").addEventListener("click", closeRecord);
  scrim.addEventListener("click", closeRecord);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !drawer.hidden) closeRecord(); });
  var resetBtn = $("reset-btn"), resetArmed = false, resetTimer = null;
  resetBtn.addEventListener("click", function () {
    if (!resetArmed) {
      resetArmed = true; resetBtn.textContent = "Click again to clear";
      resetTimer = setTimeout(function () { resetArmed = false; resetBtn.textContent = "Clear my progress"; }, 3500);
      return;
    }
    clearTimeout(resetTimer); resetArmed = false; resetBtn.textContent = "Clear my progress";
    state = fresh(); selected = []; nameInput.value = "";
    addLog("<b>You</b> <i>launched</i> Meet McKena Ullman", true);
    renderQuestions(); renderMeeting(); renderPath();
  });

  /* ---------- start ---------- */
  if (!state.log.length) addLog("<b>You</b> <i>launched</i> Meet McKena Ullman", true);
  renderRecord();
  renderQuestions();
  renderMeeting();
  if (state.met) meetingEl.hidden = false;
  renderPath();
  setInterval(renderCert, 30000);
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
