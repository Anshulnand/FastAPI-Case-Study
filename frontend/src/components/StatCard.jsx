import React from 'react';

export default function StatCard({ title, count, icon: Icon, color, active, onClick }) {
  const colorStyles = {
    indigo: {
      border: 'border-indigo-500/30',
      iconBg: 'bg-indigo-500/10 text-indigo-400',
      activeRing: 'ring-2 ring-indigo-500/50 bg-indigo-950/20'
    },
    amber: {
      border: 'border-amber-500/30',
      iconBg: 'bg-amber-500/10 text-amber-400',
      activeRing: 'ring-2 ring-amber-500/50 bg-amber-950/20'
    },
    blue: {
      border: 'border-blue-500/30',
      iconBg: 'bg-blue-500/10 text-blue-400',
      activeRing: 'ring-2 ring-blue-500/50 bg-blue-950/20'
    },
    emerald: {
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      activeRing: 'ring-2 ring-emerald-500/50 bg-emerald-950/20'
    }
  };

  const currentStyle = colorStyles[color] || colorStyles.indigo;

  return (
    <div
      onClick={onClick}
      className={`glass-card p-5 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 ${
        active ? currentStyle.activeRing : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">{count}</h3>
        </div>
        <div className={`p-3.5 rounded-xl ${currentStyle.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>Click to filter</span>
        <span className="text-slate-500">&rarr;</span>
      </div>
    </div>
  );
}
