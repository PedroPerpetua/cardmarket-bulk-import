import { i18n, useEffect, useRef, useState } from '#imports';

import { Button, Image, Modal } from 'react-bootstrap';
import { createPortal } from 'react-dom';

import AutoFillOverlay from './components/AutoFillOverlay';
import EditionDashboard from './components/EditionDashboard';
import ImportCsvForm from './components/ImportCsvForm';
import type { ImportCsvFormResult } from './components/ImportCsvForm';
import SelectRowsForm from './components/SelectRowsForm';
import SuccessAlert from './components/SuccessAlert';
import type { ParsedRow } from './game-manager';
import useGameManager from './game-manager/useGameManager';
import {
  getCurrentSiteParam,
  getNextPageHref,
  submitBulkForm,
  waitForSubmitComplete,
} from './game-manager/utils/html';
import IconTransparent from '../../assets/icon-transparent.png';
import { autoFillSession, storedCsvImport } from '../../utils/storage';
import type { AutoFillSession } from '../../utils/storage';

const MAX_AUTO_FILL = 100;
const TABLE_READY_TIMEOUT_MS = 10000;
const TABLE_POLL_INTERVAL_MS = 100;

type ModalStep = 'import' | 'dashboard' | 'select';

function isTableAlreadyFilled() {
  const firstQuantityEl = document.querySelector<HTMLInputElement>('td input[name^="amount"]');
  if (!firstQuantityEl) return false;
  return !!firstQuantityEl.value && firstQuantityEl.value !== '0';
}

async function waitForTableReady(timeoutMs = TABLE_READY_TIMEOUT_MS): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const firstRow = document.querySelector('td input[name^="amount"]');
    const firstName = document.querySelector('td div.col-product.text-start a');
    if (firstRow && firstName) return true;
    await new Promise((r) => setTimeout(r, TABLE_POLL_INTERVAL_MS));
  }
  return false;
}

function redirectToEnLocaleIfNeeded(): boolean {
  const parts = window.location.pathname.split('/');
  if (parts.length < 2 || !parts[1] || parts[1] === 'en') return false;
  parts[1] = 'en';
  const newUrl = parts.join('/') + window.location.search + window.location.hash;
  window.location.replace(newUrl);
  return true;
}

const header = document.body.querySelector('header');

