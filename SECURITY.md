# Security Policy

## Supported Versions

La versión actual en la rama `main` es la única versión soportada.

## Reporting a Vulnerability

Si encuentras una vulnerabilidad de seguridad, por favor reporta el problema abriendo un issue en el repositorio:

- **Repository**: https://github.com/delzocreative/f1-horario
- **Issues**: https://github.com/delzocreative/f1-horario/issues

Para vulnerabilidades críticas, puedes contactar directamente al mantenedor del repositorio.

## Seguridad del Proyecto

Este proyecto es una aplicación web estática que:
- No utiliza autenticación de usuarios
- No almacena datos sensibles
- No procesa información personal de usuarios
- Solo consume APIs públicas (Jolpica F1, Wikipedia, wttr.in)

Todas las dependencias son CDN externas (TailwindCSS) y el código es ejecutado completamente en el navegador del cliente.
