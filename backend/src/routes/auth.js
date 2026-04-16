const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateUser: authenticateLDAP } = require('../config/ldap');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register - Admin only (for fallback local users)
router.post(
  '/register',
  authenticateToken,
  [
    body('email').isEmail(),
    body('fullName').notEmpty(),
    body('organization').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only admins can register users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can register users' });
    }

    const { email, fullName, organization, role = 'developer' } = req.body;

    try {
      const existingUser = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const result = await db.query(
        'INSERT INTO users (email, password, full_name, organization, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role',
        [email, 'MANUAL_REGISTRATION', fullName, organization, role]
      );

      const user = result.rows[0];

      res.status(201).json({
        user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
        message: 'User registered successfully. User will authenticate via AD on first login.',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Login - Active Directory or Local Authentication
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username/Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Check if AD is configured
      const isADConfigured = process.env.LDAP_URL && 
                             !process.env.LDAP_URL.includes('localhost') &&
                             process.env.LDAP_BIND_DN && 
                             process.env.LDAP_BIND_PASSWORD;

      let user = null;
      let email = username;
      let fullName = username;
      let organization = 'General';
      let role = 'developer';

      if (isADConfigured) {
        try {
          // Try Active Directory authentication
          console.log('Attempting AD authentication for:', username);
          const adUser = await authenticateLDAP(username, password);

          // Extract user information from AD
          email = adUser.mail || `${username}@company.com`;
          fullName = adUser.displayName || username;
          organization = adUser.department || 'General';
          const adGroups = adUser.groups || [];

          // Determine role based on AD group membership
          if (adGroups.some((g) => g.includes('Admin'))) {
            role = 'admin';
          } else if (adGroups.some((g) => g.includes('Maintainer'))) {
            role = 'maintainer';
          }

          // Check if user exists in our database
          let dbUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);

          if (dbUser.rows.length === 0) {
            // Create new user from AD
            const createUserResult = await db.query(
              'INSERT INTO users (email, password, full_name, organization, role, ad_username) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, full_name, role, organization',
              [email, 'AD_AUTHENTICATED', fullName, organization, role, username]
            );
            user = createUserResult.rows[0];
          } else {
            // Update user info from AD
            await db.query(
              'UPDATE users SET full_name = $1, organization = $2, role = $3, ad_username = $4 WHERE email = $5',
              [fullName, organization, role, username, email]
            );
            user = dbUser.rows[0];
            user.full_name = fullName;
            user.organization = organization;
            user.role = role;
          }
        } catch (adError) {
          console.log('AD authentication failed:', adError.message);
          console.log('Falling back to local authentication...');
          
          // Fall back to local authentication
          const dbResult = await db.query(
            'SELECT * FROM users WHERE email = $1 OR email LIKE $2',
            [username, username + '%']
          );

          if (dbResult.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
          }

          user = dbResult.rows[0];

          // Verify password with bcrypt
          const validPassword = await bcrypt.compare(password, user.password);
          if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }
        }
      } else {
        // Local authentication only (AD not configured)
        console.log('AD not configured, using local authentication');
        
        // Try email or username lookup
        const dbResult = await db.query(
          'SELECT * FROM users WHERE email = $1 OR email LIKE $2',
          [username, username + '%']
        );

        if (dbResult.rows.length === 0) {
          return res.status(401).json({ error: 'User not found' });
        }

        user = dbResult.rows[0];

        // Verify password with bcrypt
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '24h' }
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          organization: user.organization,
        },
        token,
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(401).json({ error: error.message || 'Authentication failed' });
    }
  }
);

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, full_name, organization, role, created_at, ad_username FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Logout
router.post('/logout', authenticateToken, (req, res) => {
  // JWT is stateless, logout is handled client-side
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
