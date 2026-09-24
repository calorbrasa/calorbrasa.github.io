/* =========================================================
   CalorBrasa — JS base compartido (header, popup exit-intent)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initExitPopup();
  initAmazonClickTracking();
});

/* Menú móvil ------------------------------------------------ */

function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  // Marca la sección actual en el menú
  const here = window.location.pathname.split("/").pop() || "index.html";
  const cat = new URLSearchParams(window.location.search).get("categoria");
  nav.querySelectorAll("a").forEach((a) => {
    const url = new URL(a.getAttribute("href"), window.location.href);
    const samePage = (url.pathname.split("/").pop() || "index.html") === here;
    const sameCat = url.searchParams.get("categoria") === cat;
    if (samePage && (here !== "productos.html" || sameCat)) a.setAttribute("aria-current", "page");
  });

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Cierra el menú al navegar (en móvil)
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* Popup de suscripción (exit intent) ------------------------- */

const EXIT_POPUP_STORAGE_KEY = "calorbrasa_exit_popup_shown";
const WEB3FORMS_ACCESS_KEY = "79c4d750-74ff-44ed-b0db-1bfd98f31780";

function initExitPopup() {
  const popup = document.getElementById("exit-popup");
  const closeBtn = document.getElementById("exit-popup-close");
  const form = document.getElementById("exit-popup-form");
  if (!popup || !closeBtn || !form) return;

  let hasShown = sessionStorage.getItem(EXIT_POPUP_STORAGE_KEY) === "1";

  function showPopup() {
    if (hasShown) return;
    hasShown = true;
    sessionStorage.setItem(EXIT_POPUP_STORAGE_KEY, "1");
    popup.hidden = false;
  }

  function hidePopup() {
    popup.hidden = true;
  }

  // Detecta intención de salida: el ratón sale por la parte superior de la ventana
  // (solo aplica en escritorio, un dispositivo táctil no tiene este evento)
  document.addEventListener("mouseout", (event) => {
    if (!event.relatedTarget && event.clientY <= 0) {
      showPopup();
    }
  });

  // Alternativa para móvil/táctil: sin ratón no hay "exit intent", así que
  // usamos el scroll como señal de interés real antes de mostrar el popup.
  const SCROLL_TRIGGER_RATIO = 0.6;

  function checkScrollTrigger() {
    if (hasShown) {
      window.removeEventListener("scroll", checkScrollTrigger);
      return;
    }
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollableHeight <= 0) return;
    const scrolledRatio = window.scrollY / scrollableHeight;
    if (scrolledRatio >= SCROLL_TRIGGER_RATIO) {
      showPopup();
      window.removeEventListener("scroll", checkScrollTrigger);
    }
  }

  window.addEventListener("scroll", checkScrollTrigger, { passive: true });

  closeBtn.addEventListener("click", hidePopup);
  popup.addEventListener("click", (event) => {
    if (event.target === popup) hidePopup();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hidePopup();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = emailInput ? emailInput.value.trim() : "";
    if (!email) return;

    const originalBtnText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: "Nueva suscripción — Guía CalorBrasa",
          from_name: "Popup CalorBrasa",
          email,
        }),
      });
      const result = await response.json();

      if (result.success) {
        form.innerHTML = '<p class="form-success">¡Listo! Revisa tu correo, te hemos enviado la guía.</p>';
      } else {
        throw new Error(result.message || "Error desconocido");
      }
    } catch (error) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
      form.insertAdjacentHTML(
        "beforeend",
        '<p class="form-error">No se pudo enviar. Inténtalo de nuevo en unos segundos.</p>'
      );
    }
  });
}

/* Evento GA4: clic en "Comprar en Amazon" ------------------------ */
// Los botones de Amazon llevan atributos data-ga-* (ver gaAmazonAttrs)
// generados desde productos.js / producto.js / comparador.js / asistente.js.
// Se escucha con delegación en document para no depender de cuándo se
// pinte cada botón (mucho se genera dinámicamente tras un fetch).

