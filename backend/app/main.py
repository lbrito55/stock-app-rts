from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api import auth, stocks


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    init_db()
    print("Database tables created")
    yield
    # Shutdown (if needed)
    print("Application shutting down")


# Create FastAPI app with lifespan
app = FastAPI(
    title="Stock Price Checker API",
    description="API for checking stock prices with authentication",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add basic security headers to all responses"""
    response = await call_next(request)
    
    # Prevent MIME type sniffing attacks
    response.headers["X-Content-Type-Options"] = "nosniff"
    
    # Prevent page from being displayed in frames (clickjacking protection)
    response.headers["X-Frame-Options"] = "DENY"
    
    # Enable XSS filtering in browsers
    response.headers["X-XSS-Protection"] = "1; mode=block"
      
    return response

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(stocks.router, prefix="/stocks", tags=["stocks"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Stock Price Checker API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}