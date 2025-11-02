import { i18n } from '#imports';

import { Toast, ToastContainer } from 'react-bootstrap';

type SuccessToastProps = {
  count: number | null,
  onDismiss: () => void,
};

function SuccessToast({ count, onDismiss }: SuccessToastProps) {
  return (
    <ToastContainer className="start-50 translate-middle-x mt-2">
      <Toast show={count !== null} onClose={onDismiss} bg="success" delay={5000} autohide>
        <Toast.Header>
          <strong className="me-auto">
            { i18n.t('injectedButton.modal.successToast.title') }
          </strong>
        </Toast.Header>
        <Toast.Body>
          { (count || 0).toString() + i18n.t('injectedButton.modal.successToast.body_a') }
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default SuccessToast;
