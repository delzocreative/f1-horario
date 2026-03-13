# F1 Dashboard LATAM - INSTRUCCIONES DE IMPLEMENTACIÓN

## Descripción del Proyecto

Aplicación web completa que muestra:
- Próximas carreras de F1 con horarios locales para países de LATAM
- Clasificaciones de pilotos y constructores
- Sistema completo de zonas horarias con detección automática
- Tablas históricas por año de campeones
- Diseño responsive con tema oscuro estilo F1

## Estructura de Archivos

```
f1-app/
├── index.html                 # Página principal
├── styles.css                 # Estilos CSS
├── app.js                     # Lógica principal
├── package.json               # Configuración del proyecto
├── README.md                  # Documentación
├── wrangler.json              # Configuración Cloudflare
├── api/
│   └── client.js             # Cliente API F1
├── components/
│   ├── next-race.js          # Carrera siguiente
│   ├── standings-preview.js  # Vistas previas de rankings
│   ├── standings-table.js    # Tablas históricas
│   ├── timezone-selector.js  # Selector de zonas horarias
│   ├── header.js            # Componente header
│   └── circuits.js          # Funciones de circuitos
└── utils/
    ├── cache.js              # Caché en localStorage
    ├── timezones.js          # Funciones de zonas horarias
    ├── flags.js              # Funciones de banderas
    └── date.js               # Funciones de fechas
```

## Solución de Problemas Comunes

### 1. Errores de "CORS" o acceso a recursos
- Este error ocurre al probar en local sin servidor HTTP
- La aplicación requiere un servidor para funcionar correctamente

### 2. "Failed to fetch" o error de red
- Posible bloqueo por CORS al probar localmente
- Funciona correctamente en producción (Cloudflare Pages)

### 3. Módulos no cargan
- Asegúrate que el servidor sirva con encabezados CORS permitidos
- Verifica que los tipos MIME estén correctos

## Cómo probar localmente

1. Desde el directorio f1-app, inicia el servidor:

```bash
node runtime.js
```

2. Abre tu navegador en: http://127.0.0.1:8080

3. O accede a la herramienta de depuración en: http://127.0.0.1:8080/debug.html

## DEPLOYMENT INSTRUCCIONES - Cloudflare Pages

### Opción 1: Directa desde GitHub (Rec. debo usar esta)

1. Crea un repositorio en GitHub con estos archivos
2. Inicia sesión en Cloudflare Dashboard
3. Ve a "Pages" → "Create a project"
4. Conecta a tu repositorio GitHub
5. Configuración:
   - Framework preset: "None" (estático)
   - Build command: dejar vacío
   - Build output directory: "."
   - Root directory: "./"
6. Save and deploy

### Opción 2: Implementación manual (Sube carpetas/archivos)

1. Arrastrar carpetas "dist","public", o raíz al panel de CF Pages
2. No requiere Build settings para un sitio estático

### Opción 3: CLI de Wrangler

```bash
# Instalar wrangler globalmente
npm install -g wrangler

# Login a Cloudflare
wrangler login

# Deploy
wrangler pages deploy .
```

## CARACTERÍSTICAS CLAVE

- 🏁 Próximas carreras con horarios locales para 18 países de LATAM
- 🌎 Selector y detección automática de zona horaria
- 🏆 Clasificaciones de pilotos y constructores
- 📊 Tablas históricas por año (1950-2026)
- 🇦🇷 Sistema de banderas por país
- 📅 Calendario interactivo con countdown
- 🧭 Navegación intuitiva

## API Utilizada

- Base: https://api.jolpi.ca/ergast/f1/ (API pública de datos de F1)
- Compatible con endpoints de Ergast F1
- No requiere autenticación
- Consultas paginadas para mejor rendimiento

## Personalización

### Agregar nuevos países LATAM
Editar `utils/timezones.js` y modificar el objeto `LATAM_COUNTRIES`

### Cambiar tema/colores
Editar variables CSS en `styles.css`, sección `:root`

### Cambiar formato de hora
Modificar `utils/timezones.js`, función `formatTimeWithTimezone`

## Soporte

La aplicación ha sido verificada con éxito para:
- ✓ Conexión a la API F1
- ✓ Cargado de módulos ES6
- ✓ Renderizado de componentes
- ✓ Funcionalidad de zonas horarias
- ✓ Sistema de caché localStorage
- ✓ Responsive Design