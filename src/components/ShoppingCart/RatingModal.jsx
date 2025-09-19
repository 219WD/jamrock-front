import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faTimes } from '@fortawesome/free-solid-svg-icons';
import useAuthStore from '../../store/authStore';
import useNotify from '../../hooks/useToast';
import './css/RatingModal.css';

const RatingModal = ({ 
  productId, 
  productName, 
  cartId, 
  onClose, 
  onRateSuccess,
  existingRating = null
}) => {
  const [rating, setRating] = useState(existingRating ? existingRating.stars : 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existingRating ? existingRating.comment : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isViewMode] = useState(!!existingRating);
  
  const token = useAuthStore((state) => state.token);
  const notify = useNotify();
  
  const overlayRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.stars);
      setComment(existingRating.comment || '');
    }
  }, [existingRating]);

  useEffect(() => {
    if (overlayRef.current && containerRef.current && !isClosing) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(containerRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [isClosing]);

  const handleClose = () => {
    if (overlayRef.current && containerRef.current) {
      setIsClosing(true);
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setIsClosing(false);
          onClose();
        },
      });
      gsap.to(containerRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      });
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      notify('Por favor selecciona una calificación', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:4000/cart/${cartId}/rate/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          stars: rating,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar la calificación');
      }

      await response.json();
      notify('¡Gracias por tu calificación y comentario!', 'success');
      onRateSuccess();
      handleClose();
    } catch (error) {
      console.error('Error al calificar:', error);
      notify(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" ref={overlayRef}>
      <div className="modal-container" ref={containerRef}>
        <div className="modal-header">
          <h2>{isViewMode ? 'Tu Calificación' : 'Calificar Producto'}</h2>
          <button 
            className="modal-close-btn" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-body">
          <p className="product-name">{productName}</p>

          {isViewMode ? (
            <div className="rating-view">
              <div className="existing-rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star-view ${rating >= star ? 'active' : ''}`}
                  >
                    <FontAwesomeIcon icon={faStar} />
                  </span>
                ))}
              </div>
              
              {comment && (
                <div className="existing-comment">
                  <h4>Tu comentario:</h4>
                  <p>{comment}</p>
                </div>
              )}
            </div>
          ) : (
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
                    disabled={isSubmitting}
                  >
                    <FontAwesomeIcon icon={faStar} />
                  </button>
                ))}
              </div>

              <div className="rating-labels">
                <span>1 estrella - Malo</span>
                <span>5 estrellas - Excelente</span>
              </div>

              <div className="modal-input-group">
                <label htmlFor="comment">Comentario (opcional):</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="¿Qué te pareció este producto? Comparte tu experiencia..."
                  rows="4"
                  maxLength="500"
                  disabled={isSubmitting}
                />
                <span className="char-count">{comment.length}/500 caracteres</span>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-btn modal-btn-secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="modal-btn modal-btn-primary"
                  disabled={isSubmitting || rating === 0}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
                </button>
              </div>
            </form>
          )}
        </div>

        {isViewMode && (
          <div className="modal-footer">
            <button
              type="button"
              className="modal-btn modal-btn-secondary"
              onClick={handleClose}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default RatingModal;