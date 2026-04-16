// Shared quiz engine for all lessons

let cards = [], idx = 0, correct = 0, wrong = 0, accent = 0, answered = false, mistakes = [];
let _cfg = {};

// Shuffle an array in place (Fisher-Yates) and return it
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Switch between theory and quiz tabs
function showTab(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  btn.classList.add('active');
}

// Normalize input for comparison (strip punctuation, lowercase, optionally strip diacritics)
function _norm(s, keepAccents) {
  const re = new RegExp(_cfg.punctuationChars || '[¡!¿?]', 'g');
  let out = s.trim().replace(re, '').toLowerCase();
  if (!keepAccents) out = out.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return out;
}

function startQuiz() {
  cards = _cfg.buildCards();
  idx = 0; correct = 0; wrong = 0; accent = 0; mistakes = [];
  if (cards.length === 0) { renderEmpty(); return; }
  renderCard();
}

function updateProgress() {
  const pct = cards.length > 0 ? idx / cards.length * 100 : 0;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = idx + ' / ' + cards.length;
}

function renderEmpty() {
  updateProgress();
  document.getElementById('quizArea').innerHTML =
    '<div class="empty-filters">Brak pytań dla wybranych filtrów.</div>';
}

// Render the current quiz card
function renderCard() {
  updateProgress();
  const area = document.getElementById('quizArea');
  if (idx >= cards.length) { renderScore(); return; }
  answered = false;
  const c = cards[idx];
  const inputRow = _cfg.inputRow ||
    '<div class="input-row"><input type="text" id="ans" placeholder="wpisz odpowiedź…" autocomplete="off" autocorrect="off" spellcheck="false" /></div>';
  area.innerHTML = `
    <div class="card">
      <div class="card-number">${idx + 1} z ${cards.length}</div>
      <div class="prompt">${c.prompt}</div>
      <div class="hint">${c.hint}</div>
      ${inputRow}
      <div class="feedback" id="fb"></div>
      <div class="btn-row">
        <button class="btn-check" id="btnCheck" onclick="checkAnswer()">Sprawdź</button>
        <button class="btn-skip" onclick="skipCard()">Pomiń</button>
      </div>
    </div>`;
  document.getElementById('ans').focus();
}

window.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const inp = document.getElementById('ans');
    if (inp) {
      if (!answered) checkAnswer();
      else nextCard();
    } else {
      const btnRestart = document.querySelector('.btn-restart');
      if (btnRestart) startQuiz();
    }
  }
});

// Check answer and prepare next step
function checkAnswer() {
  if (answered) return;
  answered = true;
  const c = cards[idx];
  const inp = document.getElementById('ans');
  const fb  = document.getElementById('fb');
  document.getElementById('btnCheck').style.display = 'none';
  const exactOk  = _norm(inp.value, true)  === _norm(c.answer, true);
  const accentOk = _norm(inp.value, false) === _norm(c.answer, false);
  const fmt = _cfg.formatAnswer ? _cfg.formatAnswer(c.answer) : c.answer;
  if (exactOk) {
    correct++; inp.classList.add('correct');
    fb.textContent = '✓ Brawo!'; fb.className = 'feedback correct';
  } else if (accentOk) {
    // Content correct but missing/wrong accents
    accent++;
    inp.classList.add('accent-missing');
    fb.innerHTML = `~ Treść poprawna, ale brakuje akcentów: <strong style="color:var(--correct)">${fmt}</strong>`;
    fb.className = 'feedback accent-missing';
    mistakes.push({ prompt: c.prompt, user: inp.value, correct: c.answer, type: 'accent' });
  } else {
    wrong++; inp.classList.add('wrong');
    fb.innerHTML = `✗ Poprawna forma: <strong style="color:var(--correct)">${fmt}</strong>`;
    fb.className = 'feedback wrong';
    mistakes.push({ prompt: c.prompt, user: inp.value || '(brak)', correct: c.answer, type: 'wrong' });
  }
  inp.disabled = true;
  document.querySelector('.btn-row').insertAdjacentHTML('afterbegin',
    `<button class="btn-next" onclick="nextCard()">Dalej →</button>`);
}

function skipCard() {
  if (answered) return;
  answered = true; wrong++;
  const c = cards[idx];
  const inp = document.getElementById('ans');
  inp.disabled = true;
  const fb = document.getElementById('fb');
  const fmt = _cfg.formatAnswer ? _cfg.formatAnswer(c.answer) : c.answer;
  fb.innerHTML = `${_cfg.skipLabel || 'Odpowiedź'}: <strong style="color:var(--gold)">${fmt}</strong>`;
  fb.className = 'feedback wrong';
  mistakes.push({ prompt: c.prompt, user: '(pominięto)', correct: c.answer, type: 'wrong' });
  document.getElementById('btnCheck').style.display = 'none';
  document.querySelector('.btn-row').insertAdjacentHTML('afterbegin',
    `<button class="btn-next" onclick="nextCard()">Dalej →</button>`);
}

function nextCard() { idx++; renderCard(); }

// Final results screen
function renderScore() {
  const total = cards.length;
  const pct = Math.round((correct + accent * 0.5) / total * 100);
  const msgs = _cfg.scoreMessages || {};
  const msg = pct === 100 ? (msgs.perfect || '¡Perfecto!') :
              pct >= 80  ? (msgs.great   || 'Świetnie! Prawie bezbłędnie.') :
              pct >= 60  ? (msgs.ok      || 'Dobrze, ale warto jeszcze poćwiczyć!') :
                           (msgs.bad     || 'Warto poćwiczyć jeszcze raz!');
  const accentStat = accent > 0
    ? `<div class="stat"><div class="stat-val accent">${accent}</div><div class="stat-lbl">Bez akcentów</div></div>`
    : '';

  let mistakesHtml = '';
  if (mistakes.length > 0) {
    mistakesHtml = `
      <div class="mistakes-list">
        <div class="mistakes-title">Twoje potknięcia:</div>
        ${mistakes.map(m => {
          const fmt = _cfg.formatAnswer ? _cfg.formatAnswer(m.correct) : m.correct;
          return `
          <div class="mistake-item">
            <div class="mistake-prompt">${m.prompt}</div>
            <div class="mistake-details">
              <span class="mistake-val user">${m.user}</span>
              <span class="mistake-val ${m.type}">${fmt}</span>
            </div>
          </div>`;
        }).join('')}
      </div>`;
  }

  document.getElementById('progressFill').style.width = '100%';
  document.getElementById('progressText').textContent = total + ' / ' + total;
  document.getElementById('quizArea').innerHTML = `
    <div class="score-screen">
      <div class="score-big">${pct}%</div>
      <div class="score-label">Wynik końcowy</div>
      <div class="stats">
        <div class="stat"><div class="stat-val good">${correct}</div><div class="stat-lbl">Poprawnie</div></div>
        ${accentStat}
        <div class="stat"><div class="stat-val bad">${wrong}</div><div class="stat-lbl">Błędy</div></div>
        <div class="stat"><div class="stat-val">${total}</div><div class="stat-lbl">Razem</div></div>
      </div>
      <div class="score-msg">${msg}</div>
      <button class="btn-restart" onclick="startQuiz()">Jeszcze raz ↺</button>
      ${mistakesHtml}
    </div>`;
}

// Initialize the quiz engine with lesson-specific configuration
function initQuizEngine(config) {
  _cfg = config;
}
