import pytest
from unittest.mock import patch, Mock, AsyncMock


def test_get_stock_quote_unauthorized(client):
    """Test stock quote without authentication."""
    response = client.get("/stocks/quote/AAPL")
    assert response.status_code == 403  # No auth header provided


def test_get_stock_quote_authorized(client):
    """Test stock quote with authentication."""
    # Sign up and login
    client.post(
        "/auth/signup",
        json={"email": "stocks@example.com", "password": "testpassword123"}
    )
    login_response = client.post(
        "/auth/login",
        json={"email": "stocks@example.com", "password": "testpassword123"}
    )
    token = login_response.json()["access_token"]
    
    # Mock the external API call
    with patch('app.api.stocks.httpx.AsyncClient') as mock_client:
        mock_response = Mock()
        mock_response.json.return_value = {
            "o": 150.25,
            "c": 152.50,
            "h": 153.00,
            "l": 149.50,
            "pc": 150.00
        }
        mock_response.raise_for_status = Mock()
        
        # Create async context manager mock
        mock_instance = AsyncMock()
        mock_instance.get = AsyncMock(return_value=mock_response)
        mock_client.return_value.__aenter__ = AsyncMock(return_value=mock_instance)
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
        
        # Make request with auth (now using GET with path parameter)
        response = client.get(
            "/stocks/quote/AAPL",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "AAPL"
        assert data["opening_price"] == 150.25
        assert data["current_price"] == 152.50


def test_get_stock_quote_with_blacklisted_token(client):
    """Test that blacklisted tokens cannot access stock quotes."""
    # Sign up and login
    client.post(
        "/auth/signup",
        json={"email": "blacklist@example.com", "password": "testpassword123"}
    )
    login_response = client.post(
        "/auth/login",
        json={"email": "blacklist@example.com", "password": "testpassword123"}
    )
    token = login_response.json()["access_token"]
    
    # Logout to blacklist the token
    client.post(
        "/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Try to use blacklisted token
    response = client.get(
        "/stocks/quote/AAPL",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401
    assert "Token has been revoked" in response.json()["detail"]


def test_get_stock_quote_invalid_symbol(client):
    """Test stock quote with invalid symbol format."""
    # Sign up and login
    client.post(
        "/auth/signup",
        json={"email": "invalid@example.com", "password": "testpassword123"}
    )
    login_response = client.post(
        "/auth/login",
        json={"email": "invalid@example.com", "password": "testpassword123"}
    )
    token = login_response.json()["access_token"]
    
    # Test with invalid symbol (too long)
    response = client.get(
        "/stocks/quote/TOOLONG",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422  # Validation error
    
    # Test with invalid symbol (lowercase)
    response = client.get(
        "/stocks/quote/aapl",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422  # Validation error
    
    # Test with invalid symbol (numbers)
    response = client.get(
        "/stocks/quote/123",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422  # Validation error


def test_get_stock_quote_not_found(client):
    """Test stock quote for symbol with no data."""
    # Sign up and login
    client.post(
        "/auth/signup",
        json={"email": "notfound@example.com", "password": "testpassword123"}
    )
    login_response = client.post(
        "/auth/login",
        json={"email": "notfound@example.com", "password": "testpassword123"}
    )
    token = login_response.json()["access_token"]
    
    # Mock the external API call with no data
    with patch('app.api.stocks.httpx.AsyncClient') as mock_client:
        mock_response = Mock()
        # Finnhub returns these specific values for invalid symbols
        mock_response.json.return_value = {
            "o": 0,
            "c": 0,
            "h": 0,
            "l": 0,
            "pc": 0,
            "d": None,
            "dp": None,
            "t": 0
        }
        mock_response.raise_for_status = Mock()
        
        # Create async context manager mock
        mock_instance = AsyncMock()
        mock_instance.get = AsyncMock(return_value=mock_response)
        mock_client.return_value.__aenter__ = AsyncMock(return_value=mock_instance)
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
        
        # Make request with auth (using valid format but non-existent symbol)
        response = client.get(
            "/stocks/quote/FAKE",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 404
        assert "No data found" in response.json()["detail"]


def test_get_stock_quote_external_api_error(client):
    """Test stock quote when external API fails."""
    # Sign up and login
    client.post(
        "/auth/signup",
        json={"email": "apierror@example.com", "password": "testpassword123"}
    )
    login_response = client.post(
        "/auth/login",
        json={"email": "apierror@example.com", "password": "testpassword123"}
    )
    token = login_response.json()["access_token"]
    
    # Mock the external API call to raise an error
    with patch('app.api.stocks.httpx.AsyncClient') as mock_client:
        from httpx import HTTPStatusError
        
        # Create async context manager mock that raises an error
        mock_instance = AsyncMock()
        mock_response = Mock()
        mock_response.status_code = 500
        mock_instance.get = AsyncMock(side_effect=HTTPStatusError("API Error", request=Mock(), response=mock_response))
        mock_client.return_value.__aenter__ = AsyncMock(return_value=mock_instance)
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
        
        # Make request with auth
        response = client.get(
            "/stocks/quote/AAPL",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 503
        assert "Unable to fetch stock data" in response.json()["detail"]