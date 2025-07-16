from fastapi import APIRouter, Depends, HTTPException, status, Path
import httpx
from app.core.config import settings
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.stock import StockQuoteResponse

router = APIRouter()


@router.get("/quote/{symbol}", response_model=StockQuoteResponse)
async def get_stock_quote(
    symbol: str = Path(..., description="Stock symbol (e.g., AAPL, GOOGL)", pattern="^[A-Z]{1,5}$"),
    current_user: User = Depends(get_current_user)
):
    """Get stock quote for a given symbol. Requires authentication."""
    symbol = symbol.upper()
    
    # Call Finnhub API
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{settings.FINNHUB_BASE_URL}/quote",
                params={
                    "symbol": symbol,
                    "token": settings.FINNHUB_API_KEY
                }
            )
            response.raise_for_status()
            data = response.json()
            
            # Check if we got valid data
            if data.get("o") == 0 and data.get("h") == 0 and data.get("l") == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No data found for symbol: {symbol}"
                )
            
            return StockQuoteResponse(
                symbol=symbol,
                opening_price=data.get("o", 0),
                current_price=data.get("c", 0),
                high_price=data.get("h", 0),
                low_price=data.get("l", 0),
                previous_close=data.get("pc", 0)
            )
            
        except HTTPException:
            # Re-raise HTTPException without catching it
            raise
        except httpx.HTTPStatusError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to fetch stock data"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred while fetching stock data"
            )