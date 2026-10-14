# Security Policy

## Supported Versions

La versión actual en la rama `main` es la única versión soportada.

## Reporting a Vulnerability

Por favor **no** abras un issue público para reportar una vulnerabilidad. Usá el reporte privado de GitHub:

- https://github.com/delzocreative/f1-horario/security/advisories/new

## Seguridad del Proyecto

- El sitio (`public/`) es estático: no hay cuentas de usuario ni autenticación.
- El único dato que se guarda es la suscripción push del navegador (endpoint + claves de cifrado) y el país elegido, en el Worker (`worker/`), para poder enviar las notificaciones. Se borra cuando el navegador da de baja la suscripción.
- La clave privada VAPID vive como secreto del Worker, nunca en el repo.
- APIs externas: Jolpica F1 (vía el Worker), Wikipedia, wttr.in, flagpedia/flagcdn; Tailwind desde su CDN.
