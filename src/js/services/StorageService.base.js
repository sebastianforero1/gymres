import { AppState, save } from "../state.js";

export default class StorageService {
  constructor() {}
  _commit() { save(); }
}
