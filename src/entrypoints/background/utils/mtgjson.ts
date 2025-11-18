import memoize from 'memoize';
import type { Set } from 'mtggraphql';

import { readCsv } from '../../../utils/csv';

const SETS_ENDPOINT = 'https://mtgjson.com/api/v5/csv/sets.csv';

async function getMTGJSONDataImpl() {
  const res = await fetch(SETS_ENDPOINT);
  const blob = await res.blob();
  const file = new File([blob], 'sets.csv');
  const data = await readCsv(file);
  return (data.rows as Set[])
    // Convert the set Ids to number correctly
    .map((v) => ({ ...v, mcmId: Number(v.mcmId) }))
    // Filter out any that don't have a set Id
    .filter((set) => Number.isFinite(set.mcmId))
    // Map to our data structure
    .map((set) => ({
      matchKeys: [set.code, set.codeV3, set.id, set.mcmId, set.mcmName, set.mtgoCode, set.name]
        .filter((v) => !!v)
        .map((v) => v!.toString()),
      code: set.code!,
      cardmarketId: set.mcmId,
    }));
}

export const getMTGJSONData = memoize(getMTGJSONDataImpl);
