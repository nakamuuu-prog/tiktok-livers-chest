import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import {
  Music,
  Home,
  Users,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  UserPlus,
  UserCog,
} from 'lucide-react';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userNavigation = [
    { name: 'ダッシュボード', href: '/dashboard', icon: Home },
    { name: 'リスナー管理', href: '/listeners', icon: Users },
  ];

  const adminNavigation = [
    { name: '管理ダッシュボード', href: '/admin', icon: ShieldCheck },
    { name: '事前登録ユーザー', href: '/admin/pre-registered-users', icon: UserPlus },
    { name: 'ユーザー管理', href: '/admin/users', icon: UserCog },
  ];

  const navigation = user?.isAdmin ? adminNavigation : userNavigation;

  const isActive = (href: string) => {
    // Exact match for admin root, otherwise startsWith
    if (href === '/admin') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const NavLinks: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
            className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors ${
              isMobile ? 'text-base' : 'text-sm'
            } ${
              isActive(item.href)
                ? 'text-pink-600 bg-pink-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon className={`mr-3 ${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Navigation Bar */}
      <nav className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            {/* Logo and Brand */}
            <div className='flex items-center'>
              <Link to='/dashboard' className='flex items-center'>
                <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-lg mr-3'>
                  <Music className='w-5 h-5 text-white' />
                </div>
                <span className='text-xl font-bold bg-gradient-to-r from-pink-600 to-cyan-600 bg-clip-text text-transparent'>
                  TikTok Liver's Chest
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className='hidden md:flex items-center space-x-4'>
              <NavLinks />
            </div>

            {/* User Menu */}
            <div className='flex items-center space-x-2'>
              <div className='hidden md:flex items-center space-x-4'>
                <span className='text-sm text-gray-700'>
                  こんにちは、
                  <span className='font-medium'>{user?.username}</span>さん
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleLogout}
                  className='text-gray-600 hover:text-gray-900'
                >
                  <LogOut className='w-4 h-4 mr-2' />
                  ログアウト
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <div className='md:hidden'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden'>
            <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200'>
              <NavLinks isMobile />
              <div className='border-t border-gray-200 pt-4 pb-3'>
                <div className='px-3 mb-3'>
                  <p className='text-sm text-gray-700'>
                    こんにちは、
                    <span className='font-medium'>{user?.username}</span>さん
                  </p>
                </div>
                <Button
                  variant='ghost'
                  onClick={handleLogout}
                  className='w-full justify-start text-gray-600 hover:text-gray-900'
                >
                  <LogOut className='w-4 h-4 mr-2' />
                  ログアウト
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className='flex-1 container mx-auto p-4 md:p-6'>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;