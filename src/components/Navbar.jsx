import React from 'react';
import { LayoutDashboard, ShoppingBag, Zap, Shield, Menu } from 'lucide-react';

export default function Navbar({ user, setView, onOpenShop }) {
  const xpPercent = Math.min((user.xp / user.maxXp) * 100, 100);

  return (
    <nav className="glass-panel h-16 px-6 flex items-center justify-between sticky top-0 z-50">
      {/* BRAND */}
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setView({ screen: 'dashboard' })}
      >
        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
          <Shield size={18} className="text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">Habit<span className="text-indigo-400">Architect</span></span>
      </div>

      {/* STATS HUD */}
      <div className="flex items-center gap-6">
        
        {/* XP BAR */}
        <div className="hidden md:flex flex-col w-48 gap-1">
          <div className="flex justify-between text-xs font-bold text-indigo-200">
            <span>LVL {user.level}</span>
            <span>{Math.floor(user.xp)} / {Math.floor(user.maxXp)} XP</span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* COINS */}
        <div 
          className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-yellow-500/30 cursor-pointer hover:bg-slate-800 transition"
          onClick={onOpenShop}
        >
          <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
          <span className="font-bold text-yellow-100 text-sm">{user.coins}</span>
        </div>

        {/* SHOP BTN */}
        <button 
          onClick={onOpenShop}
          className="p-2 rounded-lg hover:bg-white/10 transition text-indigo-300 hover:text-white"
        >
          <ShoppingBag size={20} />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 border border-white/20 flex items-center justify-center font-bold text-xs">
          DS
        </div>
      </div>
    </nav>
  );
}