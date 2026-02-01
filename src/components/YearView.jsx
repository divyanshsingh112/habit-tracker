import React, { useState } from 'react';
import { Plus, Calendar, ArrowRight, Target } from 'lucide-react';

/**
 * YearView Component
 * Enhanced with Progress Bars to visualize yearly consistency.
 */
export default function YearView({ years, store, onAddYear, onSelectYear }) {
  const [input, setInput] = useState('');

  // Calculate the average completion for a specific year based on store data
  const getYearlyProgress = (year) => {
    const yearData = store[year];
    if (!yearData || Object.keys(yearData).length === 0) return 0;

    let totalPercentage = 0;
    let monthsWithData = 0;

    Object.values(yearData).forEach(monthHabits => {
      if (Array.isArray(monthHabits) && monthHabits.length > 0) {
        let monthCompletion = 0;
        monthHabits.forEach(h => {
          const daysInMonth = 30; // Approximation for overview
          const completed = Object.keys(h.completedDays || {}).length;
          monthCompletion += (completed / daysInMonth);
        });
        totalPercentage += (monthCompletion / monthHabits.length);
        monthsWithData++;
      }
    });

    return monthsWithData > 0 ? Math.round((totalPercentage / monthsWithData) * 100) : 0;
  };

  return (
    <div className="year-view-split animate-fade">
      {/* LEFT SIDE: INPUTS AND GRID */}
      <div className="year-left-column">
        <header className="view-header">
          <h2>Select Year</h2>
          <div className="input-group-modern">
            <input 
              type="number" 
              placeholder="YYYY" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
            />
            <button onClick={() => { onAddYear(input); setInput(''); }}>
              <Plus size={18}/> Create
            </button>
          </div>
        </header>
        
        <div className="card-grid">
          {years.sort().reverse().map(y => {
            const progress = getYearlyProgress(y);
            return (
              <div key={y} className="year-card" onClick={() => onSelectYear(y)}>
                <div className="year-card-content">
                  <div className="year-card-top">
                    <div className="year-icon-box">
                      <Calendar size={28} />
                    </div>
                    {progress > 50 && (
                      <div className="trending-tag">
                        <Target size={12} /> High Focus
                      </div>
                    )}
                  </div>
                  <h3>{y}</h3>
                  
                  {/* Progress Indicator */}
                  <div className="year-progress-container">
                    <div className="progress-labels">
                      <span>Annual Consistency</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="year-progress-bar">
                      <div 
                        className="year-progress-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="year-card-action">
                  <span>View Details</span>
                  <ArrowRight size={20} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE: HERO IMAGE */}
      <div className="year-right-column">
        <img 
          src="/hero.png" 
          alt="Habit Tracker Hero" 
          className="hero-illustration"
        />
      </div>
    </div>
  );
}