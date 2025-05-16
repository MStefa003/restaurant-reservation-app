import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Alert, Spinner, Badge, Tabs, Tab } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getUserReservations, updateReservation, cancelReservation } from '../services/reservationService';

const ReservationsPage = () => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for editing reservation
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [editForm, setEditForm] = useState({
    reservation_date: '',
    reservation_time: '',
    people_count: 1
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [confirmCancel, setConfirmCancel] = useState(null);

  // Fetch user reservations
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-reservations', message: 'Please login to view your reservations' } });
      return;
    }

    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await getUserReservations();
        
        // Sort reservations by date (upcoming first)
        const sortedReservations = data.sort((a, b) => {
          const dateA = new Date(`${a.reservation_date}T${a.reservation_time}`);
          const dateB = new Date(`${b.reservation_date}T${b.reservation_time}`);
          return dateA - dateB;
        });
        
        setReservations(sortedReservations);
        setError(null);
      } catch (err) {
        setError('Failed to load reservations. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isAuthenticated, navigate]);

  // Handle opening edit modal
  const handleEdit = (reservation) => {
    setCurrentReservation(reservation);
    
    // Format time for the form (remove seconds if present)
    let formattedTime = reservation.reservation_time;
    if (formattedTime && formattedTime.length > 5) {
      formattedTime = formattedTime.substring(0, 5);
    }
    
    setEditForm({
      reservation_date: reservation.reservation_date,
      reservation_time: formattedTime,
      people_count: reservation.people_count
    });
    
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'people_count' ? parseInt(value) : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      // Format time to ensure it has seconds
      let formattedTime = editForm.reservation_time;
      
      // Handle different time formats
      if (formattedTime.length === 5) {
        formattedTime = `${formattedTime}:00`;
      } else if (formattedTime.includes('AM') || formattedTime.includes('PM')) {
        // Convert 12-hour format to 24-hour format if needed
        const [time, period] = formattedTime.split(' ');
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours, 10);
        
        if (period === 'PM' && hour < 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        
        formattedTime = `${hour.toString().padStart(2, '0')}:${minutes}:00`;
      }

      // Prepare updated reservation data
      const updatedReservation = {
        ...editForm,
        reservation_time: formattedTime,
        status: currentReservation.status || 'confirmed', // Ensure status is preserved
        recently_edited: true // Mark as recently edited
      };

      // Call the API to update the reservation
      await updateReservation(currentReservation.reservation_id, updatedReservation);

      // Update the reservations list in state
      setReservations(prev => 
        prev.map(res => 
          res.reservation_id === currentReservation.reservation_id 
            ? { 
                ...res, 
                ...updatedReservation,
                // Preserve other fields that might be needed for display
                restaurant_name: res.restaurant_name,
                restaurant_id: res.restaurant_id,
                location: res.location
              } 
            : res
        )
      );

      setUpdateSuccess(true);
      setTimeout(() => {
        setShowEditModal(false);
        setUpdateSuccess(false);
      }, 1500);
    } catch (err) {
      setUpdateError('Failed to update reservation. Please try again.');
      console.error(err);
    }
  };

  // Handle cancellation
  const handleCancel = async (id) => {
    try {
      // Call the API to cancel the reservation
      await cancelReservation(id);
      
      // Update the reservations list
      setReservations(prev => 
        prev.map(res => 
          res.reservation_id === id 
            ? { 
                ...res, 
                status: 'cancelled',
                // Force update to trigger re-render and tab change
                updated_at: new Date().toISOString()
              } 
            : res
        )
      );
      
      // Close the confirmation modal
      setConfirmCancel(null);
      
      // Show success message
      setError(null);
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 2000);
    } catch (err) {
      setError('Failed to cancel reservation. Please try again.');
      console.error(err);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  // Filter reservations
  const upcomingReservations = reservations.filter(res => {
    // Only check if the reservation is not cancelled
    return res.status !== 'cancelled';
  });

  const pastReservations = reservations.filter(res => {
    // Only cancelled reservations go to past section
    return res.status === 'cancelled';
  });

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return null; // The useEffect will handle redirection
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">My Reservations</h1>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
          <div className="mt-2">
            <Button variant="outline-danger" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading your reservations...</p>
        </div>
      ) : (
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab eventKey="upcoming" title="Upcoming Reservations">
            {upcomingReservations.length === 0 ? (
              <Alert variant="info">
                <p className="mb-0">You don't have any upcoming reservations.</p>
                <div className="mt-3">
                  <Link to="/restaurants" className="btn btn-primary">
                    Browse Restaurants
                  </Link>
                </div>
              </Alert>
            ) : (
              <Row>
                {upcomingReservations.map(reservation => (
                  <Col key={reservation.reservation_id} lg={4} md={6} className="mb-4">
                    <Card className="h-100 shadow-sm">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">{reservation.restaurant_name}</h5>
                        <Badge bg={getStatusBadgeVariant(reservation.status)}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </Badge>
                      </Card.Header>
                      <Card.Body>
                        <Card.Subtitle className="mb-2 text-muted">{reservation.location}</Card.Subtitle>
                        <Card.Text>
                          <strong>Date:</strong> {formatDate(reservation.reservation_date)}<br />
                          <strong>Time:</strong> {formatTime(reservation.reservation_time)}<br />
                          <strong>People:</strong> {reservation.people_count}
                        </Card.Text>
                        
                        {reservation.status !== 'cancelled' && (
                          <div className="d-flex mt-3">
                            <Button 
                              variant="outline-primary" 
                              className="me-2 flex-grow-1"
                              onClick={() => handleEdit(reservation)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              className="flex-grow-1"
                              onClick={() => setConfirmCancel(reservation.reservation_id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>
          
          <Tab eventKey="past" title="Past Reservations">
            {pastReservations.length === 0 ? (
              <Alert variant="info">
                <p className="mb-0">You don't have any past reservations.</p>
              </Alert>
            ) : (
              <Row>
                {pastReservations.map(reservation => (
                  <Col key={reservation.reservation_id} lg={4} md={6} className="mb-4">
                    <Card className="h-100 shadow-sm">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">{reservation.restaurant_name}</h5>
                        <Badge bg={getStatusBadgeVariant(reservation.status)}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </Badge>
                      </Card.Header>
                      <Card.Body>
                        <Card.Subtitle className="mb-2 text-muted">{reservation.location}</Card.Subtitle>
                        <Card.Text>
                          <strong>Date:</strong> {formatDate(reservation.reservation_date)}<br />
                          <strong>Time:</strong> {formatTime(reservation.reservation_time)}<br />
                          <strong>People:</strong> {reservation.people_count}
                        </Card.Text>
                        <Button 
                          variant="primary" 
                          className="w-100 mt-3"
                          onClick={() => navigate(`/restaurants/${reservation.restaurant_id}`)}
                        >
                          Book Again
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>
        </Tabs>
      )}

      {/* Edit Reservation Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Reservation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {updateSuccess && <Alert variant="success">Reservation updated successfully!</Alert>}
          {updateError && <Alert variant="danger">{updateError}</Alert>}
          
          {currentReservation && (
            <div className="mb-4">
              <h5>{currentReservation.restaurant_name}</h5>
              <p className="text-muted mb-0">{currentReservation.location}</p>
            </div>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control 
                type="date" 
                name="reservation_date" 
                value={editForm.reservation_date} 
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Select 
                name="reservation_time" 
                value={editForm.reservation_time} 
                onChange={handleChange}
                required
              >
                <optgroup label="Lunch">
                  <option value="12:00:00">12:00 PM</option>
                  <option value="12:30:00">12:30 PM</option>
                  <option value="13:00:00">1:00 PM</option>
                  <option value="13:30:00">1:30 PM</option>
                  <option value="14:00:00">2:00 PM</option>
                  <option value="14:30:00">2:30 PM</option>
                  <option value="15:00:00">3:00 PM</option>
                </optgroup>
                <optgroup label="Dinner">
                  <option value="18:00:00">6:00 PM</option>
                  <option value="18:30:00">6:30 PM</option>
                  <option value="19:00:00">7:00 PM</option>
                  <option value="19:30:00">7:30 PM</option>
                  <option value="20:00:00">8:00 PM</option>
                  <option value="20:30:00">8:30 PM</option>
                  <option value="21:00:00">9:00 PM</option>
                  <option value="21:30:00">9:30 PM</option>
                </optgroup>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Number of People</Form.Label>
              <Form.Select 
                name="people_count" 
                value={editForm.people_count} 
                onChange={handleChange}
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                ))}
                <option value="11">More than 10 people (call us)</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal show={!!confirmCancel} onHide={() => setConfirmCancel(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this reservation? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmCancel(null)}>
            No, Keep Reservation
          </Button>
          <Button variant="danger" onClick={() => handleCancel(confirmCancel)}>
            Yes, Cancel Reservation
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReservationsPage;
