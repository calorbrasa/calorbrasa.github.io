# Base de datos de productos

`products.json` alimenta las tarjetas de producto, la página de producto
con dashboard y el comparador. Esquema definido por el prompt 2
("Base de Datos CalorBrasa"), adaptado de la colección de Hostinger a
nuestro JSON propio — **mismos nombres de campo**, para que cualquier
dato que nos pases más adelante encaje sin renombrar nada.

No usamos "Datos de prueba" / "Datos en tiempo real" como en Hostinger:
aquí solo existe `products.json`, que hace de única fuente de datos.

## Campos por producto

Identificación interna (no forma parte del prompt 2, propio de esta implementación):

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador único (slug). Necesario para enlazar a la página de producto individual. |

Conservados del esquema original:

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre del producto. |
| `description` | string | Descripción corta (tarjeta / cabecera de producto). |
| `affiliate_link` | string | Enlace de afiliado de Amazon. |
| `isFeatured` | boolean | Si aparece destacado en portada. |
| `showInTopMenu` | boolean | Reservado para uso futuro (nuestro menú de 5 categorías es fijo, no depende de este campo por ahora). |
| `retailPrice` | number | Precio original en euros. |
| `discountedPrice` | number \| null | Precio rebajado, si lo hay. Si es `null`, se muestra solo `retailPrice`. |
| `category` | string | Una de: `pellets`, `lena-biomasa`, `electricos`, `gas`, `radiadores` (clasificación de menú). |

Eliminados (respecto a un posible esquema anterior): `image` (campo de archivo), `range`.

Añadido — Imagen:

| Campo | Tipo | Descripción |
|---|---|---|
| `image_url` | string | URL de la imagen. Si está vacío, se muestra un icono de reemplazo (🔥) — nunca una imagen rota. Si la URL falla al cargar, el JS la oculta automáticamente y muestra el mismo icono. |

Añadido — Identificación:

| Campo | Tipo |
|---|---|
| `marca` | string |
| `rango_precio` | `"bajo"` (&lt;200€) \| `"medio"` (200-700€) \| `"alto"` (&gt;700€) |

Añadido — Especificaciones técnicas:

| Campo | Tipo | Notas |
|---|---|---|
| `tipo_combustible` | `pellet` \| `leña` \| `eléctrico` \| `gas butano-propano` \| `gas natural` | |
| `superficie_calefactable_m2` | number | |
| `potencia_kw` | number | |
| `coste_diario_estimado_eur` | number | Uso estimado de 8h/día. |
| `tiempo_calentamiento_min` | number | |
| `capacidad_deposito_kg` | number \| null | Solo pellet/leña. `null` si no aplica. |
| `nivel_ruido_db` | number \| null | `null` si no aplica (p. ej. leña sin ventilador). |
| `peso_kg` | number | |
| `niveles_potencia` | number \| null | |
| `tipo_instalacion` | `portátil (enchufar y usar)` \| `requiere salida de humos` \| `instalación profesional` | |
| `eficiencia_energetica` | `A+++` \| `A++` \| `A+` \| `A` \| `B` | |
| `garantia_años` | number | |

Añadido — Puntuaciones 0-10 (gráfico radar, usado en la página de producto/dashboard):

`score_facilidad_uso`, `score_eficiencia`, `score_confort`, `score_calidad_precio`, `score_autonomia`, `score_potencia` — todas number.

Añadido — Contenido editorial:

| Campo | Tipo | Notas |
|---|---|---|
| `ideal_para` | string | |
| `pros` | string[] | **Nota:** el prompt original pedía texto con valores separados por `\|` (limitación de los campos de texto de Hostinger). Aquí usamos array de strings directamente porque JSON lo soporta de forma nativa — mismo contenido, formato más robusto. Si nos pasas texto con `\|`, lo convertimos a array al incorporarlo. |
| `contras` | string[] | Igual que `pros`. |
| `destacado_editorial` | string | |

Añadido — Opiniones de clientes:

| Campo | Tipo |
|---|---|
| `valoracion_media` | number (decimal, ej. 4.3) |
| `resenas_cantidad` | number |
| `resenas_resumen` | string |

Todos los campos de las secciones "Añadido" son opcionales / pueden ir vacíos o `null`.

## Convenciones de datos reales

- `affiliate_link`: si vale exactamente `"PENDIENTE"`, el sitio muestra
  el botón de Amazon deshabilitado ("Enlace pendiente") en vez de un
  enlace roto. Sustitúyelo por la URL de afiliado real cuando la tengas.
- `capacidad_deposito_kg`: `0` significa "no aplica" (eléctrico/gas),
  igual que `null` en los placeholders — la página de producto oculta
  el dato si vale `0`, `null` o está vacío.
