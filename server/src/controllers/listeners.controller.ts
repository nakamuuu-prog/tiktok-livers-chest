import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// @desc    Get all listeners for the logged-in user
// @route   GET /api/listeners
// @access  Private
export const getAllListeners = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    const listeners = await prisma.listener.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(listeners);
  } catch (error) {
    console.error('Error fetching listeners:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Create a new listener for the logged-in user
// @route   POST /api/listeners
// @access  Private
export const createListener = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Listener name is required' });
  }

  try {
    const newListener = await prisma.listener.create({
      data: {
        name,
        userId: userId!,
      },
    });
    res.status(201).json(newListener);
  } catch (error) {
    console.error('Error creating listener:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get a single listener by ID
// @route   GET /api/listeners/:id
// @access  Private
export const getListenerById = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Not Implemented' });
};

// @desc    Update a listener
// @route   PUT /api/listeners/:id
// @access  Private
export const updateListener = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Not Implemented' });
};

// @desc    Delete a listener
// @route   DELETE /api/listeners/:id
// @access  Private
export const deleteListener = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Not Implemented' });
};
