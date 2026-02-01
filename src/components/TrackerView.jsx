import React, { useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import HabitOverview from './HabitOverview';
import HabitRow from './HabitRow';
import WeeklyReport from './WeeklyReport';
import { CATEGORIES, COLORS } from '../constants';

export default function TrackerView({ year, month, habits, onUpdate }) {
  const [newHabitName, setNewHabitName] = useState('');
  const [category, setCategory] = useState('Health');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Filter Logic
  const filteredHabits = habits.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'All' || h.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const dailyData = daysArray.map(day => ({
    name: day.toString(),
    completed: habits.filter(h => h.completedDays?.[day]).length
  }));

  const categoryData = CATEGORIES.map((cat, idx) => ({
    name: cat,
    value: habits.filter(h => h.category === cat).length,
    color: COLORS[idx]
  })).filter(d => d.value > 0);

  const toggleDay = (habitId, day) => {
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const newDays = { ...h.completedDays };
        if (newDays[day]) delete newDays[day];
        else newDays[day] = true;
        return { ...h, completedDays: newDays };
      }
      return h;
    });
    onUpdate(updated);
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    onUpdate([...habits, { 
      id: Date.now(), 
      name: newHabitName, 
      category, 
      completedDays: {} 
    }]);
    setNewHabitName('');
  };

  return (
    <div className="tracker-container animate-fade">
      
      {/* 1. WEEKLY REPORT SUMMARY */}
      <div style={{ marginBottom: '24px' }}>
        <WeeklyReport habits={habits} />
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="stats-grid">
        <div className="card">
          <h3>Monthly Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData}>
              <XAxis dataKey="name" tick={{fontSize: 10}} interval={2} stroke="#94a3b8" />
              <Tooltip cursor={{fill: '#f1f5f9'}} />
              <Bar dataKey="completed" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <HabitOverview habits={habits} daysInMonth={daysInMonth} />

        <div className="card">
          <h3>Category Balance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value">
                {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. SEARCH & FILTER CONTROLS (Fixed Structure) */}
      <div className="controls-row">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search habits..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <button 
            className={`filter-pill ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => setActiveCategory('All')}
          >All</button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* 4. ADD HABIT FORM */}
      <div className="add-habit-form">
        <input 
          placeholder="New habit..." 
          value={newHabitName} 
          onChange={e => setNewHabitName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addHabit()} 
        />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <button onClick={addHabit}>
          <Plus size={18} /> Add
        </button>
      </div>

      {/* 5. HABIT GRID */}
      <div className="grid-card">
        <div className="grid-head">
          <div className="h-col">HABIT</div>
          <div className="d-col">{daysArray.map(d => <span key={d}>{d}</span>)}</div>
          <div style={{textAlign:'center'}}>SUCCESS</div>
        </div>
        {filteredHabits.map(h => (
          <HabitRow 
            key={h.id} 
            habit={h} 
            days={daysArray} 
            onToggle={toggleDay} 
            onDelete={(id) => onUpdate(habits.filter(item => item.id !== id))} 
          />
        ))}
        {filteredHabits.length === 0 && (
          <div style={{padding: 40, textAlign:'center', color:'#94a3b8'}}>
            No habits match your filters.
          </div>
        )}
      </div>
    </div>
  );
}