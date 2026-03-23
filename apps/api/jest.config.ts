import type { Config } from 'jest';

// Ensure env vars required by ConfigModule Joi schema are present for ALL tests
// (must be set here because TypeScript hoists imports above inline process.env assignments)
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'ci-test-refresh-secret-32-chars!!';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.dto.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
