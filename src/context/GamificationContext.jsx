import React, { createContext, useState, useContext, useEffect } from 'react';

const GamificationContext = createContext();

export const useGameContext = () => useContext(GamificationContext);

export const GamificationProvider = ({ children, user, showToast }) => {
  // HARDCODED API URL to prevent environment variable issues
  const API_URL = 'https://habit-tracker-m9uw.onrender.com';

  const [userStats, setUserStats] = useState({
    xp: 0,
    level: 1,
    coins: 0,
    streak: 0,
    inventory: [], 
    activeTheme: 'light'
  });

  // 1. Fetch Data Immediately on Load
  useEffect(() => {
    if (user?.uid) {
      fetchUserStats(user.uid);
    }
  }, [user]);

  const fetchUserStats = async (userId) => {
    try {
      console.log("[Stats] Fetching from server...");
      const res = await fetch(`${API_URL}/stats/${userId}`);
      if (res.ok) {
        const data = await res.json();
        console.log("[Stats] Loaded:", data);
        setUserStats(prev => ({
          ...prev,
          xp: data.xp || 0,
          level: data.level || 1,
          coins: data.coins || 0,
          streak: data.streak || 0,
          inventory: data.inventory || [],
          activeTheme: data.activeTheme || 'light'
        }));
      }
    } catch (err) {
      console.error("[Stats] Failed to load:", err);
    }
  };

  // 2. ROBUST SYNC: Handles XP and Coins safely
  const processXpUpdate = async (xpAmount, coinsAmount) => {
    if (!user) return;
    
    console.log(`[Sync] Updating: +${xpAmount} XP, +${coinsAmount} Coins`);

    // A. Optimistic UI Update (Update screen instantly)
    setUserStats(prev => {
        const currentXp = prev.xp || 0;
        const currentCoins = prev.coins || 0;

        const newXp = Math.max(0, currentXp + xpAmount);
        const newCoins = Math.max(0, currentCoins + coinsAmount);
        const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
        
        return { ...prev, xp: newXp, coins: newCoins, level: newLevel };
    });

    // B. Send to Backend
    try {
      const res = await fetch(`${API_URL}/stats/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            userId: user.uid, 
            xpChange: xpAmount, 
            coinsChange: coinsAmount 
        })
      });

      if (!res.ok) {
        console.error("[Sync] Server rejected update. Reverting...");
        // Only fetch if sync fails to avoid overwriting optimistic data
        fetchUserStats(user.uid);
      }
    } catch (err) {
      console.error("[Sync] Network Error:", err);
    }
  };

  const buyItem = async (item) => {
    // 1. Check client-side balance first
    if ((userStats.coins || 0) < item.price) {
      showToast("Not enough coins!", "error");
      return false;
    }

    console.log(`[Shop] Buying ${item.name} for ${item.price}`);

    // 2. Optimistic Update (Add item, remove coins)
    setUserStats(prev => ({
      ...prev,
      coins: Math.max(0, prev.coins - item.price),
      inventory: [...(prev.inventory || []), item]
    }));

    try {
      const res = await fetch(`${API_URL}/shop/buy/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, item })
      });
      
      if (!res.ok) {
        console.error("[Shop] Purchase failed on server.");
        const errData = await res.json();
        showToast(errData.error || "Purchase failed", "error");
        
        // Revert changes if server says no
        fetchUserStats(user.uid); 
        return false;
      }
      
      showToast(`${item.name} Purchased!`, "success");
      return true;
    } catch (err) {
      console.error("[Shop] Error:", err);
      fetchUserStats(user.uid); // Revert
      return false;
    }
  };

  const equipItem = async (item) => {
    setUserStats(prev => ({ ...prev, activeTheme: item.id }));

    try {
      await fetch(`${API_URL}/shop/equip/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, item })
      });
    } catch (err) {
      console.error("[Shop] Equip Error:", err);
    }
  };

  return (
    <GamificationContext.Provider value={{ userStats, processXpUpdate, buyItem, equipItem }}>
      {children}
    </GamificationContext.Provider>
  );
};