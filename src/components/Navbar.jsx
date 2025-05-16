import React, { useContext } from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHome, FaUtensils, FaCalendarAlt, FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';

const NavigationBar = () => {
  const { isAuthenticated, currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!currentUser) return 'User';
    
    // If full_name exists, use it
    if (currentUser.full_name) return currentUser.full_name;
    
    // If name exists, use it
    if (currentUser.name) return currentUser.name;
    
    // If we have first_name, use it
    if (currentUser.first_name) {
      return currentUser.last_name 
        ? `${currentUser.first_name} ${currentUser.last_name}` 
        : currentUser.first_name;
    }
    
    // Fall back to email if available
    if (currentUser.email) {
      return currentUser.email.split('@')[0];
    }
    
    // Last resort
    return 'User';
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top" className="py-2">
      <Container>
        <Navbar.Brand as={Link} to="/">Restaurant Reservation</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              <FaHome className="me-1" /> Home
            </Nav.Link>
            <Nav.Link as={Link} to="/restaurants">
              <FaUtensils className="me-1" /> Restaurants
            </Nav.Link>
            {isAuthenticated && (
              <Nav.Link as={Link} to="/my-reservations">
                <FaCalendarAlt className="me-1" /> My Reservations
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="dark" id="dropdown-user">
                  <FaUser className="me-1" /> {getUserDisplayName()}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">
                    <FaUser className="me-2" /> Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/my-reservations">
                    <FaCalendarAlt className="me-2" /> My Reservations
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <FaSignInAlt className="me-1" /> Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <FaUserPlus className="me-1" /> Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;