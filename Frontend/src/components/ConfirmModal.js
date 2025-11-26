import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../styles/ConfirmModal.css';

let confirmCallback = null;

// Global function to show confirmation from anywhere
export const showConfirm = (message, title = 'Xác nhận') => {
  return new Promise((resolve) => {
    if (confirmCallback) {
      confirmCallback({ message, title, resolve });
    }
  });
};

const ConfirmModal = () => {
  const [show, setShow] = useState(false);
  const [config, setConfig] = useState({ message: '', title: '', resolve: null });

  useEffect(() => {
    confirmCallback = ({ message, title, resolve }) => {
      setConfig({ message, title, resolve });
      setShow(true);
    };

    return () => {
      confirmCallback = null;
    };
  }, []);

  const handleConfirm = () => {
    setShow(false);
    if (config.resolve) config.resolve(true);
  };

  const handleCancel = () => {
    setShow(false);
    if (config.resolve) config.resolve(false);
  };

  return (
    <Modal 
      show={show} 
      onHide={handleCancel}
      centered
      className="confirm-modal"
    >
      <Modal.Header closeButton className="confirm-modal-header">
        <Modal.Title className="confirm-modal-title">
          ⚠️ {config.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="confirm-modal-body">
        <p className="confirm-modal-message">{config.message}</p>
      </Modal.Body>
      <Modal.Footer className="confirm-modal-footer">
        <Button 
          variant="secondary" 
          onClick={handleCancel}
          className="confirm-modal-btn-cancel"
        >
          Hủy
        </Button>
        <Button 
          variant="danger" 
          onClick={handleConfirm}
          className="confirm-modal-btn-confirm"
        >
          Xác nhận
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
