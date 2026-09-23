import { storage } from '#imports';

import type { BaseColumnMapping } from '../entrypoints/injectedButton.content/game-manager/managers/generic';

export type StoredColumnMapping = BaseColumnMapping & Record<string, string | undefined>;

export type StoredCsvImport = {
  game: string,
  csvText: string,
  fileName: string,
  columnMapping: StoredColumnMapping,
  importedAt: number,
};

export const storedCsvImport = storage.defineItem<StoredCsvImport | null>(
  'local:storedCsvImport',
  { fallback: null },
);

export type AutoFillSession = {
  editionId: number,
  totalFilled: number,
  startedAt: number,
  stopped: boolean,
};

export const autoFillSession = storage.defineItem<AutoFillSession | null>(
  'local:autoFillSession',
  { fallback: null },
);
