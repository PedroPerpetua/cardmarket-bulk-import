import { useEffect } from 'react';

import Fuse from 'fuse.js';
import { Col, Form, Row } from 'react-bootstrap';
import { useController } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';

type ColumnSelectProps<T extends FieldValues> = {
  control: Control<T>,
  formId: string,
  name: Path<T>,
  label: string,
  options: string[],
};
function ColumnSelect<T extends FieldValues>({ control, formId, name, label, options }: ColumnSelectProps<T>) {
  const { field, fieldState } = useController({ name, control, disabled: options.length === 0 });

  useEffect(() => {
    const fuse = new Fuse(options, { includeScore: true });
    const res = fuse.search(field.name);
    field.onChange(res.at(0)?.item ?? '');
    // We don't include the field itself because it would rerender on every change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.name, options]);

  return (
    <Form.Group as={Row} controlId={formId}>
      <Form.Label column sm={6}>{ label }</Form.Label>
      <Col sm={6}>
        <Form.Control as="select" type="select" {...field} isInvalid={fieldState.invalid}>
          <option value="" />
          { options.map((v) => (<option key={v} value={v}>{ v }</option>)) }
        </Form.Control>
        <Form.Control.Feedback type="invalid">
          { fieldState.error?.message }
        </Form.Control.Feedback>
      </Col>
    </Form.Group>
  );
}

export default ColumnSelect;
