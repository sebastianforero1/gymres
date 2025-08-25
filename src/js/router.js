import { $, $$ } from "./util/dom.js";
import { Screens } from "./ui/templates.js";
import { activateTab } from "./ui/components.js";
import StorageService from "./services/StorageService.base.js";
import "./services/StorageService.reservations.partial.js";
import "./services/StorageService.profile.partial.js";
import { AppState, save, isSlotTaken } from "./state.js";

const store = new StorageService();

// Horarios disponibles (puedes ampliar)
const HOURS = ["5 AM","6 AM","7 AM","8 AM","9 AM","10 AM","11 AM","12 PM",
               "1 PM","2 PM","3 PM","4 PM","5 PM","6 PM","7 PM","8 PM","9 PM"];

// Helpers de tiempo
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

// Rellena chips de horas según día y edición
function paintHours(day, selectedHour, editingId) {
  const box = $("#chipsHours");
  if (!box) return;
  box.innerHTML = HOURS.map(h => {
    const taken = isSlotTaken(day, h, editingId);
    const cls = `chip${h===selectedHour?" selected":""}${taken?" disabled":""}`;
    return `<button class="${cls}" data-hour="${h}" ${taken?"disabled aria-disabled='true'":""}>${h}</button>`;
  }).join("");
  $$("#chipsHours .chip:not(.disabled)").forEach(c => {
    c.addEventListener("click", e => {
      $$("#chipsHours .chip").forEach(x => x.classList.remove("selected"));
      e.currentTarget.classList.add("selected");
    });
  });
}

function toggleHeader(route) {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;
  if (route === "login") topbar.classList.add("hidden");
  else topbar.classList.remove("hidden");
}

// ---- Validación login
function validateLogin({ apto, torre, cedula }) {
  if (!apto || !torre || !cedula) return "Todos los campos son obligatorios.";
  if (!/^\d{3,}$/.test(cedula)) return "La cédula debe ser numérica (≥3 dígitos).";
  return null;
}

export function render(requestedRoute) {
  try {
    let route = routes[requestedRoute] ? requestedRoute : "login";

    // guarda de auth
    if (!AppState.user && route !== "login") {
      route = "login";
      if (location.hash !== "#/login") location.hash = "#/login";
    }

    // valores dinámicos ANTES de pintar Home
    if (route === "home") {
      AppState.ocupacion.ocupados = currentOccupancy();
      AppState.nextReservationText = nextReservationText(); // "5pm", "6am", etc.
      save();
    }

    toggleHeader(route);

    const view = routes[route]();
    $("#app").innerHTML = view;

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

const routes = {
  login: Screens.login,
  home: Screens.home,
  reservas: Screens.reservas,
  "mis-reservas": Screens.misReservas,
  perfil: Screens.perfil,
  config: Screens.config,
  estado: Screens.estado
};
