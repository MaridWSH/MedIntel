"""Authentication-related Pydantic schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    email: str = Field(..., min_length=3, max_length=255, description="User email address used for login and account recovery.")
    name: str = Field(..., min_length=1, max_length=255, description="Display name for the user account.")
    password: str = Field(..., min_length=6, description="Password for the new account. Must be at least 6 characters.")


class UserLogin(BaseModel):
    email: str = Field(..., description="Registered email address.")
    password: str = Field(..., description="Account password.")


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


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
    email: str


class ForgotPasswordResponse(BaseModel):
    message: str


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str = Field(..., min_length=6)


class ResetPasswordResponse(BaseModel):
    message: str


class LogoutResponse(BaseModel):
    message: str
