/**
 * Alias para `document.querySelector`.
 * Devuelve el primer elemento que coincide con un selector CSS.
 * @param {string} sel - El selector CSS.
 * @param {Element} [root=document] - El elemento raíz desde donde buscar. Por defecto es todo el documento.
 * @returns {Element|null} El elemento encontrado o null si no hay coincidencias.
 */
export const $ = (sel, root = document) => root.querySelector(sel);

/**
 * Alias para `document.querySelectorAll`.
 * Devuelve todos los elementos que coinciden con un selector CSS como un array.
 * @param {string} sel - El selector CSS.
 * @param {Element} [root=document] - El elemento raíz desde donde buscar. Por defecto es todo el documento.
 * @returns {Array<Element>} Un array con los elementos encontrados.
 */
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/**
 * Función de plantilla etiquetada (tagged template) para crear cadenas HTML.
 * Permite escribir HTML multilínea de forma limpia y segura, interpolando valores.
 * @param {Array<string>} strings - Array de las partes estáticas de la plantilla.
 * @param {...any} vals - Los valores interpolados (ej. ${valor}).
 * @returns {string} La cadena de texto HTML final.
 */
export const html = (strings, ...vals) =>
  // Concatena las cadenas y los valores, asegurando que los valores nulos o indefinidos se conviertan en cadenas vacías.
  strings.reduce((acc, s, i) => acc + s + (vals[i] ?? ""), "");
