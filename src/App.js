import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavigationBar from './components/Navbar';
import SimpleFooter from './components/SimpleFooter';
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReservationsPage from './pages/ReservationsPage';
import ProfilePage from './pages/ProfilePage';
import ReservePage from './pages/ReservePage';
import './styles/custom.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container d-flex flex-column min-vh-100">
          <NavigationBar />
          <main className="flex-grow-1 d-flex flex-column">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
              <Route path="/restaurants/:restaurantId/reserve" element={<ReservePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/my-reservations" element={<ReservationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
          <SimpleFooter />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
