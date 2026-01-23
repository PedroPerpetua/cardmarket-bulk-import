import GenericGameManager from './managers/generic';
import MtgGameManager from './managers/mtg';
import type { ArrayElement } from '../../../utils';

// Utility type to shortcut the definition of the base ParsedRow
export type ParsedRow = ArrayElement<Awaited<ReturnType<GenericGameManager['parseCsv']>>>;

/**
 * Function to retrieve the correct GameManager, based on the current URL.
 * @returns The GameManager that should be used for the current URL.
 */
export function getCurrentManager(): GenericGameManager {
  switch (window.location.pathname) {
    case '/en/Magic/Stock/ListingMethods/BulkListing':
      return new MtgGameManager();
    default:
      return new GenericGameManager();
  }
}
