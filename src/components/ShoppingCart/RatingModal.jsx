import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as fullStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as emptyStar } from '@fortawesome/free-regular-svg-icons';
import useAuthStore from '../../store/authStore';
import useNotify from '../../hooks/useToast';

const RatingModal = ({ productId, productName, onClose, onRateSuccess }) => {
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useAuthStore((state) => state.token);
  const notify = useNotify();

  const handleSubmit = async () => {
    if (isSubmitting || rating === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:4000/products/${productId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
      });

      if (!response.ok) {
        throw new Error('Error al enviar la calificación');
      }

      notify('¡Gracias por tu calificación!', 'success');
      onRateSuccess();
      onClose();
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal-content">
        <h3>Calificar {productName}</h3>
        
        <div className="stars-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesomeIcon
              key={star}
              icon={star <= rating ? fullStar : emptyStar}
              onClick={() => setRating(star)}
              className="star-icon"
              size="2x"
            />
          ))}
        </div>
        
        <div className="modal-actions">
          <button 
            onClick={onClose}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="submit-button"
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;