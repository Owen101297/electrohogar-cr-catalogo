# Feature Specification: Panel administrativo del catálogo y tarjeta de presentación en PNG

**Feature Branch**: `004-panel-admin-tarjeta-png`

**Created**: 2026-11-10

**Status**: Complete — implementada y verificada en producción el 2026-11-10 (ver `verification.md`)

**Input**: User description: "En la página de asesor necesito implementar otra cosa, que sea el panel administrativo del catálogo digital. Y la tarjeta la necesito en .png con estilo profesional, minimalista. Usa 21st para crear la tarjeta y todo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el estado de mi catálogo en un panel (Priority: P1)

La asesora de ElectroHogar abre su panel de trabajo y quiere saber, de un vistazo, cómo va su
catálogo: cuántos productos tiene, qué valor total representa, cuál es el precio promedio, cuánto
descuento promedio ofrece y cuánta comisión potencial genera si vende todo. Quiere ver cómo se
reparte el catálogo entre tiendas y categorías para saber qué está cubriendo y qué le falta.

**Why this priority**: Hoy la asesora solo ve la cuadrícula de productos. No tiene ninguna lectura
del negocio: no sabe cuánto vale su inventario en el catálogo, ni qué porcentaje ofrece de
descuento, ni si tiene suficiente cobertura de productos. Esa información decide a quién visiting y
qué_producto empujar.

**Independent Test**: Abrir el panel con un catálogo conocido y verificar que todas las cifras
mostradas coinciden con el cálculo manual sobre esos mismos productos.

**Acceptance Scenarios**:

1. **Given** un catálogo con productos, **When** la asesora abre el panel, **Then** ve el número
   total de productos, el valor total del catálogo en colones, el precio de contado promedio, el
   descuento promedio y la comisión potencial, todo en español costarricense.
2. **Given** un catálogo con productos de distintas tiendas, **When** la asesora revisa la
   distribución, **Then** ve cuántas unidades y qué valor tiene cada tienda, con su porcentaje
   sobre el total.
3. **Given** un catálogo con productos de distintas categorías, **When** la asesora revisa la
   distribución, **Then** ve lo mismo por categoría.
4. **Given** un catálogo con productos, **When** la asesora mira los productos destacados, **Then**
   ve los de mayor valor y los de mayor descuento, con su precio y su porcentaje.
5. **Given** un catálogo vacío, **When** la asesora abre el panel, **Then** ve un estado vacío en
   español con la acción de agregar el primer producto, no una pantalla en blanco ni ceros sin
   explicación.
6. **Given** un catálogo con productos, **When** la asesora busca un producto en la tabla de
   gestión, **Then** la tabla filtra y el resto del panel no se ve afectado.

---

### User Story 2 - Gestionar el catálogo desde una tabla (Priority: P1)

La asesora necesita quitar productos agotados o corregir precios sin salir del panel. Quiere una
tabla de todos sus productos con su imagen, nombre, marca, tienda, precio y descuento, y desde
cada fila editar o eliminar el producto.

**Why this priority**: Es la misma operación que ya hace en la cuadrícula, pero en formato de tabla
densa, que es como trabaja un catálogo de decenas de productos. Es el complemento natural del
panel y no puede esperar: sin gestión, el panel es solo un tablero de lectura.

**Independent Test**: Agregar un producto de prueba, localizarlo en la tabla, editar su precio y
eliminarlo, y verificar que el catálogo y las cifras del panel se actualizan.

**Acceptance Scenarios**:

1. **Given** el panel con productos, **When** la asesora revisa la tabla, **Then** ve una fila por
   producto con su imagen, nombre, marca, tienda, precio de contado y descuento.
2. **Given** una fila de la tabla, **When** la asesora elige editar, **Then** se abre el formulario
   de edición con los datos del producto y el cambio queda guardado.
3. **Given** una fila de la tabla, **When** la asesora elige eliminar, **Then** se pide
   confirmación y el producto desaparece del catálogo y de las cifras del panel.
4. **Given** muchos productos, **When** la asesora ordena la tabla por precio, por descuento o por
   nombre, **Then** el orden se aplica de inmediato.

---

### User Story 3 - Descargar la tarjeta de presentación en PNG (Priority: P1)

La asesora quiere llevar la tarjeta de presentación a la imprenta o compartirla por WhatsApp. Hoy
solo puede imprimirla desde el navegador, lo que obliga a tener impresora o a pelear con el
diálogo de impresión del sistema. Necesita descargar la tarjeta como imagen PNG de calidad
professional para mandarla a la imprenta, publicarla en redes o compartirla.

