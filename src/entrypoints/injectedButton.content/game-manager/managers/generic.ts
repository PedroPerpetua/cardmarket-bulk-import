import * as yup from 'yup';

import { compareNormalized, normalizeString } from '../../../../utils';
import type { TranslationKey } from '../../../../utils';
import { readCsv } from '../../../../utils/csv';
import { parseBoolean } from '../utils';
import { matchCondition } from '../utils/condition';
import type { ConditionData } from '../utils/condition';
import {
  commentElSelector,
  conditionElSelector,
  getWebsiteRows,
  languageElSelector,
  priceElSelector,
  quantityElSelector,
  reverseHoloElSelector,
  signedElSelector,
} from '../utils/html';
import { matchLanguage } from '../utils/language';
import type { LanguageData } from '../utils/language';

export type BaseColumnMapping = {
  name: string,
  language: string | undefined,
  condition: string | undefined,
  isSigned: string | undefined,
  isReverseHolo: string | undefined,
  comment: string | undefined,
  quantity: string | undefined,
  price: string | undefined,
};

export type CommonParsedRowFields = {
  id: number,
  name: {
    matchedName: string | null,
    value: string,
  },
  language: {
    matched: boolean,
    data: LanguageData,
  },
  condition: {
    matched: boolean,
    data: ConditionData,
  },
  isSigned: boolean,
  isReverseHolo: boolean,
  comment: string,
  quantity: number,
  price: number,
  enabled: boolean,
};

/**
 * The GenericGameManager class follows the Strategy Design Pattern as to implement support for
 * multiple games on Cardmarket. Each different game should implement it's subclass GameManager to
 * define any custom behaviour they need to handle their own game, in regards to the form they
 * present, parsing the CSV, or filling the bulk list form.
 *
 * This GenericGameManager has the base functionality that can be used generically for any game.
 *
 * All managers have to, by default, take an input column for the article name, and optional input
 * columns for language, quantity and price. They can define any extra columns they wish to parse.
 *
 * All managers will have their own internal ParsedRow type, that must include at least, id, name,
 * matchedName, language, quantity, price and enabled. They can parse and display any extra fields,
 * but these fields are required.
 */
class GenericGameManager<
  ExtraColumnInputs extends string = string,
  ExtraParsedRowFields extends Record<string, unknown> = Record<string, unknown>,
