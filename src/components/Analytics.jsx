import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CATEGORIES, COLORS } from '../constants';

export const Analytics = ({ barData, pieData }) => (
  <div className="stats-grid">
    <div className="card chart-card">
      <h3>Weekly Performance</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip cursor={{fill: '#f8f9fa'}} />
          <Bar dataKey="completed" fill="#4caf50" radius={[6, 6, 0, 0]} barSize={35} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="card chart-card">
      <h3>Category Balance</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
            {pieData.map((entry, index) => <Cell key={index} fill={COLORS[CATEGORIES.indexOf(entry.name)]} />)}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);