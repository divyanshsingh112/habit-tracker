import React, { useState, useEffect, Suspense, lazy } from 'react'; 
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { auth, logout } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { GamificationProvider, useGameContext } from './context/GamificationContext';
import { HabitProvider, useHabitContext } from './context/HabitContext';
import Login from './components/Login';
import Navbar from './components/Navbar';
import HabitModal from './components/HabitModal'; 
import StatsModal from './components/StatsModal'; 
import ShopModal from './components/ShopModal'; 
import { saveMonthLocally } from './db';
import { syncData } from './syncManager';
import './App.css';

// Lazy Load Components
const YearView = lazy(() => import('./components/YearView'));
const MonthView = lazy(() => import('./components/MonthView'));
const TrackerView = lazy(() => import('./components/TrackerView'));
const Analytics = lazy(() => import('./components/Analytics'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const Guild = lazy(() => import('./components/Guild'));

const API_URL = import.meta.env.VITE_API_URL || 'https://habit-tracker-m9uw.onrender.com'; 
const PageLoader = () => <div className="loading-spinner" style={{margin: '100px auto'}}></div>;

function Dashboard({ user, showToast, handleLogout }) {
  const [view, setView] = useState({ screen: 'years', year: null, month: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);

  const { userStats, buyItem, equipItem, processXpUpdate } = useGameContext();
  const { store, setStore, globalStreak, loadLocalData, fetchAndSync } = useHabitContext();

  useEffect(() => {
    if (user) { loadLocalData(); fetchAndSync(user.uid, null); }
  }, [user]);

  // ✅ FIXED: Correctly calculates if we gained or lost checks to award Coins/XP
  const handleTrackerUpdate = async (updatedHabitsList, habitAttribute) => {
    const previousHabits = store[view.year]?.[view.month] || [];
    
    // Helper to count total checks in a list of habits
    const countChecks = (list) => list.reduce((acc, h) => acc + (h.completedDays ? Object.keys(h.completedDays).length : 0), 0);
    
    const oldTotal = countChecks(previousHabits);
    const newTotal = countChecks(updatedHabitsList);
    const diff = newTotal - oldTotal;

    // Update Local Store
    setStore(prev => ({ ...prev, [view.year]: { ...prev[view.year], [view.month]: updatedHabitsList } }));

    // Send Update to Game Engine (XP + Coins)
    if (diff !== 0) {
      console.log(`[App] Check difference: ${diff}. Attribute: ${habitAttribute}`);
      // Assuming processXpUpdate handles the backend logic for rewards
      // +10 XP per check is the standard rate
      processXpUpdate(diff * 10, habitAttribute);
    }

    if (user) { 
      await saveMonthLocally(user.uid, view.year, view.month, updatedHabitsList); 
      syncData(); 
    }
  };

  const handleAddHabit = async ({ name, attribute }) => {
    const newHabit = { id: Date.now(), name, attribute, completedDays: {} };
    const currentHabits = store[view.year]?.[view.month] || [];
    await handleTrackerUpdate([...currentHabits, newHabit]);
  };

  const addYear = (year) => {
    if (!year || store[year]) return;
    setStore(prev => ({ ...prev, [year]: {} }));
    saveMonthLocally(user.uid, year, "January", []);
    showToast(`Year ${year} created!`);
  };

  // Safe access to inventory
  const activeTheme = userStats?.activeTheme || 'light';
  const themeClass = activeTheme !== 'light' ? `theme-${activeTheme}` : '';

  return (
    <div className={`app-container ${themeClass}`}>
      <Navbar 
        user={user} userStats={userStats} globalStreak={globalStreak} 
        view={view} setView={setView} onLogout={handleLogout}
        onOpenStats={() => setIsStatsOpen(true)} onOpenShop={() => setIsShopOpen(true)}
      />

      <main className="main-scroll-area">
        <div className="content-max-width">
          <Suspense fallback={<PageLoader />}>
            
            {view.screen === 'years' && (
              <YearView years={Object.keys(store)} store={store} onAddYear={addYear} onDeleteYear={(y) => { const newStore = { ...store }; delete newStore[y]; setStore(newStore); }} onSelectYear={(y) => setView({ screen: 'months', year: y, month: null })} />
            )}
            
            {view.screen === 'months' && (
              <MonthView year={view.year} store={store} onSelectMonth={(m) => setView({ screen: 'tracker', year: view.year, month: m })} />
            )}
            
            {view.screen === 'tracker' && (
              <>
                 <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="save-btn" style={{ width: 'auto', padding: '10px 20px', marginTop: 0 }} onClick={() => setIsModalOpen(true)}>+ New Quest</button>
                </div>
                <TrackerView year={view.year} month={view.month} habits={store[view.year]?.[view.month] || []} onUpdate={handleTrackerUpdate} />
                <HabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddHabit} />
              </>
            )}
            
            {view.screen === 'analytics' && (
              <Analytics userStats={userStats} store={store} />
            )}
            
            {view.screen === 'leaderboard' && (
              <Leaderboard currentUser={user} />
            )}

            {view.screen === 'guild' && (
              <Guild user={user} />
            )}

          </Suspense>
        </div>
      </main>

      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} stats={userStats || { xp: 0, level: 1 }} discipline={0} />
      
      {/* ✅ FIXED: Prevents "White Screen" by passing safe default values */}
      <ShopModal 
        isOpen={isShopOpen} 
        onClose={() => setIsShopOpen(false)} 
        userStats={userStats || { inventory: [], coins: 0, activeTheme: 'light' }} 
        onBuy={buyItem} 
        onEquip={equipItem} 
      />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const showToast = (message, type = 'success') => { 
    setToast({ show: true, message, type }); 
    setTimeout(() => setToast({ ...toast, show: false }), 3000); 
  };
  
  useEffect(() => { 
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); }); 
    return () => unsub(); 
  }, []);

  if (loading) return <PageLoader />;
  if (!user) return <Login onLogin={setUser} />;
  
  return (
    <GamificationProvider user={user} showToast={showToast} apiURL={API_URL}>
      <HabitProvider user={user} apiURL={API_URL}>
        {toast.show && (
          <div className={`toast-notification ${toast.type} animate-slide-in`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{toast.message}</span>
            <X size={14} className="close-toast" onClick={() => setToast({ ...toast, show: false })} />
          </div>
        )}
        <Dashboard user={user} showToast={showToast} handleLogout={logout} />
      </HabitProvider>
    </GamificationProvider>
  );
}