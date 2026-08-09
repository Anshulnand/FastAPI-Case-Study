import React from 'react';
import { Clock, UserCheck, ShieldAlert, CheckCircle2, ChevronRight, Tag } from 'lucide-react';

export default function TicketCard({
  ticket,
  usersList,
  currentUser,
  onStatusChange,
  onAssignChange
}) {
  const priorityStyles = {
    High: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Low: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  };

  const statusStyles = {
    Open: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'In Progress': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    Closed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  };

  const assignedUser = usersList.find(u => u.id === ticket.assigned_to);
  const isAdmin = currentUser?.role === 'admin';

  const formattedDate = ticket.created_at
    ? new Date(ticket.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Recently';

  return (
    <div className="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all duration-300 group">
      
      {/* Top Header & Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-mono font-semibold text-slate-400">#TK-{ticket.id}</span>
          
          <div className="flex items-center space-x-2">
            {/* Priority Tag */}
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              priorityStyles[ticket.priority] || priorityStyles.Medium
            }`}>
              {ticket.priority} Priority
            </span>

            {/* Status Select */}
            <select
              value={ticket.status}
              onChange={(e) => onStatusChange(ticket.id, e.target.value)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-900 ${
                statusStyles[ticket.status] || statusStyles.Open
              }`}
            >
              <option value="Open" className="bg-slate-900 text-amber-400">Open</option>
              <option value="In Progress" className="bg-slate-900 text-blue-400">In Progress</option>
              <option value="Closed" className="bg-slate-900 text-emerald-400">Closed</option>
            </select>
          </div>
        </div>

        {/* Title & Description */}
        <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
          {ticket.title}
        </h4>
        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
          {ticket.description}
        </p>
      </div>

      {/* Footer Info & Admin Actions */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3">
        
        {/* Meta Info: Time & Assignee */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium text-slate-200">
              {assignedUser ? assignedUser.name : 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Admin Assign Dropdown Control */}
        {isAdmin && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Admin Assign:
            </span>
            <select
              value={ticket.assigned_to || ''}
              onChange={(e) => onAssignChange(ticket.id, Number(e.target.value))}
              className="text-xs bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1 text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">-- Choose User --</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        )}

      </div>

    </div>
  );
}
