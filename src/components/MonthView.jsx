import React from 'react';

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function MonthView({ year, onSelectMonth }) {
  return (
    <div className="view-container animate-fade">
      <header className="view-header">
        <h2>Months in {year}</h2>
      </header>

      {/* Grid Layout for Months */}
      <div className="card-grid months-grid">
        {MONTHS.map((m) => (
          <div 
            key={m} 
            className="selection-card month-card" 
            onClick={() => onSelectMonth(m)}
          >
            <h3>{m}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}