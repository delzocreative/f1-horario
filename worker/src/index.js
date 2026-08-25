// NOT `web-push`: it sends via Node's `https` module, which `nodejs_compat`
// doesn't polyfill on Workers (`https.request` throws "not implemented"),
// so every send failed silently. This one builds the payload with WebCrypto
// and ships it with a plain `fetch()`, which does work here.
import { buildPushPayload } from '@block65/webcrypto-web-push';

// Same LATAM country -> IANA timezone list as index.html's LATAM_COUNTRIES,
// trimmed to just what we need here (code + timezone). Keep in sync if
// countries are added/removed on the client.
const COUNTRY_TIMEZONES = {
  ar: 'America/Argentina/Buenos_Aires', bo: 'America/La_Paz', br: 'America/Sao_Paulo',
  cl: 'America/Santiago', co: 'America/Bogota', cr: 'America/Costa_Rica',
  cu: 'America/Havana', ec: 'America/Guayaquil', sv: 'America/El_Salvador',
  gt: 'America/Guatemala', hn: 'America/Tegucigalpa', mx: 'America/Mexico_City',
  ni: 'America/Managua', pa: 'America/Panama', py: 'America/Asuncion',
  pe: 'America/Lima', do: 'America/Santo_Domingo', uy: 'America/Montevideo',
  ve: 'America/Caracas',
};

// What to notify about, and how far in advance of each session.
const NOTIFY_RULES = [
  { sessionKey: 'FirstPractice', leadMs: 24 * 60 * 60 * 1000, tag: 'fp1' },
  { sessionKey: 'Qualifying', leadMs: 60 * 60 * 1000, tag: 'qualy' },
  { sessionKey: 'Race', leadMs: 60 * 60 * 1000, tag: 'race' },
];

// Cron runs every 5 min (see wrangler.toml); this window is wider than that
// so a single delayed/missed tick doesn't cause a threshold to be skipped.
// The SENT KV namespace dedupes, so a generous window here is safe.
const CHECK_WINDOW_MS = 10 * 60 * 1000;

// Race schedules barely change. The cron runs often (for push-timing
// precision), but only hits the Jolpica API this often — the rest of the
// ticks reuse the cached race from RACE_CACHE. Matches the client's own
// cache TTL (CONFIG.TTL.RACE in index.html).
const RACE_CACHE_TTL_SECONDS = 8 * 60 * 60;

// /next-race is public read-only data (same trust level as Jolpica itself),
// so it's open to any origin. /subscribe and /unsubscribe write data, so
// those stay restricted to ALLOWED_ORIGIN.
function corsHeaders(env, pathname) {
  const origin = pathname === '/next-race' ? '*' : (env.ALLOWED_ORIGIN || '*');
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(env, body, status = 200, pathname = '') {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env, pathname) },
  });
}

async function hashEndpoint(endpoint) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env, url.pathname) });
    }

    if (url.pathname === '/next-race' && request.method === 'GET') {
      const race = await getNextRace(env);
      return json(env, race, 200, url.pathname);
    }

    if (url.pathname === '/subscribe' && request.method === 'POST') {
      const body = await request.json().catch(() => null);
      if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
        return json(env, { error: 'invalid subscription' }, 400, url.pathname);
      }
      const record = {
        endpoint: body.endpoint,
        keys: { p256dh: body.keys.p256dh, auth: body.keys.auth },
        country: COUNTRY_TIMEZONES[body.country] ? body.country : 'ar',
      };
      await env.SUBSCRIPTIONS.put(await hashEndpoint(body.endpoint), JSON.stringify(record));
      return json(env, { ok: true }, 200, url.pathname);
    }

    if (url.pathname === '/unsubscribe' && request.method === 'POST') {
      const body = await request.json().catch(() => null);
      if (!body?.endpoint) return json(env, { error: 'missing endpoint' }, 400, url.pathname);
      await env.SUBSCRIPTIONS.delete(await hashEndpoint(body.endpoint));
      return json(env, { ok: true }, 200, url.pathname);
    }

    return json(env, { error: 'not found' }, 404, url.pathname);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(checkAndNotify(env));
  },
};

