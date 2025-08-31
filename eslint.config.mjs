import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['.output', '.wxt'] },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js'],
        },
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: true,
        node: true,
        alias: [
          ['#imports', '.wxt/types/imports-module.d.ts'],
        ],
      },
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      stylistic.configs.recommended,
      importPlugin.flatConfigs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
    ],
    plugins: {
      '@stylistic': stylistic,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      /* base rules */
      'no-console': ['warn', { allow: ['warn', 'error']}],
      /* @typescript-eslint rules */
      '@typescript-eslint/naming-convention': ['error',
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
          leadingUnderscore: 'allow',
        },
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': ['error', { typesToIgnore: ['const'] }],
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      /* @stylistic rules */
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/max-len': [
        'error',
        {
          code: 120,
          tabWidth: 2,
          ignoreRegExpLiterals: true,
        },
      ],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/array-bracket-newline': ['error', 'consistent'],
      '@stylistic/object-curly-newline': ['error', {
        ImportDeclaration: { multiline: true, consistent: true },
      }],
      '@stylistic/member-delimiter-style': ['error', {
        multiline: {
          delimiter: 'comma',
          requireLast: true,
        },
        singleline: {
          delimiter: 'comma',
          requireLast: false,
        },
      }],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/max-statements-per-line': ['error', {
        max: 1,
        ignoredNodes: ['ReturnStatement', 'ExpressionStatement'],
      }],
      /* eslint-import-plugin rules */
      'import/no-extraneous-dependencies': ['error', {
        devDependencies: false,
        optionalDependencies: false,
        peerDependencies: false,
        bundledDependencies: false,
      }],
      'import/extensions': ['error', {
        pattern: {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
          json: 'always',
          svg: 'always',
          png: 'always',
          jpeg: 'always',
          css: 'always',
        },
        checkTypeImports: true,
      }],
      'import/order': ['error', {
        alphabetize: {
          order: 'asc',
          orderImportKind: 'desc',
        },
        groups: [
          ['builtin', 'external', 'internal'],
          ['parent', 'sibling', 'index'],
          ['unknown'],
        ],
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: '{react,#**}',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: '{./*.css,**/*.css}',
            group: 'unknown',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin', 'unknown'],
        warnOnUnassignedImports: true,
      }],
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      /* react rules */
      'react/no-array-index-key': 'error',
      'react/display-name': 'off',
      'react/self-closing-comp': 'error',
      'react/no-unused-prop-types': 'error',
      'react/jsx-props-no-multi-spaces': 'error',
      'react/jsx-curly-spacing': ['error', {
        'when': 'always',
        'attributes': false,
        'children': true,
      }],
      'react/jsx-no-constructed-context-values': 'error',
      /* react-hooks rules */
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      /* react-refresh rules */
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['wxt.config.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },
);
