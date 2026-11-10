# ElectroHogar Costa Rica — Catálogo & Tarjetas Constitution

## Core Principles

### I. Español Costarricense como Idioma de Producto
Toda la interfaz, contenido de ejemplo, mensajes de error, textos de venta y documentación de
funcionalidad se escriben en español de Costa Rica. Los precios se muestran en Colones (₡) con
formato local (`es-CR`), los teléfonos usan prefijo `+506` y las referencias comerciales citan
Gollo y EPA con su marca real. Los identificadores de código (nombres de variables, tipos, claves
de `localStorage`) permanecen en inglés o `camelCase` según la convención existente del código.

### II. Modelo de Datos Local-First y Tipado Centralizado
La aplicación es un SPA sin backend propio: el estado persistente vive en `localStorage` bajo
claves versionadas (`electrohogar_cr_*_v2`). Todo el estado de dominio se declara en
`src/types.ts` y los datos iniciales en `src/data/`. Ninguna feature introduce un store global
nuevo, una librería de estado externa o un esquema de persistencia distinto sin que la
especificación lo justifique explícitamente.

### III. Identidad de Marca Dirigida por Configuración, No por Código Muerto
La apariencia de la app (catálogo, tarjeta impresa, tarjeta digital, modales) se deriva de
`CardProfile` y de la paleta activa (`PALETTES`). Todo color de marca debe llegar por props o
variables de Tailwind, nunca por un literal hexadecimal fijado en un componente. Las paletas son
contrato de producto: agregar o renombrar una paleta obliga a actualizar `src/data/palettes.ts` y
los consumidores de `paletteId`.

### IV. Tipado Estricto y Verificación Antes de Commit
El proyecto compila en modo estricto de TypeScript. Cada cambio MUST pasar `bun run lint`
(`tsc --noEmit`) sin errores antes de commitearse. No se usan `any` implícitos ni casts de
`unknown` sin justificación; los `any` ya presentes en los `select` de ordenamiento se consideran
deuda técnica a eliminar, no un patrón a replicar. Los componentes reciben props tipadas mediante
interfaces `XxxProps` exportadas desde el propio archivo del componente.

### V. Simplicidad Operativa (YAGNI) y Reutilización de `utils/`
No se introduce una dependencia npm nueva sin que la especificación justifique por qué las
existentes (`qrcode`, `lucide-react`, `motion`, `@google/genai`) son insuficientes. El formato de
moneda, los enlaces de WhatsApp y el cálculo de comisión se resuelven SIEMPRE a través de
`src/utils/formatters.ts`; ningún componente vuelve a implementar esas conversiones.

## Stack y Restricciones Técnicas

- **Runtime:** React 19 + TypeScript 7 + Vite 8, Tailwind CSS v4 (plugin `@tailwindcss/vite`),
  iconografía `lucide-react`, animaciones `motion`.
- **Gestor de paquetes:** Bun (`bun.lock` presente). Comandos disponibles: `bun run dev`
  (puerto 3000, host 0.0.0.0), `bun run build`, `bun run preview`, `bun run lint`.
- **Sin backend propio:** no se agregan endpoints, base de datos ni autenticación sin una
  especificación que lo justifique.
- **Sin PII de personas naturales:** el producto es una tarjeta *corporativa*. Los perfiles
  almacenados solo contienen datos de la empresa/marca (nombre comercial, WhatsApp, lema,
  cobertura). NO se agregan campos de nombre de asesor, cédula ni datos personales de clientes.
- **Imágenes:** los productos referencian imágenes remotas vía `image`; los assets locales viven
  en `public/assets/`.
- **Impresión:** la hoja de tarjetas usa CSS `@media print` y medidas físicas en `mm`
  (85 × 54 mm). Cualquier cambio visual en la tarjeta debe seguir siendo imprimible.

## Flujo de Trabajo Spec Kit

1. Toda feature nueva arranca con `/speckit.specify` (rama `NNN-feature-slug` creada
   automáticamente por la extensión git).
2. Antes de implementar: `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`.
3. `/speckit.clarify` se usa cuando la spec tenga ambigüedad; `/speckit.analyze` cuando haya
   cambios de contrato o de tipos.
4. Cada commit debe dejar el repo en estado verde (`bun run lint` sin errores).
5. Las decisiones de arquitectura que afecten esta constitución se documentan en
   `.specify/memory/constitution.md` mediante una enmienda versionada.

## Governance

Esta constitución prevalece sobre cualquier práctica o plantilla de los comandos de Spec Kit.
Las enmiendas requieren: (a) actualización del número de versión según semver — MAJOR para
eliminar o redefinir un principio, MINOR para agregar o expandir una sección, PATCH para
aclaraciones de redacción; (b) fecha ISO de ratificación/amendamiento; (c) registro de los
principios modificados en el reporte de impacto de sincronización. La revisión de cumplimiento
se realiza en cada `/speckit.plan` y `/speckit.analyze`: si una spec contradice un principio,
la spec se corrige antes de implementar. Toda complejidad introducida debe justificarse de
forma explícita en el documento de plan.

**Version**: 1.0.0 | **Ratified**: 2026-11-10 | **Last Amended**: 2026-11-10
