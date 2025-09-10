import React from 'react';

interface ItemSummary {
  itemType: string;
  count: number;
}

interface ItemSummaryChartProps {
  summary: ItemSummary[];
}

const itemTranslations: { [key: string]: string } = {
  GLOVE: 'グローブ',
  STUN_HAMMER: 'スタンハンマー',
  MIST: 'ミスト',
  TIME: 'タイム',
  SECOND_BOOSTER: '2位ブースター',
  THIRD_BOOSTER: '3位ブースター',
};

const ItemSummaryChart: React.FC<ItemSummaryChartProps> = ({ summary }) => {
  if (!summary || summary.length === 0) {
    return <p>データがありません。</p>;
  }

  const maxCount = Math.max(...summary.map((item) => item.count), 0);

  return (
    <div className='bg-white shadow-lg rounded-lg p-6'>
      <h3 className='text-lg font-semibold mb-4'>アイテム別サマリー</h3>
      <div className='space-y-4'>
        {summary.map((item) => (
          <div
            key={item.itemType}
            className='grid grid-cols-4 items-center gap-4'
          >
            <span className='col-span-1 text-sm font-medium text-gray-600'>
              {itemTranslations[item.itemType] || item.itemType}
            </span>
            <div className='col-span-3 bg-gray-200 rounded-full h-6'>
              <div
                className='bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2'
                style={{
                  width:
                    maxCount > 0 ? `${(item.count / maxCount) * 100}%` : '0%',
                }}
              >
                <span className='text-white text-sm font-bold'>
                  {item.count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemSummaryChart;
