/* =========================================================
   CalorBrasa — Comparador de productos
   ========================================================= */

const MIN_SLOTS = 2;
const MAX_SLOTS = 4;
const MODEL_COLORS = ["#C1440E", "#F2A93B", "#5C5652", "#3B6E8F"];

const COMPARE_SCORE_ROWS = [
  { key: "score_facilidad_uso", icon: "🧑‍🔧", label: "Facilidad de uso" },
  { key: "score_eficiencia", icon: "🌱", label: "Eficiencia energética" },
  { key: "score_confort", icon: "🛋️", label: "Confort" },
  { key: "score_calidad_precio", icon: "💰", label: "Calidad-precio" },
  { key: "score_autonomia", icon: "🔋", label: "Autonomía" },
  { key: "score_potencia", icon: "🔥", label: "Potencia" },
];

// "higher" = destacar el valor más alto, "lower" = destacar el más bajo,
// null = no es comparable como mejor/peor.
const COMPARE_SPEC_ROWS = [
  { key: "tipo_combustible", icon: "🔥", label: "Combustible", format: (v) => v, highlight: null },
  { key: "superficie_calefactable_m2", icon: "📐", label: "Superficie calefactable", format: (v) => `${v} m²`, highlight: "higher" },
  { key: "potencia_kw", icon: "⚡", label: "Potencia", format: (v) => `${v} kW`, highlight: "higher" },
  { key: "coste_diario_estimado_eur", icon: "💶", label: "Coste estimado", format: (v) => `${formatDecimal(v)} €/día`, highlight: "lower" },
  { key: "tiempo_calentamiento_min", icon: "⏱️", label: "Tiempo de calentamiento", format: (v) => `${v} min`, highlight: "lower" },
  { key: "capacidad_deposito_kg", icon: "🛢️", label: "Capacidad del depósito", format: (v) => `${v} kg`, highlight: null, hideIfZero: true },
  { key: "nivel_ruido_db", icon: "🔊", label: "Nivel de ruido", format: (v) => `${v} dB`, highlight: "lower" },
  { key: "peso_kg", icon: "⚖️", label: "Peso", format: (v) => `${v} kg`, highlight: "lower" },
  { key: "niveles_potencia", icon: "🎚️", label: "Niveles de potencia", format: (v) => v, highlight: "higher" },
  { key: "tipo_instalacion", icon: "🔧", label: "Tipo de instalación", format: (v) => v, highlight: null },
  { key: "eficiencia_energetica", icon: "🌡️", label: "Eficiencia energética", format: (v) => v, highlight: null },
  { key: "garantia_años", icon: "🛡️", label: "Garantía", format: (v) => `${v} años`, highlight: "higher" },
];

let allProducts = [];
let slots = []; // [{ productId: string|null }]
let radarChart = null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("data/products.json");
    allProducts = await response.json();
  } catch (error) {
    console.error("No se pudo cargar el catálogo de productos:", error);
    allProducts = [];
  }

  hydrateSlotsFromUrl();
  renderFields();
  renderTable();
});

/* ---------------------------------------------------------- */
/* Estado y URL                                                */
/* ---------------------------------------------------------- */

function hydrateSlotsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const ids = [];
  for (let i = 1; i <= MAX_SLOTS; i++) {
    const id = params.get(`m${i}`);
    if (id && allProducts.some((p) => p.id === id) && !ids.includes(id)) {
      ids.push(id);
    }
  }
  slots = ids.map((id) => ({ productId: id }));
  while (slots.length < MIN_SLOTS) slots.push({ productId: null });
}

function syncUrl() {
  const params = new URLSearchParams();
  slots
    .filter((s) => s.productId)
    .forEach((s, i) => params.set(`m${i + 1}`, s.productId));
  const query = params.toString();
  const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState(null, "", newUrl);
}

function getSelectedIds(excludeIndex) {
  return slots
    .map((s, i) => (i === excludeIndex ? null : s.productId))
    .filter(Boolean);
}

function removeSlot(index) {
  slots.splice(index, 1);
  while (slots.length < MIN_SLOTS) slots.push({ productId: null });
  syncUrl();
  renderFields();
  renderTable();
}

function selectProduct(index, productId) {
  slots[index].productId = productId;
  syncUrl();
  renderFields();
  renderTable();
}

function addSlot() {
  if (slots.length >= MAX_SLOTS) return;
  slots.push({ productId: null });
  renderFields();
}

/* ---------------------------------------------------------- */
/* Buscador con autocompletado                                 */
/* ---------------------------------------------------------- */

