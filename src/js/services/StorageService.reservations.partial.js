import StorageService from "./StorageService.base.js";
import { AppState } from "../state.js";

Object.assign(StorageService.prototype, {
  addReserva(reserva) {
    const gen = () =>
      (crypto && crypto.randomUUID ? crypto.randomUUID() : "id-" + Math.random().toString(36).slice(2));
    reserva.id = gen();
    AppState.reservas.push(reserva);
    this._commit();
    return reserva;
  },
  updateReserva(id, updates) {
    const i = AppState.reservas.findIndex(r => r.id === id);
    if (i >= 0) {
      AppState.reservas[i] = { ...AppState.reservas[i], ...updates };
      this._commit();
      return AppState.reservas[i];
    }
    return null;
  },
  removeReserva(id) {
    AppState.reservas = AppState.reservas.filter(r => r.id !== id);
    this._commit();
  },
  listReservas() { return AppState.reservas; }
});

export default StorageService;
