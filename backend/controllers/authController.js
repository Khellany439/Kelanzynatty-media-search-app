/**
 * Authentication Controller Module
 * 
 * Handles user authentication flows with enhanced security and TypeScript support.
 * Implements modern security practices including password hashing, JWT tokens,
 * and comprehensive input validation.
 * 
 * @module controllers/authController
 * @author Kelanzy
 * @version 2.0.0
 * @license MIT
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

// Type definitions
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Constants
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '1h';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

if (!process.env.JWT_SECRET) {
  logger.warn('⚠️  Using fallback JWT secret - Not recommended for production');
}

/**
 * User Registration Controller
 * 
 * @async
 * @function register
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response<AuthResponse>>} Response with status and message
 */
export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response<AuthResponse>
): Promise<Response> => {
  // Input validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Registration validation failed', { errors: errors.array() });
    return res.status(400).json({ message: 'Validation failed', ...errors.mapped() });
  }

  const { name, email, password } = req.body;

  try {
    // Check for existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn('Registration attempt with existing email', { email });
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    logger.debug('Password hashed successfully');

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    logger.info('New user registered', { userId: user.id, email });

    // Generate token for immediate login
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    logger.error('Registration error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json({ message: 'Registration failed' });
  }
};

/**
 * User Login Controller
 * 
 * @async
 * @function login
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response<AuthResponse>>} Response with token and user data
 */
export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response<AuthResponse>
): Promise<Response> => {
  // Input validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Login validation failed', { errors: errors.array() });
    return res.status(400).json({ message: 'Validation failed', ...errors.mapped() });
  }

  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn('Login attempt with non-existent email', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Invalid password attempt', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    logger.info('User logged in successfully', { userId: user.id });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    logger.error('Login error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json({ message: 'Login failed' });
  }
};

/**
 * User Profile Controller
 * 
 * @async
 * @function getProfile
 * @param {Request} req - Authenticated request
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Response with user profile
 */
export const getProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // The user should be attached to the request by the auth middleware
    if (!req.user) {
      logger.error('Profile access without authentication');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'createdAt'] // Explicitly exclude password
    });

    if (!user) {
      logger.warn('User not found for profile request', { userId: req.user.id });
      return res.status(404).json({ message: 'User not found' });
    }

    logger.debug('Profile fetched successfully', { userId: user.id });
    return res.json({ user });

  } catch (error) {
    logger.error('Profile fetch error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id
    });
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

/**
 * Security Middleware (Example)
 * 
 * This would typically be in a separate file but shown here for completeness
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: Function
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(401).send({ message: 'Please authenticate' });
  }
};