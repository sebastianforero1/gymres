// src/js/main.js
import { load, AppState } from "./state.js";
import { wireBottomBar, wireGo } from "./ui/components.js";
import { render } from "./router.js";

load();

function navigate(route) { location.hash = `#/${route}`; }

// Delegación global (bottombar + botones data-go del contenido)
wireBottomBar(navigate);
wireGo(navigate);

// Enrutar por hash
window.addEventListener("hashchange", () => {
  const route = location.hash.replace("#/","") || "login";
  render(route);
});

// Primera carga tras DOM listo
window.addEventListener("DOMContentLoaded", () => {
  const first = AppState.user ? (location.hash.replace("#/","") || "home") : "login";
  if (!location.hash) location.hash = `#/${first}`;
  render(first);
});

// Service Worker (opcional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}
