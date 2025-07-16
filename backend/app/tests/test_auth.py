import pytest
from app.models.user import User


def test_signup_user(client):
    """Test user registration with valid password."""
    response = client.post(
        "/auth/signup",
        json={"email": "test@example.com", "password": "testpassword123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "created_at" in data


def test_signup_weak_password(client):
    """Test signup fails with weak passwords."""
    # Test password too short
    response = client.post(
        "/auth/signup",
        json={"email": "weak1@example.com", "password": "short"}
    )
    assert response.status_code == 422
    assert "at least 8 characters" in str(response.json())
    
    # Test password with no numbers
    response = client.post(
        "/auth/signup",
        json={"email": "weak2@example.com", "password": "passwordonly"}
    )
    assert response.status_code == 422
    assert "at least one number" in str(response.json())
    
    # Test password with no letters
    response = client.post(
        "/auth/signup",
        json={"email": "weak3@example.com", "password": "12345678"}
    )
    assert response.status_code == 422
    assert "at least one letter" in str(response.json())


def test_signup_duplicate_user(client):
    """Test signing up duplicate user fails."""
    # Signup first user
    client.post(
        "/auth/signup",
        json={"email": "duplicate@example.com", "password": "testpassword123"}
    )
    
    # Try to signup same email
    response = client.post(
        "/auth/signup",
        json={"email": "duplicate@example.com", "password": "testpassword123"}
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_login_user(client):
    """Test user login."""
    # Sign up user first
    client.post(
        "/auth/signup",
        json={"email": "login@example.com", "password": "testpassword123"}
    )
    
    # Login
    response = client.post(
        "/auth/login",
        json={"email": "login@example.com", "password": "testpassword123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    """Test login with wrong password."""
    # Signup user first
    client.post(
        "/auth/signup",
        json={"email": "wrongpass@example.com", "password": "correctpassword123"}
    )
    
    # Login with wrong password
    response = client.post(
        "/auth/login",
        json={"email": "wrongpass@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_logout_endpoint(client):
    """Test logout endpoint blacklists token."""
    # Sign up and login
    client.post(
        "/auth/signup",
        json={"email": "logout@example.com", "password": "testpassword123"}
    )
    login_response = client.post(
        "/auth/login",
        json={"email": "logout@example.com", "password": "testpassword123"}
    )
    token = login_response.json()["access_token"]
    
    # Use token to access protected endpoint
    response = client.get(
        "/stocks/quote/AAPL",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code != 401
    
    # Logout
    logout_response = client.post(
        "/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert logout_response.status_code == 200
    assert "Successfully logged out" in logout_response.json()["message"]
    
    # Try to use token after logout
    response = client.get(
        "/stocks/quote/AAPL",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401
    assert "Token has been revoked" in response.json()["detail"]


def test_logout_without_token(client):
    """Test logout without providing token fails."""
    response = client.post("/auth/logout")
    assert response.status_code == 403  


def test_security_headers_present(client):
    """Test that security headers are added to responses."""
    response = client.get("/health")
    
    # Check that security headers are present
    assert "X-Content-Type-Options" in response.headers
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    
    assert "X-Frame-Options" in response.headers
    assert response.headers["X-Frame-Options"] == "DENY"
    
    assert "X-XSS-Protection" in response.headers
    assert response.headers["X-XSS-Protection"] == "1; mode=block"