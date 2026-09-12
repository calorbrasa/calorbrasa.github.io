/* =========================================================
   CalorBrasa — Asistente "¿Cuál elijo?"
   Cuestionario de 6 preguntas que recomienda una categoría
   de calefacción y los mejores productos de esa categoría.
   ========================================================= */

const QUIZ_CATEGORY_LABELS = {
  pellets: "Estufas de pellets",
  "lena-biomasa": "Estufas de leña / biomasa",
  electricos: "Calefactores eléctricos",
  gas: "Calefactores de gas",
  radiadores: "Radiadores",
};

const QUIZ_CATEGORY_ICONS = {
  pellets: "🔥",
  "lena-biomasa": "🪵",
  electricos: "⚡",
  gas: "🔵",
  radiadores: "🌡️",
};

// Cada opción suma puntos a las categorías con las que encaja.
// Los valores son heurísticos, pensados para que la recomendación
// final sea coherente con las respuestas, no una ciencia exacta.
const QUIZ_QUESTIONS = [
  {
    id: "espacio",
    question: "¿Cuántos metros cuadrados quieres calentar?",
    options: [
      { value: "pequeno", label: "Menos de 20 m² (una habitación)", icon: "🚪", m2: 15,
        scores: { electricos: 2, radiadores: 2, gas: 1 } },
      { value: "medio", label: "20-50 m² (salón o varias estancias)", icon: "🛋️", m2: 35,
        scores: { gas: 1, electricos: 1, radiadores: 1, pellets: 1, "lena-biomasa": 1 } },
      { value: "grande", label: "50-100 m² (planta completa)", icon: "🏠", m2: 75,
        scores: { pellets: 2, "lena-biomasa": 2, gas: 1 } },
      { value: "muygrande", label: "Más de 100 m² (vivienda grande)", icon: "🏡", m2: 120,
        scores: { pellets: 3, "lena-biomasa": 2 } },
    ],
  },
  {
    id: "humos",
    question: "¿Tienes salida de humos o posibilidad de instalar una?",
    options: [
      { value: "si", label: "Sí, tengo o puedo instalar una", icon: "✅",
        scores: { pellets: 2, "lena-biomasa": 2 } },
      { value: "no", label: "No, y no quiero hacer obras", icon: "🚫",
        scores: { electricos: 2, radiadores: 2, gas: 1, pellets: -3, "lena-biomasa": -3 } },
      { value: "nose", label: "No lo sé todavía", icon: "🤔",
        scores: { gas: 1, electricos: 1 } },
    ],
  },
  {
    id: "lugar",
    question: "¿Dónde lo vas a usar principalmente?",
    options: [
      { value: "interior", label: "Dentro de casa (salón, dormitorio…)", icon: "🛋️",
        scores: { pellets: 1, "lena-biomasa": 1, electricos: 1, radiadores: 1 } },
      { value: "bano", label: "En el baño", icon: "🚿",
        scores: { electricos: 3, radiadores: 1, pellets: -5, "lena-biomasa": -5, gas: -3 } },
      { value: "exterior", label: "Exterior (terraza, garaje, camping)", icon: "🏕️",
        scores: { gas: 3, electricos: -2, pellets: -5, "lena-biomasa": -3, radiadores: -3 } },
    ],
  },
  {
    id: "combustible",
    question: "¿Qué prefieres en cuanto a combustible?",
    options: [
      { value: "lena", label: "Tengo acceso a leña y me gusta el ambiente tradicional", icon: "🪵",
        scores: { "lena-biomasa": 4, pellets: -1 } },
      { value: "pellet", label: "Prefiero pellet: cómodo y de bajo coste", icon: "🔥",
        scores: { pellets: 4 } },
      { value: "gas", label: "Prefiero gas envasado (bombona)", icon: "🔵",
        scores: { gas: 4 } },
      { value: "electrico", label: "Solo electricidad, sin combustible que comprar", icon: "⚡",
        scores: { electricos: 3, radiadores: 3 } },
    ],
  },
  {
    id: "prioridad",
    question: "¿Qué es lo más importante para ti?",
    options: [
      { value: "coste", label: "Coste de uso bajo a largo plazo", icon: "💶",
        scores: { pellets: 2, "lena-biomasa": 2 } },
      { value: "instalacion", label: "Instalación rápida, sin obras", icon: "⚡",
        scores: { electricos: 2, radiadores: 2, gas: 1 } },
      { value: "potencia", label: "Máxima potencia y calor rápido", icon: "🚀",
        scores: { pellets: 2, gas: 1, "lena-biomasa": 1 } },
      { value: "silencio", label: "Silencio, sobre todo para el dormitorio", icon: "🤫",
        scores: { radiadores: 3, electricos: 1, pellets: -1 } },
      { value: "diseno", label: "Diseño y ambiente decorativo", icon: "🎨",
        scores: { electricos: 2, "lena-biomasa": 2, pellets: 1 } },
    ],
  },
  {
    id: "presupuesto",
    question: "¿Cuál es tu presupuesto aproximado?",
    options: [
      { value: "bajo", label: "Menos de 200 €", icon: "💰",
        scores: { electricos: 2, gas: 2, radiadores: 1, pellets: -2, "lena-biomasa": -1 } },
      { value: "medio", label: "Entre 200 y 700 €", icon: "💰💰",
        scores: { gas: 1, electricos: 1, radiadores: 1, "lena-biomasa": 1, pellets: 1 } },
      { value: "alto", label: "Más de 700 €", icon: "💰💰💰",
        scores: { pellets: 2, "lena-biomasa": 1 } },
    ],
  },
  {
    id: "extra",
    question: "¿Te gustaría alguna función extra?",
    options: [
      { value: "basico", label: "No, con que caliente bien me vale", icon: "👍", scores: {} },
      { value: "wifi", label: "Control por WiFi o app desde el móvil", icon: "📱",
        scores: { pellets: 1, radiadores: 1 } },
      { value: "autonomia", label: "Máxima autonomía, que dure muchas horas sin recargar", icon: "🔋",
        scores: { pellets: 1, "lena-biomasa": 1 } },
      { value: "diseno", label: "Diseño cuidado o efecto decorativo (llama, cristal panorámico…)", icon: "🎨",
        scores: { electricos: 1, "lena-biomasa": 1 } },
    ],
  },
];