function renderFields() {
  const container = document.getElementById("compare-fields");
  if (!container) return;
  container.innerHTML = "";

  slots.forEach((slot, index) => {
    const product = slot.productId ? allProducts.find((p) => p.id === slot.productId) : null;

    const field = document.createElement("div");
    field.className = "compare-field";
    field.innerHTML = `
      <div class="compare-input-wrap">
        <input type="text" class="compare-input" placeholder="Buscar modelo…" value="${product ? product.name : ""}" autocomplete="off">
        <button type="button" class="compare-field-clear" aria-label="Quitar modelo">×</button>
      </div>
      <ul class="compare-suggestions" hidden></ul>
    `;
    container.appendChild(field);

    const input = field.querySelector(".compare-input");
    const suggestions = field.querySelector(".compare-suggestions");
    const clearBtn = field.querySelector(".compare-field-clear");

    input.addEventListener("focus", () => openSuggestions(index, "", suggestions, input));
    input.addEventListener("input", () => openSuggestions(index, input.value, suggestions, input));
    input.addEventListener("blur", () => {
      setTimeout(() => {
        suggestions.hidden = true;
      }, 150);
    });

    clearBtn.addEventListener("click", () => removeSlot(index));
  });

  const allFilled = slots.every((s) => s.productId);
  if (allFilled && slots.length < MAX_SLOTS) {
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn-add-model";
    addBtn.textContent = "＋ Añadir modelo";
    addBtn.addEventListener("click", addSlot);
    container.appendChild(addBtn);
  }
}

function openSuggestions(index, query, suggestionsEl, inputEl) {
  const excludeIds = getSelectedIds(index);
  const normalizedQuery = query.trim().toLowerCase();
  const matches = allProducts.filter(
    (p) => !excludeIds.includes(p.id) && (normalizedQuery === "" || p.name.toLowerCase().includes(normalizedQuery))
  );

  suggestionsEl.innerHTML = matches.length
    ? matches
        .map((p) => `<li data-id="${p.id}">${cbName(p)}</li>`)
        .join("")
    : `<li class="suggestion-empty">Sin resultados</li>`;

  suggestionsEl.hidden = false;

  suggestionsEl.querySelectorAll("li[data-id]").forEach((li) => {
    li.addEventListener("click", () => {
      inputEl.value = li.textContent;
      selectProduct(index, li.dataset.id);
    });
  });
}

/* ---------------------------------------------------------- */
/* Tabla comparativa                                            */
/* ---------------------------------------------------------- */

function isPendingLink(link) {
  return !link || link.trim().toUpperCase() === "PENDIENTE";
}

function amazonCta(product) {
  if (isPendingLink(product.affiliate_link)) {
    return `<span class="btn btn-amazon is-disabled">Enlace pendiente</span>`;
  }
  return `<a class="btn btn-amazon" href="${product.affiliate_link}" target="_blank" rel="nofollow sponsored noopener" ${gaAmazonAttrs(product)}>Ver precio en Amazon</a>`;
}

