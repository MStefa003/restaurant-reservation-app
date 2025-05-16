import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useParams, Navigate } from 'react-router-dom';
import { getRestaurantById } from '../services/restaurantService';
import ReservationForm from '../components/ReservationForm';
import { AuthContext } from '../context/AuthContext';

const RestaurantDetailsPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservationSuccess, setReservationSuccess] = useState(false);
  
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const data = await getRestaurantById(id);
        setRestaurant(data);
        setError('');
      } catch (err) {
        setError('Failed to load restaurant details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  const handleReservationSuccess = () => {
    setReservationSuccess(true);
    // Reset after 3 seconds
    setTimeout(() => {
      setReservationSuccess(false);
    }, 3000);
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!restaurant) {
    return (
      <Container className="my-5">
        <Alert variant="warning">Restaurant not found</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      {reservationSuccess && (
        <Alert variant="success" className="mb-4">
          Your reservation has been created successfully!
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow">
            <Card.Img 
              variant="top" 
              src={restaurant.image_url || 'https://via.placeholder.com/800x400?text=Restaurant'} 
              alt={restaurant.name}
              style={{ height: '400px', objectFit: 'cover' }}
            />
            <Card.Body className="p-4">
              <h1 className="display-5 fw-bold mb-2">{restaurant.name}</h1>
              <div className="d-flex align-items-center mb-3">
                <span className="badge bg-primary me-2 py-2 px-3">{restaurant.cuisine}</span>
                <span className="text-muted fw-light">{restaurant.location}</span>
              </div>
              
              <hr className="my-4" />
              
              <Row className="mb-4">
                <Col md={6}>
                  <h4 className="mb-3">About</h4>
                  <p className="text-muted lh-lg">{restaurant.description}</p>
                </Col>
                <Col md={6}>
                  <h4 className="mb-3">Details</h4>
                  <ul className="list-unstyled">
                    <li className="mb-2"><strong>Price Range:</strong> {restaurant.price_range || 'Not specified'}</li>
                    <li className="mb-2"><strong>Rating:</strong> {restaurant.rating || 'Not rated'} ⭐</li>
                    <li className="mb-2"><strong>Hours:</strong> 11:00 AM - 10:00 PM</li>
                    <li className="mb-2"><strong>Cuisine:</strong> {restaurant.cuisine || 'Various'}</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          {isAuthenticated ? (
            <ReservationForm 
              restaurantId={id} 
              onSuccess={handleReservationSuccess}
            />
          ) : (
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <Card.Title>Make a Reservation</Card.Title>
                <Card.Text>
                  Please login to make a reservation at this restaurant.
                </Card.Text>
                <a href="/login" className="btn btn-primary">Login</a>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default RestaurantDetailsPage;
