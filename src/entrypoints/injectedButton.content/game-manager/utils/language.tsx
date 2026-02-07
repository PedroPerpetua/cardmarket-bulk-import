import type { ReactNode } from 'react';

import {
  GB as EN,
  FR,
  DE,
  ES,
  IT,
  CN,
  JP,
  PT,
  RU,
  KR,
  TW,
  NL,
  PL,
  CZ,
  HU,
  ID,
  TH,
} from 'country-flag-icons/react/3x2';
import memoize from 'memoize';

import { compareNormalized } from '../../../../utils';

export type LanguageData = {
  mkmValue: number,
  mkmLabels: string[],
  matchStrings: string[],
  flagElement: ReactNode,
};

/**
 * Cardmarket appears to have 17 possible languages amongst all their products. While not all
 * products have all these languages available, they should not have a language not present here.
 *
 * This information can be obtained by loading a bulk list form and running
 * `document.querySelector('select.form-select[name="idLanguage"]').options`. This appears to find
 * a hidden selector that contains all possible options to use to build the selector on the form.
 *
 * The data here has been extrapolated from there:
 * - The `mkmValue` represents the select option value; this is consistent with the selects on the
 * form.
 * - The `mkmLabels` represents the actual textContent of these options, in all the languages
 * Cardmarket supports.
 * - The `matchStrings` are additional, manually built, strings that we can use to match the user
 * input to this specific language.
 */
export const mkmLanguages: LanguageData[] = [
  // English
  {
    mkmValue: 1,
    mkmLabels: ['English', 'Anglais', 'Englisch', 'Inglés', 'Inglese'],
    matchStrings: ['en', 'en-us', 'en_us', 'en-gb', 'en_gb', 'eng'],
    flagElement: (<EN />),
  },
  // French
  {
    mkmValue: 2,
    mkmLabels: ['French', 'Français', 'Französisch', 'Francés', 'Francese'],
    matchStrings: ['fr', 'Français'],
    flagElement: (<FR />),
  },
  // German
  {
    mkmValue: 3,
    mkmLabels: ['German', 'Allemand', 'Deutsch', 'Alemán', 'Tedesco'],
    matchStrings: ['de', 'Deutsch'],
    flagElement: (<DE />),
  },
  // Spanish
  {
    mkmValue: 4,
    mkmLabels: ['Spanish', 'Espagnol', 'Spanisch', 'Español', 'Spagnolo'],
    matchStrings: ['es', 'Español'],
    flagElement: (<ES />),
  },
  // Italian
  {
    mkmValue: 5,
    mkmLabels: ['Italian', 'Italien', 'Italienisch', 'Italiano', 'Italiano'],
    matchStrings: ['it', 'Italiano'],
    flagElement: (<IT />),
  },
  // Simplified Chinese
  {
    mkmValue: 6,
    mkmLabels: ['S-Chinese', 'Chinois-S', 'S-Chinesisch', 'Chino-S', 'Cinese-S'],
    matchStrings: ['zhs', '汉语', 'zh', '中文', 'Chinese', 'Simplified Chinese', 'zh-hans', 'zh_hans', 'zh-CN', 'zh_CN'],
    flagElement: (<CN />),
  },
  // Japanese
  {
    mkmValue: 7,
    mkmLabels: ['Japanese', 'Japonais', 'Japanisch', 'Japonés', 'Giapponese'],
    matchStrings: ['ja', '日本語', 'jp'],
    flagElement: (<JP />),
  },
  // Portuguese
  {
    mkmValue: 8,
    mkmLabels: ['Portuguese', 'Portugais', 'Portugiesisch', 'Portugués', 'Portoghese'],
    matchStrings: ['pt', 'Português'],
    flagElement: (<PT />),
  },
  // Russian
  {
    mkmValue: 9,
    mkmLabels: ['Russian', 'Russe', 'Russisch', 'Ruso', 'Russo'],
    matchStrings: ['ru', 'Русский'],
    flagElement: (<RU />),
  },
  // Korean
  {
    mkmValue: 10,
    mkmLabels: ['Korean', 'Coréen', 'Koreanisch', 'Coreano', 'Coreano'],
    matchStrings: ['ko', '한국어', 'kr'],
    flagElement: (<KR />),
  },
  // Traditional Chinese
  {
    mkmValue: 11,
    mkmLabels: ['T-Chinese', 'Chinois-T', 'T-Chinesisch', 'Chino-T', 'Cinese-T'],
    matchStrings: ['zht', '漢語', 'Traditional Chinese', 'zh-hant', 'zh_hant', 'zh-TW', 'zh_TW'],
    flagElement: (<TW />),
  },
  // Dutch
  {
    mkmValue: 12,
    mkmLabels: ['Dutch', 'Néerlandais', 'Holländisch', 'Holandés', 'Olandese'],
    matchStrings: ['nl', 'Nederlands'],
    flagElement: (<NL />),
  },
  // Polish
  {
    mkmValue: 13,
    mkmLabels: ['Polish', 'Polonais', 'Polnisch', 'Polaco', 'Polacco'],
    matchStrings: ['pl', 'Polski'],
    flagElement: (<PL />),
  },
  // Czech
  {
    mkmValue: 14,
    mkmLabels: ['Czech', 'Tchèque', 'Tschechisch', 'Checo', 'Ceco'],
    matchStrings: ['cs', 'Čeština'],
    flagElement: (<CZ />),
  },
  // Hungarian
  {
    mkmValue: 15,
    mkmLabels: ['Hungarian', 'Hongrois', 'Ungarisch', 'Húngaro', 'Ungherese'],
    matchStrings: ['hu', 'magyar'],
    flagElement: (<HU />),
  },
  // Indonesian
  {
    mkmValue: 16,
    mkmLabels: ['Indonesian', 'Indonésien', 'Indonesisch', 'Indonesio', 'Indonesiano'],
    matchStrings: ['id', 'Bahasa Indonesia'],
    flagElement: (<ID />),
  },
  // Thai
  {
    mkmValue: 17,
    mkmLabels: ['Thai', 'Thaï', 'Thailändisch', 'Tailandés', 'Thailandese'],
    matchStrings: ['th', 'ไทย'],
    flagElement: (<TH />),
  },
];

function getAvailableLanguagesImpl() {
  const selectEl: HTMLSelectElement | null = document.querySelector(`tr select.form-select[name*="idLanguage"]`);
  if (!selectEl?.options || selectEl.options.length === 0) return [];
  const languages = [];
  for (let i = 0; i < selectEl.options.length; i++) {
    const languageValue = Number(selectEl.options[i].value);
    const opt = mkmLanguages.find(({ mkmValue }) => mkmValue === languageValue);
    if (opt) languages.push(opt);
  }
  return languages;
}

export const getAvailableLanguages = memoize(getAvailableLanguagesImpl);

function matchLanguageImpl(inputLanguage?: string): { matched: boolean, data: LanguageData } {
  const availableLanguages = getAvailableLanguages();
  const fallback = availableLanguages.at(0) ?? mkmLanguages[0];
  if (!inputLanguage) return {
    matched: false,
    data: fallback,
  };
  const match = availableLanguages.find((lngData) => {
    if (compareNormalized(inputLanguage, lngData.mkmValue.toString())) return true;
    if (lngData.mkmLabels.some((v) => compareNormalized(inputLanguage, v))) return true;
    if (lngData.matchStrings.some((v) => compareNormalized(inputLanguage, v))) return true;
    return false;
  });
  return {
    matched: !!match,
    data: match ?? fallback,
  };
}

export const matchLanguage = memoize(matchLanguageImpl);
