import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const MainLayout: React.FC = () => {
  return (
    <div className='min-h-screen bg-gray-100'>
      <Header />
      <main className='container mx-auto p-4'>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
