/**
 * @file Navbar component
 * @description Sticky glass-effect navigation bar with mobile menu
 * @module components/layout/Navbar
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/stores/auth.store";
import { useProfile } from "@/hooks/useProfile";
import { API_URL } from "@/utils/constants";

const NAV_LINKS = [
  { href: "#how", label: "Как работает" },
  { href: "#features", label: "Возможности" },
  { href: "#usb", label: "USB-архив" },
  /* { href: '#pricing', label: 'Тарифы' }, */
] as const;

interface MobileMenuProps {
  onClose: () => void;
  token: string | null;
  avatarUrl?: string;
  onCtaClick: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

function MobileMenu({ onClose, token, avatarUrl, onCtaClick, onNavigate, onLogout }: MobileMenuProps) {
  const baseUrl = new URL(API_URL).origin;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 bg-white/96 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center justify-center h-full gap-6">
        {token && (
          <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden mb-2">
            {avatarUrl ? (
              <img
                src={`${baseUrl}${avatarUrl}`}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <Icon icon="solar:user-bold" className="text-xl text-brand-600" />
            )}
          </div>
        )}

        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="text-xl text-neutral-700"
          >
            {link.label}
          </a>
        ))}

        {token && (
          <>
            <button
              onClick={() => { onClose(); onNavigate("/records"); }}
              className="text-xl text-neutral-700"
            >
              Записи
            </button>
            <button
              onClick={() => { onClose(); onNavigate("/profile"); }}
              className="text-xl text-neutral-700"
            >
              Профиль
            </button>
          </>
        )}

        <button
          onClick={() => { onClose(); onCtaClick(); }}
          className="cta-btn inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-full mt-4"
        >
          {token ? "Записать" : "Начать"}
          <Icon icon="solar:arrow-right-linear" />
        </button>

        {token && (
          <button
            onClick={() => { onClose(); onLogout(); }}
            className="rounded-xl border-[1.5px] border-[#e5e5e5] px-5 py-2.5 text-xs font-semibold text-red-500 transition-all hover:border-red-300 hover:bg-red-50 mt-2"
          >
            Выйти из аккаунта
          </button>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-neutral-400"
        >
          <Icon icon="solar:close-circle-linear" className="text-2xl" />
        </button>
      </div>
    </motion.div>
  );
}

function AvatarMenu({
  avatarUrl,
  onNavigate,
  onLogout,
}: {
  avatarUrl?: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const baseUrl = new URL(API_URL).origin;

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const items = [
    { label: "Записи", icon: "solar:microphone-3-bold", action: () => onNavigate("/records") },
    { label: "Профиль", icon: "solar:user-bold", action: () => onNavigate("/profile") },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden"
      >
        {avatarUrl ? (
          <img
            src={`${baseUrl}${avatarUrl}`}
            alt="avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <Icon icon="solar:user-bold" className="text-sm text-brand-600" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[#f0f0f0] bg-white py-1.5 shadow-lg"
          >
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setIsOpen(false);
                  item.action();
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <Icon icon={item.icon} className="text-sm text-neutral-400" />
                {item.label}
              </button>
            ))}
            <div className="mx-3 my-1.5 border-t border-[#f0f0f0]" />
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs text-red-500 transition-colors hover:bg-red-50"
            >
              <Icon icon="solar:logout-2-bold" className="text-sm" />
              Выйти из аккаунта
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const { data: profile } = useProfile(!!token);
  const navigate = useNavigate();

  function handleCtaClick(e: React.MouseEvent) {
    e.preventDefault();
    if (token) {
      navigate("/records");
    } else {
      navigate("/register");
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    function handleChange(e: MediaQueryListEvent) {
      if (e.matches) setIsMobileMenuOpen(false);
    }
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md cta-btn flex items-center justify-center">
              <Icon
                icon="solar:microphone-3-bold"
                className="text-white text-xs"
              />
            </div>
            <span className="font-semibold text-sm tracking-tight text-neutral-900">
              FamilyTone
            </span>
          </a>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={handleCtaClick}
              className="text-xs font-semibold text-white cta-btn px-4 py-1.5 rounded-full"
            >
              {token ? "Записать" : "Начать"}
            </button>
            {token && (
              <AvatarMenu
                avatarUrl={profile?.avatar_url}
                onNavigate={navigate}
                onLogout={handleLogout}
              />
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen((o) => !o)}
            className="md:hidden text-neutral-400"
          >
            <Icon icon="solar:hamburger-menu-linear" className="text-lg" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            onClose={() => setIsMobileMenuOpen(false)}
            token={token}
            avatarUrl={profile?.avatar_url}
            onCtaClick={() => navigate(token ? "/records" : "/register")}
            onNavigate={navigate}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </>
  );
}
