import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  LayoutGrid, Calendar, ChevronLeft, LogOut, Plus, X, 
  Sword, Sparkles, Activity, Clock, Zap, Flame, Settings, User as UserIcon, Award
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase'; 
import Login from './components/Login'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const USE_DEMO_DATA_FALLBACK = true; 

// --- MODAL COMPONENT (Redesigned) ---
const NewHabitModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [attr, setAttr] = useState('warrior');
  const [difficulty, setDifficulty] = useState('adept');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="modal-header">
          <h3 className="modal-title">Forge New Quest</h3>
          <p className="modal-subtitle">Define your next daily ritual.</p>
        </div>
        
        <div className="modal-body">
          <div className="input-group">
            <label className="input-label">Quest Name</label>
            <input 
              type="text" 
              className="modal-input" 
              placeholder="e.g. Read 20 Pages"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label">Quest Class</label>
            <div className="class-grid">
              <div className={`class-card warrior ${attr === 'warrior' ? 'active' : ''}`} onClick={() => setAttr('warrior')}>
                <div className="class-icon"><Sword size={24} /></div>
                <div className="class-name">Warrior</div>
                <div className="class-desc">Fitness &<br/>Strength</div>
              </div>
              <div className={`class-card mage ${attr === 'mage' ? 'active' : ''}`} onClick={() => setAttr('mage')}>
                <div className="class-icon"><Sparkles size={24} /></div>
                <div className="class-name">Mage</div>
                <div className="class-desc">Learning &<br/>Focus</div>
              </div>
              <div className={`class-card rogue ${attr === 'rogue' ? 'active' : ''}`} onClick={() => setAttr('rogue')}>
                <div className="class-icon"><Activity size={24} /></div>
                <div className="class-name">Rogue</div>
                <div className="class-desc">Agility &<br/>Speed</div>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Difficulty Level</label>
            <div className="difficulty-group">
              {['novice', 'adept', 'master'].map(level => (
                <button 
                  key={level}
                  className={`diff-btn ${difficulty === level ? 'active' : ''}`}
                  onClick={() => setDifficulty(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button 
              className="btn-create" 
              onClick={() => {
                if(name) {
                  onSave(name, attr, difficulty);
                  setName('');
                  setAttr('warrior');
                  setDifficulty('adept');
                }
              }}
            >
              <Plus size={18} /> Create Quest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SIDEBAR (Desktop) ---
const Sidebar = ({ currentView, setView, selectedYear, selectedMonth, onLogout }) => {
  const isHomeActive = currentView === 'home';
  const isChroniclesActive = currentView === 'year-grid' || currentView === 'month-tracker';

  let dynamicLabel = "Chronicles";
  if (currentView === 'year-grid' && selectedYear) dynamicLabel = `${selectedYear}`;
  if (currentView === 'month-tracker' && selectedMonth) dynamicLabel = `${selectedMonth.substring(0, 3)}`;

  return (
    <aside className="sidebar">
      <div className="brand">
        <LayoutGrid size={28} style={{ color: '#a855f7' }} />
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

// --- HOME DASHBOARD ---
const HomeDashboard = ({ years, onCreateYear, onSelectYear }) => {
  const nextYear = years.length > 0 ? Math.max(...years) + 1 : 2026;
  const currentYear = new Date().getFullYear();

  return (
    <div className="container animate-fade">
      <div className="insights-header" style={{marginBottom: '2rem'}}>
        <h1 className="insights-title" style={{color: 'white'}}>Your Chronicles</h1>
        <p style={{color: '#94a3b8'}}>Reflect on your past journeys and prepare for the road ahead.</p>
      </div>

      <div className="year-cards-grid">
        {years.map(year => {
          return (
            <div key={year} className="year-card-v2" onClick={() => onSelectYear(year)}>
              <div className="year-card-v2-top">
                <span className="year-card-v2-year">{year}</span>
                <div className="year-card-v2-icon">
                  <Clock size={18} />
                </div>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem'}}>
                <span>Complete</span>
                <span>0%</span>
              </div>
              <div style={{height: '5px', background: '#0f172a', borderRadius: '5px', overflow: 'hidden', marginBottom: '1rem'}}>
                <div style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg, #6366f1, #a78bfa)', borderRadius: '5px' }}></div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: '#64748b'}}>
                <Flame size={14} />
                <span>0 Day Streak</span>
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
      <div className="insights-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={onBack} style={{ background: '#334155', border: 'none', color: 'white', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{year} Overview</h2>
          <p style={{ color: '#94a3b8' }}>Select a month to view insights.</p>
        </div>
      </div>

      <div className="month-compact-grid">
        {months.map((m, i) => (
          <div key={m} className="month-compact-card" onClick={() => onSelectMonth(m)}>
            <span className="month-compact-name">{m}</span>
            <div className="month-compact-status">
              <div style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: i < 3 ? '#a855f7' : '#475569', marginRight: '6px' }}></div>
              <span style={{ color: i < 3 ? '#a855f7' : '#94a3b8' }}>{i < 3 ? 'Data Logged' : 'No Data'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- TRACKER LIST (Insights View Redesign) ---
const TrackerList = ({ year, month, user, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const getDaysInMonth = (monthName, yearVal) => {
    const monthIndex = months.indexOf(monthName);
    return new Date(yearVal, monthIndex + 1, 0).getDate();
  };
  const totalDays = getDaysInMonth(month, year);
  
  const today = new Date();
  const currentRealYear = today.getFullYear();
  const currentRealMonthName = months[today.getMonth()];
  const currentRealDay = today.getDate();
  const isCurrentMonth = year === currentRealYear && month === currentRealMonthName;

  useEffect(() => {
    const fetchHabits = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/habits?uid=${user.uid}&year=${year}&month=${month}`);
        if (!response.ok) throw new Error("Failed to connect to backend");
        const data = await response.json();
        setHabits(data || []); 
      } catch (error) {
        console.error("Backend Error:", error);
        setHabits([]); // Start fresh empty instead of dummy data
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchHabits();
  }, [year, month, user]);

  const toggleDay = async (habitId, day) => {
    if (!isCurrentMonth || day !== currentRealDay) return;

    const habitIndex = habits.findIndex(h => h.id === habitId);
    const oldHabit = habits[habitIndex];
    const newData = { ...(oldHabit.data || {}) };
    
    if (newData[day]) delete newData[day];
    else newData[day] = true;

    const newHabits = [...habits];
    newHabits[habitIndex] = { ...oldHabit, data: newData };
    setHabits(newHabits);

    try {
        await fetch(`${API_URL}/api/habits/${habitId}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ day, completed: !!newData[day] })
        });
    } catch (err) {
        console.error("Failed to sync toggle", err);
    }
  };

  const addHabit = async (name, attr, difficulty) => {
    const tempId = Date.now();
    const newHabit = { id: tempId, name, attr, difficulty, data: {} };
    setHabits([...habits, newHabit]);
    setModalOpen(false);

    try {
        const res = await fetch(`${API_URL}/api/habits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: user.uid, year, month, name, attr, difficulty })
        });
        const savedHabit = await res.json();
        setHabits(prev => prev.map(h => h.id === tempId ? savedHabit : h));
    } catch (err) {
        console.error("Failed to create habit", err);
    }
  };

  const deleteHabit = async (id) => {
    if (window.confirm("Abandon this quest?")) {
      setHabits(habits.filter(h => h.id !== id));
      try {
        await fetch(`${API_URL}/api/habits/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  // Stats Calculations
  let totalCompletions = 0;
  habits.forEach(h => {
     if (h.data) totalCompletions += Object.keys(h.data).length;
  });

  const maxPossibleCompletions = habits.length * totalDays;
  const successRate = maxPossibleCompletions === 0 ? 0 : Math.round((totalCompletions / maxPossibleCompletions) * 100);

  let computedStreak = 0;
  if (isCurrentMonth) {
    for (let i = currentRealDay; i >= 1; i--) {
      let anyDone = habits.some(h => h.data && h.data[i]);
      if (anyDone) {
        computedStreak++;
      } else {
        if (i === currentRealDay) continue; // Don't break streak if today isn't done yet
        break;
      }
    }
  } else {
    // For past months, just calculate longest streak
    let currentStreak = 0;
    for (let i = 1; i <= totalDays; i++) {
       let anyDone = habits.some(h => h.data && h.data[i]);
       if (anyDone) {
          currentStreak++;
          if (currentStreak > computedStreak) computedStreak = currentStreak;
       } else {
          currentStreak = 0;
       }
    }
  }

  // Heatmap Data
  const getHeatmapLevel = (day) => {
    let completedCount = 0;
    habits.forEach(h => {
       if (h.data && h.data[day]) completedCount++;
    });
    if (completedCount === 0) return 0;
    if (completedCount === 1) return 1;
    if (completedCount === 2) return 2;
    return 3;
  };

  const monthIndex = months.indexOf(month);
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const heatmapCells = [];
  for (let i = 0; i < startOffset; i++) {
    heatmapCells.push(<div key={`empty-${i}`} className="heatmap-cell empty"></div>);
  }
  for (let day = 1; day <= totalDays; day++) {
    const level = getHeatmapLevel(day);
    const isToday = isCurrentMonth && day === currentRealDay;
    heatmapCells.push(
      <div key={`day-${day}`} className={`heatmap-cell level-${level}`} style={isToday ? { border: '2px solid #a855f7' } : {}}>
        {isToday ? day : ''}
      </div>
    );
  }

  if (loading) return <div className="container animate-fade" style={{ color: 'white' }}>Loading Insights...</div>;

  return (
    <div className="container animate-fade">
      <div className="insights-header">
        <h1 className="insights-title">Insights</h1>
        <p className="insights-subtitle">Your progress for {month} {year}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ border: '1px solid #334155' }}>
          <span className="stat-label" style={{ color: '#2dd4bf' }}>SUCCESS RATE</span>
          <div className="stat-value">{successRate}% <Activity size={18} color="#2dd4bf" /></div>
        </div>
        <div className="stat-card" style={{ border: '1px solid rgba(168, 85, 247, 0.3)' }}>
          <span className="stat-label">CURRENT STREAK</span>
          <div className="stat-value">{computedStreak} <span>days</span></div>
        </div>
      </div>

      <div className="quests-completed-card" style={{ border: '1px solid rgba(168, 85, 247, 0.2)' }}>
        <div className="quests-header">
          <span className="quests-label">QUESTS COMPLETED</span>
          <span className="quests-number">{totalCompletions}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${successRate}%` }}></div>
        </div>
        <div className="progress-text">{successRate}% of monthly goal</div>
      </div>

      <div className="heatmap-card">
        <div className="heatmap-header">
          <h2 className="heatmap-title">Consistency</h2>
          <div className="heatmap-month-badge">
            <Calendar size={16} /> {month.substring(0,3)} {year}
          </div>
        </div>

        <div className="heatmap-grid">
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={`head-${i}`} className="heatmap-day-header">{d}</div>
          ))}
          {heatmapCells}
        </div>

        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-colors">
            <div className="legend-box" style={{ background: '#334155' }}></div>
            <div className="legend-box" style={{ background: '#166534' }}></div>
            <div className="legend-box" style={{ background: '#22c55e' }}></div>
            <div className="legend-box" style={{ background: '#4ade80' }}></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Active Quests List */}
      <div className="active-quests-section" style={{ marginTop: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Active Quests</h3>
          <button 
            onClick={() => setModalOpen(true)}
            style={{ padding: '0.5rem 1rem', background: '#d8b4fe', border: 'none', color: '#0f172a', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Forge
          </button>
        </div>

        <div className="quests-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {habits.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#1e293b', borderRadius: '12px', border: '1px dashed #334155' }}>
              No active quests. Forge a new one to begin your journey!
            </div>
          )}
          {habits.map(habit => {
            const isCompletedToday = habit.data && habit.data[currentRealDay];
            return (
              <div key={habit.id} className="quest-card" style={{ background: '#1e293b', padding: '1rem', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className={`class-icon-small ${habit.attr}`} style={{ width: 40, height: 40, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>
                    {habit.attr === 'warrior' && <Sword size={20} color="#a78bfa" />}
                    {habit.attr === 'mage' && <Sparkles size={20} color="#2dd4bf" />}
                    {habit.attr === 'rogue' && <Activity size={20} color="#4ade80" />}
                  </div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>{habit.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'capitalize' }}>Class: {habit.attr} • Level: {habit.difficulty || 'Adept'}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {isCurrentMonth ? (
                    <button 
                      onClick={() => toggleDay(habit.id, currentRealDay)}
                      style={{ 
                        width: 36, height: 36, borderRadius: '8px', 
                        background: isCompletedToday ? '#2dd4bf' : '#0f172a',
                        border: isCompletedToday ? 'none' : '2px solid #334155',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                        boxShadow: isCompletedToday ? '0 0 10px rgba(45, 212, 191, 0.4)' : 'none'
                      }}
                    >
                      {isCompletedToday && <Zap size={16} color="#0f172a" fill="#0f172a" />}
                    </button>
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>View Only</div>
                  )}
                  <button onClick={() => deleteHabit(habit.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <button 
          onClick={onBack}
          style={{ padding: '1rem 1.5rem', background: 'transparent', border: '1px solid #334155', color: 'white', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', width: '100%' }}
        >
          Back to Chronicles
        </button>
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
  const [yearsList, setYearsList] = useState([2025, 2026]); 
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

  // Handlers
  const handleCreateYear = (year) => setYearsList([...yearsList, year]);
  const handleSelectYear = (year) => {
    setSelectedYear(year);
    setCurrentView('year-grid');
  };
  const handleSelectMonth = (month) => {
    setSelectedMonth(month);
    setCurrentView('month-tracker');
  };
  const handleSidebarNavigation = (destination) => setCurrentView(destination);

  if (loading) return <div style={{background: '#0f172a', height:'100vh', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>Loading Guild...</div>;
  if (!user) return <Login onLogin={setUser} />;

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
        <div className="mobile-header">
          <div className="avatar-circle">
            <UserIcon size={24} color="#94a3b8" />
          </div>
          <div className="mobile-header-title">Daily Rituals</div>
          <Settings size={24} color="#94a3b8" onClick={() => signOut(auth)} style={{cursor: 'pointer'}} />
        </div>

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
            <HomeDashboard years={yearsList} onCreateYear={handleCreateYear} onSelectYear={handleSelectYear} />
          )}

          {currentView === 'year-grid' && selectedYear && (
            <YearGrid year={selectedYear} onSelectMonth={handleSelectMonth} onBack={() => setCurrentView('home')} />
          )}

          {currentView === 'month-tracker' && selectedYear && selectedMonth && (
            <TrackerList year={selectedYear} month={selectedMonth} user={user} onBack={() => setCurrentView('year-grid')} />
          )}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="bottom-nav">
          <div className="bottom-nav-item" onClick={() => setCurrentView('home')}>
            <Calendar size={24} />
            <span>Today</span>
          </div>
          <div className="bottom-nav-item" onClick={() => setCurrentView('year-grid')}>
            <Award size={24} />
            <span>Quests</span>
          </div>
          <div className={`bottom-nav-item ${currentView === 'month-tracker' ? 'active' : ''}`} onClick={() => {}}>
            <Activity size={24} />
            <span>Insights</span>
          </div>
          <div className="bottom-nav-item">
            <UserIcon size={24} />
            <span>Profile</span>
          </div>
        </nav>
      </main>
    </div>
  );
}

export default App;