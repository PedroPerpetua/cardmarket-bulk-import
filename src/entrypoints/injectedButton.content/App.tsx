import { useState, useEffect, i18n } from '#imports';

import { Button, Modal, Image, Stack } from 'react-bootstrap';
import { createPortal } from 'react-dom';

import AutoModeForm from './components/AutoModeForm';
import ImportCsvForm from './components/ImportCsvForm';
import SelectRowsForm from './components/SelectRowsForm';
import SuccessAlert from './components/SuccessAlert';
import type { ParsedRow } from './game-manager';
import useGameManager from './game-manager/useGameManager';
import IconTransparent from '../../assets/icon-transparent.png';
import { isAutoModeActive } from '../../utils/cmMapping';

type AppMode = 'import' | 'auto';

function App() {
  const [show, setShow]               = useState(false);
  const [mode, setMode]               = useState<AppMode>('import');
  const [importedRows, setImportedRows] = useState<ParsedRow[] | null>(null);
  const [filledCount, setFilledCount]   = useState<number | null>(null);
  const gameManager = useGameManager();

  // After a page reload triggered by applyBulkListingFilter, auto-reopen the
  // Auto Import modal so resumeAutoRun() fires inside AutoModeForm.
  useEffect(() => {
    if (isAutoModeActive()) {
      setMode('auto');
      setShow(true);
    }
  }, []);

  function openImport() {
    setMode('import');
    setImportedRows(null);
    setShow(true);
  }

  function openAuto() {
    setMode('auto');
    setShow(true);
  }

  let content: React.ReactNode;
  if (mode === 'auto') {
    content = <AutoModeForm onClose={() => setShow(false)} />;
  } else if (importedRows !== null) {
    content = (
      <SelectRowsForm
        rows={importedRows}
        onSubmit={(rows) => {
          gameManager.fillPage(rows).then((filled) => {
            setShow(false);
            setFilledCount(filled);
          });
        }}
      />
    );
  } else {
    content = <ImportCsvForm onSubmit={(res) => setImportedRows(res)} />;
  }

  const modalSize = (mode === 'import' && importedRows !== null) || mode === 'auto' ? 'lg' : 'sm';

  return (
    <>
      {/* Two buttons: Import CSV (original) + Auto (new) */}
      <Stack direction="horizontal" gap={1} className="mt-1">
        <Button className="flex-grow-1" onClick={openImport}>
          <Image src={IconTransparent} height={18} />
          <span>{ i18n.t('injectedButton.button') }</span>
        </Button>
        <Button variant="outline-primary" style={{ whiteSpace: 'nowrap', fontSize: '.8em', padding: '6px 10px' }}
          onClick={openAuto} title="Auto-mode: process all sets from a flat CSV">
          ⚡ Auto
        </Button>
      </Stack>

      <Modal size={modalSize} show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            { mode === 'auto' ? '⚡ Auto Import' : i18n.t('injectedButton.modal.title') }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { content }
        </Modal.Body>
      </Modal>

      {
        createPortal(
          <SuccessAlert count={filledCount} onDismiss={() => setFilledCount(null)} />,
          document.body.querySelector('header')!,
        )
      }
    </>
  );
}

export default App;
