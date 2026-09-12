/* =========================================================
   CalorBrasa — Página de detalle de producto (dashboard)
   ========================================================= */

const DETAIL_CATEGORY_LABELS = {
  pellets: "Estufas de pellets",
  "lena-biomasa": "Estufas de leña / biomasa",
  electricos: "Calefactores eléctricos",
  gas: "Calefactores de gas",
  radiadores: "Radiadores",
};

// Icono + etiqueta + formato de valor para cada especificación técnica.
// Los campos vacíos/null/0 (salvo que 0 sea un valor real) se ocultan.
const SPEC_FIELDS = [
  { key: "tipo_combustible", icon: "⛽", label: "Combustible", format: (v) => v },
  { key: "superficie_calefactable_m2", icon: "📐", label: "Superficie", format: (v) => `Hasta ${v} m²` },
  { key: "potencia_kw", icon: "⚡", label: "Potencia", format: (v) => `${v} kW` },
  { key: "coste_diario_estimado_eur", icon: "💶", label: "Coste diario estimado (8h)", format: (v) => formatPrice(v) },
  { key: "tiempo_calentamiento_min", icon: "⏱️", label: "Tiempo de calentamiento", format: (v) => `${v} min` },
  { key: "capacidad_deposito_kg", icon: "🪣", label: "Capacidad del depósito", format: (v) => `${v} kg`, hideIfZero: true },
  { key: "nivel_ruido_db", icon: "🔈", label: "Nivel de ruido", format: (v) => `${v} dB`, hideIfZero: true },
  { key: "peso_kg", icon: "⚖️", label: "Peso", format: (v) => `${v} kg` },
  { key: "niveles_potencia", icon: "🔥", label: "Niveles de potencia", format: (v) => v, hideIfZero: true },
  { key: "tipo_instalacion", icon: "🔧", label: "Instalación", format: (v) => v },
  { key: "eficiencia_energetica", icon: "🌱", label: "Eficiencia energética", format: (v) => v },
  { key: "garantia_años", icon: "🛡️", label: "Garantía", format: (v) => `${v} años` },
];

const SCORE_FIELDS = [
  { key: "score_facilidad_uso", icon: "🧑‍🔧", label: "Facilidad de uso" },
  { key: "score_eficiencia", icon: "🌱", label: "Eficiencia energética" },
  { key: "score_confort", icon: "🛋️", label: "Confort" },
  { key: "score_calidad_precio", icon: "💰", label: "Calidad-precio" },
  { key: "score_autonomia", icon: "🔋", label: "Autonomía" },
  { key: "score_potencia", icon: "🔥", label: "Potencia" },
];

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const container = document.getElementById("detail-content");

  let product = null;
  try {
    const response = await fetch("data/products.json");
    const products = await response.json();
    product = products.find((p) => p.id === id) || null;
  } catch (error) {
    console.error("No se pudo cargar el catálogo de productos:", error);
  }

  if (!product) {
    container.innerHTML = `
      <div class="not-found">
        <h1>Producto no encontrado</h1>
        <p>Puede que el enlace sea incorrecto o el producto ya no esté disponible.</p>
        <a class="btn btn-primary" href="productos.html">Ver todos los productos</a>
      </div>
    `;
    return;
  }

  document.title = `${product.name} | CalorBrasa`;
  const descriptionMeta = document.getElementById("page-description");
  if (descriptionMeta && product.description) {
    descriptionMeta.setAttribute("content", product.description);
  }
  injectProductSchema(product);

  container.innerHTML = renderDetail(product);
  initRadarChart(product);
  attachCardClickGuards();
});

