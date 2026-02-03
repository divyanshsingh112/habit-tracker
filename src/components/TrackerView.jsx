import React, { useMemo } from 'react';
import { 
  Check, Trash2, Sword, Brain, Sparkles, MessageCircle, 
  Flame, Trophy, Quote, Info 
} from 'lucide-react';

export default function TrackerView({ year, month, habits, onUpdate }) {
  
  // --- HELPER: Action-Based Streak Logic (Anti-Backfill) ---
  const globalStreak = useMemo(() => {
    let maxStreak = 0;

    habits.forEach(habit => {
      if (!habit.completedDays) return;

      // 1. Extract TIMESTAMPS (When did you actually click the button?)
      const timestamps = Object.values(habit.completedDays);
      
      // 2. Convert to Unique Dates (e.g., "Mon Feb 03 2026")
      // This collapses multiple checks on the same day into ONE "Action Day"
      const actionDates = new Set(
        timestamps.map(ts => new Date(ts).toDateString())
      );

      // 3. Count Consecutive Action Days (Backwards from Today)
      let currentStreak = 0;
      const checkDate = new Date(); // Start with Today

      // Check Today
      let hasDate = actionDates.has(checkDate.toDateString());
      
      // If no action Today, check Yesterday (maybe you just haven't started yet today)
      if (!hasDate) {
         checkDate.setDate(checkDate.getDate() - 1);
         hasDate = actionDates.has(checkDate.toDateString());
      }

      // If we found a start point (Today or Yesterday), count backwards
      if (hasDate) {
        currentStreak = 1;
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1); // Go back 1 day
          if (actionDates.has(checkDate.toDateString())) {
            currentStreak++;
          } else {
            break; // Gap found, stop counting
          }
        }
      }

      // The Global Streak is the BEST streak among all your habits
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    });

    return maxStreak;
  }, [habits]);

  // --- HELPER: Top 3 Leaderboard (By Total Count) ---
  const topQuests = useMemo(() => {
    return [...habits]
      .sort((a, b) => {
        const countA = a.completedDays ? Object.keys(a.completedDays).length : 0;
        const countB = b.completedDays ? Object.keys(b.completedDays).length : 0;
        
        // 1. Primary Sort: Total Days Completed (Descending)
        if (countB !== countA) return countB - countA;
        
        // 2. Secondary Sort: Creation Date (Ascending) - Older habits win ties
        return a.id - b.id; 
      })
      .slice(0, 3); 
  }, [habits]);

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
    let activeAttribute = null;

    const updated = habits.map(h => {
      if (h.id === habitId) {
        const newDays = { ...h.completedDays };
        if (newDays[day]) {
            delete newDays[day];
        } else {
            // CRITICAL: We save the TIMESTAMP. This enables the "Action Streak".
            newDays[day] = new Date().toISOString(); 
            activeAttribute = h.attribute || 'str'; 
        }
        return { ...h, completedDays: newDays };
      }
      return h;
    });
    
    onUpdate(updated, activeAttribute);
  };

  const deleteHabit = (id) => {
    if (window.confirm('Abandon this quest?')) {
      onUpdate(habits.filter(h => h.id !== id));
    }
  };

  return (
    <div className="tracker-wrapper animate-slide-up">
      
      {/* Stats Legend */}
      <div className="stats-legend-row">
        <div className="legend-pill warrior"><Sword size={12} /> <span>STR = Health</span></div>
        <div className="legend-pill mage"><Brain size={12} /> <span>INT = Learn</span></div>
        <div className="legend-pill monk"><Sparkles size={12} /> <span>WIS = Mind</span></div>
        <div className="legend-pill bard"><MessageCircle size={12} /> <span>CHA = Social</span></div>
      </div>

      {/* Dashboard */}
      <div className="dashboard-grid">
        
        {/* Quote */}
        <div className="dash-card quote-card">
          <Quote size={20} className="quote-icon" />
          <p>"{quote}"</p>
        </div>

        {/* Action Streak */}
        <div className={`dash-card streak-card ${globalStreak >= 3 ? 'active-streak' : ''}`}>
          <div className="card-icon-bg"><Flame size={20} /></div>
          <div style={{ flex: 1 }}>
            <span className="card-label">Consistency Streak</span>
            <div className="card-value">
              {globalStreak >= 3 ? `${globalStreak} Days` : <span style={{fontSize:'16px', color:'#94a3b8'}}>Igniting... ({globalStreak}/3)</span>}
            </div>
            <div className="streak-explainer">
              <Info size={10} style={{ marginRight: 4 }}/> 
              Counts consecutive days you took action
            </div>
          </div>
        </div>

        {/* Leaderboard */}
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

      {/* Grid */}
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