**Why this priority**: La tarjeta es el instrumento de venta. Sin poder descargarla como imagen, la
asesora depende de una impresora o de un celular con captura de pantalla, y ninguna de las dos
opciones da un archivo listo para imprenta.

**Independent Test**: Descargar el PNG desde el diseñador y abrir el archivo: debe tener las
dimensiones correctas, verse nítido y contener la marca, el contacto de WhatsApp y el código QR
legible.

**Acceptance Scenarios**:

1. **Given** el diseñador de tarjetas, **When** la asesora descarga el anverso, **Then** obtiene un
   archivo PNG con la marca, el lema, el WhatsApp y la zona de cobertura, en alta resolución.
2. **Given** el diseñador de tarjetas, **When** la asesora descarga el reverso, **Then** obtiene un
   archivo PNG con el código QR apuntando al catálogo publicado y los pasos para usarlo.
3. **Given** el diseñador de tarjetas, **When** la asesora descarga la hoja completa, **Then**
   obtiene un PNG con las 8 tarjetas con sus marcas de corte, listo para enviar a imprenta.
4. **Given** un PNG descargado, **When** la asesora lo escanea con el teléfono, **Then** el código
   QR abre el catálogo público con los productos y sus precios.
5. **Given** que la asesora cambió el nombre de la marca o el teléfono, **When** descarga el PNG,
   **Then** el archivo refleja los datos nuevos.
6. **Given** un PNG descargado, **When** la asesora lo imprime o lo amplía, **Then** el texto y el
   código QR se mantienen nítidos.

---

### Edge Cases

- ¿Qué pasa si la asesora descarga el PNG sin haber escrito el teléfono? La tarjeta MUST mostrar un
  aviso de que falta el número, no un enlace vacío ni un texto de relleno.
- ¿Qué pasa si el catálogo tiene productos pero ninguno tiene descuento? El descuento promedio
  MUST mostrarse como 0% de forma explícita, y el gráfico de descuentos MUST indicar que ningún
  producto lo tiene.
- ¿Qué pasa si la asesora cambia la paleta de color de la tarjeta? El PNG descargado MUST usar la
  paleta nueva, no la anterior.
- ¿Qué pasa si el navegador no permite descargar el archivo (política de permisos)? El sistema
  MUST informar en español que la descarga no se pudo completar y ofrecer la vía alternativa de
  imprimir.
- ¿Qué pasa si el catálogo tiene un solo producto? El panel MUST mostrar las cifras sin dividir
  entre cero y la distribución debe mostrar 100% para ese único elemento.
- ¿Qué pasa si la asesora cambia de dispositivo y el catálogo guardado allí es distinto? El panel
  MUST reflejar los datos del dispositivo donde está trabajando, sin intentar sincronizar nada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El modo asesor MUST incluir un panel administrativo del catálogo digital, alcanzable
  desde la propia página de la asesora.
- **FR-002**: El panel MUST mostrar el total de productos del catálogo.
- **FR-003**: El panel MUST mostrar el valor total del catálogo en colones, sumando el precio de
  contado de cada producto.
- **FR-004**: El panel MUST mostrar el precio de contado promedio del catálogo en colones.
- **FR-005**: El panel MUST mostrar el descuento promedio en porcentaje.
- **FR-006**: El panel MUST mostrar la comisión potencial del catálogo en colones, aplicando el
  margen configurado por la asesora.
- **FR-007**: El panel MUST mostrar la distribución de productos por tienda, con unidades, valor y
  porcentaje sobre el total.
- **FR-008**: El panel MUST mostrar la distribución de productos por categoría, con unidades, valor
  y porcentaje sobre el total.
- **FR-009**: El panel MUST destacar los productos de mayor valor y los de mayor descuento.
- **FR-010**: El panel MUST incluir una tabla de gestión con una fila por producto, mostrando
  imagen, nombre, marca, tienda, precio de contado y descuento.
- **FR-011**: La tabla de gestión MUST permitir editar y eliminar productos, con las mismas
  confirmaciones y la misma acción de deshacer que el resto de la aplicación.
- **FR-012**: La tabla de gestión MUST permitir buscar por nombre, marca o SKU, y ordenar por
  nombre, precio o descuento.
- **FR-013**: El panel MUST mostrar un estado vacío en español cuando el catálogo no tenga
  productos, con la acción de agregar uno.
- **FR-014**: El diseñador de tarjetas MUST permitir descargar el anverso, el reverso y la hoja
  completa como archivos PNG independientes.
- **FR-015**: Los PNG descargados MUST tener resolución de impresión: al menos 300 DPI para el
  tamaño estándar de 3.5" × 2" (85 × 54 mm).
