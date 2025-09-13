import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import listenerService from '../services/listeners.service';
import battleItemService, { BattleItem, ItemType } from '../services/battleItems.service';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../components/ui/form';
import EditItemModal from '../components/items/EditItemModal';
import { ArrowLeft, Edit, Trash } from 'lucide-react';

// --- アイテム種別の日本語訳 ---
const itemTranslations: { [key in ItemType]: string } = {
  [ItemType.GLOVE]: 'グローブ',
  [ItemType.STUN_HAMMER]: 'スタンハンマー',
  [ItemType.MIST]: 'ミスト',
  [ItemType.TIME]: 'タイム',
  [ItemType.SECOND_BOOSTER]: '2位ブースター',
  [ItemType.THIRD_BOOSTER]: '3位ブースター',
};

// --- Form Validation Schema ---
const schema = yup.object({
  itemType: yup.string().oneOf(Object.values(ItemType)).required(),
  expiryDate: yup.string().nullable(),
  expiryHour: yup.number().min(0).max(23).nullable(),
});

type FormData = yup.InferType<typeof schema>;

// --- Component ---
const ListenerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const listenerId = parseInt(id || '0', 10);
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BattleItem | null>(null);

  // --- Data Fetching ---
  const { data: listener, isLoading: isLoadingListener } = useQuery({
    queryKey: ['listener', listenerId],
    queryFn: () => listenerService.getListenerById(listenerId).then((res) => res.data),
    enabled: !!listenerId,
  });

  const { data: battleItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ['battleItems', listenerId],
    queryFn: () => battleItemService.getItemsForListener(listenerId).then((res) => res.data),
    enabled: !!listenerId,
  });

  const sortedBattleItems = React.useMemo(() => {
    if (!battleItems) return [];
    return [...battleItems].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [battleItems]);

  // --- Mutations ---
  const createItemMutation = useMutation({
    mutationFn: (data: { listenerId: number; itemType: ItemType; expiryDate?: string }) =>
      battleItemService.createBattleItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['battleItems', listenerId] });
      queryClient.invalidateQueries({ queryKey: ['listeners'] });
      form.reset();
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: (data: { id: number; itemType: ItemType; expiryDate: string }) =>
      battleItemService.updateBattleItem(data.id, { itemType: data.itemType, expiryDate: data.expiryDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['battleItems', listenerId] });
      queryClient.invalidateQueries({ queryKey: ['listeners'] });
      setIsEditModalOpen(false);
      setSelectedItem(null);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => battleItemService.deleteBattleItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['battleItems', listenerId] });
      queryClient.invalidateQueries({ queryKey: ['listeners'] });
    },
  });

  // --- Form Handling ---
  const form = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      itemType: ItemType.GLOVE,
      expiryDate: null,
      expiryHour: null,
    },
  });

  const onSubmit = (data: FormData) => {
    let expiryDate: string | undefined = undefined;
    if (data.expiryDate) {
      const combinedDate = new Date(data.expiryDate);
      if (data.expiryHour !== null && data.expiryHour !== undefined) {
        combinedDate.setHours(data.expiryHour, 0, 0, 0);
      }
      expiryDate = combinedDate.toISOString();
    }
    createItemMutation.mutate({ listenerId, itemType: data.itemType, expiryDate });
  };

  // --- Event Handlers ---
  const handleEditClick = (item: BattleItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleUpdateItem = (data: { itemType: ItemType; expiryDate: string }) => {
    if (selectedItem) {
      updateItemMutation.mutate({ id: selectedItem.id, ...data });
    }
  };

  const handleDeleteClick = (itemId: number) => {
    if (window.confirm('このアイテムを削除してもよろしいですか？')) {
      deleteItemMutation.mutate(itemId);
    }
  };

  // --- Render ---
  if (isLoadingListener) return <p>リスナー情報を読み込み中...</p>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link to='/listeners'>
          <ArrowLeft className="mr-2 h-4 w-4" />
          リスナー一覧に戻る
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{listener?.name}</CardTitle>
        </CardHeader>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Add Item Form (Left Side) */}
        <div className="lg:w-1/3 lg:sticky lg:top-6 h-fit">
          <Card>
            <CardHeader>
              <CardTitle>バトルアイテムを追加</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                  <FormField
                    control={form.control}
                    name="itemType"
                    render={({ field }) => (
                      <FormItem>
                        <Label>アイテム種別</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="アイテムを選択..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(ItemType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {itemTranslations[type]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <Label>有効期限</Label>
                          <FormControl>
                            <Input type="date" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expiryHour"
                      render={({ field }) => (
                        <FormItem className="w-1/3">
                          <Label>時刻</Label>
                          <Select onValueChange={(val) => field.onChange(val ? parseInt(val, 10) : null)} value={field.value ? String(field.value) : ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="時刻を選択..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem key={i} value={String(i)}>
                                  {i.toString().padStart(2, '0')}時
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type='submit' disabled={createItemMutation.isPending} className="w-full">
                    {createItemMutation.isPending ? '追加中...' : 'アイテムを追加'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Items List (Right Side) */}
        <div className="lg:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>所持アイテム一覧</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingItems && <p>アイテムを読み込み中...</p>}
              <ul className='space-y-3'>
                {sortedBattleItems.map((item) => {
                  const isExpired = new Date(item.expiryDate) < new Date();
                  return (
                    <li
                      key={item.id}
                      className={`p-3 rounded-md flex justify-between items-center ${isExpired ? 'bg-destructive/10' : 'bg-secondary'}`}>
                      <div>
                        <span className='font-medium'>
                          {itemTranslations[item.itemType]}
                        </span>
                        <p className={`text-sm ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
                          有効期限:{' '}
                          {format(new Date(item.expiryDate), 'yyyy/MM/dd HH:mm', { locale: ja })}
                        </p>
                      </div>
                      <div className='flex items-center'>
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(item.id)} disabled={deleteItemMutation.isPending}>
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
                {battleItems?.length === 0 && (
                  <p className='text-center text-muted-foreground py-4'>
                    所持しているアイテムはありません。
                  </p>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      {selectedItem && (
        <EditItemModal
          key={selectedItem.id}
          item={selectedItem}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateItem}
          isUpdating={updateItemMutation.isPending}
        />
      )}
    </div>
  );
};

export default ListenerDetailPage;