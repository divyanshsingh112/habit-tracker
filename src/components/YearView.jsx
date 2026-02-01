import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

// --- BROKEN IMPORT REMOVED --- 

export default function YearView({ years, store, onAddYear, onSelectYear, onDeleteYear }) {
  const [newYear, setNewYear] = useState('');

  const getYearProgress = (year) => {
    const yearData = store[year];
    if (!yearData) return 0;
    
    let totalHabits = 0;
    let totalCompleted = 0;
    
    Object.values(yearData).forEach(habits => {
      habits.forEach(h => {
        totalHabits += 30; // Approx baseline
        totalCompleted += Object.keys(h.completedDays || {}).length;
      });
    });

    return totalHabits === 0 ? 0 : Math.round((totalCompleted / totalHabits) * 100);
  };

  return (
    <div className="view-container animate-fade">
      
      <div className="year-view-split">
        <div className="year-left-column">
          <header className="view-header">
            <h2>Select Year</h2>
            <div className="input-group-modern">
              <input 
                type="number" 
                placeholder="YYYY" 
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
              />
              <button onClick={() => { if(newYear) onAddYear(newYear); setNewYear(''); }}>
                <Plus size={18} /> Create
              </button>
            </div>
          </header>

          <div className="card-grid">
            {years.sort((a,b) => b-a).map(year => {
              const progress = getYearProgress(year);
              return (
                <div key={year} className="year-card" onClick={() => onSelectYear(year)}>
                  <div className="year-card-content">
                    <div className="year-card-top">
                      <h3>{year}</h3>
                      <button 
                        className="delete-year-icon"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onDeleteYear(year); 
                        }}
                        title="Delete Year"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="year-stats">
                      <span>Annual Consistency</span>
                      <span style={{fontWeight:'700'}}>{progress}%</span>
                    </div>
                    <div className="year-progress-bar">
                      <div className="year-progress-fill" style={{width: `${progress}%`}}></div>
                    </div>
                  </div>
                  
                  <div className="year-card-action">
                    <span>View Details</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HERO IMAGE (Uses online URL, so no import needed) */}
        <div className="year-right-column">
          <img 
            src="https://cdni.iconscout.com/illustration/premium/thumb/habit-tracker-illustration-download-in-svg-png-gif-file-formats--routine-checklist-daily-task-business-pack-illustrations-3693863.png" 
            alt="Hero" 
            className="hero-illustration" 
          />
        </div>
      </div>
    </div>
  );
}