- **FR-016**: El PNG del anverso MUST contener el logotipo, el nombre de la marca, el lema
  comercial, el WhatsApp con prefijo +506 y la zona de cobertura.
- **FR-017**: El PNG del reverso MUST contener el código QR apuntando al catálogo público y los
  pasos para escanearlo.
- **FR-018**: El PNG de la hoja completa MUST contener las 8 tarjetas con sus marcas de corte.
- **FR-019**: La vista previa de la tarjeta y el PNG descargado MUST ser el mismo diseño: lo que se
  ve en pantalla es exactamente lo que se descarga.
- **FR-020**: La tarjeta MUST mantener un estilo profesional y minimalista, sin nombres de personas
  naturales y sin adornos que impidan su lectura en tamaño real.
- **FR-021**: Si falta el teléfono de WhatsApp, el diseñador MUST advertirlo en español antes de
  permitir la descarga.
- **FR-022**: Si una descarga falla por permisos del navegador, el sistema MUST informar en español
  y ofrecer la impresión como alternativa.
- **FR-023**: Todas las cifras del panel MUST recalcularse al agregar, editar o eliminar un
  producto, sin recargar la página.
- **FR-024**: Todos los textos de esta feature MUST estar en español costarricense, con precios
  en colones (₡) y teléfonos con prefijo +506.
- **FR-025**: El panel y el diseñador MUST ser inalcanzables desde el catálogo público.

### Key Entities

- **Métricas del catálogo**: derivación agregada del catálogo. No es una entidad persistida: se
  recalcula a partir de los productos.
  - `totalProductos`: cantidad de productos del catálogo.
  - `valorTotal`: suma de los precios de contado, en colones.
  - `precioPromedio`: valor total dividido entre el total de productos.
  - `descuentoPromedio`: promedio de los porcentajes de descuento de los productos.
  - `comisionPotencial`: valor total multiplicado por el margen configurado.
  - `porTienda`: agrupado por tienda, con unidades, valor y porcentaje.
  - `porCategoria`: agrupado por categoría, con unidades, valor y porcentaje.
  - `mayorValor` / `mayorDescuento`: productos destacados.
- **Fila de la tabla de gestión**: un producto con su imagen, nombre, marca, tienda, precio de
  contado y descuento, ordenable y filtrable.
- **Tarjeta imprimible**: pieza de 85 × 54 mm con dos caras (anverso de marca y contacto, reverso
  con QR) y su representación en PNG de alta resolución.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Todas las cifras del panel coinciden exactamente con el cálculo manual sobre el
  mismo catálogo.
- **SC-002**: La asesora encuentra el panel administrativo en un solo clic desde la página de la
  asesora.
- **SC-003**: La asesora localiza un producto concreto en la tabla de gestión en menos de 10
  segundos usando el buscador.
- **SC-004**: La asesora obtiene el PNG de la tarjeta en un máximo de 3 clics desde el diseñador.
- **SC-005**: El PNG descargado tiene al menos 1000 px de ancho por tarjeta y el código QR es
  escaneable en pantalla y en papel.
- **SC-006**: El PNG descargado y la vista previa en pantalla son visualmente idénticos.
- **SC-007**: El panel no muestra ningún dato de comisión al cliente del catálogo público.
- **SC-008**: Todos los textos nuevos están en español costarricense con precios en colones y
  teléfonos con prefijo +506.

## Assumptions

- El panel vive dentro del modo asesor (`/asesor`), como una tercera pestaña junto al catálogo y
  al diseñador de tarjetas. No es una ruta nueva: el acceso del asesor ya está protegido.
- El catálogo sigue siendo el de `localStorage`; el panel es una lectura y una gestión sobre los
  mismos datos, no una fuente de datos nueva.
- La tarjeta se renderiza sobre un lienzo (canvas) para que la vista previa y el PNG sea el mismo
  resultado. Esto evita dependencias adicionales de conversión DOM a imagen.
- La resolución de impresión se fija en 300 DPI: 85 mm × 300/25.4 ≈ 1004 px de ancho y
  54 mm × 300/25.4 ≈ 638 px de alto por tarjeta.
- El diseño toma como base el sistema de tokens de 21st.dev (tema minimal), combinado con la
  paleta corporativa de ElectroHogar (azul zafiro y oro) ya definida en `src/data/palettes.ts`.
- La hoja completa mantiene las 8 tarjetas por hoja, con el anverso y el reverso alternados y sus
  marcas de corte.
- El logotipo es el monograma de marca ya usado en la aplicación, compuesto sobre el lienzo; no
  se añaden archivos de imagen externos ni dependencias.
- La modificación del diseño de la tarjeta no elimina la impresión en papel: ambas salidas
  coexisten.
