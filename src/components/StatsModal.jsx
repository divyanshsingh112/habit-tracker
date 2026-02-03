import React from 'react';
import { X } from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from 'recharts';

export default function StatsModal({ isOpen, onClose, stats, streak }) {
  if (!isOpen) return null;

  // Normalize data for the chart (Cap visually at 100)
  const normalize = (val) => Math.min((val || 0) * 5, 100); 

  // Mapping Backend Data -> Your Requested Labels
  const data = [
    { subject: 'Skills', A: normalize(stats.stats?.str), fullMark: 100 },    // Warrior (STR) -> Skills
    { subject: 'Stamina', A: normalize(stats.stats?.wis), fullMark: 100 },   // Monk (WIS) -> Stamina
    { subject: 'Discipline', A: normalize(streak * 5), fullMark: 100 },      // Streak -> Discipline
    { subject: 'Charisma', A: normalize(stats.stats?.cha), fullMark: 100 },  // Bard (CHA) -> Charisma
    { subject: 'Intellect', A: normalize(stats.stats?.int), fullMark: 100 }, // Mage (INT) -> Intellect
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content animate-slide-up" 
        onClick={e => e.stopPropagation()} 
        style={{ background: '#fffbeb', border: '4px solid #78350f', maxWidth: '380px' }}
      >
        
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: 0, justifyContent: 'center', position: 'relative' }}>
          <h3 style={{ 
            fontFamily: 'monospace', 
            textTransform: 'uppercase', 
            letterSpacing: '2px', 
            color: '#78350f',
            fontSize: '18px',
            borderBottom: '2px solid #78350f',
            paddingBottom: '5px'
          }}>
            Character Stats
          </h3>
          <button 
            onClick={onClose} 
            className="close-btn" 
            style={{ position: 'absolute', right: 0, top: 0 }}
          >
            <X size={24} color="#78350f" />
          </button>
        </div>

        {/* The Hexagon Chart */}
        <div style={{ width: '100%', height: '280px', marginTop: '10px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="#a8a29e" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#78350f', fontSize: 11, fontWeight: 'bold' }} 
              />
              <Radar
                name="Stats"
                dataKey="A"
                stroke="#d97706"
                fill="#f59e0b"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Text Summary */}
        <div style={{ textAlign: 'center', fontSize: '14px', color: '#92400e', fontWeight: 'bold' }}>
          <p>LEVEL {stats.level} • {stats.xp} XP</p>
        </div>

      </div>
    </div>
  );
}