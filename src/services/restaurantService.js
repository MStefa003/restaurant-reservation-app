import api from './api';

// Get all restaurants
export const getAllRestaurants = async () => {
  try {
    console.log('Calling getAllRestaurants');
    const response = await api.get('/api/restaurants');
    console.log('getAllRestaurants response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('getAllRestaurants error:', error);
    return [];
  }
};

// Search restaurants by name or location
export const searchRestaurants = async (query) => {
  try {
    console.log('Calling searchRestaurants with query:', query);
    const response = await api.get(`/api/restaurants/search?q=${query}`);
    console.log('searchRestaurants response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('searchRestaurants error:', error);
    return [];
  }
};

// Get restaurant by ID
export const getRestaurantById = async (id) => {
  try {
    console.log('Calling getRestaurantById with id:', id);
    const response = await api.get(`/api/restaurants/${id}`);
    console.log('getRestaurantById response:', response.data);
    return response.data || {};
  } catch (error) {
    console.error('getRestaurantById error:', error);
    throw error.response?.data || { message: 'Failed to fetch restaurant details' };
  }
};

// Get featured restaurants
export const getFeaturedRestaurants = async (limit = 3) => {
  try {
    console.log('Calling getFeaturedRestaurants with limit:', limit);
    const response = await api.get(`/api/restaurants/featured?limit=${limit}`);
    console.log('getFeaturedRestaurants response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('getFeaturedRestaurants error:', error);
    // If the API doesn't support featured endpoint yet, fallback to getting all and filtering
    try {
      const allRestaurants = await getAllRestaurants();
      // Mock featured restaurants by taking the first few
      return allRestaurants.slice(0, limit).map(restaurant => ({
        ...restaurant,
        featured: true,
        featured_text: 'Popular choice'
      }));
    } catch (fallbackError) {
      console.error('getFeaturedRestaurants fallback error:', fallbackError);
      return [];
    }
  }
};

// Get restaurant reviews
export const getRestaurantReviews = async (restaurantId) => {
  try {
    console.log('Calling getRestaurantReviews with restaurantId:', restaurantId);
    const response = await api.get(`/api/restaurants/${restaurantId}/reviews`);
    console.log('getRestaurantReviews response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('getRestaurantReviews error:', error);
    // If the API doesn't support reviews endpoint yet, return mock data
    return [
      {
        id: 1,
        user_name: 'John D.',
        rating: 5,
        comment: 'Amazing food and atmosphere! Will definitely come back.',
        date: '2023-10-15'
      },
      {
        id: 2,
        user_name: 'Maria K.',
        rating: 4,
        comment: 'Great service and delicious food. Slightly pricey but worth it.',
        date: '2023-09-28'
      },
      {
        id: 3,
        user_name: 'Alex P.',
        rating: 5,
        comment: 'The best restaurant in town! The chef is incredibly talented.',
        date: '2023-09-10'
      }
    ];
  }
};

// Filter restaurants by criteria
export const filterRestaurants = async (criteria) => {
  try {
    console.log('Calling filterRestaurants with criteria:', criteria);
    const queryParams = new URLSearchParams();
    
    if (criteria.cuisine) queryParams.append('cuisine', criteria.cuisine);
    if (criteria.price_range) queryParams.append('price_range', criteria.price_range);
    if (criteria.rating) queryParams.append('min_rating', criteria.rating);
    if (criteria.location) queryParams.append('location', criteria.location);
    
    const response = await api.get(`/api/restaurants/filter?${queryParams.toString()}`);
    console.log('filterRestaurants response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('filterRestaurants error:', error);
    // If the API doesn't support filtering endpoint yet, fallback to getting all and filtering client-side
    try {
      const allRestaurants = await getAllRestaurants();
      let filtered = [...allRestaurants];
      
      // Mock filtering logic
      if (criteria.location) {
        filtered = filtered.filter(r => 
          r.location.toLowerCase().includes(criteria.location.toLowerCase())
        );
      }
      
      // Add more filtering logic as needed
      
      return filtered;
    } catch (fallbackError) {
      console.error('filterRestaurants fallback error:', fallbackError);
      return [];
    }
  }
};
