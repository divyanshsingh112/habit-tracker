import React, { useState, useEffect, Suspense, lazy } from 'react'; // <--- Added Suspense & lazy
import { ChevronRight, LayoutDashboard, LogOut, Flame, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { auth, logout } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import Login from './components/Login';
import YearView from './components/YearView';
import MonthView from './components/MonthView';
import './App.css';

// Import Offline Logic
import { getAllLocalData, saveMonthLocally, getPendingSyncs } from './db';
import { syncData } from './syncManager';

// --- LAZY LOAD OPTIMIZATION ---
// Instead of importing TrackerView at the top, we lazy load it.
// This saves ~300kb from the initial mobile load.
const TrackerView = lazy(() => import('./components/TrackerView'));

const API_URL = 'https://habit-tracker-2-12x6.onrender.com'; 

// Simple Loading Spinner for the transition
const PageLoader = () => (
  <div style={{
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '300px', 
    width: '100%',
    color: '#94a3b8'
  }}>
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

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const rehydrateStore = (dataArray) => {
    const newStore = {};
    dataArray.forEach(doc => {
      if (!newStore[doc.year]) newStore[doc.year] = {};
      newStore[doc.year][doc.month] = doc.habits;
    });
    setStore(prev => ({ ...prev, ...newStore }));
  };

  // --- SMART MERGE LOGIC (Preserved) ---
  const fetchAndSyncServer = async (userId) => {
    try {
      // A. Get Data from Server
      const res = await fetch(`${API_URL}/all-data/${userId}`);
      const serverData = await res.json();

      // B. Check what is waiting to Sync (Your local changes)
      const pendingItems = await getPendingSyncs();
      
      const pendingKeys = new Set(pendingItems.map(item => `${item.year}-${item.month}`));

      // C. SMART FILTER
      const validServerData = serverData.filter(doc => {
        const key = `${doc.year}-${doc.month}`;
        const isDirty = pendingKeys.has(key);
        if (isDirty) console.log(`[Merge] Ignoring server data for ${key}`);
        return !isDirty; 
      });

      rehydrateStore(validServerData);

      fetch(`${API_URL}/streak/${userId}`)
        .then(r => r.json())
        .then(d => setGlobalStreak(d.streak || 0));

    } catch (err) {
      console.log("Offline or Server Error: Keeping local data");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // 1. Load Local Data Immediately
        const localData = await getAllLocalData();
        if (localData && localData.length > 0) {
          rehydrateStore(localData);
        }

        // 2. Fetch Latest from Server
        fetchAndSyncServer(currentUser.uid);
      } else {
        setStore({});
        setView({ screen: 'years', year: null, month: null });
      }
      setAuthLoading(false);
    });

    const syncInterval = setInterval(() => {
      if (navigator.onLine) syncData();
    }, 10000);

    window.addEventListener('online', syncData);

    return () => {
      unsubscribe();
      clearInterval(syncInterval);
      window.removeEventListener('online', syncData);
    };
  }, []);

  const handleTrackerUpdate = async (updatedHabitsList) => {
    setStore(prev => ({
      ...prev,
      [view.year]: { ...prev[view.year], [view.month]: updatedHabitsList }
    }));

    if (user) {
      await saveMonthLocally(user.uid, view.year, view.month, updatedHabitsList);
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
        .then(() => showToast(`Year ${yearToDelete} deleted`))
        .catch(() => showToast("Sync Error", "error"));
      }
  };

  const handleLogout = async () => {
    await logout();
    showToast("Logged out");
  };

  if (authLoading) return <div className="loading-container"><div className="loading-spinner"></div></div>;
  if (!user) return <Login onLogin={setUser} />;

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

          <div className="nav-right">
            {globalStreak > 0 && (
              <div className="streak-pill">
                <Flame size={14} fill="#ea580c" stroke="#ea580c" />
                <span>{globalStreak} DAYS</span>
              </div>
            )}
            
            <div className="user-welcome">
              <span>{user.displayName || user.email.split('@')[0]}</span>
            </div>

            <button onClick={handleLogout} className="logout-link">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-scroll-area">
        <div className="content-max-width">
          {view.screen === 'years' && (
            <YearView 
              years={Object.keys(store)} 
              store={store} 
              onAddYear={addYear}
              onDeleteYear={deleteYear}
              onSelectYear={(y) => setView({ screen: 'months', year: y, month: null })} 
            />
          )}

          {view.screen === 'months' && (
            <MonthView 
              year={view.year} 
              store={store}
              onSelectMonth={(m) => setView({ screen: 'tracker', year: view.year, month: m })} 
            />
          )}

          {view.screen === 'tracker' && (
            // WRAP TRACKER IN SUSPENSE
            // This shows the loader while the heavy code downloads
            <Suspense fallback={<PageLoader />}>
              <TrackerView 
                year={view.year} 
                month={view.month} 
                habits={store[view.year]?.[view.month] || []} 
                onUpdate={handleTrackerUpdate} 
              />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}