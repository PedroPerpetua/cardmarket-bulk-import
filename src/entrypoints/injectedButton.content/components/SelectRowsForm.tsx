import { i18n } from '#imports';
import { useEffect, useMemo, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { Button, Form, OverlayTrigger, Pagination, Stack, Table, Tooltip } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { splitIntoBatches, setInArray } from '../../../utils';
import usePaginatedArray from '../../../utils/usePaginatedArray';
import type { ParsedRow } from '../game-manager';
import useGameManager from '../game-manager/useGameManager';

type SelectedRowsFormValues = {
  selectedRows: number[],
};

const validationSchema: yup.ObjectSchema<SelectedRowsFormValues> = yup.object({
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
  const gameManager = useGameManager();
  const [showDisabled, setShowDisabled] = useState(false);
  const enabledRows = useMemo(() => rows.filter((r) => r.enabled), [rows]);

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
  const submitFn = handleSubmit(
    (data) => onSubmit(rows.filter((r) => data.selectedRows.includes(r.id))),
  );

  const selected = watch('selectedRows');

  const filteredRows = useMemo(
    () => {
      if (showDisabled) return rows;
      return rows.filter((r) => r.enabled || selected.includes(r.id));
    }, [rows, selected, showDisabled],
  );

  const {
    pageNumber,
    currentPage,
    setPage,
    emptyArr,
    indexArr,
  } = usePaginatedArray(filteredRows, { maxPages: 15 });

  // Ensure that if we toggle the disabled, we're in a valid page
  useEffect(() => {
    setPage(pageNumber);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDisabled]);

  return (
    <Form noValidate onSubmit={submitFn}>
      <Stack gap={3}>
        <Stack
          direction="horizontal"
          className="align-items-center justify-content-between flex-grow mb-1"
        >
          <Stack direction="horizontal" gap={2}>
            <h5>
              {
                selected.length.toString()
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
                { i18n.t('injectedButton.gameManagers.common.selectRowsFormTable.check') }
              </th>
              <th className="col">
                { i18n.t('injectedButton.gameManagers.common.selectRowsFormTable.name') }
              </th>
              <th className="col-md-1">
                { i18n.t('injectedButton.gameManagers.common.selectRowsFormTable.language') }
              </th>
              {
                Object.entries(gameManager.extraTableColumns).map(([key, value]) => {
                  if (!value) return null;
                  if (typeof value === 'string') return (
                    <th key={key} className="col-md-1">
                      { i18n.t(value) }
                    </th>
                  );
                  return (
                    <th key={key} className={`col-md-${value.size}`}>
                      { i18n.t(value.label) }
                    </th>
                  );
                })
              }
              <th className="col-md-1">
                { i18n.t('injectedButton.gameManagers.common.selectRowsFormTable.quantity') }
              </th>
              <th className="col-md-1">
                { i18n.t('injectedButton.gameManagers.common.selectRowsFormTable.price') }
              </th>
            </tr>
          </thead>
          <tbody>
            {
              currentPage.map((r) => (
                <tr
                  key={r.id}
                  className={clsx({
                    'pe-none': !r.matchedName,
                    'opacity-25': !r.matchedName,
                    'opacity-50': r.matchedName && !r.enabled,
                  })}
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
                  <td className={clsx({ 'p-0 lh-1': r.matchedName && r.matchedName !== r.name })}>
                    <OverlayTrigger
                      overlay={(
                        <Tooltip>
                          { i18n.t('injectedButton.modal.selectRowsForm.nameMatchedWarning') }
                        </Tooltip>
                      )}
                      trigger={r.enabled ? [] : undefined}
                      placement="left"
                    >
                      <span className={clsx(!!r.matchedName && !r.enabled && 'text-warning')}>
                        { r.name }
                      </span>
                    </OverlayTrigger>
                    {
                      r.matchedName && r.matchedName !== r.name && (
                        <>
                          <br />
                          <OverlayTrigger
                            overlay={(
                              <Tooltip>
                                { i18n.t('injectedButton.modal.selectRowsForm.nameMatchedTooltip') }
                              </Tooltip>
                            )}
                            placement="left"
                          >
                            <span className="text-light" style={{ fontSize: '0.75rem' }}>
                              { r.matchedName }
                            </span>
                          </OverlayTrigger>
                        </>
                      )
                    }
                  </td>
                  <td>
                    <OverlayTrigger
                      overlay={(
                        <Tooltip>{ r.language.data.mkmLabels[0] }</Tooltip>
                      )}
                    >
                      <div className={clsx(!r.language.matched && 'opacity-25', 'w-50 mx-auto')}>
                        { r.language.data.flagElement }
                      </div>
                    </OverlayTrigger>
                  </td>
                  {
                    Object.entries(gameManager.extraTableColumns)
                      .filter(([, v]) => !!v)
                      .map(([k]) => {
                        const value = r[k];
                        if (typeof value === 'boolean') return (
                          <td key={k}>
                            <span
                              className={
                                value
                                  ? 'fonticon-check-circle text-success'
                                  : 'fonticon-cross-circle text-danger'
                              }
                            />
                          </td>
                        );
                        return (<td key={k}>{ String(value) }</td>);
                      })
                  }
                  <td>{ r.quantity }</td>
                  <td>{ `${r.price.toFixed(2)}€` }</td>
                </tr>
              ))
            }
            {
              emptyArr.map((i) => (
                <tr key={i} className="opacity-25 pe-none">
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  {
                    Object.entries(gameManager.extraTableColumns)
                      .filter(([, v]) => !!v)
                      .map(([k]) => (
                        <td key={k}>&nbsp;</td>
                      ))
                  }
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
                      indexArr.map((pNumber) => typeof pNumber === 'number'
                        ? (
                            <Pagination.Item
                              key={pNumber}
                              onClick={() => setPage(pNumber)}
                              active={pNumber === pageNumber}
                            >
                              { pNumber }
                            </Pagination.Item>
                          )
                        : (
                            <Pagination.Ellipsis key={pNumber} disabled />
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
