# F1 Dashboard LATAM

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/F1_logo.svg/2560px-F1_logo.svg.png" width="200" alt="F1 Logo">
  <h1 align="center">Dashboard de Fórmula 1 para América Latina</h1>
</p>

<p align="center">
  Dashboard moderno de Fórmula 1 que muestra los próximos horarios, clasificaciones de pilotos y constructores con zonas horarias locales adaptadas para América Latina.
</p>

<p align="center">
  <em>¡Diseñado específicamente para usuarios LATAM!</em>
</p>

## 🏁 Características

- **📅 Próximas carreras**: Muestra la próxima carrera con imagen del circuito
- **🌎 Horarios por país**: Selector interactivo de hora local para 18 países de América Latina  
- **🏆 Clasificaciones**: Pilotos y constructores en tiempo real
- **📊 Histórico**: Tablas de campeones por año desde 1950
- **🇦🇷 Detección automática**: Ajusta la hora local según la zona horaria del navegador
- **📱 Responsive**: Funciona perfectamente en móviles, tablets y desktops
- **🔄 Cambio entre vistas**: Pestañas para ver pilotos o constructores
- **🔄 Actualización automática**: Datos refrescados periódicamente

## 📍 Vista Principal

<div align="center">
  <img src="https://via.placeholder.com/800x400/1e293b/f1f5f9?text=F1+Dashboard+Principal+View" alt="Screenshot">
</div>

### Componentes Principales:

1. **Hero Section**: La próxima carrera con:
   - Imagen del circuito (cargada desde Wikipedia API) 
   - Nombre del GP con bandera del país
   - Nombre del circuito y localidad
   - Selector de idioma y hora local LATAM
   - Temporizador de cuenta regresiva

2. **Previews Laterales**:
   - Clasificación Top 3 Pilotos (🥇🥈🥉)
   - Clasificación Top 3 Constructores

3. **Tabla Histórica**:
   - Pestañas para pilotos/constructores
   - Selector de año (1950-2026)
   - Tabla completa con posiciones, puntos y victorias

## 🌎 Países LATAM Soportados

| País | Zona Horaria |
|------|--------------|
| 🇲🇽 México | UTC-6 |
| 🇬🇹 Guatemala | UTC-6 |
| 🇸🇻 El Salvador | UTC-6 |
| 🇭🇳 Honduras | UTC-6 |
| 🇳🇮 Nicaragua | UTC-6 |
| 🇨🇷 Costa Rica | UTC-6 |
| 🇨🇴 Colombia | UTC-5 |
| 🇪🇨 Ecuador | UTC-5 |
| 🇵🇪 Perú | UTC-5 |
| 🇵🇦 Panamá | UTC-5 |
| 🇩🇴 República Dominicana | UTC-4 |
| 🇧🇴 Bolivia | UTC-4 |
| 🇻🇪 Venezuela | UTC-4 |
| 🇵🇾 Paraguay | UTC-4/-3 |
| 🇦🇷 Argentina | UTC-3 |
| 🇺🇾 Uruguay | UTC-3 |
| 🇨🇱 Chile | UTC-4/-3 |
| 🇧🇷 Brasil | UTC-3/-2 |

## ⚙️ Tecnología

- **Cliente**: HTML5, CSS3, JavaScript modular ES6 (sin frameworks)
- **Datos**: API pública F1 Ergast (a través de jolpica-f1)
- **Imágenes**: Banderas de flagcdn.com y circuitos de Wikipedia API
- **Deploy**: Cloudflare Pages (estático, no necesita backend)
- **Almacenamiento**: Caché en localStorage del navegador

## 📊 API Utilizada

`https://api.jolpi.ca/ergast/f1/`

- Datasets completos de temporadas, carreras, pilotos y constructores
- Respuestas en formato JSON estándar
- Compatible con endpoints de la API original de Ergast F1
- Sin límites de rate limiting para uso moderado

## 🧩 Arquitectura del Proyecto

