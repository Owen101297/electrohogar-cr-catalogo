# Contrato: Enrutado y sesión de asesor

**Feature**: 002-vista-publica-asesor | **Date**: 2026-11-10

Contrato del módulo `src/utils/routing.ts`. Es la **única** fuente de verdad sobre rutas, URL
pública y sesión de asesor.

---

## `resolveRoute(pathname: string): Route`

Resuelve la pantalla a montar a partir del `pathname`.

- **Entrada**: `window.location.pathname` (o cualquier string para pruebas).
- **Salida**: `'public'` | `'advisor'`.

Reglas:

| Entrada | Salida |
|---|---|
| `'/'` | `'public'` |
| `'/index.html'` | `'public'` |
| `'/asesor'` | `'advisor'` |
| `'/asesor/'` | `'advisor'` |
| `'/asesor/anything'` | `'public'` |
| `'/cualquier/otra/ruta'` | `'public'` |
| `''` | `'public'` |

Las rutas desconocidas caen en `'public'` para no revelar la existencia del modo asesor.

## `getPublicCatalogUrl(): string`

URL pública del catálogo, usada como destino del código QR.

- **Salida**: `window.location.origin + '/'`.
- Ejemplo: `https://electrohogar-cr-catalogo.vercel.app/`
- **Nunca** devuelve la ruta actual: dentro de `/asesor` seguiría devolviendo `/asesor`, que es
  exactamente el fallo que FR-011 prohíbe.

## `isAdvisorSessionActive(): boolean`

Indica si esta pestaña tiene una sesión de asesor activa.

- Lee `sessionStorage.getItem('electrohogar_cr_admin_session')`.
- **Salida**: `true` si el valor es `'1'`, `false` en cualquier otro caso (incluye `null`).
- Ante `sessionStorage` no disponible (modo privado de algunos navegadores, SSR), devuelve `false`
  sin lanzar.

## `startAdvisorSession(): void`

Inicia la sesión de asesor.

- Escribe `'1'` en `sessionStorage` bajo `electrohogar_cr_admin_session`.
- Es idempotente.

## `endAdvisorSession(): void`

Cierra la sesión de asesor.

- Elimina la clave `electrohogar_cr_admin_session` de `sessionStorage`.
- Es idempotente y nunca lanza.

## `ADVISOR_ROUTE: string`

Constante con la ruta del modo asesor: `'/asesor'`.

## `ADVISOR_SESSION_KEY: string`

Constante con la clave de sesión: `'electrohogar_cr_admin_session'`.

---

## Contrato de props de componentes

### `CatalogView`

```text
CatalogViewProps
├── products: Product[]
├── profile: CardProfile
├── activePalette: ColorPalette
├── advisorSettings: AdvisorSettings
├── onSelectProduct: (product: Product) => void
├── isAdvisor: boolean          # NUEVO
├── onOpenCardStudio?: () => void      # opcional: solo en modo asesor
├── onOpenDigitalCard?: () => void     # opcional: solo en modo asesor
└── onOpenAddProduct?: () => void      # opcional: solo en modo asesor
```

Cuando `isAdvisor === false`, el componente **no renderiza** el botón "+ Agregar Producto" ni el
botón "Configurar Tarjeta / QR", y **no** renderiza la insignia de ganancia.

### `ProductDetailModal`

```text
ProductDetailModalProps
├── product: Product | null
├── onClose: () => void
├── isAdvisor: boolean          # NUEVO
├── onEditProduct?: (product: Product) => void    # opcional: solo en modo asesor
├── onDeleteProduct?: (product: Product) => void  # opcional: solo en modo asesor
├── profile: CardProfile
├── activePalette: ColorPalette
└── advisorSettings: AdvisorSettings
```

Cuando `isAdvisor === false`, el componente **no renderiza** el bloque de botones "Editar
producto" / "Eliminar producto".

### `Footer`

```text
FooterProps
├── profile: CardProfile
├── activePalette: ColorPalette
├── isAdvisor: boolean          # NUEVO
└── onOpenCardStudio?: () => void   # opcional: solo en modo asesor
```

Cuando `isAdvisor === false`, el componente **no renderiza** el enlace "Ver Tarjeta Corporativa con
QR".

---

## Comportamiento del despliegue

`vercel.json` MUST incluir el rewrite que sirve el `index.html` para cualquier ruta:

```json
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```

Sin este rewrite, `/asesor` devuelve 404 en producción aunque el bundle exista.

## Copy del diálogo de confirmación

| Constante | Texto |
|---|---|
| `ADVISOR_GATE_TITLE` | "Acceso del asesor" |
| `ADVISOR_GATE_BODY` | "Esta pantalla es para la asesora de ElectroHogar. Contiene las herramientas para administrar el catálogo, calcular comisiones e imprimir la tarjeta con QR." |
| `ADVISOR_GATE_ENTER` | "Entrar al modo asesor" |
| `ADVISOR_GATE_CANCEL` | "Ver el catálogo" |
| `ADVISOR_EXIT` | "Salir del modo asesor" |

> El texto de `ADVISOR_GATE_BODY` se redacta en español CR y sin incluir el término "administración"
> en mayúsculas ni referencias a la existencia de la ruta interna.
