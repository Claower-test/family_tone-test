/**
 * @file App layout
 * @description Navigation shell for authenticated pages
 * @module app/(app)/AppLayout
 */

import { Outlet, NavLink } from 'react-router';
import { Icon } from '@iconify/react';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/records', label: 'Мои истории', icon: 'solar:library-bold' },
  { to: '/public', label: 'Публичные', icon: 'solar:globus-bold' },
  { to: '/profile', label: 'Профиль', icon: 'solar:user-bold' },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="sticky top-14 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all',
                  isActive 
                    ? 'text-orange-500 bg-orange-50' 
                    : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
                )
              }
            >
              <Icon icon={item.icon} className="text-lg" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
      <main className="max-w-4xl mx-auto py-8">
        <Outlet />
      </main>
    </div>
  );
}
