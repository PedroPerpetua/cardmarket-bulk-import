import { createIntegratedUi, defineContentScript } from '#imports';

import { createRoot } from 'react-dom/client';

import App from './App';

export default defineContentScript({
  matches: ['*://*.cardmarket.com/*/*/Stock/ListingMethods/BulkListing*'],
  main: (ctx) => {
    const ui = createIntegratedUi(ctx, {
      position: 'inline',
      anchor: 'div#BulkAccordion',
      append: 'after',
      onMount: (container) => {
        const root = createRoot(container);
        root.render(<App />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });
    ui.autoMount({ once: true });
  },
});
