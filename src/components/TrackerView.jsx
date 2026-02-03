import React, { useMemo } from 'react';
import { 
  Check, Trash2, Sword, Brain, Sparkles, MessageCircle, 
  Flame, Trophy, Quote 
} from 'lucide-react';

export default function TrackerView({ year, month, habits, onUpdate }) {
  
  // --- HELPER: Calculate Streak (Global) ---
  const globalStreak = useMemo(() => {
    // 1. Collect all dates where AT LEAST ONE habit was done
    const activeDates = new Set();
    habits.forEach(h => {
        if(h.completedDays) {
            Object.keys(h.completedDays).forEach(day => activeDates.add(parseInt(day)));
        }
    });

    // 2. Count backwards from today
    let streak = 0;
    const today = new Date().getDate();
    // Check today, then yesterday, etc.
    // (Simplified logic: checks consecutive days present in the month)
    let checkDay = today;
    
    // If today is empty, check if yesterday was active to continue streak
    if (!activeDates.has(today) && activeDates.has(today - 1)) {
        checkDay = today - 1;
    }

    while (activeDates.has(checkDay)) {
        streak++;
        checkDay--;
        if (checkDay < 1) break; // Stop if we hit start of month
    }
    return streak;
  }, [habits]);

  // --- HELPER: Top Performing Quests ---
  const topQuests = useMemo(() => {
    return [...habits]
      .sort((a, b) => {
        const countA = a.completedDays ? Object.keys(a.completedDays).length : 0;
        const countB = b.completedDays ? Object.keys(b.completedDays).length : 0;
        return countB - countA; // Descending
      })
      .slice(0, 3); // Top 3
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
  }, []); // Empty dependency = calculated once on mount

  // --- ICON HELPER ---
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

  const toggleDay = (habitId, day) => {
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const newDays = { ...h.completedDays };
        if (newDays[day]) delete newDays[day];
        else newDays[day] = new Date().toISOString(); 
        return { ...h, completedDays: newDays };
      }
      return h;
    });
    onUpdate(updated);
  };

  const deleteHabit = (id) => {
    if (window.confirm('Abandon this quest?')) {
      onUpdate(habits.filter(h => h.id !== id));
    }
  };

  // --- RENDER ---
  return (
    <div className="tracker-wrapper animate-slide-up">
      
      {/* --- NEW: COMPACT STATS LEGEND --- */}
      <div className="stats-legend-row">
        <div className="legend-pill warrior"><Sword size={12} /> <span>STR = Health</span></div>
        <div className="legend-pill mage"><Brain size={12} /> <span>INT = Learn</span></div>
        <div className="legend-pill monk"><Sparkles size={12} /> <span>WIS = Mind</span></div>
        <div className="legend-pill bard"><MessageCircle size={12} /> <span>CHA = Social</span></div>
      </div>

      {/* 1. DASHBOARD HEADER */}
      <div className="dashboard-grid">
        
        {/* Card A: The Quote */}
        <div className="dash-card quote-card">
          <Quote size={20} className="quote-icon" />
          <p>"{quote}"</p>
        </div>

        {/* Card B: The Streak (Rule: Only show > 3) */}
        <div className={`dash-card streak-card ${globalStreak >= 3 ? 'active-streak' : ''}`}>
          <div className="card-icon-bg"><Flame size={20} /></div>
          <div>
            <span className="card-label">Daily Streak</span>
            <div className="card-value">
              {globalStreak >= 3 ? `${globalStreak} Days` : <span style={{fontSize:'14px', color:'#94a3b8'}}>Igniting... ({globalStreak}/3)</span>}
            </div>
          </div>
        </div>

        {/* Card C: Top Quest */}
        <div className="dash-card top-card">
           <div className="card-icon-bg purple"><Trophy size={20} /></div>
           <div>
             <span className="card-label">Top Quest</span>
             <div className="card-value small">
                {topQuests[0] ? topQuests[0].name : "No Data"}
             </div>
           </div>
        </div>
      </div>

      {/* 2. THE GRID (Existing Logic) */}
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