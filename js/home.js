/* =========================================================
   CalorBrasa — Portada: destacados, categorías, mejores por
   tipo, mini calculadora y newsletter.
   Usa las utilidades compartidas de main.js (cbNota, cbName…).
   ========================================================= */

const HOME_CATS = [
  { c: "pellets", n: "Pellets", long: "estufas de pellets" },
  { c: "lena-biomasa", n: "Leña", long: "estufas de leña" },
  { c: "electricos", n: "Eléctricos", long: "calefactores eléctricos" },
  { c: "gas", n: "Gas", long: "estufas de gas" },
  { c: "radiadores", n: "Radiadores", long: "radiadores" },
];

const HOME_CAT_SLUG = {
  pellets: "estufas-de-pellets", "lena-biomasa": "estufas-de-lena", electricos: "calefactores-electricos",
  gas: "calefactores-de-gas", radiadores: "radiadores-electricos",
};

let homeProducts = [];
let homeBadges = {};
let homeTab = "pellets";

document.addEventListener("DOMContentLoaded", async () => {
  initHomeCalc();
  initHomeNewsletter();
  try {
    const res = await fetch("data/products.json");
    homeProducts = await res.json();
  } catch (e) {
    homeProducts = [];
  }
  if (!homeProducts.length) return;
  homeBadges = cbComputeBadges(homeProducts);
  const stat = document.getElementById("stat-models");
  if (stat) stat.textContent = homeProducts.length;
  renderHeroPicks();
  renderHomeCats();
  renderBestTabs();
  renderBest();
});

function byNota(list) {
  return [...list].sort((a, b) => (cbNota(b) || 0) - (cbNota(a) || 0) || (b.resenas_cantidad || 0) - (a.resenas_cantidad || 0));
}

function detailHref(p) {
  return `producto/${encodeURIComponent(p.id)}.html`;
}

function fmtEur(v) {
  return v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

/* Hero: la mejor de 3 tipos --------------------------------- */
function renderHeroPicks() {
  const el = document.getElementById("hero-picks");
  if (!el) return;
  const picks = ["pellets", "lena-biomasa", "electricos"]
    .map((c) => byNota(homeProducts.filter((p) => p.category === c))[0])
    .filter(Boolean);
  el.innerHTML = picks.map((p) => `
    <a class="home-pick" href="${detailHref(p)}">
      <div class="home-pick-img">${cbImg(p)}</div>
      <div class="home-pick-body">
        <span class="home-pick-cat">${HOME_CATS.find((c) => c.c === p.category).long}</span>
        <span class="home-pick-name">${cbName(p)}</span>
        <span class="home-pick-specs">${p.potencia_kw} kW · hasta ${p.superficie_calefactable_m2} m²</span>
      </div>
      ${cbNotaHtml(p)}
    </a>`).join("");
}

/* Categorías: foto del mejor modelo + nº de modelos + gasto --- */
function renderHomeCats() {
  document.querySelectorAll(".home-cat").forEach((card) => {
    const list = homeProducts.filter((p) => p.category === card.dataset.cat);
    if (!list.length) return;
    const top = byNota(list)[0];
    card.querySelector(".home-cat-img").innerHTML = cbImg(top);
    const costs = list.map((p) => p.coste_diario_estimado_eur).filter((v) => typeof v === "number");
    const minCost = costs.length ? Math.min(...costs) : null;
    card.querySelector(".home-cat-meta").innerHTML =
      `<b>${list.length} modelos</b>${minCost != null ? ` · gasto desde ${fmtEur(minCost)}/día` : ""}`;
  });
}

/* Mejores por tipo ------------------------------------------- */
function renderBestTabs() {
  const tabs = document.getElementById("best-tabs");
  tabs.innerHTML = HOME_CATS.map((c) =>
    `<button type="button" role="tab" data-c="${c.c}" aria-selected="${c.c === homeTab}">${c.n}</button>`).join("");
  tabs.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    homeTab = b.dataset.c;
    tabs.querySelectorAll("button").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    renderBest();
  });
}

function renderBest() {
  const grid = document.getElementById("best-grid");
  const list = byNota(homeProducts.filter((p) => p.category === homeTab)).slice(0, 4);
  grid.innerHTML = list.map((p, i) => bestCard(p, i)).join("");
  const cat = HOME_CATS.find((c) => c.c === homeTab);
  const more = document.getElementById("best-more");
  const total = homeProducts.filter((p) => p.category === homeTab).length;
  more.href = `categoria/${HOME_CAT_SLUG[homeTab]}.html`;
  more.textContent = `Ver las ${total} ${cat.long} →`;
}

function bestCard(p, i) {
  const badges = homeBadges[p.id] || [];
  const inst = p.tipo_instalacion ? p.tipo_instalacion.replace(" (enchufar y usar)", "") : "";
  return `
    <article class="home-card">
      <div class="home-card-top">
        <span class="home-rank">${i + 1}</span>
        ${cbBadgeHtml(badges)}
      </div>
      <a class="home-card-img" href="${detailHref(p)}">${cbImg(p)}</a>
      <div class="home-card-body">
        <a class="home-card-name" href="${detailHref(p)}">${cbName(p)}</a>
        <div class="home-card-score">${cbNotaHtml(p)}${cbPriceHtml(p)}</div>
        <ul class="home-card-specs">
          <li><span>Calienta</span><b>hasta ${p.superficie_calefactable_m2} m²</b></li>
          <li><span>Potencia</span><b>${p.potencia_kw} kW</b></li>
          ${typeof p.coste_diario_estimado_eur === "number" ? `<li><span>Gasto</span><b>${fmtEur(p.coste_diario_estimado_eur)}/día</b></li>` : ""}
          ${inst ? `<li><span>Instalación</span><b>${inst}</b></li>` : ""}
        </ul>
        ${p.destacado_editorial ? `<p class="home-card-quote">${p.destacado_editorial}</p>` : ""}
        <div class="home-card-actions">
          ${cbAmazonButton(p)}
          <a class="btn btn-details" href="${detailHref(p)}">Ver análisis</a>
        </div>
      </div>
    </article>`;
}

