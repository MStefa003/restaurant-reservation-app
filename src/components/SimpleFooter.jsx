import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const SimpleFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <Container>
        <Row className="gy-4">
          <Col md={4}>
            <h5 className="mb-3">Restaurant Reservation</h5>
            <p className="text-muted">
              Find the best restaurants and make reservations in seconds.
            </p>
          </Col>
          
          <Col md={4}>
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-white-50">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/restaurants" className="text-decoration-none text-white-50">Restaurants</Link>
              </li>
              <li className="mb-2">
                <Link to="/my-reservations" className="text-decoration-none text-white-50">My Reservations</Link>
              </li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h5 className="mb-3">Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-2 text-white-50">
                123 Restaurant Street, Athens, Greece
              </li>
              <li className="mb-2 text-white-50">
                +30 210 1234567
              </li>
              <li className="mb-2 text-white-50">
                info@restaurantreservation.com
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <div className="text-center text-white-50">
          <p className="mb-0">
            &copy; {currentYear} Restaurant Reservation. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default SimpleFooter;
