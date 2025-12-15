import { i18n } from '#imports';
import { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form, Spinner, Stack } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import ColumnSelect from './ColumnSelect';
import { getCsvColumns } from '../../../utils/csv';
import useAsyncFn from '../../../utils/useAsyncFn';
import type { ParsedRow } from '../game-manager';
import useGameManager from '../game-manager/useGameManager';

type BaseImportFormValues = {
  files: FileList,
  name: string,
  quantity: string | undefined,
  price: string | undefined,
};

const baseValidationSchema: yup.ObjectSchema<BaseImportFormValues> = yup.object({
  files: yup.mixed<FileList>()
    .required(i18n.t('injectedButton.gameManagers.common.importCsvForm.files.required')),
  name: yup.string()
    .required(i18n.t('injectedButton.gameManagers.common.importCsvForm.name.required')),
  quantity: yup.string(),
  price: yup.string(),
});

type ImportFormValues = BaseImportFormValues & Record<string, string | undefined>;

type ImportCsvFormProps = {
  onSubmit: (data: ParsedRow[]) => void,
};

function ImportCsvForm({ onSubmit }: ImportCsvFormProps) {
  const { extraColumns, extraValidationSchema, parseCsv } = useGameManager();
  const [{ value: csvColumns, loading, error }, getColumns] = useAsyncFn(getCsvColumns);
  const {
    control,
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors: formErrors, touchedFields },
  } = useForm<ImportFormValues, undefined, ImportFormValues>({
    // @ts-ignore // yup doesn't like the concat here
    resolver: yupResolver(baseValidationSchema.concat(extraValidationSchema)),
  });

  const submitFn = handleSubmit(async (data) => {
    const { files, ...mapping } = data;
    try {
      const res = await parseCsv(files[0], mapping);
      onSubmit(res);
    }
    catch (e) {
      console.error('[cardmarket-bulk-import] Failed to Submit CSV file.', e);
      setError('root', { message: i18n.t('injectedButton.modal.importCsvForm.error') });
    }
  });

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
    setError('files', {
      message: i18n.t('injectedButton.gameManagers.common.importCsvForm.files.invalid'),
    });
    console.error('[cardmarket-bulk-import] Failed to parse CSV file.', error);
  }, [error, clearErrors, setError]);

  let columnsEl = null;
  if (loading) columnsEl = (<Spinner />);
  else if (csvColumns) columnsEl = (
    <>
      <ColumnSelect
        control={control}
        formId="importCsvForm.name"
        name="name"
        label={i18n.t('injectedButton.gameManagers.common.importCsvForm.name.label')}
        options={csvColumns}
      />
      {
        Object.entries(extraColumns).map(([name, label]) => (
          <ColumnSelect
            key={name}
            control={control}
            formId={`importCsvForm.${name}`}
            name={name}
            label={i18n.t(label)}
            options={csvColumns}
          />
        ))
      }
      <ColumnSelect
        control={control}
        formId="importCsvForm.quantity"
        name="quantity"
        label={i18n.t('injectedButton.gameManagers.common.importCsvForm.quantity.label')}
        options={csvColumns}
      />
      <ColumnSelect
        control={control}
        formId="importCsvForm.price"
        name="price"
        label={i18n.t('injectedButton.gameManagers.common.importCsvForm.price.label')}
        options={csvColumns}
      />
      <Button type="submit" className="mx-auto">
        { i18n.t('injectedButton.modal.importCsvForm.submit') }
      </Button>
    </>
  );

  return (
    <Form noValidate onSubmit={submitFn}>
      <Stack gap={2}>
        <Form.Group controlId="importCsvForm.files">
          <Form.Label>
            { i18n.t('injectedButton.gameManagers.common.importCsvForm.files.label') }
          </Form.Label>
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
