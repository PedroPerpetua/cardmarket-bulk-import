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
    // host_permissions allows content scripts to make cross-origin fetch requests
    // to ACE without CORS preflight failures.  WXT converts these to the correct
    // format for MV2 (Firefox) vs MV3 (Chrome) automatically.
    host_permissions: ['https://ace.belfast.moe/*'],
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
