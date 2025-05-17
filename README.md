<div align="center">

# 🍽️ Restaurant Reservation Application

[![React](https://img.shields.io/badge/React-v18-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v16-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4-lightgrey)](https://expressjs.com/)
[![MariaDB](https://img.shields.io/badge/MariaDB-v10-orange)](https://mariadb.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-v5-purple)](https://getbootstrap.com/)

</div>

<p align="center">
  <strong style="font-size: 24px;">Modern Restaurant Reservation Platform</strong>
</p>

A modern, full-stack web application for managing restaurant table reservations. This elegant platform provides a premium user experience with a responsive design, intuitive reservation workflow, and seamless restaurant discovery.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Installation Guide](#-installation-guide)
- [Usage Instructions](#-usage-instructions)
- [API Documentation](#-api-documentation)
- [Security Features](#-security-features)
- [Screenshots](#-screenshots)
- [Author](#-author)

## ✨ Features

- **User Authentication**
  - Secure register/login system with JWT
  - Enhanced profile page with modern UI design
  - Persistent user sessions with localStorage

- **Restaurant Management**
  - Browse and search restaurant listings
  - View detailed restaurant information
  - Sort and filter options

- **Premium Reservation Experience**
  - Elegant, dark-themed reservation form
  - Interactive party size selection
  - Special requests section with informational notes
  - Instant confirmation with verification badges

- **Reservation Management**
  - View and manage reservation history
  - Update or cancel existing reservations
  - Clean, streamlined reservation cards

- **Responsive Design**
  - Mobile-friendly interface
  - Consistent experience across devices

## 🛠️ Tech Stack

<table>
  <tr>
    <td valign="top">
      <h3>Frontend</h3>
      <ul>
        <li><strong>React.js</strong> - Component-based UI development</li>
        <li><strong>React Router</strong> - Navigation and routing</li>
        <li><strong>Bootstrap</strong> - UI framework for responsive design</li>
        <li><strong>Axios</strong> - Promise-based HTTP client</li>
        <li><strong>Context API</strong> - State management</li>
      </ul>
    </td>
    <td valign="top">
      <h3>Backend</h3>
      <ul>
        <li><strong>Node.js</strong> - JavaScript runtime</li>
        <li><strong>Express</strong> - Web framework</li>
        <li><strong>MariaDB</strong> - Relational database</li>
        <li><strong>JWT</strong> - Authentication tokens</li>
        <li><strong>bcrypt</strong> - Password hashing</li>
        <li><strong>dotenv</strong> - Environment variable management</li>
      </ul>
    </td>
  </tr>
</table>

## 🚀 Installation Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or later) and npm - [Download](https://nodejs.org/)
- **MariaDB** (v10 or later) - [Download](https://mariadb.org/download/)
- **Git** (optional, for cloning) - [Download](https://git-scm.com/downloads)

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/MStefa003/restaurant-reservation-app.git

# Navigate into the project directory
cd restaurant-reservation-app
```

Alternatively, you can download the ZIP file from GitHub and extract it.

### Step 2: Database Setup

1. Start your MariaDB server
2. Create a new database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE restaurant_reservation_db;
EXIT;
```

3. Import the database schema and initial data:

```bash
mysql -u root -p restaurant_reservation_db < server/database.sql
```

### Step 3: Backend Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Install the backend dependencies:

```bash
npm install
```

3. Create a `.env` file in the server directory with the following content:

```
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=restaurant_reservation_db
JWT_SECRET=jwt_secret_key
```

> ⚠️ **Note**: Replace `root` with your actual MariaDB username and password if different. For production, use a strong, unique JWT_SECRET.

4. Start the backend server:

```bash
npm start
```

The server should be running at http://localhost:5001

### Step 4: Frontend Setup

1. Open a new terminal window and navigate back to the project root:

```bash
# If you're in the server directory
cd ..
```

2. Install the frontend dependencies:

```bash
npm install
```

3. Start the frontend development server:

```bash
npm start
```

The application should automatically open in your default browser at http://localhost:3000

## 🔍 Usage Instructions

### Running Both Frontend and Backend Simultaneously

For development, you can run both the frontend and backend concurrently using:

```bash
# From the project root
npm run dev
```

This command starts both servers with a single command.

### User Registration and Login

1. Navigate to the Register page
2. Create an account with your name, email, and password
3. Log in with your credentials
4. Your session will persist across page refreshes

### Making a Reservation

1. Browse the list of available restaurants
2. Click on a restaurant to view details
3. Click "Make Reservation"
4. Select date, time, party size, and add any special requests
5. Submit the reservation form
6. View your confirmed reservation in your profile

### Managing Reservations

1. Navigate to your profile page
2. View all your current and past reservations
3. Cancel or modify existing reservations as needed

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Success Response |
|--------|----------|-------------|--------------|------------------|
| POST | `/api/auth/register` | Register a new user | `{name, email, password}` | `{token, user}` |
| POST | `/api/auth/login` | Login a user | `{email, password}` | `{token, user}` |
| GET | `/api/users/profile` | Get user profile | Auth Header | `{user}` |

### Restaurant Endpoints

| Method | Endpoint | Description | Request Body | Success Response |
|--------|----------|-------------|--------------|------------------|
| GET | `/api/restaurants` | Get all restaurants | - | `[{restaurants}]` |
| GET | `/api/restaurants/:id` | Get restaurant by ID | - | `{restaurant}` |

### Reservation Endpoints

| Method | Endpoint | Description | Request Body | Success Response |
|--------|----------|-------------|--------------|------------------|
| POST | `/api/reservations` | Create a reservation | `{restaurantId, date, time, people}` | `{reservation}` |
| GET | `/api/user/reservations` | Get user reservations | Auth Header | `[{reservations}]` |
| PUT | `/api/reservations/:id` | Update a reservation | `{date, time, people}` | `{reservation}` |
| DELETE | `/api/reservations/:id` | Cancel a reservation | - | `{message}` |

## 🔒 Security Features

- **Password Security**: All passwords are hashed using bcrypt before storage
- **JWT Authentication**: Secure API access with JSON Web Tokens
- **Environment Variables**: Sensitive database credentials protected
- **Input Validation**: Server-side validation prevents malicious inputs
- **Protected Routes**: Frontend and backend routes secured against unauthorized access

## 📸 Key Visual Features

### Premium UI Components

- **Dark-themed Reservation Form** with elegant typography and circular icon badges
- **Enhanced Profile Page** with improved visual hierarchy and user information display
- **Restaurant Cards** with consistent styling and clear call-to-action buttons
- **Streamlined Reservation Cards** with essential information prominently displayed

### Responsive Design

The application is fully responsive across devices:
- Mobile-friendly navigation
- Adaptive layouts for different screen sizes
- Touch-optimized interactive elements
- Consistent styling across all pages

## 📄 License

This project was created for educational purposes as part of a university assignment.

## 👨‍💻 Author

**Marios Stefanidis**

For questions or feedback, please open an issue on the GitHub repository.
