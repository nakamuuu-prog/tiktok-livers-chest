import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';
const SALT_ROUNDS = 12;

export const checkUsername = async (req: Request, res: Response) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'ユーザー名は必須です' });
  }

  try {
    // 1. Check if user is pre-registered
    const preRegisteredUser = await prisma.preRegisteredUser.findUnique({
      where: { username },
    });

    if (!preRegisteredUser) {
      return res
        .status(404)
        .json({ message: 'このユーザー名は事前登録されていません。' });
    }

    // 2. Check if user has already completed registration
    if (preRegisteredUser.isRegistered) {
      return res
        .status(409)
        .json({ message: 'このユーザー名はすでに登録済みです。' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      // This case should ideally not be hit if the preRegisteredUser.isRegistered check is robust
      return res
        .status(409)
        .json({ message: 'このユーザー名はすでに登録済みです。' });
    }

    // 3. If pre-registered and not yet registered, it's available
    return res
      .status(200)
      .json({ message: 'このユーザー名は登録可能です。' });
  } catch (error) {
    console.error('Error checking username:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'ユーザー名とパスワードは必須です。' });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: 'パスワードは8文字以上である必要があります。' });
  }

  try {
    // Verify username is pre-registered and not already in use
    const preRegisteredUser = await prisma.preRegisteredUser.findUnique({
      where: { username },
    });
    if (!preRegisteredUser) {
      return res
        .status(403)
        .json({ message: 'このユーザー名は登録を許可されていません。' });
    }

    // Check if already registered through the pre-registration entry
    if (preRegisteredUser.isRegistered) {
      return res
        .status(409)
        .json({ message: 'このユーザー名はすでに登録済みです。' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      // This case should ideally not be hit if the preRegisteredUser.isRegistered check is robust
      return res
        .status(409)
        .json({ message: 'このユーザー名はすでに使用されています。' });
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
      message: 'ユーザー登録が完了しました。',
      token,
      user: { id: user.id, username: user.username, isAdmin: user.isAdmin },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'ユーザー名とパスワードは必須です。' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.password) {
      return res.status(401).json({ message: '認証情報が無効です。' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: '認証情報が無効です。' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'ログインに成功しました。',
      token,
      user: { id: user.id, username: user.username, isAdmin: user.isAdmin },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
};

export const logout = async (req: Request, res: Response) => {
  // On the client-side, the token should be deleted.
  // Server-side logout for stateless JWT is simply acknowledging the request.
  res.status(200).json({ message: 'ログアウトに成功しました。' });
};

export const getMe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: '認証が必要です。' });
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
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
};
