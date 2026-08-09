# FastAPI Case Study — Employee Task Tracker

A full-stack application built with **FastAPI (Python)**, **SQLAlchemy ORM**, **SQLite**, and **React.js** with **Tailwind CSS**, designed for tracking employee tasks and status updates.

---

## 🌟 Features

- **Employee Management**: Create new employees (`POST /employees/`) and list all registered employees (`GET /employees/`).
- **Task Assignment**: Create tasks linked to valid employees (`POST /tasks/`).
- **Employee Task View**: Retrieve all tasks assigned to a specific employee (`GET /employees/{employee_id}/tasks`).
- **Status Lifecycle Tracking**: Update task statuses (`Pending`, `In-Progress`, `Completed`).
- **Input Validation**: Pydantic schemas enforcing non-empty fields and data constraints.
- **Modern UI**: Clean React.js + Tailwind CSS dashboard with employee filtering and status selectors.

---

## 📁 Repository Structure

```
├── backend/                             # FastAPI Backend Service
│   ├── main.py                          # Application entry & REST API routes
│   ├── database.py                      # SQLAlchemy database session setup
│   ├── models.py                        # Database ORM models (Employee, Task)
│   ├── schemas.py                       # Pydantic validation models
│   └── crud.py                          # CRUD operations database layer
├── frontend/                            # React JS + Tailwind CSS Application
│   ├── src/                             # React App components & API service
│   ├── package.json                     # Frontend dependencies
│   └── vite.config.js                   # Vite configuration
├── PROJECT_WORKFLOW_AND_COMPONENTS.md   # Detailed workflow documentation
└── Employee_Task_Tracker_Case_Study 1.pdf
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install fastapi uvicorn sqlalchemy pydantic
python -m uvicorn main:app --reload
```
The FastAPI backend will start at `http://127.0.0.1:8000`. Access Swagger UI docs at **`http://127.0.0.1:8000/docs`**.

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000/`** in your browser.

---

## 📖 REST API Endpoints

| Method | Endpoint | Description | Constraints |
| :---: | :--- | :--- | :--- |
| `POST` | `/employees/` | Create a new employee | Employee name must not be empty |
| `GET` | `/employees/` | List all employees | Returns array of employees |
| `GET` | `/employees/{employee_id}/tasks` | Get tasks for an employee | Path param: `employee_id` |
| `POST` | `/tasks/` | Create a new task | Non-empty title, valid employee ID |
| `GET` | `/tasks/` | List all tasks | Returns array of tasks |
| `PUT` | `/tasks/{task_id}` | Update task status | Status: `Pending`, `In-Progress`, `Completed` |