async function checkAndNotify(env) {
  const vapid = { subject: env.VAPID_SUBJECT, publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY };

  const race = await getNextRace(env);
  if (!race) return;

  const now = Date.now();

  for (const rule of NOTIFY_RULES) {
    const session = rule.sessionKey === 'Race' ? race : race[rule.sessionKey];
    if (!session?.date || !session?.time) continue;

    const sessionTime = new Date(`${session.date}T${session.time}`).getTime();
    const triggerTime = sessionTime - rule.leadMs;

    // Only fire once "now" has just crossed the trigger threshold.
    if (triggerTime > now || triggerTime <= now - CHECK_WINDOW_MS) continue;

    const dedupeKey = `${race.season}-${race.round}:${rule.tag}`;
    if (await env.SENT.get(dedupeKey)) continue;

    await sendToAllSubscribers(env, vapid, rule.tag, race, session);
    await env.SENT.put(dedupeKey, '1', { expirationTtl: 7 * 24 * 60 * 60 });
  }
}

// Cached in RACE_CACHE (KV's own expirationTtl handles staleness) so most
// cron ticks don't hit Jolpica at all — only the first tick after the cache
// expires does. Note this means a just-finished race weekend can take up to
// RACE_CACHE_TTL_SECONDS to roll over to the next race, same trade-off the
// client already makes with its own cache.
async function getNextRace(env) {
  const cached = await env.RACE_CACHE.get('next_race', 'json');
  if (cached) return cached;

  const race = await fetchNextRace();
  if (race) {
    await env.RACE_CACHE.put('next_race', JSON.stringify(race), {
      expirationTtl: RACE_CACHE_TTL_SECONDS,
    });
  }
  return race;
}

async function fetchNextRace() {
  const year = new Date().getFullYear();
  const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json`);
  if (!res.ok) return null;
  const data = await res.json();
  const races = data?.MRData?.RaceTable?.Races ?? [];
  const now = Date.now();
  return races.find(r => new Date(`${r.date}T${r.time}`).getTime() > now) ?? null;
}

function buildMessage(tag, race, session, countryCode) {
  const raceName = race.raceName;

  if (tag === 'fp1') {
    const timezone = COUNTRY_TIMEZONES[countryCode] || COUNTRY_TIMEZONES.ar;
    const hora = new Date(`${session.date}T${session.time}`)
      .toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: timezone });
    return { title: '🏎️Mañana finde de F1!', body: `${raceName}, Práctica 1 a las ${hora}`, tag };
  }
  if (tag === 'qualy') {
    return { title: '🎯 Qualy en 1 hora', body: raceName, tag };
  }
  return { title: '🏁 Carrera en 1 hora!', body: raceName, tag };
}

async function sendToAllSubscribers(env, vapid, tag, race, session) {
  let cursor;
  do {
    const page = await env.SUBSCRIPTIONS.list({ cursor });
    cursor = page.list_complete ? undefined : page.cursor;

    await Promise.all(page.keys.map(async ({ name }) => {
      const raw = await env.SUBSCRIPTIONS.get(name);
      if (!raw) return;
      const sub = JSON.parse(raw);
      const message = buildMessage(tag, race, session, sub.country);

      try {
        const payload = await buildPushPayload(
          {
            data: JSON.stringify({
              title: message.title,
              body: message.body,
              tag: message.tag,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
            }),
            options: { ttl: 60 * 60 * 24 },
          },
          { endpoint: sub.endpoint, expirationTime: null, keys: sub.keys },
          vapid,
        );
        const res = await fetch(sub.endpoint, payload);

        if (res.status === 404 || res.status === 410) {
          // The browser dropped this subscription; stop tracking it.
          await env.SUBSCRIPTIONS.delete(name);
        } else if (!res.ok) {
          console.error(`push send failed for ${name}: ${res.status} ${await res.text().catch(() => '')}`);
        }
      } catch (err) {
        console.error(`push send threw for ${name}:`, err);
      }
    }));
  } while (cursor);
}
