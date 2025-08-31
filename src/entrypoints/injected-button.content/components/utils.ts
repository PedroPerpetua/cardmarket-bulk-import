import { parse } from 'csv-parse';

export function normalizeString(str: string) {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export function compareNormalized(str1: string, str2: string) {
  return normalizeString(str1) === normalizeString(str2);
}

export function readCSV(file: File) {
  return new Promise<Record<string, string>[]>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (evt) => {
      if (typeof evt.target?.result !== 'string') {
        reject(`Reader returned ${typeof evt.target?.result} instead of string.`);
        return;
      }
      parse(
        evt.target.result,
        { columns: true, skip_empty_lines: true },
        (err, records: Record<string, string>[]) => {
          if (err) reject(err);
          resolve(records);
        },
      );
    };
    reader.onerror = (evt) => reject(evt);
  });
}

export function paginateArray<T>(arr: T[], itemsPerPage: number) {
  const totalPages = Math.max(1, Math.ceil((arr ?? []).length / itemsPerPage));
  const indexArr = Array.from({ length: totalPages }, (_, i) => i + 1);
  const getPageLimits = (pageNumber: number) => {
    const start = (pageNumber - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return [start, end];
  };
  const getPage = (pageNumber: number) => {
    const [start, end] = getPageLimits(pageNumber);
    return arr.slice(start, end);
  };
  return { totalPages, indexArr, getPageLimits, getPage };
}

// Cardmarket only allows 100 articles each time
export const BATCH_SIZE = 100;

const VALID_FOIL_VALUES = ['t', '1', 'foil', 'yes'];

export type Column = 'name' | 'quantity' | 'foil' | 'price';

export type Result = {
  name: string,
  quantity: number,
  isFoil: boolean,
  price: number,
};

export async function fillPage(file: File, columns: Record<Column, string>, batch: number) {
  const data = await readCSV(file);
  const rows = [...document.querySelectorAll('td div.col-product.text-start a').values()];

  const results: Result[] = [];
  const { getPage } = paginateArray(data, BATCH_SIZE);
  getPage(batch).forEach((row) => {
    // Find the bulk listing row
    // @ts-ignore
    const name = row[columns['name']];
    if (!name) return;
    const nameEl = rows.find((el) => compareNormalized(el.textContent, name));
    if (!nameEl) return;
    // a -> div -> td -> tr
    let trEl = nameEl.parentElement!.parentElement!.parentElement!;

    // Check if there's already quantity on this row... if so, we may need to create a new one
    // This covers the foils + non foil rows
    let quantityEl: HTMLInputElement = trEl.querySelector('td input[name^="amount"]')!;
    if (quantityEl.value && quantityEl.value !== '0') {
      const buttonEl: HTMLButtonElement = trEl.querySelector('td button.copy-row-button')!;
      buttonEl.click();
      trEl = trEl.previousSibling as HTMLElement;
      quantityEl = trEl.querySelector('td input[name^="amount"]')!;
    }

    // Now match the data

    /* Quantity */
    const quantity = Number(row[columns['quantity']]) || 0;
    if (quantity) {
      quantityEl.value = quantity.toString();
    }

    /* Is Foil */
    const isFoil = VALID_FOIL_VALUES.some((v) => compareNormalized(v, row[columns['foil']]));
    if (isFoil) {
      const foilEl: HTMLInputElement = trEl.querySelector('td input[name^="isFoil"]')!;
      foilEl.click();
    }

    /* Price */
    const price = Number(row[columns['price']]) || 0;
    if (price) {
      const priceEl: HTMLInputElement = trEl.querySelector('td input[name^="price"]')!;
      priceEl.value = price.toFixed(2);
    }

    // Push to results
    results.push({ name, quantity, isFoil, price });
  });

  return results;
}
