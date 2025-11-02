import { useState, i18n } from '#imports';

import { Button, Modal, Image } from 'react-bootstrap';
import { createPortal } from 'react-dom';

import ImportCSVForm from './components/ImportCsvForm';
import SelectRowsForm from './components/SelectRowsForm';
import SuccessToast from './components/SuccessToast';
import { fillPage } from './utils/parse';
import type { ParsedRow } from './utils/parse';
import IconTransparent from '../../assets/icon-transparent.png';

function App() {
  const [show, setShow] = useState(false);
  const [importedRows, setImportedRows] = useState<ParsedRow[] | null>(null);
  const [filledCount, setFilledCount] = useState<number | null>(null);

  let content = (<ImportCSVForm onSubmit={(res) => setImportedRows(res)} />);
  if (importedRows !== null) content = (
    <SelectRowsForm
      rows={importedRows}
      onSubmit={(rows) => {
        const filled = fillPage(rows);
        setShow(false);
        setFilledCount(filled);
      }}
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
      <Modal size={importedRows !== null ? 'lg' : 'sm'} show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{ i18n.t('injectedButton.modal.title') }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { content }
        </Modal.Body>
      </Modal>
      {
        createPortal(
          <SuccessToast count={filledCount} onDismiss={() => setFilledCount(null)} />,
          document.body.querySelector('header')!,
        )
      }
    </>
  );
}

export default App;
