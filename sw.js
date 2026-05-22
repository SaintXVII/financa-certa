const CACHE = 'financacerta-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './icon.png',
  './icon-192.png'
];

// Instala e faz cache dos assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting(); // Força ativação imediata
});

// Remove caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log('[SW] Deletando cache antigo:', k);
        return caches.delete(k);
      }))
    )
  );
  self.clients.claim(); // Assume controle imediato de todas as abas
});

// Estratégia: Network First (sempre tenta buscar versão nova da rede)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request)) // Fallback pro cache se offline
  );
});

// Notifica o app quando há atualização disponível
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
