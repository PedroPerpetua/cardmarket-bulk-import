import { compareNormalized, normalizeString } from '../../../utils';

export function getWebsiteRows() {
  return [...document.querySelectorAll('td div.col-product.text-start a').values()];
}

// Selectors for the fields from the tr Element for each row
export const quantityElSelector = 'td input[name^="amount"]';
export const priceElSelector = 'td input[name^="price"]';
export const languageElSelector = 'td select[name^="idLanguage"]';

/**
 * Language code to name mappings for Cardmarket's language dropdown.
 * Supports ISO codes, Manabox format (zh_CN, zh_TW), and language names.
 */
const languageNameMap: Record<string, string[]> = {
  en: ['english'],
  es: ['spanish'],
  de: ['german'],
  fr: ['french'],
  it: ['italian'],
  pt: ['portuguese'],
  ja: ['japanese'],
  ko: ['korean'],
  zh: ['chinese', 's-chinese'],
  'zh-hans': ['s-chinese'],
  'zh-hant': ['t-chinese'],
  'zh-cn': ['s-chinese'],
  'zh-tw': ['t-chinese'],
  zh_hans: ['s-chinese'],
  zh_hant: ['t-chinese'],
  zh_cn: ['s-chinese'],
  zh_tw: ['t-chinese'],
};

/**
 * Match a language input against available language options.
 * Supports language codes (en, zh_CN) and names (English, Spanish).
 */
export function matchLanguageOption(
  languageInput: string,
  availableOptions: HTMLOptionElement[],
): HTMLOptionElement | null {
  if (!languageInput || availableOptions.length === 0) return null;
  
  // Try direct match first
  const directMatch = availableOptions.find(
    (opt) => compareNormalized(opt.text, languageInput) || compareNormalized(opt.value, languageInput),
  );
  if (directMatch) return directMatch;
  
  // Try language code mapping
  const normalizedInput = normalizeString(languageInput).toLowerCase();
  const possibleNames = languageNameMap[normalizedInput];
  if (possibleNames) {
    return availableOptions.find((opt) =>
      possibleNames.some((name) => compareNormalized(opt.text, name)),
    ) ?? null;
  }
  
  return null;
}


