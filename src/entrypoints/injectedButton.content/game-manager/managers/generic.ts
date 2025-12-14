import * as yup from 'yup';

import type { GameManagerInterface } from '..';
import { compareNormalized } from '../../../../utils';
import { readCsv } from '../../../../utils/csv';
import { getWebsiteRows, priceElSelector, quantityElSelector } from '../utils';

/**
 * The GenericGameManager is a Game Manager that's capable of handling **only the basic required
 * fields** - name, quantity and price. It should be the default returned when no other appropriate
 * managers are found.
 */
const GenericGameManager: GameManagerInterface<never, Record<never, never>> = {
  extraColumns: {},
  extraValidationSchema: yup.object(),
  parseCsv: async (file, columnMapping) => {
    const data = await readCsv(file);
    const rows = [];

    for (const [i, row] of data.rows.entries()) {
      const parsedName = String(row[columnMapping['name']]);
      const enabled = !!getWebsiteRows().find((el) => compareNormalized(el.textContent, parsedName));
      rows.push({
        id: i,
        name: parsedName,
        quantity: columnMapping['quantity'] ? (Number(row[columnMapping['quantity']]) || 0) : 0,
        price: columnMapping['price'] ? (Number(row[columnMapping['price']]) || 0) : 0,
        enabled,
      });
    }
    return rows;
  },
  fillPage: (rows) => {
    const websiteRows = getWebsiteRows();
    let count = 0;
    rows.forEach((row) => {
      const nameEl = websiteRows.find((el) => compareNormalized(el.textContent, row.name));
      if (!nameEl) return;
      let trEl = nameEl.parentElement!.parentElement!.parentElement!;
      let quantityEl: HTMLInputElement = trEl.querySelector(quantityElSelector)!;
      let priceEl: HTMLInputElement = trEl.querySelector(priceElSelector)!;

      // Check if there's already quantity on this row... if so, we may need to create a new one
      if (quantityEl.value && quantityEl.value !== '0') {
        const buttonEl: HTMLButtonElement = trEl.querySelector('td button.copy-row-button')!;
        buttonEl.click();
        trEl = trEl.previousSibling as HTMLElement;
        // We need to point the fields to those of the new parent trEl and reset them
        quantityEl = trEl.querySelector(quantityElSelector)!;
        quantityEl.value = quantityEl.defaultValue;
        priceEl = trEl.querySelector(priceElSelector)!;
        priceEl.value = priceEl.defaultValue;
      }
      // Now input the data
      if (row.quantity) quantityEl.value = row.quantity.toString();
      if (row.price) priceEl.value = row.price.toFixed(2);
      count += 1;
    });
    return Promise.resolve(count);
  },
  extraTableColumns: {},
};

export default GenericGameManager;