// Marcado schema.org/Product para que Google pueda mostrar precio y
// estrellas directamente en los resultados de búsqueda (rich results).
function injectProductSchema(product) {
  const price = product.discountedPrice != null ? product.discountedPrice : product.retailPrice;

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description || product.destacado_editorial || undefined,
    image: product.image_url ? [product.image_url] : undefined,
    sku: product.id,
    brand: product.marca ? { "@type": "Brand", name: product.marca } : undefined,
  };

  if (!isPendingLink(product.affiliate_link) && typeof price === "number") {
    schema.offers = {
      "@type": "Offer",
      url: product.affiliate_link,
      priceCurrency: "EUR",
      price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    };
  }

  if (typeof product.valoracion_media === "number" && product.resenas_cantidad > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.valoracion_media,
      reviewCount: product.resenas_cantidad,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

function isPendingLink(link) {
  return !link || link.trim().toUpperCase() === "PENDIENTE";
}

function amazonCta(product, extraClass = "") {
  if (isPendingLink(product.affiliate_link)) {
    return `<span class="btn btn-amazon is-disabled ${extraClass}">🛒 Enlace pendiente</span>`;
  }
  return `<a class="btn btn-amazon ${extraClass}" href="${product.affiliate_link}" target="_blank" rel="nofollow sponsored noopener" ${gaAmazonAttrs(product)}>🛒 Comprar en Amazon</a>`;
}

function renderDetail(product) {
  const hasDiscount = product.discountedPrice != null && product.discountedPrice < product.retailPrice;

  const priceRow = hasDiscount
    ? `<span class="price-current">${formatPrice(product.discountedPrice)}</span>
       <span class="price-original">${formatPrice(product.retailPrice)}</span>`
    : `<span class="price-current">${formatPrice(product.retailPrice)}</span>`;

  const imageMarkup = product.image_url
    ? `<img src="${product.image_url}" alt="${product.name}" loading="lazy"
         onerror="this.remove()">`
    : "";

  const specsMarkup = SPEC_FIELDS
    .filter((spec) => {
      const value = product[spec.key];
      if (value === null || value === undefined || value === "") return false;
      if (spec.hideIfZero && Number(value) === 0) return false;
      return true;
    })
    .map(
      (spec) => `
      <div class="spec-item">
        <span class="spec-icon">${spec.icon}</span>
        <span>
          <span class="spec-label">${spec.label}</span>
          <span class="spec-value">${spec.format(product[spec.key])}</span>
        </span>
      </div>`
    )
    .join("");

  const scoreListMarkup = SCORE_FIELDS
    .map(
      (score) => `
      <div class="score-item">
        <span>${score.icon} ${score.label}</span>
        <span class="score-value">${product[score.key] ?? "-"}/10</span>
      </div>`
    )
    .join("");

  const idealParaMarkup = product.ideal_para
    ? `
    <div class="ideal-para-box">
      <span class="icon">🙋</span>
      <div><h3>Ideal para</h3><p style="margin:0;">${product.ideal_para}</p></div>
    </div>`
    : "";

  const pros = Array.isArray(product.pros) ? product.pros : [];
  const contras = Array.isArray(product.contras) ? product.contras : [];
  const prosConsMarkup = pros.length || contras.length
    ? `
    <div class="pros-cons-grid">
      ${pros.length ? `<ul class="pros-list"><h3>Pros</h3>${pros.map((p) => `<li>✅ <span>${p}</span></li>`).join("")}</ul>` : ""}
      ${contras.length ? `<ul class="cons-list"><h3>Contras</h3>${contras.map((c) => `<li>❌ <span>${c}</span></li>`).join("")}</ul>` : ""}
    </div>`
    : "";

  const reviewsMarkup = product.resenas_resumen
    ? `
    <div class="reviews-block">
      <h2 style="margin-bottom:6px;">Opiniones de clientes</h2>
      ${
        typeof product.valoracion_media === "number"
          ? `<div class="stars">★★★★★ <span style="color:var(--color-text-muted); font-size:1rem;">${product.valoracion_media.toFixed(1)}/5 · ${product.resenas_cantidad ?? 0} reseñas</span></div>`
          : ""
      }
      <blockquote>“${product.resenas_resumen}”</blockquote>
    </div>`
    : "";

  return `
    <article>
      <section class="detail-top">
        <div class="detail-hero">
          <div class="eyebrow">${DETAIL_CATEGORY_LABELS[product.category] || product.category}${product.marca ? ` · ${product.marca}` : ""}</div>
          <h1>${product.name}</h1>
          ${product.destacado_editorial ? `<p class="destacado">${product.destacado_editorial}</p>` : ""}
          <div class="price-row">${priceRow}</div>
          <div class="hero-cta-row">
            ${amazonCta(product)}
            <a class="btn btn-outline" href="comparador.html?m1=${encodeURIComponent(product.id)}">⚖️ Comparar este producto</a>
          </div>
        </div>

        <div class="detail-image-col">${imageMarkup}</div>

        <div class="detail-specs-col">
          <h2>Especificaciones técnicas</h2>
          <div class="specs-grid">${specsMarkup}</div>
        </div>

        <div class="detail-radar-col">
          <h2>Puntuaciones</h2>
          <div class="radar-grid">
            <div class="radar-chart-wrap"><canvas id="radar-chart" height="260"></canvas></div>
            <div class="score-list">${scoreListMarkup}</div>
          </div>
        </div>
      </section>

      <div class="cta-band">${amazonCta(product)}</div>

      ${idealParaMarkup}
      ${prosConsMarkup}
      ${reviewsMarkup}

      ${product.description ? `<div class="detail-description"><h2>Descripción</h2><p>${product.description}</p></div>` : ""}

      <div class="cta-band">${amazonCta(product)}</div>
    </article>
  `;
}

function initRadarChart(product) {
  const canvas = document.getElementById("radar-chart");
  if (!canvas || typeof Chart === "undefined") return;

  new Chart(canvas, {
    type: "radar",
    data: {
      labels: SCORE_FIELDS.map((s) => s.label),
      datasets: [
        {
          label: "Puntuación",
          data: SCORE_FIELDS.map((s) => product[s.key] ?? 0),
          borderColor: "#C1440E",
          backgroundColor: "rgba(193, 68, 14, 0.15)",
          pointBackgroundColor: "#C1440E",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: { stepSize: 2, backdropColor: "transparent" },
          grid: { color: "#e7e0d6" },
          angleLines: { color: "#e7e0d6" },
          pointLabels: { font: { size: 11 } },
        },
      },
    },
  });
}

// Evita que un futuro enlace/tarjeta anidada dispare navegación doble.
function attachCardClickGuards() {
  document.querySelectorAll(".detail-top a, .cta-band a").forEach((link) => {
    link.addEventListener("click", (event) => event.stopPropagation());
  });
}
