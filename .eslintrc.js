module.exports = {
  extends: ['airbnb', 'plugin:@typescript-eslint/recommended', 'plugin:jest/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'eslint-plugin-jest', 'react-hooks'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
    'no-param-reassign': 'off',
    'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    'import/no-extraneous-dependencies': 'off', // [2, { devDependencies: ['**/*.test.tsx', '**/*.test.ts'] }],
    'import/no-unresolved': 'off',
    '@typescript-eslint/indent': [2, 2],
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
    'import/prefer-default-export': 'off',
    'no-plusplus': 'off',
    'no-console': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'max-classes-per-file': ['error', 2],
    'max-len': ['error', 120],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }
   ],
   '@typescript-eslint/explicit-module-boundary-types': 'off'
  },
};