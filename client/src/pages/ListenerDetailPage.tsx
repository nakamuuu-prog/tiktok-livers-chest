import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import listenerService from '../services/listeners.service';

const ListenerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const listenerId = parseInt(id || '0', 10);

  const { data: listener, isLoading, isError, error } = useQuery({
    queryKey: ['listener', listenerId],
    queryFn: () => listenerService.getListenerById(listenerId).then(res => res.data),
    enabled: !!listenerId, // Only run query if listenerId is valid
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link to="/" className="text-indigo-600 hover:text-indigo-900">&larr; Back to Dashboard</Link>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          {isLoading && <p>Loading listener details...</p>}
          {isError && <p className="text-red-600">Error: {error.message}</p>}
          {listener && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{listener.name}</h2>
              <p className="mt-2 text-sm text-gray-500">ID: {listener.id}</p>
              <p className="mt-1 text-sm text-gray-500">Created: {new Date(listener.createdAt).toLocaleString()}</p>
              <hr className="my-6" />
              <h3 className="text-lg font-medium text-gray-900">Battle Items</h3>
              <div className="mt-4">
                {/* Battle items list will go here */}
                <p className="text-gray-500">Battle item management will be implemented here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListenerDetailPage;