- `image_url` vacío (`""`) — no se muestra imagen (icono de reemplazo).

## Cómo añadir productos nuevos (proceso "prompt 3")

Cuando pegues el contenido de páginas de Amazon (separadas por
`---PRODUCTO---`), genero directamente el CSV con las 36 columnas de
este esquema, en español, con `;` como separador, estimando los
campos que falten (coste diario, scores 0-10, rango_precio, etc.) de
forma coherente entre productos similares — y lo incorporo yo mismo a
`products.json` sin que tengas que pasar por un CSV intermedio, salvo
que prefieras revisarlo tú primero.

## Estado actual (119 productos, catálogo completo)

- **Estufas de pellets**: 37 productos reales (STUFE A PELLET ITALIA,
  EIDER BIOMASA, JOIMA, FLAM ENERGIE, Ecomont).
- **Estufas de leña/biomasa**: 28 productos reales (EIDER BIOMASA, Prity,
  MAESTRO FERRETERO, BRONPI, OutInFire, CasaNovae24, Bilake, LNEE,
  NEMAXX, OtoSystem, Prometey, JUAN PANADERO, Sannover).
- **Calefactores eléctricos**: 37 productos reales (chimeneas eléctricas
  decorativas, estufas de cuarzo/halógenas, calefactores cerámicos,
  convectores y calefactores de baño — HOMCOM, Cecotec, Orbegozo, Dreo,
  Adler, KAMINIO, TRESKO, KESSER, Amazon Basics, Rowenta, etc.).
- **Radiadores**: 5 productos reales (Cecotec ReadyWarm 7000 Space de
  aceite; Cecotec Ready Warm 6650/6670/6750 Crystal Connection con WiFi;
  Orbegozo RMN 2050 Mica System).
- **Calefactores de gas**: 12 productos reales (Orbegozo x3, Cecotec x3,
  EVOCAMP, JUPPLIES, HAEGER, Güde, Outsunny, SOGO).

Las 5 categorías del menú ya tienen datos reales — no quedan placeholders.

**Distinción radiadores vs. calefactores eléctricos**: dentro de los
productos "eléctricos" que me pasas, clasifico como **radiadores** los
que dan calor gradual y silencioso sin ventilador (aceite, paneles
Mica, o paneles de cristal tipo "Crystal Connection"), y como
**calefactores eléctricos** el resto: calor rápido con ventilador,
cerámicos, cuarzo/halógenos y chimeneas eléctricas decorativas — aunque
el título del producto en Amazon diga "radiador" (es habitual que las
marcas usen ese término libremente para SEO).

`affiliate_link` usa el formato limpio `amazon.es/dp/<ASIN>?tag=<tu-tag-de-afiliado>`
en todos los productos reales. Algunos campos que Amazon no indicaba
explícitamente (nivel de ruido, tiempo de calentamiento, coste diario
estimado, garantía, superficie cuando solo daban m³) están estimados a
partir del resto de especificaciones — por transparencia, ajústalos si
tienes el dato exacto.

**Control de duplicados**: cuando pegues más enlaces de Amazon, antes de
añadirlos comparo el ASIN (parte de la URL `/dp/<ASIN>`) contra los ya
existentes en `affiliate_link` y descarto cualquier enlace que ya esté
en el catálogo, avisándote de cuáles fueron.

## Páginas estáticas para SEO

Cada vez que cambies `products.json`, ejecuta desde la raíz del repo:

```bash
python3 tools/build_static.py
```

Regenera `producto/<id>.html` (una ficha estática por producto), `categoria/*.html`
(una página por categoría) y `sitemap.xml`. Estas son las URLs que indexa Google;
`producto.html?id=...` redirige automáticamente a la ficha estática.

## Precios reales de Amazon (preparado, sin activar)

La web solo muestra un precio exacto si el producto tiene estos dos campos,
rellenados por un proceso automático con la Creators API de Amazon:

| Campo | Tipo | Descripción |
|---|---|---|
| `precio_api` | number | Precio en Amazon.es obtenido de la Creators API. |
| `precio_api_fecha` | string (ISO 8601) | Fecha y hora en que se obtuvo el precio. |

- Si faltan o el dato tiene más de 24 h, se muestra la gama de precio (€ / €€ / €€€),
  tanto en las páginas dinámicas (js/main.js) como en las estáticas (tools/build_static.py).
- Junto al precio sale la fecha y hora, y en el aviso de afiliados el texto obligatorio de Amazon.
- **Nunca escribir estos campos a mano**: las normas de Afiliados de Amazon solo permiten mostrar
  precios obtenidos de su API. Lo mismo con estrellas y número de reseñas.
- Requisito para la API: 10 ventas cualificadas en los últimos 30 días.
