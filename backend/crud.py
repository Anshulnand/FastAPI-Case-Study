from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timezone
import math
from models import Employee, Task, User
import auth

# ---------------- USER CRUD ----------------
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user_data):
    hashed_pwd = auth.get_password_hash(user_data.password)
    db_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_pwd,
        role=user_data.role or "employee",
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Also automatically create an Employee record if not exists
    existing_emp = db.query(Employee).filter(Employee.name == db_user.name).first()
    if not existing_emp:
        db_emp = Employee(name=db_user.name)
        db.add(db_emp)
        db.commit()

    return db_user

# ---------------- EMPLOYEE CRUD ----------------
def create_employee(db: Session, employee):
    db_employee = Employee(name=employee.name)
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def get_all_employees(db: Session):
    return db.query(Employee).all()

def get_employee_by_id(db: Session, employee_id: int):
    return db.query(Employee).filter(Employee.id == employee_id).first()

# ---------------- TASK CRUD ----------------
def create_task(db: Session, task):
    now = datetime.now(timezone.utc)
    db_task = Task(
        title=task.title,
        status=task.status or "Pending",
        priority=task.priority or "Medium",
        employee_id=task.employee_id,
        created_at=now,
        updated_at=now
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_all_tasks(db: Session):
    return db.query(Task).order_by(Task.id.desc()).all()

def get_tasks_by_employee(db: Session, employee_id: int):
    return db.query(Task).filter(Task.employee_id == employee_id).order_by(Task.id.desc()).all()

def get_paginated_tasks(
    db: Session,
    page: int = 1,
    limit: int = 10,
    status: str = None,
    priority: str = None,
    employee_id: int = None,
    search: str = None
):
    query = db.query(Task)

    if status and status.lower() != "all":
        query = query.filter(Task.status == status)

    if priority and priority.lower() != "all":
        query = query.filter(Task.priority == priority)

    if employee_id is not None:
        query = query.filter(Task.employee_id == employee_id)

    if search and search.strip():
        search_pattern = f"%{search.strip()}%"
        query = query.filter(Task.title.ilike(search_pattern))

    total = query.count()
    total_pages = max(1, math.ceil(total / limit)) if limit > 0 else 1

    page = max(1, min(page, total_pages))
    offset = (page - 1) * limit

    tasks = query.order_by(Task.id.desc()).offset(offset).limit(limit).all()
    return tasks, total, page, total_pages

def update_task_status(db: Session, task_id: int, status: str = None, priority: str = None):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task:
        if status:
            task.status = status
        if priority:
            task.priority = priority
        task.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(task)
    return task