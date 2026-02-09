import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function YearView({ store, onAddYear, onSelectYear, onDeleteYear }) {
  const [newYear, setNewYear] = useState('');

  // 1. 🔥 FIX: Derive 'years' from the store keys automatically
  // This prevents the "undefined" error if the parent doesn't pass a list
  const years = Object.keys(store || {}).sort((a, b) => b - a);

  // --- CONSISTENCY CALCULATOR ---
  const getYearProgress = (year) => {
    const yearData = store[year];
    if (!yearData) return 0;
    
    let totalPossible = 0;
    let totalCompleted = 0;
    
    Object.entries(yearData).forEach(([monthName, habits]) => {
      // Calculate days in specific month (e.g., Feb 2026 = 28)
      const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      
      habits.forEach(h => {
        totalPossible += daysInMonth;
        if (h.completedDays) {
           // Count only valid days
           const validChecks = Object.keys(h.completedDays).filter(dayKey => {
             const dayNum = parseInt(dayKey, 10);
             return !isNaN(dayNum) && dayNum >= 1 && dayNum <= daysInMonth;
           });
           totalCompleted += validChecks.length;
        }
      });
    });

    return totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (newYear && !years.includes(newYear)) {
      onAddYear(newYear);
      setNewYear('');
    }
  };

  return (
    <div className="year-view-container animate-fade">
      {/* LEFT COLUMN: Year Grid */}
      <div className="year-left-column">
        <h2 style={{ marginBottom: '24px' }}>Select Year</h2>
        
        <div className="card-grid years-grid">
          {/* Add Year Card */}
          <div className="add-card">
            <form onSubmit={handleAdd}>
              <input 
                type="number" 
                placeholder="2026"
                className="add-year-input"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
              />
              <button type="submit" style={{display:'none'}}>Add</button>
            </form>
          </div>

          {/* Render Years */}
          {years.map(year => {
            const progress = getYearProgress(year);
            return (
              <div 
                key={year} 
                className="year-card"
                onClick={() => onSelectYear(year)}
              >
                <div className="year-card-content">
                  <div className="year-card-top">
                    <h3>{year}</h3>
                    <button 
                      className="delete-year-icon"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if(confirm(`Delete ${year} and all its data?`)) {
                          onDeleteYear(year); 
                        }
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

      {/* RIGHT COLUMN: Hero Image */}
      <div className="year-right-column">
        <img 
          src="/hero.png" 
          alt="Hero Illustration" 
          className="hero-illustration" 
        />
      </div>
    </div>
  );
}