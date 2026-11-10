# ElectroHogar Costa Rica — Catálogo & Tarjetas

Catálogo web de electrodomésticos (Gollo / EPA) con tarjetas de presentación con código QR para
asesoría puerta a puerta en Costa Rica.

- **Producción**: https://electrohogar-cr-catalogo.vercel.app
- **Modo asesor**: https://electrohogar-cr-catalogo.vercel.app/asesor

## Las dos pantallas

| | Catálogo público (`/`) | Modo asesor (`/asesor`) |
|---|---|---|
| Quién lo ve | El cliente que escanea el QR | La asesora, en su sesión de trabajo |
| Qué permite | Buscar, filtrar, ver fichas y pedir por WhatsApp | Además: agregar, editar y eliminar productos, comisiones, diseñador de tarjetas |
| Commission % | Nunca visible | Visible |
| Enlace al modo asesor | No existe en ninguna parte de la página | — |

El modo asesor **exige una confirmación explícita** al entrar y su sesión vive en `sessionStorage`:
se cierra sola cuando el navegador se cierra. La ruta interna no está enlazada desde el sitio
público; solo la conoce la asesora.

## La tarjeta de presentación

En el modo asesor, **Diseñador de Tarjeta con QR** genera una hoja imprimible de 8 tarjetas de
3.5" × 2" (85 × 54 mm) con marcas de corte:

- **Anverso**: marca, lema comercial, WhatsApp `+506` y zona de cobertura.
- **Reverso**: código QR que apunta al catálogo público.

Para imprimirla: botón **Imprimir Hoja de Tarjetas (8x)** y en el diálogo de impresión elegir
**A4 horizontal**, **márgenes: ninguno** y **activar gráficos de fondo**.

## Desarrollo local

```bash
npm install --legacy-peer-deps
npm run dev      # http://localhost:3000
```

> `bun` no está instalado en esta máquina, por lo que se usa `npm`. El flag `--legacy-peer-deps`
> es necesario por el conflicto de peer `esbuild` entre `tsx` y `vite@8`.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (puerto 3000) |
| `npm run build` | Build de producción en `dist/` |
| `npm run lint` | Verificación de tipos (`tsc --noEmit`, modo estricto) |
| `npm test` | Pruebas unitarias (`node:test` vía `tsx`) |

## Datos

Todo se guarda en el navegador (`localStorage`), sin servidor ni base de datos:

| Clave | Contenido |
|---|---|
| `electrohogar_cr_products_v2` | Catálogo de productos |
| `electrohogar_cr_profile_v2` | Datos de la marca |
| `electrohogar_cr_settings_v2` | Comisiones y ajustes del asesor |

`sessionStorage` guarda la sesión del modo asesor (`electrohogar_cr_admin_session`).

## Despliegue

Vercel, conectado al repositorio: cada `push` a `main` redespliega automáticamente.
`vercel.json` fija el build (Vite → `dist`) y el rewrite que sirve `/asesor`.

## Especificaciones (Spec Kit)

El proyecto usa [GitHub Spec Kit](https://github.com/github/spec-kit). Las especificaciones de
cada feature viven en `specs/<NNN>-<nombre>/`: `spec.md`, `plan.md`, `research.md`,
`data-model.md`, `contracts/`, `quickstart.md`, `tasks.md` y `verification.md`.
La constitución del proyecto está en `.specify/memory/constitution.md`.
