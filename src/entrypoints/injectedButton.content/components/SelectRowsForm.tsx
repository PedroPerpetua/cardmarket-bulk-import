import { i18n } from '#imports';
import { useEffect, useMemo, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form, Pagination, Stack, Table } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { splitIntoBatches, setInArray } from '../../../utils';
import usePaginatedArray from '../../../utils/usePaginatedArray';
import type { ParsedRow } from '../parse';

type SelectedRowsFormValues = {
  selectedRows: number[],
};

const validationSchema: yup.ObjectSchema<SelectedRowsFormValues> = yup.object().shape({
  selectedRows: yup.array().of(yup.number().required())
    .min(1, i18n.t('injectedButton.modal.selectRowsForm.min'))
    .max(100, i18n.t('injectedButton.modal.selectRowsForm.max'))
    .required(),
});

type SelectRowsFormProps = {
  rows: ParsedRow[],
  onSubmit: (rows: ParsedRow[]) => void,
};

function SelectRowsForm({ rows, onSubmit }: SelectRowsFormProps) {
  const [showDisabled, setShowDisabled] = useState(false);
  const enabledRows = useMemo(() => rows.filter((r) => r.enabled), [rows]);
  const filteredRows = useMemo(
    () => showDisabled ? rows : enabledRows,
    [enabledRows, rows, showDisabled],
  );

  const { pageNumber, currentPage, setPage, emptyArr, indexArr } = usePaginatedArray(filteredRows);

  // Ensure that if we toggle the disabled, we're in a valid page
  useEffect(() => {
    setPage(pageNumber);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDisabled]);

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors: formErrors },
    setValue,
  } = useForm<SelectedRowsFormValues>({
    resolver: yupResolver(validationSchema),
    // Select the first 100
    defaultValues: { selectedRows: enabledRows.slice(0, 100).map((r) => r.id) },
  });
  const submitFn = (data: SelectedRowsFormValues) => {
    onSubmit(rows.filter((r) => data.selectedRows.includes(r.id)));
  };

  const selectedCount = watch('selectedRows').length;

  return (
    <Form noValidate onSubmit={handleSubmit(submitFn)}>
      <Stack gap={3}>
        <Stack
          direction="horizontal"
          className="align-items-center justify-content-between flex-grow mb-1"
        >
          <Stack direction="horizontal" gap={2}>
            <h5>
              {
                selectedCount.toString()
                + i18n.t('injectedButton.modal.selectRowsForm.count_a')
                + enabledRows.length.toString()
                + i18n.t('injectedButton.modal.selectRowsForm.count_b')
                + rows.length.toString()
                + i18n.t('injectedButton.modal.selectRowsForm.count_c')
              }
            </h5>
            {
              splitIntoBatches(enabledRows.length).map(([start, end]) => (
                <Button
                  key={`${start}-${end}`}
                  onClick={() => setValue(
                    'selectedRows',
                    enabledRows.slice(start - 1, end).map((r) => r.id),
                  )}
                  size="sm"
                >
                  { `${start}...${end}` }
                </Button>
              ))
            }
          </Stack>
          <Form.Switch
            value={showDisabled ? 'checked' : 'unchecked'}
            onChange={(e) => setShowDisabled(e.target.checked)}
            label={i18n.t('injectedButton.modal.selectRowsForm.showDisabled')}
            reverse
            style={{ transform: 'scale(1.15)', transformOrigin: 'right center 0px' }}
          />
        </Stack>
        <Table striped bordered className="mb-0">
          <thead>
            <tr>
              <th className="col-md-1">
                { i18n.t('injectedButton.modal.selectRowsForm.table.checkColumn') }
              </th>
              <th className="col-md-7">
                { i18n.t('injectedButton.modal.selectRowsForm.table.nameColumn') }
              </th>
              <th className="col-md-1">
                { i18n.t('injectedButton.modal.selectRowsForm.table.setColumn') }
              </th>
              <th className="col-md-1">
                { i18n.t('injectedButton.modal.selectRowsForm.table.quantityColumn') }
              </th>
              <th className="col-md-1">
                { i18n.t('injectedButton.modal.selectRowsForm.table.foilColumn') }
              </th>
              <th className="col-md-1">
                { i18n.t('injectedButton.modal.selectRowsForm.table.priceColumn') }
              </th>
            </tr>
          </thead>
          <tbody>
            {
              currentPage.map((r) => (
                <tr
                  key={r.id}
                  style={{ ...(!r.enabled && { opacity: 0.5, pointerEvents: 'none' }) }}
                >
                  <td>
                    <Controller
                      control={control}
                      name="selectedRows"
                      render={({ field }) => (
                        <Form.Check
                          checked={field.value.includes(r.id)}
                          onChange={(e) => field.onChange(
                            setInArray(field.value, r.id, e.target.checked),
                          )}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  </td>
                  <td>{ r.name }</td>
                  <td>{ r.set }</td>
                  <td>{ r.quantity }</td>
                  <td>
                    <span
                      className={
                        r.isFoil
                          ? 'fonticon-check-circle text-success'
                          : 'fonticon-cross-circle text-danger'
                      }
                    />
                  </td>
                  <td>{ `${r.price.toFixed(2)}€` }</td>
                </tr>
              ))
            }
            {
              emptyArr.map((i) => (
                <tr key={i} style={{ opacity: 0.8 }}>
                  <td>&nbsp;</td>
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
          formErrors.selectedRows && (
            <>
              { /* Bootstrap invalid-feedback requires an .is-invalid sibling */ }
              <div className="is-invalid d-none" />
              <div className="invalid-feedback mt-0 fs-6">
                { formErrors.selectedRows?.message }
              </div>
            </>
          )
        }
        <Stack
          direction="horizontal"
          className="align-items-center justify-content-between flex-grow"
        >
          {
            indexArr.length > 1
              ? (
                  <Pagination className="m-0">
                    {
                      indexArr.map((pNumber) => (
                        <Pagination.Item
                          key={pNumber}
                          onClick={() => setPage(pNumber)}
                          active={pNumber === pageNumber}
                        >
                          { pNumber }
                        </Pagination.Item>
                      ))
                    }
                  </Pagination>
                )
              : <div /> // Empty div for the stack's justify content
          }
          <Button type="submit">
            { i18n.t('injectedButton.modal.selectRowsForm.submit') }
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
}

export default SelectRowsForm;
