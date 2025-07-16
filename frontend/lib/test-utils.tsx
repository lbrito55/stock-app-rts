import React from 'react';
import { render } from '@testing-library/react';

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();

// Override the mock for tests
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: mockPush,
      replace: mockReplace,
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Custom render function that includes providers
export function renderWithProviders(ui: React.ReactElement) {
  return {
    ...render(ui),
    mockPush,
    mockReplace,
  };
}

export * from '@testing-library/react';
