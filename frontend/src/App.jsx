import React, { useState, useEffect } from 'react';
import {
  createEmployee,
  getEmployees,
  createTask,
  getAllTasks,
  updateTaskStatus,
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser
} from './services/api';

import AuthModal from './components/AuthModal';

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Data state
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Pagination & Filtering state
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal controls
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Form inputs
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEmployeeId, setNewTaskEmployeeId] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');

  // Toast feedback
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Check auth user on mount
  useEffect(() => {
    const checkUser = async () => {
      const res = await getCurrentUser();
      if (res.success) setUser(res.data);
    };
    checkUser();
    loadEmployees();
  }, []);

  // Reload tasks whenever filters or pagination changes
  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter, selectedEmployeeId, searchQuery, currentPage, pageSize]);

  const loadEmployees = async () => {
    const res = await getEmployees();
    if (res.success) setEmployees(res.data);
  };

  const loadTasks = async () => {
    const res = await getAllTasks({
      page: currentPage,
      limit: pageSize,
      status: statusFilter,
      priority: priorityFilter,
      employee_id: selectedEmployeeId,
      search: searchQuery
    });

    if (res.success) {
      setTasks(res.data || []);
      setTotalTasks(res.total || 0);
      setTotalPages(res.total_pages || 1);
    }
  };

  // Auth Handlers
  const handleLogin = async (email, password) => {
    const res = await loginUser(email, password);
    if (res.success) {
      setUser(res.data.user);
      showToast(`Welcome back, ${res.data.user.name || 'User'}!`);
      loadTasks();
    }
    return res;
  };

  const handleRegister = async (name, email, password, role) => {
    const res = await registerUser(name, email, password, role);
    if (res.success) {
      showToast('Account registered successfully!');
    }
    return res;
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    showToast('Logged out successfully');
  };

  // Submit Handlers
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployeeName.trim()) {
      showToast('Employee name must not be empty');
      return;
    }

    const res = await createEmployee(newEmployeeName.trim());
    if (res.success) {
      showToast('Employee added successfully');
      setNewEmployeeName('');
      setIsEmpModalOpen(false);
      loadEmployees();
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      showToast('Task title must not be empty');
      return;
    }
    if (!newTaskEmployeeId) {
      showToast('Please assign task to a valid employee');
      return;
    }

    const res = await createTask(newTaskTitle.trim(), newTaskEmployeeId, newTaskPriority);
    if (res.success) {
      showToast('Task created successfully');
      setNewTaskTitle('');
      setNewTaskEmployeeId('');
      setNewTaskPriority('Medium');
      setIsTaskModalOpen(false);
      setCurrentPage(1);
      loadTasks();
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const res = await updateTaskStatus(taskId, newStatus, null);
    if (res.success) {
      showToast(`Task #${taskId} status updated to "${newStatus}"`);
      loadTasks();
    }
  };

  const handlePriorityChange = async (taskId, newPriority) => {
    const res = await updateTaskStatus(taskId, null, newPriority);
    if (res.success) {
      showToast(`Task #${taskId} priority updated to "${newPriority}"`);
      loadTasks();
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('All');
    setPriorityFilter('All');
    setSelectedEmployeeId('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Helper metric counts
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In-Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  const getInitials = (name) => {
    if (!name) return 'EMP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusBadge = (status) => {
    if (status === 'Pending') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (status === 'In-Progress') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'Urgent') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (priority === 'High') return 'bg-orange-50 text-orange-700 border-orange-200';
    if (priority === 'Low') return 'bg-slate-100 text-slate-600 border-slate-200';
    return 'bg-sky-50 text-sky-700 border-sky-200'; // Medium default
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      
      {/* Toast Floating Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 animate-bounce-short">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          <span>{toast}</span>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-indigo-600/30">
              ET
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">Employee Task Tracker</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 hidden sm:inline-block">
                  JWT & Pagination API
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Case Study Task Assignment & Status System</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsEmpModalOpen(true)}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition shadow-xs flex items-center space-x-1.5"
            >
              <span>+</span>
              <span>Add Employee</span>
            </button>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm shadow-indigo-600/20 flex items-center space-x-1.5"
            >
              <span>+</span>
              <span>Add Task</span>
            </button>

            {/* Auth Button */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800">{user.name || user.email}</span>
                  <span className="text-[10px] font-extrabold uppercase text-indigo-600">{user.role || 'employee'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-xs"
              >
                Sign In / JWT Auth
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalTasks}</h3>
          </div>

          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
            <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Pending (Current Page)</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{pendingCount}</h3>
          </div>

          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">In-Progress (Current Page)</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{inProgressCount}</h3>
          </div>

          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Completed (Current Page)</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{completedCount}</h3>
          </div>
        </div>

        {/* Multi-Criteria Filter Toolbar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Task Filters & Search</h2>
              <p className="text-xs text-slate-500">Filter by status, priority, employee assignment, or keyword search</p>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline self-start sm:self-auto"
            >
              Reset All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Search Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Search Title</label>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Employee Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assigned Employee</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => { setSelectedEmployeeId(e.target.value); setCurrentPage(1); }}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium cursor-pointer"
              >
                <option value="All">All Employees ({employees.length})</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} (ID: #{emp.id})
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Tasks Grid */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-base font-bold text-slate-900">Task Records</h3>
            <span className="text-xs text-slate-500 font-medium">
              Showing page {currentPage} of {totalPages} ({totalTasks} total tasks)
            </span>
          </div>

          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((t) => {
                const emp = employees.find((e) => e.id === t.employee_id);
                const empName = emp ? emp.name : `Employee #${t.employee_id}`;

                return (
                  <div
                    key={t.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Bar: ID, Priority & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          #TASK-{t.id}
                        </span>

                        <div className="flex items-center space-x-1.5">
                          {/* Priority Badge / Dropdown */}
                          <select
                            value={t.priority || 'Medium'}
                            onChange={(e) => handlePriorityChange(t.id, e.target.value)}
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border cursor-pointer focus:outline-none ${getPriorityBadge(t.priority)}`}
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                          </select>

                          {/* Status Dropdown */}
                          <select
                            value={t.status}
                            onChange={(e) => handleStatusChange(t.id, e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer focus:outline-none ${getStatusBadge(t.status)}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In-Progress">In-Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      {/* Task Title */}
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {t.title}
                      </h4>
                    </div>

                    {/* Timestamps & Assignee Footer */}
                    <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                      {/* Timestamps */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <span>Created: {formatDate(t.created_at)}</span>
                        {t.updated_at && (
                          <span>Updated: {formatDate(t.updated_at)}</span>
                        )}
                      </div>

                      {/* Employee Avatar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center">
                            {getInitials(empName)}
                          </div>
                          <span className="font-semibold text-slate-700">{empName}</span>
                        </div>

                        <span className="text-[11px] text-slate-400 font-mono">ID: #{t.employee_id}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-lg font-bold">
                📋
              </div>
              <p className="text-xs font-medium">No tasks matching current filters.</p>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          
          <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-slate-300 rounded-lg px-2 py-1 text-xs bg-slate-50 text-slate-800 font-semibold cursor-pointer focus:outline-none"
            >
              <option value={3}>3 tasks</option>
              <option value={6}>6 tasks</option>
              <option value={12}>12 tasks</option>
              <option value={24}>24 tasks</option>
            </select>
            <span className="hidden sm:inline">|</span>
            <span>Total: <b>{totalTasks}</b> tasks</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>

            <div className="px-3 py-1 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>

        </div>

      </main>

      {/* Modal: Add Employee */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Add New Employee</h3>
                <p className="text-[11px] text-slate-500">Creates record via <code>POST /employees/</code></p>
              </div>
              <button
                onClick={() => setIsEmpModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employee Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sarah Jenkins"
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmpModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Add New Task</h3>
                <p className="text-[11px] text-slate-500">Creates task via <code>POST /tasks/</code></p>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Fix database query latency"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Priority *
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Employee *
                </label>
                <select
                  required
                  value={newTaskEmployeeId}
                  onChange={(e) => setNewTaskEmployeeId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white cursor-pointer"
                >
                  <option value="">Select Employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} (ID: #{emp.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
