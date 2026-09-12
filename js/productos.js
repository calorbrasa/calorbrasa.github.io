/* =========================================================
   CalorBrasa — Listado de productos: categoría, orden y filtros
   avanzados (precio, superficie, instalación, valoración, marca).
   ========================================================= */

const CATEGORY_LABELS = {
  pellets: "Estufas de pellets",
  "lena-biomasa": "Estufas de leña / biomasa",
  electricos: "Calefactores eléctricos",
  gas: "Calefactores de gas",
  radiadores: "Radiadores",
};

const PRECIO_OPTIONS = [
  { key: "bajo", label: "Bajo (<200€)" },
  { key: "medio", label: "Medio (200-700€)" },
  { key: "alto", label: "Alto (>700€)" },
];

const SUPERFICIE_RANGES = [
  { key: "lt30", label: "Hasta 30 m²", test: (v) => v != null && v <= 30 },
  { key: "30-60", label: "30-60 m²", test: (v) => v != null && v > 30 && v <= 60 },
  { key: "60-100", label: "60-100 m²", test: (v) => v != null && v > 60 && v <= 100 },
  { key: "gt100", label: "Más de 100 m²", test: (v) => v != null && v > 100 },
];

const INSTALACION_OPTIONS = [
  { key: "portátil (enchufar y usar)", label: "Portátil" },
  { key: "requiere salida de humos", label: "Requiere salida de humos" },
  { key: "instalación profesional", label: "Instalación profesional" },
];

const INSTALACION_CODE_MAP = {
  "portátil (enchufar y usar)": "portatil",
  "requiere salida de humos": "humos",
  "instalación profesional": "profesional",
};
const INSTALACION_CODE_REVERSE = Object.fromEntries(
  Object.entries(INSTALACION_CODE_MAP).map(([full, code]) => [code, full])
);

const VALORACION_OPTIONS = [
  { key: 0, label: "Cualquiera" },
  { key: 4, label: "4★ o más" },
  { key: 4.5, label: "4,5★ o más" },
];

const SORT_LABELS = {
  relevancia: "Relevancia",
  "precio-asc": "Precio: menor a mayor",
  "precio-desc": "Precio: mayor a menor",
  "valoracion-desc": "Mejor valorados",
  "popularidad-desc": "Más opiniones",
};

let allProducts = [];
let activeCategory = "todas";
let sortBy = "relevancia";
const filters = {
  precio: new Set(),
  instalacion: new Set(),
  marcas: new Set(),
  valoracionMin: 0,
  superficie: null,
  soloDescuento: false,
};

document.addEventListener("DOMContentLoaded", async () => {
  readStateFromUrl();

  try {
    const response = await fetch("data/products.json");
    allProducts = await response.json();
  } catch (error) {
    console.error("No se pudo cargar el catálogo de productos:", error);
    allProducts = [];
  }

  renderFilters();
  initToolbar();
  renderAdvancedFilters();
  updateFilterCountUI();
  renderProducts();
});

/* ---------------------------------------------------------- */
/* Estado <-> URL                                               */
/* ---------------------------------------------------------- */

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);

  const categoriaParam = params.get("categoria");
  if (categoriaParam && CATEGORY_LABELS[categoriaParam]) activeCategory = categoriaParam;

  const ordenParam = params.get("orden");
  if (ordenParam && SORT_LABELS[ordenParam]) sortBy = ordenParam;

  const precioParam = params.get("precio");
  if (precioParam) filters.precio = new Set(precioParam.split(","));

  const instalacionParam = params.get("instalacion");
  if (instalacionParam) {
    filters.instalacion = new Set(
      instalacionParam.split(",").map((code) => INSTALACION_CODE_REVERSE[code]).filter(Boolean)
    );
  }

  const valoracionParam = params.get("valoracion");
  if (valoracionParam) filters.valoracionMin = parseFloat(valoracionParam) || 0;

  const superficieParam = params.get("superficie");
  if (superficieParam && SUPERFICIE_RANGES.some((r) => r.key === superficieParam)) {
    filters.superficie = superficieParam;
  }

  const marcaParam = params.get("marca");
  if (marcaParam) filters.marcas = new Set(marcaParam.split(","));

  filters.soloDescuento = params.get("descuento") === "1";
}

