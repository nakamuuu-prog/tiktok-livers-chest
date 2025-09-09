import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Listener } from '../../services/listeners.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import listenerService from '../../services/listeners.service';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

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
  const queryClient = useQueryClient();

  // --- Form ---
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { name: listener.name },
  });

  // --- Mutations ---
  const updateMutation = useMutation({
    mutationFn: (data: { id: number; name: string }) => listenerService.updateListener(data.id, data.name),
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

  // --- Render ---
  if (isEditing) {
    return (
      <li className="bg-white p-4 rounded-lg shadow-md"><form onSubmit={handleSubmit(onUpdateSubmit)} className="flex items-center justify-between gap-4">
          <div className="flex-grow">
            <input
              {...register('name')}
              className={`block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div className="flex-shrink-0 space-x-2">
            <button type="submit" disabled={updateMutation.isPending} className="text-green-600 hover:text-green-900 text-sm disabled:opacity-50">Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-600 hover:text-gray-900 text-sm">Cancel</button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="bg-gray-50 p-4 rounded-md shadow-sm flex justify-between items-center">
      <Link to={`/listeners/${listener.id}`} className="font-medium text-gray-800 hover:text-indigo-600">
        {listener.name}
      </Link>
      <div className="space-x-2">
        <button onClick={() => setIsEditing(true)} className="text-indigo-600 hover:text-indigo-900 text-sm">Edit</button>
        <button 
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="text-red-600 hover:text-red-900 text-sm disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </li>
  );
};

export default ListenerListItem;
