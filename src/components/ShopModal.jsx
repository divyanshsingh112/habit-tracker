import React from 'react';
import { X, Palette, Zap, Check, Lock } from 'lucide-react';

const SHOP_ITEMS = [
  { id: 'theme_midnight', type: 'theme', name: 'Midnight Mode', price: 0, desc: 'The classic focus mode.', color: '#0f172a' },
  { id: 'theme_forest', type: 'theme', name: 'Forest Cloak', price: 500, desc: 'Deep greens and nature sounds.', color: '#052e16' },
  { id: 'theme_cyber', type: 'theme', name: 'Cyberpunk', price: 1000, desc: 'Neon lights and high contrast.', color: '#d946ef' },
  { id: 'item_freeze', type: 'consumable', name: 'Streak Freeze', price: 200, desc: 'Protect your streak for one day.', color: '#3b82f6' },
];

export default function ShopModal({ user, activeTheme, onClose, onBuy, onEquip }) {
  
  const handleAction = (item) => {
    const isOwned = user.inventory.includes(item.id);
    
    if (item.type === 'theme') {
      if (isOwned) {
        onEquip(item.id.replace('theme_', ''));
      } else {
        onBuy(item);
      }
    } else {
      // Logic for consumables (buy only)
      onBuy(item);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-enter">
      <div className="glass-panel w-full max-w-4xl h-[80vh] rounded-3xl flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShoppingBagIcon /> Hero's Market
            </h2>
            <p className="text-slate-400">Spend your hard-earned gold on upgrades.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/20 border border-yellow-500/50 px-4 py-2 rounded-full flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_orange]" />
              <span className="font-bold text-yellow-100">{user.coins} Gold</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition"><X size={24} text-slate-400 /></button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOP_ITEMS.map(item => {
            const isOwned = user.inventory.includes(item.id);
            const isActive = activeTheme === item.id.replace('theme_', '');
            const canAfford = user.coins >= item.price;

            return (
              <div key={item.id} className="glass-panel p-1 rounded-2xl group hover:scale-[1.02] transition-transform duration-300">
                <div className="bg-slate-900/50 rounded-xl p-6 h-full flex flex-col relative overflow-hidden">
                  
                  {/* Decorative Banner */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1" 
                    style={{ backgroundColor: item.color }} 
                  />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: isOwned ? `${item.color}20` : '#1e293b' }}
                    >
                      {item.type === 'theme' ? <Palette size={20} style={{ color: item.color }} /> : <Zap size={20} className="text-yellow-400" />}
                    </div>
                    {isActive && <div className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full border border-green-500/30">EQUIPPED</div>}
                  </div>

                  <h3 className="font-bold text-lg text-white mb-1">{item.name}</h3>
                  <p className="text-sm text-slate-400 mb-6 flex-1">{item.desc}</p>

                  <button
                    onClick={() => handleAction(item)}
                    disabled={!isOwned && !canAfford}
                    className={`
                      w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all
                      ${isActive 
                        ? 'bg-slate-700 text-slate-400 cursor-default' 
                        : isOwned 
                          ? 'bg-white/10 hover:bg-white/20 text-white' 
                          : canAfford 
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                    `}
                  >
                    {isActive ? (
                      <>Active</>
                    ) : isOwned ? (
                      'Equip'
                    ) : (
                      <>{item.price} Gold</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const ShoppingBagIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);