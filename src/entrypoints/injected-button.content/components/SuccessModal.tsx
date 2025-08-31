import { i18n } from '#imports';
import { useEffect, useState } from 'react';

import { Button, Modal, Pagination, Table } from 'react-bootstrap';

import { paginateArray } from './utils';
import type { Result } from './utils';

type SuccessModalProps = {
  results: Result[] | null,
};

const ROWS_PER = 10;

function SuccessModal({ results }: SuccessModalProps) {
  const [show, setShow] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (results === null) return;
    setPage(1);
    setShow(true);
  }, [results]);

  const { totalPages, indexArr, getPageLimits, getPage } = paginateArray(results ?? [], ROWS_PER);
  const [start] = getPageLimits(page);
  const rows = getPage(page);

  const setPageClamped = (newPage: number) => {
    setPage(Math.min(Math.max(1, newPage), totalPages));
  };

  return (
    <Modal show={show} onHide={() => setShow(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{ i18n.t('injected-button.success.title') }</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        { i18n.t('injected-button.success.body', results?.length ?? 0) }
        <hr />
        <Table striped bordered size="sm">
          <thead>
            <tr>
              <th className="col-md-1">{ i18n.t('injected-button.success.table.numberColumn') }</th>
              <th className="col-md-8">{ i18n.t('injected-button.success.table.nameColumn') }</th>
              <th className="col-md-1">{ i18n.t('injected-button.success.table.quantityColumn') }</th>
              <th className="col-md-1">{ i18n.t('injected-button.success.table.foilColumn') }</th>
              <th className="col-md-1">{ i18n.t('injected-button.success.table.priceColumn') }</th>
            </tr>
          </thead>
          <tbody>
            {
              rows.map((res, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={start + i}>
                  <td>{ start + i + 1 }</td>
                  <td>{ res.name }</td>
                  <td>{ res.quantity }</td>
                  <td>{ res.isFoil ? 'Yes' : 'No' }</td>
                  <td>{ `${res.price.toFixed(2)}€` }</td>
                </tr>
              ))
            }
            {
              // Fill the remaining rows with empty values
              Array.from({ length: ROWS_PER - rows.length }).map((_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={start + i}>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              ))
            }
          </tbody>
        </Table>
        {
          indexArr.length > 1 && (
            <Pagination>
              {
                indexArr.map((pNumber) => (
                  <Pagination.Item
                    key={pNumber}
                    onClick={() => setPageClamped(pNumber)}
                    active={pNumber === page}
                  >
                    { pNumber }
                  </Pagination.Item>
                ))
              }
            </Pagination>
          )
        }
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => setShow(false)}>{ i18n.t('injected-button.success.close') }</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SuccessModal;
