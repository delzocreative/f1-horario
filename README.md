# F1 Horario LATAM

Dashboard de horarios de Fórmula 1 para paises de Latinoamérica.

## Características

- **Horarios completos del fin de semana**: FP1, FP2, FP3, Sprint Qualifying, Sprint, Qualifying y Carrera
- **Soporte para 18 países de Latinoamérica** con banderas visibles en el selector
- **Detección automática de país** por zona horaria del navegador
- **Selector visual de países** con banderas y horarios locales
- **Información del circuito**: longitud, vueltas, curvas, récord de vuelta, capacidad e inauguración
- **Clima actual** de la ciudad del circuito (lazy load)
- **Funciona offline** (PWA)
- **Auto-actualización** cada 8 horas
- **Diseño mobile-first** con Tailwind CSS

## Países Soportados

Argentina, Bolivia, Brasil, Chile, Colombia, Costa Rica, Cuba, Ecuador, El Salvador, Guatemala, Honduras, Mexico, Nicaragua, Panama, Paraguay, Peru, Republica Dominicana, Uruguay, Venezuela.

## Tecnologías

- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript (ES6)
- PWA (Service Worker)

## APIs Utilizadas

- [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/) - Horarios y datos de carreras
- [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) - Imágenes de circuitos
- [wttr.in](https://wttr.in) - Clima actual
- [FlagCDN](https://flagcdn.com) - Banderas de países

## Cache y Offline

La aplicación utiliza:
- **localStorage**: Para datos de carrera, clima y preferencias del usuario
- **Service Worker Cache**: Para assets estáticos y respuestas de APIs

Tiempos de cache:
- Datos de carrera: 8 horas
- Clima: 4 horas
- Imágenes de circuitos: 24 horas

## Licencia

Este proyecto está bajo la licencia [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/).

Esto significa que eres libre de:
- **Compartir**: Copiar y redistribuir el material
- **Adaptar**: Remezclar, transformar y crear a partir del material

Bajo las siguientes condiciones:
- **Atribución**: Debes dar crédito al autor original
- **NoComercial**: No puedes usar el material con fines comerciales
- **CompartirIgual**: Si adaptas el material, debes distribuir tus contribuciones bajo la misma licencia

## Agradecimientos

- [Ergast F1 API](http://ergast.com/mrd/) - Datos oficiales de F1
- [Jolpica](https://jolpi.ca) - Proxy de la API de Ergast
- [Formula 1](https://formula1.com) - Datos oficiales