function writeStateToUrl() {
  const url = new URL(window.location);
  const sp = url.searchParams;

  if (activeCategory === "todas") sp.delete("categoria");
  else sp.set("categoria", activeCategory);

  if (sortBy === "relevancia") sp.delete("orden");
  else sp.set("orden", sortBy);

  if (filters.precio.size) sp.set("precio", Array.from(filters.precio).join(","));
  else sp.delete("precio");

  if (filters.instalacion.size) {
    sp.set("instalacion", Array.from(filters.instalacion).map((v) => INSTALACION_CODE_MAP[v]).join(","));
  } else {
    sp.delete("instalacion");
  }

  if (filters.valoracionMin > 0) sp.set("valoracion", String(filters.valoracionMin));
  else sp.delete("valoracion");

  if (filters.superficie) sp.set("superficie", filters.superficie);
  else sp.delete("superficie");

  if (filters.marcas.size) sp.set("marca", Array.from(filters.marcas).join(","));
  else sp.delete("marca");

  if (filters.soloDescuento) sp.set("descuento", "1");
  else sp.delete("descuento");

  window.history.replaceState({}, "", url);
}

/* ---------------------------------------------------------- */
/* Categoría (píldoras existentes)                              */
/* ---------------------------------------------------------- */

function renderFilters() {
  const container = document.getElementById("filters");
  if (!container) return;

  const categories = ["todas", ...Object.keys(CATEGORY_LABELS)];

  container.innerHTML = categories
    .map((cat) => {
      const label = cat === "todas" ? "Todas las categorías" : CATEGORY_LABELS[cat];
      const activeClass = cat === activeCategory ? "active" : "";
      return `<button class="filter-btn ${activeClass}" data-category="${cat}">${label}</button>`;
    })
    .join("");

  container.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      container.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // La lista de marcas depende de la categoría: si cambiamos de
      // categoría, una marca seleccionada que ya no exista dejaría un
      // filtro "fantasma" invisible en el panel — mejor limpiarla.
      filters.marcas.clear();

      writeStateToUrl();
      renderAdvancedFilters();
      updateFilterCountUI();
      renderProducts();
    });
  });
}

/* ---------------------------------------------------------- */
/* Barra de herramientas: orden + filtros avanzados             */
/* ---------------------------------------------------------- */

function initToolbar() {
  const toggleBtn = document.getElementById("advanced-toggle");
  const panel = document.getElementById("advanced-filters");
  const clearBtn = document.getElementById("clear-filters-btn");
  const sortSelect = document.getElementById("sort-select");

  if (sortSelect) {
    sortSelect.value = sortBy;
    sortSelect.addEventListener("change", () => {
      sortBy = sortSelect.value;
      writeStateToUrl();
      renderProducts();
    });
  }

  if (toggleBtn && panel) {
    // Si venimos de un enlace con filtros ya aplicados, abrimos el panel
    // directamente para que el usuario vea qué se está filtrando.
    const startOpen = countActiveFilters() > 0;
    panel.hidden = !startOpen;
    toggleBtn.classList.toggle("active", startOpen);
    toggleBtn.setAttribute("aria-expanded", String(startOpen));

    toggleBtn.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      toggleBtn.classList.toggle("active", !panel.hidden);
      toggleBtn.setAttribute("aria-expanded", String(!panel.hidden));
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      filters.precio.clear();
      filters.instalacion.clear();
      filters.marcas.clear();
      filters.valoracionMin = 0;
      filters.superficie = null;
      filters.soloDescuento = false;
      afterFilterChange();
    });
  }
}

function getAvailableBrands() {
  const inCategory = activeCategory === "todas" ? allProducts : allProducts.filter((p) => p.category === activeCategory);
  const brands = new Set(inCategory.map((p) => p.marca).filter(Boolean));
  return Array.from(brands).sort((a, b) => a.localeCompare(b, "es"));
}

function countActiveFilters() {
  let n = filters.precio.size + filters.instalacion.size + filters.marcas.size;
  if (filters.valoracionMin > 0) n += 1;
  if (filters.superficie) n += 1;
  if (filters.soloDescuento) n += 1;
  return n;
}

function updateFilterCountUI() {
  const count = countActiveFilters();
  const countEl = document.getElementById("filter-count");
  const clearBtn = document.getElementById("clear-filters-btn");
  if (countEl) {
    countEl.textContent = String(count);
    countEl.hidden = count === 0;
  }
  if (clearBtn) clearBtn.hidden = count === 0;
}

function afterFilterChange() {
  writeStateToUrl();
  renderAdvancedFilters();
  updateFilterCountUI();
  renderProducts();
}

function toggleSetFilter(set, value) {
  if (set.has(value)) set.delete(value);
  else set.add(value);
  afterFilterChange();
}

