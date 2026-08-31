import babel from '@rolldown/plugin-babel';
import { reactCompilerPreset } from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: [
    '@wxt-dev/module-react',
    '@wxt-dev/auto-icons',
    '@wxt-dev/i18n/module',
  ],
  manifest: {
    name: 'Cardmarket Bulk Import',
    default_locale: 'en',
    browser_specific_settings: {
      gecko: {
        id: '{dd001943-0849-4e40-af2c-bf2b9bd66636}',
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
  },
  zip: { sourcesRoot: 'src' },
  srcDir: 'src',
  imports: false,
  vite: () => ({
    plugins: [
      nodePolyfills(),
      babel({ presets: [reactCompilerPreset()] }),
    ],
  }),
});
