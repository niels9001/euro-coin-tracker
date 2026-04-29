import { COUNTRIES, DENOMINATIONS, TOTAL_COINS, flagUrl } from './data.js';
import { coinSVG } from './coins.js';
import {
  loadState, saveState, defaultState, mergeWithDefault,
  getToken, setToken, getGistId, setGistId,
} from './storage.js';
import { testToken, createGist, fetchGist, pushGist, findExistingGist, debounce } from './gist-sync.js';

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
  flag.innerHTML = `<img src="${flagUrl(country.code)}" alt="Vlag ${country.nl}" loading="lazy" decoding="async">`;
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

const MOBILE_MQ = window.matchMedia('(max-width: 599px)');
const SELECTED_KEY = 'euro-coins-selected-v1';
let selectedCode = localStorage.getItem(SELECTED_KEY) || COUNTRIES[0].code;

function setSelected(code) {
  selectedCode = code;
  localStorage.setItem(SELECTED_KEY, code);
}

function render() {
  album.innerHTML = '';
  const eurozone = COUNTRIES.filter(c => c.eurozone);
  const others = COUNTRIES.filter(c => !c.eurozone);

  if (MOBILE_MQ.matches) {
    const c = COUNTRIES.find(x => x.code === selectedCode) || COUNTRIES[0];
    album.appendChild(renderCountry(c));
    updatePageTitle();
  } else {
    appendGroup(eurozone, null);
    if (others.length) appendGroup(others, 'Niet-eurozone landen');
    document.getElementById('page-title').textContent = 'Euromunten verzameling';
  }
  renderProgress();
  renderDrawer();
}

function appendGroup(list, heading) {
  if (heading) {
    const h = document.createElement('h2');
    h.className = 'group-heading';
    h.textContent = heading;
    album.appendChild(h);
  }
  const grid = document.createElement('div');
  grid.className = 'album-grid';
  for (const c of list) grid.appendChild(renderCountry(c));
  album.appendChild(grid);
}

function updatePageTitle() {
  const c = COUNTRIES.find(x => x.code === selectedCode) || COUNTRIES[0];
  document.getElementById('page-title').innerHTML = `<img class="title-flag" src="${flagUrl(c.code)}" alt=""> ${c.nl}`;
}

function renderDrawer() {
  const list = document.getElementById('drawer-list');
  list.innerHTML = '';
  const eurozone = COUNTRIES.filter(c => c.eurozone);
  const others = COUNTRIES.filter(c => !c.eurozone);
  appendDrawerGroup(list, eurozone, null);
  if (others.length) appendDrawerGroup(list, others, 'Niet-eurozone');
}

function appendDrawerGroup(list, items, heading) {
  if (heading) {
    const h = document.createElement('div');
    h.className = 'drawer-group-heading';
    h.textContent = heading;
    list.appendChild(h);
  }
  for (const c of items) {
    const n = countCountry(c.code);
    const total = DENOMINATIONS.length;
    const btn = document.createElement('button');
    btn.className = 'drawer-item' + (c.code === selectedCode ? ' active' : '') + (n === total ? ' complete' : '');
    btn.dataset.code = c.code;
    btn.innerHTML = `
      <span class="drawer-item-flag"><img src="${flagUrl(c.code)}" alt=""></span>
      <span class="drawer-item-name">${c.nl}</span>
      <span class="drawer-item-progress">(${n}/${total})</span>
    `;
    btn.addEventListener('click', () => {
      setSelected(c.code);
      closeDrawer();
      render();
    });
    list.appendChild(btn);
  }
}

function updateDrawerCountry(code) {
  const item = document.querySelector(`.drawer-item[data-code="${code}"]`);
  if (!item) return;
  const n = countCountry(code);
  const total = DENOMINATIONS.length;
  item.querySelector('.drawer-item-progress').textContent = `(${n}/${total})`;
  item.classList.toggle('complete', n === total);
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
  updateDrawerCountry(code);
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
  const t = patInput.value.trim();
  let g = gistInput.value.trim();
  setToken(t);

  // Als token ingevuld maar Gist-ID leeg: probeer automatisch te vinden
  if (t && !g) {
    setMsg('Geen Gist-ID — zoeken naar bestaande euro-coins.json…');
    try {
      const found = await findExistingGist(t);
      if (found) {
        g = found;
        gistInput.value = g;
        setMsg(`✓ Bestaande Gist gevonden: ${g}`, 'ok');
      } else {
        setMsg('Geen Gist gevonden. Klik op "Nieuwe Gist aanmaken" of plak handmatig een Gist-ID.', 'err');
        return; // dialog open laten zodat user kan reageren
      }
    } catch (e) {
      setMsg('✗ ' + e.message, 'err');
      return;
    }
  }

  setGistId(g);
  dlg.close();
  await initialPull();
});

// ---------- Drawer (mobiel) ----------
const drawer = $('drawer');
const drawerBackdrop = $('drawer-backdrop');
const menuBtn = $('menu-btn');

function openDrawer() {
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  drawerBackdrop.hidden = false;
  menuBtn.setAttribute('aria-expanded', 'true');
}
function closeDrawer() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  drawerBackdrop.hidden = true;
  menuBtn.setAttribute('aria-expanded', 'false');
}
menuBtn.addEventListener('click', () => {
  drawer.classList.contains('open') ? closeDrawer() : openDrawer();
});
drawerBackdrop.addEventListener('click', closeDrawer);
$('drawer-close').addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

// Re-render bij wisselen tussen mobiel en desktop
MOBILE_MQ.addEventListener('change', () => { closeDrawer(); render(); });

// ---------- Boot ----------
render();
initialPull();
