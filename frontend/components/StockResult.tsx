import { StockData } from '@/types/stock';

interface StockResultProps {
  stockData: StockData;
}

export function StockResult({ stockData }: StockResultProps) {
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="stock-result">
      <h3>{stockData.symbol}</h3>
      <div style={{ marginTop: '10px' }}>
        <p>
          <strong>Opening Price:</strong> {formatPrice(stockData.opening_price)}
        </p>
        <p>
          <strong>Current Price:</strong> {formatPrice(stockData.current_price)}
        </p>
        <p>
          <strong>High:</strong> {formatPrice(stockData.high_price)}
        </p>
        <p>
          <strong>Low:</strong> {formatPrice(stockData.low_price)}
        </p>
        <p>
          <strong>Previous Close:</strong>{' '}
          {formatPrice(stockData.previous_close)}
        </p>
      </div>
    </div>
  );
}
