import { i18n, useState } from '#imports';

import { Alert, Button, Image, Modal } from 'react-bootstrap';
import { createPortal } from 'react-dom';

import ImportCsvForm from './components/ImportCsvForm';
import SelectRowsForm from './components/SelectRowsForm';
import SuccessAlert from './components/SuccessAlert';
import type { ParsedRow } from './game-manager';
import PokemonGameManager from './game-manager/managers/pokemon';
import useGameManager from './game-manager/useGameManager';
import IconTransparent from '../../assets/icon-transparent.png';

const header = document.body.querySelector('header');

function App() {
  const [show, setShow] = useState(false);
  const [importedRows, setImportedRows] = useState<ParsedRow[] | null>(null);
  const [filledCount, setFilledCount] = useState<number | null>(null);
  const gameManager = useGameManager();
  const [fillError, setFillError] = useState<string | null>(null);

  let content = (<ImportCsvForm onSubmit={(res) => setImportedRows(res)} />);
  if (importedRows !== null) content = (
    <SelectRowsForm
      rows={importedRows}
      onSubmit={(rows) => gameManager.fillPage(rows).then((filled) => {
        setFillError(null);
        setShow(false);
        setFilledCount(filled);
      }).catch((error: unknown) => {
        setFillError(error instanceof Error ? error.message : String(error));
      })}
    />
  );

  return (
    <>
      <Button
        className="w-100 mt-1"
        onClick={() => {
          setFillError(null);
          setImportedRows(null);
          setShow(true);
        }}
      >
        <Image src={IconTransparent} height={18} />
        <span>{ i18n.t('injectedButton.button') }</span>
      </Button>
      {gameManager instanceof PokemonGameManager && (
        <Button
          className="w-100 mt-1"
          variant="outline-primary"
          onClick={() => {
            const blob = new Blob([gameManager.extractCsv()], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `pokemon-page-${Date.now()}.csv`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 10000);
          }}
        >
          {i18n.t('injectedButton.extractCsv')}
        </Button>
      )}
      <Modal
        size={importedRows !== null ? 'xl' : 'sm'}
        show={show}
        onHide={() => setShow(false)}
        dialogClassName="mt-0 mb-0 vh-100"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{ i18n.t('injectedButton.modal.title') }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {fillError && (
            <Alert variant="danger">
              {i18n.t('injectedButton.modal.fillError')}
              {' '}
              {fillError}
            </Alert>
          )}
          { content }
        </Modal.Body>
      </Modal>
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