/* Mini calculadora ------------------------------------------- */
const CALC = {
  luz: 0.2, saco: 5.67, lena: 0.26, bombona: 18.84,
  types: [
    { c: "pellets", n: "Estufa de pellets", pl: "estufas de pellets", cpk: () => (CALC.saco / 15) / (4.8 * 0.85) },
    { c: "lena-biomasa", n: "Estufa de leña", pl: "estufas de leña", cpk: () => CALC.lena / (3.8 * 0.7) },
    { c: "gas", n: "Estufa de butano", pl: "estufas de butano", cpk: () => (CALC.bombona / 12.5) / 12.7 },
    { c: "electricos", n: "Estufa eléctrica", pl: "estufas eléctricas", cpk: () => CALC.luz },
  ],
};
let calcClima = 1;

function superficieKey(m2) {
  if (m2 <= 30) return "lt30";
  if (m2 <= 60) return "30-60";
  if (m2 <= 100) return "60-100";
  return "gt100";
}

function initHomeCalc() {
  const m2 = document.getElementById("calc-m2");
  const h = document.getElementById("calc-h");
  const seg = document.getElementById("calc-clima");
  if (!m2 || !h || !seg) return;
  m2.addEventListener("input", renderCalc);
  h.addEventListener("input", renderCalc);
  seg.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    calcClima = parseFloat(b.dataset.v);
    seg.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    renderCalc();
  });
  renderCalc();
}

function renderCalc() {
  const m2 = +document.getElementById("calc-m2").value;
  const hours = +document.getElementById("calc-h").value;
  document.getElementById("calc-m2-out").textContent = `${m2} m²`;
  document.getElementById("calc-h-out").textContent = `${hours} h`;
  const kw = m2 * 0.095 * calcClima;              // ≈ 1 kW por cada 10 m²
  const heatMonth = kw * 0.45 * hours * 30;       // carga media ≈ 45 %
  document.getElementById("calc-kw").textContent = `${kw.toLocaleString("es-ES", { maximumFractionDigits: 1 })} kW`;
  const rows = CALC.types.map((t) => ({ t, month: heatMonth * t.cpk() })).sort((a, b) => a.month - b.month);
  const max = Math.max(...rows.map((r) => r.month));
  const sup = superficieKey(m2);
  document.getElementById("calc-list").innerHTML = rows.map((r, i) => {
    let note = "";
    if (r.t.c === "electricos" && kw > 2.5) note = `<small class="home-calc-warn">Harían falta ≈ ${Math.ceil(kw / 2)} aparatos de 2.000 W</small>`;
    if (r.t.c === "gas" && kw > 4.5) note = `<small class="home-calc-warn">Mejor como apoyo: hay que ventilar</small>`;
    return `<li class="${i === 0 ? "is-best" : ""}">
      <div class="home-calc-row">
        <span class="home-calc-name">${r.t.n}${i === 0 ? '<span class="cb-badge cb-badge-top">Más barata</span>' : ""}</span>
        <b>${Math.round(r.month).toLocaleString("es-ES")} €<small>/mes</small></b>
      </div>
      <div class="home-calc-bar"><span style="width:${Math.max(4, r.month / max * 100).toFixed(1)}%"></span></div>
      <div class="home-calc-row home-calc-sub">${note || "<span></span>"}<a href="productos.html?categoria=${r.t.c}&superficie=${sup}">Ver modelos →</a></div>
    </li>`;
  }).join("");
  const best = rows[0].t;
  const cta = document.getElementById("calc-cta");
  cta.href = `productos.html?categoria=${best.c}&superficie=${sup}`;
  cta.textContent = `Ver ${best.pl} para ${m2} m² →`;
}

/* Newsletter en la portada (mismo envío que el popup) ---------- */
function initHomeNewsletter() {
  const form = document.getElementById("home-news-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = form.querySelector("input[type=email]");
    const btn = form.querySelector("button");
    const email = input.value.trim();
    if (!email) return;
    btn.disabled = true;
    btn.textContent = "Enviando...";
    try {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: WEB3FORMS_ACCESS_KEY, subject: "Nueva suscripción — Guía CalorBrasa", from_name: "Portada CalorBrasa", email }),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.message);
      form.innerHTML = '<p class="form-success">¡Listo! Revisa tu correo, te hemos enviado la guía.</p>';
      if (typeof gtag === "function") gtag("event", "suscripcion_newsletter", { origen: "portada" });
    } catch (err) {
      btn.disabled = false;
      btn.textContent = "Quiero la guía";
      form.insertAdjacentHTML("beforeend", '<p class="form-error">No se pudo enviar. Inténtalo de nuevo.</p>');
    }
  });
}
