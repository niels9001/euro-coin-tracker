import { COUNTRIES, DENOMINATIONS } from './data.js';

const STATE_KEY = 'euro-coins-state-v1';
const TOKEN_KEY = 'euro-coins-token-v1';
const GIST_KEY  = 'euro-coins-gist-v1';

export function defaultState() {
  const collected = {};
  for (const c of COUNTRIES) {
    collected[c.code] = {};
    for (const d of DENOMINATIONS) collected[c.code][d.id] = false;
  }
  return { version: 1, updatedAt: new Date(0).toISOString(), collected };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return mergeWithDefault(parsed);
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  return state;
}

// Zorgt dat nieuwe landen/denominaties die later toegevoegd worden, defaults krijgen
export function mergeWithDefault(state) {
  const base = defaultState();
  if (!state || !state.collected) return base;
  for (const c of COUNTRIES) {
    if (!state.collected[c.code]) state.collected[c.code] = base.collected[c.code];
    for (const d of DENOMINATIONS) {
      if (typeof state.collected[c.code][d.id] !== 'boolean') {
        state.collected[c.code][d.id] = false;
      }
    }
  }
  return {
    version: 1,
    updatedAt: state.updatedAt || base.updatedAt,
    collected: state.collected,
  };
}

// Eenvoudige obfuscatie (geen echte security; gebruiker is zich bewust)
function obfuscate(s)   { return btoa(unescape(encodeURIComponent(s))); }
function deobfuscate(s) { try { return decodeURIComponent(escape(atob(s))); } catch { return ''; } }

export function getToken()        { const v = localStorage.getItem(TOKEN_KEY); return v ? deobfuscate(v) : ''; }
export function setToken(t)       { if (t) localStorage.setItem(TOKEN_KEY, obfuscate(t)); else localStorage.removeItem(TOKEN_KEY); }
export function getGistId()       { return localStorage.getItem(GIST_KEY) || ''; }
export function setGistId(id)     { if (id) localStorage.setItem(GIST_KEY, id); else localStorage.removeItem(GIST_KEY); }
