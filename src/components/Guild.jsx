import React, { useState, useEffect, useRef } from 'react';
import { Users, Send, Copy, RefreshCw, Shield, MessageSquare, LogOut, Trash2 } from 'lucide-react';

export default function Guild({ user }) {
  const [guild, setGuild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  
  const chatEndRef = useRef(null);
  
  // Use environment variable or fallback
  const API_URL = import.meta.env.VITE_API_URL || 'https://habit-tracker-m9uw.onrender.com';

  const fetchGuild = async () => {
    try {
      const res = await fetch(`${API_URL}/guild/${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setGuild(data);
      } else {
        // 404 means user isn't in a guild
        setGuild(null);
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  // 🔥 FIX: Auto-Refresh Logic (Polling)
  useEffect(() => {
    // 1. Fetch immediately
    fetchGuild();

    // 2. Fetch every 2 seconds (Fast enough for chat)
    const interval = setInterval(() => {
      fetchGuild();
    }, 2000); 

    // 3. Cleanup on unmount
    return () => clearInterval(interval);
  }, [user.uid]); // Re-start if user changes

  // Auto-scroll to bottom of chat
  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [guild?.chat]);

  // --- ACTIONS ---

  const createGuild = async (e) => {
    e.preventDefault();
    if(!createForm.name) return;
    try {
      await fetch(`${API_URL}/guild/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...createForm, userId: user.uid, displayName: user.displayName || 'Hero' })
      });
      fetchGuild();
    } catch (err) { alert("Failed to create guild"); }
  };

  const joinGuild = async (e) => {
    e.preventDefault();
    if(!joinCode) return;
    try {
      const res = await fetch(`${API_URL}/guild/join`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: joinCode, userId: user.uid, displayName: user.displayName || 'Hero' })
      });
      if (!res.ok) throw new Error();
      fetchGuild();
    } catch (err) { alert("Invalid Code or already in a guild!"); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !guild) return;

    // 1. Optimistic Update (Show message instantly for ME)
    const tempMsg = { 
      userId: user.uid, 
      displayName: user.displayName || 'Me', 
      message: message,
      timestamp: new Date()
    };
    
    setGuild(prev => ({ ...prev, chat: [...prev.chat, tempMsg] }));
    setMessage(''); // Clear input

    try {
      // 2. Send to Server
      await fetch(`${API_URL}/guild/message`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: guild._id, userId: user.uid, displayName: user.displayName, message: tempMsg.message })
      });
      // The background interval will pick up the real saved message in 2 seconds
    } catch (err) { console.error("Message failed"); }
  };

  const handleLeave = async () => {
    if(!confirm("Leave this guild?")) return;
    try {
      await fetch(`${API_URL}/guild/leave`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ guildId: guild._id, userId: user.uid })
      });
      setGuild(null);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    if(!confirm("Disband guild? This cannot be undone.")) return;
    try {
      await fetch(`${API_URL}/guild/delete`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ guildId: guild._id, userId: user.uid })
      });
      setGuild(null);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading-spinner"></div>;

  // --- RENDER: NO GUILD ---
  if (!guild) {
    return (
      <div className="guild-container animate-fade">
        <div className="guild-intro">
          <h2><Shield size={32} /> Join the Alliance</h2>
          <p>Team up with friends to track habits together!</p>
        </div>

        <div className="guild-actions-grid">
          <div className="guild-card">
            <h3>Create a Guild</h3>
            <form onSubmit={createGuild}>
              <input placeholder="Guild Name" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} />
              <input placeholder="Motto (Optional)" value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} />
              <button type="submit" className="gh-btn primary">Create</button>
            </form>
          </div>

          <div className="guild-card">
            <h3>Join with Code</h3>
            <form onSubmit={joinGuild}>
              <input placeholder="Enter Invite Code" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
              <button type="submit" className="gh-btn secondary">Join</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: ACTIVE GUILD ---
  const isAdmin = guild.adminId === user.uid;

  return (
    <div className="guild-dashboard animate-slide-up">
      {/* LEFT SIDE: INFO */}
      <aside className="gh-sidebar">
        <div className="gh-header">
          <h2>{guild.name}</h2>
          <p>{guild.description}</p>
        </div>

        <div className="gh-stat-box">
          <div className="gh-code">
            <span>Code: {guild.inviteCode}</span>
            <button onClick={() => navigator.clipboard.writeText(guild.inviteCode)}><Copy size={14}/></button>
          </div>
          <div className="gh-members-count">
            <Users size={16} /> {guild.members.length} Heroes
          </div>
        </div>

        <div className="gh-members-list">
          <h4>Squad</h4>
          {guild.members.map(m => (
            <div key={m.userId} className="gh-member-row">
              <div className="member-avatar">{m.displayName?.[0]}</div>
              <span>{m.displayName} {m.userId === guild.adminId && '👑'}</span>
            </div>
          ))}
        </div>

        <div className="gh-controls">
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
          <input 
            placeholder="Message your squad..." 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
          />
          <button type="submit"><Send size={18} /></button>
        </form>
      </section>
    </div>
  );
}