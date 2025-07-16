from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.token_blacklist import blacklist_token
from app.core.deps import security, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, User as UserSchema, Token

router = APIRouter()


@router.post("/signup", response_model=UserSchema)
async def signup(
    request: Request,
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """Signs up a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    user_credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Login user and return access token."""
    
    client_info = request.client or request.scope.get("client")
    if client_info is None:
        client_ip = "127.0.0.1"
    elif hasattr(client_info, "host"):
        client_ip = client_info.host
    elif isinstance(client_info, (tuple, list)) and client_info:
        client_ip = client_info[0]
    else:
        client_ip = "127.0.0.1"
    
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    # Verify user exists and password is correct
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/validate", response_model=UserSchema)
async def validate_token(
    current_user: User = Depends(get_current_user)
):
    """Validate the current user's token and return user info."""
    return current_user


@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Logout user by blacklisting their current token."""
    token = credentials.credentials
    
    blacklist_token(token)
    
    return {"message": "Successfully logged out"}