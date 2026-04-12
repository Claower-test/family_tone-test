import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import { recordsService } from '@/services/records.service';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { API_URL } from '@/utils/constants';
import { cn } from '@/utils/cn';

export default function UserProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = parseInt(id || '0');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => usersService.getPublicProfile(userId),
    enabled: !!userId,
  });

  const followMutation = useMutation({
    mutationFn: () => recordsService.toggleFollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
    },
  });

  const audioBaseUrl = API_URL.replace('/api', '');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-sm font-bold text-neutral-400 tracking-widest uppercase">Загрузка профиля...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Icon icon="solar:user-block-bold" className="text-6xl text-neutral-200 mb-6" />
        <h2 className="text-2xl font-black text-neutral-900 mb-2">Пользователь не найден</h2>
        <button onClick={() => navigate('/public')} className="text-orange-500 font-bold hover:underline">Вернуться в ленту</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors mb-8 group"
      >
        <Icon icon="solar:alt-arrow-left-bold" className="text-xl group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">Назад</span>
      </button>

      {/* Profile Header */}
      <div className="mb-16 bg-white rounded-[40px] p-8 md:p-12 border border-neutral-100 shadow-xl shadow-neutral-900/[0.02] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full -ml-32 -mt-32 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <Avatar 
            src={profile.avatar_url} 
            name={profile.name} 
            size="2xl" 
            className="ring-8 ring-orange-500/5 shadow-2xl" 
          />
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-4xl font-black tracking-tight text-neutral-900">
                {profile.name}
              </h1>
              <button 
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className={cn(
                  "px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95",
                  profile.is_following
                    ? "bg-neutral-100 text-neutral-400"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                )}
              >
                {profile.is_following ? 'Уже подписаны' : 'Подписаться'}
              </button>
            </div>
            
            <p className="text-neutral-500 font-medium max-w-lg leading-relaxed mb-6">
              {profile.bio || `Участник сообщества Family Tone с ${new Date(profile.created_at).toLocaleDateString()}`}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-neutral-900">{profile.records_count}</span>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Истории</span>
              </div>
              <div className="w-px h-8 bg-neutral-100 hidden md:block" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-neutral-900">{profile.followers_count}</span>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Подписчики</span>
              </div>
              <div className="w-px h-8 bg-neutral-100 hidden md:block" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-neutral-900">{profile.following_count}</span>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Подписки</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-neutral-900 mb-8 flex items-center gap-2 pl-4">
        <Icon icon="solar:library-bold" className="text-orange-500" />
        Истории автора
      </h2>

      {profile.records && profile.records.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.records?.map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col p-6 rounded-3xl border border-neutral-100 bg-white hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/5 transition-all"
            >
              <h3 className="text-lg font-black text-neutral-900 mb-4 truncate group-hover:text-orange-600 transition-colors">
                {record.title}
              </h3>
              
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 mb-4 group-hover:bg-orange-50 transition-colors">
                <audio 
                  controls 
                  className="w-full h-10" 
                  src={`${audioBaseUrl}${record.file_path}`} 
                />
              </div>

              <div className="flex items-center gap-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest px-2">
                <div className="flex items-center gap-1.5">
                  <Icon icon="solar:heart-bold" className="text-red-400" />
                  {record.hearts_count}
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon icon="solar:chat-line-bold" className="text-orange-400" />
                  {record.comments_count}
                </div>
                <div className="ml-auto">
                  {new Date(record.created_at).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-neutral-50 rounded-[40px] border-2 border-dashed border-neutral-100">
          <Icon icon="solar:history-bold" className="text-4xl text-neutral-200 mb-4 mx-auto" />
          <p className="text-sm font-bold text-neutral-400">У автора пока нет публичных историй</p>
        </div>
      )}
    </div>
  );
}
