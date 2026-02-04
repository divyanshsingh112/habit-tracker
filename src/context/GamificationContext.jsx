import React, { createContext, useState, useContext, useEffect } from 'react';

const GamificationContext = createContext();

export const useGameContext = () => useContext(GamificationContext);

export const GamificationProvider = ({ children, user, showToast }) => {
  const API_URL = 'https://habit-tracker-m9uw.onrender.com';

  const [userStats, setUserStats] = useState({
    xp: 0,
    level: 1,
    coins: 0,
    streak: 0,
    inventory: [], 
    activeTheme: 'light'
  });

  // Fetch Data Immediately on Load
  useEffect(() => {
    if (user?.uid) {
      fetchUserStats(user.uid);
    }
  }, [user]);

  const fetchUserStats = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/stats/${userId}`);
      if (res.ok) {
        const data = await res.json();
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

  // ✅ UPDATED: Now accepts XP AND Coins
  const processXpUpdate = async (xpAmount, coinsAmount) => {
    if (!user) return;
    
    // Optimistic UI Update (Update screen instantly)
    setUserStats(prev => {
        const newXp = Math.max(0, prev.xp + xpAmount);
        const newCoins = Math.max(0, (prev.coins || 0) + coinsAmount); // Handle Coins
        const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
        
        return { ...prev, xp: newXp, coins: newCoins, level: newLevel };
    });

    // Send both to Backend
    try {
      await fetch(`${API_URL}/stats/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            userId: user.uid, 
            xpChange: xpAmount, 
            coinsChange: coinsAmount // <--- SENDING COINS NOW
        })
      });
    } catch (err) {
      console.error("Sync Error:", err);
    }
  };

  const buyItem = async (item) => {
    if (userStats.coins < item.price) {
      showToast("Not enough coins!", "error");
      return false;
    }

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