import React, { useMemo } from 'react';
import { 
  Check, Trash2, Sword, Brain, Sparkles, MessageCircle, 
  Flame, Trophy, Quote, Info 
} from 'lucide-react';

export default function TrackerView({ year, month, habits, onUpdate }) {
  
  // --- HELPER: Smart Streak Logic (Counts from Last Active Day) ---
  const globalStreak = useMemo(() => {
    const activeDates = new Set();
    let maxDay = 0;

    // 1. Find all active days and the latest day anyone checked a box
    habits.forEach(h => {
        if(h.completedDays) {
            Object.keys(h.completedDays).forEach(day => {
                const d = parseInt(day);
                activeDates.add(d);
                if (d > maxDay) maxDay = d; 
            });
        }
    });

    if (maxDay === 0) return 0;

    // 2. Count backwards from the LAST ACTIVE DAY
    let streak = 0;
    let checkDay = maxDay; 

    while (activeDates.has(checkDay)) {
        streak++;
        checkDay--;
        if (checkDay < 1) break; 
    }
    return streak;
  }, [habits]);

  // --- HELPER: Top 3 Leaderboard ---
  const topQuests = useMemo(() => {
    return [...habits]
      .sort((a, b) => {
        const countA = a.completedDays ? Object.keys(a.completedDays).length : 0;
        const countB = b.completedDays ? Object.keys(b.completedDays).length : 0;
        
        // 1. Primary Sort: Count (Descending)
        if (countB !== countA) return countB - countA;
        
        // 2. Secondary Sort: Creation Date/ID (Ascending) - Older habits win ties
        return a.id - b.id; 
      })
      .slice(0, 3); // Get Top 3
  }, [habits]);

  // --- HELPER: Random RPG Quote ---
  const quote = useMemo(() => {
    const quotes = [
      "A hero is made in the quiet moments.",
      "Consistency is the sword that slays the dragon.",
      "Every checkmark is a step towards greatness.",
      "Leveling up happens one day at a time.",
      "Discipline is choosing what you want most over what you want now."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, []); 

  // --- HELPER: Icon Mapping ---
  const getAttributeIcon = (attr) => {
    const safeAttr = (attr || 'str').toLowerCase(); 
    switch (safeAttr) {
      case 'str': return <Sword size={16} className="rpg-icon warrior" />;
      case 'int': return <Brain size={16} className="rpg-icon mage" />;
      case 'wis': return <Sparkles size={16} className="rpg-icon monk" />;
      case 'cha': return <MessageCircle size={16} className="rpg-icon bard" />;
      default: return <Sword size={16} className="rpg-icon warrior" />;
    }
  };

  const daysInMonth = new Date(year, new Date(`${month} 1, 2000`).getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // --- MAIN LOGIC UPDATE: Passing Attribute ---
  const toggleDay = (habitId, day) => {
    let activeAttribute = null; // Will store 'str', 'int', etc. if checked

    const updated = habits.map(h => {
      if (h.id === habitId) {
        const newDays = { ...h.completedDays };
        if (newDays[day]) {
            // Unchecking
            delete newDays[day];
        } else {
            // Checking -> Capture Attribute to send to App.jsx
            newDays[day] = new Date().toISOString();
            activeAttribute = h.attribute || 'str'; 
        }
        return { ...h, completedDays: newDays };
      }
      return h;
    });
    
    // Pass BOTH the list and the attribute of the habit we just checked
    onUpdate(updated, activeAttribute);
  };

  const deleteHabit = (id) => {
    if (window.confirm('Abandon this quest?')) {
      onUpdate(habits.filter(h => h.id !== id));
    }
  };

  return (
    <div className="tracker-wrapper animate-slide-up">
      
      {/* 1. STATS LEGEND */}
      <div className="stats-legend-row">
        <div className="legend-pill warrior"><Sword size={12} /> <span>STR = Health</span></div>
        <div className="legend-pill mage"><Brain size={12} /> <span>INT = Learn</span></div>
        <div className="legend-pill monk"><Sparkles size={12} /> <span>WIS = Mind</span></div>
        <div className="legend-pill bard"><MessageCircle size={12} /> <span>CHA = Social</span></div>
      </div>

      {/* 2. DASHBOARD GRID */}
      <div className="dashboard-grid">
        
        {/* Quote Card */}
        <div className="dash-card quote-card">
          <Quote size={20} className="quote-icon" />
          <p>"{quote}"</p>
        </div>

        {/* Smart Streak Card */}
        <div className={`dash-card streak-card ${globalStreak >= 3 ? 'active-streak' : ''}`}>
          <div className="card-icon-bg"><Flame size={20} /></div>
          <div style={{ flex: 1 }}>
            <span className="card-label">Current Streak</span>
            <div className="card-value">
              {globalStreak >= 3 ? `${globalStreak} Days` : <span style={{fontSize:'16px', color:'#94a3b8'}}>Igniting... ({globalStreak}/3)</span>}
            </div>
            {/* Explainer Text */}
            <div className="streak-explainer">
              <Info size={10} style={{ marginRight: 4 }}/> 
              Based on your last active day
            </div>
          </div>
        </div>

        {/* Top 3 Leaderboard Card */}
        <div className="dash-card top-card">
           <div className="card-icon-bg purple"><Trophy size={20} /></div>
           <div style={{ width: '100%' }}>
             <span className="card-label">Top Quests</span>
             <div className="leaderboard-list">
                {topQuests.length === 0 ? (
                  <div className="leader-row empty">No Data</div>
                ) : (
                  topQuests.map((quest, index) => {
                     const count = quest.completedDays ? Object.keys(quest.completedDays).length : 0;
                     return (
                       <div key={quest.id} className="leader-row">
                         <span className="rank">#{index + 1}</span>
                         <span className="name">{quest.name}</span>
                         <span className="count">{count}</span>
                       </div>
                     );
                  })
                )}
             </div>
           </div>
        </div>
      </div>

      {/* 3. THE TRACKER GRID */}
      <div className="tracker-card">
        {habits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-bg">⚔️</div>
            <h3>Quest Log Empty</h3>
            <p>Add a new quest to begin your journey.</p>
          </div>
        ) : (
          <div className="grid-container">
            <div className="grid-row header">
              <div className="col-name">QUEST</div>
              <div className="col-days">
                {daysArray.map(d => (
                  <div key={d} className={`day-header ${d === new Date().getDate() ? 'today' : ''}`}>{d}</div>
                ))}
              </div>
              <div className="col-stats">STATS</div>
            </div>

            {habits.map(habit => {
              const completedCount = habit.completedDays ? Object.keys(habit.completedDays).length : 0;
              const progress = Math.round((completedCount / daysInMonth) * 100);
              
              return (
                <div key={habit.id} className="grid-row">
                  <div className="col-name">
                    <div className="habit-identity">
                      {getAttributeIcon(habit.attribute)}
                      <span className="habit-text">{habit.name}</span>
                    </div>
                    <button className="delete-mini-btn" onClick={() => deleteHabit(habit.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="col-days">
                    {daysArray.map(day => {
                      const isCompleted = habit.completedDays && habit.completedDays[day];
                      return (
                        <div 
                          key={day}
                          className={`checkbox ${isCompleted ? 'checked' : ''} ${habit.attribute || 'str'}`}
                          onClick={() => toggleDay(habit.id, day)}
                        >
                          {isCompleted && <Check size={12} strokeWidth={4} />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="col-stats">
                    <div className="mini-progress-wrapper">
                      <div className="mini-progress-bar">
                        <div 
                          className={`mini-progress-fill ${habit.attribute || 'str'}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="mini-percent">{progress}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}