> {
  /* Singleton Pattern */
  static _instance?: GenericGameManager;
  constructor() {
    GenericGameManager._instance ??= this as GenericGameManager;
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
    let matchedName = null;
    for (const row of getWebsiteRows()) {
      const rowName = row.textContent;
      // Look for a translated name besides it
      const translatedName = row.nextSibling?.textContent ?? '';
      if (compareNormalized(rowName, parsedName) || compareNormalized(translatedName, parsedName)) {
        return Promise.resolve(rowName);
      }

      // If we don't find an exact match, look for the last one that contains it
      if (
        normalizeString(rowName).includes(normalizeString(parsedName))
        || normalizeString(translatedName).includes(normalizeString(parsedName))
      ) matchedName = rowName;
    }
    return Promise.resolve(matchedName);
  };

  /**
   * @function parseRow
   * This function takes the raw data for a row in the CSV and parsed it to generate a ParsedRow.
   *
   * This function takes the designated id for the row, the raw data extracted from the CSV, and the
   * column mapping given by the user. Calls to this function can be chained by subclasses in order
   * to parse additional information, by calling the `super` and then adding their own parsing to
   * the return value.
   * @param id The id that should be attributed to the parsed row.
   * @param rawRowData The raw information from the CSV to be parsed.
   * @param columnMapping The mappings from the property names to the columns in the CSV.
   * @returns The ParsedRow obtained from raw row data.
   */
  async parseRow(
    id: number,
    rawRowData: Record<string, unknown>,
    columnMapping: (BaseColumnMapping & Record<ExtraColumnInputs, string | undefined>),
  ): Promise<CommonParsedRowFields & ExtraParsedRowFields> {
    const parsedName = String(rawRowData[columnMapping.name]);
    const matchedName = await this.matchName(parsedName);
    const language = matchLanguage(
      columnMapping.language
        ? rawRowData[columnMapping.language] as string | undefined
        : undefined,
    );
    const condition = matchCondition(
      columnMapping.condition
        ? rawRowData[columnMapping.condition] as string | undefined
        : undefined,
    );
    return Promise.resolve({
      id,
      name: {
        matchedName,
        value: parsedName,
      },
      language,
      condition,
      isSigned: !!columnMapping.isSigned
        && parseBoolean(String(rawRowData[columnMapping.isSigned]), ['signed']),
      isReverseHolo: !!columnMapping.isReverseHolo
        && parseBoolean(
          String(rawRowData[columnMapping.isReverseHolo]),
          ['reverse', 'reverse holo', 'reverseholo', 'reverse_holo', 'rh', 'holo'],
        ),
      comment: columnMapping.comment ? String(rawRowData[columnMapping.comment]) : '',
      quantity: columnMapping.quantity ? (Number(rawRowData[columnMapping.quantity]) || 0) : 0,
      price: columnMapping.price ? (Number(rawRowData[columnMapping.price]) || 0) : 0,
      enabled: !!matchedName,
    } as CommonParsedRowFields & ExtraParsedRowFields);
  }

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
    columnMapping: (BaseColumnMapping & Record<ExtraColumnInputs, string | undefined>),
  ): Promise<(CommonParsedRowFields & ExtraParsedRowFields)[]> {
    const data = await readCsv(file);
    const rows = [];
    for (const [i, row] of data.rows.entries()) {
      rows.push(await this.parseRow(i, row, columnMapping));
    }
    return rows;
  };

  /**
   * @function fillRow
   * This function takes a row in the form and fills it with the ParsedRow data.
   *
   * This function both takes and returns the <tr /> HTML element that's being affected; it's
   * important to call the `super` of this function, because the GenericGameManager does the work
   * of identifying if the "found row" has already been filled and needs to be duplicated.
   * Subsequent logic should use the returned element from calling the `super`.
   * @param trEl The <tr /> HTML element that represents the row on the webpage, to be filled.
   * @param row The row data to use to fill the row.
   * @returns The <tr /> HTML element that has been filled in.
   */
  async fillRow(
    trEl: HTMLTableRowElement,
    row: (CommonParsedRowFields & ExtraParsedRowFields),
  ): Promise<HTMLTableRowElement> {
    let languageEl: HTMLSelectElement = trEl.querySelector(languageElSelector)!;
    let conditionEl: HTMLSelectElement = trEl.querySelector(conditionElSelector)!;
    let signedEl: HTMLInputElement = trEl.querySelector(signedElSelector)!;
    let commentEl: HTMLInputElement = trEl.querySelector(commentElSelector)!;
    let quantityEl: HTMLInputElement = trEl.querySelector(quantityElSelector)!;
    let priceEl: HTMLInputElement = trEl.querySelector(priceElSelector)!;

    // Check if there's already quantity on this row... if so, we may need to create a new one
    let resolvedEl = trEl;
    if (quantityEl.value && quantityEl.value !== '0') {
      const buttonEl: HTMLButtonElement = trEl.querySelector('td button.copy-row-button')!;
      buttonEl.click();
      resolvedEl = trEl.previousSibling as HTMLTableRowElement;
      // We need to point the fields to those of the new parent trEl and reset them
      languageEl = resolvedEl.querySelector(languageElSelector)!;
      languageEl.value = languageEl.options[0].value;
      conditionEl = resolvedEl.querySelector(conditionElSelector)!;
      conditionEl.value = conditionEl.options[1].value; // 1 for NM default
      signedEl = resolvedEl.querySelector(signedElSelector)!;
      signedEl.value = signedEl.defaultValue;
      const clonedReverseHoloEl = resolvedEl.querySelector(reverseHoloElSelector);
      if (clonedReverseHoloEl instanceof HTMLInputElement) clonedReverseHoloEl.checked = false;
      commentEl = resolvedEl.querySelector(commentElSelector)!;
      commentEl.value = commentEl.defaultValue;
      quantityEl = resolvedEl.querySelector(quantityElSelector)!;
      quantityEl.value = quantityEl.defaultValue;
      priceEl = resolvedEl.querySelector(priceElSelector)!;
      priceEl.value = priceEl.defaultValue;
    }
    // Now input the data
    languageEl.value = row.language.data.mkmValue.toString();
    conditionEl.value = row.condition.data.mkmValue.toString();
    signedEl.checked = row.isSigned;
    commentEl.value = row.comment;
    quantityEl.value = row.quantity.toString();
    priceEl.value = row.price.toFixed(2);
    // Reverse holo is game-dependent: only Pokemon rows render the checkbox. Query it
    // from resolvedEl (the possibly-duplicated row) and skip games that don't have it.
    const reverseHoloEl = resolvedEl.querySelector(reverseHoloElSelector);
    if (reverseHoloEl instanceof HTMLInputElement) reverseHoloEl.checked = row.isReverseHolo;

    return Promise.resolve(resolvedEl);
  }

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
    for (const row of rows) {
      const nameEl = websiteRows.find(
        (el) => compareNormalized(el.textContent, row.name.matchedName ?? row.name.value),
      );
      if (!nameEl) continue;
      const trEl = nameEl.parentElement!.parentElement!.parentElement! as HTMLTableRowElement;
      await this.fillRow(trEl, row);
      count += 1;
    };
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
