import React from 'react';
import { X, Coins, Check } from 'lucide-react';
import { SHOP_ITEMS } from '../data/shopItems';

export default function ShopModal({ isOpen, onClose, userStats, onBuy, onEquip }) {
  if (!isOpen) return null;

  const inventory = userStats.inventory || { themes: ['light'], streakFreezes: 0, activeTheme: 'light' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3>Item Shop</h3>
            <div className="streak-pill" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' }}>
              <Coins size={14} fill="#f59e0b" stroke="#b45309" />
              <span>{userStats.coins}</span>
            </div>
          </div>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>

        {/* Shop Grid */}
        <div className="shop-grid">
          {SHOP_ITEMS.map(item => {
            const isOwned = item.type === 'theme' && inventory.themes.includes(item.id);
            const isEquipped = item.type === 'theme' && inventory.activeTheme === item.id;
            const canAfford = userStats.coins >= item.price;

            return (
              <div key={item.id} className={`shop-card ${isEquipped ? 'equipped' : ''}`}>
                <div className="shop-icon">{item.icon}</div>
                <div className="shop-info">
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                </div>
                
                <div className="shop-action">
                  {isOwned ? (
                    <button 
                      className={`action-btn ${isEquipped ? 'active' : ''}`}
                      onClick={() => !isEquipped && onEquip(item)}
                      disabled={isEquipped}
                    >
                      {isEquipped ? 'Active' : 'Equip'}
                    </button>
                  ) : (
                    <button 
                      className={`buy-btn ${!canAfford ? 'disabled' : ''}`}
                      onClick={() => canAfford && onBuy(item)}
                      disabled={!canAfford}
                    >
                      <Coins size={12} /> {item.price}
                    </button>
                  )}
                  
                  {item.type === 'consumable' && (
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', textAlign: 'center' }}>
                      Owned: {inventory.streakFreezes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}