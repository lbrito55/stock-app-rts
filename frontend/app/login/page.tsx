'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { authApi } from '@/lib/api-client';
import { FormField } from '@/components/FormField';
import { SubmitButton } from '@/components/SubmitButton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { StatusMessage } from '@/components/StatusMessage';
import { validateEmail } from '@/constants';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const searchParams = useSearchParams();
  const loggedOut = searchParams.get('loggedOut');
  const registered = searchParams.get('registered') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      await authApi.login(email, password, login);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg || JSON.stringify(e)).join(', '));
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('An error occurred');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Login</h1>

      {registered && (
        <StatusMessage
          message="Registration successful! Please login."
          type="success"
        />
      )}
      {loggedOut && (
        <StatusMessage message="You've been logged out." type="info" />
      )}

      <form onSubmit={handleSubmit}>
        <FormField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />

        <ErrorMessage message={error} />

        <SubmitButton loading={loading}>Login</SubmitButton>
      </form>

      <p className="form-footer">
        Don't have an account?{' '}
        <Link href="/signup" className="signup-link">
          Sign up here
        </Link>
      </p>
    </div>
  );
}
