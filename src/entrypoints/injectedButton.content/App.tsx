import { i18n, useState } from '#imports';

import { Button, Image, Modal } from 'react-bootstrap';
import { createPortal } from 'react-dom';

import ImportCsvForm from './components/ImportCsvForm';
import SelectRowsForm from './components/SelectRowsForm';
import SuccessAlert from './components/SuccessAlert';
import type { ParsedRow } from './game-manager';
import useGameManager from './game-manager/useGameManager';
import IconTransparent from '../../assets/icon-transparent.png';

const header = document.body.querySelector('header');

function App() {
  const [show, setShow] = useState(false);
  const [importedRows, setImportedRows] = useState<ParsedRow[] | null>(null);
  const [filledCount, setFilledCount] = useState<number | null>(null);
  const gameManager = useGameManager();

  let content = (<ImportCsvForm onSubmit={(res) => setImportedRows(res)} />);
  if (importedRows !== null) content = (
    <SelectRowsForm
      rows={importedRows}
      onSubmit={(rows) => gameManager.fillPage(rows).then((filled) => {
        setShow(false);
        setFilledCount(filled);
      })}
    />
  );

  return (
    <>
      <Button
        className="w-100 mt-1"
        onClick={() => {
          setImportedRows(null);
          setShow(true);
        }}
      >
        <Image src={IconTransparent} height={18} />
        <span>{ i18n.t('injectedButton.button') }</span>
      </Button>
      <Modal
        size={importedRows !== null ? 'xl' : 'sm'}
        show={show}
        onHide={() => setShow(false)}
        dialogClassName="cardmarket-bulk-import-dialog"
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
        createPortal(
          <SuccessAlert count={filledCount} onDismiss={() => setFilledCount(null)} />,
          header!,
        )
      }
    </>
  );
}

export default App;
