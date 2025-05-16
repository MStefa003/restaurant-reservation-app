import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Spinner, Alert } from 'react-bootstrap';
import RestaurantCard from '../components/RestaurantCard';
import { getAllRestaurants, searchRestaurants } from '../services/restaurantService';

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getAllRestaurants();
      // Ensure data is an array
      setRestaurants(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Failed to load restaurants. Please try again later.');
      console.error(err);
      setRestaurants([]); // Set empty array in case of error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchRestaurants();
      return;
    }

    try {
      setLoading(true);
      const data = await searchRestaurants(searchTerm);
      // Ensure data is an array
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error(err);
      setRestaurants([]); // Set empty array in case of error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <h1 className="mb-4">All Restaurants</h1>
      
      <Form onSubmit={handleSearch} className="mb-4">
        <InputGroup>
          <Form.Control
            placeholder="Search by restaurant name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" variant="primary">Search</Button>
          {searchTerm && (
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setSearchTerm('');
                fetchRestaurants();
              }}
            >
              Clear
            </Button>
          )}
        </InputGroup>
      </Form>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          {restaurants.length === 0 ? (
            <Alert variant="info">
              No restaurants found. Try a different search term.
            </Alert>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {Array.isArray(restaurants) ? restaurants.map((restaurant) => (
                <Col key={restaurant.restaurant_id}>
                  <RestaurantCard restaurant={restaurant} />
                </Col>
              )) : null}
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default RestaurantsPage;