function renderAdvancedFilters() {
  const panel = document.getElementById("advanced-filters");
  if (!panel) return;

  const brands = getAvailableBrands();

  panel.innerHTML = `
    <div class="filter-group">
      <h4>💶 Rango de precio</h4>
      <div class="filter-pill-row" data-group="precio">
        ${PRECIO_OPTIONS.map(
          (o) => `<button type="button" class="filter-pill ${filters.precio.has(o.key) ? "active" : ""}" data-value="${o.key}">${o.label}</button>`
        ).join("")}
      </div>
    </div>

    <div class="filter-group">
      <h4>📐 Superficie a calefactar</h4>
      <div class="filter-pill-row" data-group="superficie">
        <button type="button" class="filter-pill ${!filters.superficie ? "active" : ""}" data-value="">Cualquiera</button>
        ${SUPERFICIE_RANGES.map(
          (r) => `<button type="button" class="filter-pill ${filters.superficie === r.key ? "active" : ""}" data-value="${r.key}">${r.label}</button>`
        ).join("")}
      </div>
    </div>

    <div class="filter-group">
      <h4>🔧 Tipo de instalación</h4>
      <div class="filter-pill-row" data-group="instalacion">
        ${INSTALACION_OPTIONS.map(
          (o) => `<button type="button" class="filter-pill ${filters.instalacion.has(o.key) ? "active" : ""}" data-value="${o.key}">${o.label}</button>`
        ).join("")}
      </div>
    </div>

    <div class="filter-group">
      <h4>⭐ Valoración mínima</h4>
      <div class="filter-pill-row" data-group="valoracion">
        ${VALORACION_OPTIONS.map(
          (o) => `<button type="button" class="filter-pill ${filters.valoracionMin === o.key ? "active" : ""}" data-value="${o.key}">${o.label}</button>`
        ).join("")}
      </div>
    </div>

    ${
      brands.length
        ? `<div class="filter-group">
      <h4>🏷️ Marca</h4>
      <div class="filter-pill-row" data-group="marca">
        ${brands.map((b) => `<button type="button" class="filter-pill ${filters.marcas.has(b) ? "active" : ""}" data-value="${b}">${b}</button>`).join("")}
      </div>
    </div>`
        : ""
    }

    <div class="filter-group">
      <h4>🏷️ Ofertas</h4>
      <div class="filter-pill-row" data-group="descuento">
        <button type="button" class="filter-pill ${filters.soloDescuento ? "active" : ""}" data-value="1">Solo con descuento</button>
      </div>
    </div>
  `;

  // Selección única: superficie y valoración
  panel.querySelectorAll('[data-group="superficie"] .filter-pill').forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.superficie = btn.dataset.value || null;
      afterFilterChange();
    });
  });
  panel.querySelectorAll('[data-group="valoracion"] .filter-pill').forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.valoracionMin = parseFloat(btn.dataset.value);
      afterFilterChange();
    });
  });

  // Selección múltiple: precio, instalación, marca
  panel.querySelectorAll('[data-group="precio"] .filter-pill').forEach((btn) => {
    btn.addEventListener("click", () => toggleSetFilter(filters.precio, btn.dataset.value));
  });
  panel.querySelectorAll('[data-group="instalacion"] .filter-pill').forEach((btn) => {
    btn.addEventListener("click", () => toggleSetFilter(filters.instalacion, btn.dataset.value));
  });
  panel.querySelectorAll('[data-group="marca"] .filter-pill').forEach((btn) => {
    btn.addEventListener("click", () => toggleSetFilter(filters.marcas, btn.dataset.value));
  });

  // Interruptor simple: solo con descuento
  panel.querySelectorAll('[data-group="descuento"] .filter-pill').forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.soloDescuento = !filters.soloDescuento;
      afterFilterChange();
    });
  });
}

/* ---------------------------------------------------------- */
/* Filtrado + orden + render de productos                       */
/* ---------------------------------------------------------- */

function hasDiscount(p) {
  return p.discountedPrice != null && p.discountedPrice < p.retailPrice;
}

function effectivePrice(p) {
  return hasDiscount(p) ? p.discountedPrice : p.retailPrice;
}

function applyAdvancedFilters(products) {
  return products.filter((p) => {
    if (filters.precio.size && !filters.precio.has(p.rango_precio)) return false;
    if (filters.instalacion.size && !filters.instalacion.has(p.tipo_instalacion)) return false;
    if (filters.valoracionMin > 0 && (p.valoracion_media || 0) < filters.valoracionMin) return false;
    if (filters.superficie) {
      const range = SUPERFICIE_RANGES.find((r) => r.key === filters.superficie);
      if (range && !range.test(p.superficie_calefactable_m2)) return false;
    }
    if (filters.marcas.size && !filters.marcas.has(p.marca)) return false;
    if (filters.soloDescuento && !hasDiscount(p)) return false;
    return true;
  });
}

