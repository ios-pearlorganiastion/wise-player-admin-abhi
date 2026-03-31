import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';
import './ConfirmModal.css';

const ConfirmModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "danger", // 'danger' or 'info'
  isLoading = false 
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      className="confirm-modal-root"
      backdrop="static"
    >
      <div className={`confirm-modal-content glass-card ${variant}`}>
        <div className="confirm-modal-header">
          <div className="icon-box">
            {variant === 'danger' ? <FiAlertTriangle /> : <FiInfo />}
          </div>
          <button className="close-btn" onClick={onHide}><FiX /></button>
        </div>
        
        <div className="confirm-modal-body text-center">
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-message">{message}</p>
        </div>

        <div className="confirm-modal-footer">
          <Button variant="link" className="cancel-link" onClick={onHide} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button 
            className={`confirm-btn ${variant === 'danger' ? 'btn-red' : 'btn-info-custom'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
