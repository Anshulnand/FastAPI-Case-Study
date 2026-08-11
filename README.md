# FastAPI Case Study — Employee Task Tracker

A full-stack application built with **FastAPI (Python)**, **SQLAlchemy ORM**, **SQLite**, and **React.js** with **Tailwind CSS**, designed for tracking employee tasks, priorities, timestamps, and status lifecycles.

---

## 🌐 Live Demo & Deployment

- 🚀 **Live Demo**: [https://fast-api-case-study-bwuuu3280-anshuls-projects-42761997.vercel.app](https://fast-api-case-study-bwuuu3280-anshuls-projects-42761997.vercel.app)
- 🐙 **GitHub Repository**: [https://github.com/Anshulnand/FastAPI-Case-Study](https://github.com/Anshulnand/FastAPI-Case-Study)

---

## 🌟 Key Features

- 🔐 **JWT Authentication**: User registration (`POST /auth/register`), login (`POST /auth/login`), profile retrieval (`GET /auth/me`), and token persistence with automatic Axios Bearer headers.
- 🏷️ **Task Priority Levels**: Support for `Low`, `Medium`, `High`, and `Urgent` task priorities with color-coded badges and inline priority selection.
- ⏱️ **Task Timestamps**: Automatic `created_at` and `updated_at` timestamps tracked on task records and displayed on task cards.
- 📑 **Server-Side Pagination**: API pagination query parameters (`page`, `limit`) returning total count, items list, and page metadata (`total_pages`).
- 🔍 **Multi-Criteria Filtering & Search**: Instant filtering by Status (`Pending`, `In-Progress`, `Completed`), Priority (`Low`, `Medium`, `High`, `Urgent`), Employee Assignment, and title keyword search.
- 👥 **Employee Management**: Create new employees (`POST /employees/`) and view assigned tasks (`GET /employees/{id}/tasks`).
- 🎨 **Modern Dashboard UI**: Clean glassmorphism React interface with interactive demo presets (`Admin` and `Employee`), metric summary cards, and pagination controls.

---

## 📁 Repository Structure

```
├── backend/                             # FastAPI Backend Service
│   ├── main.py                          # REST API routes & schema migrations
│   ├── auth.py                          # JWT token creation & password hashing
│   ├── database.py                      # SQLAlchemy database session setup
│   ├── models.py                        # ORM models (User, Employee, Task)
│   ├── schemas.py                       # Pydantic validation & response models
│   ├── crud.py                          # Database CRUD operations & pagination
│   └── requirements.txt                 # Backend Python dependencies
├── frontend/                            # React JS + Tailwind CSS Application
│   ├── src/                             # Components, Auth Modal & API service
│   ├── package.json                     # Frontend dependencies
│   └── vite.config.js                   # Vite configuration
├── PROJECT_WORKFLOW_AND_COMPONENTS.md   # System architecture & component guide
└── README.md                            # Main project overview
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

pip install -r requirements.txt
python -m uvicorn main:app --reload
```
The FastAPI backend starts at `http://127.0.0.1:8000`. Access interactive Swagger UI docs at **`http://127.0.0.1:8000/docs`**.

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000/`** in your browser.

---

## 📖 REST API Endpoints

| HTTP Method | Route Endpoint | Description | Features & Parameters |
| :---: | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register user account | Requires `name`, `email`, `password`, `role` |
| `POST` | `/auth/login` | Authenticate user & get JWT | Returns `access_token`, `token_type`, `user` |
| `GET` | `/auth/me` | Get current user profile | Protected by JWT Bearer token |
| `POST` | `/employees/` | Create a new employee | Requires non-empty employee name |
| `GET` | `/employees/` | List all employees | Returns list of employees |
| `GET` | `/employees/{employee_id}/tasks` | Get tasks for an employee | Filtered by `employee_id` |
| `POST` | `/tasks/` | Create a new task | Accepts `title`, `employee_id`, `status`, `priority` |
| `GET` | `/tasks/` | List tasks (Paginated & Filtered) | Query params: `page`, `limit`, `status`, `priority`, `employee_id`, `search` |
| `PUT` | `/tasks/{task_id}` | Update task status / priority | Updates `status`, `priority`, and `updated_at` |

---

## 🔑 Demo Account Credentials

- **Admin Account**: `admin@company.com` / `admin123` (Role: `admin`)
- **Employee Account**: `employee@company.com` / `emp123` (Role: `employee`)
