'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { stockApi } from '@/lib/api-client';
import { FormField } from '@/components/FormField';
import { SubmitButton } from '@/components/SubmitButton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { StockResult } from '@/components/StockResult';
import { StockData } from '@/types/stock';
import { validateStockSymbol } from '@/constants';

export default function DashboardPage() {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStockData(null);

    if (!symbol) {
      setError('Stock symbol is required');
      return;
    }
    if (!validateStockSymbol(symbol)) {
      setError('Stock symbol must be 1-5 uppercase letters');
      return;
    }

    setLoading(true);

    try {
      const data = await stockApi.getQuote(symbol);
      setStockData(data);
    } catch (err: unknown) {
      // Simple error handling - 401s are handled globally
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: any } } };
        const detail = axiosError.response?.data?.detail;

        if (Array.isArray(detail)) {
          setError(
            detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
          );
        } else if (typeof detail === 'string') {
          setError(detail);
        } else {
          setError('Failed to fetch stock data');
          console.error(err);
        }
      } else {
        setError('Failed to fetch stock data');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSymbol(e.target.value.toUpperCase());
  };

  return (
    <div>
      <nav className="navbar">
        <div className="container navbar-content">
          <h1>Stock Price Checker</h1>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        <h2>Look up</h2>

        <form onSubmit={handleSubmit}>
          <FormField
            label="Stock Symbol"
            name="symbol"
            type="text"
            placeholder="e.g., AAPL, GOOGL, MSFT"
            value={symbol}
            onChange={handleSymbolChange}
            disabled={loading}
            required
          />

          <ErrorMessage message={error} />

          <SubmitButton loading={loading}>Get Stock Price</SubmitButton>
        </form>

        {stockData && <StockResult stockData={stockData} />}
      </div>
    </div>
  );
}
