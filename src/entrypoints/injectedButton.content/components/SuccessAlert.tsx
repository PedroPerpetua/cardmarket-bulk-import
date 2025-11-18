import { i18n } from '#imports';
import { useEffect } from 'react';

import { Alert } from 'react-bootstrap';

type SuccessAlertProps = {
  count: number | null,
  onDismiss: () => void,
};

function SuccessAlert({ count, onDismiss }: SuccessAlertProps) {
  // Set to dismiss after 5 seconds
  useEffect(() => {
    if (count === null) return;
    const timeout = setTimeout(() => onDismiss(), 5000);
    return () => clearTimeout(timeout);
  }, [count, onDismiss]);

  if (count === null) return null;
  return (
    <div className="alert-container">
      <Alert variant="success" onClose={() => onDismiss()} className="systemMessage" dismissible>
        <span className="fonticon-check-circle alert-icon" />
        <div className="alert-content">
          <Alert.Heading>
            { count.toString() + i18n.t('injectedButton.modal.successAlert_a') }
          </Alert.Heading>
        </div>
      </Alert>
    </div>
  );
}

export default SuccessAlert;
