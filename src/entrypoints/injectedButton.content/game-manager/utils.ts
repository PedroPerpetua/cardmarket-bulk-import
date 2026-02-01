export function getWebsiteRows() {
  return [...document.querySelectorAll('td div.col-product.text-start a').values()];
}

// Selectors for the fields from the tr Element for each row
export const quantityElSelector = 'td input[name^="amount"]';
export const priceElSelector = 'td input[name^="price"]';
export const languageElSelector = 'td select[name^="idLanguage"]';

// Language code to name mappings for Cardmarket's language dropdown
// Maps ISO 639-1 language codes to the exact names shown in Cardmarket
export const languageCodeMap: Record<string, string[]> = {
  en: ['english'],
  es: ['spanish'],
  de: ['german'],
  fr: ['french'],
  it: ['italian'],
  pt: ['portuguese'],
  ja: ['japanese'],
  zh: ['s-chinese', 'chinese'],
  'zh-hans': ['s-chinese'],
  'zh-hant': ['t-chinese'],
};
