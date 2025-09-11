import cron from 'node-cron';
import prisma from '../utils/prisma';
import { subDays } from 'date-fns';

// 1. 期限切れ判定ジョブ (毎日深夜2時)
// isExpiredがfalseで、有効期限が現在時刻より前のアイテムを検索し、isExpiredをtrueに更新
const updateExpiredItemsJob = cron.schedule('0 2 * * *', async () => {
  console.log('Running a job to update expired items at 02:00 AM');
  const now = new Date();
  try {
    const result = await prisma.battleItem.updateMany({
      where: {
        expiryDate: {
          lt: now, // less than the current time
        },
        isExpired: false,
      },
      data: {
        isExpired: true,
      },
    });
    console.log(`[Cron Job] Successfully updated ${result.count} items to expired.`);
  } catch (error) {
    console.error('[Cron Job] Error updating expired items:', error);
  }
});

// 2. 自動削除ジョブ (毎日深夜3時)
// isExpiredがtrueで、最終更新日時が3日以上前のアイテムを削除
const deleteOldItemsJob = cron.schedule('0 3 * * *', async () => {
  console.log('Running a job to delete old items at 03:00 AM');
  const threeDaysAgo = subDays(new Date(), 3);
  try {
    const result = await prisma.battleItem.deleteMany({
      where: {
        isExpired: true,
        expiryDate: {
          lt: threeDaysAgo, // updated more than 3 days ago
        },
      },
    });
    console.log(`[Cron Job] Successfully deleted ${result.count} old items.`);
    // TODO: 削除ログの記録 (将来実装)
  } catch (error) {
    console.error('[Cron Job] Error deleting old items:', error);
  }
});

// ジョブを開始
export const startCronJobs = () => {
  console.log('Starting cron jobs...');
  updateExpiredItemsJob.start();
  deleteOldItemsJob.start();
};
