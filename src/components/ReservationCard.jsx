import React, { useState } from 'react';
import { Card, Button, Badge, Modal } from 'react-bootstrap';
import { cancelReservation } from '../services/reservationService';

const ReservationCard = ({ reservation, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await cancelReservation(reservation.reservation_id);
      setShowModal(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge bg="success">Confirmed</Badge>;
      case 'pending':
        return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Check if reservation is in the future
  const isFuture = () => {
    const today = new Date();
    const reservationDate = new Date(reservation.reservation_date);
    return reservationDate >= today;
  };

  return (
    <>
      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <Card.Title>{reservation.restaurant_name}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{reservation.location}</Card.Subtitle>
            </div>
            <div>
              {getStatusBadge(reservation.status)}
            </div>
          </div>
          
          <Card.Text>
            <strong>Date:</strong> {formatDate(reservation.reservation_date)}<br />
            <strong>Time:</strong> {formatTime(reservation.reservation_time)}<br />
            <strong>People:</strong> {reservation.people_count}
          </Card.Text>
          
          {isFuture() && reservation.status !== 'cancelled' && (
            <div className="d-flex justify-content-end">
              <Button 
                variant="outline-danger" 
                size="sm" 
                onClick={() => setShowModal(true)}
              >
                Cancel Reservation
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Reservation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel your reservation at {reservation.restaurant_name} on {formatDate(reservation.reservation_date)} at {formatTime(reservation.reservation_time)}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            No, Keep It
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReservationCard;
