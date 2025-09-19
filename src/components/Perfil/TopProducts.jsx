import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const TopProducts = ({ topProducts }) => {
  return (
    <div className="dashboard-section">
      <h2 className="section-title">
        <FontAwesomeIcon icon={faStar} /> Productos más comprados
      </h2>
      <div className="top-products-grid">
        {topProducts.map((prod) => (
          <div className="top-product-card" key={prod.id}>
            <img
              src={prod.image || "/placeholder.png"}
              alt={prod.name}
              className="product-thumbnail"
            />
            <div className="product-details">
              <h3 className="product-name">{prod.name}</h3>
              <p className="product-count">{prod.count} unidades</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;