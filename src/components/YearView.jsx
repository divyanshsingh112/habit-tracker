import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react'; // Import Trash2
import illustration from '../assets/hero_ill.png'; // Ensure you have this or remove the image tag

export default function YearView({ years, store, onAddYear, onSelectYear, onDeleteYear }) {
  const [newYear, setNewYear] = useState('');

  // Calculate annual consistency for the card
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
      
      {/* HERO SECTION */}
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

          {/* YEAR CARDS GRID */}
          <div className="card-grid">
            {years.sort((a,b) => b-a).map(year => {
              const progress = getYearProgress(year);
              return (
                <div key={year} className="year-card" onClick={() => onSelectYear(year)}>
                  <div className="year-card-content">
                    <div className="year-card-top">
                      <h3>{year}</h3>
                      
                      {/* DELETE BUTTON */}
                      <button 
                        className="delete-year-icon"
                        onClick={(e) => { 
                          e.stopPropagation(); // Stop click from opening the year
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

        {/* HERO IMAGE */}
        <div className="year-right-column">
          {/* Replace src with your actual image path or variable */}
          <img src="public\hero.png" alt="Hero" className="hero-illustration" />
        </div>
      </div>
    </div>
  );
}