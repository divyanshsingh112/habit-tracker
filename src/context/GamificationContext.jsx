import React, { createContext, useState, useContext, useEffect } from 'react';

const GamificationContext = createContext();

export const useGameContext = () => useContext(GamificationContext);

export const GamificationProvider = ({ children, user, showToast }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'https://habit-tracker-m9uw.onrender.com';

  const [userStats, setUserStats] = useState({
    xp: 0,
    level: 1,
    coins: 0,
    heroInventory: [], // 🔥 NEW STATE NAME
    activeTheme: 'light'
  });

  useEffect(() => {
    if (user?.uid) fetchUserStats(user.uid);
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
          heroInventory: data.heroInventory || [], // 🔥 READ NEW FIELD
          activeTheme: data.activeTheme || 'light'
        }));
      }
    } catch (err) {
      console.error("Stats Load Error:", err);
    }
  };

  const processXpUpdate = async (xpAmount, coinsAmount) => {
    if (!user) return;
    
    setUserStats(prev => ({
        ...prev, 
        xp: (prev.xp || 0) + xpAmount, 
        coins: (prev.coins || 0) + coinsAmount,
        level: Math.floor(Math.sqrt(((prev.xp || 0) + xpAmount) / 100)) + 1
    }));

    try {
      await fetch(`${API_URL}/stats/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, xpChange: xpAmount, coinsChange: coinsAmount })
      });
    } catch (err) { console.error("Sync Error:", err); }
  };

  const buyItem = async (item) => {
    if (userStats.coins < item.price) {
      showToast("Not enough coins!", "error");
      return false;
    }

    // Optimistic Update
    setUserStats(prev => ({
      ...prev,
      coins: prev.coins - item.price,
      // 🔥 UPDATED: Use new name
      heroInventory: [...prev.heroInventory, { itemId: item.id, ...item }]
    }));

    try {
      const res = await fetch(`${API_URL}/shop/buy/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, item })
      });
      
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || "Purchase failed", "error");
        fetchUserStats(user.uid); 
        return false;
      }
      return true;
    } catch (err) {
      fetchUserStats(user.uid);
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
    } catch (err) { console.error(err); }
  };

  return (
    <GamificationContext.Provider value={{ userStats, processXpUpdate, buyItem, equipItem }}>
      {children}
    </GamificationContext.Provider>
  );
};