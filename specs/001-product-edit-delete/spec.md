# Feature Specification: Editar y eliminar productos del catálogo

**Feature Branch**: `001-product-edit-delete`

**Created**: 2026-11-10

**Status**: Complete — implementada y verificada el 2026-11-10 (ver `verification.md`)

**Input**: User description: "El asesor vende electrodomésticos puerta a puerta en Costa Rica. Hoy puede agregar productos al catálogo pero NO puede corregirlos ni quitarlos: si escribe mal un precio, se queda así para siempre; si agrega un producto por error, queda fantasma en el catálogo que el cliente ve. Necesita poder editar cualquier producto existente y eliminarlo, con seguridad."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Corregir un producto ya publicado (Priority: P1)

La asesora de ElectroHogar recorre una tienda de Gollo o EPA, fotografía un producto y lo agrega al
catálogo. Al volver con la casa del cliente descubre que la tienda cambió el precio o que escribió
mal la capacidad. Abre la ficha del producto, corrige el precio de contado, la cuota quincenal, la
garantía y las especificaciones, y guarda. La tarjeta del catálogo y el mensaje de WhatsApp
muestran de inmediato los valores corregidos, con el mismo precio que verá el cliente.

**Why this priority**: Es el defecto más costoso del flujo actual. Un precio mal capturado se
convierte en una cotización incorrecta frente al cliente final en la puerta de su casa. Sin edición, el
único camino es agregar el producto duplicado, lo que duplica el catálogo y confunde al comprador.

**Independent Test**: Cargar el catálogo, abrir la ficha de un producto, cambiar el precio de
contado a un valor distinto, guardar, y verificar que el catálogo, la ficha del producto y el
enlace de WhatsApp muestran el nuevo valor. Funciona de forma completa sin tocar ninguna otra
funcionalidad.

**Acceptance Scenarios**:

1. **Given** un producto en el catálogo, **When** la asesora abre su ficha y edita el precio de
   contado, **Then** el nuevo precio se muestra en la tarjeta del catálogo con el mismo formato
   de colones que el resto del catálogo.
2. **Given** un producto en el catálogo, **When** la asesora edita sus especificaciones
   (capacidad, dimensiones, voltaje, eficiencia) o su descripción, **Then** la ficha del producto
   muestra los valores nuevos y los adicionales ya no aparecen.
3. **Given** un producto en el catálogo, **When** la asesora edita el precio de lista (normal) y
   deja el precio de contado menor, **Then** el descuento en efectivo se recalcula y se muestra
   como porcentaje en la tarjeta y en la ficha.
4. **Given** una edición en curso, **When** la asesora cancela sin guardar, **Then** el producto
   conserva sus valores originales y ningún cambio queda aplicado.
5. **Given** un producto editado, **When** la asesora reinicia o recarga el navegador, **Then** la
   edición sigue vigente porque el catálogo editado se conserva entre sesiones.

---

### User Story 2 - Quitar un producto por error (Priority: P2)

La asesora agregó el mismo refrigerador dos veces por una duda de precio, o agregó un artículo que
la tienda ya no tiene. Necesita quitarlo. Abre la ficha del producto, elige eliminar, y el sistema
le pide confirmación mostrando el nombre exacto del producto. Al confirmar, el producto desaparece
del catálogo, del contador de productos mostrados y de los resultados de búsqueda.

**Why this priority**: Un catálogo con productos fantasma resta credibilidad a la venta y puede
llevar a la asesora a ofrecer un artículo agotado. Es el complemento natural de poder agregar y
editar.

**Independent Test**: Agregar un producto de prueba, abrir su ficha, eliminarlo, confirmar, y
verificar que ya no aparece en el catálogo ni en la búsqueda, y que el contador baja en uno.

**Acceptance Scenarios**:

1. **Given** un producto en el catálogo, **When** la asesora elige eliminarlo y confirma, **Then**
   el producto se elimina del catálogo y el contador de productos mostrados se reduce en uno.
2. **Given** un producto en el catálogo, **When** la asesora elige eliminarlo pero cancela la
   confirmación, **Then** el producto permanece en el catálogo sin cambios.
3. **Given** un producto eliminado, **When** la asesora busca por su nombre o SKU, **Then** el
   producto ya no aparece en los resultados.
