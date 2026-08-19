# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

F1 Horario LATAM — a single-page PWA showing the next Formula 1 race weekend schedule converted to the local time of 19 Latin American countries, plus circuit info and weather. Spanish-language UI. No build step, no framework, no package manager: the entire app is `index.html` (markup, Tailwind config, and all JS in one inline `<script>`), plus `sw.js` (service worker) and `manifest.json` (PWA manifest).

## Running / testing locally

There is no build/lint/test tooling in this repo (no `package.json`). To work on it:

- Open `index.html` directly in a browser, or serve the directory with any static file server (e.g. `npx serve .`) so the service worker and manifest resolve correctly relative to `/`.
- Service worker changes require a hard refresh / unregister to take effect — bump `CACHE_NAME` in `sw.js` (currently `f1-dashboard-v3`) when changing which assets are cached or fetch behavior, so returning clients pick up the new worker and drop the old cache.
- There are no automated tests. Verify changes manually in the browser (check both first-load skeleton state and cached/offline state).

## Deployment

Deployed to Cloudflare Pages (project `f1-horario`, account `enzocontacto1@gmail.com`) as a static site — no `wrangler.toml` or build command, just the static files in the repo root. Production domain: `f1-horario.com`. Pushing a branch produces a preview deployment at `https://<hash>.f1-horario.pages.dev`.

(`.wrangler/cache/` in the repo root references an older/unrelated project name — Pages project name and account here are per the note above, not that cache file.)

## Architecture

Everything lives in `index.html` under a single inline script, structured as:

- **Config/data constants** (top of script): `CONFIG` (cache TTLs, auto-refresh interval), `SESSION_NAMES`/`SESSION_ORDER` (race weekend session labels), `LATAM_COUNTRIES` (the 19 supported countries with IANA timezones), `CIRCUIT_DATA` (static per-circuit stats keyed by Jolpica `circuitId`), `WIKI_CIRCUIT_MAP` (circuitId → Wikipedia page title), `COUNTRY_NAME_MAP` (English country name → ISO code for flags).
- **Global `state` object**: current race, its sessions, selected country, countdown interval handle, weather data. There's no framework — rendering is done by directly setting `innerHTML`/`textContent` on elements looked up via the `$(id)` helper.
- **Data fetching** (all cached in `localStorage` with TTLs from `CONFIG.TTL`):
  - `fetchRace()` — next upcoming race from the Worker's `GET /next-race` (see "Push notifications" below — the Worker is the one that actually talks to Jolpica, cached 8h client-side on top of the Worker's own 8h cache).
  - `fetchCircuitImage()` — circuit photo from Wikipedia REST API, cached indefinitely (keyed per circuit, no TTL expiry).
  - `fetchWeather()` — forecast from wttr.in for the circuit's city, cached 4h, loaded lazily (500ms after initial render, non-blocking).
- **Render functions**: `renderRace()` is the main render entry point (populates race header, triggers circuit image/circuit info/schedule/countdown/weather); `renderSchedule()` draws the session list and highlights the next upcoming session; `renderCountryList()` draws the country-picker modal; `startCountdown()` runs a `setInterval` ticking every 60s.
- **Country detection**: `detectCountry()` uses the browser's IANA timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) to guess the country on first load, falling back to Argentina; the user's explicit choice is persisted in `localStorage` (`f1_selected_country`) and takes priority thereafter.
- **Auto-refresh**: `setupAutoRefresh()` polls every 60s and re-fetches race data once `CONFIG.AUTO_REFRESH` (8h) has elapsed since `f1_last_refresh`.
- **PWA/offline** (`sw.js`): cache-first for same-origin static assets with background revalidation; special-cased cache-first handling for `flagcdn.com`; explicitly bypasses the service worker for navigation requests (`request.mode === 'navigate'`) to avoid a Chrome-on-Android `ERR_FAILED` bug — see the comment in `sw.js` and the memory of that fix. Icons are otherwise `icon-192.png`/`icon-512.png`.

## Adding a new circuit

When F1 adds/changes a circuit, update two places in `index.html` together, keyed by the same Jolpica `circuitId`:
1. `CIRCUIT_DATA` — length, laps, turns, opened year, capacity, lap record + holder.
2. `WIKI_CIRCUIT_MAP` — the corresponding Wikipedia article title, used to fetch a circuit photo.

