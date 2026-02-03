import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function YearView({ years, store, onAddYear, onSelectYear, onDeleteYear }) {
  const [newYear, setNewYear] = useState('');

  // --- FIXED: ROBUST CONSISTENCY CALCULATOR ---
  const getYearProgress = (year) => {
    const yearData = store[year];
    if (!yearData) return 0;
    
    let totalPossible = 0;
    let totalCompleted = 0;
    
    // Iterate through each month present in the data
    Object.entries(yearData).forEach(([monthName, habits]) => {
      // 1. Calculate exact days in this specific month (e.g., Feb 2026 = 28)
      const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      
      habits.forEach(h => {
        // Add total possible checkmarks for this habit
        totalPossible += daysInMonth;

        // 2. Count ONLY valid checkmarks (Keys "1" to "31")
        if (h.completedDays) {
           const validChecks = Object.keys(h.completedDays).filter(dayKey => {
             const dayNum = parseInt(dayKey, 10);
             return !isNaN(dayNum) && dayNum >= 1 && dayNum <= 31;
           }).length;
           
           totalCompleted += validChecks;
        }
      });
    });

    if (totalPossible === 0) return 0;

    // 3. Calculate percentage and CLAMP at 100%
    const percentage = Math.round((totalCompleted / totalPossible) * 100);
    return Math.min(100, percentage);
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

        {/* Hero Image */}
        <div className="year-right-column">
          <img 
            src="/hero.png" 
            alt="Hero Illustration" 
            className="hero-illustration" 
          />
        </div>
      </div>
    </div>
  );
}