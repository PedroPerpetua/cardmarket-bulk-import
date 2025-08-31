/* eslint-disable react-refresh/only-export-components */

import { defineContentScript, createIntegratedUi } from '#imports';

import ReactDOM from 'react-dom/client';

import App from './App';

export default defineContentScript({
  matches: ['*://*.cardmarket.com/*/Magic/Stock/ListingMethods/BulkListing*'],
  main: (ctx) => {
    const ui = createIntegratedUi(ctx, {
      position: 'inline',
      anchor: 'div#BulkAccordion',
      append: 'after',
      onMount: (container) => {
        const root = ReactDOM.createRoot(container);
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
