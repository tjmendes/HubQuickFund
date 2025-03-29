/**
 * Service Worker para o QuickFundHub
 * Permite que o aplicativo funcione offline e seja instalável como PWA
 */

// Nome do cache
const CACHE_NAME = 'quickfundhub-v1';

// Arquivos para cache inicial
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/favicon.ico',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retornar resposta do cache
        if (response) {
          return response;
        }

        // Clonar a requisição
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Verificar se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar a resposta
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Não armazenar em cache requisições de API
                if (!event.request.url.includes('/api/')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});

// Sincronização em segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-profits') {
    event.waitUntil(syncProfits());
  }
});

// Função para sincronizar lucros quando online
async function syncProfits() {
  try {
    // Obter dados pendentes do IndexedDB
    const pendingData = await getPendingProfitData();
    
    if (pendingData && pendingData.length > 0) {
      // Enviar dados para o servidor
      const response = await fetch('/api/profits/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profits: pendingData
        })
      });
      
      if (response.ok) {
        // Limpar dados sincronizados
        await clearPendingProfitData();
        
        // Notificar o usuário
        self.registration.showNotification('QuickFundHub', {
          body: 'Dados de lucro sincronizados com sucesso!',
          icon: '/pwa-192x192.png'
        });
      }
    }
  } catch (error) {
    console.error('Erro ao sincronizar lucros:', error);
  }
}

// Funções auxiliares para IndexedDB (implementação simplificada)
async function getPendingProfitData() {
  // Implementação real usaria IndexedDB
  return [];
}

async function clearPendingProfitData() {
  // Implementação real usaria IndexedDB
  return true;
}

// Notificações push
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});