let currentStep = 0; // 0 = pantalla de inicio, 1..N = preguntas, N+1 = resultado
const answers = {}; // { questionId: optionValue }
let allProducts = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("data/products.json");
    allProducts = await response.json();
  } catch (error) {
    console.error("No se pudo cargar el catálogo de productos:", error);
    allProducts = [];
  }
  renderStep();
});

function renderStep() {
  const wrap = document.getElementById("quiz-wrap");
  if (!wrap) return;

  wrap.classList.remove("quiz-wrap--wide");

  if (currentStep === 0) {
    renderStart(wrap);
  } else if (currentStep <= QUIZ_QUESTIONS.length) {
    renderQuestion(wrap, QUIZ_QUESTIONS[currentStep - 1]);
  } else {
    wrap.classList.add("quiz-wrap--wide");
    renderResult(wrap);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderStart(wrap) {
  wrap.innerHTML = `
    <div class="quiz-start">
      <div class="quiz-start-icon">🧭</div>
      <h2>¿No sabes qué calefactor necesitas?</h2>
      <p>En ${QUIZ_QUESTIONS.length} preguntas te decimos si te conviene una estufa de pellets, de leña, un calefactor eléctrico, de gas o un radiador — y te recomendamos modelos concretos.</p>
      <ul>
        <li>⏱️ Tarda menos de 1 minuto</li>
        <li>🎯 Recomendación basada en tu espacio, presupuesto y prioridades</li>
        <li>🛒 Enlaces directos a los productos recomendados</li>
      </ul>
      <button type="button" class="btn btn-primary" id="quiz-start-btn" style="font-size:1.05rem; padding:14px 32px;">Empezar el cuestionario</button>
    </div>
  `;
  document.getElementById("quiz-start-btn").addEventListener("click", () => {
    currentStep = 1;
    renderStep();
  });
}

function renderQuestion(wrap, q) {
  const stepIndex = currentStep;
  const total = QUIZ_QUESTIONS.length;
  const pct = Math.round((stepIndex / total) * 100);
  const selected = answers[q.id];

  wrap.innerHTML = `
    <div class="quiz-progress-label">Pregunta ${stepIndex} de ${total}</div>
    <div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:${pct}%;"></div></div>
    <div class="quiz-question">
      <h2>${q.question}</h2>
      <div class="quiz-options">
        ${q.options
          .map(
            (opt) => `
          <button type="button" class="quiz-option ${selected === opt.value ? "selected" : ""}" data-value="${opt.value}">
            <span class="quiz-option-icon">${opt.icon}</span>
            <span>${opt.label}</span>
          </button>`
          )
          .join("")}
      </div>
      <div class="quiz-nav">
        <button type="button" class="btn btn-details" id="quiz-back-btn">← Atrás</button>
        <button type="button" class="btn btn-primary" id="quiz-next-btn" ${selected ? "" : "disabled"}>${stepIndex === total ? "Ver mi recomendación" : "Siguiente"}</button>
      </div>
    </div>
  `;

  wrap.querySelectorAll(".quiz-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      answers[q.id] = btn.dataset.value;
      renderQuestion(wrap, q); // re-render para marcar selección y activar "Siguiente"
    });
  });

  document.getElementById("quiz-back-btn").addEventListener("click", () => {
    currentStep -= 1;
    renderStep();
  });

  document.getElementById("quiz-next-btn").addEventListener("click", () => {
    if (!answers[q.id]) return;
    currentStep += 1;
    renderStep();
  });
}

