// Importa la función `save` desde el módulo de estado. 
// La función `save` es la responsable de tomar el estado actual de la aplicación 
// y guardarlo en el almacenamiento persistente (como localStorage).
import { AppState, save } from "../state.js";

// Exporta la clase `StorageService` para que pueda ser importada y extendida por otros archivos.
export default class StorageService {
  // El constructor está vacío porque esta clase base no necesita ninguna configuración inicial.
  constructor() {}

  // Define un método llamado `_commit`. El guion bajo (_) es una convención para indicar
  // que este método está destinado a un uso interno de la clase y sus subclases.
  // Su única responsabilidad es llamar a la función `save()`.
  // De esta manera, cualquier servicio que herede de `StorageService` puede simplemente
  // llamar a `this._commit()` para persistir los cambios en el estado de la aplicación.
  _commit() { 
    save();
  }
}
