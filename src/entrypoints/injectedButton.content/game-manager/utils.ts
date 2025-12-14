export function getWebsiteRows() {
  return [...document.querySelectorAll('td div.col-product.text-start a').values()];
}

// Selectors for the fields from the tr Element for each row
export const quantityElSelector = 'td input[name^="amount"]';
export const priceElSelector = 'td input[name^="price"]';
