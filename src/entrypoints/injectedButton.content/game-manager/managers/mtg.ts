import memoize from 'memoize';
import { sendMessage } from 'webext-bridge/content-script';
import * as yup from 'yup';

import GenericGameManager from './generic';
import type { CommonParsedRowFields } from './generic';
import { compareNormalized } from '../../../../utils';
import type { TranslationKey } from '../../../../utils';
import { readCsv } from '../../../../utils/csv';
import {
  getWebsiteRows,
  matchLanguageOption,
  languageElSelector,
} from '../utils';

async function getMTGJSONDataImpl() {
  // We can't fetch inside the content script, so we delegate to the background with messages
  return sendMessage('cardmarket-bulk-import.getMTGJSONData', undefined, 'background');
}

const getMTGJSONData = memoize(getMTGJSONDataImpl);

async function matchSetToCardmarketIdImpl(set: string) {
  const sets = await getMTGJSONData();
  const result = sets.find(({ matchKeys }) => !!matchKeys.find((v) => compareNormalized(v, set)));
  if (result) return { code: result.code, cardmarketId: result.cardmarketId };
  return null;
}

const matchSetToCardmarketId = memoize(matchSetToCardmarketIdImpl);

const VALID_FOIL_VALUES = ['t', '1', 'foil', 'yes'];
const foilElSelector = 'td input[name^="isFoil"]';

class MtgGameManager extends GenericGameManager<'set' | 'isFoil', { set: string, isFoil: boolean }> {
  extraColumns: Record<'set' | 'isFoil', TranslationKey> = {
    set: 'injectedButton.gameManagers.mtg.importCsvForm.set.label',
    isFoil: 'injectedButton.gameManagers.mtg.importCsvForm.isFoil.label',
  };

  extraValidationSchema = yup.object({
    set: yup.string(),
    isFoil: yup.string(),
  });

  async parseCsv(
    file: File,
    columnMapping: {
      name: string,
      quantity: string | undefined,
      price: string | undefined,
      language: string | undefined,
      set: string | undefined,
      isFoil: string | undefined,
    }) {
    const paramsCode = Number(new URLSearchParams(window.location.search).get('idExpansion'));
    const data = await readCsv(file);

    // Get available language options from the page once
    const websiteRows = getWebsiteRows();
    const firstRow = websiteRows[0]?.parentElement?.parentElement?.parentElement;
    const languageEl: HTMLSelectElement | null = firstRow?.querySelector(languageElSelector) ?? null;
    const availableLanguageOptions = languageEl ? Array.from(languageEl.options) : [];

    const rows = [];
    for (const [i, row] of data.rows.entries()) {
      const parsedName = String(row[columnMapping['name']]);
      const matchedName = await this.matchName(parsedName);

      let set = columnMapping['set'] ? String(row[columnMapping['set']]) : '';
      let enabled = !!matchedName;
      if (set) {
        const data = await matchSetToCardmarketId(set);
        if (data) {
          set = data.code;
          if (data.cardmarketId !== paramsCode) enabled = false;
        }
        else {
          set = '';
        }
      }

      // Match language during parsing
      let matchedLanguage = '';
      let matchedLanguageDisplay = '';
      if (columnMapping['language']) {
        const rawLanguage = String(row[columnMapping['language']]);
        const matchedOption = matchLanguageOption(rawLanguage, availableLanguageOptions);
        if (matchedOption) {
          matchedLanguage = matchedOption.value;
          matchedLanguageDisplay = matchedOption.text;
        }
      }

      rows.push({
        id: i,
        name: parsedName,
        set: set,
        isFoil: columnMapping['isFoil']
          ? VALID_FOIL_VALUES.includes(String(row[columnMapping['isFoil']]).toLowerCase())
          : false,
        quantity: columnMapping['quantity'] ? (Number(row[columnMapping['quantity']]) || 0) : 0,
        price: columnMapping['price'] ? (Number(row[columnMapping['price']]) || 0) : 0,
        language: matchedLanguageDisplay,
        enabled,
        matchedName,
        languageValue: matchedLanguage,
      });
    }

    return rows;
  };

  async fillRow(
    trEl: HTMLTableRowElement,
    row: (CommonParsedRowFields & { set: string, isFoil: boolean }),
  ): Promise<HTMLTableRowElement> {
    const resolvedEl = await super.fillRow(trEl, row);
    const foilEl: HTMLInputElement = resolvedEl.querySelector(foilElSelector)!;
    if (row.isFoil) foilEl.checked = true;
    return resolvedEl;
  };

  extraTableColumns: Record<'set' | 'isFoil', TranslationKey> = {
    set: 'injectedButton.gameManagers.mtg.selectRowsFormTable.set',
    isFoil: 'injectedButton.gameManagers.mtg.selectRowsFormTable.isFoil',
  };
};

export default MtgGameManager;
