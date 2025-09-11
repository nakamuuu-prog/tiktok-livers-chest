import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';
const SALT_ROUNDS = 12;

export const checkUsername = async (req: Request, res: Response) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    // 1. Check if user is pre-registered
    const preRegisteredUser = await prisma.preRegisteredUser.findUnique({
      where: { username },
    });

    if (!preRegisteredUser) {
      return res
        .status(404)
        .json({ message: 'This username is not pre-registered.' });
    }

    // 2. Check if user has already completed registration
    if (preRegisteredUser.isRegistered) {
      return res
        .status(409)
        .json({ message: 'This username is already registered.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      // This case should ideally not be hit if the preRegisteredUser.isRegistered check is robust
      return res
        .status(409)
        .json({ message: 'This username is already registered.' });
    }

    // 3. If pre-registered and not yet registered, it's available
    return res
      .status(200)
      .json({ message: 'Username is available for registration.' });
  } catch (error) {
    console.error('Error checking username:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 8 characters long' });
  }

  try {
    // Verify username is pre-registered and not already in use
    const preRegisteredUser = await prisma.preRegisteredUser.findUnique({
      where: { username },
    });
    if (!preRegisteredUser) {
      return res
        .status(403)
        .json({ message: 'This username is not permitted to register.' });
    }

    // Check if already registered through the pre-registration entry
    if (preRegisteredUser.isRegistered) {
      return res
        .status(409)
        .json({ message: 'This username is already registered.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      // This case should ideally not be hit if the preRegisteredUser.isRegistered check is robust
      return res
        .status(409)
        .json({ message: 'This username is already taken.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        isActive: true,
      },
    });

    // Update the pre-registered user entry
    await prisma.preRegisteredUser.update({
      where: {
        username,
      },
      data: {
        isRegistered: true,
        registeredAt: new Date(),
        userId: user.id,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, username: user.username, isAdmin: user.isAdmin },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, isAdmin: user.isAdmin },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  // On the client-side, the token should be deleted.
  // Server-side logout for stateless JWT is simply acknowledging the request.
  res.status(200).json({ message: 'Logout successful' });
};

export const getMe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
