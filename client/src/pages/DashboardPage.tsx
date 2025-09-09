import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import listenerService from '../services/listeners.service';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ListenerListItem from '../components/listeners/ListenerListItem';

// Form validation schema
const createSchema = yup.object().shape({
  name: yup.string().required('Listener name is required'),
});
type CreateFormData = yup.InferType<typeof createSchema>;

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  // --- React Query ---
  const { data: listeners, isLoading, isError, error } = useQuery({
    queryKey: ['listeners'],
    queryFn: () => listenerService.getListeners().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => listenerService.createListener(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listeners'] });
    },
  });

  // --- React Hook Form ---
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateFormData>({
    resolver: yupResolver(createSchema),
  });

  const onCreateSubmit = (data: CreateFormData) => {
    createMutation.mutate(data.name);
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900">Welcome, {user?.username}</h1>
          <button
            onClick={logout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Add Listener Form */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Add New Listener</h3>
              <form onSubmit={handleSubmit(onCreateSubmit)} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="name" className="sr-only">Listener Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter listener name"
                    {...register('name')}
                    className={`block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Adding...' : 'Add Listener'}
                </button>
                {createMutation.isError && <p className="mt-2 text-sm text-red-600">An error occurred: {createMutation.error.message}</p>}
              </form>
            </div>
          </div>

          {/* Right Column: Listeners List */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Listeners</h3>
              <div className="mt-4">
                {isLoading && <p>Loading listeners...</p>}
                {isError && <p className="text-red-600">Error fetching listeners: {error.message}</p>}
                {listeners && listeners.length === 0 && <p className="text-gray-500">No listeners added yet.</p>}
                <ul className="space-y-3">
                  {listeners?.map(listener => (
                    <ListenerListItem key={listener.id} listener={listener} />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
