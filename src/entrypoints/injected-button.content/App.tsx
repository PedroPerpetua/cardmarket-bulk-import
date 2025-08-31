import { useState, i18n } from '#imports';

import { Button, Modal, Image } from 'react-bootstrap';

import ImportCSVForm from './components/ImportCSVForm';
import type { ImportCSVFormValues } from './components/ImportCSVForm';
import SuccessModal from './components/SuccessModal';
import { fillPage } from './components/utils';
import type { Result } from './components/utils';
import Icon from '../../assets/icon.png';

function App() {
  const [show, setShow] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);

  const onSubmit = (data: ImportCSVFormValues) => {
    fillPage(
      data.files.item(0)!,
      {
        name: data.nameColumn,
        foil: data.foilColumn ?? '',
        price: data.priceColumn ?? '',
        quantity: data.quantityColumn ?? '',
      },
      data.batch,
    ).then((res) => {
      setResults(res);
      setShow(false);
    });
  };

  return (
    <>
      <Button className="w-100 mt-1" onClick={() => setShow(true)}>
        <Image src={Icon} height={18} />
        <span>{ i18n.t('injected-button.button') }</span>
      </Button>
      <Modal size="sm" show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{ i18n.t('injected-button.modal.title') }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ImportCSVForm onSubmit={onSubmit} />
        </Modal.Body>
      </Modal>
      <SuccessModal results={results} />
    </>
  );
}

export default App;
