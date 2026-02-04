import React, { useState, useEffect, useRef } from 'react';
import { Users, Send, Copy, RefreshCw, Shield, MessageSquare, LogOut, Trash2 } from 'lucide-react';

export default function Guild({ user }) {
  const [guild, setGuild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  
  const chatEndRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'https://habit-tracker-m9uw.onrender.com';

  const fetchGuild = async () => {
    try {
      const res = await fetch(`${API_URL}/guild/${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setGuild(data);
      } else {
        setGuild(null);
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchGuild();
    const interval = setInterval(() => { if(guild) fetchGuild(); }, 8000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [guild?.chat]);

  // --- ACTIONS ---

  const handleCreate = async () => {
    if(!createForm.name) return;
    try {
      const res = await fetch(`${API_URL}/guild/create`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: createForm.name, description: createForm.description, userId: user.uid, displayName: user.displayName || 'Hero' })
      });
      if(res.ok) { const data = await res.json(); setGuild(data); }
      else { alert("Could not create guild. You might already be in one."); }
    } catch(e) { alert("Server error"); }
  };

  const handleJoin = async () => {
    if(!joinCode) return;
    try {
      const res = await fetch(`${API_URL}/guild/join`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ inviteCode: joinCode, userId: user.uid, displayName: user.displayName || 'Hero' })
      });
      if(res.ok) { const data = await res.json(); setGuild(data); }
      else { alert("Invalid Code or already in guild!"); }
    } catch(e) { alert("Server error"); }
  };

  const handleLeave = async () => {
    if(!confirm("Are you sure you want to leave?")) return;
    await fetch(`${API_URL}/guild/leave`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ guildId: guild._id, userId: user.uid })
    });
    setGuild(null); // Reset UI
  };

  const handleDelete = async () => {
    if(!confirm("DANGER: This will delete the guild for everyone. Continue?")) return;
    await fetch(`${API_URL}/guild/delete`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ guildId: guild._id, userId: user.uid })
    });
    setGuild(null); // Reset UI
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if(!message.trim()) return;
    const newMsg = { userId: user.uid, displayName: user.displayName || 'Me', message, timestamp: new Date() };
    setGuild(prev => ({ ...prev, chat: [...prev.chat, newMsg] }));
    setMessage('');
    await fetch(`${API_URL}/guild/message`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ guildId: guild._id, userId: user.uid, displayName: user.displayName || 'Hero', message })
    });
    fetchGuild();
  };

  if (loading) return <div className="loading-spinner" style={{margin: '50px auto'}}></div>;

  // --- VIEW 1: NO GUILD ---
  if (!guild) {
    return (
      <div className="guild-container animate-slide-up">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Shield size={64} className="text-primary" style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '32px', fontWeight: '800' }}>Join a Squad</h2>
          <p style={{ color: 'var(--text-sub)' }}>Accountability works better with friends.</p>
        </div>

        <div className="guild-split">
          <div className="guild-card">
            <h3><Users size={20} /> Join Existing</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input className="guild-input" placeholder="Enter Invite Code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} />
              <button className="guild-btn btn-join" style={{ width: 'auto' }} onClick={handleJoin}>Join</button>
            </div>
          </div>
          <div className="guild-card">
            <h3><Shield size={20} /> Start New</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input className="guild-input" placeholder="Guild Name" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} />
              <input className="guild-input" placeholder="Motto" value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} />
              <button className="guild-btn btn-create" onClick={handleCreate}>Create Guild</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: GUILD HALL (Redesigned) ---
  const isAdmin = guild.adminId === user.uid || (guild.members.length > 0 && guild.members[0].userId === user.uid); // Fallback for old guilds

  return (
    <div className="guild-hall-wrapper animate-slide-up">
      {/* HEADER */}
      <div className="gh-header">
        <div>
          <h1 className="gh-title"><Shield size={24} /> {guild.name}</h1>
          <p className="gh-desc">{guild.description}</p>
        </div>
        <div className="gh-invite" onClick={() => { navigator.clipboard.writeText(guild.inviteCode); alert("Code copied!"); }}>
          <span>INVITE:</span> <strong>{guild.inviteCode}</strong> <Copy size={14} />
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="gh-grid">
        {/* LEFT SIDEBAR: MEMBERS */}
        <aside className="gh-sidebar">
          <div className="gh-section-title"><Users size={16} /> MEMBERS ({guild.members.length})</div>
          <div className="gh-member-list">
            {guild.members.map((m, i) => (
              <div key={i} className="gh-member">
                <div className="gh-avatar">{m.displayName[0].toUpperCase()}</div>
                <span className="gh-name">{m.displayName} {m.userId === user.uid && "(You)"}</span>
                {m.userId === guild.adminId && <Shield size={12} fill="#f59e0b" color="#f59e0b"/>}
              </div>
            ))}
          </div>

          <div className="gh-actions">
            <button className="gh-btn-danger" onClick={handleLeave}>
              <LogOut size={16} /> Leave Guild
            </button>
            {isAdmin && (
              <button className="gh-btn-danger delete" onClick={handleDelete}>
                <Trash2 size={16} /> Disband
              </button>
            )}
          </div>
        </aside>

        {/* RIGHT SIDE: CHAT */}
        <section className="gh-chat-area">
          <div className="gh-chat-messages">
            {guild.chat.length === 0 ? (
               <div className="empty-state">No messages yet. Start the conversation!</div>
            ) : (
               guild.chat.map((msg, i) => (
                <div key={i} className={`chat-bubble-row ${msg.userId === user.uid ? 'me' : 'them'}`}>
                  {msg.userId !== user.uid && <div className="chat-avatar-mini">{msg.displayName[0]}</div>}
                  <div className="chat-bubble">
                    {msg.userId !== user.uid && <div className="chat-name">{msg.displayName}</div>}
                    <div className="chat-text">{msg.message}</div>
                  </div>
                </div>
               ))
            )}
            <div ref={chatEndRef} />
          </div>
          
          <form className="gh-chat-input" onSubmit={sendMessage}>
            <input placeholder="Message your squad..." value={message} onChange={e => setMessage(e.target.value)} />
            <button type="submit"><Send size={18} /></button>
          </form>
        </section>
      </div>
    </div>
  );
}