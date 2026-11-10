// FlashForge – flashcard study app
// Data is saved in localStorage so the deck and stats survive page reloads.

const STORAGE_KEY = "flashforge-data";
const MASTERY_THRESHOLD = 3; // correct answers in a row to master a card

const SAMPLE_DECK = [
  ["What does HTML stand for?", "HyperText Markup Language"],
  ["What does CSS control?", "The presentation/styling of a web page"],
  ["What is a primary key?", "A field that uniquely identifies each record in a table"],
  ["What does SQL stand for?", "Structured Query Language"],
  ["What is an ERP system?", "Enterprise Resource Planning – software that integrates core business processes"],
  ["What is the difference between data and information?", "Information is data that has been processed to be meaningful"],
];

// ---------- State ----------
let state = load();
let session = null; // { queue: [ids], index, correct, missed: [ids], streak, flipped }

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.cards)) return saved;
  } catch (e) { /* ignore bad data */ }
  return { cards: [], stats: { sessions: 0, best: 0, bestStreak: 0 } };
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
}

function makeCard(front, back) {
  return { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), front, back, rightInARow: 0 };
}

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const els = {
  form: $("card-form"), front: $("front"), back: $("back"),
  list: $("card-list"), count: $("card-count"),
  sampleBtn: $("sample-btn"), clearBtn: $("clear-btn"),
  exportBtn: $("export-btn"), importBtn: $("import-btn"),
  importFile: $("import-file"), sessionTimerEl: $("session-timer"),
  studyEmpty: $("study-empty"), studyArea: $("study-area"), startBtn: $("start-btn"),
  flashcard: $("flashcard"), cardFront: $("card-front"), cardBack: $("card-back"),
  grade: $("grade-buttons"), rightBtn: $("right-btn"), wrongBtn: $("wrong-btn"),
  progressBar: $("progress-bar"), progressText: $("progress-text"),
  results: $("results"), resultsTitle: $("results-title"), resultsMsg: $("results-msg"),
  scoreRing: $("score-ring"), scorePct: $("score-pct"),
  restartBtn: $("restart-btn"), retryMissedBtn: $("retry-missed-btn"),
  statSessions: $("stat-sessions"), statBest: $("stat-best"),
  statMastered: $("stat-mastered"), statStreak: $("stat-streak"),
};

// ---------- Toast feedback ----------
const toast = document.createElement("div");
toast.className = "toast";
document.body.appendChild(toast);
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
}

// ---------- Rendering ----------
function renderDeck() {
  els.list.innerHTML = "";
  state.cards.forEach((card) => {
    const li = document.createElement("li");
    const text = document.createElement("div");
    const q = document.createElement("div");
    q.className = "q";
    q.textContent = card.front;
    if (card.rightInARow >= MASTERY_THRESHOLD) {
      const tag = document.createElement("span");
      tag.className = "mastered-tag";
      tag.textContent = "mastered";
      q.appendChild(tag);
    }
    const a = document.createElement("div");
    a.className = "a";
    a.textContent = card.back;
    text.append(q, a);

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.setAttribute("aria-label", "Delete card");
    del.textContent = "✕";
    del.addEventListener("click", () => deleteCard(card.id));

    li.append(text, del);
    els.list.appendChild(li);
  });
  const n = state.cards.length;
  els.count.textContent = `${n} card${n === 1 ? "" : "s"}`;
}

function renderStats() {
  els.statSessions.textContent = state.stats.sessions;
  els.statBest.textContent = state.stats.best + "%";
  els.statMastered.textContent = state.cards.filter((c) => c.rightInARow >= MASTERY_THRESHOLD).length;
  els.statStreak.textContent = state.stats.bestStreak;
}

function renderStudyIdle() {
  const hasCards = state.cards.length > 0;
  els.studyEmpty.hidden = hasCards;
  els.studyArea.hidden = true;
  els.results.hidden = true;
  els.startBtn.hidden = !hasCards;
  els.startBtn.textContent = `Start session (${state.cards.length} card${state.cards.length === 1 ? "" : "s"})`;
}

