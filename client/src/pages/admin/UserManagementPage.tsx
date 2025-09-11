import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext'; // useAuthをインポート

interface User {
  id: number;
  username: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
}

const UserManagementPage = () => {
  const { user: currentUser } = useAuth(); // ログイン中のユーザー情報を取得
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get<User[]>('/admin/users');
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

  const handleToggleAdmin = async (id: number) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-admin`);
      fetchUsers();
    } catch (err) {
      setError('管理者権限の更新に失敗しました。');
    }
  };

  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>ユーザー管理</h1>
      {error && <p className='text-red-500 mb-4'>{error}</p>}
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className='min-w-full bg-white'>
            <thead className="bg-gray-100">
              <tr>
                <th className='py-2 px-4 text-left'>ユーザー名</th>
                <th className='py-2 px-4 text-left'>有効</th>
                <th className='py-2 px-4 text-left'>管理者</th>
                <th className='py-2 px-4 text-left'>登録日</th>
                <th className='py-2 px-4 text-left'>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className='py-2 px-4 font-medium'>{user.username}</td>
                  <td className='py-2 px-4'>
                    {user.isActive ? (
                      <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">はい</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">いいえ</span>
                    )}
                  </td>
                  <td className='py-2 px-4'>
                    {user.isAdmin ? (
                      <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">はい</span>
                     ) : (
                      <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">いいえ</span>
                     )}
                  </td>
                  <td className='py-2 px-4'>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className='py-2 px-4 space-x-2'>
                    <button
                      onClick={() => handleToggleActive(user.id)}
                      className={`py-1 px-2 rounded text-white text-sm ${
                        user.isActive
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {user.isActive ? '無効化' : '有効化'}
                    </button>
                    <button
                      onClick={() => handleToggleAdmin(user.id)}
                      className={`py-1 px-2 rounded text-white text-sm ${
                        user.id === currentUser?.id
                          ? 'bg-gray-400 cursor-not-allowed'
                          : user.isAdmin
                          ? 'bg-purple-500 hover:bg-purple-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                      disabled={user.id === currentUser?.id}
                    >
                      {user.isAdmin ? '管理者から外す' : '管理者に設定'}
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

export default UserManagementPage;