/* ---------------------------------------------------------- */
/* Motor de recomendación                                       */
/* ---------------------------------------------------------- */

// A qué categoría apunta directamente la respuesta de combustible (pregunta 4).
// "electrico" no distingue entre calefactor eléctrico y radiador — eso se
// resuelve con la puntuación general, igual que el resto de respuestas.
const COMBUSTIBLE_CATEGORY_MAP = {
  lena: "lena-biomasa",
  pellet: "pellets",
  gas: "gas",
};

const COMBUSTIBLE_LABELS = {
  lena: "leña",
  pellet: "pellet",
  gas: "gas envasado",
  electrico: "electricidad",
};

function computeRecommendation() {
  const categoryScores = { pellets: 0, "lena-biomasa": 0, electricos: 0, gas: 0, radiadores: 0 };
  let targetM2 = 30;

  QUIZ_QUESTIONS.forEach((q) => {
    const value = answers[q.id];
    const opt = q.options.find((o) => o.value === value);
    if (!opt) return;
    if (opt.m2) targetM2 = opt.m2;
    Object.entries(opt.scores).forEach(([cat, pts]) => {
      categoryScores[cat] += pts;
    });
  });

  const computedCategory = Object.entries(categoryScores).sort((a, b) => b[1] - a[1])[0][0];

  // La categoría que el cliente pidió explícitamente en la pregunta 4 tiene
  // prioridad absoluta como recomendación principal, aunque el resto de
  // respuestas apunten a otra cosa — nunca le damos la espalda a lo que pidió.
  const combustibleValue = answers.combustible;
  let indicatedCategory;
  if (combustibleValue === "electrico") {
    indicatedCategory = categoryScores.electricos >= categoryScores.radiadores ? "electricos" : "radiadores";
  } else {
    indicatedCategory = COMBUSTIBLE_CATEGORY_MAP[combustibleValue] || computedCategory;
  }

  return { computedCategory, indicatedCategory, categoryScores, targetM2 };
}

// Puntos extra si el producto encaja con la función que pidió en la
// pregunta 7. No decide la categoría, pero sí qué modelo concreto
// recomendamos dentro de ella (y da pie a un upsell con motivo real).
function computeExtraBonus(p, extraKey) {
  const text = `${p.name} ${p.description || ""} ${(p.pros || []).join(" ")}`.toLowerCase();
  if (extraKey === "wifi") {
    return /wifi|app|smart/.test(text) ? 4 : 0;
  }
  if (extraKey === "autonomia") {
    return (p.capacidad_deposito_kg || 0) * 0.15 + (p.score_autonomia || 0) * 0.4;
  }
  if (extraKey === "diseno") {
    return (p.score_confort || 0) * 0.3 + (/cristal|panorámic|llama|decorativ|dise[nñ]o/.test(text) ? 2 : 0);
  }
  return 0;
}