function renderAll() {
  renderDeck();
  renderStats();
  if (!session) renderStudyIdle();
}

// ---------- Deck actions ----------
els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const front = els.front.value.trim();
  const back = els.back.value.trim();
  if (!front || !back) return;
  if (state.cards.some((c) => c.front.toLowerCase() === front.toLowerCase())) {
    showToast("That question is already in your deck");
    return;
  }
  state.cards.push(makeCard(front, back));
  save();
  els.form.reset();
  els.front.focus();
  showToast("Card added ✓");
  renderAll();
});

function deleteCard(id) {
  state.cards = state.cards.filter((c) => c.id !== id);
  save();
  if (session) endSessionEarly();
  renderAll();
}

els.sampleBtn.addEventListener("click", () => {
  let added = 0;
  SAMPLE_DECK.forEach(([f, b]) => {
    if (!state.cards.some((c) => c.front === f)) {
      state.cards.push(makeCard(f, b));
      added++;
    }
  });
  save();
  showToast(added ? `Added ${added} sample cards` : "Sample deck already loaded");
  renderAll();
});

els.clearBtn.addEventListener("click", () => {
  if (!state.cards.length) return;
  if (!confirm("Delete every card in your deck? This can't be undone.")) return;
  state.cards = [];
  save();
  session = null;
  showToast("Deck cleared");
  renderAll();
});

