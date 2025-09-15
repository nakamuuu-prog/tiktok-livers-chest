import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getItemsSummary } from '../services/stats.service';
import StatCard from '../components/dashboard/StatCard';
import ItemSummaryChart from '../components/dashboard/ItemSummaryChart';
import BattleItemList from '../components/dashboard/BattleItemList';
import { ItemType } from '../services/battleItems.service';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { AlertTriangle, ArrowRight, Users, Box, Clock } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

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
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>ダッシュボード</h1>
          <p className='text-muted-foreground'>
            ようこそ、{user?.username}さん。バトルアイテムの管理状況の概要です。
          </p>
        </div>
        <Button asChild>
          <Link to="/listeners">
            リスナー管理へ <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Expiring Items Alert */}
      {(stats?.expiringSoonItems ?? 0) > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>注意</AlertTitle>
          <AlertDescription>
            <strong>{stats?.expiringSoonItems}個</strong>のアイテムが24時間以内に期限切れになります。
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <StatCard
          title='総リスナー数'
          value={stats?.totalListeners ?? 0}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title='有効アイテム総数'
          value={stats?.totalActiveItems ?? 0}
          icon={<Box className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title='24H以内期限切れ'
          value={stats?.expiringSoonItems ?? 0}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Item Summary Chart Card */}
      <Card>
        <CardHeader>
          <CardTitle>アイテム種類別サマリー</CardTitle>
          <CardDescription>現在有効なアイテムの内訳です。</CardDescription>
        </CardHeader>
        <CardContent>
          <ItemSummaryChart summary={itemsSummary || []} />
        </CardContent>
      </Card>

      {/* Item Lists */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BattleItemList title="グローブ" itemType={ItemType.GLOVE} />
          <BattleItemList title="2位ブースター" itemType={ItemType.SECOND_BOOSTER} />
          <BattleItemList title="3位ブースター" itemType={ItemType.THIRD_BOOSTER} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BattleItemList title="タイム" itemType={ItemType.TIME} />
          <BattleItemList title="ミスト" itemType={ItemType.MIST} />
          <BattleItemList title="スタンハンマー" itemType={ItemType.STUN_HAMMER} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
