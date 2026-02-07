import memoize from 'memoize';

function getWebsiteRowsImpl() {
  return [...document.querySelectorAll('td div.col-product.text-start a').values()];
}

export const getWebsiteRows = memoize(getWebsiteRowsImpl);

// Selectors for the fields from the tr Element for each row
export const quantityElSelector = 'td input[name^="amount"]';
export const priceElSelector = 'td input[name^="price"]';
export const languageElSelector = 'td select[name^="idLanguage"]';
