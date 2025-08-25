// Define el nombre y la versión de la caché. Cambiar la versión (ej. a "v2") invalidará la caché antigua.
const CACHE = "gymres-cache-v1";
// Lista de los archivos esenciales (el "esqueleto" de la aplicación) que se guardarán en la caché.
const ASSETS = [
  "./",
  "./index.html",
  "./assets/styles.css",
  "./assets/app.js",
  "./assets/img/logo.png"
];

// Evento 'install': Se dispara cuando el Service Worker se registra por primera vez.
self.addEventListener("install", e => {
  // `waitUntil` espera a que la promesa se resuelva antes de terminar la instalación.
  // Aquí, esperamos a que se abra la caché y se añadan todos los assets esenciales.  
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  // Fuerza al nuevo Service Worker a activarse inmediatamente.
  self.skipWaiting();
});

// Evento 'activate': Se dispara cuando el Service Worker se activa y toma el control.
self.addEventListener("activate", e => {
  // `waitUntil` espera a que la limpieza de cachés antiguas termine.
  e.waitUntil(
    caches.keys().then(keys =>
      // `Promise.all` espera a que se eliminen todas las cachés que no coincidan con el nombre de la CACHE actual.
      // Esto es útil para limpiar versiones antiguas de la caché cuando actualizas la aplicación.
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  // Permite que el Service Worker activo tome el control de todos los clientes (pestañas) abiertos inmediatamente.
  self.clients.claim();
});

// Evento 'fetch': Se dispara cada vez que la aplicación realiza una petición de red (ej. para un archivo CSS, JS, imagen, etc.).
self.addEventListener("fetch", e => {
  // `respondWith` intercepta la petición y nos permite devolver nuestra propia respuesta.
  e.respondWith(
    // Estrategia "Cache First":
    // 1. Intenta encontrar una respuesta que coincida con la petición en la caché.
    caches.match(e.request).then(r => 
      // 2. Si se encuentra una respuesta en la caché (`r`), la devuelve.
      //    Si no (`||`), realiza la petición de red original con `fetch`.
      r || fetch(e.request).then(res => {
        // 3. Cuando la petición de red tiene éxito, guardamos una copia en la caché para futuras peticiones.
        const copy = res.clone(); // Clonamos la respuesta porque solo se puede leer una vez.
        caches.open(CACHE).then(c => c.put(e.request, copy));
        // 4. Devolvemos la respuesta original de la red a la aplicación.
        return res;
      })
    )
  );
});