els.exportBtn.addEventListener("click", () => {
  const data = JSON.stringify({ cards: state.cards, stats: state.stats }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "flashforge-deck.json";
  a.click();
  URL.revokeObjectURL(url);
  showToast("Deck exported ✓");
});

els.importBtn.addEventListener("click", () => {
  els.importFile.click();
});

els.importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data || !Array.isArray(data.cards)) {
        showToast("Invalid deck file");
        return;
      }
      let imported = 0;
      data.cards.forEach((card) => {
        if (typeof card.front === "string" && typeof card.back === "string" && card.front.trim() && card.back.trim() &&
            !state.cards.some((c) => c.front.toLowerCase() === card.front.toLowerCase())) {
          state.cards.push({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            front: card.front.trim(), back: card.back.trim(),
            rightInARow: Number(card.rightInARow) || 0,
          });
          imported++;
        }
      });
      if (data.stats) {
        state.stats.sessions = (state.stats.sessions || 0) + (data.stats.sessions || 0);
        state.stats.best = Math.max(state.stats.best || 0, data.stats.best || 0);
        state.stats.bestStreak = Math.max(state.stats.bestStreak || 0, data.stats.bestStreak || 0);
      }
      save();
      showToast(`Imported ${imported} card${imported === 1 ? "" : "s"}`);
      renderAll();
    } catch {
      showToast("Invalid JSON file");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

// ---------- Study session ----------
let sessionStart = null;
let timerInterval = null;

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min >= 60) {
    const hrs = Math.floor(min / 60);
    const m = min % 60;
    return `${hrs}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function startTimer() {
  sessionStart = Date.now();
  const tick = () => {
    if (els.sessionTimerEl) els.sessionTimerEl.textContent = "Elapsed time: " + formatTime(Date.now() - sessionStart);
  };
  tick();
  timerInterval = setInterval(tick, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startSession(ids) {
  if (!ids.length) return;
  session = { queue: shuffle(ids), index: 0, correct: 0, missed: [], streak: 0, bestStreak: 0 };
  sessionStart = null;
  stopTimer();
  els.studyEmpty.hidden = true;
  els.startBtn.hidden = true;
  els.results.hidden = true;
  els.studyArea.hidden = false;
  showCard();
  startTimer();
}

function currentCard() {
  return state.cards.find((c) => c.id === session.queue[session.index]);
}

function showCard() {
  const card = currentCard();
  els.flashcard.classList.remove("flipped");
  els.grade.hidden = true;
  // Wait for the flip-back animation before swapping text so the answer isn't revealed
  setTimeout(() => {
    els.cardFront.textContent = card.front;
    els.cardBack.textContent = card.back;
  }, els.cardFront.textContent ? 200 : 0);
  const total = session.queue.length;
  els.progressText.textContent = `Card ${session.index + 1} of ${total} · Streak: ${session.streak} 🔥`;
  els.progressBar.style.width = `${(session.index / total) * 100}%`;
}

function flip() {
  if (!session || els.studyArea.hidden) return;
  els.flashcard.classList.toggle("flipped");
  if (els.flashcard.classList.contains("flipped")) els.grade.hidden = false;
}

function grade(gotIt) {
  const card = currentCard();
  if (gotIt) {
    session.correct++;
    session.streak++;
    session.bestStreak = Math.max(session.bestStreak, session.streak);
    card.rightInARow++;
    if (card.rightInARow === MASTERY_THRESHOLD) showToast("🏆 Card mastered!");
  } else {
    session.missed.push(card.id);
    session.streak = 0;
    card.rightInARow = 0;
  }
  save();
  session.index++;
  if (session.index >= session.queue.length) finishSession();
  else showCard();
  renderDeck();
  renderStats();
}

function finishSession() {
  const total = session.queue.length;
  const pct = Math.round((session.correct / total) * 100);
  const newBest = pct > state.stats.best;
  state.stats.sessions++;
  state.stats.best = Math.max(state.stats.best, pct);
  state.stats.bestStreak = Math.max(state.stats.bestStreak, session.bestStreak);
  save();

  stopTimer();
  els.progressBar.style.width = "100%";
  els.studyArea.hidden = true;
  els.results.hidden = false;
  els.scoreRing.style.setProperty("--pct", pct);
  els.scorePct.textContent = pct + "%";

  let msg;
  if (pct === 100) msg = "Perfect score! You know this deck cold. 🎉";
  else if (pct >= 80) msg = "Great work — just a few to review.";
  else if (pct >= 50) msg = "Solid progress. Retry the missed cards to lock them in.";
  else msg = "Keep going — repetition is how it sticks.";
  els.resultsTitle.textContent = newBest ? "New best score! 🏅" : "Session complete!";
  els.resultsMsg.textContent = `${session.correct} of ${total} correct. ${msg}`;

  els.retryMissedBtn.hidden = session.missed.length === 0;
  els.retryMissedBtn.textContent = `Retry missed (${session.missed.length})`;
}

function endSessionEarly() {
  stopTimer();
  session = null;
}

els.startBtn.addEventListener("click", () => startSession(state.cards.map((c) => c.id)));
els.restartBtn.addEventListener("click", () => startSession(state.cards.map((c) => c.id)));
els.retryMissedBtn.addEventListener("click", () => {
  const ids = session.missed.filter((id) => state.cards.some((c) => c.id === id));
  startSession(ids);
});
els.flashcard.addEventListener("click", flip);
els.rightBtn.addEventListener("click", () => grade(true));
els.wrongBtn.addEventListener("click", () => grade(false));

// ---------- Dark mode ----------
const DARK_KEY = "flashforge-dark";
const darkToggle = $("dark-toggle");

function applyDark(on) {
  document.body.classList.toggle("dark", on);
  darkToggle.textContent = on ? "☀️" : "🌙";
}

const darkOn = localStorage.getItem(DARK_KEY) === "true";
applyDark(darkOn);

darkToggle.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  applyDark(!isDark);
  localStorage.setItem(DARK_KEY, String(!isDark));
});

// Keyboard shortcuts: Space/Enter = flip, → or Y = got it, ← or N = missed
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  if (!session || els.studyArea.hidden) return;
  if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); }
  else if (!els.grade.hidden && (e.key === "ArrowRight" || e.key.toLowerCase() === "y")) grade(true);
  else if (!els.grade.hidden && (e.key === "ArrowLeft" || e.key.toLowerCase() === "n")) grade(false);
});

renderAll();
