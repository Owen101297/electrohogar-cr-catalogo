# Feature Specification: Separar la vista pública del catálogo y la vista del asesor

**Feature Branch**: `002-vista-publica-asesor`

**Created**: 2026-11-10

**Status**: Complete — implementada y verificada en producción el 2026-11-10 (ver `verification.md`)

**Input**: User description: "La página web pública no debe mostrar nada de botones ni archivos de crear la tarjeta con QR, ni el porcentaje de ganancia, ni configuraciones de tarjeta. Modo usuario y modo asesor deben ser totalmente diferentes pantallas, con acceso del asesor por otra ruta y que se desactive al cerrar el navegador. Y la tarjeta debe quedar lista para imprimir."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el catálogo como cliente (Priority: P1)

Un cliente en la calle o en la puerta de su casa escanea el código QR de la tarjeta del asesor y
abre el sitio web. Lo que aparece es un catálogo limpio de electrodomésticos: puede buscar, filtrar
por tienda y categoría, ver la ficha técnica de cada producto y pedirlo por WhatsApp. No ve
ninguna herramienta de asesor, ningún porcentaje de ganancia, ningún botón de diseño de tarjetas
ni ningún archivo que se pueda imprimir.

**Why this priority**: Es el propósito central del cambio. El cliente que escanea el QR no debe
encontrarse con la operación interna del asesor ni con información de comisiones. Hoy la página
pública y la herramienta de trabajo están mezcladas y eso expone datos que el cliente no debe ver
y confunde la experiencia de compra.

**Independent Test**: Abrir el sitio sin ningún parámetro y recorrer el catálogo completo. Ningún
elemento de administración debe ser visible, alcanzable por teclado ni presente en el documento.

**Acceptance Scenarios**:

1. **Given** un cliente que abre el sitio, **When** carga la página, **Then** ve un encabezado con
   el logo de la marca, el nombre comercial y el acceso a WhatsApp, y debajo el catálogo.
2. **Given** un cliente que recorre el catálogo, **When** busca, filtra por tienda o categoría y
   ordena por precio, **Then** todas esas herramientas funcionan igual que antes.
3. **Given** un cliente que abre la ficha de un producto, **When** revisa la ficha, **Then** ve
   precios en colones, cuotas, especificaciones, garantía y el botón de pedir por WhatsApp, y
   **no** ve ninguna acción de editar o eliminar.
4. **Given** un cliente en cualquier pantalla, **When** revisa el pie de página, **Then** no
   encuentra ningún acceso al modo asesor ni ningún enlace a la tarjeta corporativa.
5. **Given** un cliente que mira una tarjeta de producto, **When** busca porcentajes de ganancia,
   **Then** no encuentra ninguno.

---

### User Story 2 - Trabajar como asesor (Priority: P1)

La asesora de ElectroHogar necesita, en su propia sesión de trabajo, agregar y editar productos,
ver sus comisiones, generar la tarjeta de presentación con QR e imprimirla. Para entrar a ese
modo recorre una dirección propia y distinta de la que ve el cliente, y al terminar cierra el
navegador: la sesión de asesor se cierra sola y la página pública vuelve a estar limpia.

**Why this priority**: Es la contraparte directa de la historia 1. La asesora conserva todas las
herramientas que usa a diario, pero en un espacio separado que el cliente nunca alcanza por
accidente y que desaparece al cerrar el navegador.

**Independent Test**: Entrar por la dirección del modo asesor, agregar un producto, generar la
tarjeta con QR e imprimir la hoja; luego cerrar y reabrir el navegador y comprobar que la página
pública vuelve a estar limpia.

**Acceptance Scenarios**:

1. **Given** la asesora que abre la dirección del modo asesor, **When** la página carga, **Then**
   ve la interfaz completa de trabajo con todas las herramientas de administración.
2. **Given** la asesora en modo asesor, **When** agrega, edita o elimina un producto, **Then** el
   cambio queda guardado y se refleja en el catálogo.
3. **Given** la asesora en modo asesor, **When** abre la calculadora de comisiones, **Then** ve su
   margen configurado y las proyecciones de ingreso.
