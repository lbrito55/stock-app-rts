import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.models.user import User

# Use TEST database URL from environment
TEST_DATABASE_URL = os.getenv("DATABASE_URL_TEST", "mysql://root:password@test-db:3306/stockapp_test")
engine = create_engine(TEST_DATABASE_URL, pool_pre_ping=True)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session")
def setup_database():
    """Create test database tables once per test session"""
    # Create all tables in test database
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client(setup_database):
    """Test client with clean state for each test"""
    # Clear security state between tests
    from app.core.token_blacklist import clear_blacklist
    clear_blacklist()       # Clear token blacklist
    
    # Clean up test data from previous tests
    with engine.connect() as conn:
        conn.execute(text("DELETE FROM users"))
        conn.commit()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def db_session(setup_database):
    """Database session for tests that need direct DB access"""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def test_user(db_session):
    """Create a test user for tests that need an existing user"""
    from app.core.security import get_password_hash
    
    user = User(
        email="testuser@example.com",
        hashed_password=get_password_hash("testpassword123")
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user