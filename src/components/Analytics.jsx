import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area
} from 'recharts';
import { Trophy, TrendingUp, Activity } from 'lucide-react';

export default function Analytics({ userStats, store }) {

  // 1. Prepare Data for Attribute Radar Chart (RPG Stats)
  const radarData = useMemo(() => {
    const stats = userStats.stats || { str: 0, int: 0, wis: 0, cha: 0 };
    return [
      { subject: 'STR', A: stats.str, fullMark: 100 },
      { subject: 'INT', A: stats.int, fullMark: 100 },
      { subject: 'WIS', A: stats.wis, fullMark: 100 },
      { subject: 'CHA', A: stats.cha, fullMark: 100 },
    ];
  }, [userStats]);

  // 2. Prepare Data for Monthly Consistency (Line Chart)
  const monthlyData = useMemo(() => {
    const data = [];
    
    // Iterate over years and months in the store
    Object.keys(store).forEach(year => {
      Object.keys(store[year]).forEach(month => {
        const habits = store[year][month];
        if (!habits || habits.length === 0) return;

        // Calculate total possible checks vs actual checks
        const daysInMonth = new Date(year, new Date(`${month} 1, 2000`).getMonth() + 1, 0).getDate();
        let totalChecks = 0;
        let totalHabits = habits.length;

        habits.forEach(h => {
          if (h.completedDays) {
            // --- FIX: Filter for valid day numbers only (1-31) ---
            const validCount = Object.keys(h.completedDays).filter(key => {
              const dayNum = parseInt(key, 10);
              return !isNaN(dayNum) && dayNum >= 1 && dayNum <= 31;
            }).length;
            
            totalChecks += validCount;
          }
        });

        const rawScore = (totalChecks / (totalHabits * daysInMonth)) * 100;
        
        // --- FIX: Clamp at 100% ---
        const efficiency = totalHabits > 0 ? Math.min(100, Math.round(rawScore)) : 0;

        data.push({
          name: `${month.substring(0, 3)} ${year}`, // "Jan 2026"
          score: efficiency,
          dateObj: new Date(`${month} 1, ${year}`) // For sorting
        });
      });
    });

    // Sort by date and take last 6 months
    return data.sort((a, b) => a.dateObj - b.dateObj).slice(-6);
  }, [store]);

  return (
    <div className="analytics-container animate-slide-up">
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '800' }}>Hero Analytics</h2>

      <div className="analytics-grid">
        
        {/* CHART 1: ATTRIBUTE RADAR */}
        <div className="dash-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div className="card-icon-bg" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Trophy size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Class Attributes</h3>
          </div>
          
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-sub)', fontSize: 12, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar
                  name="Stats"
                  dataKey="A"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.4}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: MONTHLY CONSISTENCY */}
        <div className="dash-card">
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div className="card-icon-bg" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <TrendingUp size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Consistency Trend</h3>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-sub)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-sub)', fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}