function formatDecimal(value) {
  return Number(value).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getSpecValue(product, spec) {
  const value = product[spec.key];
  if (spec.hideIfZero && Number(value) === 0) return null;
  if (value === null || value === undefined || value === "") return null;
  return value;
}

function computeBest(values, direction) {
  const nums = values
    .filter((v) => v !== null && v !== undefined && !isNaN(parseFloat(v)))
    .map((v) => parseFloat(v));
  if (nums.length < 2) return null;
  return direction === "higher" ? Math.max(...nums) : Math.min(...nums);
}

function renderTable() {
  const wrap = document.getElementById("compare-table-wrap");
  if (!wrap) return;

  const models = slots
    .filter((s) => s.productId)
    .map((s) => allProducts.find((p) => p.id === s.productId))
    .filter(Boolean);

  if (radarChart) {
    radarChart.destroy();
    radarChart = null;
  }

  if (models.length < 2) {
    wrap.innerHTML = `<p class="compare-hint">Selecciona al menos 2 modelos para comparar.</p>`;
    return;
  }

  wrap.innerHTML = `
    <p class="compare-scroll-hint">↔️ Desliza la tabla hacia los lados para ver todos los datos</p>
    <div class="compare-table-wrap">
      <table class="compare-table">
        <thead>
          <tr>
            <th class="sticky-col">Modelo</th>
            ${models.map((p) => `<th>${renderModelHeader(p)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="sticky-col">💶 Gama de precio</td>
            ${models.map((p) => `<td>${renderPriceCell(p)}</td>`).join("")}
          </tr>
          <tr>
            <td class="sticky-col">⭐ Nota CalorBrasa</td>
            ${models.map((p) => `<td>${renderRatingCell(p)}</td>`).join("")}
          </tr>
          ${COMPARE_SPEC_ROWS.map((spec) => renderSpecRow(spec, models)).join("")}
          <tr>
            <td class="sticky-col">📊 Puntuaciones</td>
            <td colspan="${models.length}" class="compare-radar-cell">
              <div class="compare-radar-wrap"><canvas id="compare-radar-chart" height="280"></canvas></div>
              <div class="compare-legend">
                ${models
                  .map(
                    (p, i) =>
                      `<span class="compare-legend-item"><span class="compare-legend-dot" style="background:${MODEL_COLORS[i]}"></span>${p.name}</span>`
                  )
                  .join("")}
              </div>
            </td>
          </tr>
          ${COMPARE_SCORE_ROWS.map((score) => renderScoreRow(score, models)).join("")}
          <tr>
            <td class="sticky-col">👤 Ideal para</td>
            ${models.map((p) => `<td>${p.ideal_para || '<span class="compare-empty-value">—</span>'}</td>`).join("")}
          </tr>
          <tr>
            <td class="sticky-col">✅ Pros</td>
            ${models.map((p) => `<td>${renderListCell(p.pros, "compare-pros-list", "✅")}</td>`).join("")}
          </tr>
          <tr>
            <td class="sticky-col">❌ Contras</td>
            ${models.map((p) => `<td>${renderListCell(p.contras, "compare-cons-list", "❌")}</td>`).join("")}
          </tr>
          <tr>
            <td class="sticky-col"></td>
            ${models.map((p) => `<td>${amazonCta(p)}</td>`).join("")}
          </tr>
        </tbody>
      </table>
    </div>
  `;

  initRadarChart(models);
}

function renderModelHeader(product) {
  const imageMarkup = cbImg(product);

  return `
    <div class="compare-model-image">${imageMarkup}</div>
    ${product.isFeatured ? `<div><span class="compare-badge-featured">DESTACADO</span></div>` : ""}
    <div class="compare-model-name">${cbName(product)}</div>
    ${amazonCta(product)}
  `;
}

// Sin precio exacto: tramo orientativo (el precio actual se ve en Amazon)
function renderPriceCell(product) {
  return cbPriceHtml(product) || '<span class="compare-empty-value">—</span>';
}

function renderRatingCell(product) {
  return cbNotaHtml(product) || '<span class="compare-empty-value">—</span>';
}

function renderSpecRow(spec, models) {
  const values = models.map((p) => getSpecValue(p, spec));
  const best = spec.highlight ? computeBest(values, spec.highlight) : null;

  const cells = models
    .map((p, i) => {
      const value = values[i];
      if (value === null) return `<td><span class="compare-empty-value">—</span></td>`;
      const formatted = spec.format(value);
      const isBest = best !== null && parseFloat(value) === best;
      return `<td>${isBest ? `<span class="compare-best">${formatted}</span>` : formatted}</td>`;
    })
    .join("");

  return `<tr><td class="sticky-col">${spec.icon} ${spec.label}</td>${cells}</tr>`;
}

function renderScoreRow(score, models) {
  const values = models.map((p) => (typeof p[score.key] === "number" ? p[score.key] : null));
  const best = computeBest(values, "higher");

  const cells = models
    .map((p, i) => {
      const value = values[i];
      if (value === null) return `<td><span class="compare-empty-value">—</span></td>`;
      const pct = Math.max(0, Math.min(100, value * 10));
      const isBest = best !== null && value === best;
      return `
        <td>
          <div class="score-cell-value ${isBest ? "compare-best" : ""}">${value}/10</div>
          <div class="score-bar-track"><div class="score-bar-fill" style="width:${pct}%;"></div></div>
        </td>`;
    })
    .join("");

  return `<tr><td class="sticky-col">${score.icon} ${score.label}</td>${cells}</tr>`;
}

function renderListCell(items, listClass, icon) {
  if (!Array.isArray(items) || items.length === 0) {
    return '<span class="compare-empty-value">—</span>';
  }
  return `<ul class="${listClass}">${items.map((item) => `<li>${icon} <span>${item}</span></li>`).join("")}</ul>`;
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function initRadarChart(models) {
  const canvas = document.getElementById("compare-radar-chart");
  if (!canvas || typeof Chart === "undefined") return;

  radarChart = new Chart(canvas, {
    type: "radar",
    data: {
      labels: COMPARE_SCORE_ROWS.map((s) => s.label),
      datasets: models.map((p, i) => ({
        label: p.name,
        data: COMPARE_SCORE_ROWS.map((s) => p[s.key] ?? 0),
        borderColor: MODEL_COLORS[i],
        backgroundColor: hexToRgba(MODEL_COLORS[i], 0.12),
        pointBackgroundColor: MODEL_COLORS[i],
        borderWidth: 2,
      })),
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
