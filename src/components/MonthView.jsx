import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, CircleDashed } from 'lucide-react';

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function MonthView({ year, store, onSelectMonth }) {
  
  const getMonthHealth = (monthName) => {
    const monthData = store[year]?.[monthName];
    
    // If no data
    if (!monthData || monthData.length === 0) {
      return { status: 'none', icon: <CircleDashed size={20} /> };
    }

    let totalCompleted = 0;
    const totalPossible = monthData.length * 30; // Approx baseline

    monthData.forEach(h => {
      totalCompleted += Object.keys(h.completedDays || {}).length;
    });

    const rate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

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
      
      {/* HEADER WITH LEGEND */}
      <div className="view-header-split">
        <div className="header-text-group">
          <h2>Months in {year}</h2>
          <p>Review your monthly performance status.</p>
        </div>

        {/* COMPACT LEGEND */}
        <div className="status-legend">
          <div className="legend-item">
            <CheckCircle2 size={14} className="healthy"/> 
            <span>&gt; 70%</span>
          </div>
          <div className="legend-item">
            <AlertCircle size={14} className="warning"/> 
            <span>30-70%</span>
          </div>
          <div className="legend-item">
            <XCircle size={14} className="critical"/> 
            <span>&lt; 30%</span>
          </div>
        </div>
      </div>

      <div className="card-grid months-grid">
        {MONTHS.map((m) => {
          // Pass 'store' to check data
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