require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const DB_NAME = process.env.DB_NAME || 'restaurant_reservation_db';

// Middleware
app.use(cors());
app.use(express.json());

// Database pool (initialized after DB creation)
let pool;

console.log('Connecting to MariaDB database:', DB_NAME, 'as user:', process.env.DB_USER || 'root');

// Verify token middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId || decoded.id;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Initialize database
async function initializeDatabase() {
  // 1. Connect WITHOUT a database to create it if needed
  const tempConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
  });

  await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  console.log(`Database '${DB_NAME}' created or verified`);
  await tempConn.end();

  // 2. Create the main pool WITH the database
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });

  // 3. Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('Users table created or verified');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS restaurants (
      restaurant_id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      location VARCHAR(255) NOT NULL,
      image_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Restaurants table created or verified');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      reservation_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      restaurant_id INT NOT NULL,
      reservation_date DATE NOT NULL,
      reservation_time TIME NOT NULL,
      people_count INT NOT NULL,
      notes TEXT,
      status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
    )
  `);
  console.log('Reservations table created or verified');

  console.log('Database initialization completed successfully');
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.send('Restaurant Reservation API is running');
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email is already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const userId = result.insertId;

    const token = jwt.sign(
      { userId, email, name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, name, email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email is already in use' });
    }
    res.status(500).json({ message: 'Registration failed. Please try again later.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: user.user_id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// ─── USER ─────────────────────────────────────────────────────────────────────

// Get profile
app.get('/api/users/profile', verifyToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, name, email, created_at, updated_at FROM users WHERE user_id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    res.json({
      id: user.user_id,
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// Change password
app.put('/api/users/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [req.userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, req.userId]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

// ─── RESTAURANTS ──────────────────────────────────────────────────────────────

// Get all restaurants (auto-seed if empty)
app.get('/api/restaurants', async (req, res) => {
  try {
    // Check if table is empty and seed sample data
    const [countRows] = await pool.query('SELECT COUNT(*) as count FROM restaurants');
    if (countRows[0].count === 0) {
      console.log('No restaurants found, adding sample data');
      await pool.query(`
        INSERT INTO restaurants (name, description, location, image_url) VALUES
        ('La Bella Italia', 'Authentic Italian cuisine in a cozy atmosphere.', 'Downtown', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'),
        ('Sushi Master', 'Premium Japanese sushi and sashimi prepared by master chefs.', 'Midtown', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c'),
        ('Burger Joint', 'Classic American burgers and fries in a casual setting.', 'Uptown', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'),
        ('Spice of India', 'Authentic Indian cuisine with a modern twist.', 'East Side', 'https://images.unsplash.com/photo-1517244683847-7456b63c5969'),
        ('Le Petit Bistro', 'Charming French bistro serving classic dishes and fine wines.', 'West Side', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0')
      `);
    }

    const [restaurants] = await pool.query('SELECT * FROM restaurants');
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.json([]);
  }
});

// Search restaurants
app.get('/api/restaurants/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchTerm = `%${q}%`;
    const [restaurants] = await pool.query(
      'SELECT * FROM restaurants WHERE name LIKE ? OR location LIKE ? OR description LIKE ?',
      [searchTerm, searchTerm, searchTerm]
    );
    res.json(restaurants);
  } catch (error) {
    console.error('Error searching restaurants:', error);
    res.status(500).json({ message: 'Error searching restaurants' });
  }
});

// Get restaurant by ID
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [restaurants] = await pool.query(
      'SELECT * FROM restaurants WHERE restaurant_id = ?',
      [id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurants[0]);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ message: 'Server error fetching restaurant' });
  }
});

// ─── RESERVATIONS ─────────────────────────────────────────────────────────────

// Create reservation
app.post('/api/reservations', verifyToken, async (req, res) => {
  try {
    const { restaurant_id, reservation_date, reservation_time, people_count, notes } = req.body;

    if (!restaurant_id || !reservation_date || !reservation_time || !people_count) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication error, please login again' });
    }

    // Check restaurant exists
    const [restaurants] = await pool.query(
      'SELECT * FROM restaurants WHERE restaurant_id = ?',
      [restaurant_id]
    );
    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Format date/time
    let formattedDate = reservation_date;
    if (typeof reservation_date === 'string' && !reservation_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      formattedDate = new Date(reservation_date).toISOString().split('T')[0];
    }
    let formattedTime = reservation_time;
    if (typeof reservation_time === 'string' && reservation_time.length === 5) {
      formattedTime = `${reservation_time}:00`;
    }

    const [result] = await pool.query(
      'INSERT INTO reservations (user_id, restaurant_id, reservation_date, reservation_time, people_count, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, restaurant_id, formattedDate, formattedTime, people_count, notes || null]
    );

    const insertedId = result.insertId;

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation_id: insertedId,
      reservation: {
        reservation_id: insertedId,
        user_id: req.userId,
        restaurant_id,
        reservation_date: formattedDate,
        reservation_time: formattedTime,
        people_count,
        notes: notes || null,
        status: 'confirmed',
        restaurant_name: restaurants[0].name
      }
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Server error creating reservation' });
  }
});

// Get user reservations
app.get('/api/user/reservations', verifyToken, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication error, please login again' });
    }

    const [reservations] = await pool.query(`
      SELECT r.*,
        rest.name as restaurant_name,
        rest.location as restaurant_location,
        rest.image_url
      FROM reservations r
      JOIN restaurants rest ON r.restaurant_id = rest.restaurant_id
      WHERE r.user_id = ?
      ORDER BY r.reservation_date DESC, r.reservation_time DESC
    `, [req.userId]);

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ message: 'Server error fetching reservations' });
  }
});

// Update reservation
app.put('/api/reservations/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reservation_date, reservation_time, people_count, notes } = req.body;

    if (!reservation_date || !reservation_time || !people_count) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [reservations] = await pool.query(
      'SELECT * FROM reservations WHERE reservation_id = ? AND user_id = ?',
      [id, req.userId]
    );
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Reservation not found or not authorized' });
    }

    let formattedDate = reservation_date;
    if (typeof reservation_date === 'string' && !reservation_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      formattedDate = new Date(reservation_date).toISOString().split('T')[0];
    }
    let formattedTime = reservation_time;
    if (typeof reservation_time === 'string' && reservation_time.length === 5) {
      formattedTime = `${reservation_time}:00`;
    }

    await pool.query(
      'UPDATE reservations SET reservation_date = ?, reservation_time = ?, people_count = ?, notes = ? WHERE reservation_id = ?',
      [formattedDate, formattedTime, people_count, notes || null, id]
    );

    res.json({
      message: 'Reservation updated successfully',
      reservation: {
        reservation_id: Number(id),
        reservation_date: formattedDate,
        reservation_time: formattedTime,
        people_count,
        notes: notes || null
      }
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ message: 'Server error updating reservation' });
  }
});

// Cancel reservation
app.delete('/api/reservations/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [reservations] = await pool.query(
      'SELECT * FROM reservations WHERE reservation_id = ? AND user_id = ?',
      [id, req.userId]
    );
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Reservation not found or not authorized' });
    }

    await pool.query(
      'UPDATE reservations SET status = "cancelled" WHERE reservation_id = ?',
      [id]
    );

    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: 'Server error cancelling reservation' });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
  });
