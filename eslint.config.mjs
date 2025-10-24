import pluginQuery from '@tanstack/eslint-plugin-query';
import nextVitals from 'eslint-config-next/core-web-vitals';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  ...nextVitals,

  ...tseslint.configs.recommended,

  {
    plugins: {
      '@tanstack/query': pluginQuery,
    },
    rules: {
      '@tanstack/query/exhaustive-deps': 'error',
    },
  },
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
  {
    rules: {
      'import/order': [
        'warn',
        {
          groups: [
            'type',
            'builtin',
            'object',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          pathGroups: [
            {
              group: 'external',
              pattern: '~/**',
              position: 'after',
            },
          ],
        },
      ],
    },
  },
  {
    rules: {
      'no-console': 'warn',

      'padding-line-between-statements': [
        'warn',
        {
          blankLine: 'always',
          next: 'return',
          prev: '*',
        },
        {
          blankLine: 'always',
          next: '*',
          prev: ['const', 'let', 'var'],
        },
        {
          blankLine: 'any',
          next: ['const', 'let', 'var'],
          prev: ['const', 'let', 'var'],
        },
      ],
    },
  },
  {
    rules: {
      'react/jsx-curly-brace-presence': [
        'warn',
        {
          children: 'never',
          props: 'never',
        },
      ],

      'react/jsx-sort-props': [
        'warn',
        {
          callbacksLast: true,
          noSortAlphabetically: false,
          reservedFirst: true,
          shorthandFirst: true,
        },
      ],

      'react/react-in-jsx-scope': 'off',

      'react/self-closing-comp': 'warn',
    },
  },

  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);
