import { clsx } from 'clsx';
import type { HTMLProps } from 'react';

export type ErrorTextProps = HTMLProps<HTMLDivElement>;

function ErrorText({ className, ...props }: ErrorTextProps) {
  return (
    <>
      { /* Bootstrap invalid-feedback requires an .is-invalid sibling */ }
      <div className="is-invalid d-none" />
      <div className={clsx('invalid-feedback mt-0', className)} {...props} />
    </>
  );
}

export default ErrorText;
