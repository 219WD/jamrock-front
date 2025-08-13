import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as fullStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as emptyStar } from "@fortawesome/free-regular-svg-icons";

const RatingStars = ({ rating, setRating }) => {
  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((num) => (
        <FontAwesomeIcon
          key={num}
          icon={num <= rating ? fullStar : emptyStar}
          onClick={() => setRating(num)}
          className="star-icon"
        />
      ))}
    </div>
  );
};

export default RatingStars;