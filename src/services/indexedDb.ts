import { Track, Playlist, UserSettings } from '../types/music';

const DB_NAME = 'AuraMusicDB';
const DB_VERSION = 1;

export interface StoredLocalTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  artworkDataUrl?: string;
  addedAt: number;
  format?: string;
  size?: number;
  blob?: Blob; // optional persistent storage for offline local playback
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('tracks')) {
        db.createObjectStore('tracks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('playlists')) {
        db.createObjectStore('playlists', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('liked')) {
        db.createObjectStore('liked', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('history')) {
        const historyStore = db.createObjectStore('history', { keyPath: 'id' });
        historyStore.createIndex('playedAt', 'playedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('search_history')) {
        db.createObjectStore('search_history', { keyPath: 'query' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalTrackToDB(track: StoredLocalTrack): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tracks', 'readwrite');
      const store = tx.objectStore('tracks');
      store.put(track);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save track to IndexedDB:', err);
  }
}

export async function getAllLocalTracksFromDB(): Promise<StoredLocalTrack[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tracks', 'readonly');
      const store = tx.objectStore('tracks');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to get tracks from IndexedDB:', err);
    return [];
  }
}

export async function deleteLocalTrackFromDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tracks', 'readwrite');
      const store = tx.objectStore('tracks');
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to delete track from IndexedDB:', err);
  }
}

export async function getPlaylistsFromDB(): Promise<Playlist[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('playlists', 'readonly');
      const store = tx.objectStore('playlists');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to get playlists from IndexedDB:', err);
    return [];
  }
}

export async function savePlaylistToDB(playlist: Playlist): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('playlists', 'readwrite');
      const store = tx.objectStore('playlists');
      store.put(playlist);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save playlist to IndexedDB:', err);
  }
}

export async function deletePlaylistFromDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('playlists', 'readwrite');
      const store = tx.objectStore('playlists');
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to delete playlist from IndexedDB:', err);
  }
}

export async function getLikedTrackIdsFromDB(): Promise<string[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('liked', 'readonly');
      const store = tx.objectStore('liked');
      const request = store.getAll();
      request.onsuccess = () => {
        const items = request.result || [];
        resolve(items.map((i: any) => i.id));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to get liked tracks:', err);
    return [];
  }
}

export async function setLikedTrackInDB(track: Track, isLiked: boolean): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('liked', 'readwrite');
      const store = tx.objectStore('liked');
      if (isLiked) {
        store.put({ id: track.id, track, likedAt: Date.now() });
      } else {
        store.delete(track.id);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to update liked track in IndexedDB:', err);
  }
}

export async function saveLikedTrackToDB(track: Track): Promise<void> {
  return setLikedTrackInDB(track, true);
}

export async function getLikedTracksFromDB(): Promise<Track[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('liked', 'readonly');
      const store = tx.objectStore('liked');
      const request = store.getAll();
      request.onsuccess = () => {
        const items = request.result || [];
        resolve(items.map((i: any) => i.track).filter(Boolean));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to get liked tracks:', err);
    return [];
  }
}

export async function addHistoryTrackToDB(track: Track): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('history', 'readwrite');
      const store = tx.objectStore('history');
      store.put({ id: track.id, track, playedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to add to history in IndexedDB:', err);
  }
}

export async function getHistoryTracksFromDB(limit = 30): Promise<Track[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('history', 'readonly');
      const store = tx.objectStore('history');
      const request = store.getAll();
      request.onsuccess = () => {
        const items = (request.result || [])
          .sort((a: any, b: any) => (b.playedAt || 0) - (a.playedAt || 0))
          .slice(0, limit);
        resolve(items.map((i: any) => i.track).filter(Boolean));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to get history from IndexedDB:', err);
    return [];
  }
}

export async function getSettingsFromDB(): Promise<Partial<UserSettings>> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const request = store.get('app_settings');
      request.onsuccess = () => resolve(request.result?.value || {});
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to load settings from IndexedDB:', err);
    return {};
  }
}

export async function saveSettingsToDB(settings: UserSettings): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      store.put({ key: 'app_settings', value: settings });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save settings to IndexedDB:', err);
  }
}

export async function getStorageEstimate(): Promise<{ usageMB: number; quotaMB: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      return {
        usageMB: Math.round((usage / (1024 * 1024)) * 10) / 10,
        quotaMB: Math.round((quota / (1024 * 1024)) * 10) / 10
      };
    } catch (e) {
      console.warn('Storage estimate failed:', e);
    }
  }
  return { usageMB: 0, quotaMB: 0 };
}

export async function clearAppCache(): Promise<void> {
  if ('caches' in window) {
    const keys = await caches.keys();
    for (const key of keys) {
      await caches.delete(key);
    }
  }
}

// Aliases and additional database helpers for Track, Playlist, and Search
export async function saveTrackToDB(track: Track): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tracks', 'readwrite');
      const store = tx.objectStore('tracks');
      store.put(track);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save track in IndexedDB:', err);
  }
}

export async function getAllTracksFromDB(): Promise<Track[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tracks', 'readonly');
      const store = tx.objectStore('tracks');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to get all tracks from IndexedDB:', err);
    return [];
  }
}

export async function clearAllTracksInDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tracks', 'readwrite');
      const store = tx.objectStore('tracks');
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to clear tracks from IndexedDB:', err);
  }
}

export const getAllPlaylistsFromDB = getPlaylistsFromDB;

export async function addLikedTrackToDB(track: Track): Promise<void> {
  return setLikedTrackInDB(track, true);
}

export async function removeLikedTrackFromDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('liked', 'readwrite');
      const store = tx.objectStore('liked');
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to delete liked track from IndexedDB:', err);
  }
}

export async function getSearchHistoryFromDB(): Promise<string[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('search_history', 'readonly');
      const store = tx.objectStore('search_history');
      const request = store.getAll();
      request.onsuccess = () => {
        const items = (request.result || [])
          .sort((a: any, b: any) => (b.searchedAt || 0) - (a.searchedAt || 0))
          .slice(0, 10);
        resolve(items.map((i: any) => i.query));
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function addSearchHistoryToDB(query: string): Promise<void> {
  if (!query.trim()) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('search_history', 'readwrite');
      const store = tx.objectStore('search_history');
      store.put({ query: query.trim(), searchedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to add search history:', err);
  }
}

export async function clearSearchHistoryInDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('search_history', 'readwrite');
      const store = tx.objectStore('search_history');
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to clear search history:', err);
  }
}
