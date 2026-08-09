import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 4000,
});

// Initial mock data matching core PDF spec
let mockEmployees = [
  { id: 1, name: 'Alice Smith' },
  { id: 2, name: 'Bob Johnson' },
  { id: 3, name: 'Carol Williams' }
];

let mockTasks = [
  { id: 1, title: 'Setup database schema for task tracker', status: 'Pending', employee_id: 1 },
  { id: 2, title: 'Implement REST API endpoints in FastAPI', status: 'In-Progress', employee_id: 2 },
  { id: 3, title: 'Design minimalist user interface', status: 'Completed', employee_id: 1 }
];

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

export const getEmployeeTasks = async (employeeId) => {
  try {
    const res = await api.get(`/employees/${employeeId}/tasks`);
    return { success: true, data: res.data };
  } catch (err) {
    const tasks = mockTasks.filter(t => t.employee_id === Number(employeeId));
    return { success: true, data: tasks, isMock: true };
  }
};

export const createTask = async (title, employeeId) => {
  try {
    const res = await api.post('/tasks/', { title, employee_id: Number(employeeId), status: 'Pending' });
    return { success: true, data: res.data };
  } catch (err) {
    const newTask = {
      id: mockTasks.length + 1,
      title,
      status: 'Pending',
      employee_id: Number(employeeId)
    };
    mockTasks.unshift(newTask);
    return { success: true, data: newTask, isMock: true };
  }
};

export const getAllTasks = async () => {
  try {
    const res = await api.get('/tasks/');
    return { success: true, data: res.data };
  } catch (err) {
    return { success: true, data: mockTasks, isMock: true };
  }
};

export const updateTaskStatus = async (taskId, status) => {
  try {
    const res = await api.put(`/tasks/${taskId}`, { status });
    return { success: true, data: res.data };
  } catch (err) {
    const task = mockTasks.find(t => t.id === taskId);
    if (task) task.status = status;
    return { success: true, data: task, isMock: true };
  }
};
