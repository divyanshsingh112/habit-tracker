import React, { useState } from 'react';
import { ChevronLeft, Plus, Sword, Brain, Sparkles, Music, Check, Trash2 } from 'lucide-react';

// Attribute Configuration
const ATTRIBUTES = {
  warrior: { label: 'Warrior', color: 'var(--warrior-red)', icon: Sword, desc: 'Strength & Health' },
  mage:    { label: 'Mage',    color: 'var(--mage-blue)',   icon: Brain, desc: 'Intellect & Focus' },
  monk:    { label: 'Monk',    color: 'var(--monk-purple)', icon: Sparkles, desc: 'Wisdom & Calm' },
  bard:    { label: 'Bard',    color: 'var(--bard-gold)',   icon: Music, desc: 'Charisma & Social' },
};

export default function TrackerView({ year, month, onComplete, onBack }) {
  const [habits, setHabits] = useState([
    { id: 1, name: 'Morning Run 5km', class: 'warrior', history: { 1: true, 2: true, 5: true } },
    { id: 2, name: 'Read Grimoire', class: 'mage', history: { 1: true, 3: true } },
  ]);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [newQuest, setNewQuest] = useState({ name: '', class: 'warrior' });

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  // Toggle Day Logic
  const toggleDay = (habitId, day, attr) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const isComplete = !h.history[day];
      const newHistory = { ...h.history };
      
      if (isComplete) {
        newHistory[day] = true;
        onComplete(attr); // Trigger XP/Coins
      } else {
        delete newHistory[day];
      }
      return { ...h, history: newHistory };
    }));
  };

  const addQuest = () => {
    if (!newQuest.name) return;
    setHabits([...habits, { 
      id: Date.now(), 
      name: newQuest.name, 
      class: newQuest.class, 
      history: {} 
    }]);
    setShowQuestModal(false);
    setNewQuest({ name: '', class: 'warrior' });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">{month} {year}</h2>
            <p className="text-slate-400 text-sm">Quest Log Status</p>
          </div>
        </div>
        <button 
          onClick={() => setShowQuestModal(true)}
          className="btn flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} /> New Quest
        </button>
      </div>

      {/* GLASS GRID TRACKER */}
      <div className="glass-panel rounded-xl overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-[240px_1fr] border-b border-white/10 bg-black/20">
          <div className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Active Quest</div>
          <div className="flex items-center overflow-x-auto hide-scroll px-2">
            {days.map(d => (
              <div key={d} className="min-w-[40px] text-center text-xs font-bold text-slate-500">{d}</div>
            ))}
          </div>
        </div>

        {/* Quest Rows */}
        {habits.map(habit => {
          const AttrIcon = ATTRIBUTES[habit.class].icon;
          const activeColor = ATTRIBUTES[habit.class].color;

          return (
            <div key={habit.id} className="grid grid-cols-[240px_1fr] border-b border-white/5 hover:bg-white/5 transition-colors group">
              {/* Quest Info */}
              <div className="p-4 flex items-center gap-3 border-r border-white/5">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${activeColor}20`, color: activeColor }}
                >
                  <AttrIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{habit.name}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide">{ATTRIBUTES[habit.class].label}</div>
                </div>
              </div>

              {/* Checkbox Grid */}
              <div className="flex items-center overflow-x-auto hide-scroll px-2 py-3 gap-0">
                {days.map(day => {
                  const checked = habit.history[day];
                  return (
                    <div key={day} className="min-w-[40px] flex justify-center">
                      <button
                        onClick={() => toggleDay(habit.id, day, habit.class)}
                        className={`
                          w-8 h-8 rounded-md border-2 transition-all duration-200 flex items-center justify-center
                          ${checked ? 'scale-100 shadow-md' : 'scale-90 border-slate-700 bg-slate-800/50 hover:border-slate-500'}
                        `}
                        style={{ 
                          backgroundColor: checked ? activeColor : undefined,
                          borderColor: checked ? activeColor : undefined,
                          boxShadow: checked ? `0 0 10px ${activeColor}60` : undefined
                        }}
                      >
                        {checked && <Check size={16} className="text-white animate-enter" strokeWidth={4} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW QUEST MODAL */}
      {showQuestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 animate-enter bg-[#0f172a]">
            <h3 className="text-xl font-bold text-white mb-6">Start New Quest</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Quest Name</label>
                <input 
                  type="text" 
                  value={newQuest.name}
                  onChange={(e) => setNewQuest({...newQuest, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Meditate for 10 mins"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Select Class Attribute</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ATTRIBUTES).map(([key, attr]) => {
                    const isSelected = newQuest.class === key;
                    const Icon = attr.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setNewQuest({...newQuest, class: key})}
                        className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${isSelected ? 'bg-white/10 border-white' : 'bg-transparent border-slate-700 hover:bg-slate-800'}`}
                      >
                        <Icon size={18} style={{ color: attr.color }} />
                        <div className="text-left">
                          <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{attr.label}</div>
                          <div className="text-[10px] text-slate-500">{attr.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setShowQuestModal(false)} className="flex-1 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 font-semibold">Cancel</button>
              <button onClick={addQuest} className="flex-1 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/25">Begin Quest</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}