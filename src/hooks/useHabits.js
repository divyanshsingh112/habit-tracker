import { useState, useCallback } from 'react';
import { getAllLocalData, getPendingSyncs } from '../db';

export const useHabits = (user, API_URL) => {
  const [store, setStore] = useState({});
  const [globalStreak, setGlobalStreak] = useState(0);

  // Helper: Convert array to object map
  const rehydrateStore = useCallback((dataArray) => {
    const newStore = {};
    dataArray.forEach(doc => {
      if (!newStore[doc.year]) newStore[doc.year] = {};
      newStore[doc.year][doc.month] = doc.habits;
    });
    setStore(prev => ({ ...prev, ...newStore }));
  }, []);

  // Sync Logic
  const fetchAndSync = useCallback(async (userId, setUserStats) => {
    try {
      // 1. Fetch Habits
      const res = await fetch(`${API_URL}/all-data/${userId}`);
      const serverData = await res.json();
      
      const pendingItems = await getPendingSyncs();
      const pendingKeys = new Set(pendingItems.map(item => `${item.year}-${item.month}`));

      // Only overwrite if not pending locally
      const validServerData = serverData.filter(doc => {
        const key = `${doc.year}-${doc.month}`;
        return !pendingKeys.has(key); 
      });

      rehydrateStore(validServerData);

      // 2. Fetch Streak
      fetch(`${API_URL}/streak/${userId}`)
        .then(r => r.json())
        .then(d => setGlobalStreak(d.streak || 0));

      // 3. Fetch Stats (Updates the Gamification Hook)
      if(setUserStats) {
        fetch(`${API_URL}/stats/${userId}`)
          .then(r => r.json())
          .then(stats => setUserStats(stats));
      }

    } catch (err) {
      console.log("Offline or Server Error: Keeping local data");
    }
  }, [API_URL, rehydrateStore]);

  // Initial Load from IndexedDB
  const loadLocalData = useCallback(async () => {
    const localData = await getAllLocalData();
    if (localData && localData.length > 0) {
      rehydrateStore(localData);
    }
    return localData; // Return for checking
  }, [rehydrateStore]);

  return { 
    store, 
    setStore, 
    globalStreak, 
    setGlobalStreak,
    fetchAndSync,
    loadLocalData 
  };
};