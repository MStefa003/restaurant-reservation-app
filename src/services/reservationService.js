import api from './api';

// Create a new reservation
export const createReservation = async (reservationData) => {
  try {
    console.log('Creating reservation with data:', JSON.stringify(reservationData));
    // Add headers explicitly to handle potential CORS or content-type issues
    const response = await api.post('/api/reservations', reservationData, {
      headers: {
        'Content-Type': 'application/json',
        // If there's a token in localStorage, include it
        ...(localStorage.getItem('token') ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {})
      }
    });
    console.log('Reservation API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Reservation API error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to create reservation' };
  }
};

// Get user reservations
export const getUserReservations = async () => {
  try {
    console.log('Fetching user reservations');
    // Add explicit authorization header
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found for reservations');
      return [];
    }
    
    const response = await api.get('/api/user/reservations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Reservations response data:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching reservations:', error.response?.data || error.message);
    return [];
  }
};

// Update reservation
export const updateReservation = async (id, reservationData) => {
  try {
    console.log('Calling updateReservation with id:', id, 'and data:', reservationData);
    const response = await api.put(`/api/reservations/${id}`, reservationData);
    console.log('updateReservation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('updateReservation error:', error);
    throw error.response?.data || { message: 'Failed to update reservation' };
  }
};

// Cancel reservation
export const cancelReservation = async (id) => {
  try {
    console.log('Calling cancelReservation with id:', id);
    const response = await api.delete(`/api/reservations/${id}`);
    console.log('cancelReservation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('cancelReservation error:', error);
    throw error.response?.data || { message: 'Failed to cancel reservation' };
  }
};
