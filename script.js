const tablesEl = document.querySelector('#tables');
const startBtn = document.querySelector('#start');
const gameEl = document.querySelector('#game');
const resultEl = document.querySelector('#result');
const settingsEl = document.querySelector('.settings');
const questionEl = document.querySelector('#question');
const answerForm = document.querySelector('#answer-form');
const answerEl = document.querySelector('#answer');
const feedbackEl = document.querySelector('#feedback');
const scoreEl = document.querySelector('#score');
const streakEl = document.querySelector('#streak');
const currentEl = document.querySelector('#current');
const totalEl = document.querySelector('#total');
const progressBar = document.querySelector('#progress-bar');
const hintBtn = document.querySelector('#hint');
const nextBtn = document.querySelector('#next');
const stopBtn = document.querySelector('#stop');
const againBtn = document.querySelector('#again');
const changeBtn = document.querySelector('#change');
const resultText = document.querySelector('#result-text');
const starsEl = document.querySelector('#stars');
const shuffleEl = document.querySelector('#shuffle');
const autoNextEl = document.querySelector('#auto-next');
const keypadEl = document.querySelector('.keypad');

let mode = 'practice';
let tasks = [];
let taskIndex = 0;
let score = 0;
let streak = 0;
let currentTask = null;
let answered = false;
let nextTimer = null;
let lastSelection = [1, 2, 3, 4, 5];

function createTableChoices() {
  for (let i = 1; i <= 10; i++) {
    const label = document.createElement('label');
    label.className = 'table-choice';
    label.innerHTML = `
      <input type="checkbox" value="${i}" ${i <= 5 ? 'checked' : ''}>
      <span>${i}er</span>
    `;
    tablesEl.appendChild(label);
  }
}

function selectedTables() {
  return [...tablesEl.querySelectorAll('input:checked')].map(input => Number(input.value));
}

function setTables(numbers) {
  tablesEl.querySelectorAll('input').forEach(input => {
    input.checked = numbers.includes(Number(input.value));
  });
}

