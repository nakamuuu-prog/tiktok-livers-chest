import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

const Header: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeLinkStyle = {
    fontWeight: 'bold',
    textDecoration: 'underline',
  };

  return (
    <header className='bg-gray-800 text-white shadow-md'>
      <div className='container mx-auto px-4 py-3 flex justify-between items-center'>
        <h1 className='text-xl font-bold'>TikTok Livers Chest</h1>
        <nav className='flex items-center space-x-6'>
          <NavLink
            to='/'
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            className='hover:text-gray-300'
          >
            ダッシュボード
          </NavLink>
          <NavLink
            to='/listeners'
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            className='hover:text-gray-300'
          >
            リスナー管理
          </NavLink>
          <button
            onClick={handleLogout}
            className='flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded'
          >
            <FaSignOutAlt />
            <span>ログアウト</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
