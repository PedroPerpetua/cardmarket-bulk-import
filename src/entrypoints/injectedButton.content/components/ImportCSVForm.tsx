import { i18n } from '#imports';
import { useState, useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Col, Form, OverlayTrigger, Row, Stack, Tooltip } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import ColumnSelect from './ColumnSelect';
import { paginateArray, readCSV, BATCH_SIZE } from './utils';

export type ImportCSVFormValues = {
  files: FileList,
  batch: number,
  nameColumn: string,
  quantityColumn?: string,
  foilColumn?: string,
  priceColumn?: string,
};

const validationSchema: yup.ObjectSchema<ImportCSVFormValues> = yup.object({
  files: yup.mixed<FileList>().required(i18n.t('injectedButton.modal.form.files.required')),
  batch: yup.number().required(i18n.t('injectedButton.modal.form.batch.required')),
  nameColumn: yup.string().required(i18n.t('injectedButton.modal.form.nameColumn.required')),
  quantityColumn: yup.string(),
  foilColumn: yup.string(),
  priceColumn: yup.string(),
});

type ImportCSVFormProps = {
  onSubmit: (data: ImportCSVFormValues) => void,
};

function ImportCSVForm({ onSubmit }: ImportCSVFormProps) {
  const { control, register, handleSubmit, watch, resetField } = useForm<ImportCSVFormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: { batch: 1 },
  });

  const files = watch('files');

  const [records, setRecords] = useState<unknown[]>([]);
  useEffect(() => {
    const f = files?.item(0);
    if (!f) {
      setRecords([]);
      resetField('batch');
    }
    else {
      readCSV(f).then((res) => setRecords(res));
    }
  }, [files, resetField]);

  const { indexArr } = paginateArray(records, BATCH_SIZE);
  const needsBatches = indexArr.length > 1;

  const options = Object.keys(records.at(0) ?? {});

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={2}>
        <Row>
          <Col sm={needsBatches ? 9 : 12}>
            <Form.Group controlId="importCSVForm.Files">
              <Form.Label>{ i18n.t('injectedButton.modal.form.files.label') }</Form.Label>
              <Form.Control
                type="file"
                accept=".csv"
                {...register('files')}
              />
            </Form.Group>
          </Col>
          {
            needsBatches && (
              <Col sm={3}>
                <Form.Group controlId="importCSVForm.Batch">
                  <Stack
                    direction="horizontal"
                    className="justify-content-between align-items-baseline"
                  >
                    <Form.Label>{ i18n.t('injectedButton.modal.form.batch.label') }</Form.Label>
                    <OverlayTrigger
                      overlay={(
                        <Tooltip id="importCSVForm.Batch-tooltip">
                          { i18n.t('injectedButton.modal.form.batch.tooltip') }
                        </Tooltip>
                      )}
                      placement="right"
                    >
                      <span className="fonticon-info" />
                    </OverlayTrigger>
                  </Stack>
                  <Form.Select {...register('batch')}>
                    {
                      indexArr.map((v) => (
                        <option key={v} value={v}>{ v }</option>
                      ))
                    }
                  </Form.Select>
                </Form.Group>
              </Col>
            )
          }
        </Row>
        {
          files?.item(0) && (
            <>
              <ColumnSelect<ImportCSVFormValues>
                control={control}
                formId="importCSVForm.nameColumn"
                name="nameColumn"
                label={i18n.t('injectedButton.modal.form.nameColumn.label')}
                options={options}
              />
              <ColumnSelect<ImportCSVFormValues>
                control={control}
                formId="importCSVForm.quantityColumn"
                name="quantityColumn"
                label={i18n.t('injectedButton.modal.form.quantityColumn.label')}
                options={options}
              />
              <ColumnSelect<ImportCSVFormValues>
                control={control}
                formId="importCSVForm.foilColumn"
                name="foilColumn"
                label={i18n.t('injectedButton.modal.form.foilColumn.label')}
                options={options}
              />
              <ColumnSelect<ImportCSVFormValues>
                control={control}
                formId="importCSVForm.priceColumn"
                name="priceColumn"
                label={i18n.t('injectedButton.modal.form.priceColumn.label')}
                options={options}
              />
              <Button type="submit" className="mx-auto">
                { i18n.t('injectedButton.modal.form.submit') }
              </Button>
            </>
          )
        }
      </Stack>
    </Form>
  );
}

export default ImportCSVForm;
