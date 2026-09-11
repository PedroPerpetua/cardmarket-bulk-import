import { i18n } from '#imports';

import * as yup from 'yup';

import GenericGameManager from './generic';
import type { BaseColumnMapping, CommonParsedRowFields } from './generic';
import type { TranslationKey } from '../../../../utils';

export type PokemonExtraFields = 'rarity' | 'isReverseHolo' | 'isSigned' | 'isFirstEd';
type PokemonFields = {
  rarity: string,
  isReverseHolo: boolean,
  isSigned: boolean,
  isFirstEd: boolean,
  issue: string,
};
type PokemonRow = CommonParsedRowFields & PokemonFields;
type PokemonMapping = BaseColumnMapping & Record<PokemonExtraFields, string | undefined>;
const flags = ['isReverseHolo', 'isSigned', 'isFirstEd'] as const;
const normalize = (value: unknown) => (typeof value === 'string' ? value : '')
  .normalize('NFC').replace(/\s+/g, ' ').trim();
const input = (row: HTMLTableRowElement, name: string) =>
  row.querySelector<HTMLInputElement>(`input[name^="${name}["]`);

// Read fresh DOM rows: name alone is not unique in Pokémon, even within one expansion.
function findRows(name: string, rarity: string) {
  if (!normalize(name) || !normalize(rarity)) return [];
  return [...document.querySelectorAll<HTMLTableRowElement>('tbody tr')].filter((row) => {
    const link = row.querySelector('.col-product a');
    const symbol = row.querySelector('.rarity-symbol');
    const label = symbol?.getAttribute('aria-label') ?? symbol?.getAttribute('data-bs-original-title')
      ?? symbol?.getAttribute('data-original-title') ?? symbol?.getAttribute('title');
    return !!input(row, 'amount') && normalize(link?.textContent) === normalize(name)
      && normalize(label) === normalize(rarity);
  });
}

function uniqueRow(name: string, rarity: string) {
  const rows = findRows(name, rarity);
  // Copy-row duplicates share a link. Different links for the same pair are ambiguous.
  const links = new Set(rows.map((row) => row.querySelector('.col-product a')?.getAttribute('href')));
  return { row: links.size === 1 ? rows[0] : undefined, ambiguous: links.size > 1 };
}

class PokemonGameManager extends GenericGameManager<PokemonExtraFields, PokemonFields> {
  override extraColumns: Record<PokemonExtraFields, TranslationKey> = {
    rarity: 'injectedButton.gameManagers.pokemon.importCsvForm.rarity.label',
    isReverseHolo: 'injectedButton.gameManagers.pokemon.importCsvForm.isReverseHolo.label',
    isSigned: 'injectedButton.gameManagers.pokemon.importCsvForm.isSigned.label',
    isFirstEd: 'injectedButton.gameManagers.pokemon.importCsvForm.isFirstEd.label',
  };

  override extraValidationSchema = yup.object({
    rarity: yup.string().required(i18n.t('injectedButton.gameManagers.pokemon.rarityRequired')),
    isReverseHolo: yup.string(),
    isSigned: yup.string(),
    isFirstEd: yup.string(),
  });

  // Generic parseRow calls this without rarity. Defer matching to our parseRow below.
  override matchName(): Promise<string | null> {
    return Promise.resolve(null);
  }

  private getIssue(element: HTMLTableRowElement, row: PokemonRow): string {
    for (const [name, data] of [['idLanguage', row.language], ['idCondition', row.condition]] as const) {
      const el = element.querySelector<HTMLSelectElement>(`select[name^="${name}["]`);
      if (!el || el.disabled || ![...el.options].some((o) => !o.disabled && o.value === String(data.data.mkmValue))) {
        return i18n.t('injectedButton.gameManagers.pokemon.unavailableOption') + name;
      }
    }
    const amount = input(element, 'amount');
    const price = input(element, 'price');
    const comment = input(element, 'comments');
    if (!amount || !price || !comment || amount.disabled || price.disabled || comment.disabled) {
      return i18n.t('injectedButton.gameManagers.pokemon.unavailableFields');
    }
    if (!Number.isSafeInteger(row.quantity) || row.quantity <= 0
      || row.quantity < Number(amount.min || 0) || row.quantity > Number(amount.max || Infinity)) {
      return i18n.t('injectedButton.gameManagers.pokemon.invalidQuantity');
    }
    if (!Number.isFinite(row.price) || row.price < Number(price.dataset.minAmount ?? 0.02)
      || row.price > Number(price.dataset.maxAmount ?? Infinity)) {
      return i18n.t('injectedButton.gameManagers.pokemon.invalidPrice');
    }
    return '';
  }

