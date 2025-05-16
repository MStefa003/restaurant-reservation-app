import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUtensils, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-5 mt-5">
      <Container>
        <Row className="gy-4">
          <Col md={4}>
            <h5 className="mb-3 d-flex align-items-center">
              <FaUtensils className="me-2" /> Restaurant Reservation
            </h5>
            <p className="text-muted">
              Find the best restaurants and make reservations in seconds. Enjoy your dining experience with our easy-to-use platform.
            </p>
          </Col>
          
          <Col md={4}>
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-white-50 hover-primary">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/restaurants" className="text-decoration-none text-white-50 hover-primary">Restaurants</Link>
              </li>
              <li className="mb-2">
                <Link to="/my-reservations" className="text-decoration-none text-white-50 hover-primary">My Reservations</Link>
              </li>
              <li className="mb-2">
                <Link to="/profile" className="text-decoration-none text-white-50 hover-primary">Profile</Link>
              </li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h5 className="mb-3">Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-2 text-white-50">
                <FaMapMarkerAlt className="me-2" /> 123 Restaurant Street, Athens, Greece
              </li>
              <li className="mb-2 text-white-50">
                <FaPhoneAlt className="me-2" /> +30 210 1234567
              </li>
              <li className="mb-2 text-white-50">
                <FaEnvelope className="me-2" /> info@restaurantreservation.com
              </li>
            </ul>
            
            <div className="mt-3">
              <a href="https://facebook.com" className="text-white me-3 fs-5">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" className="text-white me-3 fs-5">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" className="text-white fs-5">
                <FaInstagram />
              </a>
            </div>
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

export default Footer;
