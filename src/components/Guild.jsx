import React, { useState, useEffect, useRef } from 'react';
import { Users, Send, Copy, RefreshCw, Shield, MessageSquare } from 'lucide-react';

export default function Guild({ user }) {
  const [guild, setGuild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  
  const chatEndRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'https://habit-tracker-m9uw.onrender.com';

  // 1. Load Guild on Mount
  const fetchGuild = async () => {
    try {
      const res = await fetch(`${API_URL}/guild/${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        if (data) setGuild(data);
      }
    } catch (err) {
      console.error("Guild fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuild();
    // Auto-refresh chat every 10 seconds
    const interval = setInterval(() => {
        if(guild) fetchGuild();
    }, 10000); 
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [guild?.chat]);

  // --- ACTIONS ---

  const handleCreate = async () => {
    if(!createForm.name) return;
    try {
      const res = await fetch(`${API_URL}/guild/create`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          name: createForm.name, 
          description: createForm.description, 
          userId: user.uid, 
          displayName: user.displayName || user.email.split('@')[0] 
        })
      });
      
      if (!res.ok) throw new Error("Failed to create guild");
      
      const data = await res.json();
      setGuild(data);
    } catch (err) {
      alert("Error creating guild. Make sure the backend is running!");
    }
  };

  const handleJoin = async () => {
    if(!joinCode) return;
    try {
      const res = await fetch(`${API_URL}/guild/join`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          inviteCode: joinCode, 
          userId: user.uid, 
          displayName: user.displayName || user.email.split('@')[0] 
        })
      });
      
      if(res.ok) {
          const data = await res.json();
          setGuild(data);
      } else {
          alert("Invalid Code or you are already in a guild!");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if(!message.trim()) return;
    
    // Optimistic Update
    const newMsg = { 
      userId: user.uid, 
      displayName: user.displayName || user.email.split('@')[0], 
      message, 
      timestamp: new Date() 
    };
    
    setGuild(prev => ({ ...prev, chat: [...prev.chat, newMsg] }));
    setMessage('');

    await fetch(`${API_URL}/guild/message`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ 
        guildId: guild._id, 
        userId: user.uid, 
        displayName: user.displayName || user.email.split('@')[0], 
        message 
      })
    });
    fetchGuild(); // Sync to be sure
  };

  // --- RENDER ---

  if (loading) return <div className="loading-spinner" style={{margin: '50px auto'}}></div>;

  // STATE 1: NO GUILD (Improved UI)
  if (!guild) {
    return (
      <div className="guild-container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            background: '#eff6ff', width: '80px', height: '80px', 
            borderRadius: '50%', margin: '0 auto 20px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <Shield size={40} className="text-primary" fill="#bfdbfe" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Join a Guild</h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '16px' }}>
            Questing is dangerous alone. Find a squad.
          </p>
        </div>

        <div className="guild-split">
          {/* JOIN CARD */}
          <div className="guild-card">
            <h3><Users size={20} /> Join Existing Squad</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                className="guild-input"
                placeholder="Enter Invite Code (e.g. GYM-22)" 
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
              />
              <button className="guild-btn btn-join" style={{ width: 'auto' }} onClick={handleJoin}>
                Join
              </button>
            </div>
          </div>

          {/* CREATE CARD */}
          <div className="guild-card">
            <h3><Shield size={20} /> Form a New Guild</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                className="guild-input" 
                placeholder="Guild Name (e.g. Shadow Coders)" 
                value={createForm.name}
                onChange={e => setCreateForm({...createForm, name: e.target.value})}
              />
              <input 
                className="guild-input" 
                placeholder="Motto (e.g. We never sleep)" 
                value={createForm.description}
                onChange={e => setCreateForm({...createForm, description: e.target.value})}
              />
              <button className="guild-btn btn-create" onClick={handleCreate}>
                Create Guild
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STATE 2: GUILD HALL
  return (
    <div className="guild-hall animate-slide-up">
      {/* HEADER */}
      <div className="guild-header dash-card">
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield className="text-primary" size={28} color="var(--primary)" /> {guild.name}
          </h2>
          <p style={{ color: 'var(--text-sub)' }}>{guild.description}</p>
        </div>
        <div className="invite-box" onClick={() => { navigator.clipboard.writeText(guild.inviteCode); alert('Code Copied!') }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sub)' }}>INVITE CODE</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '800' }}>
                {guild.inviteCode} <Copy size={16} />
            </div>
        </div>
      </div>

      <div className="guild-grid">
        {/* LEFT: MEMBERS */}
        <div className="dash-card" style={{ height: 'fit-content' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Users size={18} /> Members ({guild.members.length})
            </h3>
            <div className="member-list">
                {guild.members.map((m, i) => (
                    <div key={i} className="member-item">
                        <div className="avatar-circle">{m.displayName ? m.displayName[0].toUpperCase() : 'H'}</div>
                        <span>{m.displayName}</span>
                        {m.userId === user.uid && <span className="you-tag">(You)</span>}
                    </div>
                ))}
            </div>
        </div>

        {/* RIGHT: CHAT */}
        <div className="dash-card chat-card">
            <div className="chat-header">
                <h3 style={{ margin:0, display:'flex', alignItems:'center', gap:'8px' }}><MessageSquare size={18} /> Guild Chat</h3>
                <button onClick={fetchGuild} className="icon-btn" style={{background:'none', border:'none', cursor:'pointer'}}><RefreshCw size={14} /></button>
            </div>
            
            <div className="chat-history">
                {guild.chat.length === 0 && <p className="empty-chat" style={{textAlign:'center', color:'var(--text-sub)', marginTop:'20px'}}>No messages yet. Say hi!</p>}
                {guild.chat.map((msg, i) => (
                    <div key={i} className={`chat-msg ${msg.userId === user.uid ? 'my-msg' : ''}`}>
                        <span className="msg-author">{msg.displayName}</span>
                        <div className="msg-bubble">{msg.message}</div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={sendMessage}>
                <input 
                    placeholder="Type a message..." 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                />
                <button type="submit"><Send size={18} /></button>
            </form>
        </div>
      </div>
    </div>
  );
}