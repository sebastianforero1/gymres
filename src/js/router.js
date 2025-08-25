// --- IMPORTACIONES ---
// Utilidades del DOM, plantillas de UI, componentes y estado global.
import { $, $$ } from "./util/dom.js";
import { Screens } from "./ui/templates.js";
import { activateTab } from "./ui/components.js";
import StorageService from "./services/StorageService.base.js";
// Se importan los parciales para "extender" la clase StorageService con sus métodos.
import "./services/StorageService.reservations.partial.js";
import "./services/StorageService.profile.partial.js";
import { AppState, save, isSlotTaken } from "./state.js";

// Se crea una instancia del servicio de almacenamiento que ahora tiene todos los métodos.
const store = new StorageService();

// --- CONSTANTES Y CONFIGURACIÓN ---
// Horarios disponibles para las reservas.
const HOURS = ["5 AM","6 AM","7 AM","8 AM","9 AM","10 AM","11 AM","12 PM",
               "1 PM","2 PM","3 PM","4 PM","5 PM","6 PM","7 PM","8 PM","9 PM"];

// --- FUNCIONES DE UTILIDAD (HELPERS) ---
// Convierten formatos de tiempo para facilitar cálculos.
function parseHour24(label) {
  const m = /(\d{1,2})\s*(AM|PM)/i.exec(label || "");
  if (!m) return null;
  let h = parseInt(m[1],10) % 12;
  if (m[2].toUpperCase() === "PM") h += 12;
  if (m[2].toUpperCase() === "AM" && m[1] === "12") h = 0; // 12 AM = 0
  return h;
}
function fmtShort(label) { // "5 PM" -> "5pm"
  const m = /(\d{1,2})\s*(AM|PM)/i.exec(label || "");
  return m ? `${parseInt(m[1],10)}${m[2].toLowerCase()}` : label || "-";
}
function getDiaNum(r) {
  return r.diaNum ?? parseInt(String(r.dia||"").match(/\d+/)?.[0] || "NaN", 10);
}

/**
 * Calcula y formatea la próxima reserva del usuario.
 * @returns {string} Texto de la próxima reserva (ej. "5pm") o "-" si no hay.
 */
function nextReservationText() {
  const now = new Date();
  let next = null;
  for (const r of AppState.reservas) {
    const dnum = getDiaNum(r);
    const h24 = parseHour24(r.hora || r.hour);
    if (!Number.isFinite(dnum) || h24 == null) continue;
    let when = new Date(now.getFullYear(), now.getMonth(), dnum, h24, 0, 0, 0);
    if (when < now) when.setMonth(when.getMonth() + 1);
    if (!next || when < next) next = when;
  }
  return next ? fmtShort(`${((next.getHours()+11)%12)+1} ${next.getHours()>=12?"PM":"AM"}`) : "-";
}

/**
 * Calcula la ocupación actual del gimnasio basándose en las reservas para la hora y día actuales.
 * @returns {number} El número de reservas para el slot de tiempo actual.
 */
function currentOccupancy() {
  // cuenta reservas en el "slot" de la hora actual y día actual
  const now = new Date();
  const today = now.getDate();
  const h24 = now.getHours();
  // si el slot de esa hora existe en HOURS, lo usamos; si no, buscamos el inmediato anterior
  let label = `${((h24+11)%12)+1} ${h24>=12?"PM":"AM"}`;
  if (!HOURS.includes(label)) {
    // encuentra el mayor slot cuyo parseHour24 <= h24
    let best = null;
    for (const L of HOURS) {
      const v = parseHour24(L);
      if (v != null && v <= h24) best = L;
    }
    label = best || HOURS[0];
  }
  return AppState.reservas.filter(r => getDiaNum(r) === today && (r.hora||r.hour) === label).length;
}

/**
 * Dibuja los "chips" de las horas disponibles para un día específico.
 * Deshabilita los horarios que ya están ocupados.
 * @param {number} day - El día seleccionado.
 * @param {string} selectedHour - La hora actualmente seleccionada.
 * @param {string|null} editingId - El ID de la reserva que se está editando (para no contarla como "ocupada").
 */
function paintHours(day, selectedHour, editingId) {
  const box = $("#chipsHours");
  if (!box) return;
  // Genera el HTML para cada hora, añadiendo clases 'selected' o 'disabled' según corresponda.
  box.innerHTML = HOURS.map(h => {
    const taken = isSlotTaken(day, h, editingId);
    const cls = `chip${h===selectedHour?" selected":""}${taken?" disabled":""}`;
    return `<button class="${cls}" data-hour="${h}" ${taken?"disabled aria-disabled='true'":""}>${h}</button>`;
  }).join("");
  // Añade listeners a los chips que no están deshabilitados para manejar la selección.
  $$("#chipsHours .chip:not(.disabled)").forEach(c => {
    c.addEventListener("click", e => {
      $$("#chipsHours .chip").forEach(x => x.classList.remove("selected"));
      e.currentTarget.classList.add("selected");
    });
  });
}

/** Muestra u oculta la barra de navegación superior (ej. la oculta en la pantalla de login). */
function toggleHeader(route) {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;
  topbar.classList.toggle("hidden", route === "login");
}

/** Valida los campos del formulario de login. */
function validateLogin({ apto, torre, cedula }) {
  if (!apto || !torre || !cedula) return "Todos los campos son obligatorios.";
  if (!/^\d{3,}$/.test(cedula)) return "La cédula debe ser numérica (≥3 dígitos).";
  return null;
}

