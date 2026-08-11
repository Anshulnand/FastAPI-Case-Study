from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

# ---------------- USER & AUTH SCHEMAS ----------------
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4)
    role: Optional[str] = "employee"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None


# ---------------- EMPLOYEE SCHEMAS ----------------
class EmployeeCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Employee name must not be empty")

class EmployeeResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


# ---------------- TASK SCHEMAS ----------------
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, description="Task title must not be empty")
    employee_id: int = Field(..., description="ID of the employee the task belongs to")
    status: Optional[str] = "Pending"
    priority: Optional[str] = "Medium"

class TaskStatusUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    status: str
    priority: str = "Medium"
    employee_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PaginatedTaskResponse(BaseModel):
    items: List[TaskResponse]
    total: int
    page: int
    limit: int
    total_pages: int