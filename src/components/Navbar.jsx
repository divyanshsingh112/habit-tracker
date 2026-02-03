import React, { useState } from 'react';
import { LayoutDashboard, LogOut, Flame, Zap, ChevronRight, Coins, Menu, X, Activity, Trophy, Users } from 'lucide-react';

export default function Navbar({ 
  user, userStats, globalStreak, view, setView, onLogout, onOpenStats, onOpenShop
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const xpPercentage = Math.min((userStats.xp / (userStats.level * 100)) * 100, 100);
  
  // Helper to close menu after clicking an item
  const handleNav = (screenName) => { 
    setView({ screen: screenName, year: null, month: null });
    setIsMobileMenuOpen(false); 
  };

  const handleAction = (action) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="slim-navbar">
      <div className="nav-inner">
        <div className="nav-left">
          <div className="brand-section">
            <LayoutDashboard className="app-logo-icon" size={24} />
            <h1>Habit Tracker</h1>
          </div>

          {/* DESKTOP NAV LINKS (Hidden on Mobile) */}
          <div className="nav-links-group desktop-only">
            <button 
              className={`crumb-btn ${view.screen === 'analytics' ? 'crumb-active' : ''}`}
              onClick={() => setView({ screen: 'analytics', year: null, month: null })}
            >
              <Activity size={16} /> <span>Stats</span>
            </button>

            <button 
              className={`crumb-btn ${view.screen === 'leaderboard' ? 'crumb-active' : ''}`}
              onClick={() => setView({ screen: 'leaderboard', year: null, month: null })}
            >
              <Trophy size={16} /> <span>Ranks</span>
            </button>

            <button 
              className={`crumb-btn ${view.screen === 'guild' ? 'crumb-active' : ''}`}
              onClick={() => setView({ screen: 'guild', year: null, month: null })}
            >
              <Users size={16} /> <span>Team</span>
            </button>
          </div>

          {/* BREADCRUMBS */}
          <nav className="inline-breadcrumbs">
            {/* Divider logic: Hide if we are on a main page to avoid double bars */}
            {(view.screen === 'years' || view.screen === 'analytics' || view.screen === 'leaderboard' || view.screen === 'guild') ? null : (
               <span className="crumb-separator desktop-only">|</span> 
            )}
            
            <button 
              className={`crumb-btn ${view.screen === 'years' ? 'crumb-active' : ''}`} 
              onClick={() => setView({ screen: 'years', year: null, month: null })}
            >
              Years
            </button>
            
            {view.year && (
              <>
                <ChevronRight size={14} className="crumb-separator" />
                <button 
                  className={`crumb-btn ${view.screen === 'months' ? 'crumb-active' : ''}`} 
                  onClick={() => setView({ ...view, screen: 'months', month: null })}
                >
                  {view.year}
                </button>
              </>
            )}
            
            {view.month && (
              <>
                <ChevronRight size={14} className="crumb-separator" />
                <span className="crumb-btn crumb-active">{view.month}</span>
              </>
            )}
          </nav>
        </div>

        {/* DESKTOP RIGHT SIDE (Stats & Logout) */}
        <div className="nav-right desktop-only">
          <div 
            className="streak-pill" 
            style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d', marginRight: '4px', cursor: 'pointer' }}
            onClick={onOpenShop} 
          >
            <Coins size={14} fill="#f59e0b" stroke="#b45309" />
            <span>{userStats.coins || 0}</span>
          </div>
          <div 
            className="streak-pill" 
            style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', marginRight: '8px', cursor: 'pointer' }}
            onClick={onOpenStats}
          >
            <Zap size={14} fill="#0284c7" stroke="#0284c7" />
            <span>LVL {userStats.level}</span>
          </div>
          {globalStreak > 0 && (
            <div className="streak-pill">
              <Flame size={14} fill="#ea580c" stroke="#ea580c" />
              <span>{globalStreak} DAYS</span>
            </div>
          )}
          <div className="user-welcome"><span>{user.displayName || user.email.split('@')[0]}</span></div>
          <button onClick={onLogout} className="logout-link"><LogOut size={16} /> Logout</button>
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-dropdown animate-slide-down">
          
          {/* 1. Navigation Links (Moved from top bar) */}
          <div className="mobile-nav-section">
            <button className="mobile-nav-item" onClick={() => handleNav('analytics')}>
              <Activity size={18} /> Stats
            </button>
            <button className="mobile-nav-item" onClick={() => handleNav('leaderboard')}>
              <Trophy size={18} /> Ranks / Leaderboard
            </button>
            <button className="mobile-nav-item" onClick={() => handleNav('guild')}>
              <Users size={18} /> Team / Guild
            </button>
          </div>

          <hr className="mobile-divider" />

          {/* 2. User Stats Row */}
          <div className="mobile-stats-row">
            <div 
              className="streak-pill" 
              style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' }}
              onClick={() => handleAction(onOpenShop)} 
            >
              <Coins size={14} fill="#f59e0b" stroke="#b45309" />
              <span>{userStats.coins || 0} Coins</span>
            </div>
            <div 
              className="streak-pill" 
              style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' }}
              onClick={() => handleAction(onOpenStats)}
            >
              <Zap size={14} fill="#0284c7" stroke="#0284c7" />
              <span>Lvl {userStats.level}</span>
            </div>
            {globalStreak > 0 && (
              <div className="streak-pill">
                <Flame size={14} fill="#ea580c" stroke="#ea580c" />
                <span>{globalStreak}d Streak</span>
              </div>
            )}
          </div>
          
          <hr className="mobile-divider" />
          
          {/* 3. User Info & Logout */}
          <div className="mobile-user-info">
             <span style={{ fontSize: '12px' }}>{user.email}</span>
             <button onClick={onLogout} className="mobile-logout"><LogOut size={14} /> Logout</button>
          </div>
        </div>
      )}

      {/* XP BAR AT BOTTOM */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: '#f1f5f9' }}>
         <div style={{ width: `${xpPercentage}%`, height: '100%', background: '#4caf50', transition: 'width 0.5s ease' }}></div>
      </div>
    </header>
  );
}