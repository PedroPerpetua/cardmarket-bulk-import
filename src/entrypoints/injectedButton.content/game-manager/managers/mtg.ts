import memoize from 'memoize';
import { sendMessage } from 'webext-bridge/content-script';
import * as yup from 'yup';

import GenericGameManager from './generic';
import type { BaseColumnMapping, CommonParsedRowFields } from './generic';
import { MTG_SET_FALLBACK } from './mtg-set-fallback';
import { compareNormalized } from '../../../../utils';
import type { TranslationKey } from '../../../../utils';
import { parseBoolean } from '../utils';

async function getMTGJSONDataImpl() {
  // We can't fetch inside the content script, so we delegate to the background with messages
  return sendMessage('cardmarket-bulk-import.getMTGJSONData', undefined, 'background');
}

const getMTGJSONData = memoize(getMTGJSONDataImpl);

async function matchSetToCardmarketIdImpl(set: string) {
  const sets = await getMTGJSONData();
  // Search by code first
  const codeResult = sets.find(({ code }) => compareNormalized(code, set));
  if (codeResult) return codeResult;
  // Search on all match keys
  const result = sets.find(({ matchKeys }) => !!matchKeys.find((v) => compareNormalized(v, set)));
  if (result) return { code: result.code, name: result.name, cardmarketId: result.cardmarketId };
  // Search on the manual fallback for sets MTGJSON has no Cardmarket id for
  const fallbackKey = Object.keys(MTG_SET_FALLBACK).find((k) => compareNormalized(k, set));
  if (fallbackKey) {
    const fallback = MTG_SET_FALLBACK[fallbackKey]!;
    return { code: fallbackKey, name: fallback.name, cardmarketId: fallback.cardmarketId };
  }
  return null;
}

const matchSetToCardmarketId = memoize(matchSetToCardmarketIdImpl);

const foilElSelector = 'td input[name^="isFoil"]';
export const signedElSelector = 'td input[name^="isSigned"]';

// NOTE: Signed & Foil fields are shared with _some_ games. Ideally we generalize them somehow.
type MtgExtraFields = 'set' | 'isFoil' | 'isSigned';
export type MtgExtraFieldsType = {
  set: string,
  setName: string,
  cardmarketId: number | null,
  isFoil: boolean,
  isSigned: boolean,
};

class MtgGameManager extends GenericGameManager<MtgExtraFields, MtgExtraFieldsType> {
  override gameId = 'mtg';

  override extraColumns: Record<MtgExtraFields, TranslationKey> = {
    set: 'injectedButton.gameManagers.mtg.importCsvForm.set.label',
    isFoil: 'injectedButton.gameManagers.mtg.importCsvForm.isFoil.label',
    isSigned: 'injectedButton.gameManagers.mtg.importCsvForm.isSigned.label',
  };

  override extraValidationSchema = yup.object({
    set: yup.string(),
    isFoil: yup.string(),
    isSigned: yup.string(),
  });

  override async matchName(parsedName: string): Promise<string | null> {
    const direct = await super.matchName(parsedName);
    if (direct) return direct;
    // Double-faced cards: fallback to the front face only
    if (parsedName.includes('//')) {
      const frontFace = parsedName.split('//')[0]!.trim();
      if (frontFace && frontFace !== parsedName) return super.matchName(frontFace);
    }
    return null;
  }

  override async parseRow(
    id: number,
    rawRowData: Record<string, unknown>,
    columnMapping: BaseColumnMapping & Record<MtgExtraFields, string | undefined>,
  ) {
    const parsedData = await super.parseRow(id, rawRowData, columnMapping);
    let set = columnMapping.set ? String(rawRowData[columnMapping.set]) : '';
    let setName = '';
    let cardmarketId: number | null = null;
    let enabled = parsedData.enabled;
    if (set) {
      const paramsCode = Number(new URLSearchParams(window.location.search).get('idExpansion'));
      const data = await matchSetToCardmarketId(set);
      if (data) {
        set = data.code;
        setName = data.name;
        cardmarketId = data.cardmarketId;
        if (data.cardmarketId !== paramsCode) enabled = false;
      }
      else {
        set = '';
      }
    }
    return {
      ...parsedData,
      set,
      setName,
      cardmarketId,
      isFoil: !!columnMapping.isFoil
        && parseBoolean(String(rawRowData[columnMapping.isFoil]), ['foil']),
      isSigned: !!columnMapping.isSigned
        && parseBoolean(String(rawRowData[columnMapping.isSigned]), ['signed']),
      enabled,
    };
  }

  override async fillRow(
    trEl: HTMLTableRowElement,
    row: (CommonParsedRowFields & MtgExtraFieldsType),
  ): Promise<HTMLTableRowElement> {
    const resolvedEl = await super.fillRow(trEl, row);
    const foilEl: HTMLInputElement = resolvedEl.querySelector(foilElSelector)!;
    foilEl.checked = row.isFoil;
    const signedEl: HTMLInputElement = resolvedEl.querySelector(signedElSelector)!;
    signedEl.checked = row.isSigned;
    return resolvedEl;
  };

  override extraTableColumns: Record<
    keyof MtgExtraFieldsType,
    null | TranslationKey | { label: TranslationKey, size: number }
  > = {
    set: 'injectedButton.gameManagers.mtg.selectRowsFormTable.set',
    setName: null,
    cardmarketId: null,
    isFoil: 'injectedButton.gameManagers.mtg.selectRowsFormTable.isFoil',
    isSigned: 'injectedButton.gameManagers.mtg.selectRowsFormTable.isSigned',
  };
};

export default MtgGameManager;
