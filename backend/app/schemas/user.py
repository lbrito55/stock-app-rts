from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, password: str) -> str:
        """Simple password validation - at least 8 characters with mix of letters and numbers"""
        if len(password) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        has_letter = any(char.isalpha() for char in password)
        has_number = any(char.isdigit() for char in password)
        
        if not has_letter:
            raise ValueError('Password must contain at least one letter')
        if not has_number:
            raise ValueError('Password must contain at least one number')
            
        return password


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None