// --- FUNCIÓN PRINCIPAL DE RENDERIZADO ---
/**
 * Renderiza una vista de la aplicación en el contenedor principal.
 * @param {string} requestedRoute - El nombre de la ruta a renderizar.
 */
export function render(requestedRoute) {
  try {
    // Si la ruta no existe, redirige a 'login'.
    let route = routes[requestedRoute] ? requestedRoute : "login";

    // "Guardia de autenticación": si no hay usuario y la ruta no es 'login', fuerza a 'login'.
    if (!AppState.user && route !== "login") {
      route = "login";
      if (location.hash !== "#/login") location.hash = "#/login";
    }

    // Lógica que se ejecuta ANTES de pintar la vista.
    if (route === "home") {
      // Calcula valores dinámicos para la pantalla de inicio.
      AppState.ocupacion.ocupados = currentOccupancy();
      AppState.nextReservationText = nextReservationText();
      save(); // Guarda estos nuevos valores en el estado.
    }

    toggleHeader(route);

    // Obtiene el HTML de la plantilla y lo inserta en el DOM.
    const view = routes[route]();
    $("#app").innerHTML = view;

    // --- LÓGICA POST-RENDERIZADO (WIRING) ---
    // Se añade la lógica y los event listeners a los elementos recién creados.

    // ----- LOGIN -----
    if (route === "login") {
      const submit = () => {
        const user = {
          apto: $("#apto")?.value.trim(),
          torre: $("#torre")?.value.trim(),
          cedula: $("#cc")?.value.trim(),
          nombre: $("#nombre")?.value?.trim() || undefined
        };
        const err = validateLogin(user);
        if (err) { const m = $("#loginMsg"); if (m) m.textContent = err; return; }
        store.setUser(user);
        location.hash = "#/home";
      };
      $("#btnLogin")?.addEventListener("click", submit);
      $$("#apto, #torre, #cc, #nombre").forEach(i => i?.addEventListener("keydown", e => {
        if (e.key === "Enter") submit();
      }));
      return;
    }

    if (route === "home") { activateTab("home"); return; }

    // ----- RESERVAS -----
    if (route === "reservas") {
      activateTab("reservas");

      const editingId = AppState.ui?.editingId || null;
      const editingItem = editingId ? AppState.reservas.find(r => r.id === editingId) : null;

      let selDay  = editingItem ? getDiaNum(editingItem) : 18;
      let selHour = editingItem ? (editingItem.hora || editingItem.hour) : "7 AM";

      // marca día
      $$("#gridDays .day").forEach(btn => {
        if (+btn.dataset.day === selDay) btn.classList.add("selected");
      });

      $$("#gridDays .day").forEach(d => d.addEventListener("click", e => {
        selDay = +e.currentTarget.dataset.day;
        $$("#gridDays .day").forEach(x => x.classList.remove("selected"));
        e.currentTarget.classList.add("selected");
        paintHours(selDay, selHour, editingId);
      }));

      paintHours(selDay, selHour, editingId);

      $("#btnAddReserva").textContent = editingId ? "Guardar Cambios" : "Añadir Reserva";

      $("#btnAddReserva").addEventListener("click", () => {
        const s = $("#chipsHours .chip.selected:not(.disabled)");
        if (s) selHour = s.dataset.hour;
        if (isSlotTaken(selDay, selHour, editingId)) return;

        if (editingId) {
          store.updateReserva(editingId, { diaNum: selDay, hora: selHour });
          AppState.ui.editingId = null;
          save();
        } else {
          store.addReserva({ diaNum: selDay, hora: selHour });
        }
        location.hash = "#/mis-reservas";
      });
      return;
    }

    // ----- MIS RESERVAS -----
    if (route === "mis-reservas") {
      activateTab("mis-reservas");

      const list = $("#app .list");
      if (list && AppState.reservas.length === 0) {
        list.innerHTML = `<div class="card">No tienes reservas activas.</div>`;
      }

      $$("#app [data-del]").forEach(b => b.addEventListener("click", e => {
        store.removeReserva(e.currentTarget.dataset.del);
        render("mis-reservas");
      }));

      $$("#app [data-edit]").forEach(b => b.addEventListener("click", e => {
        AppState.ui.editingId = e.currentTarget.dataset.edit;
        save();
        location.hash = "#/reservas";
      }));
      return;
    }

    if (route === "perfil") { activateTab("perfil"); return; }

    if (route === "config") {
      $$(".switch").forEach(sw =>
        sw.addEventListener("click", (e) => {
          const el = e.currentTarget;
          el.classList.toggle("on");
          const i = +el.dataset.toggle;
          AppState.settings.toggles[i] = el.classList.contains("on");
          save();
        })
      );
      return;
    }

  } catch (err) {
    const app = document.getElementById("app");
    if (app) app.innerHTML = `<div class="card"><b>Error:</b><pre style="white-space:pre-wrap">${err.stack||err}</pre></div>`;
    else alert(err);
  }
}

// --- MAPA DE RUTAS ---
// Asocia cada nombre de ruta con su función de plantilla correspondiente.
const routes = {
  login: Screens.login,
  home: Screens.home,
  reservas: Screens.reservas,
  "mis-reservas": Screens.misReservas,
  perfil: Screens.perfil,
  config: Screens.config,
  estado: Screens.estado
};
