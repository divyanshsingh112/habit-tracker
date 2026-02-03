import React from 'react';
import { Check, Trash2, Sword, Brain, Sparkles, MessageCircle, HelpCircle } from 'lucide-react';

export default function TrackerView({ year, month, habits, onUpdate }) {
  
  // --- 1. ICON HELPER (The Fix) ---
  // We use (attr || 'str') to prevent the crash on old habits
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
        // Toggle Logic
        if (newDays[day]) {
           delete newDays[day];
        } else {
           // Save Timestamp for AI analysis later
           newDays[day] = new Date().toISOString(); 
        }
        return { ...h, completedDays: newDays };
      }
      return h;
    });
    onUpdate(updated);
  };

  const deleteHabit = (id) => {
    if (window.confirm('Delete this quest?')) {
      const updated = habits.filter(h => h.id !== id);
      onUpdate(updated);
    }
  };

  if (!habits || habits.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon-bg">⚔️</div>
        <h3>No Quests Yet</h3>
        <p>Start your adventure by adding a new quest above.</p>
      </div>
    );
  }

  return (
    <div className="tracker-card animate-slide-up">
      <div className="grid-container">
        {/* Header Row */}
        <div className="grid-row header">
          <div className="col-name">QUEST</div>
          <div className="col-days">
            {daysArray.map(d => (
              <div key={d} className="day-header">{d}</div>
            ))}
          </div>
          <div className="col-stats">STATS</div>
        </div>

        {/* Habit Rows */}
        {habits.map(habit => {
          const completedCount = habit.completedDays ? Object.keys(habit.completedDays).length : 0;
          const progress = Math.round((completedCount / daysInMonth) * 100);
          
          return (
            <div key={habit.id} className="grid-row">
              {/* 1. Name & Icon */}
              <div className="col-name">
                <div className="habit-identity">
                  {getAttributeIcon(habit.attribute)}
                  <span className="habit-text">{habit.name}</span>
                </div>
                <button className="delete-mini-btn" onClick={() => deleteHabit(habit.id)}>
                  <Trash2 size={14} />
                </button>
              </div>

              {/* 2. Checkboxes */}
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

              {/* 3. Progress Bar */}
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
    </div>
  );
}