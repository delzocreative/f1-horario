import webpush from 'web-push';

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

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
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
      return new Response(null, { headers: corsHeaders(env) });
    }

    if (url.pathname === '/subscribe' && request.method === 'POST') {
      const body = await request.json().catch(() => null);
      if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
        return json(env, { error: 'invalid subscription' }, 400);
      }
      const record = {
        endpoint: body.endpoint,
        keys: { p256dh: body.keys.p256dh, auth: body.keys.auth },
        country: COUNTRY_TIMEZONES[body.country] ? body.country : 'ar',
      };
      await env.SUBSCRIPTIONS.put(await hashEndpoint(body.endpoint), JSON.stringify(record));
      return json(env, { ok: true });
    }

    if (url.pathname === '/unsubscribe' && request.method === 'POST') {
      const body = await request.json().catch(() => null);
      if (!body?.endpoint) return json(env, { error: 'missing endpoint' }, 400);
      await env.SUBSCRIPTIONS.delete(await hashEndpoint(body.endpoint));
      return json(env, { ok: true });
    }

    return json(env, { error: 'not found' }, 404);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(checkAndNotify(env));
  },
};

async function checkAndNotify(env) {
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

  const race = await fetchNextRace();
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

    await sendToAllSubscribers(env, rule.tag, race, session);
    await env.SENT.put(dedupeKey, '1', { expirationTtl: 7 * 24 * 60 * 60 });
  }
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

async function sendToAllSubscribers(env, tag, race, session) {
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
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify({
            title: message.title,
            body: message.body,
            tag: message.tag,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
          }),
        );
      } catch (err) {
        // 404/410 = the browser dropped this subscription; stop tracking it.
        if (err.statusCode === 404 || err.statusCode === 410) {
          await env.SUBSCRIPTIONS.delete(name);
        }
      }
    }));
  } while (cursor);
}