// Puntuación de "encaje" de un producto según prioridad, presupuesto,
// espacio y la función extra deseada. Es la base tanto de la
// recomendación principal (realista) como del upsell (justificado).
function computeFitScore(p, ctx) {
  let score = (p.score_calidad_precio || 0) + (p.score_eficiencia || 0) * 0.5;
  if (ctx.priorityKey === "silencio") score += (p.score_confort || 0) * 1.5 - (p.nivel_ruido_db || 0) * 0.05;
  if (ctx.priorityKey === "potencia") score += (p.score_potencia || 0) * 1.5;
  if (ctx.priorityKey === "coste") score += (10 - (p.coste_diario_estimado_eur || 0)) * 0.5;
  if (ctx.priorityKey === "instalacion" && p.tipo_instalacion === "portátil (enchufar y usar)") score += 3;
  if (ctx.presupuesto === "bajo" && p.rango_precio === "bajo") score += 4;
  if (ctx.presupuesto === "medio" && p.rango_precio === "medio") score += 4;
  if (ctx.presupuesto === "alto" && p.rango_precio === "alto") score += 2;
  if (p.superficie_calefactable_m2) {
    score -= Math.abs(p.superficie_calefactable_m2 - ctx.targetM2) * 0.03;
  }
  score += computeExtraBonus(p, ctx.extraKey);
  return score;
}

// Recomendación principal: la que mejor encaja de verdad con lo que
// contestó (presupuesto incluido), no la más cara. Así la primera
// impresión es siempre realista y de confianza.
function pickPrimaryProduct(categoryId, ctx) {
  const candidates = allProducts.filter((p) => p.category === categoryId);
  if (candidates.length === 0) return null;

  const scored = candidates
    .map((p) => ({ product: p, fit: computeFitScore(p, ctx) }))
    .sort((a, b) => b.fit - a.fit);

  return scored[0].product;
}

// Compara dos productos y explica en 1-2 frases por qué el segundo
// justifica su precio más alto — el upsell nunca se muestra "porque sí".
function buildUpsellReasons(primary, upsell) {
  const reasons = [];
  if ((upsell.potencia_kw || 0) > (primary.potencia_kw || 0) * 1.1) {
    reasons.push(`Más potencia (${upsell.potencia_kw} kW frente a ${primary.potencia_kw} kW)`);
  }
  if ((upsell.superficie_calefactable_m2 || 0) > (primary.superficie_calefactable_m2 || 0) * 1.1) {
    reasons.push(`Cubre más superficie (hasta ${upsell.superficie_calefactable_m2} m²)`);
  }
  if ((upsell.capacidad_deposito_kg || 0) > (primary.capacidad_deposito_kg || 0)) {
    reasons.push(`Mayor autonomía (depósito de ${upsell.capacidad_deposito_kg} kg)`);
  }
  if (/wifi|app|smart/i.test(upsell.name) && !/wifi|app|smart/i.test(primary.name)) {
    reasons.push("Incluye control por WiFi desde el móvil");
  }
  if ((upsell.valoracion_media || 0) > (primary.valoracion_media || 0) + 0.15) {
    reasons.push(`Mejor valorado (${upsell.valoracion_media.toFixed(1)}★ frente a ${primary.valoracion_media?.toFixed(1) ?? "-"}★)`);
  }
  if (reasons.length === 0) {
    reasons.push("Mejores prestaciones y acabado dentro de la misma categoría");
  }
  return reasons.slice(0, 2);
}

