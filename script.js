// ── Theme Toggle ──
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-btn').textContent = isDark ? '🌙 Dark' : '☀️ Light';
}

// ── Page Router ──
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(a => {
    if (a.getAttribute('onclick') && a.getAttribute('onclick').includes(`'${id}'`)) {
      a.classList.add('active');
    }
  });
}

// ── Utility: pad number ──
const pad = n => String(n).padStart(2, '0');

// CLOCK (home + dedicated page)
function updateClock() {
  const t = new Date();
  const timeStr = `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
  const dayStr  = t.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = t.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Home
  document.getElementById('home-time').textContent = timeStr;
  document.getElementById('home-day').textContent  = dayStr;

  // Clock page
  document.getElementById('clock-display').textContent  = timeStr;
  document.getElementById('clock-day-name').textContent = dayStr.toUpperCase();
  document.getElementById('clock-date').textContent     = dateStr;
}
updateClock();
setInterval(updateClock, 1000);

// STOPWATCH
let swSec = 0, swMin = 0, swHr = 0;
let swInterval = null;
let lapCount = 0;

function swTick() {
  swSec++;
  if (swSec === 60) { swSec = 0; swMin++; }
  if (swMin === 60) { swMin = 0; swHr++; }
  document.getElementById('sw-display').textContent =
    `${pad(swHr)}:${pad(swMin)}:${pad(swSec)}`;
}

function swStart() {
  if (!swInterval) swInterval = setInterval(swTick, 1000);
}

function swStop() {
  clearInterval(swInterval);
  swInterval = null;
}

function swLap() {
  if (swInterval || swSec || swMin || swHr) {
    lapCount++;
    const item = document.createElement('div');
    item.className = 'lap-item';
    item.innerHTML = `<span>Lap ${lapCount}</span>
      <span>${pad(swHr)}:${pad(swMin)}:${pad(swSec)}</span>`;
    document.getElementById('sw-laps').prepend(item);
  }
}

function swReset() {
  swStop();
  swSec = swMin = swHr = lapCount = 0;
  document.getElementById('sw-display').textContent = '00:00:00';
  document.getElementById('sw-laps').innerHTML = '';
}

// CALCULATOR
let calcState = { current: '0', expr: '', hasResult: false };

function calcRender() {
  const el = document.getElementById('calc-result');
  el.textContent = calcState.current;
  el.style.fontSize = calcState.current.length > 9 ? '1.5rem' : '2.4rem';
  document.getElementById('calc-expr').textContent = calcState.expr;
}

function calcNum(n) {
  if (calcState.hasResult) { calcState.current = n; calcState.hasResult = false; }
  else calcState.current = calcState.current === '0' ? n : calcState.current + n;
  calcRender();
}

function calcDot() {
  if (calcState.hasResult) { calcState.current = '0.'; calcState.hasResult = false; calcRender(); return; }
  if (!calcState.current.includes('.')) { calcState.current += '.'; calcRender(); }
}

function calcOp(op) {
  calcState.expr = calcState.current + ' ' + op;
  calcState.current = '0';
  calcState.hasResult = false;
  calcRender();
}

function calcEquals() {
  if (!calcState.expr) return;
  try {
    const full = calcState.expr + ' ' + calcState.current;
    const res  = Function('"use strict"; return (' + full + ')')();
    const str  = parseFloat(res.toFixed(10)).toString();
    calcState.expr    = full + ' =';
    calcState.current = str;
    calcState.hasResult = true;
  } catch {
    calcState.current = 'Error';
  }
  calcRender();
}

function calcClear() {
  calcState = { current: '0', expr: '', hasResult: false };
  calcRender();
}

function calcSign() {
  if (calcState.current !== '0') {
    calcState.current = calcState.current.startsWith('-')
      ? calcState.current.slice(1)
      : '-' + calcState.current;
    calcRender();
  }
}

function calcPercent() {
  calcState.current = String(parseFloat(calcState.current) / 100);
  calcRender();
}

// TODO LIST
let todos = [];
let todoId = 0;

function addTodo() {
  const input = document.getElementById('todo-input');
  const text  = input.value.trim();
  if (!text) return;
  todos.push({ id: todoId++, text, done: false });
  input.value = '';
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  renderTodos();
}

function clearDone() {
  todos = todos.filter(t => !t.done);
  renderTodos();
}

function renderTodos() {
  const list = document.getElementById('todo-list');
  list.innerHTML = todos.map(t => `
    <li class="todo-item ${t.done ? 'done' : ''}" id="ti-${t.id}">
      <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTodo(${t.id})" />
      <label onclick="toggleTodo(${t.id})">${t.text}</label>
      <button class="todo-del" onclick="deleteTodo(${t.id})">✕</button>
    </li>`).join('');
  const done = todos.filter(t => t.done).length;
  document.getElementById('todo-count').textContent =
    `${todos.length} task${todos.length !== 1 ? 's' : ''} · ${done} done`;
}

// FORM VALIDATION
function setFG(id, state, msg) {
  const fg = document.getElementById('fg-' + id);
  fg.className = 'form-group ' + state;
  document.getElementById('h-' + id).textContent = msg;
}

function validateUsername() {
  const v = document.getElementById('f-username').value;
  if (v.length === 0)        setFG('username', '', '');
  else if (v.length < 4)     setFG('username', 'error', 'At least 4 characters required.');
  else if (/\s/.test(v))     setFG('username', 'error', 'No spaces allowed.');
  else                       setFG('username', 'ok', 'Looks good!');
}

function validateEmail() {
  const v = document.getElementById('f-email').value;
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  if (!v) setFG('email', '', '');
  else if (ok) setFG('email', 'ok', 'Valid email.');
  else         setFG('email', 'error', 'Enter a valid email address.');
}

function validatePassword() {
  const v = document.getElementById('f-password').value;
  let score = 0;
  if (v.length >= 8)       score++;
  if (/[A-Z]/.test(v))     score++;
  if (/[0-9]/.test(v))     score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;

  const fill = document.getElementById('strength-fill');
  const pct  = score * 25;
  fill.style.width = pct + '%';
  fill.style.background = ['#444','#c55','#b8831a','#8a7020','#6b4f10'][score];

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  if (!v) { setFG('password', '', ''); fill.style.width = '0'; }
  else if (v.length < 8) setFG('password', 'error', 'At least 8 characters required.');
  else setFG('password', score < 2 ? 'error' : 'ok', labels[score] + ' password');

  validateConfirm();
}

function validateConfirm() {
  const pass = document.getElementById('f-password').value;
  const conf = document.getElementById('f-confirm').value;
  if (!conf) { setFG('confirm', '', ''); return; }
  if (conf === pass) setFG('confirm', 'ok', 'Passwords match!');
  else               setFG('confirm', 'error', 'Passwords do not match.');
}

function validateRole() {
  const v = document.getElementById('f-role').value;
  if (!v) setFG('role', 'error', 'Please select a role.');
  else    setFG('role', 'ok', 'Got it!');
}

function submitForm() {
  validateUsername();
  validateEmail();
  validatePassword();
  validateConfirm();
  validateRole();

  const errors = document.querySelectorAll('#validation .form-group.error');
  const empties = [...document.querySelectorAll('#validation .form-group')]
    .filter(fg => !fg.classList.contains('ok') && !fg.classList.contains('error'));

  const msg = document.getElementById('form-msg');
  if (errors.length || empties.length) {
    msg.style.color = '#f88';
    msg.textContent = 'Please fix the errors above before submitting.';
  } else {
    msg.style.color = 'var(--accent)';
    msg.textContent = '🎉 Registration successful! Welcome aboard.';
  }
}

// ── Set home as active link on load ──
document.querySelector('.nav-links a').classList.add('active');