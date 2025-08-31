import { useState } from 'react';
import type { PropsWithChildren } from 'react';

import { Button, Image, Stack } from 'react-bootstrap';

import usePanelsContext from './usePanelsContext';
import BackIcon from '../../../../assets/back-icon.svg';

type PanelProps = PropsWithChildren<{
  title?: string,
}>;

function Panel({ children, title }: PanelProps) {
  const [heightMargin, setHeightMargin] = useState(0);
  const { canGoBack, goBack } = usePanelsContext();

  return (
    <Stack className="w-100 h-100">
      <Stack
        direction="horizontal"
        className="position-fixed top-0 align-items-center vw-100 p-2"
        style={{ backgroundColor: 'var(--background)', marginLeft: 'calc(var(--body-padding) * -1)' }}
        ref={(node) => setHeightMargin(node?.clientHeight ?? 0)}
      >
        {
          canGoBack && (
            <Button onClick={goBack} style={{ width: 'fit-content', padding: 0 }}>
              <Image src={BackIcon} width={32} />
            </Button>
          )
        }
        {
          title && (
            <h6 className="position-absolute start-50 translate-middle-x fw-bold text-uppercase">
              { title }
            </h6>
          )
        }
      </Stack>
      <div style={{ minHeight: `calc(${heightMargin}px - var(--body-padding))` }} />
      { children }
    </Stack>
  );
}

export default Panel;