4. **Given** un producto eliminado, **When** la asesora reinicia o recarga el navegador, **Then**
   el producto sigue eliminado porque el catálogo se conserva entre sesiones.

---

### User Story 3 - Deshacer una eliminación equivocada (Priority: P3)

La asesora presiona eliminar sobre el producto equivocado —el nombre se le parece al de al
lado— y confirma. Se da cuenta un segundo después. Necesita recuperarlo sin volver a escribir
todo el producto a mano.

**Why this priority**: Es una red de seguridad sobre el P2. No aporta una capacidad nueva de
catálogo, pero evita la pérdida de trabajo y la desconfianza en la función de eliminar.

**Independent Test**: Eliminar un producto, usar la acción de deshacer dentro del período
disponible, y verificar que el producto regresa al catálogo con todos sus valores intactos.

**Acceptance Scenarios**:

1. **Given** un producto eliminado hace pocos segundos, **When** la asesora activa la acción de
   deshacer, **Then** el producto vuelve al catálogo con su nombre, precio, imagen y
   especificaciones intactos.
2. **Given** un producto eliminado hace tiempo suficiente, **When** la asesora intenta deshacer y
   la acción ya no está disponible, **Then** el catálogo queda como está, sin producto fantasma.
3. **Given** un producto eliminado y luego deshecho, **When** la asesora reinicia el navegador,
   **Then** el producto permanece restaurado en el catálogo.

---

### Edge Cases

- ¿Qué pasa si la asesora edita el precio de contado y lo deja mayor que el precio de lista? El
  sistema MUST normalizar la relación entre ambos precios para que nunca exista un "descuento"
  negativo ni una etiqueta de precio tachado incoherente.
- ¿Qué pasa si la asesora borra todos los caracteres del precio de contado? El campo MUST exigir
  un valor numérico válido antes de permitir guardar.
- ¿Qué pasa si la asesora edita el nombre de un producto y lo deja vacío? El sistema MUST
  impedir el guardado con un mensaje en español que explique qué falta.
- ¿Qué pasa si el catálogo queda sin ningún producto? La vista MUST explicar en español que el
  catálogo está vacío y ofrecer la acción de agregar un producto, en lugar de mostrar un error o
  una pantalla en blanco.
- ¿Qué pasa si la asesora edita el teléfono del WhatsApp de la tarjeta y borra los dígitos? La
  tarjeta MUST conservar el formato de teléfono costarricense y la vista previa MUST indicar que
  falta un número válido en lugar de generar un enlace roto.
- ¿Qué pasa si el producto editado tenía una imagen que ya no está disponible en su dirección web?
  El catálogo MUST seguir mostrando el producto con una imagen de respaldo en lugar de un ícono
  roto.
- ¿Qué pasa si la asesora edita un producto mientras el catálogo se sincroniza entre dos pestañas
  abiertas del navegador? La edición MUST partir del estado más reciente conocido y MUST NOT pisar
  cambios de otra pestaña sin avisar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La asesora MUST poder abrir la edición de cualquier producto existente del
  catálogo desde la ficha del producto.
- **FR-002**: El formulario de edición MUST estar precargado con todos los valores actuales del
  producto (nombre, marca, tienda, categoría, precios, cuota quincenal, plazo, garantía, SKU,
  imagen, etiqueta, descripción y especificaciones).
- **FR-003**: La asesora MUST poder modificar cada uno de esos campos y guardar el producto como
  una sola unidad coherente; el producto MUST conservar su identidad (mismo SKU y mismo
  identificador) después de editarlo.
- **FR-004**: El catálogo MUST ofrecer una acción visible para eliminar un producto desde la
  ficha del producto.
- **FR-005**: La eliminación MUST requerir una confirmación explícita que muestre el nombre
  exacto del producto a eliminar, y MUST revertirse por completo si la asesora cancela.
- **FR-006**: Las ediciones y eliminaciones MUST conservarse al recargar o reiniciar el
  navegador, junto con el resto del catálogo.
- **FR-007**: El formulario MUST validar en español, antes de guardar, que el nombre, el precio de
  contado y el precio de lista sean valores presentes y válidos, y MUST indicar qué campo falta.