4. **Given** la asesora en modo asesor, **When** cierra el navegador y lo vuelve a abrir en la
   dirección del modo asesor, **Then** la sesión de asesor está cerrada y debe volver a activarse.
5. **Given** la asesora en modo asesor, **When** busca una forma de volver a la vista pública,
   **Then** encuentra una acción visible que la lleva al catálogo limpio.

---

### User Story 3 - Imprimir la tarjeta de presentación (Priority: P1)

La asesora prepara la tarjeta de presentación que entrega en la calle: un lado con la marca y el
contacto de WhatsApp, el otro con el código QR que lleva al catálogo. Necesita el resultado
listo para mandar a imprenta o para imprimir en casa, con el código QR apuntando al catálogo
publicado y con marcas de corte para cortar las tarjetas.

**Why this priority**: La tarjeta es el punto de contacto físico con el cliente: es lo que hace
que el QR funcione. Si el QR no apunta al catálogo correcto, todo lo demás pierde valor.

**Independent Test**: Generar la tarjeta en el modo asesor, imprimir la hoja y comprobar que el
QR apunta al catálogo publicado y que las 8 tarjetas salen con sus marcas de corte.

**Acceptance Scenarios**:

1. **Given** la asesora en el diseñador de tarjetas, **When** genera la hoja, **Then** obtiene
   8 tarjetas de 3.5" × 2" con el anverso de marca y contacto y el reverso con el código QR.
2. **Given** una tarjeta generada, **When** se escanea el código QR con un teléfono, **Then** se
   abre el catálogo publicado con los productos y sus precios.
3. **Given** una tarjeta generada, **When** se imprime la hoja, **Then** sale una hoja de 8
   tarjetas con marcas de corte y sin los elementos de navegación de la pantalla.
4. **Given** la asesora en el diseñador, **When** revisa la vista previa, **Then** ve el anverso y
   el reverso de la tarjeta antes de imprimir, con la acción de imprimir claramente visible.

---

### Edge Cases

- ¿Qué pasa si alguien escribe la dirección del modo asesor a mano? El sistema MUST exigir una
  confirmación explícita antes de revelar la interfaz de administración, de modo que un cliente
  curioso no entre por accidente.
- ¿Qué pasa si el asesor deja la pestaña del modo asesor abierta y vuelve a ella al día siguiente
  sin cerrar el navegador? La sesión de asesor MUST seguir vigente, porque es la misma sesión del
  navegador; solo se cierra al cerrar el navegador.
- ¿Qué pasa si la asesora usa el modo asesor y luego abre el catálogo público en otra pestaña del
  mismo navegador? La vista pública MUST mostrarse limpia, sin herramientas, aunque la sesión de
  asesor esté activa en la otra pestaña.
- ¿Qué pasa si el cliente navega a una dirección interna que no existe? El sistema MUST mostrar
  el catálogo público, sin revelar la existencia del modo asesor.
- ¿Qué pasa si el QR se genera mientras el asesor está en la dirección del modo asesor? El código
  MUST apuntar al catálogo público publicado, nunca a la dirección interna de administración.
- ¿Qué pasa si el catálogo no tiene productos y se abre en la vista pública? El sistema MUST
  mostrar el estado vacío en español con la opción de contactar por WhatsApp, sin exponer
  herramientas de carga de productos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST servir dos pantallas distintas: un catálogo público y una
  interfaz de administración, en direcciones diferentes.
- **FR-002**: La pantalla pública MUST NOT mostrar botones, enlaces, textos ni archivos de
  creación de tarjetas con QR, de configuración de tarjeta ni de diseño de la tarjeta.
- **FR-003**: La pantalla pública MUST NOT mostrar porcentajes ni montos de ganancia del asesor.
- **FR-004**: La pantalla pública MUST NOT permitir agregar, editar ni eliminar productos.
- **FR-005**: La pantalla pública MUST NOT contener ningún enlace, botón ni texto que conduzca al
  modo asesor.
- **FR-006**: El catálogo público MUST mantener la búsqueda, el filtro por tienda, el filtro por
  categoría, el ordenamiento, la ficha técnica del producto y el pedido por WhatsApp.
