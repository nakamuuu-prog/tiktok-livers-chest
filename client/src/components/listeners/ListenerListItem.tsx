import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Listener } from '../../services/listeners.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import listenerService from '../../services/listeners.service';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { BattleItem } from '../../services/battleItems.service';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Box, Edit, Trash, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

// --- Props and Form Schema ---
interface ListenerListItemProps {
  listener: Listener;
}

const schema = yup.object().shape({
  name: yup.string().required('リスナー名は必須です'),
});
type FormData = yup.InferType<typeof schema>;

// --- Component ---
const ListenerListItem: React.FC<ListenerListItemProps> = ({ listener }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { name: listener.name },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; name: string }) =>
      listenerService.updateListener(data.id, data.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listeners'] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => listenerService.deleteListener(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listeners'] });
    },
  });

  const onUpdateSubmit = (data: FormData) => {
    updateMutation.mutate({ id: listener.id, name: data.name });
  };

  const handleDelete = () => {
    if (window.confirm('このリスナーを削除してもよろしいですか？関連するアイテムもすべて削除されます。')) {
      deleteMutation.mutate(listener.id);
    }
  };

  const itemTranslations: { [key: string]: string } = {
    GLOVE: 'グローブ',
    STUN_HAMMER: 'スタンハンマー',
    MIST: 'ミスト',
    TIME: 'タイム',
    SECOND_BOOSTER: '2位ブースター',
    THIRD_BOOSTER: '3位ブースター',
  };

  const nearestExpiryItems = Array.from(
    listener.battleItems
      .reduce((map, item) => {
        if (!map.has(item.itemType)) {
          map.set(item.itemType, item);
        }
        return map;
      }, new Map<string, BattleItem>())
      .values()
  );

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <form
            onSubmit={form.handleSubmit(onUpdateSubmit)}
            className='flex items-center justify-between gap-4'
          >
            <div className='flex-grow'>
              <Input {...form.register('name')} />
              {form.formState.errors.name && (
                <p className='mt-1 text-sm text-destructive'>{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className='flex-shrink-0 space-x-2'>
              <Button type='submit' size="icon" variant="ghost" disabled={updateMutation.isPending}>
                <Save className="h-4 w-4" />
              </Button>
              <Button type='button' size="icon" variant="ghost" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        className='flex flex-row items-center justify-between cursor-pointer'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <CardTitle>
            <Link
              to={`/listeners/${listener.id}`}
              className='hover:underline'
              onClick={(e) => e.stopPropagation()}
            >
              {listener.name}
            </Link>
          </CardTitle>
          <div className='flex items-center text-sm text-muted-foreground mt-2'>
            <Box className="mr-2 h-4 w-4" />
            <span>有効なアイテム: {listener.activeItemCount}個</span>
          </div>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(); }} disabled={deleteMutation.isPending}>
            <Trash className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <h4 className='text-md font-semibold mb-2 text-card-foreground'>
            有効なアイテム (種類ごとに直近の有効期限)
          </h4>
          {nearestExpiryItems.length > 0 ? (
            <ul className='space-y-2'>
              {nearestExpiryItems.map((item: BattleItem) => (
                <li
                  key={item.id}
                  className='flex justify-between items-center bg-secondary p-3 rounded-md'
                >
                  <span className='text-sm font-medium text-secondary-foreground'>
                    {itemTranslations[item.itemType] || item.itemType}
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    期限:{' '}
                    {formatDistanceToNow(parseISO(item.expiryDate), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-sm text-muted-foreground'>
              有効なアイテムはありません。
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ListenerListItem;