import React from 'react';
import { PieChart, AlertTriangle, CheckCircle, Clock, FolderOpen, Flame, Activity } from 'lucide-react';

export default function AnalyticsView({ summaryData, priorityData, totalTickets }) {
  const openCount = summaryData['Open'] || 0;
  const inProgressCount = summaryData['In Progress'] || 0;
  const closedCount = summaryData['Closed'] || 0;

  const lowPriority = priorityData['Low'] || 0;
  const mediumPriority = priorityData['Medium'] || 0;
  const highPriority = priorityData['High'] || 0;

  const calcPercent = (val) => (totalTickets > 0 ? Math.round((val / totalTickets) * 100) : 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm mb-1">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>FastAPI Analytics Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">System Performance & Ticket Metrics</h2>
          <p className="text-slate-400 text-sm mt-1">Real-time status summaries and priority breakdown across all team tickets.</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 self-start md:self-auto">
          <div className="text-center px-3">
            <span className="block text-2xl font-extrabold text-white">{totalTickets}</span>
            <span className="text-[11px] text-slate-400 font-medium">Total Tickets</span>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-center px-3">
            <span className="block text-2xl font-extrabold text-emerald-400">{calcPercent(closedCount)}%</span>
            <span className="text-[11px] text-slate-400 font-medium">Resolution Rate</span>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status Distribution */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Ticket Status Distribution</h3>
                <p className="text-xs text-slate-400">Breakdown by current resolution lifecycle state</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Open */}
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="flex items-center space-x-2 text-slate-300">
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span>Open</span>
                </span>
                <span className="text-slate-400">{openCount} tickets ({calcPercent(openCount)}%)</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${calcPercent(openCount)}%` }}
                ></div>
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="flex items-center space-x-2 text-slate-300">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>In Progress</span>
                </span>
                <span className="text-slate-400">{inProgressCount} tickets ({calcPercent(inProgressCount)}%)</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${calcPercent(inProgressCount)}%` }}
                ></div>
              </div>
            </div>

            {/* Closed */}
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Closed</span>
                </span>
                <span className="text-slate-400">{closedCount} tickets ({calcPercent(closedCount)}%)</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${calcPercent(closedCount)}%` }}
                ></div>
              </div>
            </div>

          </div>
        </div>

        {/* Priority Analysis */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Priority Level Breakdown</h3>
                <p className="text-xs text-slate-400">Task urgency and workload classification</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* High Priority */}
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="flex items-center space-x-2 text-slate-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-300 font-semibold">High Priority</span>
                </span>
                <span className="text-slate-400">{highPriority} tickets ({calcPercent(highPriority)}%)</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-rose-600 to-rose-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${calcPercent(highPriority)}%` }}
                ></div>
              </div>
            </div>

            {/* Medium Priority */}
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="flex items-center space-x-2 text-slate-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Medium Priority</span>
                </span>
                <span className="text-slate-400">{mediumPriority} tickets ({calcPercent(mediumPriority)}%)</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${calcPercent(mediumPriority)}%` }}
                ></div>
              </div>
            </div>

            {/* Low Priority */}
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="flex items-center space-x-2 text-slate-300">
                  <AlertTriangle className="w-4 h-4 text-slate-400" />
                  <span>Low Priority</span>
                </span>
                <span className="text-slate-400">{lowPriority} tickets ({calcPercent(lowPriority)}%)</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-slate-500 to-slate-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${calcPercent(lowPriority)}%` }}
                ></div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
