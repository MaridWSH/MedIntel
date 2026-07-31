"""Pydantic schemas for authentication and account management."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr = Field(..., description="User email address used for login and account recovery.")
    name: str = Field(..., min_length=1, max_length=255, description="Display name for the user account.")
    password: str = Field(..., min_length=8, max_length=128, description="Password for the new account. Must be at least 8 characters.")


class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Registered email address.")
    password: str = Field(..., min_length=1, max_length=128, description="Account password.")


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    is_admin: bool
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str = Field(..., description="JWT access token for authenticated requests.")
    token_type: str = Field("bearer", description="OAuth2 token type.")


class LoginResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token returned after successful login.")
    token_type: str = Field("bearer", description="OAuth2 token type.")
    user: UserOut = Field(..., description="Authenticated user profile data.")


class RegisterResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token returned after successful registration.")
    token_type: str = Field("bearer", description="OAuth2 token type.")
    user: UserOut = Field(..., description="Profile data for the newly registered user.")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str


class ResetPasswordRequest(BaseModel):
    reset_token: str = Field(..., min_length=32, max_length=255)
    new_password: str = Field(..., min_length=8, max_length=128)


class ResetPasswordResponse(BaseModel):
    message: str


class LogoutResponse(BaseModel):
    message: str


class DeleteAccountResponse(BaseModel):
    message: str
