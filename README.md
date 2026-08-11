# FastAPI Case Study — Employee Task Tracker

A full-stack application built with **FastAPI (Python)**, **SQLAlchemy ORM**, **SQLite**, and **React.js** with **Tailwind CSS**, designed for tracking employee tasks, priorities, timestamps, and status lifecycles.

---

## 🌐 Live Demo & Deployment

- 🚀 **Live Demo**: [https://fast-api-case-study-bwuuu3280-anshuls-projects-42761997.vercel.app](https://fast-api-case-study-bwuuu3280-anshuls-projects-42761997.vercel.app)
- 🐙 **GitHub Repository**: [https://github.com/Anshulnand/FastAPI-Case-Study](https://github.com/Anshulnand/FastAPI-Case-Study)

---

## 🌟 Comprehensive Feature Catalog

### 🔐 1. Authentication & Security (JWT)
- **User Registration (`POST /auth/register`)**: Register new user accounts with full name, email, password, and role (`employee` or `admin`).
- **User Login (`POST /auth/login`)**: Validates credentials against hashed passwords (`pbkdf2_sha256`) and issues a signed JSON Web Token (JWT with 24-hour expiry).
- **Authenticated Profile (`GET /auth/me`)**: Retrieves current user profile using `Authorization: Bearer <token>` headers.
- **Axios Token Interceptor**: Automatically attaches the stored JWT token to all outbound HTTP API requests.
- **Auth UI Modal**: Tabbed Sign In and Account Registration view with **1-click autofill presets** for `Employee Demo` (`employee@company.com`) and `Admin Demo` (`admin@company.com`).
- **Persistent User Session**: User details and tokens stored in `localStorage` with a live user state indicator and logout button in the header.

### ⏱️ 2. Task Timestamps & Audit Tracking
- **Creation Timestamp (`created_at`)**: Automatically records the UTC timestamp when a task is created.
- **Update Timestamp (`updated_at`)**: Automatically updates whenever a task's status or priority is modified.
- **Formatted UI Display**: Rendered on each task card as formatted dates (e.g., `Created: Aug 11, 22:30` / `Updated: Aug 11, 22:35`) with clock indicators.

### 🏷️ 3. Task Priority Levels
- **4-Tier Priority System**: Tasks can be categorized into `Low`, `Medium`, `High`, and `Urgent` priority.
- **Distinct Color-Coded Badges**:
  - 🔴 **Urgent**: Rose/Red badge (`bg-rose-50 text-rose-700 border-rose-200`)
  - 🟠 **High**: Orange/Amber badge (`bg-orange-50 text-orange-700 border-orange-200`)
  - 🔵 **Medium**: Blue badge (`bg-sky-50 text-sky-700 border-sky-200`)
  - ⚪ **Low**: Slate/Gray badge (`bg-slate-100 text-slate-600 border-slate-200`)
- **Priority Selector**: Selectable during task creation modal and modifiable directly via an inline priority dropdown on task cards.

### 📑 4. Server-Side Pagination
- **API Query Parameters**: `page` (1-indexed) and `limit` (page size).
- **Structured Response (`PaginatedTaskResponse`)**: Returns `items`, `total`, `page`, `limit`, and `total_pages`.
- **Interactive UI Pagination Controls**:
  - `← Previous` and `Next →` navigation buttons with disabled state at boundaries.
  - Page indicator badge (`Page X of Y`).
  - Items per page dropdown selector (`3`, `6`, `12`, `24` tasks per page).
  - Total items counter (`Total: N tasks`).

### 🔍 5. Multi-Criteria Task Filtering & Real-Time Search
- **Status Filter**: Filter task list by status (`All Statuses`, `Pending`, `In-Progress`, `Completed`).
- **Priority Filter**: Filter task list by priority (`All Priorities`, `Low`, `Medium`, `High`, `Urgent`).
- **Employee Filter**: Filter tasks by assigned employee (`GET /tasks?employee_id=X`).
- **Real-Time Keyword Search**: Instant title search matching keyword input (`GET /tasks?search=...`).
- **Reset All Filters Button**: One-click action to restore default unfiltered view.

### 👥 6. Employee & Task CRUD Management (Core Specs)
- **Create Employee (`POST /employees/`)**: Validates non-empty employee name using Pydantic.
- **List Employees (`GET /employees/`)**: Fetches all employees for selection dropdowns.
- **Create Task (`POST /tasks/`)**: Links task to valid employee ID, validates non-empty title.
- **Update Task Status (`PUT /tasks/{task_id}`)**: Enforces status lifecycle constraint (`Pending`, `In-Progress`, `Completed`).
- **Live Summary Metrics**: Real-time summary metric cards displaying Total, Pending, In-Progress, and Completed task counts.

### ⚡ 7. Auto DB Schema Migration & Pre-Seeded Users
- **SQLite Auto-Migration Helper (`ensure_db_schema()`)**: Automatically detects and adds missing table columns (`priority`, `created_at`, `updated_at`, `users` table) without losing existing data.
- **Pre-Seeded Accounts**: Auto-seeds demo accounts (`admin@company.com` / `admin123` and `employee@company.com` / `emp123`) on app startup.

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
├── PROJECT_WORKFLOW_AND_COMPONENTS.md   # System architecture & feature catalog
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