  override async parseRow(id: number, raw: Record<string, unknown>, mapping: PokemonMapping): Promise<PokemonRow> {
    const base = await super.parseRow(id, raw, mapping);
    const rarity = normalize(mapping.rarity ? raw[mapping.rarity] : '');
    const match = uniqueRow(base.name.value, rarity);
    const row: PokemonRow = { ...base, rarity, isReverseHolo: false, isSigned: false, isFirstEd: false, issue: '' };
    const ignored: string[] = [];
    for (const flag of flags) {
      const el = match.row ? input(match.row, flag) : null;
      if (match.row && (!el || el.disabled)) {
        const value = normalize(mapping[flag] ? raw[mapping[flag]] : '').toLowerCase();
        if (!['', 'false', '0', 'no', 'n', 'f'].includes(value)) ignored.push(flag);
        continue;
      }
      const value = normalize(mapping[flag] ? raw[mapping[flag]] : '').toLowerCase();
      row[flag] = ['true', '1', 'yes', 'y', 't'].includes(value);
      if (!row[flag] && !['', 'false', '0', 'no', 'n', 'f'].includes(value)) {
        row.issue = i18n.t('injectedButton.gameManagers.pokemon.invalidBoolean') + flag;
      }
    }
    for (const name of ['language', 'condition'] as const) {
      if (mapping[name] && normalize(raw[mapping[name]]) && !row[name].matched) {
        row.issue = i18n.t('injectedButton.gameManagers.pokemon.unavailableOption') + name;
      }
    }
    if (!rarity) row.issue = i18n.t('injectedButton.gameManagers.pokemon.rarityRequired');
    else if (match.ambiguous) row.issue = i18n.t('injectedButton.gameManagers.pokemon.ambiguous');
    else if (!match.row) row.issue = i18n.t('injectedButton.gameManagers.pokemon.notFound');
    if (!row.issue && match.row) row.issue = this.getIssue(match.row, row);
    row.enabled = !row.issue;
    // Disabled Pokémon rows cannot be manually forced through the existing selection UI.
    row.name.matchedName = row.enabled ? match.row!.querySelector('.col-product a')!.textContent : null;
    if (row.enabled && ignored.length) {
      row.issue = i18n.t('injectedButton.gameManagers.pokemon.ignoredFlags') + ignored.join(', ');
    }
    return row;
  }

  override async fillRow(element: HTMLTableRowElement, row: PokemonRow): Promise<HTMLTableRowElement> {
    const issue = this.getIssue(element, row);
    if (issue) throw new Error(issue);
    const resolved = await super.fillRow(element, row);
    for (const flag of flags) {
      const el = input(resolved, flag);
      if (el && !el.disabled) {
        el.checked = row[flag];
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    return resolved;
  }

  override async fillPage(rows: PokemonRow[]): Promise<number> {
    // Preflight the complete selection before writing anything, in case the page changed.
    const targets = rows.map((row) => {
      const match = uniqueRow(row.name.value, row.rarity);
      const issue = !row.enabled || !match.row
        ? i18n.t('injectedButton.gameManagers.pokemon.pageChanged')
        : this.getIssue(match.row, row);
      if (issue) throw new Error(issue);
      return { row, element: match.row! };
    });
    for (const { row, element } of targets) await this.fillRow(element, row);
    return targets.length;
  }

  extractCsv(): string {
    const columns = ['name', 'rarity', 'language', 'condition', ...flags, 'comment', 'quantity', 'price'];
    const rows = [...document.querySelectorAll<HTMLTableRowElement>('tbody tr')].flatMap((element) => {
      const name = element.querySelector('.col-product a')?.textContent;
      const symbol = element.querySelector('.rarity-symbol');
      const rarity = symbol?.getAttribute('aria-label') ?? symbol?.getAttribute('data-bs-original-title')
        ?? symbol?.getAttribute('data-original-title') ?? symbol?.getAttribute('title');
      if (!name || !rarity || !input(element, 'amount')) return [];
      const selected = (field: string) => element.querySelector<HTMLSelectElement>(`select[name^="${field}["]`)
        ?.selectedOptions[0]?.textContent ?? '';
      return [
        [
          normalize(name),
          normalize(rarity),
          selected('idLanguage'),
          selected('idCondition'),
          ...flags.map((flag) => {
            const el = input(element, flag);
            return el && !el.disabled && el.checked ? 'true' : 'false';
          }),
          input(element, 'comments')?.value ?? '',
          input(element, 'amount')?.value ?? '0',
          input(element, 'price')?.value ?? '',
        ],
      ];
    });
    const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
    return '\uFEFF' + [columns, ...rows].map((row) => row.map(quote).join(',')).join('\r\n') + '\r\n';
  }

  override extraTableColumns: Record<keyof PokemonFields, TranslationKey> = {
    rarity: 'injectedButton.gameManagers.pokemon.selectRowsFormTable.rarity',
    isReverseHolo: 'injectedButton.gameManagers.pokemon.selectRowsFormTable.isReverseHolo',
    isSigned: 'injectedButton.gameManagers.pokemon.selectRowsFormTable.isSigned',
    isFirstEd: 'injectedButton.gameManagers.pokemon.selectRowsFormTable.isFirstEd',
    issue: 'injectedButton.gameManagers.pokemon.selectRowsFormTable.issue',
  };
}

export default PokemonGameManager;
