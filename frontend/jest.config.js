const nextJest = require('next/jest');

module.exports = nextJest({ dir: './' })({
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,ts,tsx}'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e/'],
});