function gaAmazonAttrs(product) {
  const price = product.discountedPrice != null ? product.discountedPrice : product.retailPrice;
  const name = String(product.name || "").replace(/"/g, "&quot;");
  return `data-ga-amazon-click data-ga-id="${product.id}" data-ga-name="${name}" data-ga-category="${product.category || ""}" data-ga-price="${price ?? ""}"`;
}

function initAmazonClickTracking() {
  // Fase de captura: varias tarjetas de producto hacen stopPropagation()
  // en sus enlaces (para no disparar también la navegación de la tarjeta),
  // lo que impediría que un listener en fase de burbuja llegara a recibirlo.
  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest("a[data-ga-amazon-click]");
      if (!link || typeof gtag !== "function") return;

      const price = link.dataset.gaPrice ? Number(link.dataset.gaPrice) : undefined;
      gtag("event", "click_comprar_amazon", {
        item_id: link.dataset.gaId || "",
        item_name: link.dataset.gaName || "",
        item_category: link.dataset.gaCategory || "",
        price,
        currency: "EUR",
        page_location: window.location.href,
      });
    },
    true
  );
}

/* Utilidad: formatea precio en euros ---------------------------- */

function formatPrice(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

/* =========================================================
   Utilidades de producto compartidas por todas las páginas
   - Nota CalorBrasa: media de nuestras 6 puntuaciones (0-10).
   - Gama de precio: tramo orientativo en lugar del precio exacto
     (las normas de Afiliados de Amazon exigen que un precio
     mostrado esté actualizado; el precio real se ve en Amazon).
   - Nombre sin la marca duplicada.
   - Insignias: la mejor de cada tipo según nuestros datos.
   ========================================================= */

const CB_SCORE_KEYS = [
  "score_eficiencia", "score_confort", "score_potencia",
  "score_autonomia", "score_facilidad_uso", "score_calidad_precio",
];

function cbNota(p) {
  const vals = CB_SCORE_KEYS.map((k) => p[k]).filter((v) => typeof v === "number");
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

function cbNotaText(p) {
  const n = cbNota(p);
  return n == null ? "–" : n.toFixed(1).replace(".", ",");
}

const CB_GAMAS = {
  bajo: { label: "Gama económica", range: "menos de 200 €", sym: "€" },
  medio: { label: "Gama media", range: "200–700 €", sym: "€€" },
  alto: { label: "Gama alta", range: "más de 700 €", sym: "€€€" },
};

function cbGama(p) {
  return CB_GAMAS[p.rango_precio] || null;
}

function cbGamaHtml(p) {
  const g = cbGama(p);
  return g ? `<span class="cb-gama"><b>${g.sym}</b> ${g.label} <span>· ${g.range}</span></span>` : "";
}

/* Precio real de Amazon — SOLO si viene de la Creators API.
   Normas de Afiliados de Amazon: un precio solo puede mostrarse si se obtiene
   de su API, con fecha y hora al lado y el aviso obligatorio. Los campos
   precio_api (número) y precio_api_fecha (ISO) los rellena un proceso
   automático; NUNCA se escriben a mano. Sin ellos se muestra la gama. */
const CB_PRICE_MAX_AGE_H = 24; // si el dato tiene más de 24 h, no se muestra

function cbHasApiPrice(p) {
  if (typeof p.precio_api !== "number" || !p.precio_api_fecha) return false;
  const age = (Date.now() - new Date(p.precio_api_fecha).getTime()) / 36e5;
  return age >= 0 && age <= CB_PRICE_MAX_AGE_H;
}

function cbPriceHtml(p, opts) {
  if (!cbHasApiPrice(p)) return cbGamaHtml(p);
  const when = new Date(p.precio_api_fecha).toLocaleString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  setTimeout(cbEnsurePriceDisclaimer, 0);
  return `<span class="cb-price${opts && opts.big ? " cb-price-big" : ""}"><b>${formatPrice(p.precio_api)}</b><small>Precio en Amazon.es a ${when}. Puede cambiar.</small></span>`;
}

// Aviso obligatorio de Amazon, junto al aviso de afiliados de la página
function cbEnsurePriceDisclaimer() {
  if (document.getElementById("cb-price-disclaimer")) return;
  const host = document.querySelector(".affiliate-notice") || document.body;
  host.insertAdjacentHTML("beforeend",
    ' <span id="cb-price-disclaimer">Los precios y disponibilidad del Producto son precisos en la fecha y hora indicados y están sujetos a cambios. El precio y la disponibilidad que se muestren en Amazon.es en el momento de la compra serán los que se apliquen a la compra del producto.</span>');
}

function cbNotaHtml(p, big) {
  const n = cbNota(p);
  if (n == null) return "";
  const lvl = n >= 8 ? "top" : n >= 7 ? "good" : "ok";
  return `<span class="cb-nota cb-nota-${lvl}${big ? " cb-nota-big" : ""}" title="Nota CalorBrasa: media de eficiencia, confort, potencia, autonomía, facilidad de uso y calidad-precio"><b>${cbNotaText(p)}</b><small>Nota CalorBrasa</small></span>`;
}

function cbName(p) {
  const name = String(p.name || "");
  if (!p.marca) return name;
  return name.toUpperCase().startsWith(String(p.marca).toUpperCase()) ? name : `${p.marca} ${name}`;
}

const CB_BADGES = [
  { key: "top", label: "Mejor valorada", pick: (list) => maxBy(list, (p) => cbNota(p)) },
  { key: "calidad", label: "Mejor calidad-precio", pick: (list) => maxBy(list, (p) => (p.score_calidad_precio || 0) * 10 + (cbNota(p) || 0)) },
  { key: "gasto", label: "Menos gasto diario", pick: (list) => maxBy(list.filter((p) => typeof p.coste_diario_estimado_eur === "number"), (p) => -p.coste_diario_estimado_eur) },
  { key: "eficiente", label: "Más eficiente", pick: (list) => maxBy(list, (p) => (p.score_eficiencia || 0) * 10 + (cbNota(p) || 0)) },
];

function maxBy(list, fn) {
  let best = null, bestV = -Infinity;
  list.forEach((p) => { const v = fn(p); if (v != null && v > bestV) { bestV = v; best = p; } });
  return best;
}

/** Devuelve { id: [ {key,label} ] } con una insignia por producto como máximo, por categoría */
function cbComputeBadges(products) {
  const out = {};
  const cats = [...new Set(products.map((p) => p.category))];
  cats.forEach((cat) => {
    let pool = products.filter((p) => p.category === cat);
    CB_BADGES.forEach((b) => {
      const winner = b.pick(pool);
      if (!winner) return;
      out[winner.id] = [{ key: b.key, label: b.label }];
      pool = pool.filter((p) => p.id !== winner.id); // cada insignia a un producto distinto
    });
  });
  return out;
}

function cbBadgeHtml(badges) {
  return (badges || []).map((b) => `<span class="cb-badge cb-badge-${b.key}">${b.label}</span>`).join("");
}

/** Botón de Amazon: sin precio, lleva a ver el precio actual */
function cbAmazonButton(product, text) {
  const link = product.affiliate_link;
  if (!link || link.trim().toUpperCase() === "PENDIENTE") {
    return `<span class="btn btn-amazon is-disabled">Enlace pendiente</span>`;
  }
  return `<a class="btn btn-amazon" href="${link}" target="_blank" rel="nofollow sponsored noopener" ${gaAmazonAttrs(product)}>${text || "Ver precio en Amazon"}</a>`;
}

/** Imagen con reemplazo si falla la carga */
function cbImgFallbackHtml() {
  return `<span class="cb-img-fallback" aria-hidden="true"><img src="/assets/favicon.svg" alt=""></span>`;
}

function cbImgFail(el) {
  el.insertAdjacentHTML("afterend", cbImgFallbackHtml());
  el.remove();
}

function cbImg(product, cls) {
  if (!product.image_url) return cbImgFallbackHtml();
  const alt = String(cbName(product)).replace(/"/g, "&quot;");
  return `<img class="${cls || ""}" src="${product.image_url}" alt="${alt}" loading="lazy" onerror="cbImgFail(this)">`;
}
