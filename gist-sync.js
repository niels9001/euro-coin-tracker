import { mergeWithDefault } from './storage.js';

const FILENAME = 'euro-coins.json';
const API = 'https://api.github.com';

async function ghFetch(path, token, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`GitHub API ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

export async function testToken(token) {
  const u = await ghFetch('/user', token);
  return u.login;
}

export async function findExistingGist(token) {
  // Zoekt door de eigen gists naar een bestand met naam euro-coins.json
  const data = await ghFetch('/gists?per_page=100', token);
  if (!Array.isArray(data)) return null;
  const match = data.find(g => g.files && g.files[FILENAME]);
  return match ? match.id : null;
}

export async function createGist(token, state) {
  const body = {
    description: 'Euro coin tracker state',
    public: false,
    files: { [FILENAME]: { content: JSON.stringify(state, null, 2) } },
  };
  const data = await ghFetch('/gists', token, { method: 'POST', body: JSON.stringify(body) });
  return data.id;
}

export async function fetchGist(token, gistId) {
  const data = await ghFetch(`/gists/${gistId}`, token);
  const file = data.files?.[FILENAME];
  if (!file) throw new Error(`Bestand ${FILENAME} niet gevonden in Gist`);
  let content = file.content;
  if (file.truncated && file.raw_url) {
    content = await fetch(file.raw_url).then(r => r.text());
  }
  const parsed = JSON.parse(content);
  return mergeWithDefault(parsed);
}

export async function pushGist(token, gistId, state) {
  const body = { files: { [FILENAME]: { content: JSON.stringify(state, null, 2) } } };
  await ghFetch(`/gists/${gistId}`, token, { method: 'PATCH', body: JSON.stringify(body) });
}

// Simpele debounce helper
export function debounce(fn, ms) {
  let t = null;
  let pendingResolve = null;
  return (...args) => {
    if (t) clearTimeout(t);
    return new Promise((resolve) => {
      pendingResolve = resolve;
      t = setTimeout(async () => {
        t = null;
        const r = pendingResolve;
        pendingResolve = null;
        try { r(await fn(...args)); } catch (e) { r({ error: e }); }
      }, ms);
    });
  };
}
