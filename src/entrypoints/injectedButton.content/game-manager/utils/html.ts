import memoize from 'memoize';

function getWebsiteRowsImpl() {
  return [...document.querySelectorAll('td div.col-product.text-start a').values()];
}

export const getWebsiteRows = memoize(getWebsiteRowsImpl);

/**
 * This function will build a Record of "name on the form" -> "name to match"; this is to handle
 * the scenarios where cards have translations beneath them.
 */
function getFormNamesImpl() {
  const formNames: Record<string, string> = {};

  for (const row of getWebsiteRows()) {
    const rowName = row.textContent;
    formNames[rowName] = rowName;
    // Look for a translated name besides it
    const translatedName = row.nextSibling?.textContent;
    if (translatedName) formNames[translatedName] = rowName;
  }

  return formNames;
}

export const getFormNames = memoize(getFormNamesImpl);

// Selectors for the fields from the tr Element for each row
export const languageElSelector = 'td select[name^="idLanguage"]';
export const conditionElSelector = 'td select[name^="idCondition"]';
export const signedElSelector = 'td input[name^="isSigned"]';
export const commentElSelector = 'td input[name^="comments"]';
export const quantityElSelector = 'td input[name^="amount"]';
export const priceElSelector = 'td input[name^="price"]';
