import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getItemsSummary } from '../services/stats.service';
import StatCard from '../components/dashboard/StatCard';
import ItemSummaryChart from '../components/dashboard/ItemSummaryChart';
import { FaUsers, FaBoxOpen, FaClock } from 'react-icons/fa';
// import ListenerList from '../components/listeners/ListenerList'; // Assuming you have this component

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  const { data: itemsSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['itemsSummary'],
    queryFn: getItemsSummary,
  });

  if (isLoadingStats || isLoadingSummary) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>ダッシュボード</h1>
      <p className='mb-6'>ようこそ、{user?.username}さん</p>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <StatCard
          title='総リスナー数'
          value={stats?.totalListeners ?? 0}
          icon={<FaUsers />}
        />
        <StatCard
          title='有効アイテム総数'
          value={stats?.totalActiveItems ?? 0}
          icon={<FaBoxOpen />}
        />
        <StatCard
          title='24H以内期限切れ'
          value={stats?.expiringSoonItems ?? 0}
          icon={<FaClock />}
        />
      </div>

      {/* Item Summary Chart */}
      <div className='mb-8'>
        <ItemSummaryChart summary={itemsSummary || []} />
      </div>

      {/* Recent Listeners or other components */}
      <div>
        <h2 className='text-xl font-semibold mb-4'>リスナー一覧</h2>
        {/* You might want to show a list of listeners here */}
        {/* <ListenerList /> */}
        <p>リスナー一覧はリスナー管理ページで確認できます。</p>
      </div>
    </div>
  );
};

export default DashboardPage;
