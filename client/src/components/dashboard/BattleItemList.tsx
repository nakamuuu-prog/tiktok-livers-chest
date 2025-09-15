import React from 'react';
import { useQuery } from '@tanstack/react-query';
import battleItemService, { BattleItem, ItemType } from '../../services/battleItems.service';
import listenerService from '../../services/listeners.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/Spinner';

interface BattleItemListProps {
  title: string;
  itemType: ItemType;
}

const BattleItemList: React.FC<BattleItemListProps> = ({ title, itemType }) => {
  const { data: items, isLoading: isLoadingItems } = useQuery<BattleItem[], Error>({
    queryKey: ['activeItems', itemType],
    queryFn: () => battleItemService.getActiveItems(itemType).then(res => res.data),
  });

  const { data: listeners, isLoading: isLoadingListeners } = useQuery({
    queryKey: ['listeners'],
    queryFn: listenerService.getListeners,
    select: res => res.data,
  });

  const listenerMap = new Map(listeners?.map(l => [l.id, l.name]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingItems || isLoadingListeners ? (
          <div className="flex h-24 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>リスナー</TableHead>
                <TableHead className="text-right">有効期限</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{listenerMap.get(item.listenerId) || '不明'}</TableCell>
                  <TableCell className="text-right">
                    {format(new Date(item.expiryDate), 'yyyy/MM/dd HH:mm')}
                  </TableCell>
                </TableRow>
              ))}
              {items?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    アイテムはありません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default BattleItemList;
