#!/usr/bin/env python3
"""
CalorBrasa — Generador de páginas estáticas para SEO.

Lee data/products.json y genera:
  - producto/<id>.html      una ficha estática por producto (contenido en el HTML,
                            título, descripción, canonical y schema.org propios)
  - categoria/<slug>.html   una página por categoría con su listado de productos
  - sitemap.xml             con todas las URLs indexables

Uso (desde la raíz del repo):
    python3 tools/build_static.py

Vuelve a ejecutarlo cada vez que cambies data/products.json.
"""

import json
import os
from datetime import date, datetime, timezone
from html import escape

SITE = "https://calorbrasa.github.io"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GA_ID = "G-QXVWVPP7SK"
CALC_URL = "https://calculadora-calefaccion.github.io/"  # web hermana: calculadora de calefacción
TODAY = date.today().isoformat()

CATEGORIES = {
    "pellets": {
        "slug": "estufas-de-pellets",
        "label": "Estufas de pellets",
        "h1": "Estufas de pellets: comparativa y guía de compra",
        "title": "Estufas de pellets: comparativa, precios y opiniones",
        "intro": (
            "Las estufas de pellets son una de las formas más económicas de calentar una vivienda "
            "completa: queman pellet de madera prensada de forma automática, se pueden programar y "
            "mantienen una temperatura estable durante muchas horas con una sola carga del depósito. "
            "A cambio, necesitan salida de humos y una instalación correcta."
        ),
        "tips": [
            "<strong>Potencia según superficie:</strong> como referencia orientativa, 1 kW por cada 8–10 m² en una vivienda bien aislada. Con mal aislamiento o techos altos, sube un escalón.",
            "<strong>Autonomía:</strong> fíjate en la capacidad del depósito (kg) y el consumo por hora; cuanto más grande, menos recargas.",
            "<strong>Ruido:</strong> los modelos con ventilador (aire forzado) calientan antes pero suenan más; mira los dB si va en un dormitorio o salón.",
            "<strong>Canalizable y WiFi:</strong> las canalizables llevan el calor a otras habitaciones; el WiFi permite encenderla antes de llegar a casa.",
        ],
    },
    "lena-biomasa": {
        "slug": "estufas-de-lena",
        "label": "Estufas de leña / biomasa",
        "h1": "Estufas de leña y biomasa: comparativa y guía de compra",
        "title": "Estufas de leña: comparativa, precios y opiniones",
        "intro": (
            "Las estufas de leña ofrecen calor intenso y agradable, funcionan sin electricidad y "
            "aportan el ambiente de un fuego real. Son ideales para casas de pueblo, chalets y "
            "viviendas donde la leña es barata o accesible. Requieren salida de humos y algo más de "
            "atención que una estufa de pellets."
        ),
        "tips": [
            "<strong>Potencia y superficie:</strong> elige según los m² reales que quieres calentar; una estufa sobredimensionada trabaja a baja carga y ensucia más el cristal y el tiro.",
            "<strong>Material:</strong> el hierro fundido acumula y reparte el calor más tiempo; el acero calienta antes.",
            "<strong>Horno y placa:</strong> algunos modelos permiten cocinar o mantener comida caliente, útil en casas de campo.",
            "<strong>Rendimiento:</strong> busca doble combustión y buen rendimiento para gastar menos leña y ensuciar menos.",
        ],
    },
    "electricos": {
        "slug": "calefactores-electricos",
        "label": "Calefactores eléctricos",
        "h1": "Calefactores eléctricos: comparativa y guía de compra",
        "title": "Calefactores eléctricos: comparativa, precios y opiniones",
        "intro": (
            "Los calefactores eléctricos dan calor inmediato sin obras ni instalación: se enchufan y "
            "listo. Son perfectos para calentar una habitación concreta durante un rato (baño, "
            "despacho, dormitorio) o como apoyo a la calefacción principal. Incluyen calefactores "
            "cerámicos, de cuarzo, convectores, termoventiladores y chimeneas eléctricas decorativas."
        ),
        "tips": [
            "<strong>Consumo:</strong> un aparato de 2.000 W consume unos 2 kWh por hora a máxima potencia; úsalo para estancias pequeñas o periodos cortos.",
            "<strong>Tipo:</strong> cerámicos y termoventiladores calientan rápido; los convectores reparten el calor de forma más uniforme; los de cuarzo calientan lo que tienen delante.",
            "<strong>Seguridad:</strong> busca protección antivuelco y contra sobrecalentamiento, sobre todo con niños o mascotas.",
            "<strong>Termostato y temporizador:</strong> evitan que esté encendido más de lo necesario y ahorran en la factura.",
        ],
    },
    "gas": {
        "slug": "calefactores-de-gas",
        "label": "Calefactores de gas",
        "h1": "Estufas y calefactores de gas: comparativa y guía de compra",
        "title": "Estufas de gas butano: comparativa, precios y opiniones",
        "intro": (
            "Las estufas de gas butano o propano dan mucha potencia sin depender de la red eléctrica "
            "y se pueden mover de una habitación a otra. Son una alternativa práctica para viviendas "
            "sin calefacción central, segundas residencias o espacios grandes que se usan a ratos."
        ),
        "tips": [
            "<strong>Llama azul, infrarrojos o catalítica:</strong> la llama azul calienta el ambiente, la de infrarrojos da calor directo y la catalítica es la más silenciosa.",
            "<strong>Seguridad:</strong> imprescindible el analizador de atmósfera (corta el gas si baja el oxígeno) y ventilar la estancia de vez en cuando.",
            "<strong>No en dormitorios ni baños:</strong> no se recomienda usarlas en estancias pequeñas y cerradas.",
            "<strong>Coste:</strong> depende del precio de la bombona; calcula cuántas horas te dura cada una a la potencia que vas a usar.",
        ],
    },
    "radiadores": {
        "slug": "radiadores-electricos",
        "label": "Radiadores",
        "h1": "Radiadores eléctricos: comparativa y guía de compra",
        "title": "Radiadores eléctricos: comparativa, precios y opiniones",
        "intro": (
            "Los radiadores eléctricos (de aceite, mica o de panel) dan un calor uniforme y "
            "silencioso, sin ventiladores, por lo que son una buena opción para dormitorios, salas "
            "de estar y despachos donde se pasa muchas horas."
        ),
        "tips": [
            "<strong>Silencio:</strong> al no tener ventilador, son ideales para dormir o trabajar.",
            "<strong>Inercia:</strong> los de aceite tardan más en calentar pero siguen dando calor un rato tras apagarse; los de mica calientan antes.",
            "<strong>Programación:</strong> termostato digital, temporizador y control WiFi ayudan a no gastar de más.",
            "<strong>Montaje:</strong> comprueba si incluye ruedas o soporte de pared, según dónde lo vayas a usar.",
        ],
    },
}

