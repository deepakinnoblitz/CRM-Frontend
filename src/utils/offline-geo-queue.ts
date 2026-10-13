/**
 * IndexedDB Offline Geolocation Queue
 * Stores coordinates locally when offline or when network requests fail,
 * and synchronizes them with the backend when connection is restored.
 */

import { logLocationBatch } from 'src/api/presence';

export interface OfflineGeoRecord {
  id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  status?: string;
  source?: string;
  logged_at: string;
}

const DB_NAME = 'innoblitz_presence_db';
const DB_VERSION = 1;
const STORE_NAME = 'offline_geo_logs';

let _dbPromise: Promise<IDBDatabase> | null = null;
let _isFlushing = false;

function openGeoDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not supported in this environment'));
  }

  if (_dbPromise) return _dbPromise;

  _dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      _dbPromise = null;
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });

  return _dbPromise;
}

/**
 * Enqueue a location record into IndexedDB when offline.
 */
export async function enqueueOfflineLocation(
  data: Omit<OfflineGeoRecord, 'id' | 'logged_at'> & { logged_at?: string }
): Promise<string> {
  try {
    const db = await openGeoDB();
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const record: OfflineGeoRecord = {
      id,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      status: data.status,
      source: data.source || 'Auto Tracking',
      logged_at: data.logged_at || new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);

      req.onsuccess = () => {
        console.log(`[Offline Geo Queue] Enqueued offline location (${id}): lat=${data.latitude}, lng=${data.longitude}`);
        resolve(id);
      };

      req.onerror = () => reject(req.error || new Error('Failed to save to IndexedDB'));
    });
  } catch (err) {
    console.error('[Offline Geo Queue] Error enqueuing location:', err);
    throw err;
  }
}

/**
 * Get all pending offline locations.
 */
export async function getPendingOfflineLocations(): Promise<OfflineGeoRecord[]> {
  try {
    const db = await openGeoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error || new Error('Failed to read from IndexedDB'));
    });
  } catch (err) {
    console.warn('[Offline Geo Queue] Could not retrieve pending locations:', err);
    return [];
  }
}

/**
 * Remove synced records from IndexedDB.
 */
export async function removeOfflineLocations(ids: string[]): Promise<void> {
  if (!ids.length) return;
  try {
    const db = await openGeoDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      ids.forEach((id) => store.delete(id));

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Failed to delete synced records'));
    });
  } catch (err) {
    console.error('[Offline Geo Queue] Error removing synced records:', err);
  }
}

/**
 * Flush all pending offline records to the backend.
 */
export async function flushOfflineLocations(): Promise<number> {
  if (_isFlushing || typeof navigator === 'undefined' || !navigator.onLine) {
    return 0;
  }

  _isFlushing = true;
  try {
    const pending = await getPendingOfflineLocations();
    if (!pending.length) {
      _isFlushing = false;
      return 0;
    }

    console.log(`[Offline Geo Queue] Synchronizing ${pending.length} queued offline coordinates...`);

    const payload = pending.map((item) => ({
      latitude: item.latitude,
      longitude: item.longitude,
      accuracy: item.accuracy,
      status: item.status,
      source: item.source,
      logged_at: item.logged_at,
    }));

    const result = await logLocationBatch(payload);
    if (result?.status === 'success' || result?.status === 'ignored') {
      const ids = pending.map((p) => p.id);
      await removeOfflineLocations(ids);
      console.log(`[Offline Geo Queue] Successfully synced ${ids.length} coordinates.`);
      _isFlushing = false;
      return ids.length;
    }
  } catch (err) {
    console.warn('[Offline Geo Queue] Failed to sync offline coordinates, will retry later:', err);
  } finally {
    _isFlushing = false;
  }
  return 0;
}

// ── Automatic Online Listener ──
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Offline Geo Queue] Browser back online. Triggering sync...');
    flushOfflineLocations().catch(() => {});
  });
}
