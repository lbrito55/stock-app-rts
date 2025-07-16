from pydantic import BaseModel, Field, ConfigDict


class StockQuoteRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "symbol": "AAPL"
            }
        }
    )
    
    symbol: str = Field(..., description="Stock symbol (e.g., AAPL, GOOGL)")


class StockQuoteResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "symbol": "AAPL",
                "opening_price": 150.25,
                "current_price": 152.50,
                "high_price": 153.00,
                "low_price": 149.50,
                "previous_close": 150.00
            }
        }
    )
    
    symbol: str
    opening_price: float = Field(..., description="Opening price")
    current_price: float = Field(..., description="Current price")
    high_price: float = Field(..., description="Day's high price")
    low_price: float = Field(..., description="Day's low price")
    previous_close: float = Field(..., description="Previous closing price")