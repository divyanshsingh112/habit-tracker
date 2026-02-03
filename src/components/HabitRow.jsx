import React from 'react';
import { Trash2, Flame } from 'lucide-react';

/**
 * HabitRow Component
 * Updated with a "Current Streak" calculation to drive user consistency.
 */
export const HabitRow = ({ habit, days, onToggle, onDelete }) => {
  // 1. Calculate success rate for the month
  const completedCount = Object.keys(habit.completedDays || {}).length;
  const successRate = days.length > 0 
    ? Math.round((completedCount / days.length) * 100) 
    : 0;

  // 2. Calculate Current Streak
  // We look at the daysArray (1-31) and count backward from the current day
  const calculateStreak = () => {
    const today = new Date().getDate();
    let streak = 0;
    // Iterate backwards from today to the 1st of the month
    for (let i = today; i > 0; i--) {
      if (habit.completedDays?.[i]) {
        streak++;
      } else if (i === today) {
        // If today isn't done, the streak might still be alive from yesterday
        continue; 
      } else {
        // Streak broken
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  return (
    <div className="habit-row animate-fade">
      <div className="h-col">
        <div className="habit-info">
          <div className="habit-title">
            {habit.name}
            {currentStreak >= 3 && (
              <span className="streak-badge" title="Current Streak">
                <Flame size={12} fill="orange" stroke="orange" /> {currentStreak}
              </span>
            )}
          </div>
          <span className={`cat-tag cat-${habit.category.toLowerCase()}`}>
            {habit.category}
          </span>
        </div>
        <button 
          className="delete-btn" 
          onClick={() => onDelete(habit.id)}
          title="Delete Habit"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="d-col">
        {days.map(day => (
          <div 
            key={day}
            className={`check-box ${habit.completedDays?.[day] ? 'active' : ''}`}
            onClick={() => onToggle(habit.id, day)}
          />
        ))}
      </div>

      <div className="s-col">
        <div className="progress-pill">
          {successRate}%
        </div>
      </div>
    </div>
  );
};

export default HabitRow;