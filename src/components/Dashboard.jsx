import React from 'react';
import { Plus } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Dashboard({ setView }) {
  return (
    <div className="flex flex-col gap-8">
      
      {/* HEADER HERO */}
      <div className="glass-panel p-8 rounded-2xl flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-white mb-2">Welcome Back, Hero.</h1>
          <p className="text-slate-400 max-w-md">Your consistency is the key to unlocking new powers. Review your chronicles below.</p>
        </div>
        <div className="hidden md:block w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl absolute right-10 top-0"></div>
      </div>

      {/* YEAR GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Chronicle: 2026</h2>
          <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">Active Year</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MONTHS.map((m, i) => {
            // Mock Status: Randomly assign health for demo
            const status = i < 2 ? 'healthy' : i === 2 ? 'warning' : 'empty'; 
            
            return (
              <div 
                key={m}
                onClick={() => setView({ screen: 'tracker', year: 2026, month: m })}
                className="glass-panel p-6 rounded-xl hover:bg-white/5 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-8">
                  <span className="text-2xl font-bold text-slate-700 group-hover:text-slate-600 transition-colors">{(i+1).toString().padStart(2, '0')}</span>
                  {status === 'healthy' && <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_limegreen]"></div>}
                  {status === 'warning' && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_orange]"></div>}
                </div>
                <h3 className="text-xl font-bold text-white">{m}</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
                  {status === 'empty' ? 'No Data' : 'View Data'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}