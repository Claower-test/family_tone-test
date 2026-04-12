import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import { Avatar } from '@/components/ui/Avatar';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { SecurityModal } from '@/components/profile/SecurityModal';

export function ProfilePage() {
  const { logout: authLogout, user: authUser, token } = useAuthStore();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  const logout = () => {
    authLogout();
    navigate('/login');
  };

  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const profile = await usersService.getProfile();
      console.log('Fetched Current User Profile:', profile);
      return profile;
    },
    enabled: !!token,
  });

  useEffect(() => {
    console.log('Auth Store User:', authUser);
  }, [authUser]);

  const displayUser = userProfile || authUser;

  if (isLoading && !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-sm font-bold text-neutral-400 tracking-widest uppercase">Загрузка профиля...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center text-red-500">
        <Icon icon="solar:danger-bold" className="text-6xl mb-4" />
        <h2 className="text-xl font-bold">Ошибка загрузки данных</h2>
        <p className="mt-2 opacity-70">Пожалуйста, обновите страницу</p>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Icon icon="solar:user-block-bold" className="text-6xl text-neutral-200 mb-6" />
        <h2 className="text-2xl font-black text-neutral-900 mb-2">Вы не авторизованы</h2>
        <Link to="/login" className="text-orange-500 font-bold hover:underline">Войти в аккаунт</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <ProfileEditModal 
        user={displayUser} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />

      <SecurityModal 
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] border border-neutral-100 p-10 shadow-xl shadow-neutral-900/[0.02] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col items-center text-center mb-10">
          <Avatar 
            src={displayUser.avatar_url} 
            name={displayUser.name} 
            size="xl" 
            className="mb-6 ring-8 ring-orange-500/5 shadow-2xl" 
          />
          <h1 className="text-3xl font-black text-neutral-900 mb-2">{displayUser.name}</h1>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">{displayUser.email}</p>
          
          {displayUser.bio && (
            <p className="text-neutral-500 max-w-sm leading-relaxed mb-6">
              {displayUser.bio}
            </p>
          )}

          <div className="flex items-center justify-center gap-10 mb-8 border-y border-neutral-50 py-6 w-full max-w-sm">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-neutral-900">{(userProfile as any)?.records_count ?? 0}</span>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Истории</span>
            </div>
            <div className="w-px h-8 bg-neutral-100" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-neutral-900">{(userProfile as any)?.followers_count ?? 0}</span>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Подписчики</span>
            </div>
            <div className="w-px h-8 bg-neutral-100" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-neutral-900">{(userProfile as any)?.following_count ?? 0}</span>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Подписки</span>
            </div>
          </div>

          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-10 py-3.5 rounded-2xl bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
          >
            Настроить профиль
          </button>
        </div>

        <div className="space-y-3 mb-12">
          <div 
            onClick={() => setIsSecurityModalOpen(true)}
            className="group p-5 rounded-3xl bg-neutral-50 border border-neutral-100 flex items-center justify-between hover:bg-white hover:border-orange-200 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 text-sm font-bold text-neutral-700">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-neutral-400 group-hover:text-orange-500 transition-colors shadow-sm">
                <Icon icon="solar:shield-keyhole-bold" />
              </div>
              <span>Безопасность и пароль</span>
            </div>
            <Icon icon="solar:alt-arrow-right-bold" className="text-neutral-300 transition-transform group-hover:translate-x-1" />
          </div>

          <div className="group p-5 rounded-3xl bg-neutral-50 border border-neutral-100 flex items-center justify-between hover:bg-white hover:border-orange-200 transition-all cursor-pointer">
            <div className="flex items-center gap-4 text-sm font-bold text-neutral-700">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-neutral-400 group-hover:text-orange-500 transition-colors shadow-sm">
                <Icon icon="solar:bell-bing-bold" />
              </div>
              <span>Уведомления</span>
            </div>
            <div className="w-10 h-5 bg-orange-500 rounded-full relative shadow-inner">
              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 py-5 rounded-[24px] border-2 border-dashed border-neutral-100 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all active:scale-[0.98]"
        >
          <Icon icon="solar:logout-bold" className="text-lg" />
          Выйти из аккаунта
        </button>
      </motion.div>

      <p className="mt-12 text-center text-[10px] text-neutral-300 uppercase tracking-[0.4em] font-black opacity-50">
        FamilyTone • Established 2026
      </p>
    </div>
  );
}
