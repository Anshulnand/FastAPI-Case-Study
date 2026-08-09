from sqlalchemy.orm import Session
from models import Employee, Task

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
    db_task = Task(
        title=task.title,
        status=task.status or "Pending",
        employee_id=task.employee_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def get_all_tasks(db: Session):
    return db.query(Task).all()


def get_tasks_by_employee(db: Session, employee_id: int):
    return db.query(Task).filter(Task.employee_id == employee_id).all()


def update_task_status(db: Session, task_id: int, status: str):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task:
        task.status = status
        db.commit()
        db.refresh(task)
    return task