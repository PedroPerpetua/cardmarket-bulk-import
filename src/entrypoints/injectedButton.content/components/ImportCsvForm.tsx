import { i18n } from '#imports';
import { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form, Spinner, Stack } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import ColumnSelect from './ColumnSelect';
import { getCsvColumns } from '../../../utils/csv';
import useAsyncFn from '../../../utils/useAsyncFn';
import { parseCsv } from '../parse';
import type { ParsedRow } from '../parse';

export type ImportCsvFormValues = {
  files: FileList,
  nameColumn: string,
  setColumn?: string,
  quantityColumn?: string,
  foilColumn?: string,
  priceColumn?: string,
};

const validationSchema: yup.ObjectSchema<ImportCsvFormValues> = yup.object({
  files: yup.mixed<FileList>()
    .required(i18n.t('injectedButton.modal.importCsvForm.files.required')),
  nameColumn: yup.string()
    .required(i18n.t('injectedButton.modal.importCsvForm.nameColumn.required')),
  setColumn: yup.string(),
  quantityColumn: yup.string(),
  foilColumn: yup.string(),
  priceColumn: yup.string(),
});

type ImportCsvFormProps = {
  onSubmit: (data: ParsedRow[]) => void,
};

function ImportCsvForm({ onSubmit }: ImportCsvFormProps) {
  const [{ value: columns, loading, error }, getColumns] = useAsyncFn(getCsvColumns);
  const {
    control,
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors: formErrors, touchedFields },
  } = useForm<ImportCsvFormValues>({
    resolver: yupResolver(validationSchema),
  });

  const submitFn = async (data: ImportCsvFormValues) => {
    try {
      const res = await parseCsv(data.files[0], {
        name: data.nameColumn,
        set: data.setColumn,
        quantity: data.quantityColumn,
        isFoil: data.foilColumn,
        price: data.priceColumn,
      });
      onSubmit(res);
    }
    catch (e) {
      console.error('[cardmarket-bulk-import] Failed to Submit CSV file.', e);
      setError('root', { message: i18n.t('injectedButton.modal.importCsvForm.error') });
    }
  };

  const files = watch('files');
  useEffect(() => {
    const f = files?.item(0);
    if (f) getColumns(f);
  }, [files, getColumns]);

  useEffect(() => {
    if (!error) {
      clearErrors('files');
      return;
    };
    setError('files', { message: i18n.t('injectedButton.modal.importCsvForm.files.invalid') });
    console.error('[cardmarket-bulk-import] Failed to parse CSV file.', error);
  }, [error, clearErrors, setError]);

  let columnsEl = null;
  if (loading) columnsEl = (<Spinner />);
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
        formId="importCsvForm.setColumn"
        name="setColumn"
        label={i18n.t('injectedButton.modal.importCsvForm.setColumn.label')}
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
        <Form.Group controlId="importCsvForm.files">
          <Form.Label>{ i18n.t('injectedButton.modal.importCsvForm.files.label') }</Form.Label>
          <Form.Control
            type="file"
            accept=".csv"
            {...register('files')}
            isInvalid={touchedFields.files && !!formErrors.files}
          />
          <Form.Control.Feedback type="invalid">
            { formErrors.files?.message }
          </Form.Control.Feedback>
        </Form.Group>
        { columnsEl }
        {
          formErrors.root && (
            <>
              { /* Bootstrap invalid-feedback requires an .is-invalid sibling */ }
              <div className="is-invalid d-none" />
              <div className="invalid-feedback mt-0">
                { formErrors.root.message }
              </div>
            </>
          )
        }
      </Stack>
    </Form>
  );
}

export default ImportCsvForm;
