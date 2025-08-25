import StorageService from "./StorageService.base.js";
import { AppState } from "../state.js";

Object.assign(StorageService.prototype, {
  setUser(user) { AppState.user = user; this._commit(); },
  getUser() { return AppState.user; }
});

export default StorageService;
