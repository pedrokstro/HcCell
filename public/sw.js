// Service Worker para HcCell PWA
const CACHE_NAME = 'hccell-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/index.css',
    '/favicon.png',
    '/manifest.webmanifest'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.log('Erro ao abrir cache:', error);
            })
    );
    // Ativa imediatamente
    self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Toma controle de todas as páginas imediatamente
    self.clients.claim();
});

// Estratégia: Network First com fallback para Cache
self.addEventListener('fetch', (event) => {
    // Ignorar requisições não-GET
    if (event.request.method !== 'GET') return;

    // Ignorar requisições de extensões/plugins
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Se a resposta for válida, armazena no cache
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                }
                return response;
            })
            .catch(() => {
                // Se falhar a rede, tenta o cache
                return caches.match(event.request);
            })
    );
});
