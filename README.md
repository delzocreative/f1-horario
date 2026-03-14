# F1 Dashboard LATAM

Dashboard de horarios de Formula 1 para paises de Latinoamerica.

## Caracteristicas

- **Horarios completos del fin de semana**: FP1, FP2, FP3, Sprint Qualifying, Sprint, Qualifying y Carrera
- **Soporte para 18 paises de Latinoamerica** con banderas visibles en el selector
- **Deteccion automatica de pais** por zona horaria del navegador
- **Selector visual de paises** con banderas y horarios locales
- **Informacion del circuito**: longitud, vueltas, record de vuelta
- **Clima actual** de la ciudad del circuito (lazy load)
- **Modo Dark/Light** (dark por defecto)
- **Funciona offline** (PWA)
- **Auto-actualizacion** cada 8 horas
- **Diseno mobile-first** con Tailwind CSS

## Paises Soportados

Argentina, Bolivia, Brasil, Chile, Colombia, Costa Rica, Cuba, Ecuador, El Salvador, Guatemala, Honduras, Mexico, Nicaragua, Panama, Paraguay, Peru, Republica Dominicana, Uruguay, Venezuela.

## Tecnologias

- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript (ES6)
- PWA (Service Worker)

## APIs Utilizadas

- [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/) - Horarios y datos de carreras
- [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) - Imagenes de circuitos
- [wttr.in](https://wttr.in) - Clima actual
- [FlagCDN](https://flagcdn.com) - Banderas de paises

## Deploy en Cloudflare Pages

### Opcion 1: Via Dashboard

1. Sube este proyecto a un repositorio de GitHub
2. Ve a [Cloudflare Pages](https://pages.cloudflare.com/)
3. Click en "Create a project" > "Connect to Git"
4. Selecciona tu repositorio
5. Configura:
   - **Build command**: (dejar vacio)
   - **Build output directory**: `/` o `.` (raiz del proyecto)
   - **Root directory**: `.` (raiz)
6. Click en "Save and Deploy"

### Opcion 2: Via Wrangler CLI

```bash
# Instalar Wrangler
npm install -g wrangler

# Autenticarse
wrangler login

# Deploy
wrangler pages deploy . --project-name=f1-dashboard
```

## Estructura del Proyecto

```
f1-app/
├── index.html      # Aplicacion principal (HTML + CSS + JS)
├── sw.js           # Service Worker para PWA
├── manifest.json   # PWA Manifest
└── README.md       # Este archivo
```

## Desarrollo Local

Puedes servir los archivos localmente con cualquier servidor HTTP:

```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx serve .

# Con PHP
php -S localhost:8000
```

Luego abre `http://localhost:8000` en tu navegador.

## Cache y Offline

La aplicacion utiliza:
- **localStorage**: Para datos de carrera, clima y preferencias del usuario
- **Service Worker Cache**: Para assets estaticos y respuestas de APIs

Tiempos de cache:
- Datos de carrera: 8 horas
- Clima: 30 minutos
- Imagenes de circuitos: 24 horas

## Licencia

MIT

## Agradecimientos

- [Ergast F1 API](http://ergast.com/mrd/) - Datos oficiales de F1
- [Jolpica](https://jolpi.ca) - Proxy de la API de Ergast
- [Formula 1](https://formula1.com) - Datos oficiales