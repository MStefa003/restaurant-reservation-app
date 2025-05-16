import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import { getAllRestaurants, searchRestaurants } from '../services/restaurantService';

const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredRestaurant, setFeaturedRestaurant] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getAllRestaurants();
      // Ensure data is an array
      const restaurantsArray = Array.isArray(data) ? data : [];
      setRestaurants(restaurantsArray);
      
      // Set a random restaurant as featured
      if (restaurantsArray.length > 0) {
        const randomIndex = Math.floor(Math.random() * restaurantsArray.length);
        setFeaturedRestaurant(restaurantsArray[randomIndex]);
      }
      
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
      const searchResults = Array.isArray(data) ? data : [];
      setRestaurants(searchResults);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error(err);
      setRestaurants([]); // Set empty array in case of error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section py-5 bg-dark text-white mb-5">
        <Container>
          <Row className="align-items-center">
            <Col md={7} className="text-center text-md-start">
              <h1 className="display-4 fw-bold mb-3">Find and Reserve Your Table</h1>
              <p className="lead mb-4">
                Discover the best restaurants and make reservations in seconds
              </p>
              <Form onSubmit={handleSearch} className="mb-4">
                <InputGroup className="mb-3">
                  <Form.Control
                    placeholder="Search by restaurant name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="py-2"
                  />
                  <Button type="submit" variant="primary" className="px-4">
                    Search
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={5} className="d-none d-md-block">
              <img 
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudCUyMGZvb2R8ZW58MHx8MHx8&auto=format&fit=crop&w=600&q=60" 
                alt="Restaurant" 
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* How It Works Section */}
        <div className="how-it-works mb-5">
          <h2 className="text-center mb-4">How It Works</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 text-center shadow-sm">
                <Card.Body>
                  <div className="feature-icon bg-primary text-white rounded-circle d-inline-flex p-3 mb-3">
                    <span>1</span>
                  </div>
                  <Card.Title>Find a Restaurant</Card.Title>
                  <Card.Text>
                    Search for restaurants by name, location, or browse our curated list.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 text-center shadow-sm">
                <Card.Body>
                  <div className="feature-icon bg-primary text-white rounded-circle d-inline-flex p-3 mb-3">
                    <span>2</span>
                  </div>
                  <Card.Title>Make a Reservation</Card.Title>
                  <Card.Text>
                    Select your preferred date, time, and party size to book your table.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 text-center shadow-sm">
                <Card.Body>
                  <div className="feature-icon bg-primary text-white rounded-circle d-inline-flex p-3 mb-3">
                    <span>3</span>
                  </div>
                  <Card.Title>Enjoy Your Meal</Card.Title>
                  <Card.Text>
                    Arrive at the restaurant and enjoy your dining experience.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Featured Restaurant Section */}
        {featuredRestaurant && (
          <div className="featured-restaurant mb-5">
            <h2 className="text-center mb-4">Featured Restaurant</h2>
            <Card className="shadow">
              <Row className="g-0">
                <Col md={6}>
                  <Card.Img 
                    src={featuredRestaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&w=1000&q=80'} 
                    alt={featuredRestaurant.name}
                    className="img-fluid h-100 object-fit-cover"
                    style={{ maxHeight: '300px' }}
                  />
                </Col>
                <Col md={6}>
                  <Card.Body className="d-flex flex-column h-100">
                    <Card.Title className="fs-3">{featuredRestaurant.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {featuredRestaurant.location}
                    </Card.Subtitle>
                    <Card.Text className="flex-grow-1">{featuredRestaurant.description}</Card.Text>
                    <Link to={`/restaurants/${featuredRestaurant.restaurant_id}`} className="btn btn-primary">
                      View Details & Reserve
                    </Link>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </div>
        )}

        {/* Restaurant Listings */}
        <div className="restaurant-listings">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Our Restaurants</h2>
            <Link to="/restaurants" className="btn btn-outline-primary">
              View All
            </Link>
          </div>

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
                  <div className="text-center">
                    <h4>No restaurants found</h4>
                    <p>Try a different search term or check back later.</p>
                    <Button variant="primary" onClick={fetchRestaurants}>View All Restaurants</Button>
                  </div>
                </Alert>
              ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {Array.isArray(restaurants) && restaurants.length > 0 
                    ? restaurants.slice(0, 6).map((restaurant) => (
                        <Col key={restaurant.restaurant_id}>
                          <RestaurantCard restaurant={restaurant} />
                        </Col>
                      ))
                    : null
                  }
                </Row>
              )}
            </>
          )}
        </div>
      </Container>
    </div>
  );
};

export default HomePage;
