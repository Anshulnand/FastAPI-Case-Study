from fastapi import FastAPI, Depends, HTTPException, Body, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import inspect, text
from typing import List, Optional, Union
from datetime import datetime, timezone

import models, schemas, crud, auth
from database import engine, SessionLocal

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

# Helper function to migrate existing SQLite columns if needed
def ensure_db_schema():
    with engine.connect() as conn:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        if "users" in tables:
            columns = [c["name"] for c in inspector.get_columns("users")]
            if "hashed_password" not in columns or "email" not in columns:
                conn.execute(text("DROP TABLE users"))
                conn.commit()
                models.Base.metadata.tables["users"].create(bind=engine)
        if "tasks" in tables:
            columns = [c["name"] for c in inspector.get_columns("tasks")]
            if "priority" not in columns:
                conn.execute(text("ALTER TABLE tasks ADD COLUMN priority VARCHAR DEFAULT 'Medium'"))
            if "created_at" not in columns:
                conn.execute(text("ALTER TABLE tasks ADD COLUMN created_at DATETIME"))
            if "updated_at" not in columns:
                conn.execute(text("ALTER TABLE tasks ADD COLUMN updated_at DATETIME"))
            conn.commit()

ensure_db_schema()

# Seed default demo users if users table is empty
def seed_demo_users():
    db = SessionLocal()
    try:
        if db.query(models.User).count() == 0:
            crud.create_user(db, schemas.UserCreate(
                name="Admin Manager",
                email="admin@company.com",
                password="admin123",
                role="admin"
            ))
            crud.create_user(db, schemas.UserCreate(
                name="Employee User",
                email="employee@company.com",
                password="emp123",
                role="employee"
            ))
    except Exception as e:
        print(f"Error seeding users: {e}")
    finally:
        db.close()

seed_demo_users()

app = FastAPI(
    title="Employee Task Tracker API",
    description="Backend service with REST API design, ORM usage, JWT Auth, Priority, Timestamps, Pagination, and Filtering.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- AUTH APIs ----------------

@app.post("/auth/register", response_model=schemas.UserResponse, status_code=201)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A user with this email address already exists"
        )
    return crud.create_user(db, user_in)

@app.post("/auth/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, user_in.email)
    if not user or not auth.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/auth/me", response_model=schemas.UserResponse)
def get_current_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


# ---------------- EMPLOYEE APIs ----------------

@app.post("/employees/", response_model=schemas.EmployeeResponse, status_code=201)
@app.post("/employees", response_model=schemas.EmployeeResponse, status_code=201)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    if not employee.name or not employee.name.strip():
        raise HTTPException(status_code=400, detail="Employee name must not be empty")
    return crud.create_employee(db, employee)

@app.get("/employees/", response_model=List[schemas.EmployeeResponse])
@app.get("/employees", response_model=List[schemas.EmployeeResponse])
def get_all_employees(db: Session = Depends(get_db)):
    return crud.get_all_employees(db)

@app.get("/employees/{employee_id}/tasks", response_model=List[schemas.TaskResponse])
def get_employee_tasks(employee_id: int, db: Session = Depends(get_db)):
    emp = crud.get_employee_by_id(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return crud.get_tasks_by_employee(db, employee_id)


# ---------------- TASK APIs ----------------

@app.post("/tasks/", response_model=schemas.TaskResponse, status_code=201)
@app.post("/tasks", response_model=schemas.TaskResponse, status_code=201)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    if not task.title or not task.title.strip():
        raise HTTPException(status_code=400, detail="Task title must not be empty")

    emp = crud.get_employee_by_id(db, task.employee_id)
    if not emp:
        raise HTTPException(status_code=400, detail="Each task must be linked to a valid employee")

    valid_statuses = ["Pending", "In-Progress", "Completed"]
    if task.status and task.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Task status must be one of: {', '.join(valid_statuses)}"
        )

    valid_priorities = ["Low", "Medium", "High", "Urgent"]
    if task.priority and task.priority not in valid_priorities:
        raise HTTPException(
            status_code=400,
            detail=f"Task priority must be one of: {', '.join(valid_priorities)}"
        )

    return crud.create_task(db, task)


@app.get("/tasks/", response_model=Union[schemas.PaginatedTaskResponse, List[schemas.TaskResponse]])
@app.get("/tasks", response_model=Union[schemas.PaginatedTaskResponse, List[schemas.TaskResponse]])
def get_tasks(
    page: Optional[int] = Query(None, ge=1, description="Page number for pagination"),
    limit: Optional[int] = Query(None, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status (Pending, In-Progress, Completed)"),
    priority: Optional[str] = Query(None, description="Filter by priority (Low, Medium, High, Urgent)"),
    employee_id: Optional[int] = Query(None, description="Filter by employee ID"),
    search: Optional[str] = Query(None, description="Search term in title"),
    db: Session = Depends(get_db)
):
    # If no pagination parameters provided, return simple list for backwards compatibility
    if page is None and limit is None and not status and not priority and employee_id is None and not search:
        return crud.get_all_tasks(db)

    effective_page = page or 1
    effective_limit = limit or 10

    tasks, total, current_page, total_pages = crud.get_paginated_tasks(
        db=db,
        page=effective_page,
        limit=effective_limit,
        status=status,
        priority=priority,
        employee_id=employee_id,
        search=search
    )

    return {
        "items": tasks,
        "total": total,
        "page": current_page,
        "limit": effective_limit,
        "total_pages": total_pages
    }


@app.put("/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    payload: Optional[schemas.TaskStatusUpdate] = Body(None),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    new_status = status
    new_priority = priority

    if payload:
        if payload.status:
            new_status = payload.status
        if payload.priority:
            new_priority = payload.priority

    valid_statuses = ["Pending", "In-Progress", "Completed"]
    if new_status and new_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Task status must be one of: {', '.join(valid_statuses)}"
        )

    valid_priorities = ["Low", "Medium", "High", "Urgent"]
    if new_priority and new_priority not in valid_priorities:
        raise HTTPException(
            status_code=400,
            detail=f"Task priority must be one of: {', '.join(valid_priorities)}"
        )

    updated_task = crud.update_task_status(db, task_id, status=new_status, priority=new_priority)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")

    return updated_task