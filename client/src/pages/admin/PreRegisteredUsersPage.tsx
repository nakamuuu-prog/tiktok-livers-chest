import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';

const PreRegisteredUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/pre-registered-users');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/pre-register', { username });
      setUsername('');
      fetchUsers();
    } catch (err) {
      setError('ユーザー名の登録に失敗しました。すでに存在している可能性があります。');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/pre-registered-users/${id}`);
      fetchUsers();
    } catch (err) {
      setError('ユーザーの削除に失敗しました。');
    }
  };

  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>事前登録ユーザーID</h1>
      <form onSubmit={handleRegister} className='mb-4'>
        <input
          type='text'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder='ユーザー名を入力'
          className='border p-2 mr-2'
        />
        <button type='submit' className='bg-blue-500 text-white p-2 rounded'>
          登録
        </button>
      </form>
      {error && <p className='text-red-500'>{error}</p>}
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <ul>
          {users.map((user: any) => (
            <li
              key={user.id}
              className='flex justify-between items-center mb-2 p-2 border rounded'
            >
              <span>{user.username}</span>
              <button
                onClick={() => handleDelete(user.id)}
                className='bg-red-500 text-white p-1 rounded'
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PreRegisteredUsersPage;
