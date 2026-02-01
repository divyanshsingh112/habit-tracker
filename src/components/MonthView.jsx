import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, CircleDashed } from 'lucide-react';

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

/**
 * MonthView Component
 * Features "Health Check" status icons to summarize performance at a glance.
 */
export default function MonthView({ year, store, onSelectMonth }) {
  
  const getMonthHealth = (monthName) => {
    const monthData = store[year]?.[monthName];
    
    // 1. Check if data exists for this month
    if (!monthData || monthData.length === 0) {
      return { 
        status: 'none', 
        icon: <CircleDashed size={20} /> 
      };
    }

    let totalCompleted = 0;
    // We calculate health based on an average 30-day capacity
    const totalPossible = monthData.length * 30; 

    monthData.forEach(h => {
      // Aggregate completed days from the Map/Object
      totalCompleted += Object.keys(h.completedDays || {}).length;
    });

    const rate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

    // 2. Return status object based on completion rate
    if (rate >= 70) {
      return { 
        status: 'healthy', 
        icon: <CheckCircle2 size={20} className="health-icon healthy" /> 
      };
    }
    
    if (rate >= 30) {
      return { 
        status: 'warning', 
        icon: <AlertCircle size={20} className="health-icon warning" /> 
      };
    }

    // FIX: Corrected object return (removed the stray semicolon from previous version)
    return { 
      status: 'critical', 
      icon: <XCircle size={20} className="health-icon critical" /> 
    };
  };

  return (
    <div className="view-container animate-fade">
      <header className="view-header">
        <h2>Months in {year}</h2>
        <p>Review your monthly performance status.</p>
      </header>

      <div className="card-grid months-grid">
        {MONTHS.map((m) => {
          const health = getMonthHealth(m);
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