import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeLinkStyle = {
    fontWeight: 'bold',
    textDecoration: 'underline',
  };

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <header className='bg-gray-800 text-white shadow-md'>
      <div className='container mx-auto px-4 py-3 flex justify-between items-center'>
        <h1 className='text-xl font-bold'>
          {isAdminPage ? 'TikTok Livers Chest - Admin' : 'TikTok Livers Chest'}
        </h1>
        <nav className='flex items-center space-x-6'>
          {isAdminPage ? (
            <>
              <NavLink
                to='/admin'
                style={({ isActive }) =>
                  isActive ? activeLinkStyle : undefined
                }
                className='hover:text-gray-300'
              >
                管理者ダッシュボード
              </NavLink>
              <NavLink
                to='/admin/pre-registered-users'
                style={({ isActive }) =>
                  isActive ? activeLinkStyle : undefined
                }
                className='hover:text-gray-300'
              >
                事前登録ユーザー
              </NavLink>
              <NavLink
                to='/admin/users'
                style={({ isActive }) =>
                  isActive ? activeLinkStyle : undefined
                }
                className='hover:text-gray-300'
              >
                ユーザー管理
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to='/dashboard'
                style={({ isActive }) =>
                  isActive ? activeLinkStyle : undefined
                }
                className='hover:text-gray-300'
              >
                ダッシュボード
              </NavLink>
              <NavLink
                to='/listeners'
                style={({ isActive }) =>
                  isActive ? activeLinkStyle : undefined
                }
                className='hover:text-gray-300'
              >
                リスナー管理
              </NavLink>
            </>
          )}
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
