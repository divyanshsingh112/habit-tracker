import React from 'react';
import { CATEGORIES, COLORS } from '../constants';

export default function HabitOverview({ habits, daysInMonth }) {
  // 1. Map habits to include their success percentage
  const habitStats = habits.map(h => {
    // Handling MongoDB Map conversion (Object.keys)
    const completedCount = Object.keys(h.completedDays || {}).length;
    const successRate = Math.round((completedCount / daysInMonth) * 100);
    return { ...h, successRate };
  });

  // 2. Sort by success and limit to top 10
  const topHabits = [...habitStats]
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 10);

  return (
    <div className="card animate-fade">
      <h3>Top 10 Daily Habits</h3>
      <div className="overview-list">
        {topHabits.map((h, index) => (
          <div key={h.id} className="overview-item">
            <div className="item-rank">{index + 1}</div>
            <div className="item-info">
              <span className="item-name">{h.name}</span>
              <div className="item-meta">
                <span 
                  className="dot" 
                  style={{ backgroundColor: COLORS[CATEGORIES.indexOf(h.category)] }}
                />
                {h.category}
              </div>
            </div>
            <div className="item-score">{h.successRate}%</div>
          </div>
        ))}
        {habits.length === 0 && (
          <p className="loading-state" style={{padding: 0, fontSize: '12px'}}>
            No data available for this month.
          </p>
        )}
      </div>
    </div>
  );
}