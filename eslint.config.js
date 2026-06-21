import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import {
  defineConfig,
  globalIgnores,
} from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'server/dist',
    'node_modules',
    'server/node_modules',
  ]),

  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      globals: globals.browser,
    },

    rules: {
      /*
        SoundTrail performs API requests inside effects.

        The loading/error resets are intentional. This
        compiler-performance rule is disabled while the
        important Rules of Hooks and exhaustive dependency
        checks remain enabled.
      */
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])