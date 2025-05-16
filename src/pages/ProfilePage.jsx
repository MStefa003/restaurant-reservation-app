import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getUserProfile, changePassword } from '../services/userService';
import { format } from 'date-fns';
import { FaCalendarAlt, FaUtensils, FaClock, FaUser, FaUsers, FaEdit, FaRegTrashAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  
  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    fetchUserData();
    fetchReservations();
  }, []);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user profile data...');
      const userData = await getUserProfile();
      console.log('User profile data received:', userData);
      setUser(userData);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile. Please try again later.');
    }
  };

  const fetchReservations = async () => {
    try {
      console.log('Fetching user reservations...');
      
      // Get token directly
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found for fetching reservations');
        setError('Authentication error. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Use fetch directly instead of the service
      const response = await fetch('http://localhost:5001/api/user/reservations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load reservations');
      }
      
      const data = await response.json();
      console.log('User reservations received:', data);
      
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load reservations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (reservation) => {
    setSelectedReservation(reservation);
    setShowCancelModal(true);
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;
    
    setCancelLoading(true);
    try {
      // Get token directly
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication error. Please log in again.');
      }
      
      // Use fetch directly for cancellation
      const response = await fetch(`http://localhost:5001/api/reservations/${selectedReservation.reservation_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel reservation');
      }
      
      // Update the reservation status locally
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res.reservation_id === selectedReservation.reservation_id 
            ? { ...res, status: 'cancelled' } 
            : res
        )
      );
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      setError('Failed to cancel reservation. Please try again later.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Calculate reservation statistics
  const getReservationStats = () => {
    if (!reservations || reservations.length === 0) {
      return { total: 0, upcoming: 0, past: 0 };
    }
    
    const total = reservations.length;
    const upcoming = reservations.filter(r => r.status !== 'cancelled').length;
    const past = reservations.filter(r => r.status === 'cancelled').length;
    
    return { total, upcoming, past };
  };

  // Filter reservations for display
  const upcomingReservations = reservations.filter(r => r.status !== 'cancelled');
  const pastReservations = reservations.filter(r => r.status === 'cancelled');

  const stats = getReservationStats();

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    setPasswordLoading(true);
    try {
      await changePassword({
        currentPassword,
        newPassword
      });
      setPasswordSuccess('Password updated successfully');
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Close modal after delay
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy');
    } catch (err) {
      console.error('Date formatting error:', err);
      return dateStr || 'Unknown date';
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <div className="text-center mb-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${currentUser?.name || user?.name || 'User'}&background=random&size=128`}
                  alt="Profile"
                  className="rounded-circle img-thumbnail shadow-sm"
                />
                <h3 className="mt-3 fw-bold">{currentUser?.name || user?.name || 'User'}</h3>
                <p className="text-muted">
                  <i className="bi bi-envelope me-2"></i>
                  {currentUser?.email || user?.email || 'No email'}
                </p>
                
                {user?.created_at && (
                  <p className="text-muted small">
                    <strong>Member since:</strong> {formatDate(user.created_at)}
                  </p>
                )}
                
                <div className="mt-4">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    className="px-4 py-2"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body>
              <Card.Title>Reservation Statistics</Card.Title>
              <Table striped bordered hover size="sm" className="mt-3">
                <tbody>
                  <tr>
                    <td>Total Reservations</td>
                    <td>{stats.total}</td>
                  </tr>
                  <tr>
                    <td>Upcoming Reservations</td>
                    <td>{stats.upcoming}</td>
                  </tr>
                  <tr>
                    <td>Past Reservations</td>
                    <td>{stats.past}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>My Reservations</Card.Title>
              
              {Array.isArray(upcomingReservations) && upcomingReservations.length > 0 ? (
                <div className="mt-3">
                  {upcomingReservations.map((reservation) => (
                    <Card key={reservation.reservation_id} className="mb-3 shadow-sm border-0 reservation-card">
                      <Card.Body>
                        <Row>
                          <Col md={2} className="text-center border-end">
                            <div className="d-flex flex-column align-items-center justify-content-center h-100">
                              <FaCalendarAlt className="text-primary mb-2" size={24} />
                              <div className="fw-bold">{formatDate(reservation.reservation_date)}</div>
                              <div><FaClock className="me-1 text-muted" size={12} /> {reservation.reservation_time.substring(0, 5)}</div>
                            </div>
                          </Col>
                          <Col md={7}>
                            <h5 className="mb-2 fw-bold d-flex align-items-center">
                              <FaUtensils className="me-2 text-primary" /> {reservation.restaurant_name}
                            </h5>
                            <div className="text-muted mb-1">
                              <small>Location: {reservation.restaurant_location || 'Not specified'}</small>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                              <FaUsers className="me-2 text-muted" /> 
                              <span>{reservation.people_count} {reservation.people_count === 1 ? 'person' : 'people'}</span>
                            </div>
                            {reservation.notes && (
                              <div className="mt-2 small text-muted">
                                <strong>Special requests:</strong> {reservation.notes}
                              </div>
                            )}
                          </Col>
                          <Col md={3} className="text-end d-flex flex-column justify-content-between">
                            <Badge bg="success" className="mb-3 py-2 px-3 align-self-end">
                              {reservation.status}
                            </Badge>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert variant="info" className="mt-3">
                  You don't have any upcoming reservations. <Link to="/restaurants" className="text-decoration-none">Browse restaurants</Link> to make a reservation.
                </Alert>
              )}
            </Card.Body>
          </Card>
          
          {Array.isArray(pastReservations) && pastReservations.length > 0 && (
            <Card className="mt-4">
              <Card.Body>
                <Card.Title>Past Reservations</Card.Title>
                <div className="mt-3">
                  {pastReservations.map((reservation) => (
                    <Card key={reservation.reservation_id} className="mb-3 shadow-sm border-0 reservation-card bg-light">
                      <Card.Body>
                        <Row>
                          <Col md={2} className="text-center border-end">
                            <div className="d-flex flex-column align-items-center justify-content-center h-100">
                              <FaCalendarAlt className="text-secondary mb-2" size={24} />
                              <div className="fw-bold text-muted">{formatDate(reservation.reservation_date)}</div>
                              <div><FaClock className="me-1 text-muted" size={12} /> {reservation.reservation_time.substring(0, 5)}</div>
                            </div>
                          </Col>
                          <Col md={7}>
                            <h5 className="mb-2 fw-bold d-flex align-items-center text-muted">
                              <FaUtensils className="me-2 text-secondary" /> {reservation.restaurant_name}
                            </h5>
                            <div className="text-muted mb-1">
                              <small>Location: {reservation.restaurant_location || 'Not specified'}</small>
                            </div>
                            <div className="d-flex align-items-center mb-2 text-muted">
                              <FaUsers className="me-2" /> 
                              <span>{reservation.people_count} {reservation.people_count === 1 ? 'person' : 'people'}</span>
                            </div>
                            {reservation.notes && (
                              <div className="mt-2 small text-muted">
                                <strong>Special requests:</strong> {reservation.notes}
                              </div>
                            )}
                          </Col>
                          <Col md={3} className="text-end">
                            <Badge bg="secondary" className="py-2 px-3">
                              {reservation.status}
                            </Badge>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
      
      {/* Cancel Reservation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Reservation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel your reservation at <strong>{selectedReservation?.restaurant_name}</strong> on <strong>{selectedReservation && formatDate(selectedReservation.reservation_date)}</strong> at <strong>{selectedReservation?.reservation_time}</strong>?</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Reason for cancellation (optional)</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Close
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelReservation}
            disabled={cancelLoading}
          >
            {cancelLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Cancelling...</span>
              </>
            ) : (
              'Confirm Cancellation'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Password Change Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {passwordError && <Alert variant="danger">{passwordError}</Alert>}
          {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}
          
          <Form onSubmit={handlePasswordChange}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Must be at least 6 characters long
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Updating...</span>
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProfilePage;