- **FR-007**: El modo asesor MUST permanecer en una dirección propia, distinta de la del
  catálogo público, y MUST requerir una confirmación explícita antes de activarse.
- **FR-008**: La sesión de asesor MUST cerrarse automáticamente al cerrar el navegador y MUST
  requerir un nuevo ingreso manual en la próxima visita.
- **FR-009**: El modo asesor MUST conservar todas las herramientas actuales: alta, edición y
  eliminación de productos, calculadora de comisiones, diseñador de tarjetas con QR y vista
  digital de la tarjeta.
- **FR-010**: La sesión de asesor MUST ofrecer una acción visible para volver al catálogo
  público.
- **FR-011**: El código QR de la tarjeta MUST apuntar al catálogo público publicado, nunca a la
  dirección interna de administración.
- **FR-012**: La hoja de tarjetas MUST generar 8 tarjetas de 3.5" × 2" con el anverso de marca y
  contacto, el reverso con el QR, y marcas de corte.
- **FR-013**: La impresión MUST omitir toda la interfaz de navegación y mostrar únicamente la
  hoja de tarjetas con sus marcas de corte.
- **FR-014**: El diseñador MUST ofrecer una vista previa del anverso y el reverso y una acción de
  impresión claramente visible.
- **FR-015**: Todos los textos de ambas pantallas MUST estar en español costarricense, con
  precios en colones (₡) y teléfonos con prefijo +506.
- **FR-016**: El catálogo público MUST seguir funcionando cuando la sesión de asesor está activa
  en otra pestaña del mismo navegador.

### Key Entities

- **Sesión de asesor**: estado efímero que habilita la interfaz de administración. Vive en
  `sessionStorage`, por lo que se descarta al cerrar el navegador. No se comparte entre pestañas.
- **Catálogo público**: conjunto de productos y datos de marca que ve el cliente. Es de solo
  lectura para el visitante.
- **Tarjeta de presentación**: pieza imprimible de 85 × 54 mm con dos caras: anverso de marca y
  contacto, reverso con el código QR del catálogo público.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La revisión del catálogo público no encuentra ninguna referencia a tarjetas con QR,
  porcentajes de ganancia ni configuración de tarjeta, ni en lo visible ni en el texto de la
  página.
- **SC-002**: La revisión del catálogo público no encuentra ninguna acción de agregar, editar o
  eliminar producto.
- **SC-003**: El cliente completa su recorrido de compra —abrir el catálogo, buscar un producto,
  ver su ficha y abrir WhatsApp— sin encontrar ninguna interfaz de administración.
- **SC-004**: La asesora completa su flujo de trabajo —agregar un producto, ver su ganancia y
  generar la tarjeta— sin cambiar de dirección ni perder tiempo.
- **SC-005**: Tras cerrar y reabrir el navegador, la sesión de asesor está cerrada y la pantalla
  pública se muestra limpia.
- **SC-006**: El código QR impreso abre el catálogo público con los productos y sus precios.
- **SC-007**: La hoja impresa contiene 8 tarjetas con sus marcas de corte y ningún elemento de
  navegación de pantalla.

## Assumptions

- El sitio se publica en una sola dirección con rutas distintas: la ruta raíz es el catálogo
  público y una ruta interna es el modo asesor. Ambas se sirven desde el mismo despliegue.
- La ruta interna no se enlaza desde ningún lugar del sitio público; solo la conoce la asesora.
- El estado del catálogo, el perfil de marca y los ajustes de comisiones siguen guardados en el
  navegador de la asesora; no se introduce servidor, base de datos ni autenticación.
- La sesión de asesor se guarda en el almacenamiento de sesión del navegador, que se descarta al
  cerrar todas las ventanas de ese navegador.
- El catálogo público no permite agregar ni editar productos: es de consulta y contacto. La
  asesora trabaja siempre en el modo asesor.
- La tarjeta de presentación ya existente se conserva; el cambio solo garantiza que su QR
  apunte al catálogo público y que la hoja se imprima correctamente.
- La confirmación de ingreso al modo asesor no es una contraseña: es una acción deliberada de la
  asesora, suficiente para evitar ingresos accidentales por parte de clientes curiosos.
