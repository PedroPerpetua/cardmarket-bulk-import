/**
 * AutoModeForm.tsx — Upload a flat CSV from ACE and let the extension
 * auto-navigate through each set on Cardmarket, filling and submitting.
 */
import { i18n } from '#imports';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Form, ProgressBar, Spinner, Stack } from 'react-bootstrap';

import { readCsv } from '../../../utils/csv';
import {
  applyBulkListingFilter,
  getWebsiteRows,
  setChecked,
  setInputValue,
  setSelectValue,
  submitBulkListingForm,
  conditionElSelector,
  firstEdElSelector,
  commentsElSelector,
  quantityElSelector,
  priceElSelector,
  languageElSelector,
} from '../game-manager/utils/html';
import { matchLanguage } from '../game-manager/utils/language';
import { compareNormalized } from '../../../utils';
import {
  clearAutoQueue,
  dominantRarity,
  getAutoCurrentIndex,
  getAutoQueue,
  getStoredExpansionMap,
  getStoredRarityMap,
  isAutoModeActive,
  normaliseQuotes,
  setAutoCurrentIndex,
  setAutoQueue,
  storeExpansionMap,
  storeRarityMap,
  syncMapsToAce,
  type AutoQueueItem,
} from '../../../utils/cmMapping';
import { readExpansionMap, readRarityMap } from '../game-manager/utils/html';

// ACE condition codes → CM idCondition values
const CONDITION_ID_MAP: Record<string, string> = {
  MT: '1', NM: '2', EX: '3', GD: '4', LP: '5', PL: '6', PO: '7',
};
const VALID_CONDITIONS = new Set(Object.keys(CONDITION_ID_MAP));

type AutoModeFormProps = {
  onClose: () => void;
};

type AutoStatus =
  | { type: 'idle' }
  | { type: 'syncing' }
  | { type: 'synced'; message: string }
  | { type: 'processing'; setName: string; current: number; total: number; skipped?: string[] }
  | { type: 'done'; filled: number; total: number; skipped?: string[] }
  | { type: 'error'; message: string };

