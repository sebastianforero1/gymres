// Importa la clase base `StorageService` para poder extenderla.
import StorageService from "./StorageService.base.js";
// Importa el estado global de la aplicación para poder leer y modificar la lista de reservas.
import { AppState } from "../state.js";

// Utiliza `Object.assign` para añadir un conjunto de métodos al prototipo de `StorageService`.
// Esto le agrega la funcionalidad de gestión de reservas a la clase original.
Object.assign(StorageService.prototype, {
  /**
   * Añade una nueva reserva al estado de la aplicación.
   * @param {object} reserva - El objeto de reserva a añadir.
   * @returns {object} La reserva añadida, ahora con un ID único.
   */
  addReserva(reserva) {
    // Define una función interna `gen` para generar un ID único.
    // Intenta usar `crypto.randomUUID()` que es el estándar moderno y seguro.
    // Si no está disponible, usa un método de respaldo con `Math.random()`.
    const gen = () =>
      (crypto && crypto.randomUUID ? crypto.randomUUID() : "id-" + Math.random().toString(36).slice(2));
    // Asigna el ID generado a la reserva.
    reserva.id = gen();
    // Añade la nueva reserva al array `reservas` en el estado global.
    AppState.reservas.push(reserva);
    // Guarda el estado actualizado en el almacenamiento persistente.
    this._commit();
    // Devuelve la reserva con su nuevo ID.
    return reserva;
  },

  /**
   * Actualiza una reserva existente.
   * @param {string} id - El ID de la reserva a actualizar.
   * @param {object} updates - Un objeto con los campos a actualizar.
   * @returns {object|null} La reserva actualizada o null si no se encontró.
   */
  updateReserva(id, updates) {
    // Encuentra el índice de la reserva que coincide con el ID proporcionado.
    const i = AppState.reservas.findIndex(r => r.id === id);
    // Si se encontró la reserva (el índice es 0 o mayor)...
    if (i >= 0) {
      // Reemplaza la reserva en esa posición con una nueva versión que combina
      // la reserva original con los nuevos datos del objeto `updates`.
      AppState.reservas[i] = { ...AppState.reservas[i], ...updates };
      // Guarda los cambios.
      this._commit();
      // Devuelve la reserva actualizada.
      return AppState.reservas[i];
    }
    // Si no se encontró, devuelve null.
    return null;
  },

  /**
   * Elimina una reserva del estado por su ID.
   * @param {string} id - El ID de la reserva a eliminar.
   */
  removeReserva(id) {
    // Reasigna el array `reservas` a una nueva versión que filtra (excluye) la reserva con el ID coincidente.
    AppState.reservas = AppState.reservas.filter(r => r.id !== id);
    // Guarda los cambios.
    this._commit();
  },

  /**
   * Devuelve la lista completa de reservas.
   * @returns {Array<object>} El array de reservas.
   */
  listReservas() { return AppState.reservas; }
});

// Exporta la clase `StorageService` modificada para que otros módulos puedan usarla.
export default StorageService;
