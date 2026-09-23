import { i18n } from '#imports';

import { Button, ProgressBar } from 'react-bootstrap';

type AutoFillOverlayProps = {
  currentPage: number,
  totalFilled: number,
  maxTotal: number,
  onStop: () => void,
};

function AutoFillOverlay({ currentPage, totalFilled, maxTotal, onStop }: AutoFillOverlayProps) {
  const pct = Math.min(100, Math.round((totalFilled / maxTotal) * 100));
  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: '#fff',
        border: '1px solid #0d6efd',
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        padding: '12px 16px',
        minWidth: 320,
        maxWidth: 480,
      }}
    >
      <div className="d-flex align-items-center gap-3">
        <div
          className="spinner-border spinner-border-sm text-primary"
          role="status"
          aria-hidden="true"
        />
        <div className="flex-grow-1">
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            { i18n.t('injectedButton.autoFillOverlay.title') }
          </div>
          <div className="text-secondary" style={{ fontSize: '0.825rem' }}>
            { i18n.t('injectedButton.autoFillOverlay.page') }
            { ' ' }
            { currentPage.toString() }
            { ' · ' }
            { totalFilled.toString() }
            { ' / ' }
            { maxTotal.toString() }
            { ' ' }
            { i18n.t('injectedButton.autoFillOverlay.cards') }
          </div>
        </div>
        <Button size="sm" variant="outline-danger" onClick={onStop}>
          { i18n.t('injectedButton.autoFillOverlay.stop') }
        </Button>
      </div>
      <ProgressBar now={pct} className="mt-2" style={{ height: 4 }} />
    </div>
  );
}

export default AutoFillOverlay;
