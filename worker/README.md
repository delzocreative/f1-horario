# f1-push-worker

Cloudflare Worker de F1 Horario LATAM. Hace dos cosas:

1. **Sirve los horarios**: `GET /next-race` devuelve la próxima carrera
   (cacheada de Jolpica, TTL 8h). El cliente (`index.html`) le pega a esto en
   vez de a Jolpica directo — así que el dashboard depende de que este Worker
   esté arriba, no solo las notificaciones.
2. **Notificaciones push**: guarda suscripciones y, por cron cada 5 minutos,
   avisa 1 día antes de FP1 y 1 hora antes de Qualy y de la Carrera.

Separado del sitio estático (que sigue siendo Cloudflare Pages) porque los
Cron Triggers son una feature de Workers, no de Pages Functions.

## Puesta en marcha (una sola vez)

Desde `worker/`:

```bash
npm install

# 1. Generar el par de claves VAPID
npx web-push generate-vapid-keys
# Copiar "Public Key" y "Private Key" del output.

# 2. Crear los namespaces de KV
npx wrangler kv namespace create SUBSCRIPTIONS
npx wrangler kv namespace create SENT
npx wrangler kv namespace create RACE_CACHE
# Pegar los "id" que devuelve cada comando en wrangler.toml (kv_namespaces).

# 3. Completar en wrangler.toml:
#    - ALLOWED_ORIGIN: el dominio real donde vive el index.html (Pages)
#    - VAPID_SUBJECT: "mailto:tu-email@ejemplo.com"
#    - VAPID_PUBLIC_KEY: la Public Key generada en el paso 1

# 4. Subir la Private Key como secret (nunca va en wrangler.toml)
npx wrangler secret put VAPID_PRIVATE_KEY
# Pegar la Private Key cuando lo pida.

# 5. Desplegar
npx wrangler deploy
```

`wrangler deploy` va a imprimir la URL del Worker (algo como
`https://f1-push-worker.<tu-subdominio>.workers.dev`).

## Conectar el cliente

En `index.html`, completar el objeto `WORKER_CONFIG`:

```js
const WORKER_CONFIG = {
  URL: 'https://f1-push-worker.<tu-subdominio>.workers.dev',
  VAPID_PUBLIC_KEY: '...',   // la misma Public Key del paso 1
};
```

## Verificar que el cron corre

```bash
npx wrangler tail
```

y esperar al próximo disparo (cada 5 min), o forzar una ejecución local con
`npx wrangler dev --test-scheduled` y pegarle a `/__scheduled`.

## Notas

- Cache de datos de carrera: KV `RACE_CACHE`, TTL 8h (igual que el cache del cliente). El cron corre cada 5 min pero solo golpea la API de Jolpica cuando ese cache vence — el resto de los ticks solo leen KV.
- Dedupe de envíos: KV `SENT`, clave `{season}-{round}:{fp1|qualy|race}`, TTL 7 días.
- Si un dispositivo revoca el permiso o desinstala la app, el próximo intento
  de push devuelve 404/410 y el Worker borra esa suscripción de `SUBSCRIPTIONS`
  automáticamente — no hace falta limpieza manual.
- `ALLOWED_ORIGIN` solo controla CORS del navegador; no es una barrera real
  contra abuso del endpoint `/subscribe` (alguien podría hacer POST directo
  igual). Para un uso más público conviene agregar rate limiting.
