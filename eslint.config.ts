/* eslint-disable import-x/no-named-as-default, import-x/no-named-as-default-member */
import react from '@eslint-react/eslint-plugin';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import importX from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['node_modules', '.wxt', '.output']),
  {
    settings: {
      react: { version: 'detect' },
      'import-x/resolver': {
        typescript: true,
        node: true,
        alias: [['#imports', '.wxt/types/imports-module.d.ts']],
      },
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['docs/test/pokemon/*.cjs'],
    languageOptions: { parserOptions: { projectService: false } },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.stylisticTypeChecked,
      tseslint.configs.strictTypeChecked,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
      react.configs['strict-type-checked'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      stylistic.configs.customize({
        semi: true,
        arrowParens: true,
        quoteProps: 'as-needed',
      }),
    ],
    rules: {
      // Base eslint rules
      'object-shorthand': 'error',
      // @typescript-eslint rules
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': [
        'error', {
          fixStyle: 'separate-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // import-x rules
      'import-x/order': [
        'error', {
          groups: [
            ['builtin', 'external', 'internal'],
            ['parent', 'sibling', 'index'],
            ['unknown'],
          ],
          pathGroups: [
            {
              pattern: '#**',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: '{./*.css,**/*.css}',
              group: 'unknown',
              position: 'before',
            },
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            orderImportKind: 'desc',
          },
          named: true,
        },
      ],
      'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      // @eslint-react rules
      '@eslint-react/exhaustive-deps': 'off', // Already handled by the react-hooks plugin
      // @stylistic rules
      '@stylistic/max-len': [
        'error', {
          code: 120,
          ignoreComments: false,
          ignoreTrailingComments: false,
        },
      ],
      '@stylistic/member-delimiter-style': [
        'error', {
          multiline: { delimiter: 'comma' },
          singleline: { delimiter: 'comma' },
        },
      ],
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
      '@stylistic/object-curly-newline': ['error', { multiline: true, consistent: true }],
      '@stylistic/jsx-curly-newline': ['error', { multiline: 'consistent' }],
      '@stylistic/array-element-newline': ['error', 'consistent'],
      '@stylistic/array-bracket-newline': ['error', { multiline: true }],
    },
  },
  {
    /**
     * Disable the consistent type definitions for d.ts files; usually these contain augmentations
     * that need to be the specific type.
     */
    files: ['**/*.d.ts'],
    rules: { '@typescript-eslint/consistent-type-definitions': 'off' },
  },
);
