// minutes, kept in localStorage so settings survive a reload
const MINUTES = { work: 25, break: 5 };
const saved = JSON.parse(localStorage.getItem('pomodoro') || '{}');
for (const k in MINUTES) if (Number.isInteger(saved[k]) && saved[k] >= 1 && saved[k] <= 180) MINUTES[k] = saved[k];

let phase = 'work';
let remaining = MINUTES[phase] * 60; // seconds left
let endAt = 0;                       // wall-clock target while running
let running = false;
let interval = 0;

const $phase = document.getElementById('phase');
const $time = document.getElementById('time');
const $toggle = document.getElementById('toggle');
const $work = document.getElementById('work');
const $break = document.getElementById('break');

function syncInputs() {
  $work.value = MINUTES.work;
  $break.value = MINUTES.break;
}

// the inputs are a trust boundary: clamp whatever the user types
function setDurations() {
  for (const [key, $el] of [['work', $work], ['break', $break]]) {
    const value = Number($el.value);
    MINUTES[key] = Number.isFinite(value) ? Math.min(180, Math.max(1, Math.round(value))) : MINUTES[key];
  }
  localStorage.setItem('pomodoro', JSON.stringify(MINUTES));
  syncInputs();
  if (!running) { remaining = MINUTES[phase] * 60; draw(); } // a running timer keeps its end time
}
$work.onchange = $break.onchange = setDurations;

const pad = n => String(n).padStart(2, '0');

function draw() {
  $time.textContent = `${pad(Math.floor(remaining / 60))}:${pad(remaining % 60)}`;
  $phase.textContent = phase === 'work' ? 'Work' : 'Break';
  $phase.classList.toggle('break', phase === 'break');
  $toggle.textContent = running ? 'Pause' : 'Start';
  document.title = `${$time.textContent} Â· ${$phase.textContent}`;
}

// created on the first click so the completion beep is not muted by autoplay rules
let audio;
function ensureAudio() {
  if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === 'suspended') audio.resume();
}

function beep() {
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.2, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.6);
  osc.connect(gain).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + 0.6);
}

function stop() {
  clearInterval(interval);
  running = false;
  $time.classList.remove('done');
}

function start() {
  if (running) return;
  ensureAudio();
  endAt = Date.now() + remaining * 1000;
  running = true;
  $time.classList.remove('done');
  interval = setInterval(tick, 200);
  draw();
}

function pause() {
  remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
  stop();
  draw();
}

function tick() {
  remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
  draw();
  if (remaining > 0) return;

  stop();
  beep();
  $time.classList.add('done');
  // switch phase but wait for the user to start it (no surprise auto-run)
  phase = phase === 'work' ? 'break' : 'work';
  remaining = MINUTES[phase] * 60;
  draw();
}

function reset() {
  stop();
  phase = 'work';
  remaining = MINUTES[phase] * 60;
  draw();
}

$toggle.onclick = () => (running ? pause() : start());
document.getElementById('reset').onclick = reset;

// space = start/pause (but not while typing in a duration field or on a focused button)
addEventListener('keydown', e => {
  if (e.code === 'Space' && !['INPUT', 'BUTTON'].includes(e.target.tagName)) { e.preventDefault(); running ? pause() : start(); }
});

// wall clock, top right â€” clicking it switches 12/24-hour, and it re-checks which backdrop should show
const $clock = document.getElementById('clock');
const $clockTime = document.getElementById('clockTime');
const $clockMode = document.getElementById('clockMode');
const $bg = document.getElementById('bg');
const LOOPS = { day: 'bg.mp4', night: 'city.mp4' };

let hour12 = localStorage.getItem('pomodoro-clock') === '12';
let clockFormat = makeClockFormat();

function makeClockFormat() {
  return new Intl.DateTimeFormat([], hour12
    ? { hour: 'numeric', minute: '2-digit', hour12: true }
    : { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
}

// sunrise/sunset for Kuala Lumpur, computed locally — no network, follows the seasons
const SUN_LAT = 3.139;
const SUN_LON = 101.687;
const SUN_TZ = 8 * 60; // Malaysia is UTC+8 year-round, no DST

// returns [sunrise, sunset] as minutes after 00:00 UTC on that Kuala Lumpur date
function sunTimes(date) {
  const kl = new Date(date.getTime() + SUN_TZ * 60000); // shift into KL wall time to pick the right day
  const dayOfYear = (Date.UTC(kl.getUTCFullYear(), kl.getUTCMonth(), kl.getUTCDate()) - Date.UTC(kl.getUTCFullYear(), 0, 0)) / 86400000;
  const decl = (-23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10))) * Math.PI / 180; // radians
  const lat = SUN_LAT * Math.PI / 180;
  const cosHa = Math.cos(90.833 * Math.PI / 180) / (Math.cos(lat) * Math.cos(decl)) - Math.tan(lat) * Math.tan(decl);
  const ha = Math.acos(Math.min(1, Math.max(-1, cosHa))) * 180 / Math.PI; // degrees
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // minutes
  const noon = 720 - 4 * SUN_LON - eot;
  return [noon - 4 * ha, noon + 4 * ha];
}

const toKlMinutes = m => ((Math.round(m + SUN_TZ) % 1440) + 1440) % 1440;

function isNight() {
  const now = new Date();
  const [sunrise, sunset] = sunTimes(now).map(toKlMinutes);
  const minutes = toKlMinutes(now.getUTCHours() * 60 + now.getUTCMinutes());
  return minutes < sunrise || minutes >= sunset;
}

function applyLoop() {
  const night = isNight();
  const src = night ? LOOPS.night : LOOPS.day;
  if ($bg.dataset.src === src) return;
  $bg.dataset.src = src;
  $bg.poster = night ? 'city.jpg' : 'bg.jpg';
  $bg.src = src;
  document.body.classList.toggle('night', night);
  $bg.play().catch(() => {});
}

function drawClock() {
  const now = clockFormat.format(new Date());
  $clockTime.textContent = hour12 ? now.replace(/(am|pm)$/i, m => m.toUpperCase()) : now;
  $clockMode.textContent = hour12 ? '12h' : '24h';
  applyLoop();
}

$clock.onclick = () => {
  hour12 = !hour12;
  localStorage.setItem('pomodoro-clock', hour12 ? '12' : '24');
  clockFormat = makeClockFormat();
  $clock.title = `Switch to ${hour12 ? '24' : '12'}-hour time`;
  drawClock();
};
$clock.title = `Switch to ${hour12 ? '24' : '12'}-hour time`;

drawClock();
setInterval(drawClock, 1000);

syncInputs();
draw();


