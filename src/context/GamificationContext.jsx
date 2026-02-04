import React, { createContext, useState, useContext, useEffect } from 'react';

const GamificationContext = createContext();

export const useGameContext = () => useContext(GamificationContext);

export const GamificationProvider = ({ children, user, showToast }) => {
  // 1. HARDCODE THE API URL (To prevent any environment variable issues)
  const API_URL = 'https://habit-tracker-m9uw.onrender.com';

  const [userStats, setUserStats] = useState({
    xp: 0,
    level: 1,
    coins: 0,
    streak: 0,
    inventory: [], // Stores purchased themes
    activeTheme: 'light'
  });

  // 2. CRITICAL: Fetch Data Immediately on Load
  useEffect(() => {
    if (user?.uid) {
      fetchUserStats(user.uid);
    }
  }, [user]);

  const fetchUserStats = async (userId) => {
    try {
      console.log("Fetching stats for:", userId);
      const res = await fetch(`${API_URL}/stats/${userId}`);
      if (res.ok) {
        const data = await res.json();
        console.log("Stats loaded:", data);
        
        // Merge server data with defaults to prevent crashes
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
      console.error("Failed to load stats:", err);
    }
  };

  const processXpUpdate = async (amount, attribute) => {
    if (!user) return;
    
    // Optimistic UI Update (Update screen instantly)
    setUserStats(prev => {
        const newXp = Math.max(0, prev.xp + amount);
        const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
        return { ...prev, xp: newXp, level: newLevel };
    });

    // Send to Backend
    try {
      await fetch(`${API_URL}/stats/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, xpChange: amount })
      });
    } catch (err) {
      console.error("XP Sync Error:", err);
    }
  };

  const buyItem = async (item) => {
    if (userStats.coins < item.price) {
      showToast("Not enough coins!", "error");
      return false;
    }

    // Optimistic UI Update
    setUserStats(prev => ({
      ...prev,
      coins: prev.coins - item.price,
      inventory: [...prev.inventory, item]
    }));

    try {
      const res = await fetch(`${API_URL}/shop/buy/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, item })
      });
      
      if (!res.ok) {
        // If server fails, revert changes
        fetchUserStats(user.uid); 
        return false;
      }
      return true;
    } catch (err) {
      console.error("Buy Error:", err);
      return false;
    }
  };

  const equipItem = async (item) => {
    // Immediate UI update
    setUserStats(prev => ({ ...prev, activeTheme: item.id }));

    try {
      await fetch(`${API_URL}/shop/equip/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, item })
      });
    } catch (err) {
      console.error("Equip Error:", err);
    }
  };

  return (
    <GamificationContext.Provider value={{ userStats, processXpUpdate, buyItem, equipItem }}>
      {children}
    </GamificationContext.Provider>
  );
};