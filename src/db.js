// src/db.js
import { openDB } from 'idb';

const DB_NAME = 'habit-tracker-db';
const STORE_DATA = 'months';       // Stores actual habit data for instant load
const STORE_QUEUE = 'sync_queue';  // Stores actions waiting to be sent to server

// Initialize Database
export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      // Store 1: The Cache (Fast Read)
      if (!db.objectStoreNames.contains(STORE_DATA)) {
        db.createObjectStore(STORE_DATA, { keyPath: 'id' }); // id: "userId-2025-January"
      }
      // Store 2: The Outbox (Sync Queue)
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
      }
    },
  });
};

// --- READ OPERATIONS ---

export const getAllLocalData = async () => {
  const db = await initDB();
  return db.getAll(STORE_DATA);
};

// --- WRITE OPERATIONS ---

export const saveMonthLocally = async (userId, year, month, habits) => {
  const db = await initDB();
  const id = `${userId}-${year}-${month}`;
  
  // 1. Prepare the data object
  const data = { id, userId, year, month, habits, updatedAt: Date.now() };

  // 2. Start a transaction (write to both stores safely)
  const tx = db.transaction([STORE_DATA, STORE_QUEUE], 'readwrite');
  
  // Update the Local Cache (So the UI updates instantly)
  await tx.objectStore(STORE_DATA).put(data);
  
  // Add to Sync Queue (So we know to send this to server later)
  await tx.objectStore(STORE_QUEUE).put({ ...data, status: 'pending' });
  
  await tx.done;
  return data;
};

// --- SYNC HELPERS ---

export const getPendingSyncs = async () => {
  const db = await initDB();
  return db.getAll(STORE_QUEUE);
};

export const clearPendingSync = async (id) => {
  const db = await initDB();
  return db.delete(STORE_QUEUE, id);
};