import React, { useState, useEffect } from 'react';
import { ChevronRight, Home, LayoutDashboard, LogOut, Flame, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Analytics } from "@vercel/analytics/next";
import { auth, logout } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import Login from './components/Login';
import YearView from './components/YearView';
import MonthView from './components/MonthView';
import TrackerView from './components/TrackerView';
import './App.css';

// MAKE SURE THIS IS YOUR RENDER URL
const API_URL = 'https://habit-tracker-2-12x6.onrender.com'; 

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [store, setStore] = useState({});
  const [view, setView] = useState({ screen: 'years', year: null, month: null });
  const [loading, setLoading] = useState(false);
  const [globalStreak, setGlobalStreak] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadAllData(currentUser.uid);
        fetchGlobalStreak(currentUser.uid);
      } else {
        setStore({});
        setView({ screen: 'years', year: null, month: null });
        setGlobalStreak(0);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- FETCHES EVERYTHING ON LOAD ---
  const loadAllData = (userId) => {
    fetch(`${API_URL}/all-data/${userId}`)
      .then(res => res.json())
      .then(allData => {
        const newStore = {};
        
        allData.forEach(doc => {
          if (!newStore[doc.year]) newStore[doc.year] = {};
          newStore[doc.year][doc.month] = doc.habits;
        });

        setStore(newStore);
      })
      .catch(() => showToast("Failed to load history", "error"));
  };

  const fetchGlobalStreak = (userId) => {
    fetch(`${API_URL}/streak/${userId}`)
      .then(res => res.json())
      .then(data => setGlobalStreak(data.streak || 0))
      .catch(() => console.error("Streak sync failed"));
  };

  // --- FIXED ADD YEAR FUNCTION ---
  // Now saves to DB immediately so it persists after refresh
  const addYear = (year) => {
    if (!year || store[year]) return;
    
    // 1. Update Local State
    setStore(prev => ({ ...prev, [year]: {} }));

    // 2. SAVE TO SERVER (The missing piece)
    // We create an empty "January" so the DB has a record of this year
    if (user) {
      fetch(`${API_URL}/habits/${user.uid}/${year}/January`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habits: [] }) 
      })
      .then(() => showToast(`Year ${year} created!`))
      .catch(() => showToast("Failed to save year", "error"));
    }
  };

  const deleteYear = (yearToDelete) => {
    if (!window.confirm(`Are you sure you want to delete ${yearToDelete}? This will remove ALL habits for that year.`)) {
      return;
    }

    // 1. Optimistic Update
    const previousStore = { ...store };
    const newStore = { ...store };
    delete newStore[yearToDelete];
    setStore(newStore);

    // 2. Call Backend
    if (user) {
      fetch(`${API_URL}/years/${user.uid}/${yearToDelete}`, {
        method: 'DELETE',
      })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to delete');
        }
        showToast(`Year ${yearToDelete} deleted`);
      })
      .catch((err) => {
        console.error("Delete failed:", err);
        showToast("Sync Error: Server didn't delete the year", "error");
        setStore(previousStore);
      });
    }
  };

  const handleTrackerUpdate = (updatedHabitsList) => {
    setStore(prev => ({
      ...prev,
      [view.year]: { ...prev[view.year], [view.month]: updatedHabitsList }
    }));

    if (user) {
      fetch(`${API_URL}/habits/${user.uid}/${view.year}/${view.month}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habits: updatedHabitsList })
      })
      .then(() => fetchGlobalStreak(user.uid))
      .catch(() => showToast("Sync Failed", "error"));
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast("Logged out safely");
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
            <TrackerView 
              year={view.year} 
              month={view.month} 
              habits={store[view.year]?.[view.month] || []} 
              onUpdate={handleTrackerUpdate} 
            />
          )}
        </div>
      </main>
    </div>
  );
}