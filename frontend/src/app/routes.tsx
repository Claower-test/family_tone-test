/**
 * @file Route definitions
 * @description React Router route configuration with auth guards
 * @module app/routes
 */

import { createBrowserRouter, redirect } from 'react-router';
import { LandingPage } from '@/app/(landing)/LandingPage';
import { LoginPage } from '@/app/(auth)/LoginPage';
import { RegisterPage } from '@/app/(auth)/RegisterPage';
import { AppLayout } from '@/app/(app)/AppLayout';
import { RecordsPage } from '@/app/(app)/RecordsPage';
import { PublicPage } from '@/app/(app)/PublicPage';
import { ProfilePage } from '@/app/(app)/ProfilePage';
import UserProfileView from '@/app/(app)/UserProfileView';
import { useAuthStore } from '@/stores/auth.store';

export function requireAuth() {
  const token = useAuthStore.getState().token;
  if (!token) throw redirect('/login');
  return null;
}

export function requireNoAuth() {
  const token = useAuthStore.getState().token;
  if (token) throw redirect('/records');
  return null;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
    loader: requireNoAuth,
  },
  {
    path: '/register',
    element: <RegisterPage />,
    loader: requireNoAuth,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: '/records',
        element: <RecordsPage />,
        loader: requireAuth,
      },
      {
        path: '/public',
        element: <PublicPage />,
        loader: requireAuth,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
        loader: requireAuth,
      },
      {
        path: '/profile/:id',
        element: <UserProfileView />,
        loader: requireAuth,
      },
    ],
  },
]);
