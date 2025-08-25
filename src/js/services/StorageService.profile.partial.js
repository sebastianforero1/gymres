// Importa la clase base `StorageService` que contiene el método _commit para guardar el estado.
import StorageService from "./StorageService.base.js";
// Importa el objeto `AppState`, que es el estado global de la aplicación.
import { AppState } from "../state.js";

// Utiliza `Object.assign` para añadir nuevos métodos directamente al prototipo de `StorageService`.
// Esto "extiende" la clase original con nueva funcionalidad, un patrón a veces llamado "mixin" o "partial".
// De esta forma, cualquier instancia de `StorageService` tendrá acceso a estos nuevos métodos.
Object.assign(StorageService.prototype, {
  /**
   * Establece los datos del usuario en el estado global y guarda los cambios.
   * @param {object} user - El objeto de usuario a guardar.
   */
  setUser(user) {
    // Asigna el objeto `user` a la propiedad `user` del estado global de la aplicación.
    AppState.user = user;
    // Llama al método `_commit` heredado de la clase base `StorageService`.
    // Este método se encarga de persistir el estado completo de la aplicación (ahora con el nuevo usuario) en localStorage.
    this._commit();
  },

  /**
   * Obtiene los datos del usuario desde el estado global.
   * @returns {object} El objeto de usuario actual.
   */
  getUser() {
    // Devuelve el objeto `user` que está actualmente en el estado de la aplicación.
    return AppState.user;
  }
});

// Exporta la clase `StorageService` ya modificada.
// Cualquier otro módulo que importe `StorageService` a través de este archivo
// recibirá la clase con los métodos `setUser` y `getUser` ya incluidos.
export default StorageService;
