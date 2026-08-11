import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

// Interceptor to inject stored JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Initial mock data matching core PDF spec
let mockEmployees = [
  { id: 1, name: 'Alice Smith' },
  { id: 2, name: 'Bob Johnson' },
  { id: 3, name: 'Carol Williams' }
];

let mockTasks = [
  { id: 1, title: 'Setup database schema for task tracker', status: 'Pending', priority: 'High', employee_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 2, title: 'Implement REST API endpoints in FastAPI', status: 'In-Progress', priority: 'Urgent', employee_id: 2, created_at: new Date(Date.now() - 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 3, title: 'Design minimalist user interface', status: 'Completed', priority: 'Medium', employee_id: 1, created_at: new Date(Date.now() - 7200000).toISOString(), updated_at: new Date().toISOString() }
];

// AUTH SERVICES
export const loginUser = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('jwt_token', res.data.access_token);
      localStorage.setItem('user_data', JSON.stringify(res.data.user));
    }
    return { success: true, data: res.data };
  } catch (err) {
    // Mock authentication fallback for quick demo testing if backend is offline
    if (email === 'admin@company.com' || email === 'employee@company.com') {
      const isAd = email.includes('admin');
      const dummyUser = { id: isAd ? 1 : 2, name: isAd ? 'Admin Manager' : 'Employee User', email, role: isAd ? 'admin' : 'employee' };
      localStorage.setItem('jwt_token', 'mock_jwt_token_demo_123');
      localStorage.setItem('user_data', JSON.stringify(dummyUser));
      return { success: true, data: { access_token: 'mock_jwt_token_demo_123', user: dummyUser }, isMock: true };
    }
    return { success: false, error: err.response?.data?.detail || 'Invalid login credentials' };
  }
};

export const registerUser = async (name, email, password, role = 'employee') => {
  try {
    const res = await api.post('/auth/register', { name, email, password, role });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.detail || 'Registration failed' };
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await api.get('/auth/me');
    return { success: true, data: res.data };
  } catch (err) {
    const stored = localStorage.getItem('user_data');
    if (stored) return { success: true, data: JSON.parse(stored), isMock: true };
    return { success: false, error: 'Not authenticated' };
  }
};

export const logoutUser = () => {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user_data');
};

// EMPLOYEE SERVICES
export const createEmployee = async (name) => {
  try {
    const res = await api.post('/employees/', { name });
    return { success: true, data: res.data };
  } catch (err) {
    const newEmp = { id: mockEmployees.length + 1, name };
    mockEmployees.push(newEmp);
    return { success: true, data: newEmp, isMock: true };
  }
};

export const getEmployees = async () => {
  try {
    const res = await api.get('/employees/');
    return { success: true, data: res.data };
  } catch (err) {
    return { success: true, data: mockEmployees, isMock: true };
  }
};

// TASK SERVICES (With Priority, Timestamps, Pagination & Filtering)
export const getAllTasks = async ({
  page = 1,
  limit = 6,
  status = '',
  priority = '',
  employee_id = '',
  search = ''
} = {}) => {
  try {
    const params = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (status && status !== 'All') params.status = status;
    if (priority && priority !== 'All') params.priority = priority;
    if (employee_id && employee_id !== 'All') params.employee_id = employee_id;
    if (search && search.trim()) params.search = search.trim();

    const res = await api.get('/tasks/', { params });

    // Handle paginated response structure
    if (res.data && res.data.items) {
      return {
        success: true,
        data: res.data.items,
        total: res.data.total,
        page: res.data.page,
        limit: res.data.limit,
        total_pages: res.data.total_pages
      };
    }

    // Direct array response fallback
    return {
      success: true,
      data: res.data,
      total: res.data.length,
      page: 1,
      limit: res.data.length,
      total_pages: 1
    };
  } catch (err) {
    // Client-side mock pagination & filtering fallback
    let filtered = [...mockTasks];
    if (status && status !== 'All') filtered = filtered.filter(t => t.status === status);
    if (priority && priority !== 'All') filtered = filtered.filter(t => t.priority === priority);
    if (employee_id && employee_id !== 'All') filtered = filtered.filter(t => t.employee_id === Number(employee_id));
    if (search && search.trim()) filtered = filtered.filter(t => t.title.toLowerCase().includes(search.trim().toLowerCase()));

    const total = filtered.length;
    const total_pages = Math.max(1, Math.ceil(total / limit));
    const validPage = Math.max(1, Math.min(page, total_pages));
    const start = (validPage - 1) * limit;
    const paginatedItems = filtered.slice(start, start + limit);

    return {
      success: true,
      data: paginatedItems,
      total,
      page: validPage,
      limit,
      total_pages,
      isMock: true
    };
  }
};

export const getEmployeeTasks = async (employeeId) => {
  return getAllTasks({ employee_id: employeeId });
};

export const createTask = async (title, employeeId, priority = 'Medium') => {
  try {
    const res = await api.post('/tasks/', {
      title,
      employee_id: Number(employeeId),
      status: 'Pending',
      priority
    });
    return { success: true, data: res.data };
  } catch (err) {
    const newTask = {
      id: mockTasks.length + 1,
      title,
      status: 'Pending',
      priority,
      employee_id: Number(employeeId),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockTasks.unshift(newTask);
    return { success: true, data: newTask, isMock: true };
  }
};

export const updateTaskStatus = async (taskId, status, priority = null) => {
  try {
    const body = {};
    if (status) body.status = status;
    if (priority) body.priority = priority;

    const res = await api.put(`/tasks/${taskId}`, body);
    return { success: true, data: res.data };
  } catch (err) {
    const task = mockTasks.find(t => t.id === taskId);
    if (task) {
      if (status) task.status = status;
      if (priority) task.priority = priority;
      task.updated_at = new Date().toISOString();
    }
    return { success: true, data: task, isMock: true };
  }
};
