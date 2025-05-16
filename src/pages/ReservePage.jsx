import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Alert, Card } from 'react-bootstrap';
import ReservationForm from '../components/ReservationForm';
import { getRestaurantById } from '../services/restaurantService';

const ReservePage = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const data = await getRestaurantById(restaurantId);
        setRestaurant(data);
        setError('');
      } catch (err) {
        setError('Failed to load restaurant.');
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [restaurantId]);

  return (
    <Container className="my-5">
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : restaurant ? (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>{restaurant.name}</Card.Title>
            <Card.Text>{restaurant.description}</Card.Text>
            <Card.Text className="text-muted">{restaurant.location}</Card.Text>
          </Card.Body>
        </Card>
      ) : null}
      <ReservationForm 
        restaurantId={restaurantId} 
        restaurantName={restaurant?.name || ''} 
      />
    </Container>
  );
};

export default ReservePage;
