import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getCurrentUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token expired
            logout();
          } else {
            // Valid token - first try to get user data from localStorage
            const storedUserData = localStorage.getItem('userData');
            if (storedUserData) {
              try {
                const userData = JSON.parse(storedUserData);
                setCurrentUser(userData);
                setIsAuthenticated(true);
                setLoading(false);
                return;
              } catch (error) {
                console.error('Error parsing stored user data', error);
                // Continue to API call if parsing fails
              }
            }
            
            // If no stored data, try to get full user data from API
            try {
              const userData = await getCurrentUser();
              setCurrentUser(userData);
            } catch (error) {
              // If API call fails, fall back to token data
              console.log('Could not fetch user profile, using token data instead');
              setCurrentUser(decodedToken);
            }
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Invalid token', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, loading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