SPEC_FIELDS = [
    ("tipo_combustible", "⛽", "Combustible", lambda v: str(v), False),
    ("superficie_calefactable_m2", "📐", "Superficie", lambda v: f"Hasta {fmt_num(v)} m²", False),
    ("potencia_kw", "⚡", "Potencia", lambda v: f"{fmt_num(v)} kW", False),
    ("coste_diario_estimado_eur", "💶", "Coste diario estimado (8h)", lambda v: fmt_price(v), False),
    ("tiempo_calentamiento_min", "⏱️", "Tiempo de calentamiento", lambda v: f"{fmt_num(v)} min", False),
    ("capacidad_deposito_kg", "🪣", "Capacidad del depósito", lambda v: f"{fmt_num(v)} kg", True),
    ("nivel_ruido_db", "🔈", "Nivel de ruido", lambda v: f"{fmt_num(v)} dB", True),
    ("peso_kg", "⚖️", "Peso", lambda v: f"{fmt_num(v)} kg", False),
    ("niveles_potencia", "🔥", "Niveles de potencia", lambda v: fmt_num(v), True),
    ("tipo_instalacion", "🔧", "Instalación", lambda v: str(v), False),
    ("eficiencia_energetica", "🌱", "Eficiencia energética", lambda v: str(v), False),
    ("garantia_años", "🛡️", "Garantía", lambda v: f"{fmt_num(v)} años", False),
]

SCORE_FIELDS = [
    ("score_facilidad_uso", "🧑‍🔧", "Facilidad de uso"),
    ("score_eficiencia", "🌱", "Eficiencia energética"),
    ("score_confort", "🛋️", "Confort"),
    ("score_calidad_precio", "💰", "Calidad-precio"),
    ("score_autonomia", "🔋", "Autonomía"),
    ("score_potencia", "🔥", "Potencia"),
]


# ---------------------------------------------------------------- utilidades

def fmt_num(v):
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    return str(v).replace(".", ",")


def fmt_price(v):
    if v is None:
        return ""
    s = f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    if s.endswith(",00"):
        s = s[:-3]
    return f"{s} €"


def e(v):
    return escape(str(v), quote=True)


def truncate(text, n=155):
    text = " ".join(str(text).split())
    if len(text) <= n:
        return text
    cut = text[: n - 1].rsplit(" ", 1)[0].rstrip(",.;:")
    return cut + "…"


def price_of(p):
    return p["discountedPrice"] if p.get("discountedPrice") is not None else p["retailPrice"]


def has_discount(p):
    return p.get("discountedPrice") is not None and p["discountedPrice"] < p["retailPrice"]


def score(p, prior=4.2, weight=20):
    """Valoración ponderada: 5/5 con 3 opiniones no gana a 4,6/5 con 900."""
    n = p.get("resenas_cantidad") or 0
    r = p.get("valoracion_media") or 0
    return (r * n + prior * weight) / (n + weight)


