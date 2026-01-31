import React, { useState, useEffect } from 'react';
import { ChevronRight, Home, LayoutDashboard, LogOut } from 'lucide-react';
import { auth, logout } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import Login from './components/Login';
import YearView from './components/YearView';
import MonthView from './components/MonthView';
import TrackerView from './components/TrackerView';
import './App.css';

const API_URL = 'https://habit-tracker-ot9frxl5s-divyanshsingh112s-projects.vercel.app';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // <--- NEW: Loading state for Auth
  const [store, setStore] = useState({});
  const [view, setView] = useState({ screen: 'years', year: null, month: null });
  const [loading, setLoading] = useState(false); // This is for data loading

  // --- 1. AUTH CHECK & INITIAL LOAD ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // User is logged in, load their data
        loadYears(currentUser.uid);
      } else {
        // User is logged out, clear data
        setStore({});
        setView({ screen: 'years', year: null, month: null });
      }
      // CRITICAL FIX: Tell the app we are done checking auth
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. LOAD YEARS FUNCTION ---
  const loadYears = (userId) => {
    fetch(`${API_URL}/years/${userId}`)
      .then(res => res.json())
      .then(yearsList => {
        const newStore = {};
        yearsList.forEach(y => { newStore[y] = {} });
        setStore(newStore);
      })
      .catch(err => console.error("Failed to load years:", err));
  };

  // --- 3. LOAD HABITS (User Specific) ---
  useEffect(() => {
    if (user && view.screen === 'tracker' && view.year && view.month) {
      setLoading(true);
      fetch(`${API_URL}/habits/${user.uid}/${view.year}/${view.month}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then(data => {
          setStore(prev => ({
            ...prev,
            [view.year]: { ...prev[view.year], [view.month]: data }
          }));
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching habits:", err);
          setLoading(false); 
        });
    }
  }, [view.screen, view.year, view.month, user]);

  // --- ACTIONS ---

  const addYear = (year) => {
    if (!year || store[year]) return;
    
    // 1. Update UI Immediately
    setStore({ ...store, [year]: {} });

    // 2. SAVE TO DB
    if (user) {
      fetch(`${API_URL}/habits/${user.uid}/${year}/January`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habits: [] }) 
      })
      .then(() => console.log(`Year ${year} created`))
      .catch(err => console.error("Failed to save year:", err));
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
      }).catch(err => console.error("Error saving habits:", err));
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  // --- RENDER 1: SHOW PRETTY LOADING SCREEN ---
  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading your tracker...</div>
      </div>
    );
  }

  // --- RENDER 2: SHOW LOGIN IF NO USER ---
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // --- RENDER 3: SHOW DASHBOARD ---
  return (
    <div className="dashboard-wrapper">
      
      {/* HEADER */}
      <header className="main-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div className="header-left">
          <div className="icon-bg">
            <LayoutDashboard className="header-icon" size={28} />
          </div>
          <div className="header-text">
            <div className="title-row">
              <h1>Habit Tracker</h1>
            </div>
            <p>Welcome, {user.displayName || user.email}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout} 
          className="breadcrumbs-container" 
          style={{border:'none', background:'transparent', color:'var(--danger)', padding:'8px'}}
        >
          <LogOut size={18} /> Logout
        </button>
      </header>

      {/* BREADCRUMBS */}
      <nav className="breadcrumbs-container">
        <button onClick={() => setView({ screen: 'years', year: null, month: null })}>
          <Home size={16} /> <span style={{marginLeft: 6}}>Years</span>
        </button>
        
        {view.year && (
          <>
            <ChevronRight size={14} className="crumb-arrow" />
            <button onClick={() => setView({ ...view, screen: 'months', month: null })}>
              {view.year}
            </button>
          </>
        )}
        
        {view.month && (
          <>
            <ChevronRight size={14} className="crumb-arrow" />
            <span className="current-crumb">{view.month}</span>
          </>
        )}
      </nav>

      {/* MAIN CONTENT */}
      <main className="content-area">
        {view.screen === 'years' && (
          <YearView 
            years={Object.keys(store)} 
            onAddYear={addYear} 
            onSelectYear={(y) => setView({ screen: 'months', year: y, month: null })} 
          />
        )}

        {view.screen === 'months' && (
          <MonthView 
            year={view.year} 
            onSelectMonth={(m) => setView({ screen: 'tracker', year: view.year, month: m })} 
          />
        )}

        {view.screen === 'tracker' && (
          <>
            {loading ? (
               <div style={{textAlign:'center', padding: 40, color: '#64748b'}}>
                 Loading data...
               </div>
            ) : (
              <TrackerView 
                year={view.year} 
                month={view.month} 
                habits={store[view.year]?.[view.month] || []} 
                onUpdate={handleTrackerUpdate} 
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}