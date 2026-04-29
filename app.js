import { COUNTRIES, DENOMINATIONS, TOTAL_COINS } from './data.js';
import { coinSVG } from './coins.js';
import {
  loadState, saveState, defaultState, mergeWithDefault,
  getToken, setToken, getGistId, setGistId,
} from './storage.js';
import { testToken, createGist, fetchGist, pushGist, debounce } from './gist-sync.js';

let state = loadState();

const $ = (id) => document.getElementById(id);
const album = $('album');
const progressEl = $('progress');
const progressFill = $('progress-fill');
const syncStatus = $('sync-status');

function setSync(kind, title) {
  const map = { ok: '✓', warn: '⚠', busy: '🔄', err: '✗', off: '⚠' };
  syncStatus.textContent = map[kind] ?? '⚠';
  syncStatus.className = 'sync-status ' + kind;
  if (title) syncStatus.title = title;
}

function countCollected() {
  let n = 0;
  for (const c of COUNTRIES) for (const d of DENOMINATIONS) if (state.collected[c.code][d.id]) n++;
  return n;
}
function countCountry(code) {
  let n = 0;
  for (const d of DENOMINATIONS) if (state.collected[code][d.id]) n++;
  return n;
}

function renderProgress() {
  const n = countCollected();
  progressEl.textContent = `${n}/${TOTAL_COINS}`;
  progressFill.style.width = `${(n / TOTAL_COINS) * 100}%`;
}

function renderCoinButton(country, denom) {
  const collected = !!state.collected[country.code][denom.id];
  const btn = document.createElement('button');
  btn.className = 'coin-btn';
  btn.setAttribute('aria-pressed', String(collected));
  btn.setAttribute('aria-label', `${country.nl} ${denom.label} ${denom.sub} — ${collected ? 'verzameld' : 'nog niet verzameld'}`);
  btn.innerHTML = coinSVG(denom, collected);
  btn.addEventListener('click', () => toggleCoin(country.code, denom.id, btn));
  return btn;
}

function renderCountry(country) {
  const card = document.createElement('section');
  card.className = 'country';
  card.dataset.code = country.code;

  const prog = document.createElement('span');
  prog.className = 'country-progress';
  prog.textContent = `${countCountry(country.code)}/${DENOMINATIONS.length}`;
  card.appendChild(prog);

  const name = document.createElement('div');
  name.className = 'country-name';
  name.textContent = country.nl;
  card.appendChild(name);

  const native = document.createElement('div');
  native.className = 'country-native';
  native.textContent = country.native !== country.nl ? country.native : '';
  card.appendChild(native);

  const flag = document.createElement('div');
  flag.className = 'flag';
  flag.textContent = country.flag;
  card.appendChild(flag);

  const coins = document.createElement('div');
  coins.className = 'coins';
  for (const d of DENOMINATIONS) coins.appendChild(renderCoinButton(country, d));
  card.appendChild(coins);

  const iso = document.createElement('div');
  iso.className = 'iso-code';
  iso.textContent = country.code;
  card.appendChild(iso);

  return card;
}

function render() {
  album.innerHTML = '';
  for (const c of COUNTRIES) album.appendChild(renderCountry(c));
  renderProgress();
}

function updateCountryProgress(code) {
  const card = album.querySelector(`.country[data-code="${code}"]`);
  if (!card) return;
  card.querySelector('.country-progress').textContent = `${countCountry(code)}/${DENOMINATIONS.length}`;
}

function toggleCoin(code, denomId, btn) {
  state.collected[code][denomId] = !state.collected[code][denomId];
  saveState(state);
  // Update alleen de betreffende knop
  const denom = DENOMINATIONS.find(d => d.id === denomId);
  const collected = state.collected[code][denomId];
  btn.innerHTML = coinSVG(denom, collected);
  btn.setAttribute('aria-pressed', String(collected));
  updateCountryProgress(code);
  renderProgress();
  scheduleSync();
}

// ---------- Sync ----------

