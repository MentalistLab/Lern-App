(() => {
  'use strict';

  /* ========== Konstanten ========== */
  const KEY = 'lernarena.v1';
  const DAILY_GOAL = 20;
  const BLITZ_SECONDS = 60;

  const RANKS = [
    { name: 'Neuling', icon: '🌱', xp: 0 },
    { name: 'Lehrling', icon: '📘', xp: 100 },
    { name: 'Schüler', icon: '🎒', xp: 300 },
    { name: 'Student', icon: '🎓', xp: 700 },
    { name: 'Kenner', icon: '🔍', xp: 1300 },
    { name: 'Experte', icon: '🧠', xp: 2200 },
    { name: 'Meister', icon: '🏅', xp: 3500 },
    { name: 'Großmeister', icon: '👑', xp: 5500 },
    { name: 'Legende', icon: '🔥', xp: 8500 },
    { name: 'Genie', icon: '⚡', xp: 12000 }
  ];

  const ACHIEVEMENTS = [
    { id: 'first', icon: '🚀', name: 'Erster Schritt', desc: 'Schließe dein erstes Quiz ab.', ok: s => s.stats.quizzes >= 1 },
    { id: 'c10', icon: '✅', name: 'Warmgelaufen', desc: '10 richtige Antworten.', ok: s => s.stats.correct >= 10 },
    { id: 'c100', icon: '💯', name: 'Hundertschaft', desc: '100 richtige Antworten.', ok: s => s.stats.correct >= 100 },
    { id: 'c500', icon: '📚', name: 'Wissensdurst', desc: '500 richtige Antworten.', ok: s => s.stats.correct >= 500 },
    { id: 'c1000', icon: '🏛️', name: 'Bibliothekar', desc: '1000 richtige Antworten.', ok: s => s.stats.correct >= 1000 },
    { id: 'perfect', icon: '🎯', name: 'Perfekt!', desc: 'Ein Quiz ohne Fehler (mind. 5 Fragen).', ok: s => s.stats.perfect >= 1 },
    { id: 'combo5', icon: '🔗', name: 'Kombo x5', desc: '5 richtige Antworten in Folge.', ok: s => s.stats.bestCombo >= 5 },
    { id: 'combo10', icon: '⛓️', name: 'Kombo x10', desc: '10 richtige Antworten in Folge.', ok: s => s.stats.bestCombo >= 10 },
    { id: 'combo20', icon: '🌪️', name: 'Unaufhaltsam', desc: '20 richtige Antworten in Folge.', ok: s => s.stats.bestCombo >= 20 },
    { id: 'streak3', icon: '🔥', name: 'Dranbleiber', desc: '3 Tage in Folge gelernt.', ok: s => s.streak.best >= 3 },
    { id: 'streak7', icon: '📅', name: 'Wochenheld', desc: '7 Tage in Folge gelernt.', ok: s => s.streak.best >= 7 },
    { id: 'streak30', icon: '🗓️', name: 'Gewohnheitstier', desc: '30 Tage in Folge gelernt.', ok: s => s.streak.best >= 30 },
    { id: 'allcats', icon: '🧭', name: 'Entdecker', desc: 'Beantworte Fragen in jeder Kategorie.', ok: s => CATS.every(c => (s.cats[c.id] || {}).answered > 0) },
    { id: 'master', icon: '🏆', name: 'Kategorie-Meister', desc: 'Meistere alle Fragen einer Kategorie.', ok: s => CATS.some(c => masteredCount(c.id, s) === c.q.length) },
    { id: 'xp1000', icon: '💎', name: '1000 XP', desc: 'Sammle 1000 XP.', ok: s => s.xp >= 1000 },
    { id: 'blitz15', icon: '⚡', name: 'Blitzmerker', desc: '15 richtige Antworten in einer Blitz-Runde.', ok: s => s.stats.blitzBest >= 15 },
    { id: 'goal', icon: '🎖️', name: 'Tagesziel', desc: 'Erreiche das Tagesziel von ' + DAILY_GOAL + ' Fragen.', ok: s => s.stats.goalDays >= 1 }
  ];

  /* ========== Fragen aufbereiten ========== */
  const CATS = window.CATEGORIES.map(c => ({
    id: c.id, name: c.name, icon: c.icon, color: c.color,
    q: c.q.map((r, i) => ({ id: c.id + '-' + i, cat: c.id, q: r[0], a: r[1], w: r.slice(2) }))
  }));
  const ALL = CATS.flatMap(c => c.q);
  const BYID = Object.fromEntries(ALL.map(q => [q.id, q]));
  const CATBYID = Object.fromEntries(CATS.map(c => [c.id, c]));

  /* ========== Hilfsfunktionen ========== */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => n.toLocaleString('de-DE');
  const dayStr = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => dayStr(new Date());
  const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayStr(d); };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ========== Speicher ========== */
  let memCopy = null;
  const defaultState = () => ({
    v: 1, name: '', xp: 0, created: today(), len: 10,
    streak: { count: 0, last: '', best: 0 },
    daily: { date: '', n: 0, reached: false },
    stats: { answered: 0, correct: 0, bestCombo: 0, quizzes: 0, perfect: 0, blitzBest: 0, goalDays: 0 },
    cats: {}, seen: {}, wrong: [], ach: {}
  });

  function normalize(raw) {
    const d = defaultState();
    if (!raw || typeof raw !== 'object') return d;
    const o = Object.assign(d, raw);
    o.streak = Object.assign(defaultState().streak, raw.streak);
    o.daily = Object.assign(defaultState().daily, raw.daily);
    o.stats = Object.assign(defaultState().stats, raw.stats);
    o.cats = (raw.cats && typeof raw.cats === 'object') ? raw.cats : {};
    o.seen = (raw.seen && typeof raw.seen === 'object') ? raw.seen : {};
    o.ach = (raw.ach && typeof raw.ach === 'object') ? raw.ach : {};
    o.wrong = Array.isArray(raw.wrong) ? raw.wrong.filter(id => BYID[id]) : [];
    o.xp = Number.isFinite(+o.xp) ? Math.max(0, Math.floor(+o.xp)) : 0;
    o.name = typeof o.name === 'string' ? o.name.slice(0, 30) : '';
    o.len = [5, 10, 20].includes(o.len) ? o.len : 10;
    return o;
  }

  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { /* ignorieren */ }
    if (!raw) raw = memCopy;
    if (!raw) return defaultState();
    try { return normalize(JSON.parse(raw)); } catch (e) { return defaultState(); }
  }
  function save() {
    const json = JSON.stringify(state);
    memCopy = json;
    try { localStorage.setItem(KEY, json); } catch (e) { /* z. B. privater Modus */ }
  }

  let state = load();

  /* ========== Rang & Fortschritt ========== */
  const rankIndex = xp => { let r = 0; RANKS.forEach((x, i) => { if (xp >= x.xp) r = i; }); return r; };
  const seenOf = id => state.seen[id] || { c: 0, w: 0 };
  function masteredCount(catId, s = state) {
    return CATBYID[catId].q.filter(q => ((s.seen[q.id] || {}).c || 0) >= 2).length;
  }
  const currentStreak = () => (state.streak.last === today() || state.streak.last === yesterday()) ? state.streak.count : 0;
  const dailyCount = () => state.daily.date === today() ? state.daily.n : 0;

  /* ========== Toasts ========== */
  function toast(html, gold) {
    const t = document.createElement('div');
    t.className = 'toast' + (gold ? ' gold' : '');
    t.innerHTML = html;
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), 4200);
  }

  function checkAchievements() {
    ACHIEVEMENTS.forEach(a => {
      if (!state.ach[a.id] && a.ok(state)) {
        state.ach[a.id] = today();
        toast('<b>' + a.icon + ' Erfolg freigeschaltet!</b><br>' + esc(a.name), true);
      }
    });
  }

  function addXp(n) {
    const before = rankIndex(state.xp);
    state.xp += n;
    const after = rankIndex(state.xp);
    if (after > before) toast('<b>' + RANKS[after].icon + ' Rangaufstieg!</b><br>Du bist jetzt <b>' + RANKS[after].name + '</b>!', true);
  }

  function updateTop() {
    const r = RANKS[rankIndex(state.xp)];
    $('#topxp').innerHTML = state.name ? r.icon + ' ' + esc(r.name) + ' · <b>' + fmt(state.xp) + ' XP</b>' : '';
  }

  /* ========== Navigation ========== */
  let view = 'home';
  let timerId = null;
  let quiz = null;

  function go(v) {
    if (timerId) { clearInterval(timerId); timerId = null; }
    if (v !== 'quiz' && v !== 'result') quiz = null;
    view = v;
    if (!state.name && v !== 'welcome') view = 'welcome';
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    updateTop();
    const app = $('#app');
    if (view === 'welcome') app.innerHTML = tplWelcome();
    else if (view === 'home') app.innerHTML = tplHome();
    else if (view === 'quiz') app.innerHTML = tplQuiz();
    else if (view === 'result') app.innerHTML = tplResult();
    else if (view === 'profile') app.innerHTML = tplProfile();
    bind();
  }

  /* ========== Templates ========== */
  function tplWelcome() {
    return '<div class="card stack" style="max-width:480px;margin:40px auto">' +
      '<h1>🧠 Willkommen in der Lern-Arena!</h1>' +
      '<p class="muted">Beantworte Fragen, sammle XP, steige im Rang auf – von <b>Neuling</b> bis <b>Genie</b>. ' +
      'Dein Fortschritt wird automatisch auf diesem Gerät gespeichert.</p>' +
      '<form id="nameForm" class="stack"><label for="nm"><b>Wie heißt du?</b></label>' +
      '<input type="text" id="nm" maxlength="30" autocomplete="off" placeholder="Dein Name" required>' +
      '<button class="btn big" type="submit">Los geht’s</button></form>' +
      '<p class="muted small">' + fmt(ALL.length) + ' Fragen in ' + CATS.length + ' Kategorien warten auf dich.</p></div>';
  }

  function rankCard() {
    const i = rankIndex(state.xp), r = RANKS[i], next = RANKS[i + 1];
    let bar = '', label = '';
    if (next) {
      const pct = Math.round((state.xp - r.xp) / (next.xp - r.xp) * 100);
      bar = '<div class="bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pct + '%"></i></div>';
      label = '<p class="muted small" style="margin:6px 0 0">' + fmt(next.xp - state.xp) + ' XP bis <b>' + next.icon + ' ' + next.name + '</b></p>';
    } else {
      bar = '<div class="bar"><i style="width:100%"></i></div>';
      label = '<p class="muted small" style="margin:6px 0 0">Höchster Rang erreicht – du bist ein Genie! 🎉</p>';
    }
    const dn = Math.min(dailyCount(), DAILY_GOAL);
    return '<div class="card rank-card"><div class="rank-icon">' + r.icon + '</div><div>' +
      '<div class="muted small">Hallo ' + esc(state.name) + '!</div>' +
      '<div class="rank-name">' + r.name + '</div>' + bar + label +
      '<div class="chips"><span class="chip">⭐ ' + fmt(state.xp) + ' XP</span>' +
      '<span class="chip">🔥 ' + currentStreak() + ' Tage Serie</span>' +
      '<span class="chip">🎯 Tagesziel ' + dn + '/' + DAILY_GOAL + (dn >= DAILY_GOAL ? ' ✔' : '') + '</span></div></div></div>';
  }

  function tplHome() {
    const lenBtns = [5, 10, 20].map(n => '<button data-len="' + n + '" class="' + (state.len === n ? 'on' : '') + '">' + n + '</button>').join('');
    const cats = CATS.map(c => {
      const m = masteredCount(c.id), pct = Math.round(m / c.q.length * 100);
      const cs = state.cats[c.id] || { answered: 0, correct: 0 };
      const acc = cs.answered ? Math.round(cs.correct / cs.answered * 100) + ' % richtig' : 'Noch nicht gespielt';
      return '<button class="cat" style="--c:' + c.color + '" data-cat="' + c.id + '"><span class="ico">' + c.icon + '</span><b>' + esc(c.name) + '</b>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="muted small" style="margin-top:6px">' + m + '/' + c.q.length + ' gemeistert · ' + acc + '</div></button>';
    }).join('');
    return '<div class="stack">' + rankCard() +
      '<div class="row"><h2 class="grow" style="margin:0">Spielmodi</h2><span class="muted small">Fragen pro Runde:</span><div class="seg" id="seg">' + lenBtns + '</div></div>' +
      '<div class="modes">' +
      '<button class="mode" data-mode="mix"><span class="ico">🎲</span><b>Mix-Quiz</b><span class="d">Zufällige Fragen aus allen Kategorien – Neues & Schwaches zuerst.</span></button>' +
      '<button class="mode" data-mode="blitz"><span class="ico">⚡</span><b>Blitz (' + BLITZ_SECONDS + ' s)</b><span class="d">So viele richtige Antworten wie möglich in einer Minute.</span></button>' +
      '<button class="mode" data-mode="fix"' + (state.wrong.length ? '' : ' disabled') + '><span class="ico">🩹</span><b>Fehler wiederholen</b><span class="d">' + (state.wrong.length ? state.wrong.length + ' Frage(n) warten auf eine zweite Chance.' : 'Noch keine Fehler – stark!') + '</span></button>' +
      '</div>' +
      '<h2>Kategorien</h2><div class="cats">' + cats + '</div>' +
      '<p class="muted small">' + fmt(ALL.length) + ' Fragen insgesamt · „Gemeistert“ = mindestens 2× richtig beantwortet.</p></div>';
  }

  function tplQuiz() {
    const z = quiz, q = z.list[z.i];
    const catName = z.mode === 'blitz' || z.mode === 'mix' || z.mode === 'fix' ? CATBYID[q.cat].icon + ' ' + CATBYID[q.cat].name : '';
    const title = z.mode === 'blitz' ? '' : '<span class="muted">Frage <b>' + (z.i + 1) + '</b>/' + z.list.length + '</span>';
    const pct = z.mode === 'blitz' ? Math.round(z.left / BLITZ_SECONDS * 100) : Math.round(z.i / z.list.length * 100);
    const timer = z.mode === 'blitz' ? '<span class="timer' + (z.left <= 10 ? ' low' : '') + '" id="timer">' + Math.ceil(z.left) + '</span>' : '';
    const opts = z.opts.map((o, i) => {
      let cls = 'opt';
      if (z.locked) cls += o.ok ? ' right' : (i === z.picked ? ' wrong' : ' dim');
      return '<button class="' + cls + '" data-opt="' + i + '"' + (z.locked ? ' disabled' : '') + '><span class="k">' + (i + 1) + '</span><span>' + esc(o.t) + '</span></button>';
    }).join('');
    let fb = '';
    if (z.locked) {
      const last = z.last;
      fb = '<div class="feedback ' + (last.ok ? 'ok' : 'no') + '" role="status">' +
        (last.ok ? '✔ Richtig! +' + last.gain + ' XP' + (z.combo >= 3 ? ' · 🔗 Kombo x' + z.combo : '') : '✘ Leider falsch. Richtig wäre: ' + esc(q.a)) + '</div>';
      if (z.mode !== 'blitz') {
        fb += '<div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn big" id="next">' + (z.i + 1 >= z.list.length ? 'Ergebnis ansehen' : 'Weiter →') + '</button></div>';
      }
    }
    return '<div class="card">' +
      '<div class="quiz-head">' + title + timer +
      '<div class="bar" id="qbar"><i style="width:' + pct + '%"></i></div>' +
      '<span class="chip">⭐ +' + z.xp + '</span><span class="chip">🔗 ' + z.combo + '</span>' +
      '<button class="btn ghost" id="quit" style="padding:6px 12px">Beenden</button></div>' +
      (catName ? '<div class="cat-tag">' + catName + '</div>' : '<div class="cat-tag">' + CATBYID[q.cat].icon + ' ' + CATBYID[q.cat].name + '</div>') +
      '<div class="quiz-q">' + esc(q.q) + '</div><div class="opts">' + opts + '</div>' + fb + '</div>';
  }

  function tplResult() {
    const r = quiz.result;
    const pct = r.total ? Math.round(r.correct / r.total * 100) : 0;
    const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
    const msg = pct === 100 ? 'Perfekt!' : pct >= 80 ? 'Sehr stark!' : pct >= 50 ? 'Solide – weiter so!' : 'Übung macht den Meister!';
    const missed = r.missed.length
      ? '<div class="missed"><h3>Zum Nachlernen</h3><ul>' + r.missed.map(m => '<li>' + esc(m.q) + '<br><b>→ ' + esc(m.a) + '</b></li>').join('') + '</ul></div>'
      : '';
    const ri = rankIndex(state.xp), rk = RANKS[ri];
    return '<div class="card result stack"><div class="big">' + emoji + '</div><div class="score">' + r.correct + ' / ' + r.total + ' richtig</div>' +
      '<p class="muted">' + msg + '</p>' +
      '<div class="chips" style="justify-content:center"><span class="chip">⭐ +' + r.xp + ' XP' + (r.bonus ? ' (inkl. ' + r.bonus + ' Bonus)' : '') + '</span>' +
      '<span class="chip">🔗 Beste Kombo ' + r.bestCombo + '</span><span class="chip">' + rk.icon + ' ' + rk.name + ' · ' + fmt(state.xp) + ' XP</span></div>' +
      '<div class="row" style="justify-content:center"><button class="btn big" id="again">Nochmal</button><button class="btn ghost big" data-go="home">Zur Startseite</button></div>' +
      missed + '</div>';
  }

  function tplProfile() {
    const st = state.stats;
    const acc = st.answered ? Math.round(st.correct / st.answered * 100) : 0;
    const ri = rankIndex(state.xp);
    const ladder = RANKS.map((r, i) => '<div class="r ' + (i === ri ? 'cur' : i > ri ? 'locked' : '') + '"><span style="font-size:1.5rem">' + r.icon + '</span><b>' + r.name + '</b><span class="muted small">ab ' + fmt(r.xp) + ' XP</span></div>').join('');
    const ach = ACHIEVEMENTS.map(a => '<div class="a ' + (state.ach[a.id] ? 'got' : 'locked') + '"><span class="ico">' + a.icon + '</span><div><b>' + esc(a.name) + '</b><div class="muted small">' + esc(a.desc) + '</div></div></div>').join('');
    const got = ACHIEVEMENTS.filter(a => state.ach[a.id]).length;
    return '<div class="stack">' + rankCard() +
      '<div class="card stack"><h2>Statistik</h2><div class="stats">' +
      stat(fmt(st.answered), 'Antworten') + stat(fmt(st.correct), 'Richtig') + stat(acc + ' %', 'Trefferquote') +
      stat(st.quizzes, 'Runden') + stat(st.bestCombo, 'Beste Kombo') + stat(state.streak.best, 'Längste Serie (Tage)') + '</div></div>' +
      '<div class="card stack"><h2>Ränge</h2><div class="ladder">' + ladder + '</div></div>' +
      '<div class="card stack"><h2>Erfolge (' + got + '/' + ACHIEVEMENTS.length + ')</h2><div class="ach">' + ach + '</div></div>' +
      '<div class="card stack"><h2>Name & Daten</h2>' +
      '<div class="row"><input type="text" id="renameInp" maxlength="30" value="' + esc(state.name) + '" style="flex:1 1 200px"><button class="btn" id="rename">Namen ändern</button></div>' +
      '<p class="muted small">Dein Fortschritt liegt im Speicher deines Browsers. Exportiere ihn als Sicherung oder um ihn auf ein anderes Gerät zu übertragen.</p>' +
      '<div class="row"><button class="btn ghost" id="export">⬇ Fortschritt exportieren</button>' +
      '<button class="btn ghost" id="import">⬆ Fortschritt importieren</button>' +
      '<input type="file" id="file" accept="application/json,.json" hidden>' +
      '<button class="btn danger" id="reset">Alles zurücksetzen</button></div></div></div>';
  }
  const stat = (v, l) => '<div class="stat"><b>' + v + '</b><span class="muted small">' + l + '</span></div>';

  /* ========== Quiz-Logik ========== */
  function weight(q) {
    const s = state.seen[q.id];
    if (!s) return 3;
    if (s.w > s.c) return 5;
    return Math.max(0.4, 2 - s.c * 0.5);
  }
  function pickWeighted(pool, n) {
    const items = pool.map(q => ({ q, w: weight(q) }));
    const out = [];
    while (out.length < n && items.length) {
      const total = items.reduce((a, b) => a + b.w, 0);
      let r = Math.random() * total, idx = 0;
      for (; idx < items.length - 1; idx++) { r -= items[idx].w; if (r <= 0) break; }
      out.push(items.splice(idx, 1)[0].q);
    }
    return out;
  }

  function startQuiz(mode, catId) {
    let list;
    if (mode === 'cat') list = pickWeighted(CATBYID[catId].q, state.len);
    else if (mode === 'mix') list = pickWeighted(ALL, state.len);
    else if (mode === 'fix') list = shuffle(state.wrong.map(id => BYID[id])).slice(0, state.len);
    else list = pickWeighted(ALL, ALL.length); // blitz
    if (!list.length) return;
    quiz = { mode, catId, list, i: 0, correct: 0, combo: 0, bestCombo: 0, xp: 0, missed: [], locked: false, picked: -1, last: null, left: BLITZ_SECONDS, token: Math.random() };
    prepareQuestion();
    view = 'quiz';
    if (timerId) clearInterval(timerId);
    if (mode === 'blitz') {
      const started = Date.now();
      timerId = setInterval(() => {
        if (!quiz || view !== 'quiz') return;
        quiz.left = Math.max(0, BLITZ_SECONDS - (Date.now() - started) / 1000);
        const t = $('#timer'), b = $('#qbar i');
        if (t) { t.textContent = Math.ceil(quiz.left); t.classList.toggle('low', quiz.left <= 10); }
        if (b) b.style.width = Math.round(quiz.left / BLITZ_SECONDS * 100) + '%';
        if (quiz.left <= 0) finishQuiz();
      }, 200);
    }
    render();
  }

  function prepareQuestion() {
    const q = quiz.list[quiz.i];
    quiz.opts = shuffle([{ t: q.a, ok: true }].concat(q.w.map(t => ({ t, ok: false }))));
    quiz.locked = false; quiz.picked = -1; quiz.last = null;
  }

  function touchDaily() {
    const t = today();
    if (state.streak.last !== t) {
      state.streak.count = state.streak.last === yesterday() ? state.streak.count + 1 : 1;
      state.streak.last = t;
      state.streak.best = Math.max(state.streak.best, state.streak.count);
    }
    if (state.daily.date !== t) state.daily = { date: t, n: 0, reached: false };
    state.daily.n++;
    if (!state.daily.reached && state.daily.n >= DAILY_GOAL) {
      state.daily.reached = true;
      state.stats.goalDays++;
      addXp(25);
      toast('<b>🎯 Tagesziel erreicht!</b><br>+25 Bonus-XP', true);
    }
  }

  function answer(idx) {
    const z = quiz;
    if (!z || z.locked || !z.opts[idx]) return;
    z.locked = true; z.picked = idx;
    const q = z.list[z.i], ok = z.opts[idx].ok;
    const s = state.seen[q.id] = state.seen[q.id] || { c: 0, w: 0 };
    const cs = state.cats[q.cat] = state.cats[q.cat] || { answered: 0, correct: 0 };
    state.stats.answered++; cs.answered++;
    let gain = 0;
    if (ok) {
      s.c++; cs.correct++; state.stats.correct++; z.correct++; z.combo++;
      z.bestCombo = Math.max(z.bestCombo, z.combo);
      state.stats.bestCombo = Math.max(state.stats.bestCombo, z.combo);
      gain = 10 + Math.min(z.combo - 1, 5) * 2;
      z.xp += gain; addXp(gain);
      state.wrong = state.wrong.filter(id => id !== q.id);
    } else {
      s.w++; z.combo = 0; z.missed.push(q);
      if (!state.wrong.includes(q.id)) state.wrong.push(q.id);
    }
    z.last = { ok, gain };
    touchDaily();
    if (z.mode === 'blitz') state.stats.blitzBest = Math.max(state.stats.blitzBest, z.correct);
    checkAchievements();
    save(); updateTop();
    render();
    if (z.mode === 'blitz') {
      const tok = z.token;
      setTimeout(() => { if (quiz && quiz.token === tok && view === 'quiz') nextQuestion(); }, ok ? 450 : 1100);
    }
  }

  function nextQuestion() {
    const z = quiz;
    if (!z || !z.locked) return;
    if (z.i + 1 >= z.list.length) { finishQuiz(); return; }
    z.i++;
    prepareQuestion();
    render();
  }

  function finishQuiz() {
    const z = quiz;
    if (!z || z.done) return;
    z.done = true;
    if (timerId) { clearInterval(timerId); timerId = null; }
    const answered = z.mode === 'blitz' ? z.correct + z.missed.length : z.list.length;
    let bonus = 0;
    if (z.mode !== 'blitz' && answered >= 5) {
      const pct = z.correct / answered;
      bonus = pct === 1 ? 50 : pct >= 0.8 ? 20 : 0;
      if (pct === 1) state.stats.perfect++;
    }
    if (bonus) { z.xp += bonus; addXp(bonus); }
    if (answered > 0) state.stats.quizzes++;
    checkAchievements();
    save();
    z.result = { correct: z.correct, total: answered, xp: z.xp, bonus, bestCombo: z.bestCombo, missed: z.missed };
    view = 'result';
    render();
    window.scrollTo(0, 0);
  }

  /* ========== Events ========== */
  function bind() {
    document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
    const nameForm = $('#nameForm');
    if (nameForm) {
      $('#nm').focus();
      nameForm.onsubmit = e => {
        e.preventDefault();
        const n = $('#nm').value.trim();
        if (!n) return;
        state.name = n.slice(0, 30); save(); go('home');
      };
    }
    document.querySelectorAll('[data-len]').forEach(b => b.onclick = () => { state.len = +b.dataset.len; save(); render(); });
    document.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => startQuiz('cat', b.dataset.cat));
    document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => startQuiz(b.dataset.mode));
    document.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => answer(+b.dataset.opt));
    const next = $('#next'); if (next) { next.onclick = nextQuestion; next.focus(); }
    const quit = $('#quit');
    if (quit) quit.onclick = () => {
      if (quiz.mode === 'blitz') { finishQuiz(); return; }
      const n = quiz.locked ? quiz.i + 1 : quiz.i; // bereits beantwortete Fragen
      if (n === 0) { go('home'); return; }
      if (confirm('Quiz beenden? Dein bisheriger Fortschritt bleibt gespeichert.')) {
        quiz.list = quiz.list.slice(0, n);
        finishQuiz();
      }
    };
    const again = $('#again');
    if (again) again.onclick = () => startQuiz(quiz.mode, quiz.catId);

    const rn = $('#rename');
    if (rn) rn.onclick = () => {
      const n = $('#renameInp').value.trim();
      if (n) { state.name = n.slice(0, 30); save(); toast('Name gespeichert ✔'); render(); }
    };
    const ex = $('#export');
    if (ex) ex.onclick = () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'lern-arena-fortschritt-' + today() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    const im = $('#import'), file = $('#file');
    if (im) im.onclick = () => file.click();
    if (file) file.onchange = () => {
      const f = file.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const obj = JSON.parse(rd.result);
          if (!obj || typeof obj !== 'object' || typeof obj.xp !== 'number') throw new Error('Ungültig');
          if (!confirm('Aktuellen Fortschritt durch die Datei ersetzen?')) return;
          state = normalize(obj); if (!state.name) state.name = 'Lerner';
          save(); toast('Fortschritt importiert ✔'); go('profile');
        } catch (e) { alert('Die Datei ist kein gültiger Lern-Arena-Fortschritt.'); }
      };
      rd.readAsText(f);
    };
    const rs = $('#reset');
    if (rs) rs.onclick = () => {
      if (confirm('Wirklich ALLEN Fortschritt löschen? Das kann nicht rückgängig gemacht werden.')) {
        state = defaultState(); save(); go('welcome');
      }
    };
  }

  document.addEventListener('keydown', e => {
    if (view !== 'quiz' || !quiz || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target && e.target.tagName === 'INPUT') return;
    if (e.key >= '1' && e.key <= '4') { answer(+e.key - 1); }
    else if ((e.key === 'Enter' || e.key === ' ') && quiz.locked && quiz.mode !== 'blitz') { e.preventDefault(); nextQuestion(); }
  });

  /* ========== Start ========== */
  go('home');
})();
