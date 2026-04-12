/**
 * @file Register page
 * @description User registration page with form validation and mock API integration
 * @module app/(auth)/RegisterPage
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/utils/cn';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function validate(): FormErrors {
    const result: FormErrors = {};
    if (!name.trim()) {
      result.name = 'Введите имя';
    } else if (name.trim().length < 2) {
      result.name = 'Имя должно быть не менее 2 символов';
    }
    if (!email.trim()) {
      result.email = 'Введите email';
    } else if (!EMAIL_RE.test(email)) {
      result.email = 'Некорректный формат email';
    }
    if (!password) {
      result.password = 'Введите пароль';
    } else if (password.length < 6) {
      result.password = 'Пароль должен быть не менее 6 символов';
    }
    if (!confirmPassword) {
      result.confirmPassword = 'Подтвердите пароль';
    } else if (password !== confirmPassword) {
      result.confirmPassword = 'Пароли не совпадают';
    }
    return result;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    try {
      await register(name.trim(), email, password);
      navigate('/records');
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Ошибка регистрации. Попробуйте снова.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  const inputClasses = (hasError: boolean) =>
    cn(
      'w-full rounded-[14px] border-[1.5px] bg-[#fafafa] px-4 py-3.5 text-sm text-[#1a1a1a] outline-none transition-all placeholder:text-[#b0b0b0]',
      hasError ? 'border-[#fca5a5]' : 'border-[#f0f0f0]',
      'focus:border-[#fdba74] focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.08)]',
    );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fafafa] px-6">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Decorative orbs */}
      <div className="orb orb-gradient-brand w-[600px] h-[600px] top-[-10%] left-1/2 -translate-x-1/2" />
      <div className="orb orb-gradient-red-subtle w-[300px] h-[300px] bottom-[10%] right-[10%]" />
      <div className="orb orb-gradient-purple-subtle w-[200px] h-[200px] top-[30%] left-[5%]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2.5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl cta-btn shadow-lg shadow-orange-500/20">
              <Icon icon="solar:microphone-3-bold" className="text-xl text-white" />
            </div>
          </Link>
          <h1 className="mb-2 text-2xl font-black tracking-tight text-neutral-900">
            Создайте аккаунт
          </h1>
          <p className="text-sm leading-relaxed text-neutral-400">
            Начните записывать и сохранять
            <br />
            истории вашей семьи
          </p>
        </div>

        {/* Form card */}
        <div className="relative rounded-[20px] border border-[#f0f0f0] bg-white p-8 shadow-sm before:pointer-events-none before:absolute before:inset-[-1px] before:rounded-[21px] before:bg-[linear-gradient(135deg,rgba(249,115,22,0.1),transparent,rgba(239,68,68,0.05))] before:-z-10">
          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="mb-5">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                Имя
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={inputClasses(!!errors.name)}
                placeholder="Ваше имя"
                autoComplete="name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={inputClasses(!!errors.email)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={cn(
                    inputClasses(!!errors.password),
                    'pr-12',
                  )}
                  placeholder="Придумайте пароль"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
                >
                  <Icon
                    icon={showPassword ? 'solar:eye-closed-bold' : 'solar:eye-bold'}
                    className="text-lg"
                  />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                Подтвердите пароль
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                className={inputClasses(!!errors.confirmPassword)}
                placeholder="Повторите пароль"
                autoComplete="new-password"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* API error */}
            {apiError && (
              <p className="mb-4 text-center text-xs text-red-500">{apiError}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'cta-btn flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/15',
                isLoading && 'pointer-events-none opacity-70',
              )}
            >
              {isLoading ? 'Создаём...' : 'Создать аккаунт'}
              {!isLoading && <Icon icon="solar:arrow-right-linear" />}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          Уже есть аккаунт?{' '}
          <Link
            to="/login"
            className="font-semibold text-brand-500 transition-colors hover:text-brand-600"
          >
            Войти
          </Link>
        </p>

        {/* Trust indicators */}
        <div className="mt-8 flex items-center justify-center gap-4 text-neutral-300">
          <div className="flex items-center gap-1.5">
            <Icon icon="solar:shield-check-bold" className="text-xs" />
            <span className="text-[10px]">Шифрование</span>
          </div>
          <div className="h-3 w-px bg-neutral-200" />
          <div className="flex items-center gap-1.5">
            <Icon icon="solar:lock-bold" className="text-xs" />
            <span className="text-[10px]">Конфиденциальность</span>
          </div>
          <div className="h-3 w-px bg-neutral-200" />
          <div className="flex items-center gap-1.5">
            <Icon icon="solar:heart-bold" className="text-xs" />
            <span className="text-[10px]">12K+ семей</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
