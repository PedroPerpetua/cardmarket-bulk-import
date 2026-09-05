import { i18n } from '#imports';

import { OverlayTrigger, Stack, Tooltip } from 'react-bootstrap';

import type { ParsedRow } from '../game-manager';

export type NameColumnContentProps = {
  row: ParsedRow,
};

function NameColumnContent({ row }: NameColumnContentProps) {
  const textContent = (row.name.matchedName && row.name.matchedName !== row.name.value)
    ? (
        <Stack direction="vertical" className="align-items-center">
          <OverlayTrigger
            placement="top"
            overlay={(
              <Tooltip>
                { i18n.t('injectedButton.modal.selectRowsForm.nameMatchedTooltip') }
              </Tooltip>
            )}
          >
            <span style={{ width: 'fit-content' }}>
              <p className="mb-0">{row.name.matchedName}</p>
              <p
                className="mb-0 text-light"
                style={{ fontSize: '0.75rem', marginTop: '-0.25rem' }}
              >
                { `CSV: ${row.name.value}` }
              </p>
            </span>
          </OverlayTrigger>
        </Stack>
      )
    : row.name.value;

  const matchingButDisabled = !!row.name.matchedName && !row.enabled;
  if (!matchingButDisabled) return textContent;
  return (
    <OverlayTrigger
      placement="bottom"
      overlay={(
        <Tooltip>
          { i18n.t('injectedButton.modal.selectRowsForm.nameMatchedWarning') }
        </Tooltip>
      )}
    >
      <span className="text-warning">
        {textContent}
      </span>
    </OverlayTrigger>
  );
}

export default NameColumnContent;
