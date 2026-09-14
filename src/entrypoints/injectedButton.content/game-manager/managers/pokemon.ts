import * as yup from 'yup';

import GenericGameManager from './generic';
import type { BaseColumnMapping, CommonParsedRowFields } from './generic';
import { compareNormalized } from '../../../../utils';
import type { TranslationKey } from '../../../../utils';
import { parseBoolean } from '../utils';
import { getWebsiteRows } from '../utils/html';

type PokemonExtraFields = 'rarity' | 'isReverseHolo' | 'isSigned' | 'isFirstEd';
type PokemonFields = { rarity: string, isReverseHolo: boolean, isSigned: boolean, isFirstEd: boolean };
const flags = ['isReverseHolo', 'isSigned', 'isFirstEd'] as const;
const checkbox = (element: HTMLTableRowElement, field: string) =>
  element.querySelector<HTMLInputElement>(`input[name^="${field}["]`);
const getRarity = (element: HTMLTableRowElement) => {
  const symbol = element.querySelector('.rarity-symbol');
  return symbol?.getAttribute('aria-label') ?? symbol?.getAttribute('data-bs-original-title')
    ?? symbol?.getAttribute('data-original-title') ?? symbol?.getAttribute('title') ?? '';
};

function findRow(name: string, rarity: string): HTMLTableRowElement | null {
  if (!rarity.trim()) return null;
  // Reuse the original page rows, not newly inserted copies whose buttons may lack handlers.
  const rows = getWebsiteRows().map((link) => link.closest('tr')!).filter((element) => {
    const link = element.querySelector('.col-product a');
    return link && compareNormalized(link.textContent.replace(/\s+/g, ' '), name.replace(/\s+/g, ' '))
      && compareNormalized(getRarity(element), rarity);
  });
  // Copied rows share a link; different products sharing name + rarity must not be guessed.
  const links = new Set(rows.map((element) => element.querySelector('.col-product a')?.getAttribute('href')));
  return links.size === 1 ? rows[0]! : null;
}

class PokemonGameManager extends GenericGameManager<PokemonExtraFields, PokemonFields> {
  override extraColumns: Record<PokemonExtraFields, TranslationKey> = {
    rarity: 'injectedButton.gameManagers.pokemon.importCsvForm.rarity.label',
    isReverseHolo: 'injectedButton.gameManagers.pokemon.importCsvForm.isReverseHolo.label',
    isSigned: 'injectedButton.gameManagers.pokemon.importCsvForm.isSigned.label',
    isFirstEd: 'injectedButton.gameManagers.pokemon.importCsvForm.isFirstEd.label',
  };

  override extraValidationSchema = yup.object({
    rarity: yup.string().required(),
    isReverseHolo: yup.string(),
    isSigned: yup.string(),
    isFirstEd: yup.string(),
  });

  override matchName(name: string, rarity = ''): Promise<string | null> {
    return Promise.resolve(findRow(name, rarity)?.querySelector('.col-product a')?.textContent ?? null);
  }

  override async parseRow(
    id: number,
    raw: Record<string, unknown>,
    mapping: BaseColumnMapping & Record<PokemonExtraFields, string | undefined>,
  ) {
    const rarityValue = mapping.rarity ? raw[mapping.rarity] : '';
    const rarity = typeof rarityValue === 'string' ? rarityValue : '';
    const parsed = await super.parseRow(id, raw, mapping, rarity);
    return {
      ...parsed,
      rarity,
      isReverseHolo: !!mapping.isReverseHolo && parseBoolean(String(raw[mapping.isReverseHolo]), ['reverse holo']),
      isSigned: !!mapping.isSigned && parseBoolean(String(raw[mapping.isSigned]), ['signed']),
      isFirstEd: !!mapping.isFirstEd && parseBoolean(String(raw[mapping.isFirstEd]), ['first edition']),
    };
  }

  override getRowElement(row: CommonParsedRowFields & PokemonFields) {
    return findRow(row.name.value, row.rarity);
  }

  override async fillRow(element: HTMLTableRowElement, row: CommonParsedRowFields & PokemonFields) {
    const resolved = await super.fillRow(element, row);
    for (const flag of flags) {
      const el = checkbox(resolved, flag);
      // Unavailable options are ignored without blocking the other listing fields.
      if (el && !el.disabled) el.checked = row[flag];
    }
    return resolved;
  }

  override extractRow(element: HTMLTableRowElement): Record<string, string> {
    return {
      ...super.extractRow(element),
      rarity: getRarity(element),
      ...Object.fromEntries(flags.map((flag) => {
        const el = checkbox(element, flag);
        return [flag, String(!!el && !el.disabled && el.checked)];
      })),
    };
  }

  override extraTableColumns: Record<PokemonExtraFields, TranslationKey> = {
    rarity: 'injectedButton.gameManagers.pokemon.selectRowsFormTable.rarity',
    isReverseHolo: 'injectedButton.gameManagers.pokemon.selectRowsFormTable.isReverseHolo',
    isSigned: 'injectedButton.gameManagers.pokemon.selectRowsFormTable.isSigned',
    isFirstEd: 'injectedButton.gameManagers.pokemon.selectRowsFormTable.isFirstEd',
  };
};

export default PokemonGameManager;
