import React, { useMemo } from 'react';
import { Trophy, Zap, Target, TrendingUp } from 'lucide-react';

export default function WeeklyReport({ habits }) {
  const report = useMemo(() => {
    if (!habits || habits.length === 0) return null;

    const today = new Date().getDate();
    const last7Days = Array.from({ length: 7 }, (_, i) => today - i).filter(d => d > 0);
    
    let totalCompletions = 0;
    const maxPossible = habits.length * last7Days.length;

    habits.forEach(h => {
      last7Days.forEach(day => {
        if (h.completedDays?.[day]) totalCompletions++;
      });
    });

    const score = maxPossible > 0 ? (totalCompletions / maxPossible) * 100 : 0;

    // Logic for Motivational Message
    if (score >= 85) return {
      title: "Elite Status",
      message: "Your consistency is unmatched. You're currently performing in the top 5% of your potential.",
      icon: <Trophy className="report-icon elite" />,
      class: "elite"
    };
    if (score >= 60) return {
      title: "Building Momentum",
      message: "Solid work! You're hitting your core habits. Keep this pace to lock in these routines.",
      icon: <Zap className="report-icon momentum" />,
      class: "momentum"
    };
    if (score >= 30) return {
      title: "Steady Progress",
      message: "You're showing up, which is half the battle. Focus on one 'non-negotiable' habit tomorrow.",
      icon: <Target className="report-icon steady" />,
      class: "steady"
    };
    return {
      title: "Reset Needed",
      message: "A tough week isn't a failure—it's data. Clear your schedule for a win tomorrow morning.",
      icon: <TrendingUp className="report-icon reset" />,
      class: "reset"
    };
  }, [habits]);

  if (!report) return null;

  return (
    <div className={`weekly-report-card ${report.class} animate-fade`}>
      <div className="report-header">
        {report.icon}
        <div>
          <h4>{report.title}</h4>
          <p>7-Day Performance Analysis</p>
        </div>
      </div>
      <p className="report-message">"{report.message}"</p>
    </div>
  );
}