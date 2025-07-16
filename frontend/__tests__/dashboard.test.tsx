import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';
import { useAuth } from '@/context/auth-context';
import { stockApi } from '@/lib/api-client';

jest.mock('@/context/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api-client', () => ({
  stockApi: {
    getQuote: jest.fn(),
  },
}));

describe('DashboardPage', () => {
  const mockLogout = jest.fn();
  const mockStockApiGetQuote = stockApi.getQuote as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ logout: mockLogout });
  });

  it('renders dashboard interface', () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole('heading', { name: 'Stock Price Checker' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Look up' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Stock Symbol')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Get Stock Price' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('handles successful stock lookup', async () => {
    const mockStockData = {
      symbol: 'AAPL',
      opening_price: 150.25,
      current_price: 152.5,
      high_price: 153.0,
      low_price: 149.5,
      previous_close: 150.0,
    };

    mockStockApiGetQuote.mockResolvedValue(mockStockData);

    render(<DashboardPage />);

    const symbolInput = screen.getByLabelText('Stock Symbol');
    const submitButton = screen.getByRole('button', {
      name: 'Get Stock Price',
    });

    fireEvent.change(symbolInput, { target: { value: 'aapl' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockStockApiGetQuote).toHaveBeenCalledWith('AAPL');
      expect(mockStockApiGetQuote).toHaveBeenCalledTimes(1);
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText(/\$150\.25/)).toBeInTheDocument();
      expect(screen.getByText(/\$152\.50/)).toBeInTheDocument();
    });
  });

  it('shows validation error and handles API errors', async () => {
    render(<DashboardPage />);

    // Test validation error for empty field
    const form = screen
      .getByRole('button', { name: 'Get Stock Price' })
      .closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Stock symbol is required')).toBeInTheDocument();
    });

    // Test API error with valid format but non-existent stock
    mockStockApiGetQuote.mockRejectedValue({
      response: { data: { detail: 'Stock not found' } },
    });

    const symbolInput = screen.getByLabelText('Stock Symbol');
    fireEvent.change(symbolInput, { target: { value: 'FAKE' } }); // Valid format, fake stock
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockStockApiGetQuote).toHaveBeenCalledWith('FAKE');
      expect(screen.getByText('Stock not found')).toBeInTheDocument();
    });
  });

  it('converts input to uppercase and handles logout', () => {
    render(<DashboardPage />);

    const symbolInput = screen.getByLabelText(
      'Stock Symbol'
    ) as HTMLInputElement;
    fireEvent.change(symbolInput, { target: { value: 'aapl' } });

    expect(symbolInput.value).toBe('AAPL');

    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('handles validation error for invalid symbol format', async () => {
    render(<DashboardPage />);

    const symbolInput = screen.getByLabelText('Stock Symbol');
    const form = screen
      .getByRole('button', { name: 'Get Stock Price' })
      .closest('form')!;

    // Test with symbol that's too long
    fireEvent.change(symbolInput, { target: { value: 'TOOLONG' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText('Stock symbol must be 1-5 uppercase letters')
      ).toBeInTheDocument();
    });

    // Test with numbers
    fireEvent.change(symbolInput, { target: { value: '123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText('Stock symbol must be 1-5 uppercase letters')
      ).toBeInTheDocument();
    });

    // Ensure API wasn't called for invalid formats
    expect(mockStockApiGetQuote).not.toHaveBeenCalled();
  });
});
