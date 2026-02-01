import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, CircleDashed } from 'lucide-react';

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function MonthView({ year, store, onSelectMonth }) {
  
  const getMonthHealth = (monthName) => {
    // 1. Get habits for this month from the store
    const monthData = store[year]?.[monthName];
    
    // 2. If no data, return 'none' status
    if (!monthData || monthData.length === 0) {
      return { status: 'none', icon: <CircleDashed size={20} /> };
    }

    let totalCompleted = 0;
    // Assume 30 days per habit for calculation
    const totalPossible = monthData.length * 30; 

    monthData.forEach(h => {
      // Add up all the completed days (keys in the map)
      totalCompleted += Object.keys(h.completedDays || {}).length;
    });

    const rate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

    // 3. Determine status based on rate
    if (rate >= 70) {
      return { status: 'healthy', icon: <CheckCircle2 size={20} className="health-icon healthy" /> };
    }
    if (rate >= 30) {
      return { status: 'warning', icon: <AlertCircle size={20} className="health-icon warning" /> };
    }
    
    return { status: 'critical', icon: <XCircle size={20} className="health-icon critical" /> };
  };

  return (
    <div className="view-container animate-fade">
      <header className="view-header">
        <h2>Months in {year}</h2>
        <p>Review your monthly performance status.</p>
      </header>

      <div className="card-grid months-grid">
        {MONTHS.map((m) => {
          // Pass 'store' to MonthView in App.jsx for this to work!
          const health = store ? getMonthHealth(m) : { status: 'none', icon: <CircleDashed size={20}/> };
          
          return (
            <div 
              key={m} 
              className={`selection-card month-card health-${health.status}`} 
              onClick={() => onSelectMonth(m)}
            >
              <div className="month-card-body">
                <h3>{m}</h3>
                <div className="health-indicator">
                  {health.icon}
                  <span className="health-label">
                    {health.status !== 'none' ? health.status : 'no data'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}