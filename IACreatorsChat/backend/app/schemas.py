from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    username: str = Field(min_length=3)
    email: EmailStr
    password: str = Field(min_length=6)

class LoginRequest(BaseModel):
    username: str
    password: str
