import React from 'react';
import { X } from 'lucide-react';
import './CompletionModal.css'

const CompletionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>Congratulations!</h2>
        <p>You've completed all tasks for this course. Great job!</p>
        <button className="primary-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default CompletionModal;