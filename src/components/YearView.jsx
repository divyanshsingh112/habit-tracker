import React, { useState } from 'react';
import { Plus, Calendar, ArrowRight } from 'lucide-react';

export default function YearView({ years, onAddYear, onSelectYear }) {
  const [input, setInput] = useState('');

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
          {years.sort().map(y => (
            <div key={y} className="year-card" onClick={() => onSelectYear(y)}>
              <div className="year-card-content">
                <div className="year-icon-box">
                  <Calendar size={28} />
                </div>
                <h3>{y}</h3>
                <p>View Progress</p>
              </div>
              <div className="year-card-action">
                <ArrowRight size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: HERO IMAGE */}
      <div className="year-right-column">
        {/* CORRECTED PATH BELOW: Just slash + filename */}
        <img 
          src="/hero.png" 
          alt="Habit Tracker Hero" 
          className="hero-illustration"
        />
      </div>
    </div>
  );
}