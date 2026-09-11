/* =========================================================
   CalorBrasa — JS base compartido (header, popup exit-intent)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initExitPopup();
});

/* Menú móvil ------------------------------------------------ */

function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

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

/* Utilidad: formatea precio en euros ---------------------------- */

function formatPrice(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}
