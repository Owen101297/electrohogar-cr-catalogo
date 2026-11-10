# Data Model: Separar la vista pública del catálogo y la vista del asesor

**Feature**: 002-vista-publica-asesor | **Date**: 2026-11-10

## Entidades

### Route (nuevo — derivada, no persistida)

El tipo de pantalla que se monta, resuelto del `pathname` actual.

```text
Route = 'public' | 'advisor'
```

Regla de resolución:

| Pathname | Route |
|---|---|
| `/`, `/index.html` | `public` |
| `/asesor`, `/asesor/` | `advisor` |
| Cualquier otra ruta | `public` |

**Por qué las rutas desconocidas caen en `public`**: la spec (edge case) exige que una dirección
interna inexistente **no revele la existencia del modo asesor**. Con la regla, una ruta inventada
muestra el catálogo limpio.

### AdvisorSession (nuevo — efímera)

Estado que habilita la interfaz de administración.

```text
AdvisorSession
└── active: boolean    # sesión iniciada en ESTA pestaña de ESTE navegador
```

**Ciclo de vida**: se crea al confirmar el ingreso en `/asesor`; se descarta cuando el navegador
se cierra (`sessionStorage` se vacía automáticamente). Al recargar la página se conserva, porque es
la misma sesión del navegador.

**Alcance**: `sessionStorage` es **por pestaña**. Una pestaña con el modo asesor activo no
habilita el modo asesor en otra pestaña — esto satisface FR-016 de forma nativa.

### Catálogo público (derivado, no persistido)

La proyección de los datos que ve el cliente. **No es una entidad nueva**: es la lectura de
`Product[]` y `CardProfile` ya persistidos, filtrada para ocultar los campos internos.

Reglas de proyección:

| Dato | Público | Asesor |
|---|---|---|
| `Product[]` completo | Sí | Sí |
| `Product.currentPrice` / `originalPrice` | Sí | Sí |
| `Product.installmentQuincenal` / `installmentMonths` | Sí | Sí |
| `Product.specs` completo | Sí | Sí |
| Comisión del asesor (`cashDiscountPercent` de la comisión, no el descuento del producto) | **No** | Sí |
| Acciones de agregar/editar/eliminar | **No** | Sí |
| Calculadora de comisiones | **No** | Sí |
| Diseñador de tarjetas / vista digital | **No** | Sí |

> Nota: `cashDiscountPercent` es el **descuento en efectivo del producto** (visible para todos).
> Lo que se oculta al cliente es la **comisión del asesor** (`calculateCommission`), que solo
> aparece con `advisorSettings.advisorModeEnabled`.

### Perfil de marca (existente — sin cambios)

`CardProfile` se comparte entre ambas pantallas. La vista pública usa `brandName`,
`serviceTagline`, `phone`, `coverage`, `slogan` y `paletteId`. Los campos de personalización de
tarjeta (`minimalistStyle`, `showStoresLogos`, `services`) solo tienen efecto en el modo asesor, pero
**no se modifica su forma**: se conservan sin cambios para no romper la compatibilidad con los datos ya
guardados en el navegador.

### Tarjeta de presentación (existente — sin cambios de forma)

Pieza imprimible de 85 × 54 mm:

```text
Tarjeta (anverso)              Tarjeta (reverso)
├── Marca (logo + nombre)      ├── Código QR → catálogo público
├── Tagline del servicio        ├── "Catálogo Digital 24/7"
├── Lema comercial              ├── 3 pasos: escanear / elegir / pedir
├── WhatsApp +506               ├── Garantía de fábrica
├── Zona de cobertura           └── Teléfono +506
└── "Entrega a Domicilio"
```

La hoja de impresión contiene 8 tarjetas con marcas de corte, con frente y reverso alternados.

## Transiciones de estado

```text
                    ┌──────────────────────────────────┐
                    │        Carga de la aplicación    │
                    └────────────────┬─────────────────┘
                                     │
                       ¿pathname == /asesor?
                          │                    │
                         no                    sí
                          │                    │
                          ▼                    ▼
                  ┌───────────────┐    ┌────────────────────┐
                  │ Route=public  │    │   Route=advisor    │
                  │               │    │                    │
                  │  Monta        │    │ ¿sesión activa?    │
                  │  PublicCatalog│    │   │           │      │
                  │  (limpio)     │    │  no          sí     │
                  └───────────────┘    │   │           │      │
                                       │   ▼           ▼      │
                                       │ Confirmación  Monta  │
                                       │ "¿Entrar al  Advisor │
                                       │  modo asesor?" Dashboard│
                                       │   │           │      │
                                       │   ├─ Cancelar │      │
                                       │   │   → '/'    │      │
                                       │   │            │      │
                                       │   └─ Entrar   │      │
                                       │       │      │      │
                                       │       ▼      │      │
                                       │   sessionStorage      │
                                       │   'admin_session'    │
                                       │       = '1'          │
                                       │                      │
                                       └──────────────────────┘

Acciones:
  · "Salir del modo asesor" → limpia sessionStorage → navega a '/'
  · Cierre del navegador   → sessionStorage se descarta → sesión cerrada
```

## Persistencia

| Almacén | Clave | Contenido | Efecto de la feature |
|---|---|---|---|
| `localStorage` | `electrohogar_cr_products_v2` | `Product[]` | Sin cambios |
| `localStorage` | `electrohogar_cr_profile_v2` | `CardProfile` | Sin cambios |
| `localStorage` | `electrohogar_cr_settings_v2` | `AdvisorSettings` | Sin cambios |
| `sessionStorage` | `electrohogar_cr_admin_session` | `'1'` | **NUEVO** — habilita el modo asesor en esta pestaña hasta cerrar el navegador |

**Sin migración**: ninguna forma de dato persistido cambia. Los catálogos, perfiles y ajustes ya
guardados en el navegador siguen funcionando sin transformación.

## Reglas de derivación

| Regla | Comportamiento | Requisito |
|---|---|---|
| **Resolución de ruta** | `/asesor` (con o sin barra final) ⇒ asesor; todo lo demás ⇒ público | FR-001, FR-007 |
| **URL pública del catálogo** | `origin + '/'`, nunca el `href` actual | FR-011 |
| **QR de la tarjeta** | Apunta siempre a la URL pública del catálogo | FR-011 |
| **Comisión** | Solo se renderiza si `advisorSettings.advisorModeEnabled` | FR-003 |
| **Acciones de administración** | Solo se renderizan si `isAdvisor === true` | FR-002, FR-004 |
| **Acceso al modo asesor** | Requiere confirmación explícita y sesión activa | FR-007 |
| **Cierre de sesión** | Al cerrar el navegador (`sessionStorage` se vacía) | FR-008 |
| **Aislamiento entre pestañas** | `sessionStorage` es por pestaña | FR-016 |