function buildTasks() {
  const chosen = selectedTables();
  if (chosen.length === 0) {
    setTables(lastSelection.length ? lastSelection : [1, 2, 3, 4, 5]);
    return buildTasks();
  }

  lastSelection = chosen;
  const generated = [];
  chosen.forEach(a => {
    for (let b = 1; b <= 10; b++) generated.push({ a, b });
  });

  if (shuffleEl.checked) shuffle(generated);
  return mode === 'quiz' ? generated.slice(0, 10) : generated;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startGame() {
  clearTimeout(nextTimer);
  tasks = buildTasks();
  taskIndex = 0;
  score = 0;
  streak = 0;
  answered = false;

  settingsEl.classList.add('hidden');
  resultEl.classList.add('hidden');
  gameEl.classList.remove('hidden');
  totalEl.textContent = tasks.length;
  updateStats();
  showTask();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showTask() {
  clearTimeout(nextTimer);
  currentTask = tasks[taskIndex];
  answered = false;
  questionEl.textContent = `${currentTask.a} × ${currentTask.b}`;
  currentEl.textContent = taskIndex + 1;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
  answerEl.value = '';
  answerEl.disabled = false;
  nextBtn.classList.add('hidden');
  updateProgress();
  answerEl.focus({ preventScroll: true });
}

function updateStats() {
  scoreEl.textContent = score;
  streakEl.textContent = streak;
}

function updateProgress() {
  const percent = tasks.length ? ((taskIndex) / tasks.length) * 100 : 0;
  progressBar.style.width = `${percent}%`;
}

function checkAnswer(event) {
  if (event) event.preventDefault();
  if (answered) {
    nextTask();
    return;
  }

  const raw = answerEl.value.trim();
  const userAnswer = Number(raw);
  const correctAnswer = currentTask.a * currentTask.b;

  if (!Number.isFinite(userAnswer) || raw === '') {
    feedbackEl.textContent = 'Gib eine Zahl ein 🙂';
    feedbackEl.className = 'feedback bad';
    return;
  }

  answered = true;
  answerEl.disabled = true;

  if (userAnswer === correctAnswer) {
    score++;
    streak++;
    feedbackEl.textContent = randomPraise();
    feedbackEl.className = 'feedback good';
    if (autoNextEl.checked) {
      nextTimer = setTimeout(nextTask, 850);
    } else {
      nextBtn.classList.remove('hidden');
      nextBtn.focus({ preventScroll: true });
    }
  } else {
    streak = 0;
    feedbackEl.textContent = `Fast! Richtig ist ${correctAnswer}. Tippe OK für weiter.`;
    feedbackEl.className = 'feedback bad';
    nextBtn.classList.remove('hidden');
    nextBtn.focus({ preventScroll: true });
  }

  updateStats();
}

function nextTask() {
  clearTimeout(nextTimer);
  if (taskIndex < tasks.length - 1) {
    taskIndex++;
    showTask();
  } else {
    finishGame();
  }
}

function finishGame() {
  clearTimeout(nextTimer);
  progressBar.style.width = '100%';
  gameEl.classList.add('hidden');
  resultEl.classList.remove('hidden');

  const percent = Math.round((score / tasks.length) * 100);
  resultText.textContent = `Du hast ${score} von ${tasks.length} Aufgaben richtig gelöst. Das sind ${percent}%.`;

  const starCount = percent >= 90 ? 5 : percent >= 75 ? 4 : percent >= 55 ? 3 : percent >= 35 ? 2 : 1;
  starsEl.textContent = '⭐'.repeat(starCount);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showHint() {
  if (!currentTask || answered) return;
  const { a, b } = currentTask;
  const smaller = Math.min(a, b);
  const bigger = Math.max(a, b);
  feedbackEl.textContent = `Tipp: ${Array(smaller).fill(bigger).join(' + ')} = ?`;
  feedbackEl.className = 'feedback';
}

function randomPraise() {
  const phrases = [
    'Super! 🎉',
    'Klasse! ⭐',
    'Richtig! 💪',
    'Sehr gut! 🌈',
    'Prima! 🚀'
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

function resetToSettings() {
  clearTimeout(nextTimer);
  gameEl.classList.add('hidden');
  resultEl.classList.add('hidden');
  settingsEl.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function pressKey(key) {
  if (key === 'enter') {
    checkAnswer();
    return;
  }

  if (answered) return;

  if (key === 'clear') {
    answerEl.value = answerEl.value.slice(0, -1);
    answerEl.focus({ preventScroll: true });
    return;
  }

  if (/^\d$/.test(key) && answerEl.value.length < 3) {
    answerEl.value += key;
    answerEl.focus({ preventScroll: true });
  }
}

createTableChoices();

document.querySelectorAll('.mode').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.mode').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    mode = button.dataset.mode;
  });
});

tablesEl.addEventListener('change', () => {
  const chosen = selectedTables();
  if (chosen.length) lastSelection = chosen;
});

document.querySelector('#select-all').addEventListener('click', () => setTables([1,2,3,4,5,6,7,8,9,10]));
document.querySelector('#select-small').addEventListener('click', () => setTables([1,2,3,4,5]));
document.querySelector('#select-large').addEventListener('click', () => setTables([6,7,8,9,10]));
document.querySelector('#clear').addEventListener('click', () => setTables([]));

startBtn.addEventListener('click', startGame);
answerForm.addEventListener('submit', checkAnswer);
nextBtn.addEventListener('click', nextTask);
hintBtn.addEventListener('click', showHint);
stopBtn.addEventListener('click', resetToSettings);
againBtn.addEventListener('click', startGame);
changeBtn.addEventListener('click', resetToSettings);

keypadEl.addEventListener('click', event => {
  const button = event.target.closest('button[data-key]');
  if (!button) return;
  pressKey(button.dataset.key);
});

answerEl.addEventListener('input', () => {
  // Echte Tastatureingaben sollen vom Browser selbst verarbeitet werden.
  // Wir bereinigen nur den Inhalt, damit keine Buchstaben oder zu lange Zahlen entstehen.
  answerEl.value = answerEl.value.replace(/\D/g, '').slice(0, 3);
});

document.addEventListener('keydown', event => {
  if (gameEl.classList.contains('hidden')) return;

  const answerIsFocused = document.activeElement === answerEl;

  if (event.key === 'Enter') {
    event.preventDefault();
    checkAnswer();
    return;
  }

  // Wenn das Eingabefeld fokussiert ist, übernimmt der Browser Zahlen und Löschen.
  // Sonst steuern wir die Eingabe über die gleichen Funktionen wie beim Bildschirm-Zahlenfeld.
  if (answerIsFocused) return;

  if (event.key === 'Backspace') {
    event.preventDefault();
    pressKey('clear');
  } else if (/^\d$/.test(event.key)) {
    event.preventDefault();
    pressKey(event.key);
  }
});