function App() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<ModalStep>('import');
  const [importedRows, setImportedRows] = useState<ParsedRow[] | null>(null);
  const [filledCount, setFilledCount] = useState<number | null>(null);
  const [activeSession, setActiveSession] = useState<AutoFillSession | null>(null);
  const gameManager = useGameManager();
  const autofillAttemptedRef = useRef(false);

  useEffect(() => {
    if (autofillAttemptedRef.current) return;
    autofillAttemptedRef.current = true;

    void (async () => {
      const stored = await storedCsvImport.getValue();

      if (stored?.game !== gameManager.gameId) {
        setStep('import');
        setShow(true);
        return;
      }

      const editionId = Number(new URLSearchParams(window.location.search).get('idExpansion')) || 0;
      if (!editionId) return;

      if (redirectToEnLocaleIfNeeded()) return;

      const ready = await waitForTableReady();
      if (!ready) {
        console.warn('[cardmarket-bulk-import] Cardmarket table never appeared, skipping autofill.');
        return;
      }

      if (isTableAlreadyFilled()) return;

      let session = await autoFillSession.getValue();
      if (session?.editionId !== editionId) {
        session = {
          editionId,
          totalFilled: 0,
          startedAt: Date.now(),
          stopped: false,
        };
        await autoFillSession.setValue(session);
      }
      if (session.stopped) {
        await autoFillSession.setValue(null);
        return;
      }
      if (session.totalFilled >= MAX_AUTO_FILL) {
        await autoFillSession.setValue(null);
        return;
      }

      setActiveSession(session);

      try {
        const rows = await gameManager.parseCsv(stored.csvText, stored.columnMapping);
        const remaining = MAX_AUTO_FILL - session.totalFilled;
        const toFill = rows
          .filter((r) => r.enabled)
          .filter((r) => {
            const cmId = (r as ParsedRow & { cardmarketId?: number | null }).cardmarketId;
            return cmId === undefined || cmId === editionId;
          })
          .slice(0, remaining);

        let count = 0;
        if (toFill.length > 0) {
          count = await gameManager.fillPage(toFill);
        }

        const newTotal = session.totalFilled + count;
        const updatedSession: AutoFillSession = { ...session, totalFilled: newTotal };
        await autoFillSession.setValue(updatedSession);
        setActiveSession(updatedSession);

        if (count > 0) {
          const submitted = submitBulkForm();
          if (!submitted) {
            console.warn('[cardmarket-bulk-import] Submit button not found, stopping auto-flow.');
            await autoFillSession.setValue(null);
            setActiveSession(null);
            setFilledCount(count);
            return;
          }
          await waitForSubmitComplete();
        }

        const fresh = await autoFillSession.getValue();
        if (!fresh || fresh.stopped) {
          await autoFillSession.setValue(null);
          setActiveSession(null);
          setFilledCount(newTotal);
          return;
        }

        const nextHref = getNextPageHref();
        const underCap = newTotal < MAX_AUTO_FILL;

        if (nextHref && underCap) {
          window.location.href = nextHref;
          return;
        }

        await autoFillSession.setValue(null);
        setActiveSession(null);
        setFilledCount(newTotal);
      }
      catch (e) {
        console.error('[cardmarket-bulk-import] Auto-fill flow failed.', e);
        await autoFillSession.setValue(null);
        setActiveSession(null);
      }
    })();
  }, [gameManager]);

  const handleStopAutoFill = async () => {
    const session = await autoFillSession.getValue();
    if (session) await autoFillSession.setValue({ ...session, stopped: true });
    setActiveSession(null);
  };

  const handleImportSubmit = async (data: ImportCsvFormResult) => {
    try {
      await storedCsvImport.setValue({
        game: gameManager.gameId,
        csvText: data.csvText,
        fileName: data.fileName,
        columnMapping: data.columnMapping,
        importedAt: Date.now(),
      });
      await autoFillSession.setValue(null);
    }
    catch (e) {
      console.error('[cardmarket-bulk-import] Failed to persist imported CSV.', e);
    }
    setImportedRows(data.rows);
    setStep(gameManager.gameId === 'mtg' ? 'dashboard' : 'select');
  };

  const handleManualSelect = () => setStep('select');

  const handleFillPage = async (rows: ParsedRow[]) => {
    const count = await gameManager.fillPage(rows);
    setShow(false);
    setFilledCount(count);
  };

  let content = null;
  if (step === 'import') {
    content = (<ImportCsvForm onSubmit={handleImportSubmit} />);
  }
  else if (step === 'dashboard' && importedRows !== null) {
    content = (
      <EditionDashboard
        rows={importedRows}
        onManualSelect={handleManualSelect}
        onFillThisPage={handleFillPage}
      />
    );
  }
  else if (step === 'select' && importedRows !== null) {
    content = (
      <SelectRowsForm
        rows={importedRows}
        onSubmit={handleFillPage}
      />
    );
  }

  const modalSize = step === 'import' ? 'sm' : 'xl';

  return (
    <>
      <Button
        className="w-100 mt-1"
        onClick={() => {
          setImportedRows(null);
          setStep('import');
          setShow(true);
        }}
      >
        <Image src={IconTransparent} height={18} />
        <span>{ i18n.t('injectedButton.button') }</span>
      </Button>
      <Modal
        size={modalSize}
        show={show}
        onHide={() => setShow(false)}
        dialogClassName="mt-0 mb-0 vh-100"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{ i18n.t('injectedButton.modal.title') }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { content }
        </Modal.Body>
      </Modal>
      {
        activeSession && createPortal(
          <AutoFillOverlay
            currentPage={getCurrentSiteParam()}
            totalFilled={activeSession.totalFilled}
            maxTotal={MAX_AUTO_FILL}
            onStop={handleStopAutoFill}
          />,
          document.body,
        )
      }
      {
        createPortal(
          <SuccessAlert count={filledCount} onDismiss={() => setFilledCount(null)} />,
          header!,
        )
      }
    </>
  );
}

export default App;
