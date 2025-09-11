import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import MainLayout from './components/common/MainLayout';
import ListenerDetailPage from './pages/ListenerDetailPage';
import ListenersPage from './pages/ListenersPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import PreRegisteredUsersPage from './pages/admin/PreRegisteredUsersPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import reportWebVitals from './reportWebVitals';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'listeners', element: <ListenersPage /> },
          { path: 'listeners/:id', element: <ListenerDetailPage /> },
          { index: true, element: <Navigate to="/dashboard" replace /> }
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
        {
            element: <MainLayout />,
            children: [
                { index: true, element: <AdminDashboardPage /> },
                { path: 'pre-registered-users', element: <PreRegisteredUsersPage /> },
                { path: 'users', element: <UserManagementPage /> },
            ]
        }
    ]
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
