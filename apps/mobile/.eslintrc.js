module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  root: true,
  env: {
    es2022: true,
    node: true,
    jest: true,
  },
  globals: {
    __DEV__: 'readonly',
  },
  settings: {
    react: { version: 'detect' },
  },
  ignorePatterns: ['node_modules/', '.expo/', 'dist/', 'coverage/', 'android/', 'ios/'],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    // React Native needs require() for static assets (images, Lottie JSON) and for
    // platform-conditional modules that must stay out of other platforms' bundles.
    '@typescript-eslint/no-require-imports': 'off',

    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // i18n enforcement: flag hardcoded Arabic strings in TSX
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'ConditionalExpression[test.property.name="language"] > Literal[value=/[\\u0600-\\u06FF]/]',
        message: 'Use t() translation function instead of inline Arabic strings. Add keys to i18n/locales/ar.json.',
      },
    ],

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
