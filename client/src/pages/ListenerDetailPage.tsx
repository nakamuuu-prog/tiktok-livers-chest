import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import listenerService from '../services/listeners.service';
import battleItemService, {
  BattleItem,
  ItemType,
} from '../services/battleItems.service';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../components/ui/form';
import EditItemModal from '../components/items/EditItemModal';
import { ArrowLeft, Edit, Trash, Plus, Minus } from 'lucide-react';

// --- アイテムの日本語訳 ---
const itemTranslations: { [key in ItemType]: string } = {
  [ItemType.GLOVE]: 'グローブ',
  [ItemType.STUN_HAMMER]: 'スタンハンマー',
  [ItemType.MIST]: 'ミスト',
  [ItemType.TIME]: 'タイム',
  [ItemType.SECOND_BOOSTER]: '2位ブースター',
  [ItemType.THIRD_BOOSTER]: '3位ブースター',
};

type FormData = {
  expiryDate: string | null;
  expiryHour: number | null;
};

// --- Component ---
const ListenerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const listenerId = parseInt(id || '0', 10);
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BattleItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<ItemType, number>>(
    Object.values(ItemType).reduce(
      (acc, type) => ({ ...acc, [type]: 0 }),
      {} as Record<ItemType, number>
    )
  );

  // --- Data Fetching ---
  const { data: listener, isLoading: isLoadingListener } = useQuery({
    queryKey: ['listener', listenerId],
    queryFn: () =>
      listenerService.getListenerById(listenerId).then((res) => res.data),
    enabled: !!listenerId,
  });

  const { data: battleItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ['battleItems', listenerId],
    queryFn: () =>
      battleItemService.getItemsForListener(listenerId).then((res) => res.data),
    enabled: !!listenerId,
  });

  const sortedBattleItems = React.useMemo(() => {
    if (!battleItems) return [];
    return [...battleItems].sort(
      (a, b) =>
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );
  }, [battleItems]);

  // --- Mutations ---
  const createMultipleItemsMutation = useMutation({
    mutationFn: (data: {
      listenerId: number;
      items: { itemType: ItemType; quantity: number }[];
      expiryDate?: string;
    }) => battleItemService.createMultipleBattleItems(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['battleItems', listenerId] });
      queryClient.invalidateQueries({ queryKey: ['listeners'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['itemsSummary'] });
      form.reset();
      setSelectedItems(
        Object.values(ItemType).reduce(
          (acc, type) => ({ ...acc, [type]: 0 }),
          {} as Record<ItemType, number>
        )
      );
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: (data: {
      id: number;
      itemType: ItemType;
      expiryDate: string;
    }) =>
      battleItemService.updateBattleItem(data.id, {
        itemType: data.itemType,
        expiryDate: data.expiryDate,
      }),
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
    defaultValues: {
      expiryDate: null,
      expiryHour: null,
    },
  });

  const onSubmit = (data: FormData) => {
    setFormError(null);
    let expiryDate: string | undefined = undefined;
    if (data.expiryDate) {
      const combinedDate = new Date(data.expiryDate);
      if (data.expiryHour !== null && data.expiryHour !== undefined) {
        combinedDate.setHours(data.expiryHour, 0, 0, 0);
      }
      expiryDate = combinedDate.toISOString();
    }

    const itemsToCreate = Object.entries(selectedItems)
      .filter(([, quantity]) => quantity > 0)
      .map(([itemType, quantity]) => ({
        itemType: itemType as ItemType,
        quantity,
      }));

    if (itemsToCreate.length > 0) {
      createMultipleItemsMutation.mutate({
        listenerId,
        items: itemsToCreate,
        expiryDate,
      });
    } else {
      setFormError('少なくとも1つのアイテムを1つ以上選択してください。');
    }
  };

  // --- Event Handlers ---
  const handleQuantityChange = (itemType: ItemType, change: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemType]: Math.max(0, (prev[itemType] || 0) + change),
    }));
  };

  const handleEditClick = (item: BattleItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleUpdateItem = (data: {
    itemType: ItemType;
    expiryDate: string;
  }) => {
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
    <div className='space-y-6'>
      <Button variant='ghost' asChild>
        <Link to='/listeners'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          リスナー一覧に戻る
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>{listener?.name}</CardTitle>
        </CardHeader>
      </Card>

      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Add Item Form (Left Side) */}
        <div className='lg:w-1/3 lg:sticky lg:top-6 h-fit'>
          <Card>
            <CardHeader>
              <CardTitle>バトルアイテムを追加</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-4'
                >
                  {/* Item Selection */}
                  <div className='space-y-2'>
                    <Label>アイテム</Label>
                    <div className='space-y-2 rounded-md border p-2'>
                      {Object.values(ItemType).map((type) => (
                        <div
                          key={type}
                          className='flex items-center justify-between'
                        >
                          <span>{itemTranslations[type]}</span>
                          <div className='flex items-center gap-1'>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='h-6 w-6'
                              onClick={() => handleQuantityChange(type, -1)}
                            >
                              <Minus className='h-4 w-4' />
                            </Button>
                            <span className='w-8 text-center'>
                              {selectedItems[type]}
                            </span>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='h-6 w-6'
                              onClick={() => handleQuantityChange(type, 1)}
                            >
                              <Plus className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expiry Date and Time */}
                  <div className='flex gap-4'>
                    <FormField
                      control={form.control}
                      name='expiryDate'
                      render={({ field }) => (
                        <FormItem className='flex-grow'>
                          <Label>有効期限</Label>
                          <FormControl>
                            <Input
                              type='date'
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                form.setValue('expiryHour', 0);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='expiryHour'
                      render={({ field }) => (
                        <FormItem className='w-1/3'>
                          <Label>時刻</Label>
                          <Select
                            onValueChange={(val) =>
                              field.onChange(val ? parseInt(val, 10) : null)
                            }
                            value={field.value !== null && field.value !== undefined ? String(field.value) : ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='時刻' />
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
                  <Button
                    type='submit'
                    disabled={createMultipleItemsMutation.isPending}
                    className='w-full'
                  >
                    {createMultipleItemsMutation.isPending
                      ? '追加中...'
                      : '選択したアイテムを追加'}
                  </Button>
                  {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Items List (Right Side) */}
        <div className='lg:w-2/3'>
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
                      className={`p-3 rounded-md flex justify-between items-center ${
                        isExpired ? 'bg-destructive/10' : 'bg-secondary'
                      }`}
                    >
                      <div>
                        <span className='font-medium'>
                          {itemTranslations[item.itemType]}
                        </span>
                        <p
                          className={`text-sm ${
                            isExpired
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          }`}
                        >
                          有効期限:{' '}
                          {format(
                            new Date(item.expiryDate),
                            'yyyy/MM/dd HH:mm',
                            { locale: ja }
                          )}
                        </p>
                      </div>
                      <div className='flex items-center'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleEditClick(item)}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDeleteClick(item.id)}
                          disabled={deleteItemMutation.isPending}
                        >
                          <Trash className='h-4 w-4 text-destructive' />
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
