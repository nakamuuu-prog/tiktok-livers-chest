import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { BattleItem, ItemType } from '../../services/battleItems.service';

interface EditItemModalProps {
  item: BattleItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: { itemType: ItemType; expiryDate: string }) => void;
  isUpdating: boolean;
}

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

const EditItemModal: React.FC<EditItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onUpdate,
  isUpdating,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      itemType: item.itemType,
      expiryDate: new Date(item.expiryDate).toISOString().split('T')[0],
      expiryHour: new Date(item.expiryDate).getHours(),
    },
  });

  const onSubmit = (data: FormData) => {
    const combinedDate = new Date(data.expiryDate);
    combinedDate.setHours(data.expiryHour, 0, 0, 0);
    onUpdate({
      itemType: data.itemType,
      expiryDate: combinedDate.toISOString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white rounded-lg shadow-xl p-6 w-full max-w-md'>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Edit Battle Item
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <label
              htmlFor='edit-itemType'
              className='block text-sm font-medium text-gray-700'
            >
              Item Type
            </label>
            <select
              id='edit-itemType'
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
                htmlFor='edit-expiryDate'
                className='block text-sm font-medium text-gray-700'
              >
                Expiry Date
              </label>
              <input
                type='date'
                id='edit-expiryDate'
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
                htmlFor='edit-expiryHour'
                className='block text-sm font-medium text-gray-700'
              >
                Hour
              </label>
              <select
                id='edit-expiryHour'
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
          <div className='flex justify-end gap-4 mt-6'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isUpdating}
              className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50'
            >
              {isUpdating ? 'Updating...' : 'Update Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
