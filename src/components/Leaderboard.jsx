import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';

export default function Leaderboard({ currentUser }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use the environment variable for API URL
  const API_URL = import.meta.env.VITE_API_URL || 'https://habit-tracker-m9uw.onrender.com';

  useEffect(() => {
    fetch(`${API_URL}/leaderboard`)
      .then(res => res.json())
      .then(data => {
        setLeaders(data);
        setLoading(false);
      })
      .catch(err => console.error("Leaderboard Error:", err));
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return <Crown size={20} color="#eab308" fill="#eab308" />;
    if (index === 1) return <Medal size={20} color="#94a3b8" />;
    if (index === 2) return <Medal size={20} color="#b45309" />;
    return <span style={{ fontWeight: 800, color: 'var(--text-sub)' }}>#{index + 1}</span>;
  };

  return (
    <div className="leaderboard-container animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Trophy size={28} color="var(--primary)" />
          Global Rankings
        </h2>
        <p style={{ color: 'var(--text-sub)' }}>The mightiest heroes in the realm.</p>
      </div>

      {loading ? (
        <div className="loading-spinner" style={{ margin: '40px auto' }}></div>
      ) : (
        <div className="leaderboard-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {leaders.map((player, index) => {
            const isMe = player.userId === currentUser.uid;
            return (
              <div 
                key={player.userId} 
                className="dash-card" 
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '16px 24px', 
                  border: isMe ? '2px solid var(--primary)' : '1px solid var(--border)',
                  transform: isMe ? 'scale(1.02)' : 'none'
                }}
              >
                <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                  {getRankIcon(index)}
                </div>
                
                <div style={{ flex: 1, marginLeft: '16px' }}>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '16px' }}>
                    {player.displayName || 'Anonymous Hero'} {isMe && '(You)'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                    Level {player.level} • {player.xp} XP
                  </span>
                </div>

                <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--primary)' }}>
                  LVL {player.level}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}