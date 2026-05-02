// sw.js — Raco Sushi
// Estrategia: Network First para HTML, cache para el resto
const CACHE = 'raco-v1'

self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  const isHTML = url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === ''

  if (isHTML) {
    // HTML: siempre busca la versión nueva del servidor
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match(e.request))
    )
  } else {
    // Recursos estáticos (imágenes, fuentes, etc): cache normal
    e.respondWith(
      caches.match(e.request).then(cached => {
        return cached || fetch(e.request).then(res => {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
          return res
        })
      })
    )
  }
})
