import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className='bg-white shadow-lg rounded-lg p-4 flex items-center'>
      {icon && <div className='mr-4 text-3xl text-gray-500'>{icon}</div>}
      <div>
        <p className='text-sm text-gray-500'>{title}</p>
        <p className='text-2xl font-bold'>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