const debouncedPush = debounce(async (snapshot) => {
  const token = getToken();
  const gistId = getGistId();
  if (!token || !gistId) return { skipped: true };
  setSync('busy', 'Synchroniseren…');
  try {
    await pushGist(token, gistId, snapshot);
    setSync('ok', `Gesynced — ${new Date().toLocaleTimeString()}`);
    return { ok: true };
  } catch (e) {
    setSync('err', `Sync-fout: ${e.message}`);
    return { error: e };
  }
}, 1500);

function scheduleSync() {
  const token = getToken();
  const gistId = getGistId();
  if (!token || !gistId) { setSync('off', 'Niet gekoppeld aan Gist'); return; }
  // Snapshot meegeven zodat tussentijdse wijzigingen meegenomen worden
  debouncedPush(JSON.parse(JSON.stringify(state)));
}

async function initialPull() {
  const token = getToken();
  const gistId = getGistId();
  if (!token || !gistId) { setSync('off', 'Niet gekoppeld aan Gist'); return; }
  setSync('busy', 'Ophalen…');
  try {
    const remote = await fetchGist(token, gistId);
    const localUpdated = new Date(state.updatedAt).getTime();
    const remoteUpdated = new Date(remote.updatedAt).getTime();
    if (remoteUpdated > localUpdated) {
      state = mergeWithDefault(remote);
      saveState(state);
      render();
      setSync('ok', `Opgehaald uit Gist (${new Date(remote.updatedAt).toLocaleString()})`);
    } else if (localUpdated > remoteUpdated) {
      // Lokale data is nieuwer → push
      await pushGist(token, gistId, state);
      setSync('ok', 'Lokale wijzigingen gepusht');
    } else {
      setSync('ok', 'Synchroon');
    }
  } catch (e) {
    setSync('err', `Sync-fout: ${e.message}`);
  }
}

// ---------- Settings dialog ----------

const dlg = $('settings');
const patInput = $('pat-input');
const gistInput = $('gist-input');
const msg = $('settings-msg');

function setMsg(text, kind = '') {
  msg.textContent = text;
  msg.className = 'settings-msg ' + kind;
}

$('settings-btn').addEventListener('click', () => {
  patInput.value = getToken();
  gistInput.value = getGistId();
  setMsg('');
  dlg.showModal();
});

$('test-btn').addEventListener('click', async () => {
  const t = patInput.value.trim();
  if (!t) return setMsg('Vul eerst een token in.', 'err');
  setMsg('Testen…');
  try { const login = await testToken(t); setMsg(`✓ Verbonden als ${login}`, 'ok'); }
  catch (e) { setMsg('✗ ' + e.message, 'err'); }
});

$('create-gist-btn').addEventListener('click', async () => {
  const t = patInput.value.trim();
  if (!t) return setMsg('Vul eerst een token in.', 'err');
  setMsg('Gist aanmaken…');
  try {
    const id = await createGist(t, state);
    gistInput.value = id;
    setMsg(`✓ Gist aangemaakt: ${id}`, 'ok');
  } catch (e) { setMsg('✗ ' + e.message, 'err'); }
});

$('pull-btn').addEventListener('click', async () => {
  const t = patInput.value.trim();
  const g = gistInput.value.trim();
  if (!t || !g) return setMsg('Token en Gist-ID nodig.', 'err');
  setMsg('Ophalen…');
  try {
    const remote = await fetchGist(t, g);
    state = mergeWithDefault(remote);
    saveState(state);
    render();
    setMsg('✓ Opgehaald en toegepast', 'ok');
  } catch (e) { setMsg('✗ ' + e.message, 'err'); }
});

$('clear-btn').addEventListener('click', () => {
  setToken(''); setGistId('');
  patInput.value = ''; gistInput.value = '';
  setMsg('Token en Gist-ID gewist.', 'ok');
  setSync('off', 'Niet gekoppeld');
});

$('save-btn').addEventListener('click', async () => {
  setToken(patInput.value.trim());
  setGistId(gistInput.value.trim());
  dlg.close();
  await initialPull();
});

// ---------- Boot ----------
render();
initialPull();