export default function AutoModeForm({ onClose }: AutoModeFormProps) {
  const [status, setStatus]       = useState<AutoStatus>({ type: 'idle' });
  const [aceUrl, setAceUrl]       = useState(
    () => localStorage.getItem('ace_base_url') || 'https://ace.belfast.moe'
  );
  const [aceToken, setAceToken]   = useState(
    () => localStorage.getItem('ace_cm_token') || ''
  );
  const [isSynced, setIsSynced]   = useState(() => isAutoModeActive() || Object.keys(getStoredExpansionMap()).length > 0);
  const fileRef = useRef<HTMLInputElement>(null);

  // On mount: resume an in-progress run, or show "previous run done" message
  useEffect(() => {
    if (isAutoModeActive()) {
      resumeAutoRun();
    } else if (getAutoCurrentIndex() > 0) {
      // Queue is cleared but current > 0 → previous run completed
      setStatus({ type: 'done', filled: 0, total: getAutoCurrentIndex() });
      // Reset the index so this message only shows once
      setAutoCurrentIndex(-1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------------------------
  // Sync CM dropdown maps to localStorage + ACE
  // -------------------------------------------------------------------------
  async function handleSync() {
    setStatus({ type: 'syncing' });
    const expansions = readExpansionMap();
    const rarities   = readRarityMap();
    storeExpansionMap(expansions);
    storeRarityMap(rarities);
    setIsSynced(true);

    if (aceUrl && aceToken) {
      localStorage.setItem('ace_base_url', aceUrl);
      localStorage.setItem('ace_cm_token', aceToken);
      const result = await syncMapsToAce(expansions, rarities, aceUrl, aceToken);
      setStatus({
        type: result.ok ? 'synced' : 'error',
        message: result.message,
      });
    } else {
      setStatus({
        type:    'synced',
        message: `Cached ${Object.keys(expansions).length} sets locally (no ACE sync — enter URL+token to sync).`,
      });
    }
  }

  // -------------------------------------------------------------------------
  // Parse flat CSV and build auto queue
  // -------------------------------------------------------------------------
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await readCsv(file);
    if (!data.rows.length) {
      setStatus({ type: 'error', message: 'CSV is empty or could not be parsed.' });
      return;
    }

    // Detect column names (flat CSV has Expansion as first col)
    const headers = data.columns;
    const expCol  = headers.find(h => h.toLowerCase().includes('expansion'));
    const nameCol = headers.find(h => h.toLowerCase() === 'name');
    const qtyCol  = headers.find(h => h.toLowerCase().match(/quantity|count/));
    const priceCol  = headers.find(h => h.toLowerCase() === 'price');
    const langCol   = headers.find(h => h.toLowerCase() === 'language');
    const condCol   = headers.find(h => h.toLowerCase() === 'condition');
    const firstEdCol = headers.find(h => h.toLowerCase().match(/firstEd|first.edition/i));
    const commentCol = headers.find(h => h.toLowerCase().match(/comment/i));

    if (!expCol || !nameCol) {
      setStatus({ type: 'error', message: `CSV must have "Expansion" and "Name" columns. Found: ${headers.join(', ')}` });
      return;
    }

    // Group rows by expansion
    const byExpansion = new Map<string, typeof data.rows>();
    for (const row of data.rows) {
      const exp = String(row[expCol] || '').trim();
      if (!exp) continue;
      if (!byExpansion.has(exp)) byExpansion.set(exp, []);
      byExpansion.get(exp)!.push(row);
    }

    const expansionMap = getStoredExpansionMap();
    const rarityMap    = getStoredRarityMap();

    const queue: AutoQueueItem[] = [];
    const missing: string[] = [];

    // Build a normalised lookup (curly quotes → straight) so ACE names match CM names
    const normExpansionMap: Record<string, number> = {};
    for (const [k, v] of Object.entries(expansionMap)) {
      normExpansionMap[normaliseQuotes(k)] = v;
    }

    for (const [expansion, rows] of byExpansion) {
      const idExpansion = expansionMap[expansion] ?? normExpansionMap[normaliseQuotes(expansion)];
      if (!idExpansion) { missing.push(expansion); continue; }

      const cardNames   = rows.map(r => String(r[nameCol!] || ''));
      const rarityLabel = dominantRarity(cardNames) || '';
      const idRarity    = rarityLabel ? (rarityMap[rarityLabel] || 0) : 0;

      queue.push({
        expansion,
        idExpansion,
        idRarity,
        rarityLabel,
        done: false,
        rows: rows.map(r => ({
          name:      String(r[nameCol!]      || ''),
          quantity:  Number(r[qtyCol!]       || 0),
          price:     Number(r[priceCol!]     || 0),
          language:  String(r[langCol!]      || 'English'),
          condition: String(r[condCol!]      || 'NM').trim().toUpperCase(),
          isFirstEd: String(r[firstEdCol!]   || '').toLowerCase() === 'yes',
          comments:  String(r[commentCol!]   || ''),
        })),
      });
    }

    if (!queue.length) {
      setStatus({
        type: 'error',
        message: missing.length
          ? `No sets matched the expansion map. Missing: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}. Try re-syncing CM Maps.`
          : 'No processable sets found in CSV.',
      });
      return;
    }

    setAutoQueue(queue);
    setAutoCurrentIndex(0);
    startNextSet(queue, 0, missing);
  }

  // -------------------------------------------------------------------------
  // Auto-run: navigate to next set, fill, submit
  // -------------------------------------------------------------------------
  function startNextSet(queue: AutoQueueItem[], idx: number, skipped: string[] = []) {
    if (idx >= queue.length) {
      const filled = queue.reduce((s, q) => s + q.rows.length, 0);
      setStatus({ type: 'done', filled, total: queue.length, skipped });
      clearAutoQueue();
      return;
    }
    const item = queue[idx];
    setStatus({ type: 'processing', setName: item.expansion, current: idx + 1, total: queue.length, skipped });
    // Navigate → page reload → resumeAutoRun picks up
    applyBulkListingFilter(item.idExpansion, item.idRarity);
  }

  async function resumeAutoRun() {
    const queue = getAutoQueue();
    const idx   = getAutoCurrentIndex();
    if (idx < 0 || idx >= queue.length) { clearAutoQueue(); return; }

    const item = queue[idx];
    setStatus({ type: 'processing', setName: item.expansion, current: idx + 1, total: queue.length });

    // Wait for DOM to settle
    await new Promise(r => setTimeout(r, 600));

    // Fill all matching rows
    const websiteRows = getWebsiteRows();
    let filled = 0;
    for (const row of item.rows) {
      const anchor = websiteRows.find(el => compareNormalized(el.textContent, row.name));
      if (!anchor) continue;
      const trEl = anchor.closest('tr') as HTMLTableRowElement | null;
      if (!trEl) continue;

      const qtyEl  = trEl.querySelector<HTMLInputElement>(quantityElSelector);
      const priceEl = trEl.querySelector<HTMLInputElement>(priceElSelector);
      const langEl  = trEl.querySelector<HTMLSelectElement>(languageElSelector);
      const condEl  = trEl.querySelector<HTMLSelectElement>(conditionElSelector);
      const firstEdEl = trEl.querySelector<HTMLInputElement>(firstEdElSelector);
      const commentsEl = trEl.querySelector<HTMLInputElement>(commentsElSelector);

      // Skip rows with no price — CM won't list at €0 anyway
      if (!row.price || row.price <= 0) continue;

      if (qtyEl)   setInputValue(qtyEl, String(row.quantity || 1));
      if (priceEl) setInputValue(priceEl, row.price.toFixed(2));
      if (langEl) {
        const lang = matchLanguage(row.language);
        setSelectValue(langEl, String(lang.data.mkmValue));
      }
      if (condEl) {
        const mkmId = CONDITION_ID_MAP[row.condition] || '2';
        setSelectValue(condEl, mkmId);
      }
      if (firstEdEl) setChecked(firstEdEl, row.isFirstEd);
      if (commentsEl && row.comments) setInputValue(commentsEl, row.comments);

      filled++;
    }

    // Mark done, advance queue
    queue[idx].done = true;
    const nextIdx = idx + 1;
    setAutoQueue(queue);
    setAutoCurrentIndex(nextIdx);

    if (nextIdx >= queue.length) {
      // Last set — show done regardless of whether we filled anything
      const totalFilled = queue.reduce((s, q) => s + (q.done ? q.rows.length : 0), 0);
      setStatus({ type: 'done', filled: totalFilled, total: queue.length });
      clearAutoQueue();
      return;
    }

    if (filled === 0) {
      // Nothing filled on this page — skip the form submit and move directly to next set
      startNextSet(queue, nextIdx);
      return;
    }

    // Submit the CM form — page will reload and resumeAutoRun fires for the next set
    await new Promise(r => setTimeout(r, 300));
    submitBulkListingForm();
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const queueSummary = getAutoQueue();
  const currentIdx   = getAutoCurrentIndex();

  return (
    <Stack gap={3}>
      {/* Sync section */}
      <div>
        <h6 style={{ fontWeight: 700, marginBottom: '.5rem' }}>Step 1 — Sync CM maps</h6>
        <p style={{ fontSize: '.85em', color: '#666', margin: '0 0 .5rem' }}>
          Reads the expansion + rarity dropdowns from this page and saves them locally.
          Enter ACE URL + token to also sync to ACE (enables smart export links).
        </p>
        <Stack gap={2}>
          <Form.Control
            size="sm"
            placeholder="ACE URL (e.g. https://ace.belfast.moe)"
            value={aceUrl}
            onChange={e => setAceUrl(e.target.value)}
          />
          <Form.Control
            size="sm"
            type="password"
            placeholder="ACE token — get it from: ace.belfast.moe/api/auth/token (must be logged in)"
            value={aceToken}
            onChange={e => setAceToken(e.target.value)}
          />
          <Button size="sm" variant="outline-primary" onClick={handleSync}
            disabled={status.type === 'syncing'}>
            {status.type === 'syncing'
              ? <><Spinner size="sm" className="me-1" />Syncing…</>
              : isSynced ? '✓ Re-sync CM Maps' : 'Sync CM Maps'}
          </Button>
        </Stack>
        {status.type === 'synced' && (
          <Alert variant="success" className="mt-2 mb-0 py-2 px-3" style={{ fontSize: '.85em' }}>
            {status.message}
          </Alert>
        )}
      </div>

      {/* Upload section */}
      <div>
        <h6 style={{ fontWeight: 700, marginBottom: '.5rem' }}>Step 2 — Upload flat CSV</h6>
        <p style={{ fontSize: '.85em', color: '#666', margin: '0 0 .5rem' }}>
          Export a flat CSV from ACE (Inventory → Export CM → Flat CSV).
          The extension will process each set automatically.
        </p>
        <Form.Control
          ref={fileRef}
          type="file"
          accept=".csv"
          size="sm"
          disabled={!isSynced || status.type === 'processing'}
          onChange={handleFileUpload}
        />
        {!isSynced && (
          <div style={{ fontSize: '.8em', color: '#dc3545', marginTop: '.25rem' }}>
            Sync CM maps first (Step 1)
          </div>
        )}
      </div>

      {/* Progress */}
      {status.type === 'processing' && (
        <div>
          <ProgressBar
            now={Math.round((status.current / status.total) * 100)}
            label={`${status.current}/${status.total}`}
            animated
          />
          <div style={{ fontSize: '.85em', marginTop: '.25rem', color: '#555' }}>
            Processing: <strong>{status.setName}</strong>
          </div>
        </div>
      )}

      {status.type === 'done' && (
        <Alert variant="success" className="mb-0">
          ✓ Previous run complete — processed {status.total} sets.
          {status.filled > 0 && <> {status.filled} card rows were submitted.</>}
          <div style={{ fontSize: '.8em', marginTop: '.25rem' }}>
            Upload a new flat CSV above to start another run.
          </div>
          {status.skipped && status.skipped.length > 0 && (
            <div style={{ fontSize: '.8em', marginTop: '.25rem', color: '#856404' }}>
              ⚠ {status.skipped.length} set(s) skipped (not on CM): {status.skipped.join(', ')}
            </div>
          )}
        </Alert>
      )}

      {status.type === 'error' && (
        <Alert variant="danger" className="mb-0" style={{ fontSize: '.85em' }}>
          {status.message}
        </Alert>
      )}

      {/* Pending queue summary */}
      {queueSummary.length > 0 && currentIdx >= 0 && currentIdx < queueSummary.length && (
        <div style={{ fontSize: '.8em', color: '#888' }}>
          Queue: {queueSummary.map((q, i) => (
            <span key={i} style={{
              marginRight: 4,
              color: q.done ? '#28a745' : i === currentIdx ? '#007bff' : '#888'
            }}>
              {q.done ? '✓' : i === currentIdx ? '▶' : '○'} {q.expansion}
            </span>
          ))}
        </div>
      )}

      <Button size="sm" onClick={onClose}
        style={{ color: '#fff', background: '#6c757d', border: '1px solid #6c757d', width: '100%' }}>
        Close
      </Button>
    </Stack>
  );
}
