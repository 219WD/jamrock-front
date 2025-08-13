import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as fullStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as emptyStar } from '@fortawesome/free-regular-svg-icons';
import useAuthStore from '../store/authStore';
import useNotify from '../hooks/useToast';

const ProductRating = ({ productId, initialRating = 0, onRate }) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useAuthStore((state) => state.token);
  const notify = useNotify();

  const handleRate = async (selectedRating) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:4000/products/${productId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: selectedRating })
      });

      if (!response.ok) {
        throw new Error('Error al enviar la calificación');
      }

      setRating(selectedRating);
      notify('¡Gracias por tu calificación!', 'success');
      if (onRate) onRate(productId, selectedRating);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="product-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className="star-button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          onClick={() => handleRate(star)}
          disabled={isSubmitting}
        >
          <FontAwesomeIcon
            icon={(hover || rating) >= star ? fullStar : emptyStar}
            className={`star-icon ${(hover || rating) >= star ? 'active' : ''}`}
          />
        </button>
      ))}
    </div>
  );
};

export default ProductRating;