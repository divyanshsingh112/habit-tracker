import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

export const useGamification = (user, showToast, API_URL) => {
  const [userStats, setUserStats] = useState({ 
    xp: 0, level: 1, coins: 0, 
    stats: { str: 0, int: 0, wis: 0, cha: 0 },
    inventory: { themes: ['light'], activeTheme: 'light', streakFreezes: 0 }
  });
  
  const processXpUpdate = useCallback((diff, habitAttribute) => {
    if (diff === 0) return;

    const xpChange = diff * 10;
    const coinChange = diff * 5; 

    if (diff > 0) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#4caf50', '#ff9800', '#2196f3'], zIndex: 9999 });
    }

    setUserStats(prev => {
      let newXp = prev.xp + xpChange;
      let newLevel = prev.level;
      let newCoins = Math.max(0, (prev.coins || 0) + coinChange);
      const newStats = { ...prev.stats };
      if (habitAttribute) {
           const key = habitAttribute.toLowerCase();
           const statChange = diff; 
           newStats[key] = Math.max(0, (newStats[key] || 0) + statChange);
      }

      while (newXp >= newLevel * 100) { newXp -= newLevel * 100; newLevel++; showToast(`Level Up! Level ${newLevel}`, 'success'); }
      while (newXp < 0) { if (newLevel > 1) { newLevel--; newXp += newLevel * 100; } else { newXp = 0; break; } }
      
      return { ...prev, xp: newXp, level: newLevel, coins: newCoins, stats: newStats };
    });

    if (user) {
      // UPDATED: Sync display name
      const safeName = user.displayName || user.email.split('@')[0];
      fetch(`${API_URL}/stats/${user.uid}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          xpEarned: xpChange, 
          attribute: habitAttribute,
          displayName: safeName // <-- SENDING NAME NOW
        }) 
      }).catch(e => console.log("XP Sync skipped"));
    }
  }, [user, showToast, API_URL]);

  const buyItem = async (item) => {
    if (userStats.coins < item.price) { showToast("Not enough coins!", "error"); return false; }
    setUserStats(prev => {
      const newInventory = { ...prev.inventory };
      if (item.type === 'theme') newInventory.themes.push(item.id);
      if (item.type === 'consumable') newInventory.streakFreezes += 1;
      return { ...prev, coins: prev.coins - item.price, inventory: newInventory };
    });
    try {
      await fetch(`${API_URL}/shop/buy/${user.uid}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, price: item.price, type: item.type })
      });
      showToast(`Bought ${item.name}!`, 'success');
      return true;
    } catch (e) { showToast("Transaction Failed", "error"); return false; }
  };

  const equipItem = async (item) => {
    setUserStats(prev => ({ ...prev, inventory: { ...prev.inventory, activeTheme: item.id } }));
    try {
      await fetch(`${API_URL}/shop/equip/${user.uid}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, type: item.type })
      });
    } catch (e) { console.log("Equip failed"); }
  };

  return { userStats, setUserStats, processXpUpdate, buyItem, equipItem };
};