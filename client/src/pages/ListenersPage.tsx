import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import listenerService from '../services/listeners.service';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ListenerListItem from '../components/listeners/ListenerListItem';

// Form validation schema
const schema = yup.object().shape({
  name: yup.string().required('リスナー名は必須です。'),
});

interface IFormInput {
  name: string;
}

const ListenersPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: listeners, isLoading } = useQuery({
    queryKey: ['listeners'],
    queryFn: async () => {
      const response = await listenerService.getListeners();
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (name: string) => listenerService.createListener(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listeners'] });
      reset();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: IFormInput) => {
    mutation.mutate(data.name);
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>リスナー管理</h1>

      {/* Add Listener Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='mb-8 p-4 bg-white shadow-md rounded-lg'
      >
        <h2 className='text-xl font-semibold mb-4'>新しいリスナーを追加</h2>
        <div className='flex items-start space-x-4'>
          <div className='flex-grow'>
            <input
              {...register('name')}
              placeholder='リスナー名'
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            {errors.name && (
              <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>
            )}
          </div>
          <button
            type='submit'
            disabled={mutation.isPending}
            className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400'
          >
            {mutation.isPending ? '追加中...' : '追加'}
          </button>
        </div>
      </form>

      {/* Listeners List */}
      <div className='space-y-4'>
        <ul>
          {listeners && listeners.length > 0 ? (
            listeners.map((listener: any) => (
              <ListenerListItem key={listener.id} listener={listener} />
            ))
          ) : (
            <p>リスナーが登録されていません。</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ListenersPage;