def is_pending(link):
    return not link or link.strip().upper() == "PENDIENTE"


# ---- Nota CalorBrasa, gama de precio, insignias (igual que js/main.js)

SCORE_KEYS = ["score_eficiencia", "score_confort", "score_potencia",
              "score_autonomia", "score_facilidad_uso", "score_calidad_precio"]

GAMAS = {
    "bajo": ("€", "Gama económica", "menos de 200 €"),
    "medio": ("€€", "Gama media", "200–700 €"),
    "alto": ("€€€", "Gama alta", "más de 700 €"),
}

# Precio exacto SOLO si viene de la Creators API de Amazon (campos precio_api y
# precio_api_fecha) y tiene menos de 24 h. Normas de Afiliados de Amazon.
PRICE_MAX_AGE_H = 24
PRICE_DISCLAIMER = (
    "Los precios y disponibilidad del Producto son precisos en la fecha y hora indicados y están "
    "sujetos a cambios. El precio y la disponibilidad que se muestren en Amazon.es en el momento de "
    "la compra serán los que se apliquen a la compra del producto."
)


def nota(p):
    vals = [p[k] for k in SCORE_KEYS if isinstance(p.get(k), (int, float))]
    return sum(vals) / len(vals) if vals else None


def nota_text(p):
    n = nota(p)
    return "–" if n is None else f"{n:.1f}".replace(".", ",")


def nota_html(p, big=False):
    n = nota(p)
    if n is None:
        return ""
    lvl = "top" if n >= 8 else "good" if n >= 7 else "ok"
    return (
        f'<span class="cb-nota cb-nota-{lvl}{" cb-nota-big" if big else ""}" '
        'title="Nota CalorBrasa: media de eficiencia, confort, potencia, autonomía, facilidad de uso y calidad-precio">'
        f"<b>{nota_text(p)}</b><small>Nota CalorBrasa</small></span>"
    )


def gama_html(p):
    g = GAMAS.get(p.get("rango_precio"))
    if not g:
        return ""
    return f'<span class="cb-gama"><b>{g[0]}</b> {g[1]} <span>· {g[2]}</span></span>'


def has_api_price(p):
    if not isinstance(p.get("precio_api"), (int, float)) or not p.get("precio_api_fecha"):
        return False
    try:
        when = datetime.fromisoformat(str(p["precio_api_fecha"]).replace("Z", "+00:00"))
    except ValueError:
        return False
    if when.tzinfo is None:
        when = when.replace(tzinfo=timezone.utc)
    age_h = (datetime.now(timezone.utc) - when).total_seconds() / 3600
    return 0 <= age_h <= PRICE_MAX_AGE_H


def price_html(p, big=False):
    """Precio de la API con fecha y hora; si no lo hay, la gama de precio."""
    if not has_api_price(p):
        return gama_html(p)
    when = datetime.fromisoformat(str(p["precio_api_fecha"]).replace("Z", "+00:00"))
    stamp = when.astimezone().strftime("%d/%m/%Y %H:%M")
    return (
        f'<span class="cb-price{" cb-price-big" if big else ""}"><b>{fmt_price(p["precio_api"])}</b>'
        f"<small>Precio en Amazon.es a {stamp}. Puede cambiar.</small></span>"
    )


def cb_name(p):
    name = str(p.get("name") or "")
    marca = p.get("marca")
    if not marca or name.upper().startswith(str(marca).upper()):
        return name
    return f"{marca} {name}"


BADGES = [
    ("top", "Mejor valorada", lambda x: nota(x) or 0),
    ("calidad", "Mejor calidad-precio", lambda x: (x.get("score_calidad_precio") or 0) * 10 + (nota(x) or 0)),
    ("gasto", "Menos gasto diario", lambda x: -x["coste_diario_estimado_eur"] if isinstance(x.get("coste_diario_estimado_eur"), (int, float)) else None),
    ("eficiente", "Más eficiente", lambda x: (x.get("score_eficiencia") or 0) * 10 + (nota(x) or 0)),
]


def compute_badges(products):
    """Una insignia por producto como máximo, por categoría (mismo criterio que la web)."""
    out = {}
    for cat in dict.fromkeys(x["category"] for x in products):
        pool = [x for x in products if x["category"] == cat]
        for key, label, fn in BADGES:
            best, best_v = None, None
            for x in pool:
                v = fn(x)
                if v is not None and (best_v is None or v > best_v):
                    best, best_v = x, v
            if best is None:
                continue
            out[best["id"]] = [(key, label)]
            pool = [x for x in pool if x["id"] != best["id"]]
    return out


def badges_html(badges):
    return "".join(f'<span class="cb-badge cb-badge-{k}">{e(label)}</span>' for k, label in (badges or []))


def img_html(p, cls=""):
    fallback = "window.cbImgFail?cbImgFail(this):this.remove()"
    if not p.get("image_url"):
        return '<span class="cb-img-fallback" aria-hidden="true"><img src="/assets/favicon.svg" alt=""></span>'
    return (
        f'<img class="{cls}" src="{e(p["image_url"])}" alt="{e(cb_name(p))}" loading="lazy" '
        f'onerror="{fallback}">'
    )


