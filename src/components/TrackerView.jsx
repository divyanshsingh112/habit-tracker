import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

export default function TrackerView({ year, month, habits, onUpdate }) {
  const [newHabitName, setNewHabitName] = useState('');
  const [category, setCategory] = useState('Health');

  // --- 1. Calculate Days in Month dynamically ---
  const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // --- 2. Chart Data: Aggregate ALL days in the month ---
  const dailyData = daysArray.map(day => {
    // Count how many habits are completed on this specific 'day'
    const count = habits.filter(h => h.completedDays && h.completedDays[day]).length;
    return {
      name: day.toString(), // Label 1, 2, 3...
      completed: count
    };
  });

  // --- 3. Category Data for Pie Chart ---
  const categoryData = [
    { name: 'Health', value: habits.filter(h => h.category === 'Health').length, color: '#4caf50' },
    { name: 'Work', value: habits.filter(h => h.category === 'Work').length, color: '#ff9800' },
    { name: 'Mind', value: habits.filter(h => h.category === 'Mind').length, color: '#2196f3' },
    { name: 'Personal', value: habits.filter(h => h.category === 'Personal').length, color: '#9c27b0' },
  ].filter(d => d.value > 0);

  // --- Actions ---
  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit = {
      id: Date.now(),
      name: newHabitName,
      category,
      completedDays: {} // Object to store { dayNumber: true }
    };
    onUpdate([...habits, newHabit]);
    setNewHabitName('');
  };

  const toggleDay = (habitId, day) => {
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const isDone = h.completedDays?.[day];
        const newDays = { ...h.completedDays };
        if (isDone) delete newDays[day];
        else newDays[day] = true;
        return { ...h, completedDays: newDays };
      }
      return h;
    });
    onUpdate(updated);
  };

  const deleteHabit = (id) => {
    onUpdate(habits.filter(h => h.id !== id));
  };

  const calculateSuccess = (h) => {
    const completed = Object.keys(h.completedDays || {}).length;
    return Math.round((completed / daysInMonth) * 100);
  };

  return (
    <div className="tracker-container animate-fade">
      
      {/* --- CHARTS SECTION --- */}
      <div className="stats-grid">
        {/* BAR CHART: Shows whole month now */}
        <div className="card">
          <h3>Monthly Performance</h3>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={dailyData}>
                <XAxis 
                  dataKey="name" 
                  tick={{fontSize: 10}} 
                  interval={2} // Show every ~3rd day label to avoid clutter
                  stroke="#94a3b8"
                />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}
                />
                <Bar 
                  dataKey="completed" 
                  fill="#4caf50" 
                  radius={[4, 4, 0, 0]} 
                  barSize={8} // Thinner bars to fit 31 days nicely
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: Category Balance */}
        <div className="card">
          <h3>Category Balance</h3>
          <div style={{ width: '100%', height: 200, position: 'relative' }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#cbd5e1'}}>
                No habits yet
              </div>
            )}
          </div>
          <div style={{display:'flex', gap:10, justifyContent:'center', marginTop:10, fontSize:12}}>
            {categoryData.map(c => (
              <span key={c.name} style={{color: c.color, fontWeight:700}}>● {c.name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* --- ADD HABIT INPUT --- */}
      <div className="add-habit-form">
        <input 
          type="text" 
          placeholder="What habit are we starting?" 
          value={newHabitName}
          onChange={e => setNewHabitName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addHabit()}
        />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="Health">Health</option>
          <option value="Work">Work</option>
          <option value="Mind">Mind</option>
          <option value="Personal">Personal</option>
        </select>
        <button onClick={addHabit}>
          <Plus size={18} /> Add Habit
        </button>
      </div>

      {/* --- HABITS LIST --- */}
      <div className="grid-card">
        <div className="grid-head">
          <div className="h-col">HABIT NAME</div>
          <div className="d-col">
            {daysArray.map(d => <span key={d}>{d}</span>)}
          </div>
          <div style={{textAlign:'center'}}>SUCCESS</div>
        </div>

        {habits.map(h => (
          <div key={h.id} className="habit-row">
            <div className="h-col">
              <div>
                <div className="habit-title">{h.name}</div>
                <span className={`cat-tag cat-${h.category.toLowerCase()}`}>{h.category}</span>
              </div>
              <button className="delete-btn" onClick={() => deleteHabit(h.id)}>
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="d-col">
              {daysArray.map(d => (
                <div 
                  key={d}
                  className={`check-box ${h.completedDays?.[d] ? 'active' : ''}`}
                  onClick={() => toggleDay(h.id, d)}
                />
              ))}
            </div>

            <div style={{padding:'0 10px'}}>
              <div className="progress-pill">
                {calculateSuccess(h)}%
              </div>
            </div>
          </div>
        ))}

        {habits.length === 0 && (
          <div style={{padding: 40, textAlign:'center', color:'#94a3b8'}}>
            No habits for this month. Add one above!
          </div>
        )}
      </div>
    </div>
  );
}