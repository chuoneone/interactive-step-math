// ─────────────────────────────────────────────────────────────
// 每次部署更新內容後，只需把這個日期改成今天的日期
// 瀏覽器偵測到版本不同，就會自動安裝新版並清除舊快取
// ─────────────────────────────────────────────────────────────
const VERSION = 'sped-20260425';

// 預先快取的核心資源（每次都快取，離線也能開首頁）
const PRECACHE = [
  './',
  './index.html',
  './style.css',
  './responsive.css',
  './main.js',
  './progress.js',
  './tracking.js',
  './images/dog.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// ── Install：預快取核心資源，並立即跳過等待 ──────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()) // 不等舊分頁關閉，直接接管
  );
});

// ── Activate：清除所有舊版快取 ───────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== VERSION) // 刪除非當前版本的快取
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // 立即接管所有已開啟的分頁
  );
});

// ── Fetch：依請求類型選擇策略 ────────────────────────────────
self.addEventListener('fetch', e => {
  const req = e.request;

  // 只處理 GET，跳過 chrome-extension 等非 http 請求
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;

  // HTML 頁面 → 網路優先（確保內容最新），失敗才用快取
  if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then(res => {
          // 成功拿到新版，順便存入快取
          const clone = res.clone();
          caches.open(VERSION).then(cache => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req)) // 離線時回傳快取版本
    );
    return;
  }

  // CSS / JS / 圖片 → 快取優先（速度快），快取沒有才去網路抓
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        // 動態存入快取供下次使用
        const clone = res.clone();
        caches.open(VERSION).then(cache => cache.put(req, clone));
        return res;
      });
    })
  );
});
