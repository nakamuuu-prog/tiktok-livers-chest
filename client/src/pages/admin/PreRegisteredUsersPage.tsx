import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

interface PreRegisteredUser {
  id: number;
  username: string;
  isRegistered: boolean;
  createdAt: string;
  registeredAt: string | null;
  user: {
    id: number;
    isActive: boolean;
    createdAt: string;
  } | null;
}

const PreRegisteredUsersPage = () => {
  const [users, setUsers] = useState<PreRegisteredUser[]>([]);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const fetchUsers = useCallback(async () => {
    // Make sure we are authenticated and the user is an admin before fetching
    if (!isAuthLoading && isAuthenticated) {
      try {
        setLoading(true);
        const response = await api.get<PreRegisteredUser[]>('/admin/pre-registered-users');
        setUsers(response.data);
        setError('');
      } catch (err) {
        setError('ユーザーの取得に失敗しました。権限がありません。');
      } finally {
        setLoading(false);
      }
    } else if (!isAuthLoading && !isAuthenticated) {
      // If not authenticated and loading is finished, stop loading and clear users
      setLoading(false);
      setUsers([]);
    }
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('ユーザー名を入力してください。');
      return;
    }
    try {
      await api.post('/admin/pre-register', { username });
      setUsername('');
      fetchUsers();
    } catch (err) {
      setError('ユーザー名の登録に失敗しました。すでに存在している可能性があります。');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('この事前登録ユーザーを削除しますか？')) {
      try {
        await api.delete(`/admin/pre-registered-users/${id}`);
        fetchUsers();
      } catch (err) {
        setError('ユーザーの削除に失敗しました。');
      }
    }
  };

  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>事前登録ユーザー管理</h1>
      <form onSubmit={handleRegister} className='mb-6 p-4 bg-gray-50 rounded-lg'>
        <div className='flex items-center'>
          <input
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder='登録したいTikTokユーザー名を入力'
            className='border p-2 mr-2 w-full md:w-1/3'
          />
          <button type='submit' className='bg-blue-500 text-white p-2 rounded hover:bg-blue-600'>
            事前登録
          </button>
        </div>
        {error && <p className='text-red-500 mt-2'>{error}</p>}
      </form>

      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <Spinner size={48} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className='min-w-full bg-white'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='py-2 px-4 text-left'>ユーザー名</th>
                <th className='py-2 px-4 text-left'>ステータス</th>
                <th className='py-2 px-4 text-left'>事前登録日</th>
                <th className='py-2 px-4 text-left'>本登録日</th>
                <th className='py-2 px-4 text-left'>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className='border-b hover:bg-gray-50'>
                  <td className='py-2 px-4 font-medium'>{user.username}</td>
                  <td className='py-2 px-4'>
                    {user.isRegistered ? (
                      <span className='px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full'>
                        登録済み
                      </span>
                    ) : (
                      <span className='px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full'>
                        未登録
                      </span>
                    )}
                  </td>
                  <td className='py-2 px-4'>
                    {new Date(user.createdAt).toLocaleString()}
                  </td>
                  <td className='py-2 px-4'>
                    {user.registeredAt
                      ? new Date(user.registeredAt).toLocaleString()
                      : 'N/A'}
                  </td>
                  <td className='py-2 px-4'>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className={`p-1 rounded text-white text-sm ${
                        user.isRegistered
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                      disabled={user.isRegistered}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PreRegisteredUsersPage;