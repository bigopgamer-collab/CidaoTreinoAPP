const CACHE_NAME = "cidao-treino-v1";

const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "assets/audio/1.wav",
  "assets/audio/2.wav",
  "assets/audio/3.wav",
  "assets/audio/4.wav",
  "assets/audio/5.wav",
  "assets/audio/time.wav",
  "assets/gifs/abdominal.mp4",
  "assets/gifs/agachamento.mp4",
  "assets/gifs/agachamento_sumo.mp4",
  "assets/gifs/birddog.mp4",
  "assets/gifs/burpee.mp4",
  "assets/gifs/deadbug.mp4",
  "assets/gifs/descanso.mp4",
  "assets/gifs/final.mp4",
  "assets/gifs/flexao.mp4",
  "assets/gifs/flexao_inclinada.mp4",
  "assets/gifs/flexao_parede.mp4",
  "assets/gifs/mountain_climber.mp4",
  "assets/gifs/polichinelo.mp4",
  "assets/gifs/prancha.mp4",
  "assets/gifs/prancha_lateral.mp4",
  "assets/gifs/preparando.mp4",
  "assets/gifs/superman.mp4",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first: essencial pra o treino não travar sem internet no meio do exercício.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((resp) => {
        if (resp.ok && event.request.url.startsWith(self.location.origin)) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
