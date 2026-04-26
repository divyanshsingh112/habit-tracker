import React, { useState, useEffect } from 'react';
import './App.css';
import { LayoutGrid, Calendar, ChevronLeft, LogOut, Plus, X, Sword, Brain, Sparkles, MessageCircle, Trash2, Clock, Zap, ArrowRight, Flame } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase'; // Ensure you have this file
import Login from './components/Login'; // Ensure you have this component

// --- CONFIGURATION ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Set this to FALSE when you want to force test the backend connection
const USE_DEMO_DATA_FALLBACK = true; 

// --- MODAL COMPONENT ---
const NewHabitModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [attr, setAttr] = useState('warrior');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>Create New Quest</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <label className="input-label">Quest Name</label>
          <input 
            type="text" 
            className="modal-input" 
            placeholder="e.g. 50 Pushups or Read 10 Pages"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <label className="input-label">Choose Class Attribute</label>
          <div className="class-grid">
            {['warrior', 'mage', 'monk', 'bard'].map(c => (
              <div 
                key={c}
                className={`class-card ${c} ${attr === c ? 'active' : ''}`}
                onClick={() => setAttr(c)}
              >
                <div className="class-icon" style={{ background: getAttrColor(c) }}>
                  {c === 'warrior' && <Sword size={18} />}
                  {c === 'mage' && <Brain size={18} />}
                  {c === 'monk' && <Sparkles size={18} />}
                  {c === 'bard' && <MessageCircle size={18} />}
                </div>
                <div style={{textTransform: 'capitalize'}}>
                  <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>{c}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button 
              className="btn-confirm" 
              onClick={() => {
                if(name) {
                  onSave(name, attr);
                  setName('');
                  setAttr('warrior');
                }
              }}
            >
              Start Quest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- HELPER FUNCTIONS ---
const getAttrColor = (attr) => {
  switch(attr) {
    case 'warrior': return '#ef4444';
    case 'mage': return '#3b82f6';
    case 'monk': return '#a855f7';
    case 'bard': return '#f59e0b';
    default: return '#10b981';
  }
};

// --- SIDEBAR ---
const Sidebar = ({ currentView, setView, selectedYear, selectedMonth, onLogout }) => {
  const isHomeActive = currentView === 'home';
  const isChroniclesActive = currentView === 'year-grid' || currentView === 'month-tracker';

  let dynamicLabel = "Chronicles";
  if (currentView === 'year-grid' && selectedYear) dynamicLabel = `${selectedYear}`;
  if (currentView === 'month-tracker' && selectedMonth) dynamicLabel = `${selectedMonth.substring(0, 3)}`;

  return (
    <aside className="sidebar">
      <div className="brand">
        <LayoutGrid size={28} style={{ color: '#10b981' }} />
        <span>Habit Tracker</span>
      </div>
      
      <div className="nav-links">
        <div 
          className={`nav-item ${isHomeActive ? 'active' : ''}`}
          onClick={() => setView('home')}
        >
          <LayoutGrid size={20} />
          <span>Dashboard</span>
        </div>
        <div 
          className={`nav-item ${isChroniclesActive ? 'active' : ''}`}
          onClick={() => selectedYear && setView('year-grid')} 
          style={{ cursor: selectedYear ? 'pointer' : 'default', opacity: selectedYear ? 1 : 0.5 }}
        >
          <Clock size={20} />
          <span>{dynamicLabel}</span>
        </div>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div className="nav-item" onClick={onLogout} style={{ color: '#ef4444' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </div>
      </div>
    </aside>
  );
};

// --- HOME DASHBOARD (YEARS) ---
const HomeDashboard = ({ years, onCreateYear, onSelectYear }) => {
  const nextYear = years.length > 0 ? Math.max(...years) + 1 : 2026;
  const currentYear = new Date().getFullYear();

  return (
    <div className="container animate-fade">
      <div className="chronicles-header">
        <h1>Your Chronicles</h1>
        <p>Reflect on your past journeys and prepare for the road ahead. Every year is a new chapter in your growth.</p>
      </div>

      <div className="year-cards-grid">
        {years.map(year => {
          const isPast = year < currentYear;
          return (
            <div key={year} className="year-card-v2" onClick={() => onSelectYear(year)}>
              <div className="year-card-v2-top">
                <span className="year-card-v2-year">{year}</span>
                <div className="year-card-v2-icon">
                  <Clock size={18} />
                </div>
              </div>
              <div className="year-card-v2-stats">
                <span>Complete</span>
                <span>{isPast ? '75' : '0'}%</span>
              </div>
              <div className="year-card-v2-bar">
                <div className="year-card-v2-bar-fill" style={{ width: isPast ? '75%' : '0%' }}></div>
              </div>
              <div className="year-card-v2-streak" style={{ color: isPast ? '#10b981' : '#64748b' }}>
                <Flame size={14} />
                <span>{isPast ? '324 Day Streak' : 'Upcoming'}</span>
              </div>
              <div className="year-card-v2-action">
                <span>View</span>
                <ArrowRight size={16} />
              </div>
            </div>
          );
        })}

        <div className="add-year-card-v2" onClick={() => onCreateYear(nextYear)}>
          <Plus size={32} />
          <span>Create {nextYear}</span>
        </div>
      </div>
    </div>
  );
};

// --- YEAR GRID (MONTHS) ---
const YearGrid = ({ year, onSelectMonth, onBack }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="container animate-fade">
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={onBack} className="back-btn-v2">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{year} Overview</h2>
          <p style={{ color: '#94a3b8' }}>Select a month to track quests.</p>
        </div>
      </div>

      <div className="month-scroll-container">
        <div className="month-compact-grid">
          {months.map((m, i) => (
            <div key={m} className="month-compact-card" onClick={() => onSelectMonth(m)}>
              <span className="month-compact-name">{m}</span>
              <div className="month-compact-status">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: i < 3 ? '#10b981' : '#475569' }}></div>
                <span style={{ color: i < 3 ? '#10b981' : '#94a3b8' }}>{i < 3 ? 'On Track' : 'No Data'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- TRACKER LIST (View 3 - The Core Logic) ---
const TrackerList = ({ year, month, user, onBack }) => {
  
  // 1. DYNAMIC DATE LOGIC (Fixes Feb 30th bug)
  const getDaysInMonth = (monthName, yearVal) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = months.indexOf(monthName);
    return new Date(yearVal, monthIndex + 1, 0).getDate();
  };

  const totalDays = getDaysInMonth(month, year);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  // 2. STATE
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState([]);

  // 3. FETCH HABITS FROM BACKEND
  useEffect(() => {
    const fetchHabits = async () => {
      setLoading(true);
      try {
        console.log(`[API] Fetching habits for ${user.uid} - ${year} - ${month}`);
        
        // --- REAL BACKEND CALL ---
        const response = await fetch(`${API_URL}/api/habits?uid=${user.uid}&year=${year}&month=${month}`);
        
        if (!response.ok) {
           throw new Error("Failed to connect to backend");
        }
        
        const data = await response.json();
        setHabits(data); 

      } catch (error) {
        console.error("Backend Error:", error);
        if (USE_DEMO_DATA_FALLBACK) {
            console.warn("Using Demo Data because backend failed.");
            setHabits([
              { id: 1, name: 'Morning Run (Demo)', attr: 'warrior', data: { 1: true, 2: true, 3: true, 5: true } },
              { id: 2, name: 'Read Grimoire (Demo)', attr: 'mage', data: { 1: true, 2: true } },
            ]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchHabits();
  }, [year, month, user]);

  // 4. HANDLERS
  const toggleDay = async (habitId, day) => {
    // Optimistic UI Update (Update screen instantly)
    const habitIndex = habits.findIndex(h => h.id === habitId);
    const oldHabit = habits[habitIndex];
    const newData = { ...oldHabit.data };
    
    if (newData[day]) delete newData[day];
    else newData[day] = true;

    const newHabits = [...habits];
    newHabits[habitIndex] = { ...oldHabit, data: newData };
    setHabits(newHabits);

    // Backend Sync
    try {
        await fetch(`${API_URL}/api/habits/${habitId}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ day, completed: !!newData[day] })
        });
    } catch (err) {
        console.error("Failed to sync toggle", err);
        // Optional: Revert UI if failed
    }
  };

  const addHabit = async (name, attr) => {
    const tempId = Date.now();
    
    // Optimistic UI
    const newHabit = { id: tempId, name, attr, data: {} };
    setHabits([...habits, newHabit]);
    setModalOpen(false);

    // Backend Sync
    try {
        const res = await fetch(`${API_URL}/api/habits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: user.uid, year, month, name, attr })
        });
        const savedHabit = await res.json();
        // Replace temp ID with real DB ID
        setHabits(prev => prev.map(h => h.id === tempId ? savedHabit : h));
    } catch (err) {
        console.error("Failed to create habit", err);
    }
  };

  const deleteHabit = async (id) => {
    if (window.confirm("Abandon this quest?")) {
      // Optimistic
      setHabits(habits.filter(h => h.id !== id));
      
      // Backend
      try {
        await fetch(`${API_URL}/api/habits/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  if (loading) return <div className="container" style={{padding:'2rem', color:'white'}}>Loading Quest Log...</div>;

  return (
    <div className="container animate-fade">
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={onBack}
            style={{ background: '#334155', border: 'none', color: 'white', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{month} {year}</h2>
            <p style={{ color: '#94a3b8' }}>Quest Log • {totalDays} Days</p>
          </div>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          style={{ background: '#10b981', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}
        >
          <Plus size={18} /> New Quest
        </button>
      </div>

      <div className="tracker-container">
        <div className="row-header">
          <div>QUEST</div>
          <div style={{ paddingLeft: '1rem' }}>PROGRESS ({totalDays} Days)</div>
          <div style={{ textAlign: 'center' }}>STATS</div>
          <div></div>
        </div>

        {habits.map(habit => {
          const count = Object.keys(habit.data || {}).length;
          const percentage = Math.round((count / totalDays) * 100);
          const color = getAttrColor(habit.attr);
          
          return (
            <div key={habit.id} className="habit-row">
              <div className="habit-name">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }}></div>
                {habit.name}
              </div>
              <div className="habit-days">
                {days.map(d => (
                  <div 
                    key={d} 
                    className={`day-box ${habit.data[d] ? 'completed' : ''}`}
                    style={habit.data[d] ? { background: color, boxShadow: `0 0 10px ${color}66` } : {}}
                    onClick={() => toggleDay(habit.id, d)}
                    title={`${month} ${d}`}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="habit-stats" style={{ color: color }}>{percentage}%</div>
              <div className="delete-btn" onClick={() => deleteHabit(habit.id)}>
                <Trash2 size={18} />
              </div>
            </div>
          );
        })}
        {habits.length === 0 && (
            <div style={{padding: '2rem', textAlign: 'center', color: '#94a3b8'}}>
                No active quests found. Check your connection or add one!
            </div>
        )}
      </div>

      <NewHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={addHabit} 
      />
    </div>
  );
};

// --- MAIN APP ORCHESTRATION ---
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // View States
  const [currentView, setCurrentView] = useState('home');
  const [yearsList, setYearsList] = useState([2025, 2026]); // Defaults
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // AUTH CHECK
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Navigation Handlers
  const handleCreateYear = (year) => {
    setYearsList([...yearsList, year]);
  };

  const handleSelectYear = (year) => {
    setSelectedYear(year);
    setCurrentView('year-grid');
  };

  const handleSelectMonth = (month) => {
    setSelectedMonth(month);
    setCurrentView('month-tracker');
  };

  const handleSidebarNavigation = (destination) => {
      if (destination === 'home') {
          setCurrentView('home');
      } else {
        setCurrentView(destination);
      }
  }

  // RENDER
  if (loading) return <div style={{background: '#0f172a', height:'100vh', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>Loading Guild...</div>;

  // IF NOT LOGGED IN -> SHOW LOGIN
  if (!user) return <Login onLogin={setUser} />;

  // IF LOGGED IN -> SHOW APP
  return (
    <div className="app-layout">
      <Sidebar 
        currentView={currentView} 
        setView={handleSidebarNavigation}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onLogout={() => signOut(auth)}
      />
      
      <main className="main-content">
        <header className="top-bar">
          <span style={{ color: '#94a3b8' }}>Welcome back, <b>{user.displayName || user.email.split('@')[0]}</b></span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: '#1e293b', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', border: '1px solid #334155', color: '#fff' }}>
              <Zap size={14} style={{ display: 'inline', marginRight: 4 }} /> Level 3
            </div>
          </div>
        </header>

        <div className="scroll-area">
          {currentView === 'home' && (
            <HomeDashboard 
                years={yearsList} 
                onCreateYear={handleCreateYear} 
                onSelectYear={handleSelectYear}
            />
          )}

          {currentView === 'year-grid' && selectedYear && (
            <YearGrid 
                year={selectedYear} 
                onSelectMonth={handleSelectMonth} 
                onBack={() => setCurrentView('home')} 
            />
          )}

          {currentView === 'month-tracker' && selectedYear && selectedMonth && (
            <TrackerList 
                year={selectedYear}
                month={selectedMonth}
                user={user}
                onBack={() => setCurrentView('year-grid')} 
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;