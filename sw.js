/**
 * Service Worker para RegenTech PWA
 * Implementa cache inteligente, sincronização offline e notificações push
 * @version 3.0.0
 */

const CACHE_NAME = 'regentech-v3.0.0';
const STATIC_CACHE = 'regentech-static-v3.0.0';
const DYNAMIC_CACHE = 'regentech-dynamic-v3.0.0';
const API_CACHE = 'regentech-api-v3.0.0';

// Recursos essenciais para cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/script.js',
  '/styles.css',
  '/manifest.json',
  '/src/core/Platform.js',
  '/src/config/ConfigManager.js',
  '/src/utils/Logger.js',
  '/src/components/NavigationManager.js',
  '/src/components/UIManager.js',
  '/src/modules/metrics/MetricsEngine.js',
  '/src/modules/blockchain/BlockchainSystem.js',
  '/src/modules/digital-twin/DigitalTwinSystem.js',
  '/src/modules/api/APISystem.js',
  '/src/modules/iot/IoTSystem.js',
  '/src/modules/marketplace/MarketplaceSystem.js'
];

// URLs de API para cache estratégico
const API_ENDPOINTS = [
  '/api/metrics',
  '/api/sensors',
  '/api/blockchain',
  '/api/marketplace',
  '/api/iot'
];

// Configurações de cache
const CACHE_STRATEGIES = {
  static: 'cache-first',
  api: 'network-first',
  images: 'cache-first',
  dynamic: 'stale-while-revalidate'
};

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache de recursos estáticos
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Cacheando recursos estáticos...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Pré-cache de dados críticos
      caches.open(API_CACHE).then(cache => {
        console.log('🌐 Pré-cacheando dados da API...');
        return Promise.allSettled(
          API_ENDPOINTS.map(endpoint => 
            fetch(endpoint)
              .then(response => response.ok ? cache.put(endpoint, response) : null)
              .catch(() => null)
          )
        );
      })
    ]).then(() => {
      console.log('✅ Service Worker instalado com sucesso!');
      return self.skipWaiting();
    })
  );
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Ativando...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('regentech-') && 
              ![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(cacheName)
            )
            .map(cacheName => {
              console.log('🗑️ Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Tomar controle de todas as abas
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker ativado!');
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) return;
  
  // Estratégia baseada no tipo de recurso
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isImageRequest(url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Estratégias de cache

// Cache First - Para recursos estáticos
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache First falhou:', error);
    return new Response('Recurso não disponível offline', { status: 503 });
  }
}

// Network First - Para APIs
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('🔄 Fallback para cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retornar dados offline simulados para APIs críticas
    return generateOfflineResponse(request);
  }
}

// Stale While Revalidate - Para conteúdo dinâmico
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Utilitários

function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.pathname === asset) ||
         url.pathname.match(/\.(js|css|html|json)$/);
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));
}

function isImageRequest(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/);
}

function generateOfflineResponse(request) {
  const url = new URL(request.url);
  
  // Dados offline simulados baseados no endpoint
  const offlineData = {
    '/api/metrics': {
      status: 'offline',
      data: {
        energy: { value: 0, status: 'offline' },
        water: { value: 0, status: 'offline' },
        carbon: { value: 0, status: 'offline' }
      },
      timestamp: Date.now(),
      message: 'Dados offline - sincronização pendente'
    },
    '/api/sensors': {
      status: 'offline',
      sensors: [],
      message: 'Sensores offline - aguardando conexão'
    },
    '/api/marketplace': {
      status: 'offline',
      products: [],
      message: 'Marketplace offline - produtos em cache'
    }
  };
  
  const data = offlineData[url.pathname] || {
    status: 'offline',
    message: 'Serviço temporariamente indisponível'
  };
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Offline-Response': 'true'
    }
  });
}

// Sincronização em background
self.addEventListener('sync', event => {
  console.log('🔄 Background Sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    console.log('📡 Executando sincronização em background...');
    
    // Sincronizar dados pendentes
    const pendingData = await getPendingData();
    
    for (const data of pendingData) {
      try {
        await fetch(data.url, {
          method: data.method,
          body: data.body,
          headers: data.headers
        });
        
        await removePendingData(data.id);
        console.log('✅ Dados sincronizados:', data.id);
      } catch (error) {
        console.error('❌ Erro na sincronização:', error);
      }
    }
    
    // Atualizar cache de APIs
    await updateAPICache();
    
  } catch (error) {
    console.error('❌ Erro na sincronização em background:', error);
  }
}

// Notificações Push
self.addEventListener('push', event => {
  console.log('📱 Push notification recebida');
  
  const options = {
    body: 'Nova atualização disponível na RegenTech!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explorar',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/action-close.png'
      }
    ]
  };
  
  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.title = payload.title || 'RegenTech';
    options.data = { ...options.data, ...payload.data };
  }
  
  event.waitUntil(
    self.registration.showNotification('RegenTech', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notificação clicada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/#dashboard')
    );
  } else if (event.action === 'close') {
    // Apenas fechar a notificação
    return;
  } else {
    // Clique na notificação principal
    event.waitUntil(
      clients.matchAll().then(clientList => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Gerenciamento de dados pendentes (IndexedDB)
async function getPendingData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RegenTechOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingData'], 'readonly');
      const store = transaction.objectStore('pendingData');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingData')) {
        db.createObjectStore('pendingData', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function removePendingData(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RegenTechOffline', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingData'], 'readwrite');
      const store = transaction.objectStore('pendingData');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

async function updateAPICache() {
  const cache = await caches.open(API_CACHE);
  
  const updatePromises = API_ENDPOINTS.map(async endpoint => {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        await cache.put(endpoint, response);
        console.log('🔄 Cache atualizado:', endpoint);
      }
    } catch (error) {
      console.log('⚠️ Falha ao atualizar cache:', endpoint);
    }
  });
  
  await Promise.allSettled(updatePromises);
}

// Mensagens do cliente
self.addEventListener('message', event => {
  console.log('💬 Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames
    .filter(name => name.startsWith('regentech-'))
    .map(name => caches.delete(name));
  
  await Promise.all(deletePromises);
  console.log('🗑️ Todos os caches limpos');
}

console.log('🌟 RegenTech Service Worker carregado - Versão', CACHE_NAME);