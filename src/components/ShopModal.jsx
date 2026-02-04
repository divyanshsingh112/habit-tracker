import React from 'react';
import { X, ShoppingBag, Lock, Check, FlaskConical } from 'lucide-react';

export default function ShopModal({ isOpen, onClose, userStats, onBuy, onEquip }) {
  if (!isOpen) return null;

  // SAFEGUARD: Ensure inventory is always an array to prevent White Screen
  const inventory = userStats?.inventory || [];
  const currentCoins = userStats?.coins || 0;
  const activeTheme = userStats?.activeTheme || 'light';

  const shopItems = [
    // THEMES
    { id: 'theme_dark', name: 'Midnight Mode', price: 100, type: 'theme', desc: 'Dark visuals for night owls.' },
    { id: 'theme_forest', name: 'Forest Cloak', price: 250, type: 'theme', desc: 'Peaceful green aesthetic.' },
    { id: 'theme_cyber', name: 'Cyberpunk', price: 500, type: 'theme', desc: 'Neon lights and glitch effects.' },
    
    // NEW: STREAK FREEZE POTION (Now appearing in shop!)
    { id: 'item_freeze', name: 'Streak Freeze', price: 300, type: 'consumable', desc: 'Protects your streak for 1 missed day.' }
  ];

  const handleBuy = async (item) => {
    if (confirm(`Buy ${item.name} for ${item.price} coins?`)) {
      await onBuy(item);
    }
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
            // FIX: Robust check for ownership. 
            // Checks if ID exists in inventory (handles both string IDs and object IDs)
            const isOwned = inventory.some(i => (typeof i === 'string' ? i === item.id : i.id === item.id));
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
                    disabled={currentCoins < item.price}
                    onClick={() => handleBuy(item)}
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