# Restaurant Reservation Application

![React](https://img.shields.io/badge/React-v18-blue)
![Node.js](https://img.shields.io/badge/Node.js-v16-green)
![Express](https://img.shields.io/badge/Express-v4-lightgrey)
![MariaDB](https://img.shields.io/badge/MariaDB-v10-orange)
![Bootstrap](https://img.shields.io/badge/Bootstrap-v5-purple)

A modern, full-stack web application for managing restaurant table reservations. The system features a React frontend with enhanced UI design and a Node.js/Express backend connected to a MariaDB database.

## Application Overview

This application allows users to browse restaurants, make reservations, and manage their booking history. The interface is designed to be intuitive and responsive across different devices.

## Key Features

- **User Authentication**: Secure login/register system with JWT tokens
- **Restaurant Discovery**: Browse restaurants with detailed information
- **Reservation System**: Make, view, and manage table reservations
- **Enhanced UI**: Modern design with premium reservation form and profile pages
- **Responsive Design**: Mobile-friendly interface that works on all devices

## Setup Instructions

### Prerequisites
- Node.js (v14+) and npm
- MariaDB (v10+)

### Step 1: Get the Code

```bash
# Clone the repository
git clone https://github.com/MStefa003/restaurant-reservation-app.git
cd restaurant-reservation-app

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Database Setup

```bash
# Start MariaDB and create database
mysql -u root -p
```

```sql
CREATE DATABASE restaurant_reservation_db;
EXIT;
```

```bash
# Import database schema and initial data
mysql -u root -p restaurant_reservation_db < server/database.sql
```

### Step 3: Environment Configuration

Create a file named `.env` in the server directory with:

```
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=restaurant_reservation_db
JWT_SECRET=jwt_secret_key
```

*Note: Replace the database credentials with your actual MariaDB username/password if different*

### Step 4: Start the Application

**Start the backend server** (either command works):
```bash
cd server
node server.js
```
OR
```bash
cd server
npm start
```

**In a new terminal, start the frontend**:
```bash
# From project root directory
npm start
```

**Run both concurrently** (for development):
```bash
# From project root directory
npm run dev
```

### Step 5: Access the Application
- Frontend interface: http://localhost:3000
- Backend API: http://localhost:5001

## Using the Application

1. Register a new account or log in
2. Browse available restaurants
3. Click on a restaurant to view details
4. Use the reservation form to book a table
5. View and manage your reservations in the profile section

## Project Structure

- `/src` - React frontend components and services
- `/server` - Express backend with API endpoints
- `/public` - Static assets

## Technical Details

- Frontend: React with Bootstrap for styling
- Backend: Node.js with Express framework
- Database: MariaDB for data storage
- Authentication: JWT-based user authentication

- 
