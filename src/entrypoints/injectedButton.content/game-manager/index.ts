import GenericGameManager from './managers/generic';
import MtgGameManager from './managers/mtg';
import PokemonGameManager from './managers/pokemon';
import type { ArrayElement } from '../../../utils';

// Utility type to shortcut the definition of the base ParsedRow
export type ParsedRow = ArrayElement<Awaited<ReturnType<GenericGameManager['parseCsv']>>>;

/**
 * Function to retrieve the correct GameManager, based on the current URL.
 * @returns The GameManager that should be used for the current URL.
 */
export function getCurrentManager(): GenericGameManager {
  // Remove the language identifier from the beginning
  const location = window.location.pathname.split('/').slice(2).join('/');
  switch (location) {
    case 'Magic/Stock/ListingMethods/BulkListing':
      return new MtgGameManager();
    case 'Pokemon/Stock/ListingMethods/BulkListing':
      return new PokemonGameManager();
    default:
      return new GenericGameManager();
  }
}
