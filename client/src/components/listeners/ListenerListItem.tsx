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
import {
  FaBoxOpen,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import { BattleItem } from '../../services/battleItems.service';

// --- Props and Form Schema ---
interface ListenerListItemProps {
  listener: Listener;
}

const schema = yup.object().shape({
  name: yup.string().required('Listener name is required'),
});
type FormData = yup.InferType<typeof schema>;

// --- Component ---
const ListenerListItem: React.FC<ListenerListItemProps> = ({ listener }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  // --- Form ---
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { name: listener.name },
  });

  // --- Mutations ---
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

  // --- Handlers ---
  const onUpdateSubmit = (data: FormData) => {
    updateMutation.mutate({ id: listener.id, name: data.name });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this listener?')) {
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

  // 各アイテムタイプで有効期限が最も近いアイテムをフィルタリング
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

  // --- Render ---
  if (isEditing) {
    return (
      <li className='bg-white p-4 rounded-lg shadow-md'>
        <form
          onSubmit={handleSubmit(onUpdateSubmit)}
          className='flex items-center justify-between gap-4'
        >
          <div className='flex-grow'>
            <input
              {...register('name')}
              className={`block w-full px-3 py-2 border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.name && (
              <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>
            )}
          </div>
          <div className='flex-shrink-0 space-x-2'>
            <button
              type='submit'
              disabled={updateMutation.isPending}
              className='text-green-600 hover:text-green-900 text-sm p-2 rounded-full hover:bg-gray-100 disabled:opacity-50'
            >
              <FaSave />
            </button>
            <button
              type='button'
              onClick={() => setIsEditing(false)}
              className='text-gray-600 hover:text-gray-900 text-sm p-2 rounded-full hover:bg-gray-100'
            >
              <FaTimes />
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className='bg-white rounded-lg shadow-md transition-shadow duration-200 hover:shadow-lg'>
      <div
        className='p-4 flex items-center justify-between cursor-pointer'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='flex items-center'>
          <Link
            to={`/listeners/${listener.id}`}
            className='font-bold text-lg text-gray-800 hover:text-indigo-600'
            onClick={(e) => e.stopPropagation()} // Prevent accordion toggle when clicking link
          >
            {listener.name}
          </Link>
          <div className='ml-4 flex items-center text-sm text-gray-600'>
            <span className='mr-1 text-gray-400'>
              <FaBoxOpen />
            </span>
            <span>{listener.activeItemCount} items</span>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <div className='flex-shrink-0 space-x-2'>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className='text-indigo-600 hover:text-indigo-900 text-sm p-2 rounded-full hover:bg-gray-100'
            >
              <FaEdit />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={deleteMutation.isPending}
              className='text-red-600 hover:text-red-900 text-sm disabled:opacity-50 p-2 rounded-full hover:bg-gray-100'
            >
              <FaTrash />
            </button>
          </div>
          <button className='p-2 rounded-full hover:bg-gray-100'>
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className='px-4 pb-4 border-t border-gray-200'>
          <h4 className='text-md font-semibold mt-3 mb-2 text-gray-700'>
            有効なアイテム (種類ごとに直近の有効期限)
          </h4>
          {nearestExpiryItems.length > 0 ? (
            <ul className='space-y-2'>
              {nearestExpiryItems.map((item: BattleItem) => (
                <li
                  key={item.id}
                  className='flex justify-between items-center bg-gray-50 p-2 rounded-md'
                >
                  <span className='text-sm text-gray-800'>
                    {itemTranslations[item.itemType] || item.itemType}
                  </span>
                  <span className='text-sm text-gray-600'>
                    あと{' '}
                    {formatDistanceToNow(parseISO(item.expiryDate), {
                      locale: ja,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-sm text-gray-500'>
              有効なアイテムはありません。
            </p>
          )}
        </div>
      )}
    </li>
  );
};

export default ListenerListItem;