// Upsell dentro de la MISMA categoría: solo se ofrece si existe un modelo
// más caro que sea una mejora real (más potencia, autonomía, valoración o
// la función extra que pidió) y sin dispararse de precio sin motivo.
function pickUpsellProduct(categoryId, primary, ctx) {
  if (!primary) return null;
  let candidates = allProducts.filter(
    (p) => p.category === categoryId && p.id !== primary.id && (p.retailPrice || 0) > (primary.retailPrice || 0)
  );
  if (candidates.length === 0) return null;

  const reasonable = candidates.filter((p) => p.retailPrice <= primary.retailPrice * 2.5);
  if (reasonable.length > 0) candidates = reasonable;

  const scored = candidates
    .map((p) => ({
      product: p,
      score: computeFitScore(p, ctx) + computeExtraBonus(p, ctx.extraKey) * 1.5 + (p.valoracion_media || 0) * 0.4,
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0].product;
}

const QUIZ_RESULT_COPY = {
  pellets: "una estufa de pellets: buena autonomía, coste de uso bajo y potencia suficiente para calentar espacios medianos o grandes",
  "lena-biomasa": "una estufa de leña o biomasa: ambiente tradicional, buen rendimiento y coste de combustible muy bajo si tienes acceso a leña",
  electricos: "un calefactor eléctrico: sin instalación, calor inmediato y disponible en muchos formatos y precios",
  gas: "un calefactor de gas: gran potencia, sin depender de electricidad y fácil de mover entre estancias o al exterior",
  radiadores: "un radiador: calor uniforme, silencioso y sin instalación — ideal para dormitorios y uso continuado",
};

function renderResult(wrap) {
  const { computedCategory, indicatedCategory, targetM2 } = computeRecommendation();
  const ctx = { targetM2, priorityKey: answers.prioridad, presupuesto: answers.presupuesto, extraKey: answers.extra };
  const hasConflict = indicatedCategory !== computedCategory;

  const primaryProduct = pickPrimaryProduct(indicatedCategory, ctx);
  const primaryLabel = QUIZ_CATEGORY_LABELS[indicatedCategory];
  const primaryIcon = QUIZ_CATEGORY_ICONS[indicatedCategory];

  let headerHtml;
  let blocksHtml;
  let compareBtnHtml = "";

  if (!hasConflict) {
    // El combustible elegido y el resto de respuestas coinciden. Mostramos
    // la opción realista que mejor encaja como principal y, si existe un
    // modelo superior que de verdad aporte algo (más potencia, autonomía,
    // valoración o la función extra pedida), lo ofrecemos al lado como
    // mejora — nunca como único camino.
    const upsellProduct = pickUpsellProduct(indicatedCategory, primaryProduct, ctx);

    headerHtml = `
      <div class="quiz-result-header">
        <div class="icon">${primaryIcon}</div>
        <div class="eyebrow">Tu recomendación</div>
        <h2>${primaryLabel}</h2>
        <p>Con tus respuestas, ${QUIZ_RESULT_COPY[indicatedCategory]}. Elegimos la opción que mejor encaja con tu espacio (unos ${targetM2} m²) y tu presupuesto.</p>
      </div>`;

    if (primaryProduct && upsellProduct) {
      const reasons = buildUpsellReasons(primaryProduct, upsellProduct);
      blocksHtml = `
        <div class="quiz-compare-grid">
          <div class="quiz-compare-col">
            <h3>🔹 Recomendado para ti</h3>
            <div class="product-grid quiz-single-product">${renderQuizProductCard(primaryProduct)}</div>
          </div>
          <div class="quiz-compare-col quiz-compare-col--upsell">
            <h3>💎 Si buscas más prestaciones</h3>
            <ul class="quiz-upsell-reasons">${reasons.map((r) => `<li>✅ ${r}</li>`).join("")}</ul>
            <div class="product-grid quiz-single-product">${renderQuizProductCard(upsellProduct)}</div>
          </div>
        </div>`;
      compareBtnHtml = `<a class="btn btn-outline" href="comparador.html?m1=${encodeURIComponent(primaryProduct.id)}&m2=${encodeURIComponent(upsellProduct.id)}">⚖️ Comparar productos</a>`;
    } else if (primaryProduct) {
      blocksHtml = `<div class="quiz-result-products">
          <h3>La estufa que mejor se adapta a ti</h3>
          <div class="product-grid quiz-single-product">${renderQuizProductCard(primaryProduct)}</div>
        </div>`;
    } else {
      blocksHtml = `<p class="quiz-no-match">Todavía no tenemos productos suficientes en esta categoría, pero puedes ver todo el catálogo de ${primaryLabel.toLowerCase()}.</p>`;
    }
  } else {
    // El combustible pedido no coincide con lo que sugiere el resto de
    // respuestas (p. ej. pidió pellet pero no tiene salida de humos):
    // mostramos primero lo que pidió y, debajo, la alternativa más
    // práctica según el resto del cuestionario — nunca una sola opción
    // que contradiga lo que el cliente dijo que quería.
    const secondaryProduct = pickPrimaryProduct(computedCategory, ctx);
    const secondaryLabel = QUIZ_CATEGORY_LABELS[computedCategory];
    const secondaryIcon = QUIZ_CATEGORY_ICONS[computedCategory];

    headerHtml = `
      <div class="quiz-result-header">
        <div class="icon">${primaryIcon}</div>
        <div class="eyebrow">Según el combustible que elegiste</div>
        <h2>${primaryLabel}</h2>
        <p>Nos dijiste que prefieres ${COMBUSTIBLE_LABELS[answers.combustible] || "esa opción"}, así que esta es tu mejor opción en esa categoría. Aun así, por el resto de tus respuestas (espacio, instalación, prioridades…) también te recomendamos valorar esta alternativa: <strong>${secondaryLabel.toLowerCase()}</strong>. Te dejamos las dos para que compares.</p>
      </div>`;

    blocksHtml = `
      <div class="quiz-compare-grid">
        <div class="quiz-compare-col">
          <h3>🥇 Lo que pediste: ${primaryLabel}</h3>
          <div class="product-grid quiz-single-product">${primaryProduct ? renderQuizProductCard(primaryProduct) : '<p class="quiz-no-match">Sin productos disponibles todavía.</p>'}</div>
        </div>
        <div class="quiz-compare-col">
          <h3>${secondaryIcon} Alternativa recomendada: ${secondaryLabel}</h3>
          <div class="product-grid quiz-single-product">${secondaryProduct ? renderQuizProductCard(secondaryProduct) : '<p class="quiz-no-match">Sin productos disponibles todavía.</p>'}</div>
        </div>
      </div>`;

    if (primaryProduct && secondaryProduct) {
      compareBtnHtml = `<a class="btn btn-outline" href="comparador.html?m1=${encodeURIComponent(primaryProduct.id)}&m2=${encodeURIComponent(secondaryProduct.id)}">⚖️ Comparar productos</a>`;
    }
  }

  if (typeof gtag === "function") {
    gtag("event", "cuestionario_completado", {
      categoria_recomendada: indicatedCategory,
      categoria_alternativa: hasConflict ? computedCategory : "",
      tiene_conflicto: hasConflict,
      producto_recomendado_id: primaryProduct ? primaryProduct.id : "",
    });
  }

  wrap.innerHTML = `
    ${headerHtml}
    ${blocksHtml}
    <div class="quiz-result-actions">
      ${compareBtnHtml}
      <a class="btn btn-primary" href="productos.html?categoria=${indicatedCategory}">Ver ${primaryLabel.toLowerCase()}</a>
      <button type="button" class="btn btn-details" id="quiz-restart-btn">🔄 Repetir cuestionario</button>
    </div>
  `;

  document.getElementById("quiz-restart-btn").addEventListener("click", () => {
    Object.keys(answers).forEach((key) => delete answers[key]);
    currentStep = 0;
    renderStep();
  });
}

function isQuizPendingLink(link) {
  return !link || link.trim().toUpperCase() === "PENDIENTE";
}

function renderQuizProductCard(product) {
  const imageMarkup = product.image_url
    ? `<img src="${product.image_url}" alt="${product.name}" loading="lazy"
         onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'🔥',style:'font-size:2.5rem'}))">`
    : `<span style="font-size:2.5rem;">🔥</span>`;

  const hasDiscount = product.discountedPrice != null && product.discountedPrice < product.retailPrice;
  const priceMarkup = hasDiscount
    ? `<span style="text-decoration:line-through; color:var(--color-text-muted); font-weight:500; font-size:0.85rem; margin-right:6px;">${formatPrice(product.retailPrice)}</span>${formatPrice(product.discountedPrice)}`
    : formatPrice(product.retailPrice);

  const detailHref = `producto.html?id=${encodeURIComponent(product.id)}`;
  const amazonButton = isQuizPendingLink(product.affiliate_link)
    ? `<span class="btn btn-amazon is-disabled">🛒 Enlace pendiente</span>`
    : `<a class="btn btn-amazon" href="${product.affiliate_link}" target="_blank" rel="nofollow sponsored noopener" ${gaAmazonAttrs(product)}>🛒 Comprar en Amazon</a>`;

  return `
    <article class="product-card" data-href="${detailHref}" onclick="if(!event.target.closest('a,span.btn')) window.location.href='${detailHref}'">
      <div class="product-image">${imageMarkup}</div>
      <div class="product-body">
        <span class="category-tag">${QUIZ_CATEGORY_LABELS[product.category] || product.category}</span>
        <h3>${product.marca ? `${product.marca} — ` : ""}${product.name}</h3>
        <div class="rating">★★★★★ <span>${typeof product.valoracion_media === "number" ? product.valoracion_media.toFixed(1) : "-"} (${product.resenas_cantidad ?? 0})</span></div>
        <ul class="specs">
          ${product.potencia_kw != null ? `<li>⚡ Potencia: ${product.potencia_kw} kW</li>` : ""}
          ${product.superficie_calefactable_m2 != null ? `<li>📐 Superficie: hasta ${product.superficie_calefactable_m2} m²</li>` : ""}
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