## Adding a new country

Add an entry to `LATAM_COUNTRIES` with `code` (ISO 3166-1 alpha-2, used for flag URLs and as the `localStorage` value), `name`, and IANA `timezone`.

## Backend Worker (`worker/`) — race data + push notifications

A separate Cloudflare Worker (not Pages Functions — Cron Triggers require a real Worker), same Cloudflare account as Pages (`enzocontacto1@gmail.com`). `WORKER_CONFIG` in `index.html` points at it. It does two things:

1. **Serves race data**: `GET /next-race` returns the next upcoming race (Jolpica-shaped JSON), cached in the `RACE_CACHE` KV namespace with an 8h TTL. The client's `fetchRace()` calls this instead of hitting Jolpica directly — Jolpica itself is only ever called by the Worker, at most a few times a day, however many people are loading the site. **This means the main dashboard now depends on this Worker being up**, not just the push feature — a deliberate trade-off (fewer calls to a shared free API) made over keeping the site fully static/self-contained.
2. **Sends push notifications**: 1 day before FP1, 1 hour before Qualifying, 1 hour before the Race.

**Two separate deployments, dev and production** — see the table in `worker/README.md`. `f1-push-worker-dev` (open CORS, used from Pages preview URLs while a branch is in progress) and `f1-push-worker-prod` (CORS locked to `https://f1-horario.com`). Each has its own KV namespaces and `VAPID_PRIVATE_KEY` secret, deployed with `wrangler deploy --env dev` / `--env production` — there's no no-env deploy. `WORKER_CONFIG.URL` in `index.html` must point at `-dev` while a branch is being tested and get flipped to `-prod` before merging to `main`. See `worker/README.md` for the full setup steps (VAPID keys, KV namespaces, secrets) if either ever needs to be redeployed from scratch.

- Client (`index.html`): `initPush()`/`subscribeToPush()` request Notification permission, create a `PushManager` subscription with the VAPID public key, and POST it to the Worker's `/subscribe` endpoint along with `state.selectedCountry` (used server-side to localize the FP1 notification's time). Re-POSTs on country change to keep that in sync. `sw.js` handles the `push` (show notification) and `notificationclick` (focus/open the app) events.
- Worker (`worker/src/index.js`): `fetch()` serves `/next-race` (GET), `/subscribe` and `/unsubscribe` (POST). Subscriptions live in the `SUBSCRIPTIONS` KV namespace, keyed by a SHA-256 hash of the endpoint. `/next-race` is open to any origin (public read-only data); `/subscribe`/`/unsubscribe` are restricted to `ALLOWED_ORIGIN` since they write data — see `corsHeaders()`. `scheduled()` runs every 5 minutes and calls the same `getNextRace()` the `/next-race` route uses, then for each rule in `NOTIFY_RULES` checks whether "now" just crossed `sessionTime - leadMs`; if so it sends to every stored subscription via `web-push` (using the `nodejs_compat` flag) and records a dedupe flag in the `SENT` KV namespace (`{season}-{round}:{tag}`, 7-day TTL) so overlapping cron ticks don't double-send. A 404/410 from a push send means the browser dropped that subscription, so the Worker deletes it from `SUBSCRIPTIONS`.
- iOS Safari only supports web push for a PWA installed to the home screen; `isIosNonStandalone()` on the client detects that and shows an explanatory alert instead of silently failing.
- Notification copy lives in `buildMessage()` in `worker/src/index.js` (server-authored, since the Worker is what actually sends the push) — keep it there, not duplicated in `sw.js`.

## Commit / PR conventions

Never reference Anthropic and/or Claude anywhere in this repo's history or output — no `Co-Authored-By: Claude`, no "Generated with Claude Code" footer, no mention in commit messages, PR descriptions, code comments, or committed docs. Commit messages follow the existing history's style: short, in Spanish, imperative (e.g. `Agregar DelzoCreative by DelzoCloud en el footer`).

## External APIs (no auth required)

- Jolpica F1 API (`api.jolpi.ca/ergast/f1`) — race/session schedule.
- Wikipedia REST API (`en.wikipedia.org/api/rest_v1`) — circuit images.
- wttr.in — weather forecast.
- flagcdn.com / flagpedia.net — country flag images.