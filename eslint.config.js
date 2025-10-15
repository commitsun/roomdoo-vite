import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import vueParser from 'vue-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import tseslint from '@typescript-eslint/eslint-plugin';
import vue from 'eslint-plugin-vue';
import security from 'eslint-plugin-security';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  // ====== IGNORE SECTION (replaces .eslintignore) ======
  {
    ignores: [
      'dist/**',
      'public/**',
      'node_modules/**',
      'coverage/**',
      'src/_legacy/**',
      // TODO: review these ignores
      'src/__tests__/setup.ts',
      'src/infrastructure/http/**',
      'src/infrastructure/plugins/**',
      'src/ui/composables/useAppDialog.ts',
    ],
  },

  // ====== BASE CONFIG (applied to everything) ======
  {
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      vue,
      security,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      // Basic code consistency
      'import/order': ['error', { 'newlines-between': 'always' }],
      'import/no-duplicates': 'error',
      'no-restricted-imports': ['error', { patterns: ['../*'] }],
    },
  },

  // ====== APP (src) — NIGHTMARE MODE ======
  {
    files: ['src/**/*.{ts,tsx,vue}'],
    languageOptions: {
      parserOptions: {
        // Forward TS project info to @typescript-eslint/parser (via vue-eslint-parser)
        projectService: true,
        tsconfigRootDir: __dirname,
        // (Optional) specify multiple projects if you have them
        // project: ["./tsconfig.json", "./tsconfig.app.json", "./tsconfig.node.json"],
      },
    },
    rules: {
      // Security / bug prevention
      'no-constant-condition': 'error',
      'no-debugger': 'error',
      'no-console': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-object-injection': 'off', // noisy in some cases

      // Consistency / stability
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      'no-return-await': 'error',
      'dot-notation': 'error',
      'consistent-return': 'error',
      'no-shadow': 'error',
      'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
      'no-implicit-coercion': 'error',

      // Complexity limits
      complexity: ['error', { max: 20 }], // TODO: lower to 10
      'max-depth': ['error', 3],
      'max-params': 'off', //['error', 3],
      'max-lines-per-function': ['error', { max: 11200, skipBlankLines: true, skipComments: true }], // TODO: lower to 100

      // Imports / unused cleanup
      'import/no-mutable-exports': 'error',
      'unused-imports/no-unused-imports': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // TypeScript strict rules
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: false }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/strict-boolean-expressions': ['error', { allowNullableBoolean: false }],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },

  // ====== CONFIG FILES & SCRIPTS — RELAXED MODE ======
  {
    files: ['*.config.{ts,js}', 'scripts/**/*.{ts,js}', 'vite.config.ts', 'vitest.config.ts'],
    languageOptions: { parserOptions: { sourceType: 'module' } },
    rules: {
      'no-console': 'off',
      'no-debugger': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
      complexity: ['warn', { max: 15 }],
      'max-params': ['warn', 5],
      'max-lines-per-function': ['warn', { max: 120, skipBlankLines: true, skipComments: true }],
      complexity: 'off',
    },
  },

  // ====== TEST FILES — RELAXED BUT SAFE ======
  {
    files: ['**/*.{spec,test}.ts', '**/__tests__/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'security/detect-unsafe-regex': 'off',
      'max-lines-per-function': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      complexity: 'off',
    },
  },
];
