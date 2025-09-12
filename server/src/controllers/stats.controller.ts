import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { addDays } from 'date-fns';
import { ItemType } from '@prisma/client';

// ダッシュボードの統計情報を取得
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const totalListeners = await prisma.listener.count({
      where: { userId },
    });

    const totalActiveItems = await prisma.battleItem.count({
      where: {
        listener: {
          userId,
        },
        expiryDate: {
          gte: new Date(),
        },
      },
    });

    const expiringSoonItems = await prisma.battleItem.count({
      where: {
        listener: {
          userId,
        },
        expiryDate: {
          gte: new Date(),
          lte: addDays(new Date(), 1), // 24時間以内
        },
      },
    });

    res.json({
      totalListeners,
      totalActiveItems,
      expiringSoonItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
};

// アイテムごとのサマリーを取得
export const getItemsSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const itemTypes = Object.values(ItemType);

    const summary = await prisma.battleItem.groupBy({
      by: ['itemType'],
      where: {
        listener: {
          userId,
        },
        expiryDate: {
          gte: new Date(),
        },
      },
      _count: {
        id: true,
      },
    });

    const summaryMap = new Map(
      summary.map((item: { itemType: ItemType; _count: { id: number } }) => [item.itemType, item._count.id])
    );
    const fullSummary = itemTypes.map((type) => ({
      itemType: type,
      count: summaryMap.get(type) || 0,
    }));

    res.json(fullSummary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
};