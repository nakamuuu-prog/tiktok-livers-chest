import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError('ユーザーの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (id: number) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-active`);
      fetchUsers();
    } catch (err) {
      setError('ユーザーの状態の更新に失敗しました。');
    }
  };

  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>ユーザー管理</h1>
      {error && <p className='text-red-500'>{error}</p>}
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <table className='min-w-full bg-white'>
          <thead>
            <tr>
              <th className='py-2'>ユーザー名</th>
              <th className='py-2'>有効</th>
              <th className='py-2'>管理者</th>
              <th className='py-2'>登録日</th>
              <th className='py-2'>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id}>
                <td className='border px-4 py-2'>{user.username}</td>
                <td className='border px-4 py-2'>
                  {user.isActive ? 'はい' : 'いいえ'}
                </td>
                <td className='border px-4 py-2'>
                  {user.isAdmin ? 'はい' : 'いいえ'}
                </td>
                <td className='border px-4 py-2'>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className='border px-4 py-2'>
                  <button
                    onClick={() => handleToggleActive(user.id)}
                    className={`p-2 rounded ${
                      user.isActive ? 'bg-yellow-500' : 'bg-green-500'
                    } text-white`}
                  >
                    {user.isActive ? '無効化' : '有効化'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagementPage;
