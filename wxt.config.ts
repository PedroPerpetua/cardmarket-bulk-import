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
  },
  zip: {
    sourcesRoot: 'src',
  },
  srcDir: 'src',
  imports: false,
  vite: () => ({
    plugins: [nodePolyfills()],
  }),
});
