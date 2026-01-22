import * as yup from 'yup';

import GenericGameManager from './managers/generic';
import MtgGameManager from './managers/mtg';
import type { ArrayElement, TranslationKey } from '../../../utils';

export type CommonParsedRowFields = {
  id: number,
  name: string,
  quantity: number,
  price: number,
  enabled: boolean,
  nameMatched: boolean,
};

/**
 * The GameManager interface follows the Strategy Design Pattern as to implement support for
 * multiple games on Cardmarket. Each different game should implement it's own GameManager with all
 * required functionality to get and parse the CSV, select the rows to fill, and finally fill the
 * page.
 *
 * All managers have to, by default, take an input column for the article name, and optional inputs
 * for price and quantity. They can define any extra columns they wish to parse.
 *
 * All managers will have their own internal ParsedRow type, that must include at least, id, name,
 * quantity, price, enabled and nameMatched. They can parse and display any extra fields, but these
 * 5 fields are required.
 */
export type GameManagerInterface<
  ExtraColumnInputs extends string = string,
  ExtraParsedRowFields extends { [key: string]: unknown } = Record<string, unknown>,
> = {
  /**
   * @property extraColumns
   * Used to determine extra columns that should be gathered in the ImportCsvForm, to match to
   * columns in the CSV. It's a mapping of property name (that's also used for the fuzzy matching)
   * to the translation key of the label that should be displayed.
   */
  extraColumns: Record<ExtraColumnInputs, TranslationKey>,
  /**
   * @property extraValidationSchema
   * Yup object schema for the extraColumns keys, to properly validate the input given.
   */
  extraValidationSchema: yup.ObjectSchema<Record<ExtraColumnInputs, string | undefined>>,
  /**
   * @function parseCsv
   * This function is what will be used to transform the columns inputs to the internal ParsedRow
   * structure.
   * @param file The CSV file that was imported.
   * @param columnMapping The mappings from the property names to the columns in the CSV.
   * @returns A list of ParsedRows from the CSV data.
   */
  parseCsv: (
    file: File,
    columnMapping: ({
      name: string,
      quantity: string | undefined,
      price: string | undefined,
    } & Record<ExtraColumnInputs, string | undefined>),
  ) => Promise<(CommonParsedRowFields & ExtraParsedRowFields)[]>,
  /**
   * @function fillPage
   * This function takes in a list of (selected) ParsedRows and fills the page Cardmarket page with
   * the data.
   * @param rows The rows to fill in.
   * @returns The number of rows that were successfully filled in.
   */
  fillPage: (rows: (CommonParsedRowFields & ExtraParsedRowFields)[]) => Promise<number>,
  /**
   * @property extraTableColumns
   * Used to table additional data on the SelectRowsForm. Represents a mapping of the parsed
   * property to three options:
   * - `null` -> The value will not be tabled / will be omitted from the table;
   * - `TranslationKey` -> The translation key for the label of the column;
   * - `{ label: TranslationKey, size: number }` -> An object with the translation key for the label
   * of the column, and a size property that will be passed to bootstraps' column system.
   */
  extraTableColumns: Record<
    keyof ExtraParsedRowFields,
  null | TranslationKey | { label: TranslationKey, size: number }
  >,
};

// Utility type to shortcut the definition of the base ParsedRow
export type ParsedRow = ArrayElement<Awaited<ReturnType<GameManagerInterface['parseCsv']>>>;

/**
 * Function to retrieve the correct GameManager, based on the current URL.
 * @returns The GameManager that should be used for the current URL.
 */
export function getCurrentManager(): GameManagerInterface {
  switch (window.location.pathname) {
    case '/en/Magic/Stock/ListingMethods/BulkListing':
      // @ts-expect-error // We return a specific under the guise of a generic
      return MtgGameManager;
    default:
      return GenericGameManager;
  }
}
