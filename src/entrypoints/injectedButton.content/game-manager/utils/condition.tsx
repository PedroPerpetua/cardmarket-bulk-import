import memoize from 'memoize';
import type { ReactNode } from 'react';

import { compareNormalized } from '../../../../utils';

export type ConditionData = {
  mkmValue: number,
  matchStrings: string[],
  badgeElement: ReactNode,
};

/**
 * Cardmarket appears to have the same possible conditions for every game.
 *
 * These conditions are never translated, and always appear under the same english name (the first
 * item of the `matchStrings`). The remaining possible values are extrapolated from their condition
 * guide: https://help.cardmarket.com/en/CardCondition
 *
 * Some have also been added from the values Manabox uses.
 */
export const mkmConditions: ConditionData[] = [
  {
    mkmValue: 1,
    matchStrings: ['Mint', 'mt', 'perfect'],
    badgeElement: (
      <span className="article-condition condition-mt">
        <span className="badge">MT</span>
      </span>
    ),
  },
  {
    mkmValue: 2,
    matchStrings: ['Near Mint', 'nm', 'booster-fresh', 'near_mint'],
    badgeElement: (
      <span className="article-condition condition-nm">
        <span className="badge">NM</span>
      </span>
    ),
  },
  {
    mkmValue: 3,
    matchStrings: ['Excellent', 'ex', 'minor wear', 'slightly played', 'sp'],
    badgeElement: (
      <span className="article-condition condition-ex">
        <span className="badge">EX</span>
      </span>
    ),
  },
  {
    mkmValue: 4,
    matchStrings: ['Good', 'gd', 'visible wear', 'moderately played', 'very good'],
    badgeElement: (
      <span className="article-condition condition-gd">
        <span className="badge">GD</span>
      </span>
    ),
  },
  {
    mkmValue: 5,
    // Additional US-Expressions omitted because they clash
    matchStrings: ['Light Played', 'lp', 'visible wear', 'light_played'],
    badgeElement: (
      <span className="article-condition condition-lp">
        <span className="badge">LP</span>
      </span>
    ),
  },
  {
    mkmValue: 6,
    matchStrings: ['Played', 'pl', 'damaged', 'heavily played'],
    badgeElement: (
      <span className="article-condition condition-pl">
        <span className="badge">PL</span>
      </span>
    ),
  },
  {
    mkmValue: 7,
    matchStrings: ['Poor', 'po', 'destroyed'],
    badgeElement: (
      <span className="article-condition condition-po">
        <span className="badge">PO</span>
      </span>
    ),
  },
];

const fallback = mkmConditions[1]!; // Near mint

function matchConditionImpl(inputCondition?: string): { matched: boolean, data: ConditionData } {
  if (!inputCondition) return { matched: false, data: fallback };
  const match = mkmConditions.find((data) => {
    if (compareNormalized(inputCondition, data.mkmValue.toString())) return true;
    if (data.matchStrings.some((v) => compareNormalized(inputCondition, v))) return true;
    return false;
  });
  return {
    matched: !!match,
    data: match ?? fallback,
  };
}

export const matchCondition = memoize(matchConditionImpl);
