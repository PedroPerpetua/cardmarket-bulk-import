import * as yup from 'yup';

import { compareNormalized, normalizeString } from '../../../../utils';
import type { TranslationKey } from '../../../../utils';
import { readCsv } from '../../../../utils/csv';
import {
  getWebsiteRows,
  languageCodeMap,
  languageElSelector,
  priceElSelector,
  quantityElSelector,
} from '../utils';

export type CommonParsedRowFields = {
  id: number,
  name: string,
  quantity: number,
  price: number,
  language: string,
  enabled: boolean,
  matchedName: string | null,
};

/**
 * The GenericGameManager class follows the Strategy Design Pattern as to implement support for
 * multiple games on Cardmarket. Each different game should implement it's subclass GameManager to
 * define any custom behaviour they need to handle their own game, in regards to the form they
 * present, parsing the CSV, or filling the bulk list form.
 *
 * This GenericGameManager has the base functionality that can be used generically for any game.
 *
 * All managers have to, by default, take an input column for the article name, and optional inputs
 * for price, quantity, and language. They can define any extra columns they wish to parse.
 *
 * All managers will have their own internal ParsedRow type, that must include at least, id, name,
 * quantity, price, language, enabled and matchedName. They can parse and display any extra fields, but these
 * fields are required.
 */
class GenericGameManager<
  ExtraColumnInputs extends string = string,
  ExtraParsedRowFields extends { [key: string]: unknown } = Record<string, unknown>,
> {
  /* Singleton Pattern */
  static _instance?: GenericGameManager;
  constructor() {
    if (!GenericGameManager._instance) GenericGameManager._instance = this as GenericGameManager;
    return GenericGameManager._instance as typeof this;
  }

  /**
   * @property extraColumns
   * Used to determine extra columns that should be gathered in the ImportCsvForm, to match to
   * columns in the CSV. It's a mapping of property name (that's also used for the fuzzy matching)
   * to the translation key of the label that should be displayed.
   */
  extraColumns = {} as Record<ExtraColumnInputs, TranslationKey>;

  /**
   * @property extraValidationSchema
   * Yup object schema for the extraColumns keys, to properly validate the input given.
   */
  extraValidationSchema = yup.object() as yup.ObjectSchema<Record<ExtraColumnInputs, string | undefined>>;

  /**
   * @function matchName
   * This function takes a variable number of arguments (so subclasses can pass whatever information
   * they need) and returns whichever name on the form it matched, or null if it matched none.
   * @param args List of string arguments to use to match the name.
   * @returns The matched name on the form, or null if none was matched.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  matchName(arg0: string, ...args: string[]): Promise<string | null> {
    const parsedName = arg0;
    const mappedNames = getWebsiteRows().map((el) => el.textContent);
    let matchedName = null;
    for (const name of mappedNames) {
      if (compareNormalized(name, parsedName)) {
        return Promise.resolve(name);
      }
      // If we don't find an exact match, look for the last one that contains it
      if (normalizeString(name).includes(normalizeString(parsedName))) matchedName = name;
    }
    return Promise.resolve(matchedName);
  };

  /**
   * @function parseCsv
   * This function is what will be used to transform the columns inputs to the internal ParsedRow
   * structure.
   * @param file The CSV file that was imported.
   * @param columnMapping The mappings from the property names to the columns in the CSV.
   * @returns A list of ParsedRows from the CSV data.
   */
  async parseCsv(
    file: File,
    columnMapping: ({
      name: string,
      quantity: string | undefined,
      price: string | undefined,
      language: string | undefined,
    } & Record<ExtraColumnInputs, string | undefined>),
  ): Promise<(CommonParsedRowFields & ExtraParsedRowFields)[]> {
    const data = await readCsv(file);

    const rows = [];
    for (const [i, row] of data.rows.entries()) {
      const parsedName = String(row[columnMapping['name']]);
      const matchedName = await this.matchName(parsedName);

      rows.push({
        id: i,
        name: parsedName,
        quantity: columnMapping['quantity'] ? (Number(row[columnMapping['quantity']]) || 0) : 0,
        price: columnMapping['price'] ? (Number(row[columnMapping['price']]) || 0) : 0,
        language: columnMapping['language'] ? String(row[columnMapping['language']]) : '',
        enabled: !!matchedName,
        matchedName,
      });
    }

    return rows as (CommonParsedRowFields & ExtraParsedRowFields)[];
  };

  /**
   * @function fillPage
   * This function takes in a list of (selected) ParsedRows and fills the page Cardmarket page with
   * the data.
   * @param rows The rows to fill in.
   * @returns The number of rows that were successfully filled in.
   */
  async fillPage(rows: (CommonParsedRowFields & ExtraParsedRowFields)[]): Promise<number> {
    const websiteRows = getWebsiteRows();
    let count = 0;
    rows.forEach((row) => {
      const nameEl = websiteRows.find(
        (el) => compareNormalized(el.textContent, row.matchedName ?? row.name),
      );
      if (!nameEl) return;
      let trEl = nameEl.parentElement!.parentElement!.parentElement!;
      let quantityEl: HTMLInputElement = trEl.querySelector(quantityElSelector)!;
      let priceEl: HTMLInputElement = trEl.querySelector(priceElSelector)!;
      let languageEl: HTMLSelectElement = trEl.querySelector(languageElSelector)!;

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
        languageEl = trEl.querySelector(languageElSelector)!;
        languageEl.value = languageEl.options[0]?.value ?? '';
      }
      // Now input the data
      if (row.quantity) quantityEl.value = row.quantity.toString();
      if (row.price) priceEl.value = row.price.toFixed(2);
      if (row.language) {
        // Try to match language by option text or value
        const options = Array.from(languageEl.options);
        const normalizedLang = normalizeString(row.language);
        
        // First try direct match
        let matchedOption = options.find(
          (opt) => compareNormalized(opt.text, row.language) || compareNormalized(opt.value, row.language),
        );
        
        // If no match and looks like language code, try mapping
        if (!matchedOption && normalizedLang.length <= 3) {
          const possibleNames = languageCodeMap[normalizedLang.toLowerCase()];
          if (possibleNames) {
            matchedOption = options.find((opt) => 
              possibleNames.some((name) => compareNormalized(opt.text, name)),
            );
          }
        }
        
        if (matchedOption) {
          languageEl.value = matchedOption.value;
        } else {
          console.warn(`[cardmarket-bulk-import] Could not match language: "${row.language}"`);
        }
      }
      count += 1;
    });
    return Promise.resolve(count);
  };

  /**
   * @property extraTableColumns
   * Used to table additional data on the SelectRowsForm. Represents a mapping of the parsed
   * property to three options:
   * - `null` -> The value will not be tabled / will be omitted from the table;
   * - `TranslationKey` -> The translation key for the label of the column;
   * - `{ label: TranslationKey, size: number }` -> An object with the translation key for the label
   * of the column, and a size property that will be passed to bootstraps' column system.
   */
  extraTableColumns = {} as Record<
    keyof ExtraParsedRowFields,
    null | TranslationKey | { label: TranslationKey, size: number }
  >;
};

export default GenericGameManager;
