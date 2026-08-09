from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

import models, schemas, crud
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Employee Task Tracker API",
    description="Backend service demonstrating REST API design, ORM usage, and CRUD operations.",
    version="1.0.0"
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

    # Validate employee exists
    emp = crud.get_employee_by_id(db, task.employee_id)
    if not emp:
        raise HTTPException(status_code=400, detail="Each task must be linked to a valid employee")

    # Validate status constraint
    valid_statuses = ["Pending", "In-Progress", "Completed"]
    if task.status and task.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Task status must be one of: {', '.join(valid_statuses)}"
        )

    return crud.create_task(db, task)


@app.get("/tasks/", response_model=List[schemas.TaskResponse])
@app.get("/tasks", response_model=List[schemas.TaskResponse])
def get_all_tasks(db: Session = Depends(get_db)):
    return crud.get_all_tasks(db)


@app.put("/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task_status(
    task_id: int,
    payload: Optional[schemas.TaskStatusUpdate] = Body(None),
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    new_status = status
    if payload and payload.status:
        new_status = payload.status

    if not new_status:
        raise HTTPException(status_code=400, detail="Task status is required")

    valid_statuses = ["Pending", "In-Progress", "Completed"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Task status must be one of: {', '.join(valid_statuses)}"
        )

    updated_task = crud.update_task_status(db, task_id, new_status)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")

    return updated_task