import React, { useState, useContext } from 'react';
import { Form, Button, Alert, Card, Row, Col, InputGroup } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaCalendarAlt, FaClock, FaUsers, FaUtensils, FaComment, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const ReservationForm = ({ restaurantId, onSuccess, restaurantName }) => {
  const [reservationDate, setReservationDate] = useState(new Date().toISOString().split('T')[0]);
  const [reservationTime, setReservationTime] = useState('19:00');
  const [peopleCount, setPeopleCount] = useState(2);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);

  // Ensure token is included in the API request
  const token = localStorage.getItem('token');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save reservation details to session storage for after login
      const reservationIntent = {
        restaurantId,
        restaurantName,
        reservationDate,
        reservationTime,
        peopleCount,
        notes,
        returnTo: location.pathname
      };
      sessionStorage.setItem('reservationIntent', JSON.stringify(reservationIntent));
      
      // Redirect to login page
      navigate('/login', { state: { from: location.pathname, message: 'Please login to complete your reservation' } });
      return;
    }
    
    // Immediately check if token exists
    if (!token) {
      setError('You must be logged in to make a reservation. Please refresh the page and try again.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Format date and time for API
      const date = reservationDate;
      
      // Ensure time has seconds for consistent format
      const formattedTime = reservationTime.length === 5 
        ? `${reservationTime}:00` 
        : reservationTime;
      
      const reservationData = {
        restaurant_id: Number(restaurantId), // Ensure it's a number
        reservation_date: date,
        reservation_time: formattedTime,
        people_count: Number(peopleCount), // Ensure it's a number
        notes: notes.trim(),
        status: 'confirmed' // Explicitly set status to confirmed
      };

      console.log('Sending reservation data:', reservationData);
      
      // Make direct fetch call to bypass any axios issues
      const response = await fetch('http://localhost:5001/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reservationData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create reservation');
      }
      
      console.log('Reservation created successfully:', data);
      setSuccess(true);
      
      // Reset form
      setReservationDate(new Date().toISOString().split('T')[0]);
      setReservationTime('19:00');
      setPeopleCount(2);
      setNotes('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Reservation error:', err);
      setError(err.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];
  
  // Get date 3 months from now for max date
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Convert date to more readable format for display
  const formatDisplayDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card className="shadow-lg border-0 h-100 reservation-card">
      <Card.Header className="bg-dark text-white py-4 px-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h3 className="mb-0 fw-bold">
              <FaCalendarAlt className="me-2" /> Reservation
            </h3>
            {restaurantName && (
              <p className="mb-0 mt-2 opacity-75 fw-light">
                at {restaurantName}
              </p>
            )}
          </div>
          <div className="text-end">
            <span className="badge bg-light text-dark px-3 py-2">
              <FaCheckCircle className="text-success me-1" /> Instant Confirmation
            </span>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        {error && (
          <Alert variant="danger" className="mb-4 d-flex align-items-center">
            <FaInfoCircle className="me-2" /> {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-4 d-flex align-items-center">
            <FaCheckCircle className="me-2" /> Reservation created successfully!
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit} className="reservation-form">
          <Row className="mb-4 gx-4">
            <Col md={6} className="mb-4 mb-md-0">
              <Form.Group>
                <Form.Label className="fw-bold text-dark mb-2 d-flex align-items-center">
                  <div className="icon-circle bg-primary text-white p-2 me-2 rounded-circle">
                    <FaCalendarAlt />
                  </div>
                  Select Date
                </Form.Label>
                <InputGroup className="date-input-group">
                  <Form.Control
                    type="date"
                    min={today}
                    max={maxDateString}
                    value={reservationDate}
                    onChange={e => setReservationDate(e.target.value)}
                    required
                    className="form-control-lg shadow-sm"
                    style={{ borderColor: '#dee2e6', borderRadius: '0.5rem' }}
                    aria-label="Reservation Date"
                  />
                </InputGroup>
                {reservationDate && (
                  <div className="mt-2 px-2 py-1 bg-light rounded d-flex align-items-center">
                    <FaCalendarAlt className="text-primary me-2" />
                    <small>
                      {new Date(reservationDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </small>
                  </div>
                )}
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold text-dark mb-2 d-flex align-items-center">
                  <div className="icon-circle bg-primary text-white p-2 me-2 rounded-circle">
                    <FaClock />
                  </div>
                  Select Time
                </Form.Label>
                <Form.Select
                  value={reservationTime}
                  onChange={e => setReservationTime(e.target.value)}
                  required
                  className="form-control-lg shadow-sm"
                  style={{ borderColor: '#dee2e6', borderRadius: '0.5rem' }}
                >
                  <optgroup label="Lunch">
                    <option value="12:00">12:00 PM</option>
                    <option value="12:30">12:30 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="13:30">1:30 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="14:30">2:30 PM</option>
                    <option value="15:00">3:00 PM</option>
                  </optgroup>
                  <optgroup label="Dinner">
                    <option value="18:00">6:00 PM</option>
                    <option value="18:30">6:30 PM</option>
                    <option value="19:00">7:00 PM</option>
                    <option value="19:30">7:30 PM</option>
                    <option value="20:00">8:00 PM</option>
                    <option value="20:30">8:30 PM</option>
                    <option value="21:00">9:00 PM</option>
                    <option value="21:30">9:30 PM</option>
                  </optgroup>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="mb-4 p-4 bg-light rounded-3 border" style={{ borderColor: '#dee2e6' }}>
            <Form.Group>
              <Form.Label className="fw-bold text-dark mb-3 d-flex align-items-center">
                <div className="icon-circle bg-primary text-white p-2 me-2 rounded-circle">
                  <FaUsers />
                </div>
                Party Size
              </Form.Label>
              <div className="d-flex flex-wrap mb-3 justify-content-center">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <Button 
                    key={num}
                    variant={peopleCount === num ? "dark" : "outline-dark"}
                    className="mx-2 mb-2 d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '55px', 
                      height: '55px', 
                      borderRadius: '50%',
                      transition: 'all 0.2s ease',
                      fontWeight: peopleCount === num ? 'bold' : 'normal'
                    }}
                    onClick={() => setPeopleCount(num)}
                    type="button"
                  >
                    {num}
                  </Button>
                ))}
              </div>
              <div className="d-flex justify-content-center mt-3">
                <Form.Select 
                  value={peopleCount > 8 ? peopleCount : ""}
                  onChange={e => setPeopleCount(parseInt(e.target.value))}
                  className="w-50 shadow-sm"
                  style={{ borderColor: '#dee2e6', borderRadius: '0.5rem' }}
                >
                  <option value="" disabled>More guests</option>
                  <option value="9">9 guests</option>
                  <option value="10">10 guests</option>
                  <option value="11">More than 10</option>
                </Form.Select>
              </div>
              <div className="text-center mt-3">
                <small className="text-muted fst-italic">
                  <FaInfoCircle className="me-1" /> For parties larger than 10, please call us directly
                </small>
              </div>
            </Form.Group>
          </div>
          
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold text-dark mb-2 d-flex align-items-center">
              <div className="icon-circle bg-primary text-white p-2 me-2 rounded-circle">
                <FaComment />
              </div>
              Special Requests
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Any special requests, dietary needs, or celebration details? Let us know!"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="shadow-sm"
              style={{ borderColor: '#dee2e6', borderRadius: '0.5rem' }}
            />
            <div className="mt-2 px-3 py-2 bg-light rounded-3 border" style={{ borderColor: '#dee2e6' }}>
              <small className="text-muted">
                <FaInfoCircle className="me-1" /> We'll do our best to accommodate your requests based on availability
              </small>
            </div>
          </Form.Group>
          
          <hr className="my-4" />
          
          <div className="d-grid">
            <Button 
              variant="dark" 
              type="submit" 
              disabled={loading}
              size="lg"
              className="py-3 fw-bold"
              style={{ borderRadius: '0.5rem', letterSpacing: '0.5px' }}
            >
              {loading ? 'Processing...' : 'CONFIRM RESERVATION'}
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <small className="text-muted">
              By making a reservation, you agree to our <a href="#" className="text-decoration-none">reservation policy</a>
            </small>
          </div>
        </Form>
      </Card.Body>
      <Card.Footer className="bg-light text-center py-3 border-top">
        <div className="d-flex justify-content-center align-items-center">
          <FaCheckCircle className="text-success me-2" />
          <small className="text-muted fw-bold">
            Your reservation will be confirmed instantly
          </small>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default ReservationForm;
