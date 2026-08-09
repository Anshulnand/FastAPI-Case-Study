from pydantic import BaseModel, Field
from typing import Optional

class EmployeeCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Employee name must not be empty")

class EmployeeResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, description="Task title must not be empty")
    employee_id: int = Field(..., description="ID of the employee the task belongs to")
    status: Optional[str] = "Pending"

class TaskStatusUpdate(BaseModel):
    status: str

class TaskResponse(BaseModel):
    id: int
    title: str
    status: str
    employee_id: int

    class Config:
        from_attributes = True