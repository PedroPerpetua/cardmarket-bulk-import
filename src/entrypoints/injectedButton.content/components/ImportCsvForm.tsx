import { i18n } from '#imports';
import { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form, Spinner, Stack } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import ColumnSelect from './ColumnSelect';
import { getCsvColumns } from '../utils/csv';
import { parseCsv } from '../utils/parse';
import type { ParsedRow } from '../utils/parse';
import useAsyncFn from '../utils/useAsyncFn';

export type ImportCsvFormValues = {
  files: FileList,
  nameColumn: string,
  quantityColumn?: string,
  foilColumn?: string,
  priceColumn?: string,
};

const validationSchema: yup.ObjectSchema<ImportCsvFormValues> = yup.object({
  files: yup.mixed<FileList>()
    .required(i18n.t('injectedButton.modal.importCsvForm.files.required')),
  nameColumn: yup.string()
    .required(i18n.t('injectedButton.modal.importCsvForm.nameColumn.required')),
  quantityColumn: yup.string(),
  foilColumn: yup.string(),
  priceColumn: yup.string(),
});

type ImportCsvFormProps = {
  onSubmit: (data: ParsedRow[]) => void,
};

function ImportCsvForm({ onSubmit }: ImportCsvFormProps) {
  const [{ value: columns, loading, error }, getColumns] = useAsyncFn(getCsvColumns);
  const { control, register, handleSubmit, watch, setError } = useForm<ImportCsvFormValues>({
    resolver: yupResolver(validationSchema),
  });

  const submitFn = async (data: ImportCsvFormValues) => {
    try {
      const res = await parseCsv(data.files[0], {
        name: data.nameColumn,
        quantity: data.quantityColumn,
        isFoil: data.foilColumn,
        price: data.priceColumn,
      });
      onSubmit(res);
    }
    catch (e) {
      if (!(e instanceof Error)) setError('root', { message: 'Unknown error.' });
      else setError('root', e);
    }
  };

  const files = watch('files');
  useEffect(() => {
    const f = files?.item(0);
    if (f) getColumns(f);
  }, [files, getColumns]);

  useEffect(() => {
    if (error) console.error('[cardmarket-bulk-import] Failed to parse Csv file.', error);
  }, [error]);

  let columnsEl = null;
  if (loading) columnsEl = (<Spinner />);
  else if (error) columnsEl = (<h5>Invalid file</h5>);
  else if (columns) columnsEl = (
    <>
      <ColumnSelect<ImportCsvFormValues>
        control={control}
        formId="importCsvForm.nameColumn"
        name="nameColumn"
        label={i18n.t('injectedButton.modal.importCsvForm.nameColumn.label')}
        options={columns}
      />
      <ColumnSelect<ImportCsvFormValues>
        control={control}
        formId="importCsvForm.quantityColumn"
        name="quantityColumn"
        label={i18n.t('injectedButton.modal.importCsvForm.quantityColumn.label')}
        options={columns}
      />
      <ColumnSelect<ImportCsvFormValues>
        control={control}
        formId="importCsvForm.foilColumn"
        name="foilColumn"
        label={i18n.t('injectedButton.modal.importCsvForm.foilColumn.label')}
        options={columns}
      />
      <ColumnSelect<ImportCsvFormValues>
        control={control}
        formId="importCsvForm.priceColumn"
        name="priceColumn"
        label={i18n.t('injectedButton.modal.importCsvForm.priceColumn.label')}
        options={columns}
      />
      <Button type="submit" className="mx-auto">
        { i18n.t('injectedButton.modal.importCsvForm.submit') }
      </Button>
    </>
  );

  return (
    <Form noValidate onSubmit={handleSubmit(submitFn)}>
      <Stack gap={2}>
        <Form.Group controlId="importCsvForm.Files">
          <Form.Label>{ i18n.t('injectedButton.modal.importCsvForm.files.label') }</Form.Label>
          <Form.Control
            type="file"
            accept=".csv"
            {...register('files')}
          />
        </Form.Group>
        { columnsEl }
      </Stack>
    </Form>
  );
}

export default ImportCsvForm;
