import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  LayoutGrid, Calendar, ChevronLeft, LogOut, Plus, X, 
  Sword, Sparkles, Activity, Clock, Zap, Flame, Settings, User as UserIcon, Award
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase'; 
import Login from './components/Login'; 

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
          const isPast = year < currentYear;
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
                <span>{isPast ? '75' : '0'}%</span>
              </div>
              <div style={{height: '5px', background: '#0f172a', borderRadius: '5px', overflow: 'hidden', marginBottom: '1rem'}}>
                <div style={{ width: isPast ? '75%' : '0%', height: '100%', background: 'linear-gradient(90deg, #6366f1, #a78bfa)', borderRadius: '5px' }}></div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: isPast ? '#a855f7' : '#64748b'}}>
                <Flame size={14} />
                <span>{isPast ? '324 Day Streak' : 'Upcoming'}</span>
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
const TrackerList = ({ year, month, user, onBack, onOpenNewQuest }) => {
  // Generate Days Data
  const getDaysInMonth = (monthName, yearVal) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = months.indexOf(monthName);
    return new Date(yearVal, monthIndex + 1, 0).getDate();
  };

  const totalDays = getDaysInMonth(month, year);
  
  // Dummy logic to match the Heatmap exactly as shown in the screenshot
  const getHeatmapLevel = (day) => {
    if (day === 22 || day === 4) return 3; // Bright green
    if (day % 7 === 0) return 0; // Empty
    if (day % 3 === 0) return 2; // Mid green
    if (day % 2 === 0) return 1; // Dark green
    return 0; // Default empty
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthIndex = months.indexOf(month);
  const firstDay = new Date(year, monthIndex, 1).getDay(); // 0 is Sunday
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Offset to start Mon

  const heatmapCells = [];
  for (let i = 0; i < startOffset; i++) {
    heatmapCells.push(<div key={`empty-${i}`} className="heatmap-cell empty"></div>);
  }
  for (let day = 1; day <= totalDays; day++) {
    const level = getHeatmapLevel(day);
    heatmapCells.push(
      <div key={`day-${day}`} className={`heatmap-cell level-${level}`}>
        {day === 4 || day === 22 ? day : ''}
      </div>
    );
  }

  return (
    <div className="container animate-fade">
      <div className="insights-header">
        <h1 className="insights-title">Insights</h1>
        <p className="insights-subtitle">Your progress for {month} {year}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ border: '1px solid #334155' }}>
          <span className="stat-label" style={{ color: '#2dd4bf' }}>SUCCESS RATE</span>
          <div className="stat-value">87% <Activity size={18} color="#2dd4bf" /></div>
        </div>
        <div className="stat-card" style={{ border: '1px solid rgba(168, 85, 247, 0.3)' }}>
          <span className="stat-label">LONGEST STREAK</span>
          <div className="stat-value">14 <span>days</span></div>
        </div>
      </div>

      <div className="quests-completed-card" style={{ border: '1px solid rgba(168, 85, 247, 0.2)' }}>
        <div className="quests-header">
          <span className="quests-label">QUESTS COMPLETED</span>
          <span className="quests-number">142</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: '75%' }}></div>
        </div>
        <div className="progress-text">75% of monthly goal</div>
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
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <button 
          onClick={onOpenNewQuest}
          style={{ padding: '1rem 1.5rem', background: '#d8b4fe', border: 'none', color: '#0f172a', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={20} /> Forge New Quest
        </button>
        <button 
          onClick={onBack}
          style={{ padding: '1rem 1.5rem', background: 'transparent', border: '1px solid #334155', color: 'white', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', width: '100%' }}
        >
          Back to Chronicles
        </button>
      </div>
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
  
  // Modal State
  const [isModalOpen, setModalOpen] = useState(false);

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

  const handleCreateQuest = async (name, attr, difficulty) => {
    // Integration logic here - right now just visual testing
    console.log("Created Quest:", { name, attr, difficulty });
    setModalOpen(false);
  };

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
            <TrackerList year={selectedYear} month={selectedMonth} user={user} onBack={() => setCurrentView('year-grid')} onOpenNewQuest={() => setModalOpen(true)} />
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

      <NewHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleCreateQuest} 
      />
    </div>
  );
}

export default App;