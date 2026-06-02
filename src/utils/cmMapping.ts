/**
 * cmMapping.ts — CM expansion/rarity ID mapping utilities.
 *
 * Maps stored in localStorage so they persist across page reloads.
 * Synced to ACE via POST /api/settings/cm-expansion-map.
 */

export type CmExpansionMap = Record<string, number>;  // set_name  → idExpansion
export type CmRarityMap    = Record<string, number>;  // rarity    → idRarity

/** Normalise typographic quotes/apostrophes to ASCII equivalents so that
 *  ACE set names (straight quotes) match CM dropdown names (curly quotes). */
export function normaliseQuotes(s: string): string {
  return s
    .replace(/[‘’ʼ]/g, "'")   // ' ' ʼ  → '
    .replace(/[“”]/g, '"');          // " "    → "
}

const LS_EXPANSIONS = 'ace_cm_expansion_map';
const LS_RARITIES   = 'ace_cm_rarity_map';

export function getStoredExpansionMap(): CmExpansionMap {
  try { return JSON.parse(localStorage.getItem(LS_EXPANSIONS) || '{}'); }
  catch { return {}; }
}

export function getStoredRarityMap(): CmRarityMap {
  try { return JSON.parse(localStorage.getItem(LS_RARITIES) || '{}'); }
  catch { return {}; }
}

export function storeExpansionMap(map: CmExpansionMap) {
  localStorage.setItem(LS_EXPANSIONS, JSON.stringify(map));
}

export function storeRarityMap(map: CmRarityMap) {
  localStorage.setItem(LS_RARITIES, JSON.stringify(map));
}

export function isMappingSynced(): boolean {
  const map = getStoredExpansionMap();
  return Object.keys(map).length > 0;
}

/**
 * Sync the expansion+rarity maps to ACE.
 * Called after reading the dropdowns on the BulkListing page.
 */
export async function syncMapsToAce(
  expansions: CmExpansionMap,
  rarities: CmRarityMap,
  aceBaseUrl: string,
  token: string,
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${aceBaseUrl}/api/settings/cm-expansion-map`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ expansions, rarities }),
    });
    if (!res.ok) return { ok: false, message: `ACE returned ${res.status}` };
    const data = await res.json();
    return {
      ok:      true,
      message: `Synced ${data.expansions} sets and ${data.rarities} rarities to ACE`,
    };
  } catch (e) {
    return { ok: false, message: `Network error: ${e}` };
  }
}

// ---------------------------------------------------------------------------
// Auto-mode queue — persisted in localStorage across page reloads
// ---------------------------------------------------------------------------

export type AutoQueueItem = {
  expansion:   string;   // set_name (for display)
  idExpansion: number;
  idRarity:    number;   // 0 = All
  rarityLabel: string;   // for display
  rows: Array<{
    name:       string;
    quantity:   number;
    price:      number;
    language:   string;
    condition:  string;
    isFirstEd:  boolean;
    comments:   string;
    aceId:      number;  // owned_card.id (0 = not available / old export without ACE_ID col)
  }>;
  done: boolean;
};

const LS_AUTO_QUEUE   = 'ace_cm_auto_queue';
const LS_AUTO_CURRENT = 'ace_cm_auto_current';  // index of the set being processed

export function getAutoQueue(): AutoQueueItem[] {
  try { return JSON.parse(localStorage.getItem(LS_AUTO_QUEUE) || '[]'); }
  catch { return []; }
}

export function setAutoQueue(queue: AutoQueueItem[]) {
  localStorage.setItem(LS_AUTO_QUEUE, JSON.stringify(queue));
}

export function getAutoCurrentIndex(): number {
  return parseInt(localStorage.getItem(LS_AUTO_CURRENT) || '-1', 10);
}

export function setAutoCurrentIndex(idx: number) {
  localStorage.setItem(LS_AUTO_CURRENT, String(idx));
}

export function clearAutoQueue() {
  localStorage.removeItem(LS_AUTO_QUEUE);
  localStorage.removeItem(LS_AUTO_CURRENT);
}

export function isAutoModeActive(): boolean {
  const queue = getAutoQueue();
  const idx   = getAutoCurrentIndex();
  return queue.length > 0 && idx >= 0 && idx < queue.length;
}

/**
 * Extract rarity name from a V.N card name.
 * "Pre-Preparation of Rites (V.3 - Secret Rare)" → "Secret Rare"
 * "Crystron Sulfador" → null  (single rarity, no filter needed)
 */
export function rarityFromCardName(name: string): string | null {
  const m = name.match(/\(V\.\d+ - (.+?)\)$/);
  return m ? m[1] : null;
}

/**
 * Given a list of card names from one set, return the dominant rarity.
 * Uses the first V.N name found (all cards in a set should have the same rarity).
 */
export function dominantRarity(names: string[]): string | null {
  for (const n of names) {
    const r = rarityFromCardName(n);
    if (r) return r;
  }
  return null;
}

/**
 * Tell ACE that the given owned_card IDs have been listed on Cardmarket.
 * ACE will mark them as 'listed' so they are excluded from future exports.
 *
 * Uses keepalive:true so the request survives a page navigation (the CM form
 * submission causes a page reload, but we fire this request beforehand and
 * keepalive ensures it completes even if the page unloads mid-flight).
 *
 * Silently ignores errors — listing has already succeeded on CM; failing to
 * mark in ACE is recoverable (the user can re-export and skip already-listed
 * cards manually, or just note the duplicate).
 */
export async function markListedInAce(
  ids: number[],
  aceBaseUrl: string,
  token: string,
): Promise<void> {
  const validIds = ids.filter(id => id > 0);
  if (!validIds.length || !aceBaseUrl || !token) return;
  try {
    await fetch(`${aceBaseUrl}/api/inventory/bulk-mark-listed`, {
      method:    'POST',
      keepalive: true,   // survives page unload
      headers:   { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:      JSON.stringify({ ids: validIds }),
    });
  } catch (e) {
    console.warn('[ACE] markListedInAce failed (non-fatal):', e);
  }
}