def product_url(p):
    return f"/producto/{p['id']}.html"


def category_url(cat):
    return f"/categoria/{CATEGORIES[cat]['slug']}.html"


def ga_attrs(p):
    return (
        f'data-ga-amazon-click data-ga-id="{e(p["id"])}" data-ga-name="{e(p["name"])}" '
        f'data-ga-category="{e(p.get("category", ""))}" data-ga-price="{price_of(p)}"'
    )


def amazon_cta(p, extra=""):
    if is_pending(p.get("affiliate_link")):
        return f'<span class="btn btn-amazon is-disabled {extra}">Enlace pendiente</span>'
    return (
        f'<a class="btn btn-amazon {extra}" href="{e(p["affiliate_link"])}" target="_blank" '
        f'rel="nofollow sponsored noopener" {ga_attrs(p)}>Ver precio en Amazon</a>'
    )


def json_ld(obj):
    return (
        '<script type="application/ld+json">'
        + json.dumps(obj, ensure_ascii=False).replace("</", "<\\/")
        + "</script>"
    )


# ---------------------------------------------------------------- plantilla

NAV_SHORT = {
    "pellets": "Pellets", "lena-biomasa": "Leña", "electricos": "Eléctricos",
    "gas": "Gas", "radiadores": "Radiadores",
}


def nav_links(short=False):
    items = "".join(
        f'<li><a href="{category_url(c)}">{e(NAV_SHORT[c] if short else CATEGORIES[c]["label"])}</a></li>'
        for c in CATEGORIES
    )
    return items


def page(title, description, canonical, body, extra_head="", scripts="", price_notice=False):
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{e(title)}</title>
  <meta name="description" content="{e(description)}">
  <link rel="canonical" href="{SITE}{canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="CalorBrasa">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(description)}">
  <meta property="og:url" content="{SITE}{canonical}">
  <meta property="og:locale" content="es_ES">
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="stylesheet" href="/css/styles.css">
{extra_head}
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', '{GA_ID}');
  </script>
</head>
<body>

  <header class="site-header">
    <div class="container header-inner">
      <a href="/" class="logo"><img src="/assets/favicon.svg" alt="" width="34" height="34"><span class="logo-word">Calor<span>Brasa</span></span></a>

      <nav class="main-nav" id="main-nav" aria-label="Principal">
        <ul>
          {nav_links(short=True)}
          <li><a href="/comparador.html">Comparador</a></li>
          <li><a href="/asistente.html" class="nav-quiz-link">¿Cuál elijo?</a></li>
        </ul>
      </nav>

      <button class="nav-toggle" id="nav-toggle" aria-label="Abrir menú" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

