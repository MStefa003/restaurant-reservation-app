require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mariadb = require('mariadb');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const DB_NAME = process.env.DB_NAME || 'restaurant_reservation_db';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: DB_NAME,
  connectionLimit: 10
});

console.log('Connecting to MariaDB database:', DB_NAME, 'as user:', process.env.DB_USER || 'root');

// Verify token middleware
const verifyToken = (req, res, next) => {
  console.log('verifyToken middleware called');
  
  // Get token from header
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token found or invalid format');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  // Extract token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully:', decoded);
    
    // Add user ID to request (support both id and userId fields)
    req.userId = decoded.userId || decoded.id;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Initialize database
async function initializeDatabase() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    // Create users table
    await conn.query(`
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
    
    // Create restaurants table
    await conn.query(`
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
    
    // Create reservations table
    await conn.query(`
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
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    if (conn) conn.release();
  }
}

// Routes
app.get('/', (req, res) => {
  res.send('Restaurant Reservation API is running');
});

// --- AUTHENTICATION ENDPOINTS ---
// Register user
app.post('/api/auth/register', async (req, res) => {
  let conn;
  try {
    console.log('Registration attempt with data:', { ...req.body, password: '****' });
    
    const { name, email, password } = req.body;
    
    // Input validation
    if (!name || !email || !password) {
      console.log('Registration failed: Missing required fields');
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Registration failed: Invalid email format');
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Password strength validation
    if (password.length < 6) {
      console.log('Registration failed: Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    conn = await pool.getConnection();
    
    // Check if user already exists
    const users = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length > 0) {
      console.log('Registration failed: Email already in use');
      return res.status(409).json({ message: 'Email is already in use' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Inserting new user into database');
    
    // Use a simpler approach for inserting the user and getting the ID
    await conn.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
      [name, email, hashedPassword]
    );
    
    // Get the newly created user
    const newUsers = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (newUsers.length === 0) {
      throw new Error('User could not be found after creation');
    }
    
    const user = newUsers[0];
    console.log('User registered successfully:', { name, email, id: user.user_id });
    
    // Generate token for auto-login
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.email,
        name: user.name 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    // Return success with token for immediate login
    return res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // More specific error handling
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email is already in use' });
    }
    
    // Generic server error
    res.status(500).json({ message: 'Registration failed. Please try again later.' });
  } finally {
    if (conn) conn.release();
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  let conn;
  try {
    const { email, password } = req.body;
    console.log('Login attempt with email:', email);
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    conn = await pool.getConnection();
    // Find user
    const users = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      console.log('User not found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.email,
        name: user.name 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log('User logged in successfully:', { id: user.user_id, email: user.email });
    
    return res.json({
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  } finally {
    if (conn) conn.release();
  }
});
// --- END AUTHENTICATION ENDPOINTS ---

// Get user profile
app.get('/api/users/profile', verifyToken, async (req, res) => {
  let conn;
  try {
    console.log('GET /api/users/profile endpoint called for user ID:', req.userId);
    
    conn = await pool.getConnection();
    
    // Get user profile
    const [users] = await conn.query(
      'SELECT user_id, name, email, created_at, updated_at FROM users WHERE user_id = ?',
      [req.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Returning user profile:', users[0]);
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  } finally {
    if (conn) conn.release();
  }
});

// Change user password
app.put('/api/users/change-password', verifyToken, async (req, res) => {
  let conn;
  try {
    console.log('Change password request for user ID:', req.userId);
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }
    
    conn = await pool.getConnection();
    
    // Find user
    const users = await conn.query('SELECT * FROM users WHERE user_id = ?', [req.userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await conn.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, req.userId]);
    
    console.log('Password changed successfully for user ID:', req.userId);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error changing password' });
  } finally {
    if (conn) conn.release();
  }
});

// Get all restaurants
app.get('/api/restaurants', async (req, res) => {
  let conn;
  try {
    console.log('GET /api/restaurants endpoint called');
    
    conn = await pool.getConnection();
    
    // --- DEBUG: Print DB connection info ---
    console.log('Connecting to DB:', process.env.DB_NAME, process.env.DB_USER, process.env.DB_HOST);
    // --- END DEBUG ---
    
    // Check if restaurants table exists
    const tables = await conn.query(`
      SELECT * FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'restaurants'`, 
      [DB_NAME]
    );
    console.log('Tables check result:', tables);
    if (tables.length === 0) {
      console.log('Restaurants table does not exist, returning empty array');
      return res.json([]);
    }
    
    // Check if restaurants table is empty
    const countArr = await conn.query('SELECT COUNT(*) as count FROM restaurants');
    const count = countArr[0]?.count || 0;
    console.log('Restaurant count:', countArr[0]);
    if (count === 0) {
      console.log('No restaurants found, adding sample data');
      
      // Add sample restaurants
      await conn.query(`
        INSERT INTO restaurants (name, description, location, image_url) VALUES
        ('La Bella Italia', 'Authentic Italian cuisine in a cozy atmosphere.', 'Downtown', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'),
        ('Sushi Master', 'Premium Japanese sushi and sashimi prepared by master chefs.', 'Midtown', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c'),
        ('Burger Joint', 'Classic American burgers and fries in a casual setting.', 'Uptown', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'),
        ('Spice of India', 'Authentic Indian cuisine with a modern twist.', 'East Side', 'https://images.unsplash.com/photo-1517244683847-7456b63c5969'),
        ('Le Petit Bistro', 'Charming French bistro serving classic dishes and fine wines.', 'West Side', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0')
      `);
      console.log('Sample restaurants added');
    }
    
    const restaurants = await conn.query('SELECT * FROM restaurants');
    console.log(`Found ${restaurants.length} restaurants`, restaurants);
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.json([]);
  } finally {
    if (conn) conn.release();
  }
});

// Search restaurants
app.get('/api/restaurants/search', async (req, res) => {
  let conn;
  try {
    const { q } = req.query;
    console.log(`GET /api/restaurants/search endpoint called with query: ${q}`);
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchTerm = `%${q}%`;
    
    conn = await pool.getConnection();
    const restaurants = await conn.query(
      'SELECT * FROM restaurants WHERE name LIKE ? OR location LIKE ? OR description LIKE ?',
      [searchTerm, searchTerm, searchTerm]
    );
    
    console.log(`Returning ${restaurants.length} restaurants from search`);
    res.json(restaurants);
  } catch (error) {
    console.error('Error searching restaurants:', error);
    res.status(500).json({ message: 'Error searching restaurants' });
  } finally {
    if (conn) conn.release();
  }
});

// Get restaurant by ID
app.get('/api/restaurants/:id', async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    
    conn = await pool.getConnection();
    const [restaurants] = await conn.query(
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
  } finally {
    if (conn) conn.release();
  }
});

// Create reservation
app.post('/api/reservations', verifyToken, async (req, res) => {
  let conn;
  try {
    console.log('POST /api/reservations endpoint called for user ID:', req.userId);
    console.log('Reservation data:', req.body);
    
    const { restaurant_id, reservation_date, reservation_time, people_count, notes } = req.body;
    
    if (!restaurant_id || !reservation_date || !reservation_time || !people_count) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    if (!req.userId) {
      console.error('User ID is undefined in reservation request');
      return res.status(401).json({ message: 'Authentication error, please login again' });
    }
    
    conn = await pool.getConnection();
    
    // Check if restaurant exists
    const restaurants = await conn.query(
      'SELECT * FROM restaurants WHERE restaurant_id = ?',
      [restaurant_id]
    );
    
    if (restaurants.length === 0) {
      console.error(`Restaurant with ID ${restaurant_id} not found`);
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    console.log('Restaurant found, creating reservation');
    
    // Format date and time properly
    let formattedDate = reservation_date;
    if (typeof reservation_date === 'string' && !reservation_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      formattedDate = new Date(reservation_date).toISOString().split('T')[0];
    }
    
    let formattedTime = reservation_time;
    if (typeof reservation_time === 'string' && reservation_time.length === 5) {
      formattedTime = `${reservation_time}:00`;
    }
    
    console.log(`Creating reservation for user ${req.userId} at restaurant ${restaurant_id} on ${formattedDate} at ${formattedTime}`);
    
    // Create reservation
    try {
      const result = await conn.query(
        'INSERT INTO reservations (user_id, restaurant_id, reservation_date, reservation_time, people_count, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [req.userId, restaurant_id, formattedDate, formattedTime, people_count, notes || null]
      );
      
      console.log('Reservation created successfully with ID:', result.insertId);
      
      // Respond with the complete reservation data
      const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;
      
      res.status(201).json({
        message: 'Reservation created successfully',
        reservation_id: insertedId,
        reservation: {
          reservation_id: insertedId,
          user_id: req.userId,
          restaurant_id: restaurant_id,
          reservation_date: formattedDate,
          reservation_time: formattedTime,
          people_count: people_count,
          notes: notes || null,
          status: 'confirmed',
          restaurant_name: restaurants[0].name
        }
      });
    } catch (insertError) {
      console.error('Database error creating reservation:', insertError);
      return res.status(500).json({ message: 'Failed to create reservation in database' });
    }
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Server error creating reservation' });
  } finally {
    if (conn) conn.release();
  }
});

// Get user reservations
  /**
   * Handles GET /api/user/reservations endpoint
   * 
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * 
   * @description
   * Fetches a list of reservations for the currently logged-in user.
   * 
   * @returns {Promise<void>} - Resolves with the response sent to the client
   */
app.get('/api/user/reservations', verifyToken, async (req, res) => {
  let conn;
  try {
    console.log('GET /api/user/reservations endpoint called for user ID:', req.userId);
    
    if (!req.userId) {
      console.error('User ID is undefined in user reservations request');
      return res.status(401).json({ message: 'Authentication error, please login again' });
    }
    
    conn = await pool.getConnection();
    
    // Get user reservations with restaurant info
    const reservations = await conn.query(`
      SELECT r.*, 
        rest.name as restaurant_name, 
        rest.location as restaurant_location,
        rest.image_url
      FROM reservations r
      JOIN restaurants rest ON r.restaurant_id = rest.restaurant_id
      WHERE r.user_id = ?
      ORDER BY r.reservation_date DESC, r.reservation_time DESC
    `, [req.userId]);
    
    console.log(`Found ${reservations.length} reservations for user ID: ${req.userId}`);
    
    // Explicitly convert BigInt values to numbers for JSON serialization
    const sanitizedReservations = reservations.map(reservation => {
      const sanitized = {};
      for (const [key, value] of Object.entries(reservation)) {
        sanitized[key] = typeof value === 'bigint' ? Number(value) : value;
      }
      return sanitized;
    });
    
    res.json(sanitizedReservations);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ message: 'Server error fetching reservations' });
  } finally {
    if (conn) conn.release();
  }
});

// Update reservation
app.put('/api/reservations/:id', verifyToken, async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const { reservation_date, reservation_time, people_count, notes } = req.body;
    
    console.log(`Update reservation request for ID: ${id} by user: ${req.userId}`);
    console.log('Update data:', req.body);
    
    if (!reservation_date || !reservation_time || !people_count) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    conn = await pool.getConnection();
    
    // Check if reservation exists and belongs to user
    const reservations = await conn.query(
      'SELECT * FROM reservations WHERE reservation_id = ? AND user_id = ?',
      [id, req.userId]
    );
    
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Reservation not found or not authorized' });
    }
    
    // Format date and time properly
    let formattedDate = reservation_date;
    if (typeof reservation_date === 'string' && !reservation_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      formattedDate = new Date(reservation_date).toISOString().split('T')[0];
    }
    
    let formattedTime = reservation_time;
    if (typeof reservation_time === 'string' && reservation_time.length === 5) {
      formattedTime = `${reservation_time}:00`;
    }
    
    // Update reservation
    await conn.query(
      'UPDATE reservations SET reservation_date = ?, reservation_time = ?, people_count = ?, notes = ? WHERE reservation_id = ?',
      [formattedDate, formattedTime, people_count, notes || null, id]
    );
    
    console.log(`Reservation ${id} updated successfully`);
    
    res.json({ 
      message: 'Reservation updated successfully',
      reservation: {
        reservation_id: Number(id),
        reservation_date: formattedDate,
        reservation_time: formattedTime,
        people_count: people_count,
        notes: notes || null
      }
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ message: 'Server error updating reservation' });
  } finally {
    if (conn) conn.release();
  }
});

// Cancel reservation
app.delete('/api/reservations/:id', verifyToken, async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    
    conn = await pool.getConnection();
    
    // Check if reservation exists and belongs to user
    const [reservations] = await conn.query(
      'SELECT * FROM reservations WHERE reservation_id = ? AND user_id = ?',
      [id, req.userId]
    );
    
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Reservation not found or not authorized' });
    }
    
    // Update reservation status to cancelled
    await conn.query(
      'UPDATE reservations SET status = "cancelled" WHERE reservation_id = ?',
      [id]
    );
    
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: 'Server error cancelling reservation' });
  } finally {
    if (conn) conn.release();
  }
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
  });
