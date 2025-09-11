import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// ユーザーID事前登録
export const preRegisterUser = async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  try {
    const newPreRegisteredUser = await prisma.preRegisteredUser.create({
      data: { username },
    });
    res.status(201).json(newPreRegisteredUser);
  } catch (error) {
    res.status(400).json({ error: 'Username already exists' });
  }
};

// 事前登録済みユーザー一覧
export const getPreRegisteredUsers = async (req: Request, res: Response) => {
  const users = await prisma.preRegisteredUser.findMany({
    include: {
      user: {
        select: {
          id: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  res.json(users);
};

// 事前登録ユーザー削除
export const deletePreRegisteredUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.preRegisteredUser.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
};

// 全ユーザー一覧
export const getAllUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      isActive: true,
      isAdmin: true,
      createdAt: true,
    },
  });
  res.json(users);
};

// ユーザー有効化/無効化
export const toggleUserActive = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { isActive: !user.isActive },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ユーザーの管理者権限をトグル
export const toggleUserAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userToUpdate = await prisma.user.findUnique({
      where: { id: Number(id) },
    });
    if (!userToUpdate) {
      return res.status(404).json({ error: 'User not found' });
    }

    // @ts-ignore
    if (userToUpdate.id === req.user.userId) {
      return res
        .status(403)
        .json({ error: 'Cannot change your own admin status.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { isAdmin: !userToUpdate.isAdmin },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
