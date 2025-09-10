import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import listenerService from '../services/listeners.service';
import battleItemService, {
  BattleItem,
  ItemType,
} from '../services/battleItems.service';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import EditItemModal from '../components/items/EditItemModal';

// --- Form Validation Schema ---
const schema = yup.object().shape({
  itemType: yup
    .string()
    .oneOf(Object.values(ItemType))
    .required('Item type is required'),
  expiryDate: yup.string().required('Expiry date is required'),
  expiryHour: yup.number().min(0).max(23).required('Expiry hour is required'),
});

interface FormData {
  itemType: ItemType;
  expiryDate: string;
  expiryHour: number;
}

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
  const createItemMutation = useMutation({
    mutationFn: (data: {
      listenerId: number;
      itemType: ItemType;
      expiryDate: string;
    }) => battleItemService.createBattleItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['battleItems', listenerId] });
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
      setIsEditModalOpen(false);
      setSelectedItem(null);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => battleItemService.deleteBattleItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['battleItems', listenerId] });
    },
  });

  // --- Form Handling ---
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    const combinedDate = new Date(data.expiryDate);
    combinedDate.setHours(data.expiryHour, 0, 0, 0); // Set hour, clear minutes, seconds, ms

    createItemMutation.mutate({
      listenerId,
      itemType: data.itemType,
      expiryDate: combinedDate.toISOString(),
    });
    reset();
  };

  // --- Event Handlers ---
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
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(itemId);
    }
  };

  // --- Render ---
  if (isLoadingListener) return <p>Loading listener details...</p>;

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-4'>
          <Link to='/' className='text-indigo-600 hover:text-indigo-900'>
            &larr; Back to Dashboard
          </Link>
        </div>
        <div className='bg-white shadow rounded-lg p-6 mb-6'>
          {listener ? (
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                {listener.name}
              </h2>
              <p className='mt-2 text-sm text-gray-500'>ID: {listener.id}</p>
            </div>
          ) : (
            <p>Listener not found.</p>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Add Item Form */}
          <div className='bg-white shadow rounded-lg p-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Add Battle Item
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div>
                <label
                  htmlFor='itemType'
                  className='block text-sm font-medium text-gray-700'
                >
                  Item Type
                </label>
                <select
                  id='itemType'
                  {...register('itemType')}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-${
                    errors.itemType ? 'border-red-500' : 'gray-300'
                  } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md`}
                >
                  {Object.values(ItemType).map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ').toLowerCase()}
                    </option>
                  ))}
                </select>
                {errors.itemType && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.itemType.message}
                  </p>
                )}
              </div>
              <div className='flex gap-2'>
                <div className='flex-grow'>
                  <label
                    htmlFor='expiryDate'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Expiry Date
                  </label>
                  <input
                    type='date'
                    id='expiryDate'
                    {...register('expiryDate')}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.expiryDate && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.expiryDate.message}
                    </p>
                  )}
                </div>
                <div className='w-1/3'>
                  <label
                    htmlFor='expiryHour'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Hour
                  </label>
                  <select
                    id='expiryHour'
                    {...register('expiryHour')}
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-${
                      errors.expiryHour ? 'border-red-500' : 'gray-300'
                    } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md`}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  {errors.expiryHour && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.expiryHour.message}
                    </p>
                  )}
                </div>
              </div>
              <button
                type='submit'
                disabled={createItemMutation.isPending}
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
              >
                {createItemMutation.isPending ? 'Adding...' : 'Add Item'}
              </button>
            </form>
          </div>

          {/* Items List */}
          <div className='bg-white shadow rounded-lg p-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Owned Items
            </h3>
            {isLoadingItems && <p>Loading items...</p>}
            <ul className='space-y-3'>
              {sortedBattleItems.map((item) => (
                <li
                  key={item.id}
                  className='bg-gray-50 p-3 rounded-md flex justify-between items-center'
                >
                  <div>
                    <span className='font-medium text-gray-800'>
                      {item.itemType.replace(/_/g, ' ').toLowerCase()}
                    </span>
                    <p className='text-sm text-gray-500'>
                      Expires: {new Date(item.expiryDate).toLocaleString()}
                    </p>
                  </div>
                  <div className='space-x-2'>
                    <button
                      onClick={() => handleEditClick(item)}
                      className='text-indigo-600 hover:text-indigo-900 text-sm'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      disabled={deleteItemMutation.isPending}
                      className='text-red-600 hover:text-red-900 text-sm disabled:opacity-50'
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
              {battleItems?.length === 0 && (
                <p className='text-gray-500'>No items owned.</p>
              )}
            </ul>
          </div>
        </div>
      </div>
      {selectedItem && (
        <EditItemModal
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
