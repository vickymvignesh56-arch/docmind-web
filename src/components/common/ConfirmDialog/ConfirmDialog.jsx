import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import './ConfirmDialog.css';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmation"
      maxWidth="460px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={type === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="confirm-dialog-body">
        <div className={`confirm-dialog-icon confirm-dialog-icon-${type}`}>
          <AlertTriangle size={24} />
        </div>
        <div className="confirm-dialog-text">
          <h4 className="confirm-dialog-title">{title}</h4>
          <p className="confirm-dialog-msg">{message}</p>
        </div>
      </div>
    </Modal>
  );
};
