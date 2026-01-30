import { Trash2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export const HabitRow = ({ habit, days, onToggle, onDelete, successRate }) => (
  <div className="habit-row">
    <div className="h-col">
      <div>
        <div className="habit-title">{habit.name}</div>
        <div className={`cat-tag cat-${habit.category.toLowerCase()}`}>{habit.category}</div>
      </div>
      <button className="delete-btn" onClick={() => onDelete(habit.id)}><Trash2 size={14}/></button>
    </div>
    <div className="d-col">
      {days.map(day => {
        const dStr = format(day, 'yyyy-MM-dd');
        const done = habit.completed[dStr];
        return (
          <div 
            key={dStr} 
            className={`check-box ${done ? 'active' : ''}`}
            onClick={() => onToggle(habit.id, dStr)}
          >
            {done && <CheckCircle2 size={18} color="white" />}
          </div>
        );
      })}
    </div>
    <div className="s-col">
      <div className="progress-pill">{successRate}%</div>
    </div>
  </div>
);