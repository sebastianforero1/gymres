// src/js/ui/templates.js
import { html } from "../util/dom.js";
import { AppState } from "../state.js";

export const Screens = {
  login: () => html`
    <section class="screen">
      <img src="./assets/img/logo.png" alt="GymRes" class="login-logo"/>
      <h2 style="text-align:center; letter-spacing:.06em;">BIENVENIDO</h2>
      <input id="apto"  class="input" placeholder="Apartamento" autocomplete="off">
      <input id="torre" class="input" placeholder="Torre" autocomplete="off">
      <input id="cc"    class="input" placeholder="Cedula" inputmode="numeric" autocomplete="off">
      <button class="btn-primary" id="btnLogin">Iniciar Sesion</button>
      <p id="loginMsg" style="text-align:center; margin-top:.5rem; color:#666;">&nbsp;</p>
    </section>
  `,

  home: () => html`
    <section class="screen">
      <h2 class="screen-title">Bienvenida</h2>

      <div class="card">
        <p><strong>Estado actual:</strong><br>
           Ocupación: ${AppState.ocupacion.ocupados}/${AppState.ocupacion.capacidad}</p>
        <div class="progress" aria-label="Ocupación">
          <div class="progress__bar"
               style="width:${(AppState.ocupacion.ocupados/AppState.ocupacion.capacidad)*100}%"></div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi">
          <div>Reservas activas:</div>
          <div style="font-size:1.6rem; font-weight:800;">${AppState.reservas.length}</div>
        </div>
        <div class="kpi">
          <div>Próxima Reserva:</div>
          <div style="font-size:1.6rem; font-weight:800;">
            ${AppState.nextReservationText || "-"}
          </div>
        </div>
      </div>

      <div class="card" style="min-height:80px">Resumen de la proxima reserva</div>
      <button class="btn-primary" data-go="reservas">Nueva Reserva</button>
    </section>
  `,

   reservas: () => html`
    <section class="screen">
      <h2 class="screen-title">Reservas</h2>
      <p><strong>SELECCIONAR FECHA:</strong></p>
      <div class="grid-days" id="gridDays">
        ${Array.from({length:30}, (_,i)=> i+1).map(d=>{
          const selected = d === 18 ? "selected" : "";
          return `<button class="day ${selected}" data-day="${d}">${d}</button>`;
        }).join("")}
      </div>
      <div class="section">
        <p><strong>HORARIOS DISPONIBLES:</strong></p>
        <div class="chips" id="chipsHours"></div>   <!-- <- el router lo rellena -->
      </div>
      <button class="btn-primary" id="btnAddReserva">Añadir Reserva</button>
    </section>
  `,

  misReservas: () => html`
    <section class="screen">
      <h2 class="screen-title">Mis Reservas</h2>
      <div class="list">
        ${AppState.reservas.map(r => {
          const diaNum = (r.diaNum ?? parseInt(String(r.dia||"").match(/\d+/)?.[0] || "NaN", 10));
          const diaTxt = Number.isFinite(diaNum) ? `Día ${diaNum}` : (r.dia || "");
          const horaTxt = r.hora || r.hour || "";
          return `
            <div class="card">
              <div style="font-weight:800;">RESERVA ${diaTxt} - ${horaTxt}</div>
              <div style="display:flex; gap:.5rem; margin-top:.5rem;">
                <button class="chip" data-edit="${r.id}">EDITAR</button>
                <button class="chip" data-del="${r.id}">CANCELAR</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
      <button class="fab" data-go="reservas">+</button>
    </section>
  `,

  perfil: () => html`
    <section class="screen">
      <h2 class="screen-title">Perfil</h2>
      <div class="avatar"></div>
      <p style="text-align:center; font-weight:700;">
        ${AppState.user ? `${AppState.user.nombre || "Residente"}<br>Apto ${AppState.user.apto} torre ${AppState.user.torre}` : "Invitado"}
      </p>
      <div class="card"><strong>ESTADISTICAS DE USO:</strong><br>Reservas esta semana:</div>
      <button class="btn-primary" data-go="config">Configuración</button>
    </section>
  `,

  config: () => {
    const T = AppState.settings.toggles;
    const rows = [
      ["Notificaciones", T[0]],
      ["Mantener sesión", T[1]],
      ["Añadir a calendario", T[2]],
      ["Recordarme 1 h antes", T[3]],
    ];
    return html`
      <section class="screen">
        <h2 class="screen-title">Configuración</h2>
        ${rows.map((row,i)=> `
          <div class="toggle">
            <span>${row[0]}</span>
            <div class="switch${row[1] ? " on": ""}" data-toggle="${i}"></div>
          </div>
        `).join("")}
        <button class="back" data-go="perfil">←</button>
      </section>
    `;
  },

  estado: () => html`
    <section class="screen">
      <h2 class="screen-title">Próximas Horas</h2>
      <div class="list">
        <div class="item">7 PM - 8:30 PM</div>
        <div class="item">7 PM - 8:30 PM</div>
        <div class="item">7 PM - 8:30 PM</div>
      </div>
      <button class="back" data-go="home">↑</button>
    </section>
  `
};
