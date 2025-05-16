# 🍽️ Restaurant Reservation Application

![React](https://img.shields.io/badge/React-v18-blue)
![Node.js](https://img.shields.io/badge/Node.js-v16-green)
![Express](https://img.shields.io/badge/Express-v4-lightgrey)
![MariaDB](https://img.shields.io/badge/MariaDB-v10-orange)

A modern, full-stack web application for managing restaurant table reservations. This elegant platform provides a premium user experience with a responsive design, intuitive reservation workflow, and seamless restaurant discovery.

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

### Frontend
- **React.js** - Component-based UI development
- **React Router** - Navigation and routing
- **Bootstrap** - UI framework for responsive design
- **Axios** - Promise-based HTTP client
- **JWT** - Secure authentication
- **Context API** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MariaDB** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **dotenv** - Environment variable management

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or later) and npm installed
- MariaDB server installed and running

### Database Setup
1. Create a MariaDB database:
   ```sql
   CREATE DATABASE restaurant_reservation_db;
   ```
2. Import the schema from `server/database.sql`:
   ```
   mysql -u root -p restaurant_reservation_db < server/database.sql
   ```

### Server Setup
1. Navigate to the server directory:
   ```
   cd server
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=restaurant_reservation_db
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the server:
   ```
   npm start
   ```

### Frontend Setup
1. From the project root, install dependencies:
   ```
   npm install
   ```
2. Start the React application:
   ```
   npm start
   ```
3. The application will open in your browser at `http://localhost:3000`

## 🔄 Running the Full Application

You can run both the client and server concurrently:

1. Install all dependencies:
   ```
   npm install && cd server && npm install && cd ..
   ```
2. From the project root, run:
   ```
   npm run dev
   ```

## 📱 Application Features

### User Interface
The application features a professionally designed interface with:
- Enhanced profile page with improved visual hierarchy
- Premium dark-themed reservation form with circular icon badges
- Responsive navigation with persistent user information
- Elegant typography and consistent design language

### Reservation Workflow
The reservation system provides a seamless experience:
1. Browse available restaurants
2. Select a restaurant to view details
3. Choose date, time, and party size using the premium reservation form
4. Add optional special requests
5. Receive immediate confirmation
6. Manage reservations through user dashboard

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/users/profile` - Get user profile information

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID

### Reservations
- `POST /api/reservations` - Create a new reservation
- `GET /api/user/reservations` - Get user's reservations
- `PUT /api/reservations/:id` - Update a reservation
- `DELETE /api/reservations/:id` - Cancel a reservation

## 🔒 Security Considerations

- All passwords are hashed using bcrypt
- Authentication is handled via JWT tokens
- Environment variables protect sensitive database credentials
- Frontend stores minimal user information in localStorage

---

## 📝 License
This project was created for educational purposes as part of a university assignment.

## 👨‍💻 Author
[Marios Stefanidis]
