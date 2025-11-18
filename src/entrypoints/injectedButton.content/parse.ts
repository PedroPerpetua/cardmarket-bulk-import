import memoize from 'memoize';
import { sendMessage } from 'webext-bridge/content-script';

import { compareNormalized } from '../../utils';
import { readCsv } from '../../utils/csv';

async function getMTGJSONDataImpl() {
  // We can't fetch inside the content script, so we delegate to the background with messages
  return sendMessage('cardmarket-bulk-import.getMTGJSONData', undefined, 'background');
}

export const getMTGJSONData = memoize(getMTGJSONDataImpl);

async function matchSetToCardmarketIdImpl(set: string) {
  const sets = await getMTGJSONData();
  const result = sets.find(({ matchKeys }) => !!matchKeys.find((v) => compareNormalized(v, set)));
  if (result) return { code: result.code, cardmarketId: result.cardmarketId };
  return null;
}

export const matchSetToCardmarketId = memoize(matchSetToCardmarketIdImpl);

const VALID_FOIL_VALUES = ['t', '1', 'foil', 'yes'];

export type ParsedRow = {
  id: number, // Internal id to manage in form
  name: string,
  set: string,
  quantity: number,
  isFoil: boolean,
  price: number,
  enabled: boolean,
};

export async function parseCsv(
  file: File,
  columnMapping: Record<Exclude<keyof ParsedRow, 'id' | 'enabled'>, string | undefined>,
) {
  const paramsCode = Number(new URLSearchParams(window.location.search).get('idExpansion'));

  const data = await readCsv(file);
  const rows: ParsedRow[] = [];

  for (const [i, row] of data.rows.entries()) {
    const parsedName = String(row[columnMapping['name']!]);

    let enabled = !!getWebsiteRows().find((el) => compareNormalized(el.textContent, parsedName));
    let set = columnMapping['set'] ? String(row[columnMapping['set']]) : '';
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

    rows.push({
      id: i,
      name: parsedName,
      set: set,
      quantity: columnMapping['quantity'] ? (Number(row[columnMapping['quantity']]) || 0) : 0,
      isFoil: columnMapping['isFoil']
        ? VALID_FOIL_VALUES.includes(String(row[columnMapping['isFoil']]).toLowerCase())
        : false,
      price: columnMapping['price'] ? (Number(row[columnMapping['price']]) || 0) : 0,
      enabled,
    });
  }

  return rows;
}

export function getWebsiteRows() {
  return [...document.querySelectorAll('td div.col-product.text-start a').values()];
}

// Selectors for the fields from the tr Element for each row
const quantityElSelector = 'td input[name^="amount"]';
const foilElSelector = 'td input[name^="isFoil"]';
const priceElSelector = 'td input[name^="price"]';

export function fillPage(rows: ParsedRow[]) {
  const websiteRows = getWebsiteRows();
  let count = 0;
  rows.forEach((row) => {
    const nameEl = websiteRows.find((el) => compareNormalized(el.textContent, row.name));
    if (!nameEl) return;
    let trEl = nameEl.parentElement!.parentElement!.parentElement!;
    let quantityEl: HTMLInputElement = trEl.querySelector(quantityElSelector)!;
    let foilEl: HTMLInputElement = trEl.querySelector(foilElSelector)!;
    let priceEl: HTMLInputElement = trEl.querySelector(priceElSelector)!;

    // Check if there's already quantity on this row... if so, we may need to create a new one
    // This covers the foils + non foil rows
    if (quantityEl.value && quantityEl.value !== '0') {
      const buttonEl: HTMLButtonElement = trEl.querySelector('td button.copy-row-button')!;
      buttonEl.click();
      trEl = trEl.previousSibling as HTMLElement;
      // We need to point the fields to those of the new parent trEl and reset them
      quantityEl = trEl.querySelector(quantityElSelector)!;
      quantityEl.value = quantityEl.defaultValue;
      foilEl = trEl.querySelector(foilElSelector)!;
      foilEl.checked = foilEl.defaultChecked;
      priceEl = trEl.querySelector(priceElSelector)!;
      priceEl.value = priceEl.defaultValue;
    }

    // Now input the data
    if (row.quantity) quantityEl.value = row.quantity.toString();
    if (row.isFoil) foilEl.checked = true;
    if (row.price) priceEl.value = row.price.toFixed(2);
    count += 1;
  });
  return count;
}
