import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginPage from '@/app/login/page';
import { useAuth } from '@/context/auth-context';
import { authApi } from '@/lib/api-client';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/context/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api-client', () => ({
  authApi: {
    login: jest.fn(),
  },
}));

describe('LoginPage', () => {
  const mockPush = jest.fn();
  const mockLogin = jest.fn();
  const mockAuthApiLogin = authApi.login as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });
    (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
  });

  it('renders login form elements', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('Sign up here')).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    // Mock authApi.login to call the callback function with the token
    mockAuthApiLogin.mockImplementation(async (email, password, onSuccess) => {
      onSuccess('test-token');
      return { access_token: 'test-token' };
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuthApiLogin).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        expect.any(Function) // The callback function
      );
    });

    // Verify the callback was called correctly
    expect(mockLogin).toHaveBeenCalledWith('test-token');
  });

  it('displays error on failed login', async () => {
    mockAuthApiLogin.mockRejectedValue({
      response: { data: { detail: 'Invalid credentials' } },
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginPage />);

    const form = screen.getByRole('button', { name: 'Login' }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const form = screen.getByRole('button', { name: 'Login' }).closest('form')!;

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  it('shows status messages based on URL params', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockImplementation((param) => {
        if (param === 'registered') return 'true';
        if (param === 'loggedOut') return 'true';
        return null;
      }),
    });

    render(<LoginPage />);

    expect(
      screen.getByText('Registration successful! Please login.')
    ).toBeInTheDocument();
    expect(screen.getByText("You've been logged out.")).toBeInTheDocument();
  });
});