```
f1-app/
├── index.html              # Página principal con estructura semántica
├── styles.css             # Hoja de estilos con variables CSS
├── app.js                 # Entry point principal y lógica de aplicación
├── API/
│   └── client.js          # Cliente modular para la API de F1
├── components/
│   ├── next-race.js       # Vista de la próxima carrera
│   ├── standings-preview.js # Previews de clasificaciones
│   ├── standings-table.js # Tablas históricas de clasificaciones  
│   ├── timezone-selector.js # Selector de zonas horariasLATAM
│   ├── header.js          # Componente de header y selector de año
│   └── circuits.js        # Funciones para imágenes de circuitos
├── utils/
│   ├── cache.js           # Sistema de almacenamiento en caché
│   ├── timezones.js       # Funciones de manipulación de zonas horarias
│   ├── flags.js           # Funciones para manejo de banderas países
│   └── date.js            # Funciones de manipulación de fechas
├── assets/                # (opcional) Imágenes de circuitos locales
├── .gitignore            # Archivos excluidos del control de versiones
├── package.json           # Configuración del proyecto y dependencias
├── README.md             # Documentación del proyecto
└── LICENSE               # Licencia MIT
```

## 🚀 Despliegue

### Cloudflare Pages (Configuración Recomendada)

#### Opción 1: Conectando Repositorio GitHub (Recomendado)

1. **Crea este repositorio en GitHub**
2. **Accede a [Cloudflare Dashboard](https://dash.cloudflare.com/)**
3. **Ve a Account Home → Pages → Create a project**
4. **Selecciona "Connect to Git"**
5. **Conecta con tu repositorio GitHub**
6. **Configuración de Build:**
   - Framework preset: `None` (sitio estático)
   - Build command: *(dejar vacío)*
   - Build output directory: `.`
   - Root directory: `./`
7. **Haz clic en "Save and Deploy"**

#### Opción 2: Subida Directa (Manual)

1. **Comprime toda esta carpeta como archivo ZIP**
2. **Ve a Cloudflare Dashboard → Pages → Create a project**
3. **Selecciona "Upload assets"**
4. **Sube el archivo ZIP**
5. **Define Build settings como arriba**

### Resultado

- Aplicación accesible públicamente
- URL personalizada opcional
- CI/CD automático tras push a main
- Caché global en CDN de Cloudflare
- Seguridad y rendimiento óptimos

## 🛠️ Desarrollo Local

### Pre-requisitos
- Node.js instalado (opcional para desarrollo, pero útil para testing)
- Navegador moderno (Chrome, Firefox, Edge, Safari)

### Instalación
1. `git clone` este repositorio
2. Abrir `index.html` en tu navegador **con un servidor HTTP**

⚠️ **ATENCIÓN**: Si abres directamente el archivo HTML en el navegador (archivo://), es posible que no funcione correctamente por restricciones CORS y módulos JavaScript. Se requiere un servidor web.

### Servidor local
```bash
# Si tienes Node.js instalado
npx http-server

# Luego accede en http://localhost:8080
```

## 📋 Funcionalidades Técnicas

### Sistema de Caché
- Todos los datos se almacenan en `localStorage`
- Tiempos de expiración configurables:
  - Horarios de carreras: 2 horas
  - Clasificaciones: 2 horas  
  - Lista de años: 24 horas

### Actualización Automática
- Verificación periódica de datos caducados
- Cada 5 minutos se comprueba y actualiza si es necesario
- Botón de refresh manual

### Idioma
- Interfaz completamente en español
- Formatos de fecha/hora según configuración regional
- Nombres de países traducidos

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios mayores, por favor abre un issue primero para discutir lo que te gustaría cambiar.

## 📄 Licencia

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Autor

[@enzoantoni-devops](https://github.com/enzoantoni-devops)

---

<p align="center">
  <em>Hecho con ❤️ para los fanáticos de la Fórmula 1 en América Latina</em><br>
  🏁 ¡Acelera la emoción de la F1 en tu idioma y hora local!
</p>