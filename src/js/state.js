export const AppState = {
  user: null,
  reservas: [],                              // {id, diaNum, hora}
  ocupacion: { ocupados: 8, capacidad: 15 },
  settings: { toggles: [false, true, false, true] },
  ui: { editingId: null }                    // <- id de la reserva en edición (o null)
};

const KEY = "gymres-state";

export function load() {
  const raw = localStorage.getItem(KEY);
  if (raw) Object.assign(AppState, JSON.parse(raw));
}
export function save() {
  localStorage.setItem(KEY, JSON.stringify(AppState));
}

/* Helpers para horarios ocupados */
export function isSlotTaken(day, hour, excludeId = null) {
  return AppState.reservas.some(r => {
    const d = r.diaNum ?? parseInt(String(r.dia||"").match(/\d+/)?.[0] || "NaN", 10);
    const h = r.hora || r.hour;
    return d === day && h === hour && r.id !== excludeId;
  });
}
