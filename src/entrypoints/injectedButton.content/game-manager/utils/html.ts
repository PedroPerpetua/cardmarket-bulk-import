import memoize from 'memoize';

function getWebsiteRowsImpl() {
  return [...document.querySelectorAll('td div.col-product.text-start a').values()];
}

export const getWebsiteRows = memoize(getWebsiteRowsImpl);

// Selectors for the fields from the tr Element for each row
export const languageElSelector = 'td select[name^="idLanguage"]';
export const conditionElSelector = 'td select[name^="idCondition"]';
export const signedElSelector = 'td input[name^="isSigned"]';
// Reverse holo checkbox. Rendered only by games that have reverse holo printings
// (Pokemon), where the input is named isReverseHolo[<rowIndex>]. Absent on every
// other game, so callers must null-guard the lookup.
export const reverseHoloElSelector = 'td input[name^="isReverseHolo"]';
export const commentElSelector = 'td input[name^="comments"]';
export const quantityElSelector = 'td input[name^="amount"]';
export const priceElSelector = 'td input[name^="price"]';
