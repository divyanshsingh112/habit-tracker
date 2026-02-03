// src/syncManager.js
import { getPendingSyncs, clearPendingSync } from './db';

const API_URL = 'https://habit-tracker-m9uw.onrender.com';

export const syncData = async () => {
  if (!navigator.onLine) return; // Stop if offline

  const pendingItems = await getPendingSyncs();
  
  if (pendingItems.length === 0) return; 

  console.log(`[Sync] Found ${pendingItems.length} changes to upload...`);

  for (const item of pendingItems) {
    try {
      // Use your existing Server Route
      const response = await fetch(`${API_URL}/habits/${item.userId}/${item.year}/${item.month}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habits: item.habits })
      });

      if (response.ok) {
        // If server confirms save, remove from local queue
        await clearPendingSync(item.id);
        console.log(`[Sync] Uploaded: ${item.month} ${item.year}`);
      }
    } catch (error) {
      console.error(`[Sync] Failed to upload ${item.id} - will retry later`);
    }
  }
};