- **FR-008**: Si el precio de contado queda igual o por encima del precio de lista, el sistema MUST
  ajustar el precio de lista para que nunca se muestre un descuento negativo ni un precio de
  lista tachado que sea inferior al precio de contado.
- **FR-009**: El porcentaje de descuento en efectivo MUST derivarse de los precios de contado y de
  lista, y MUST actualizarse automáticamente al guardar.
- **FR-010**: La cuota quincenal MUST poder especificarse de forma explícita por la asesora y,
  cuando se deje en blanco, MUST calcularse con la misma regla de financiamiento que usa el
  formulario de alta de productos.
- **FR-011**: La ficha del producto MUST mostrar el plazo y la cuota que realmente tiene el
  producto, sin valores fijos que contradigan a los datos guardados.
- **FR-012**: La asesora MUST poder deshacer la eliminación de un producto dentro de un período
  breve posterior a la eliminación, y la restauración MUST devolver el producto con todos sus
  valores intactos.
- **FR-013**: Cuando el catálogo no contenga ningún producto, la vista MUST mostrar un estado
  vacío en español con una acción para agregar un producto.
- **FR-014**: El catálogo MUST seguir funcionando de forma idéntica para una asesora que no
  utilize las acciones de edición o eliminación.
- **FR-015**: Los mensajes, textos de ayuda, errores de validación y confirmaciones de esta
  funcionalidad MUST estar en español costarricense, con precios en colones (₡) y teléfonos con
  prefijo +506.

### Key Entities

- **Producto**: publicación del catálogo con nombre, marca, tienda de referencia (Gollo, EPA o
  ambas), categoría, precio de lista, precio de contado, cuota quincenal estimada, plazo en
  meses, meses de garantía, SKU, imagen, etiqueta promocional, descripción y especificaciones
  técnicas (capacidad, dimensiones, voltaje, eficiencia, color y lista de detalles).
- **Catálogo**: conjunto ordenado de productos de la asesora, con una entrada por producto, que
  sobrevive a la recarga del navegador.
- **Cambio pendiente de eliminación**: producto recién eliminado que la asesora todavía puede
  recuperar durante un período breve.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La asesora completa la corrección de un producto (abrir, editar, guardar) en menos
  de 60 segundos, sin recargar la página.
- **SC-002**: El 100% de las ediciones quedan visibles de inmediato en el catálogo, en la ficha
  del producto y en el mensaje de WhatsApp que se envía al cliente, sin pasar por una recarga.
- **SC-003**: Ninguna eliminación ocurre sin una confirmación explícita que muestre el nombre del
  producto.
- **SC-004**: La asesora recupera un producto eliminado por error en el 100% de los casos en que
  usa la acción de deshacer dentro del período disponible.
- **SC-005**: Las ediciones y eliminaciones sobreviven a la recarga del navegador en el 100% de
  los casos verificados.
- **SC-006**: Todos los textos nuevos de esta funcionalidad están en español costarricense, con
  precios en colones y teléfonos con prefijo +506.
- **SC-007**: La asesora no necesita ayuda externa para encontrar la acción de editar ni la de
  eliminar: ambas son descubribles desde la ficha del producto que ya usa a diario.

## Assumptions

- La asesora es la única usuaria del catálogo en su dispositivo; el catálogo sigue siendo local al
  navegador y no se comparten datos entre dispositivos más allá de lo que ya hace la versión
  actual.
- La edición y la eliminación se ofrecen desde la ficha del producto, que es el punto donde la
  asesora ya revisa precios y cuotas antes de hablar con el cliente.
- El formulario de edición reutiliza el formulario de alta de productos ya existente, de modo que
  ambas pantallas se comportan igual y no se mantienen dos listas de campos que puedan divergir.
- La eliminación se puede deshacer solo mientras la asesora está en la misma sesión de
  navegación; un reinicio del navegador cierra esa posibilidad.
- El periodo durante el cual se puede deshacer una eliminación es breve (segundos), suficiente
  para detectar el error inmediato.
- No se agrega autenticación, backend, sincronización entre dispositivos ni collaborative en esta
  feature: la app sigue siendo local al navegador.
- El catálogo inicial de ejemplo sigue siendo la base sobre la que opera la asesora; esta feature
  no cambia su contenido ni lo reinicia.
