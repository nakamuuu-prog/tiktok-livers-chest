import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// @desc    Get all listeners for the logged-in user
// @route   GET /api/listeners
// @access  Private
export const getAllListeners = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;

  try {
    const listeners = await prisma.listener.findMany({
      where: { userId },
      include: {
        battleItems: {
          where: {
            expiryDate: {
              gte: new Date(),
            },
          },
          orderBy: {
            expiryDate: 'asc',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const listenersWithItems = listeners.map((listener) => {
      return {
        ...listener,
        activeItemCount: listener.battleItems.length,
      };
    });

    res.status(200).json(listenersWithItems);
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
  const userId = req.user?.userId;
  const { id } = req.params;

  try {
    const listener = await prisma.listener.findFirst({
      where: {
        id: parseInt(id, 10),
        userId: userId,
      },
    });

    if (!listener) {
      return res.status(404).json({ message: 'Listener not found' });
    }

    res.status(200).json(listener);
  } catch (error) {
    console.error('Error fetching listener:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Update a listener
// @route   PUT /api/listeners/:id
// @access  Private
export const updateListener = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    // First, check if the listener exists and belongs to the user
    const existingListener = await prisma.listener.findFirst({
      where: { id: parseInt(id, 10), userId },
    });

    if (!existingListener) {
      return res.status(404).json({ message: 'Listener not found' });
    }

    const updatedListener = await prisma.listener.update({
      where: {
        id: parseInt(id, 10),
      },
      data: { name },
    });

    res.status(200).json(updatedListener);
  } catch (error) {
    console.error('Error updating listener:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Delete a listener
// @route   DELETE /api/listeners/:id
// @access  Private
export const deleteListener = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  try {
    // First, check if the listener exists and belongs to the user
    const existingListener = await prisma.listener.findFirst({
      where: { id: parseInt(id, 10), userId },
    });

    if (!existingListener) {
      return res.status(404).json({ message: 'Listener not found' });
    }

    await prisma.listener.delete({
      where: {
        id: parseInt(id, 10),
      },
    });

    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Error deleting listener:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
