import { $$ } from "../util/dom.js";

export function activateTab(tab) {
  $$(".bottombar .nav-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.go === tab)
  );
}

/* Delegación global: cualquier click en .nav-btn dispara navigate() */
export function wireBottomBar(navigate) {
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".bottombar .nav-btn");
    if (!b) return;
    e.preventDefault();
    navigate(b.dataset.go);
  });
}

/* Para cualquier otro botón con data-go dentro del contenido (#app) */
export function wireGo(navigate) {
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-go]");
    if (!t || t.closest(".bottombar")) return; // la bottombar ya la maneja la función de arriba
    e.preventDefault();
    navigate(t.dataset.go);
  });
}

