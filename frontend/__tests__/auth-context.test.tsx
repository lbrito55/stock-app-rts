import { renderWithProviders, screen, act, waitFor } from '@/lib/test-utils';
import { AuthProvider, useAuth } from '@/context/auth-context';
import Cookies from 'js-cookie';

// Mock the authApi since logout calls it
jest.mock('@/lib/api-client', () => ({
  authApi: {
    logout: jest.fn().mockResolvedValue({ message: 'Successfully logged out' }),
    validateToken: jest.fn().mockResolvedValue({ valid: true }),
    setupAuthInterceptor: jest.fn().mockReturnValue(() => {}), // Mock the interceptor setup
  },
}));

// Test component to access auth context
function TestComponent() {
  const { isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <button onClick={() => login('test-token')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides authentication state', () => {
    renderWithProviders(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Authenticated: No')).toBeInTheDocument();
  });

  it('handles login', () => {
    const { mockPush } = renderWithProviders(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByText('Login').click();
    });

    // The login function sets isAuthenticated and navigates
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    expect(screen.getByText('Authenticated: Yes')).toBeInTheDocument();
  });

  it('handles logout', async () => {
    const { mockPush } = renderWithProviders(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // First login to have something to logout from
    act(() => {
      screen.getByText('Login').click();
    });

    // Verify we're logged in
    expect(screen.getByText('Authenticated: Yes')).toBeInTheDocument();

    // Now test logout
    await act(async () => {
      screen.getByText('Logout').click();
      // Give time for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Wait for all async operations to complete
    await waitFor(() => {
      expect(Cookies.remove).toHaveBeenCalledWith('token');
    });

    // Check that navigation happened
    expect(mockPush).toHaveBeenCalledWith('/login?loggedOut=true');

    // Check that user is logged out
    expect(screen.getByText('Authenticated: No')).toBeInTheDocument();
  });
});
