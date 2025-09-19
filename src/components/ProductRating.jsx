import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faTimes } from '@fortawesome/free-solid-svg-icons';
import useAuthStore from '../store/authStore';
import useNotify from '../hooks/useToast';
import './css/RatingModal.css';
import API_URL from "../common/constants";

const RatingModal = ({ productId, productName, cartId, onClose, onRateSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const token = useAuthStore((state) => state.token);
  const notify = useNotify();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      notify('Por favor selecciona una calificación', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/cart/${cartId}/rate/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          stars: rating,
          comment: comment.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar la calificación');
      }

      const result = await response.json();
      console.log('Rating guardado:', result);
      notify('¡Gracias por tu calificación y comentario!', 'success');
      onRateSuccess();
      onClose();
    } catch (error) {
      console.error('Error al calificar:', error);
      notify(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h2>Calificar Producto</h2>
        <p className="product-name">{productName}</p>

        <form onSubmit={handleSubmit}>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-button ${rating >= star ? 'active' : ''} ${hover >= star ? 'hover' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <FontAwesomeIcon icon={faStar} />
              </button>
            ))}
          </div>

          <div className="rating-labels">
            <span>1 estrella - Malo</span>
            <span>5 estrellas - Excelente</span>
          </div>

          {/* SECCIÓN DE COMENTARIO - ESTO ES LO QUE FALTABA */}
          <div className="comment-section">
            <label htmlFor="comment">Comentario (opcional):</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Qué te pareció este producto? Comparte tu experiencia..."
              rows="4"
              maxLength="500"
            />
            <span className="char-count">{comment.length}/500 caracteres</span>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || rating === 0}
              className="submit-button"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;