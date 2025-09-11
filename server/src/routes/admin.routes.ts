import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticateToken } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

// ユーザーID事前登録
router.post('/pre-register', authenticateToken, isAdmin, async (req, res) => {
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
});

// 事前登録済みユーザー一覧
router.get(
  '/pre-registered-users',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    const users = await prisma.preRegisteredUser.findMany();
    res.json(users);
  }
);

// 事前登録ユーザー削除
router.delete(
  '/pre-registered-users/:id',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.preRegisteredUser.delete({ where: { id: Number(id) } });
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: 'User not found' });
    }
  }
);

// 全ユーザー一覧
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
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
});

// ユーザー有効化/無効化
router.patch(
  '/users/:id/toggle-active',
  authenticateToken,
  isAdmin,
  async (req, res) => {
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
  }
);

export default router;
