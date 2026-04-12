/**
 * @file Navbar component
 * @description Sticky glass-effect navigation bar with mobile menu
 * @module components/layout/Navbar
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/stores/auth.store';

const NAV_LINKS = [
  { href: '#how', label: 'Как работает' },
  { href: '#features', label: 'Возможности' },
  { href: '#usb', label: 'USB-архив' },
  { href: '#pricing', label: 'Тарифы' },
] as const;

interface MobileMenuProps {
  onClose: () => void;
  user: any;
  logout: () => void;
  isHome: boolean;
}

function MobileMenu({ onClose, user, logout, isHome }: MobileMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 bg-white/96 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center justify-center h-full gap-8">
        {isHome ? (
          NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="text-xl font-bold text-neutral-800"
            >
              {link.label}
            </a>
          ))
        ) : (
          <Link
            to="/records"
            onClick={onClose}
            className="text-xl font-bold text-neutral-800"
          >
            Мои записи
          </Link>
        )}

        <div className="w-12 h-px bg-neutral-100" />

        {!user ? (
          <>
            <Link
              to="/login"
              onClick={onClose}
              className="text-xl font-bold text-neutral-800"
            >
              Войти
            </Link>
            <Link
              to="/register"
              onClick={onClose}
              className="px-8 py-3 rounded-full cta-btn text-white font-bold"
            >
              Начать
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/profile"
              onClick={onClose}
              className="text-xl font-bold text-neutral-800"
            >
              Профиль
            </Link>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="text-xl font-bold text-red-500"
            >
              Выйти
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-neutral-400"
        >
          <Icon icon="solar:close-circle-linear" className="text-3xl" />
        </button>
      </div>
    </motion.div>
  );
}
export function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHome = location.pathname === '/';

  return (
    <>
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg cta-btn flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Icon
                icon="solar:microphone-3-bold"
                className="text-white text-sm"
              />
            </div>
            <span className="font-bold text-base tracking-tight text-neutral-900">
              FamilyTone
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isHome ? (
              NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  {link.label}
                </a>
              ))
            ) : (
              <Link
                to="/records"
                className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Мои записи
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="hidden sm:block text-sm font-semibold text-neutral-600 hover:text-neutral-900 px-4 py-2 transition-colors"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white cta-btn px-6 py-2.5 rounded-full shadow-lg shadow-orange-500/20"
                >
                  Начать
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm font-medium text-neutral-700"
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200">
                    <Icon icon="solar:user-bold" className="text-neutral-400" />
                  </div>
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs font-semibold text-neutral-400 hover:text-red-500 transition-colors"
                >
                  Выйти
                </button>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden ml-2 p-2 text-neutral-400 hover:text-neutral-900"
            >
              <Icon icon="solar:hamburger-menu-linear" className="text-2xl" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu 
            onClose={() => setIsMobileMenuOpen(false)} 
            user={user}
            logout={logout}
            isHome={isHome}
          />
        )}
      </AnimatePresence>
    </>
  );
}
