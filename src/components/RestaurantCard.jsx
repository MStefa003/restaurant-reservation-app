import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaUtensils } from 'react-icons/fa';

const RestaurantCard = ({ restaurant }) => {
  // Handle case where restaurant is undefined or null
  if (!restaurant) {
    return null;
  }

  // Default image if none provided
  const defaultImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4';
  
  return (
    <Card className="h-100 shadow-sm hover-shadow">
      <Card.Img 
        variant="top" 
        src={restaurant.image_url || defaultImage} 
        alt={restaurant.name}
        style={{ height: '200px', objectFit: 'cover' }}
      />
      <Card.Body>
        <Card.Title className="mb-2">{restaurant.name || 'Restaurant Name'}</Card.Title>
        
        <div className="mb-2 d-flex align-items-center">
          <FaMapMarkerAlt className="text-secondary me-1" />
          <small className="text-muted">{restaurant.location || 'Location'}</small>
        </div>
        
        {restaurant.cuisine && (
          <div className="mb-2 d-flex align-items-center">
            <FaUtensils className="text-secondary me-1" />
            <small className="text-muted">{restaurant.cuisine}</small>
          </div>
        )}
        
        {restaurant.rating && (
          <div className="mb-3 d-flex align-items-center">
            <FaStar className="text-warning me-1" />
            <span className="fw-bold me-2">{restaurant.rating}</span>
            <small className="text-muted">{restaurant.price_range || ''}</small>
          </div>
        )}
        
        <Card.Text className="mb-3">
          {restaurant.description 
            ? (restaurant.description.length > 100 
                ? `${restaurant.description.substring(0, 100)}...` 
                : restaurant.description)
            : 'No description available'}
        </Card.Text>
        
        <div className="d-grid gap-2">
          <Button
            as={Link}
            to={`/restaurants/${restaurant.restaurant_id}/reserve`}
            variant="primary"
            className="py-2"
          >
            Book Now
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RestaurantCard;
