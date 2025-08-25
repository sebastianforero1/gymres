// Importa la función de utilidad `$$` (un alias para querySelectorAll) para seleccionar múltiples elementos del DOM.
import { $$ } from "../util/dom.js";

/**
 * Activa visualmente una pestaña en la barra de navegación inferior.
 * Añade la clase 'active' al botón correspondiente y se la quita a los demás.
 * @param {string} tab - El nombre de la pestaña a activar (ej. 'home', 'profile').
 */
export function activateTab(tab) {
  // Selecciona todos los botones de navegación en la barra inferior.
  $$(".bottombar .nav-btn").forEach(b =>
    // `classList.toggle` con un segundo argumento booleano añade la clase si es `true` y la quita si es `false`.
    // La clase 'active' se aplicará solo al botón cuyo `data-go` coincida con el `tab` actual.
    b.classList.toggle("active", b.dataset.go === tab)
  );
}

/**
 * Configura los eventos de clic para la barra de navegación inferior.
 * Utiliza delegación de eventos para escuchar todos los clics en un solo lugar.
 * @param {function} navigate - La función del enrutador que se llamará para cambiar de vista.
 */
export function wireBottomBar(navigate) {
  // Añade un único listener al documento para manejar todos los clics.
  document.addEventListener("click", (e) => {
    // `closest` busca el ancestro más cercano que coincida con el selector.
    // Si el clic fue en un botón de la barra de navegación (o dentro de uno), `b` será ese botón.
    const b = e.target.closest(".bottombar .nav-btn");
    // Si no se hizo clic en un botón de navegación, no hace nada.
    if (!b) return;
    // Previene el comportamiento por defecto del navegador (ej. si el botón fuera un enlace <a>).
    e.preventDefault();
    // Llama a la función `navigate` pasándole el valor del atributo `data-go` del botón.
    navigate(b.dataset.go);
  });
}

/**
 * Configura los eventos de clic para cualquier otro elemento con el atributo `data-go`.
 * Permite crear "enlaces" de navegación en cualquier parte de la aplicación.
 * @param {function} navigate - La función del enrutador que se llamará para cambiar de vista.
 */
export function wireGo(navigate) {
  // Añade otro listener global para manejar clics de navegación genéricos.
  document.addEventListener("click", (e) => {
    // Busca el elemento más cercano con un atributo `data-go`.
    const t = e.target.closest("[data-go]");
    // Si no se encontró un elemento con `data-go`, o si el elemento está dentro de la barra inferior
    // (que ya es manejada por `wireBottomBar`), no hace nada.
    if (!t || t.closest(".bottombar")) return;
    // Previene el comportamiento por defecto.
    e.preventDefault();
    // Llama a la función `navigate` con el valor del `data-go`.
    navigate(t.dataset.go);
  });
}