{body}

  <p class="affiliate-notice">Como Afiliado de Amazon, CalorBrasa obtiene ingresos por las compras adscritas que cumplen los requisitos aplicables. El precio y la disponibilidad de cada producto se consultan en Amazon.{(" " + PRICE_DISCLAIMER) if price_notice else ""}</p>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <h4>CalorBrasa</h4>
          <p style="color:#d8d3cf; font-size:0.88rem;">Guías y comparativas para elegir la calefacción perfecta para tu hogar.</p>
          <a href="/asistente.html" class="btn btn-quiz" style="margin-top:6px;">¿Cuál elijo?</a>
        </div>
        <div>
          <h4>Categorías</h4>
          <ul>
            {nav_links()}
          </ul>
        </div>
        <div>
          <h4>Herramientas</h4>
          <ul>
            <li><a href="/asistente.html">Asistente: ¿cuál elijo?</a></li>
            <li><a href="/comparador.html">Comparador de estufas</a></li>
            <li><a href="{CALC_URL}" target="_blank" rel="noopener">Calculadora de calefacción</a></li>
            <li><a href="/#preguntas">Preguntas frecuentes</a></li>
          </ul>
        </div>
        <div>
          <h4>Legal</h4>
          <ul>
            <li><a href="/aviso-afiliados.html">Aviso de afiliados de Amazon</a></li>
            <li><a href="/privacidad.html">Política de privacidad</a></li>
            <li><a href="/aviso-legal.html">Aviso legal</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        © <span id="year">{date.today().year}</span> CalorBrasa. Todos los derechos reservados.
      </div>
    </div>
  </footer>

  <!-- Popup de suscripción (exit intent) -->
  <div class="exit-popup" id="exit-popup" hidden>
    <div class="exit-popup-content">
      <button class="exit-popup-close" id="exit-popup-close" aria-label="Cerrar">×</button>
      <h3>¿Quieres elegir mejor tu calefacción?</h3>
      <p>Suscríbete y recibe nuestra guía gratuita + comparativas exclusivas antes que nadie.</p>
      <form id="exit-popup-form">
        <input type="email" name="email" placeholder="Tu correo electrónico" required>
        <button type="submit" class="btn btn-primary">Quiero la guía gratis</button>
      </form>
    </div>
  </div>

  <script src="/js/main.js"></script>
{scripts}
</body>
</html>
"""


def breadcrumb(items):
    """items: lista de (nombre, url o None)."""
    html_items = []
    for name, url in items:
        if url:
            html_items.append(f'<a href="{url}">{e(name)}</a>')
        else:
            html_items.append(f'<span aria-current="page">{e(name)}</span>')
    html = '<nav class="breadcrumb" aria-label="Migas de pan">' + ' <span class="sep">›</span> '.join(html_items) + "</nav>"
    schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": name, **({"item": SITE + url} if url else {})}
            for i, (name, url) in enumerate(items)
        ],
    }
    return html, json_ld(schema)


def product_card(p, badges=None):
    url = product_url(p)
    specs = []
    if p.get("superficie_calefactable_m2") is not None:
        specs.append(f'<li>📐 Calienta hasta <b>{fmt_num(p["superficie_calefactable_m2"])} m²</b></li>')
    if p.get("potencia_kw") is not None:
        specs.append(f'<li>⚡ Potencia: {fmt_num(p["potencia_kw"])} kW</li>')
    if p.get("coste_diario_estimado_eur") is not None:
        specs.append(f'<li>💶 Gasto: <b>{fmt_price(p["coste_diario_estimado_eur"])}/día</b> (8 h)</li>')
    if p.get("tipo_instalacion"):
        inst = str(p["tipo_instalacion"])
        specs.append(f"<li>🔧 {e(inst[:1].upper() + inst[1:])}</li>")
    quote = f'<p class="product-quote">{e(p["destacado_editorial"])}</p>' if p.get("destacado_editorial") else ""
    badge_row = f'<div class="product-badges">{badges_html(badges)}</div>' if badges else ""
    return f"""
      <article class="product-card">
        {badge_row}
        <a class="product-image" href="{url}" tabindex="-1" aria-hidden="true">{img_html(p)}</a>
        <div class="product-body">
          <span class="category-tag">{e(CATEGORIES[p["category"]]["label"])}</span>
          <h3><a href="{url}" style="color:inherit; text-decoration:none;">{e(cb_name(p))}</a></h3>
          <div class="product-score">{nota_html(p)}{price_html(p)}</div>
          <ul class="specs">{"".join(specs)}</ul>
          {quote}
          <div class="card-actions">
            {amazon_cta(p)}
            <a class="btn btn-details" href="{url}">Ver análisis</a>
          </div>
        </div>
      </article>"""


# ---------------------------------------------------------------- fichas

def product_schema(p):
    """Product + valoración editorial propia (sin precio ni estrellas de Amazon)."""
    schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": cb_name(p),
        "description": p.get("description") or p.get("destacado_editorial"),
        "sku": p["id"],
        "url": SITE + product_url(p),
    }
    if p.get("image_url"):
        schema["image"] = [p["image_url"]]
    if p.get("marca"):
        schema["brand"] = {"@type": "Brand", "name": p["marca"]}
    n = nota(p)
    if n is not None:
        schema["review"] = {
            "@type": "Review",
            "author": {"@type": "Organization", "name": "CalorBrasa"},
            "reviewRating": {"@type": "Rating", "ratingValue": round(n, 1), "bestRating": 10, "worstRating": 0},
            "reviewBody": p.get("destacado_editorial"),
        }
    return json_ld({k: v for k, v in schema.items() if v is not None})


def build_product(p, all_products):
    cat = CATEGORIES[p["category"]]
    url = product_url(p)

    price_note = "" if has_api_price(p) else "<small>Consulta el precio actual y los gastos de envío en Amazon.</small>"
    price_row = f'{nota_html(p, big=True)}<span class="detail-gama">{price_html(p, big=True)}{price_note}</span>'
    img = img_html(p)
    badge_row = f'<div class="detail-badges">{badges_html(BADGE_MAP.get(p["id"]))}</div>' if BADGE_MAP.get(p["id"]) else ""

    specs = []
    for key, icon, label, fmt, hide_zero in SPEC_FIELDS:
        v = p.get(key)
        if v is None or v == "":
            continue
        if hide_zero and float(v) == 0:
            continue
        specs.append(
            f'<div class="spec-item"><span class="spec-icon">{icon}</span><span>'
            f'<span class="spec-label">{label}</span><span class="spec-value">{e(fmt(v))}</span></span></div>'
        )

    scores = "".join(
        f'<div class="score-item"><span>{icon} {label}</span>'
        f'<span class="score-value">{fmt_num(p.get(key)) if p.get(key) is not None else "-"}/10</span></div>'
        for key, icon, label in SCORE_FIELDS
    )
    score_data = json.dumps([p.get(k) or 0 for k, _, _ in SCORE_FIELDS])
    score_labels = json.dumps([label for _, _, label in SCORE_FIELDS], ensure_ascii=False)

    ideal = (
        f'<div class="ideal-para-box"><span class="icon">🙋</span><div><h3>Ideal para</h3>'
        f'<p style="margin:0;">{e(p["ideal_para"])}</p></div></div>'
        if p.get("ideal_para")
        else ""
    )

    pros = p.get("pros") or []
    contras = p.get("contras") or []
    pros_cons = ""
    if pros or contras:
        pros_html = (
            '<div class="pros-list"><h3>Pros</h3><ul>'
            + "".join(f"<li>✅ <span>{e(x)}</span></li>" for x in pros)
            + "</ul></div>"
            if pros
            else ""
        )
        cons_html = (
            '<div class="cons-list"><h3>Contras</h3><ul>'
            + "".join(f"<li>❌ <span>{e(x)}</span></li>" for x in contras)
            + "</ul></div>"
            if contras
            else ""
        )
        pros_cons = f'<div class="pros-cons-grid">{pros_html}{cons_html}</div>'

    reviews = ""
    if p.get("resenas_resumen"):
        reviews = (
            '<div class="reviews-block"><h2 style="margin-bottom:6px;">Lo que destacan los compradores</h2>'
            f'<blockquote>“{e(p["resenas_resumen"])}”</blockquote>'
            '<p class="section-note">Resumen elaborado por CalorBrasa. Consulta las opiniones completas en Amazon.</p></div>'
        )

    description = (
        f'<div class="detail-description"><h2>Descripción</h2><p>{e(p["description"])}</p></div>'
        if p.get("description")
        else ""
    )

    # Productos relacionados: misma categoría y superficie parecida, sin repetir
    # el mismo modelo en otro color; primero los de mejor nota.
    def base_name(x):
        import re as _re
        n = _re.sub(r"\b(blanco|blanca|negro|negra|rojo|roja|gris|burdeos|marfil|beige|antracita|bronce|crema|plata|marr[oó]n)\b", "", cb_name(x).lower())
        return " ".join(n.split())
    seen = {base_name(p)}
    m2 = p.get("superficie_calefactable_m2") or 0
    candidates = sorted(
        (x for x in all_products if x["category"] == p["category"] and x["id"] != p["id"]),
        key=lambda x: (abs((x.get("superficie_calefactable_m2") or 0) - m2), -(nota(x) or 0)),
    )
    related = []
    for x in candidates:
        b = base_name(x)
        if b in seen:
            continue
        seen.add(b)
        related.append(x)
        if len(related) == 4:
            break
    related.sort(key=lambda x: -(nota(x) or 0))
    related_html = ""
    if related:
        related_html = (
            f'<section class="related-products"><h2>Otras {e(cat["label"].lower())} que te pueden interesar</h2>'
            f'<div class="product-grid">{"".join(product_card(x, BADGE_MAP.get(x["id"])) for x in related)}</div>'
            f'<p style="margin-top:18px;"><a class="btn btn-outline" href="{category_url(p["category"])}">Ver todas las {e(cat["label"].lower())}</a></p>'
            "</section>"
        )

    bc_html, bc_schema = breadcrumb(
        [("Inicio", "/"), (cat["label"], category_url(p["category"])), (cb_name(p), None)]
    )

    eyebrow = e(cat["label"]) + (f' · {e(p["marca"])}' if p.get("marca") else "")
    destacado = f'<p class="destacado">{e(p["destacado_editorial"])}</p>' if p.get("destacado_editorial") else ""

    body = f"""  <main class="container product-detail" id="product-detail" data-product-id="{e(p['id'])}">
    {bc_html}
    <article>
      <section class="detail-top">
        <div class="detail-hero">
          <div class="eyebrow">{eyebrow}</div>
          {badge_row}
          <h1>{e(cb_name(p))}</h1>
          {destacado}
          <div class="price-row">{price_row}</div>
          <div class="hero-cta-row">
            {amazon_cta(p)}
            <a class="btn btn-outline" href="/comparador.html?m1={e(p['id'])}">⚖️ Comparar este producto</a>
          </div>
        </div>

        <div class="detail-image-col">{img}</div>

        <div class="detail-specs-col">
          <h2>Especificaciones técnicas</h2>
          <div class="specs-grid">{"".join(specs)}</div>
        </div>

        <div class="detail-radar-col">
          <h2>Puntuaciones</h2>
          <div class="radar-grid">
            <div class="radar-chart-wrap"><canvas id="radar-chart" height="260"></canvas></div>
            <div class="score-list">{scores}</div>
          </div>
        </div>
      </section>

      <div class="cta-band">{amazon_cta(p)}</div>

      {ideal}
      <a class="calc-callout" href="{CALC_URL}" target="_blank" rel="noopener">
        <span class="calc-callout-icon" aria-hidden="true">€</span>
        <span><b>¿Cuánto te costará al mes en tu casa?</b> Calcúlalo gratis según tus metros, tu provincia y lo que usas ahora.</span>
        <span class="calc-callout-go">Abrir la calculadora →</span>
      </a>
      {pros_cons}
      {reviews}
      {description}

      <div class="cta-band">{amazon_cta(p)}</div>
    </article>

    {related_html}

    <div class="detail-sticky">
      <span class="detail-sticky-name">{e(cb_name(p))}</span>
      {amazon_cta(p)}
    </div>
  </main>"""

    scripts = f"""  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    (function () {{
      var canvas = document.getElementById("radar-chart");
      if (!canvas || typeof Chart === "undefined") return;
      new Chart(canvas, {{
        type: "radar",
        data: {{
          labels: {score_labels},
          datasets: [{{
            label: "Puntuación",
            data: {score_data},
            borderColor: "#C1440E",
            backgroundColor: "rgba(193, 68, 14, 0.15)",
            pointBackgroundColor: "#C1440E",
            borderWidth: 2
          }}]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{ legend: {{ display: false }} }},
          scales: {{ r: {{ min: 0, max: 10, ticks: {{ stepSize: 2, backdropColor: "transparent" }},
            grid: {{ color: "#e7e0d6" }}, angleLines: {{ color: "#e7e0d6" }}, pointLabels: {{ font: {{ size: 11 }} }} }} }}
        }}
      }});
    }})();
  </script>"""

    brand_prefix = f'{p["marca"]} ' if p.get("marca") and not p["name"].upper().startswith(p["marca"].upper()) else ""
    title = f'{brand_prefix}{p["name"]}: opiniones, precio y análisis | CalorBrasa'
    desc = truncate(p.get("description") or p.get("destacado_editorial") or p["name"])
    extra_head = ""
    if p.get("image_url"):
        extra_head += f'  <meta property="og:image" content="{e(p["image_url"])}">\n'
    extra_head += "  " + product_schema(p) + "\n  " + bc_schema + "\n"

    shows_price = has_api_price(p) or any(has_api_price(x) for x in related)
    return page(title, desc, url, body, extra_head, scripts, price_notice=shows_price)


# ---------------------------------------------------------------- categorías

def build_category(cat_key, all_products):
    cat = CATEGORIES[cat_key]
    url = category_url(cat_key)
    items = [p for p in all_products if p["category"] == cat_key]
    import math
    items.sort(
        key=lambda p: (-(1 if (p.get("isFeatured") or BADGE_MAP.get(p["id"])) else 0),
                       -((nota(p) or 0) * math.log((p.get("resenas_cantidad") or 0) + 3)))
    )
    costs = [p["coste_diario_estimado_eur"] for p in items if p.get("coste_diario_estimado_eur") is not None]
    surfaces = [p["superficie_calefactable_m2"] for p in items if p.get("superficie_calefactable_m2") is not None]

    top = sorted(items, key=lambda p: -(nota(p) or 0))[:3]
    cheapest = min(items, key=price_of)  # solo para saber cuál es; no se muestra el precio
    gamas = [g for g in ("bajo", "medio", "alto") if any(p.get("rango_precio") == g for p in items)]
    cheapest_run = min((p for p in items if p.get("coste_diario_estimado_eur") is not None), key=lambda p: p["coste_diario_estimado_eur"], default=None)

    stats = [
        f"<li><strong>{len(items)}</strong> modelos analizados</li>",
        ("<li>Gamas de precio: " if len(gamas) > 1 else "<li>Gama de precio: ") + ", ".join(f"<strong>{GAMAS[g][0]} {GAMAS[g][1].replace('Gama ', '')}</strong> ({GAMAS[g][2]})" for g in gamas) + "</li>",
    ]
    if costs:
        stats.append(
            f"<li>Coste de uso estimado entre <strong>{fmt_price(min(costs))}</strong> y <strong>{fmt_price(max(costs))}</strong> al día (8 h)</li>"
        )
    if surfaces:
        stats.append(
            f"<li>Superficie calefactable de <strong>{fmt_num(min(surfaces))}</strong> a <strong>{fmt_num(max(surfaces))} m²</strong></li>"
        )

    highlights = [
        f'<li><strong>Mejor valorada:</strong> <a href="{product_url(top[0])}">{e(cb_name(top[0]))}</a> '
        f'(Nota CalorBrasa {nota_text(top[0])})</li>',
        f'<li><strong>Más asequible:</strong> <a href="{product_url(cheapest)}">{e(cb_name(cheapest))}</a></li>',
    ]
    if cheapest_run:
        highlights.append(
            f'<li><strong>Menor coste de uso:</strong> <a href="{product_url(cheapest_run)}">{e(cb_name(cheapest_run))}</a> '
            f'({fmt_price(cheapest_run["coste_diario_estimado_eur"])}/día)</li>'
        )

    bc_html, bc_schema = breadcrumb([("Inicio", "/"), (cat["label"], None)])

    item_list = json_ld(
        {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": cat["h1"],
            "itemListElement": [
                {"@type": "ListItem", "position": i + 1, "url": SITE + product_url(p), "name": cb_name(p)}
                for i, p in enumerate(items)
            ],
        }
    )

    body = f"""  <main class="container category-page">
    {bc_html}
    <header class="category-header">
      <h1>{e(cat["h1"])}</h1>
      <p class="section-subtitle">{e(cat["intro"])}</p>
    </header>

    <section class="category-summary">
      <div>
        <h2>En esta comparativa</h2>
        <ul>{"".join(stats)}</ul>
      </div>
      <div>
        <h2>Destacadas</h2>
        <ul>{"".join(highlights)}</ul>
      </div>
    </section>

    <section>
      <h2>Todas las {e(cat["label"].lower())}</h2>
      <p class="section-subtitle">¿Quieres filtrar por precio, superficie o marca? Usa el
        <a href="/productos.html?categoria={cat_key}">catálogo con filtros</a> o el
        <a href="/asistente.html">asistente “¿Cuál elijo?”</a>.</p>
      <div class="product-grid">{"".join(product_card(p, BADGE_MAP.get(p["id"])) for p in items)}</div>
    </section>

    <a class="calc-callout" href="{CALC_URL}" target="_blank" rel="noopener">
      <span class="calc-callout-icon" aria-hidden="true">€</span>
      <span><b>¿Cuánto gastarás con {e(cat["label"].lower())}?</b> Compara el coste al mes con tu casa, tu provincia y tu calefacción actual.</span>
      <span class="calc-callout-go">Abrir la calculadora →</span>
    </a>

    <section class="category-guide">
      <h2>Cómo elegir: claves antes de comprar</h2>
      <ul>{"".join(f"<li>{t}</li>" for t in cat["tips"])}</ul>
      <p>Si dudas entre dos modelos, ponlos lado a lado en el <a href="/comparador.html">comparador</a>.</p>
    </section>
  </main>"""

    title = f'{cat["title"]} ({date.today().year}) | CalorBrasa'
    desc = truncate(
        f'Comparamos {len(items)} {cat["label"].lower()} por potencia, metros que calientan, gasto diario y nuestra '
        f'Nota CalorBrasa. Encuentra la mejor para tu casa.'
    )
    extra_head = "  " + item_list + "\n  " + bc_schema + "\n"
    return page(title, desc, url, body, extra_head, price_notice=any(has_api_price(p) for p in items))


# ---------------------------------------------------------------- sitemap

def build_sitemap(products):
    urls = [
        ("/", "weekly", "1.0"),
        ("/productos.html", "weekly", "0.8"),
    ]
    urls += [(category_url(c), "weekly", "0.9") for c in CATEGORIES]
    urls += [
        ("/comparador.html", "monthly", "0.6"),
        ("/asistente.html", "monthly", "0.7"),
    ]
    urls += [(product_url(p), "monthly", "0.7") for p in products]
    urls += [
        ("/aviso-afiliados.html", "yearly", "0.2"),
        ("/privacidad.html", "yearly", "0.2"),
        ("/aviso-legal.html", "yearly", "0.2"),
    ]
    out = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path, freq, prio in urls:
        out.append(
            f"  <url>\n    <loc>{SITE}{path}</loc>\n    <lastmod>{TODAY}</lastmod>\n"
            f"    <changefreq>{freq}</changefreq>\n    <priority>{prio}</priority>\n  </url>"
        )
    out.append("</urlset>\n")
    return "\n".join(out)


# ---------------------------------------------------------------- main

BADGE_MAP = {}


def main():
    global BADGE_MAP
    with open(os.path.join(ROOT, "data", "products.json"), encoding="utf-8") as f:
        products = json.load(f)
    BADGE_MAP = compute_badges(products)

    prod_dir = os.path.join(ROOT, "producto")
    cat_dir = os.path.join(ROOT, "categoria")
    os.makedirs(prod_dir, exist_ok=True)
    os.makedirs(cat_dir, exist_ok=True)

    # Limpia fichas de productos que ya no existen
    valid = {f"{p['id']}.html" for p in products}
    for name in os.listdir(prod_dir):
        if name.endswith(".html") and name not in valid:
            os.remove(os.path.join(prod_dir, name))

    for p in products:
        with open(os.path.join(prod_dir, f"{p['id']}.html"), "w", encoding="utf-8") as f:
            f.write(build_product(p, products))

    for c in CATEGORIES:
        with open(os.path.join(cat_dir, f"{CATEGORIES[c]['slug']}.html"), "w", encoding="utf-8") as f:
            f.write(build_category(c, products))

    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(build_sitemap(products))

    print(f"OK: {len(products)} fichas, {len(CATEGORIES)} categorías, sitemap actualizado.")


if __name__ == "__main__":
    main()
