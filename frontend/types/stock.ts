export interface StockData {
  symbol: string;
  opening_price: number;
  current_price: number;
  high_price: number;
  low_price: number;
  previous_close: number;
}

export interface StockQuoteResponse {
  symbol: string;
  opening_price: number;
  current_price: number;
  high_price: number;
  low_price: number;
  previous_close: number;
}
