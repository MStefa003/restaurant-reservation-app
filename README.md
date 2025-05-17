# Restaurant Reservation Application

![React](https://img.shields.io/badge/React-v18-blue)
![Node.js](https://img.shields.io/badge/Node.js-v16-green)
![MariaDB](https://img.shields.io/badge/MariaDB-v10-orange)

A full-stack web application for restaurant table reservations built with React frontend and Node.js/Express backend.

## Features

- User authentication (register/login)
- Browse and search restaurants
- Make table reservations
- Manage reservation history
- Responsive design

## Setup Instructions

### Prerequisites
- Node.js (v14+) and npm
- MariaDB (v10+)

### Quick Start

1. **Clone and install packages**
   ```bash
   git clone https://github.com/MStefa003/restaurant-reservation-app.git
   cd restaurant-reservation-app
   npm install
   cd server
   npm install
   cd ..
   ```

2. **Set up database**
   ```bash
   # Start MariaDB and create database
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE restaurant_reservation_db;
   EXIT;
   ```
   ```bash
   # Import schema
   mysql -u root -p restaurant_reservation_db < server/database.sql
   ```

3. **Configure environment**
   Create a file named `.env` in the server directory with:
   ```
   PORT=5001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=restaurant_reservation_db
   JWT_SECRET=jwt_secret_key
   ```
   *Note: Replace root with your MariaDB username/password if different*

4. **Run the application**

   Start backend server:
   ```bash
   cd server
   npm start
   ```

   In a new terminal, start frontend:
   ```bash
   # From project root
   npm start
   ```

   Or run both concurrently:
   ```bash
   # From project root
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## Author

Marios Stefanidis
