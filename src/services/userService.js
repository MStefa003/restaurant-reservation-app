import api from './api';

// Get user profile
export const getUserProfile = async () => {
  try {
    console.log('Calling getUserProfile');
    const response = await api.get('/api/users/profile');
    console.log('getUserProfile response:', response.data);
    return response.data || {};
  } catch (error) {
    console.error('getUserProfile error:', error);
    return {};
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    console.log('Calling updateUserProfile with data:', userData);
    const response = await api.put('/api/users/profile', userData);
    console.log('updateUserProfile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('updateUserProfile error:', error);
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    console.log('Calling changePassword');
    const response = await api.put('/api/users/change-password', passwordData);
    console.log('changePassword response:', response.data);
    return response.data;
  } catch (error) {
    console.error('changePassword error:', error);
    throw error.response?.data || { message: 'Failed to change password' };
  }
};

// Delete account
export const deleteAccount = async () => {
  try {
    console.log('Calling deleteAccount');
    const response = await api.delete('/api/users/account');
    console.log('deleteAccount response:', response.data);
    return response.data;
  } catch (error) {
    console.error('deleteAccount error:', error);
    throw error.response?.data || { message: 'Failed to delete account' };
  }
};
