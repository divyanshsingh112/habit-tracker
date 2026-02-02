import React, { useState, useEffect, Suspense, lazy } from 'react'; 
import { ChevronRight, LayoutDashboard, LogOut, Flame, X, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { auth, logout } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import confetti from 'canvas-confetti'; // <--- NEW IMPORT
import Login from './components/Login';
import YearView from './components/YearView';
import MonthView from './components/MonthView';
import './App.css';

// Import Offline Logic
import { getAllLocalData, saveMonthLocally, getPendingSyncs } from './db';
import { syncData } from './syncManager';

const TrackerView = lazy(() => import('./components/TrackerView'));

const API_URL = 'https://habit-tracker-2-12x6.onrender.com'; 

// Loading Spinner
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', width: '100%', color: '#94a3b8' }}>
    <div className="loading-spinner"></div>
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [store, setStore] = useState({});
  const [view, setView] = useState({ screen: 'years', year: null, month: null });
  const [globalStreak, setGlobalStreak] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // NEW: Gamification State
  const [userStats, setUserStats] = useState({ xp: 0, level: 1, coins: 0 });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  // Helper to rebuild store from DB
  const rehydrateStore = (dataArray) => {
    const newStore = {};
    dataArray.forEach(doc => {
      if (!newStore[doc.year]) newStore[doc.year] = {};
      newStore[doc.year][doc.month] = doc.habits;
    });
    setStore(prev => ({ ...prev, ...newStore }));
  };

  // --- SYNC & MERGE LOGIC ---
  const fetchAndSyncServer = async (userId) => {
    try {
      // 1. Get Habits
      const res = await fetch(`${API_URL}/all-data/${userId}`);
      const serverData = await res.json();
      const pendingItems = await getPendingSyncs();
      const pendingKeys = new Set(pendingItems.map(item => `${item.year}-${item.month}`));

      const validServerData = serverData.filter(doc => {
        const key = `${doc.year}-${doc.month}`;
        return !pendingKeys.has(key); 
      });

      rehydrateStore(validServerData);

      // 2. Get Streak
      fetch(`${API_URL}/streak/${userId}`)
        .then(r => r.json())
        .then(d => setGlobalStreak(d.streak || 0));

      // 3. NEW: Get Gamification Stats
      fetch(`${API_URL}/stats/${userId}`)
        .then(r => r.json())
        .then(stats => setUserStats(stats));

    } catch (err) {
      console.log("Offline or Server Error: Keeping local data");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const localData = await getAllLocalData();
        if (localData && localData.length > 0) rehydrateStore(localData);
        fetchAndSyncServer(currentUser.uid);
      } else {
        setStore({});
        setView({ screen: 'years', year: null, month: null });
      }
      setAuthLoading(false);
    });

    const syncInterval = setInterval(() => { if (navigator.onLine) syncData(); }, 10000);
    window.addEventListener('online', syncData);
    return () => {
      unsubscribe();
      clearInterval(syncInterval);
      window.removeEventListener('online', syncData);
    };
  }, []);

  // --- CORE UPDATE FUNCTION (Includes Gamification) ---
  const handleTrackerUpdate = async (updatedHabitsList) => {
    // 1. Optimistic UI Update
    setStore(prev => ({
      ...prev,
      [view.year]: { ...prev[view.year], [view.month]: updatedHabitsList }
    }));

    // 2. NEW: Gamification Logic (Instant Gratification)
    // We assume any update might be a completion, so we trigger a small reward
    // For a real app, you'd check if (completed > prevCompleted)
    confetti({
      particleCount: 100,            // More particles
      spread: 70,                    // Wider burst
      origin: { y: 0.6 },            // Start higher up
      colors: ['#4caf50', '#ff9800', '#2196f3'],
      zIndex: 9999,                  // <--- CRITICAL: Forces it on top of everything
      disableForReducedMotion: false // <--- CRITICAL: Forces it even if phone is in power saver mode
    });

    // Award XP Locally
    setUserStats(prev => {
        const xpNeeded = prev.level * 100;
        let newXp = prev.xp + 10;
        let newLevel = prev.level;
        if (newXp >= xpNeeded) {
            newXp -= xpNeeded;
            newLevel += 1;
            showToast(`Level Up! You are now Level ${newLevel}`, 'success');
        }
        return { ...prev, xp: newXp, level: newLevel };
    });

    if (user) {
      // 3. Save Habit Data (Offline First)
      await saveMonthLocally(user.uid, view.year, view.month, updatedHabitsList);
      
      // 4. Save XP Data (Fire and Forget)
      fetch(`${API_URL}/stats/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xpEarned: 10 })
      }).catch(e => console.log("XP Sync skipped (Offline)"));

      // 5. Trigger Habit Sync
      syncData(); 
    }
  };

  const addYear = (year) => {
    if (!year || store[year]) return;
    setStore(prev => ({ ...prev, [year]: {} }));
    if (user) {
      saveMonthLocally(user.uid, year, "January", []);
      syncData();
      showToast(`Year ${year} created!`);
    }
  };

  const deleteYear = (yearToDelete) => {
      if (!window.confirm(`Delete ${yearToDelete}?`)) return;
      const newStore = { ...store };
      delete newStore[yearToDelete];
      setStore(newStore);
      if (user) {
        fetch(`${API_URL}/years/${user.uid}/${yearToDelete}`, { method: 'DELETE' })
        .catch(() => showToast("Sync Error", "error"));
      }
  };

  const handleLogout = async () => { await logout(); showToast("Logged out"); };

  if (authLoading) return <div className="loading-container"><div className="loading-spinner"></div></div>;
  if (!user) return <Login onLogin={setUser} />;

  // XP Bar Calculation
  const xpPercentage = Math.min((userStats.xp / (userStats.level * 100)) * 100, 100);

  return (
    <div className="app-container">
      {toast.show && (
        <div className={`toast-notification ${toast.type} animate-slide-in`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
          <X size={14} className="close-toast" onClick={() => setToast({ ...toast, show: false })} />
        </div>
      )}

      <header className="slim-navbar">
        <div className="nav-inner">
          <div className="nav-left">
            <div className="brand-section">
              <LayoutDashboard className="app-logo-icon" size={24} />
              <h1>Habit Tracker</h1>
            </div>

            <nav className="inline-breadcrumbs">
              <button className={`crumb-btn ${view.screen === 'years' ? 'crumb-active' : ''}`} onClick={() => setView({ screen: 'years', year: null, month: null })}>Years</button>
              {view.year && <><ChevronRight size={14} className="crumb-separator" /><button className={`crumb-btn ${view.screen === 'months' ? 'crumb-active' : ''}`} onClick={() => setView({ ...view, screen: 'months', month: null })}>{view.year}</button></>}
              {view.month && <><ChevronRight size={14} className="crumb-separator" /><span className="crumb-btn crumb-active">{view.month}</span></>}
            </nav>
          </div>

          <div className="nav-right">
             {/* --- NEW: LEVEL INDICATOR --- */}
            <div className="streak-pill" style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', marginRight: '8px' }}>
              <Zap size={14} fill="#0284c7" stroke="#0284c7" />
              <span>LVL {userStats.level}</span>
            </div>

            {globalStreak > 0 && (
              <div className="streak-pill">
                <Flame size={14} fill="#ea580c" stroke="#ea580c" />
                <span>{globalStreak} DAYS</span>
              </div>
            )}
            
            <div className="user-welcome">
              <span>{user.displayName || user.email.split('@')[0]}</span>
            </div>
            <button onClick={handleLogout} className="logout-link"><LogOut size={16} /> Logout</button>
          </div>
        </div>
        
        {/* --- NEW: XP PROGRESS BAR (Bottom of Navbar) --- */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: '#f1f5f9' }}>
           <div style={{ width: `${xpPercentage}%`, height: '100%', background: '#4caf50', transition: 'width 0.5s ease' }}></div>
        </div>
      </header>

      <main className="main-scroll-area">
        <div className="content-max-width">
          {view.screen === 'years' && <YearView years={Object.keys(store)} store={store} onAddYear={addYear} onDeleteYear={deleteYear} onSelectYear={(y) => setView({ screen: 'months', year: y, month: null })} />}
          {view.screen === 'months' && <MonthView year={view.year} store={store} onSelectMonth={(m) => setView({ screen: 'tracker', year: view.year, month: m })} />}
          {view.screen === 'tracker' && (
            <Suspense fallback={<PageLoader />}>
              <TrackerView year={view.year} month={view.month} habits={store[view.year]?.[view.month] || []} onUpdate={handleTrackerUpdate} />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}