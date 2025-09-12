import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { ItemType } from '@prisma/client';

// A helper function to validate if a listener belongs to the logged-in user
const checkListenerOwnership = async (listenerId: number, userId: number) => {
  const listener = await prisma.listener.findFirst({
    where: { id: listenerId, userId },
  });
  return listener;
};

// A helper function to validate if a battle item belongs to the logged-in user's listener
const checkBattleItemOwnership = async (itemId: number, userId: number) => {
  const item = await prisma.battleItem.findFirst({
    where: {
      id: itemId,
      listener: { userId: userId }, // Check ownership through the listener relation
    },
  });
  return item;
};

// @desc    Get all items for a specific listener
// @route   GET /api/listeners/:id/items
// @access  Private
export const getItemsForListener = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const listenerId = parseInt(req.params.id, 10);

  try {
    const listener = await checkListenerOwnership(listenerId, userId!);
    if (!listener) {
      return res.status(404).json({ message: 'リスナーが見つからないか、アクセスが拒否されました。' });
    }

    const items = await prisma.battleItem.findMany({
      where: { listenerId },
      orderBy: { expiryDate: 'asc' },
    });

    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching items for listener:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
};

// @desc    Create a new battle item
// @route   POST /api/battle-items
// @access  Private
export const createBattleItem = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { listenerId, itemType, expiryDate } = req.body;

  // Basic validation
  if (!listenerId || !itemType || !expiryDate) {
    return res.status(400).json({ message: 'リスナーID、アイテムの種類、有効期限は必須です。' });
  }

  // Validate itemType against the enum
  if (!Object.values(ItemType).includes(itemType)) {
    return res.status(400).json({ message: 'アイテムの種類が無効です。' });
  }

  try {
    const listener = await checkListenerOwnership(listenerId, userId!);
    if (!listener) {
      return res.status(404).json({ message: 'リスナーが見つからないか、アクセスが拒否されました。' });
    }

    const newItem = await prisma.battleItem.create({
      data: {
        listenerId,
        itemType,
        expiryDate: new Date(expiryDate),
      },
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating battle item:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
};

// @desc    Get a single battle item by ID
// @route   GET /api/battle-items/:id
// @access  Private
export const getBattleItemById = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const itemId = parseInt(req.params.id, 10);

  try {
    const item = await checkBattleItemOwnership(itemId, userId!);

    if (!item) {
      return res.status(404).json({ message: 'バトルアイテムが見つからないか、アクセスが拒否されました。' });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error('Error fetching battle item:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
};

// @desc    Update a battle item
// @route   PUT /api/battle-items/:id
// @access  Private
export const updateBattleItem = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const itemId = parseInt(req.params.id, 10);
  const { itemType, expiryDate } = req.body;

  if (!itemType || !expiryDate) {
    return res.status(400).json({ message: 'アイテムの種類と有効期限は必須です。' });
  }

  if (!Object.values(ItemType).includes(itemType)) {
    return res.status(400).json({ message: 'アイテムの種類が無効です。' });
  }

  try {
    const existingItem = await checkBattleItemOwnership(itemId, userId!);

    if (!existingItem) {
      return res.status(404).json({ message: 'バトルアイテムが見つからないか、アクセスが拒否されました。' });
    }

    const updatedItem = await prisma.battleItem.update({
      where: { id: itemId },
      data: {
        itemType,
        expiryDate: new Date(expiryDate),
      },
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating battle item:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
};

// @desc    Delete a battle item
// @route   DELETE /api/battle-items/:id
// @access  Private
export const deleteBattleItem = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const itemId = parseInt(req.params.id, 10);

  try {
    const existingItem = await checkBattleItemOwnership(itemId, userId!);

    if (!existingItem) {
      return res.status(404).json({ message: 'バトルアイテムが見つからないか、アクセスが拒否されました。' });
    }

    await prisma.battleItem.delete({
      where: { id: itemId },
    });

    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Error deleting battle item:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
};