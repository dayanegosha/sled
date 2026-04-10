const DB_NAME = 'sled-tracks';
const STORE_NAME = 'gps-points';
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function flushGpsPoints() {
  const db = await openDb();

  const entries = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const results = [];
    const cursorReq = store.openCursor();
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (cursor) {
        results.push({ key: cursor.key, value: cursor.value });
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });

  if (entries.length === 0) return;

  const points = entries.map((e) => ({
    lat: e.value.lat,
    lng: e.value.lng,
    accuracy: e.value.accuracy,
    timestamp: e.value.timestamp,
  }));

  const response = await fetch('/api/v1/tracks/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ points }),
  });

  if (!response.ok) throw new Error('Flush failed');

  const keys = entries.map((e) => e.key);
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const key of keys) {
      store.delete(key);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'flush-gps') {
    event.waitUntil(flushGpsPoints());
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'flush-gps-periodic') {
    event.waitUntil(flushGpsPoints());
  }
});
