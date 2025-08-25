/**
 * Objeto global que contiene todo el estado de la aplicación.
 * Es la "única fuente de verdad" para los datos.
 */
export const AppState = {
  // Almacena los datos del usuario que ha iniciado sesión. Es `null` si nadie ha iniciado sesión.
  user: null,
  // Un array que contiene todos los objetos de reserva. Cada reserva tiene un id, día y hora.
  reservas: [],
  // Información sobre la ocupación actual del gimnasio.
  ocupacion: { ocupados: 8, capacidad: 15 },
  // Guarda las configuraciones del usuario, como los interruptores de la pantalla de configuración.
  settings: { toggles: [false, true, false, true] },
  // Estado relacionado con la interfaz de usuario, como saber qué reserva se está editando.
  ui: { editingId: null }
};

// Define la clave que se usará para guardar y recuperar el estado en el localStorage del navegador.
const KEY = "gymres-state";

/**
 * Carga el estado desde localStorage y lo fusiona con el AppState actual.
 * Esto permite que la aplicación "recuerde" el estado de la última sesión.
 */
export function load() {
  // Obtiene la cadena de texto JSON del localStorage.
  const raw = localStorage.getItem(KEY);
  // Si existe un estado guardado...
  if (raw) {
    // ...lo convierte de JSON a un objeto y lo fusiona con el AppState.
    // `Object.assign` actualiza las propiedades de AppState con las guardadas.
    Object.assign(AppState, JSON.parse(raw));
  }
}

/**
 * Guarda el estado actual de AppState en localStorage.
 * Debe llamarse cada vez que se realiza un cambio que deba ser persistente.
 */
export function save() {
  // Convierte el objeto AppState a una cadena de texto JSON y lo guarda en localStorage.
  localStorage.setItem(KEY, JSON.stringify(AppState));
}

/**
 * Función de utilidad para verificar si un horario específico ya está ocupado.
 * @param {number} day - El número del día a verificar.
 * @param {string} hour - La hora a verificar (ej. "5 PM").
 * @param {string|null} [excludeId=null] - Un ID de reserva para excluir de la verificación.
 *   Esto es útil cuando se edita una reserva, para que no se marque a sí misma como "ocupada".
 * @returns {boolean} `true` si el horario está ocupado, `false` en caso contrario.
 */
export function isSlotTaken(day, hour, excludeId = null) {
  // `some` recorre el array de reservas y devuelve `true` si al menos una cumple la condición.
  return AppState.reservas.some(r => {
    // Extrae el número del día y la hora de cada reserva en el array.
    const d = r.diaNum ?? parseInt(String(r.dia||"").match(/\d+/)?.[0] || "NaN", 10);
    const h = r.hora || r.hour;
    // Devuelve `true` si el día y la hora coinciden, y el ID no es el que se debe excluir.
    return d === day && h === hour && r.id !== excludeId;
  });
}
