module.exports = {
  root: true,

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },

  env: {
    node: true,
    browser: true,
    es2024: true
  },

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],

  plugins: [
    '@typescript-eslint'
  ],

  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-this-alias': 'off',

    'prefer-promise-reject-errors': 'off',
    'no-prototype-builtins': 'off',
    'no-console': 'warn',

    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'off'
  }
};
