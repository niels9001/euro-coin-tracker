# Euromunten verzameling

Een eenvoudige, responsive web-app om bij te houden welke euromunten je verzameld hebt — per land en per denominatie. Geïnspireerd op een fysieke verzamelmap, met donkerblauwe achtergrond en gouden accenten.

- 25 landen, 8 munten per land = 200 munten totaal
- Werkt op telefoon, tablet en desktop
- Geen account, geen build step — pure HTML/CSS/JS
- Optionele sync tussen apparaten via een **privé GitHub Gist** (alleen jij ziet 'm)

## Lokaal proberen

Open `index.html` met een lokaal webservertje (modules werken niet via `file://`):

```powershell
# Vanuit de projectmap
python -m http.server 8000
# of
npx serve .
```

Ga naar http://localhost:8000.

## Deployen op GitHub Pages

1. Push deze map naar een GitHub-repo (bv. `euro-coin-tracker`).
2. In de repo: **Settings → Pages**.
3. Source: **Deploy from a branch**, branch: `main`, folder: `/ (root)`.
4. Na een minuut staat de app op `https://<jouw-username>.github.io/euro-coin-tracker/`.

> Het bestand `.nojekyll` zorgt ervoor dat GitHub Pages niet door Jekyll wordt verwerkt.

## Sync tussen apparaten (optioneel)

Standaard wordt alles in de browser opgeslagen (`localStorage`). Wil je sync tussen telefoon, tablet en pc, gebruik dan een **GitHub Gist** als opslag:

### 1. Personal Access Token aanmaken

- Ga naar https://github.com/settings/tokens?type=beta (Fine-grained PAT) of https://github.com/settings/tokens (classic).
- **Classic** is het simpelst: kies scope **`gist`** (en niets anders).
- Kopieer het token (`ghp_…`) — je ziet 'm maar één keer.

### 2. In de app

1. Klik rechtsboven op ⚙ (instellingen).
2. Plak je token.
3. Klik **"Verbinding testen"** om te checken.
4. Klik **"Nieuwe Gist aanmaken"** — er verschijnt een Gist-ID.
5. Klik **"Opslaan & sluiten"**.

### 3. Op een tweede apparaat

1. Open dezelfde URL.
2. Open ⚙, plak hetzelfde token én de **Gist-ID** uit stap 4 hierboven.
3. Klik **"Opslaan & sluiten"** — de app haalt je verzameling op.

### Hoe veilig is dit?

Het token wordt licht "obfuscated" in `localStorage` opgeslagen — dit is **geen echte security**. Wie toegang heeft tot je apparaat/browser kan het token uitlezen. Aanrader: maak een token met **alleen** de scope `gist` (geen toegang tot je code).

## Bestanden

```
index.html       Hoofdpagina + settings-modal
styles.css       Albumstijl (donkerblauw + goud), responsive
app.js           Bootstrap + UI + sync-orchestratie
data.js          Landenlijst en denominaties
coins.js         Generieke SVG-munten in 4 kleurklassen
storage.js       localStorage helpers (state, token, gist-id)
gist-sync.js     GitHub Gist API client + debounce helper
.nojekyll        GitHub Pages: skip Jekyll
```

## Licentie

Persoonlijk gebruik. Doe ermee wat je wilt.
