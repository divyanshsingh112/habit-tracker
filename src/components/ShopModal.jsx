import React, { useState } from 'react';
import { X, ShoppingBag, Lock, Check } from 'lucide-react';

export default function ShopModal({ isOpen, onClose, userStats, onBuy, onEquip }) {
  const [processing, setProcessing] = useState(false); // Prevents double-clicks

  if (!isOpen) return null;

  // Read inventory safely
  const inventory = userStats?.heroInventory || [];
  const currentCoins = userStats?.coins || 0;
  const activeTheme = userStats?.activeTheme || 'light';

  const shopItems = [
    // ✅ FIX: IDs must match your CSS (removed 'theme_' prefix)
    { id: 'dark', name: 'Midnight Mode', price: 100, type: 'theme', desc: 'Dark visuals.' },
    { id: 'forest', name: 'Forest Cloak', price: 250, type: 'theme', desc: 'Peaceful green.' },
    { id: 'cyber', name: 'Cyberpunk', price: 500, type: 'theme', desc: 'Neon lights.' },
    { id: 'freeze', name: 'Streak Freeze', price: 300, type: 'consumable', desc: 'Save your streak.' }
  ];

  const handleBuy = async (item) => {
    if (processing) return; // Stop spam clicking
    setProcessing(true);
    
    // UI Safeguard for Negative Coins
    if (currentCoins < item.price) {
        alert("Not enough coins!");
        setProcessing(false);
        return;
    }

    if (confirm(`Buy ${item.name} for ${item.price} coins?`)) {
      await onBuy(item);
    }
    setProcessing(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-scale-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><ShoppingBag size={24} /> Hero's Market</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="shop-balance">
          💰 Balance: <span>{currentCoins} Coins</span>
        </div>

        <div className="shop-grid">
          {shopItems.map(item => {
            // Check ownership
            const isOwned = inventory.some(i => i.itemId === item.id);
            const isEquipped = activeTheme === item.id;
            const isConsumable = item.type === 'consumable';

            return (
              <div key={item.id} className={`shop-card ${isOwned && !isConsumable ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}`}>
                <div className="shop-info">
                  <h4>{item.name}</h4>
                  <p>{item.desc}</p>
                </div>

                {isEquipped ? (
                  <button className="action-btn active" disabled><Check size={16} /> Active</button>
                ) : isOwned && !isConsumable ? (
                  <button className="action-btn" onClick={() => onEquip(item)}>Equip</button>
                ) : (
                  <button 
                    className="buy-btn" 
                    disabled={currentCoins < item.price || processing} // Disable if poor or processing
                    onClick={() => handleBuy(item)}
                    style={{ opacity: processing ? 0.5 : 1 }}
                  >
                    {currentCoins < item.price && <Lock size={12} />}
                    {item.price} 💰
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}