function sortProducts(products) {
  const arr = [...products];
  if (sortBy === "precio-asc") {
    arr.sort((a, b) => effectivePrice(a) - effectivePrice(b));
  } else if (sortBy === "precio-desc") {
    arr.sort((a, b) => effectivePrice(b) - effectivePrice(a));
  } else if (sortBy === "valoracion-desc") {
    arr.sort((a, b) => (b.valoracion_media || 0) - (a.valoracion_media || 0) || (b.resenas_cantidad || 0) - (a.resenas_cantidad || 0));
  } else if (sortBy === "popularidad-desc") {
    arr.sort((a, b) => (b.resenas_cantidad || 0) - (a.resenas_cantidad || 0));
  } else {
    // Relevancia: destacados primero, luego un peso valoración×volumen de reseñas
    arr.sort((a, b) => {
      const featuredDiff = (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      if (featuredDiff !== 0) return featuredDiff;
      const scoreA = (a.valoracion_media || 0) * Math.log((a.resenas_cantidad || 0) + 1);
      const scoreB = (b.valoracion_media || 0) * Math.log((b.resenas_cantidad || 0) + 1);
      return scoreB - scoreA;
    });
  }
  return arr;
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  const inCategory = activeCategory === "todas" ? allProducts : allProducts.filter((p) => p.category === activeCategory);
  const filtered = sortProducts(applyAdvancedFilters(inCategory));

  const countEl = document.getElementById("result-count");
  if (countEl) {
    countEl.textContent =
      filtered.length === inCategory.length
        ? `${filtered.length} producto${filtered.length === 1 ? "" : "s"}`
        : `${filtered.length} de ${inCategory.length} productos`;
  }

  if (filtered.length === 0) {
    grid.innerHTML =
      inCategory.length === 0
        ? '<p class="empty-state">Todavía no hay productos en esta categoría. Vuelve pronto.</p>'
        : '<p class="empty-state">Ningún producto coincide con estos filtros. Prueba a quitar alguno.</p>';
    return;
  }

  grid.innerHTML = filtered.map(renderProductCard).join("");

  // Tarjeta completa clicable -> página de detalle. Los botones internos
  // detienen la propagación para conservar su propio destino (Amazon
  // en pestaña nueva, o el mismo detalle sin doble navegación).
  grid.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => {
      window.location.href = card.dataset.href;
    });
  });
  grid.querySelectorAll(".product-card a").forEach((link) => {
    link.addEventListener("click", (event) => event.stopPropagation());
  });
}

/** true si el enlace de afiliado todavía no se ha rellenado */
function isPendingLink(link) {
  return !link || link.trim().toUpperCase() === "PENDIENTE";
}

function renderProductCard(product) {
  // Nunca mostrar imagen rota: si no hay image_url, mostramos el icono de
  // reemplazo directamente; si la URL falla al cargar, onerror la sustituye.
  const imageMarkup = product.image_url
    ? `<img src="${product.image_url}" alt="${product.name}" loading="lazy"
         onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'🔥',style:'font-size:2.5rem'}))">`
    : `<span style="font-size:2.5rem;">🔥</span>`;

  const priceMarkup = hasDiscount(product)
    ? `<span style="text-decoration:line-through; color:var(--color-text-muted); font-weight:500; font-size:0.85rem; margin-right:6px;">${formatPrice(product.retailPrice)}</span>${formatPrice(product.discountedPrice)}`
    : formatPrice(product.retailPrice);

  const rating = typeof product.valoracion_media === "number" ? product.valoracion_media.toFixed(1) : "-";
  const detailHref = `producto.html?id=${encodeURIComponent(product.id)}`;

  const amazonButton = isPendingLink(product.affiliate_link)
    ? `<span class="btn btn-amazon is-disabled">🛒 Enlace pendiente</span>`
    : `<a class="btn btn-amazon" href="${product.affiliate_link}" target="_blank" rel="nofollow sponsored noopener" ${gaAmazonAttrs(product)}>🛒 Comprar en Amazon</a>`;

  return `
    <article class="product-card" data-href="${detailHref}">
      <div class="product-image">${imageMarkup}</div>
      <div class="product-body">
        <span class="category-tag">${CATEGORY_LABELS[product.category] || product.category}</span>
        <h3>${product.marca ? `${product.marca} — ` : ""}${product.name}</h3>
        <div class="rating">★★★★★ <span>${rating} (${product.resenas_cantidad ?? 0})</span></div>
        <ul class="specs">
          ${product.potencia_kw != null ? `<li>⚡ Potencia: ${product.potencia_kw} kW</li>` : ""}
          ${product.superficie_calefactable_m2 != null ? `<li>📐 Superficie: hasta ${product.superficie_calefactable_m2} m²</li>` : ""}
          ${product.tipo_combustible ? `<li>⛽ Combustible: ${product.tipo_combustible}</li>` : ""}
          ${product.coste_diario_estimado_eur != null ? `<li>💶 Coste estimado: ${formatPrice(product.coste_diario_estimado_eur)}/día (8h)</li>` : ""}
        </ul>
        <div class="price">${priceMarkup}</div>
        <div class="card-actions">
          ${amazonButton}
          <a class="btn btn-details" href="${detailHref}">Ver detalles</a>
        </div>
      </div>
    </article>
  `;
}
