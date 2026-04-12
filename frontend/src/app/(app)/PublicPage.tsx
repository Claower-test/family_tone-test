import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { recordsService } from '@/services/records.service';
import { API_URL } from '@/utils/constants';
import { cn } from '@/utils/cn';
import { CommentSection } from '@/components/ui/CommentSection';
import { Avatar } from '@/components/ui/Avatar';

export function PublicPage() {
  const queryClient = useQueryClient();
  const [openComments, setOpenComments] = useState<number | null>(null);

  const { data: records, isLoading } = useQuery({
    queryKey: ['public-records'],
    queryFn: recordsService.getPublicRecords,
  });

  const reactionMutation = useMutation({
    mutationFn: (data: { id: number; type: number }) => 
      recordsService.toggleReaction('record', data.id, data.type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-records'] });
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        alert('Пожалуйста, войдите в аккаунт, чтобы ставить реакции!');
      } else {
        alert('Ошибка при сохранении реакции.');
      }
    }
  });

  const followMutation = useMutation({
    mutationFn: (userId: number) => recordsService.toggleFollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-records'] });
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        alert('Войдите в аккаунт, чтобы подписываться на авторов!');
      } else {
        alert('Не удалось подписаться. Попробуйте снова.');
      }
    }
  });

  const audioBaseUrl = API_URL.replace('/api', '');

  return (
    <div className="px-6 py-12">
      <div className="mb-16 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-[24px] bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/10">
          <Icon icon="solar:globus-bold" className="text-3xl" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-neutral-900 mb-4">
          Общие истории
        </h1>
        <p className="text-lg text-neutral-400 font-medium leading-relaxed">
          Пространство, где оживают воспоминания. Слушайте, делитесь и поддерживайте друг друга.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm font-bold text-neutral-400 tracking-widest uppercase">Загрузка ленты...</p>
        </div>
      ) : records && records.length > 0 ? (
        <div className="grid grid-cols-1 gap-10 max-w-2xl mx-auto pb-20">
          {records.map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: 'spring', damping: 20 }}
              className="bg-white rounded-[40px] border border-neutral-100 p-8 md:p-10 shadow-xl shadow-neutral-900/[0.02] hover:shadow-orange-500/[0.05] hover:border-orange-100 transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-8">
                <Link 
                  to={`/profile/${record.user_id}`}
                  className="flex items-center gap-4 hover:opacity-80 transition-opacity group"
                >
                  <Avatar 
                    src={record.author_avatar} 
                    name={record.author_name} 
                    size="md" 
                    className="shadow-lg shadow-orange-500/10 group-hover:scale-105 transition-transform" 
                  />
                  <div>
                    <h3 className="text-base font-black text-neutral-900 leading-none mb-1.5 underline decoration-orange-500/30 underline-offset-4 group-hover:text-orange-600 transition-colors">
                      {record.author_name}
                    </h3>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-black">
                      {new Date(record.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                
                <button
                  onClick={() => followMutation.mutate(record.user_id)}
                  disabled={followMutation.isPending}
                  className={cn(
                    "px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                    record.is_following 
                      ? "bg-neutral-50 text-neutral-300 border border-neutral-100" 
                      : "bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-500 hover:text-white hover:border-orange-500 shadow-sm active:scale-95"
                  )}
                >
                  {record.is_following ? 'Подписан' : 'Подписаться'}
                </button>
              </div>

              {/* Title & Player */}
              <div className="mb-8">
                <h2 className="text-2xl font-black text-neutral-900 mb-6 leading-tight pl-2 border-l-4 border-orange-500">
                  {record.title}
                </h2>
                <div className="p-4 bg-neutral-50 rounded-[28px] border border-neutral-100 shadow-inner">
                  <audio 
                    controls 
                    preload="metadata"
                    className="w-full h-11" 
                    src={`${audioBaseUrl}${record.file_path}`} 
                  />
                </div>
              </div>

              {/* Social Actions */}
              <div className="flex items-center gap-6 border-t border-neutral-50 pt-8 pl-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => reactionMutation.mutate({ id: record.id, type: 1 })}
                    className={cn(
                      "flex items-center gap-2 group transition-all",
                      record.user_reaction === 1 ? "text-red-500" : "text-neutral-400 hover:text-red-500"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-[20px] flex items-center justify-center transition-all duration-300",
                      record.user_reaction === 1 
                        ? "bg-red-50 shadow-lg shadow-red-500/10 scale-110" 
                        : "bg-neutral-50 group-hover:bg-red-50 group-hover:scale-110"
                    )}>
                      <Icon 
                        icon={record.user_reaction === 1 ? "solar:heart-bold" : "solar:heart-linear"} 
                        className="text-2xl" 
                      />
                    </div>
                    <span className="text-base font-black">{record.hearts_count}</span>
                  </button>

                  <button
                    onClick={() => reactionMutation.mutate({ id: record.id, type: -1 })}
                    className={cn(
                      "flex items-center gap-2 group transition-all",
                      record.user_reaction === -1 ? "text-neutral-800" : "text-neutral-400 hover:text-neutral-800"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-[20px] flex items-center justify-center transition-all duration-300",
                      record.user_reaction === -1 
                        ? "bg-neutral-100 shadow-lg shadow-neutral-900/10 scale-110" 
                        : "bg-neutral-50 group-hover:bg-neutral-100 group-hover:scale-110"
                    )}>
                      <Icon 
                        icon={record.user_reaction === -1 ? "solar:heart-broken-bold" : "solar:heart-broken-linear"} 
                        className="text-2xl" 
                      />
                    </div>
                    <span className="text-base font-black">{record.broken_hearts_count}</span>
                  </button>
                </div>

                <button
                  onClick={() => setOpenComments(openComments === record.id ? null : record.id)}
                  className={cn(
                    "flex items-center gap-3 group transition-all ml-auto",
                    openComments === record.id ? "text-orange-500" : "text-neutral-400 hover:text-orange-500"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-[20px] flex items-center justify-center transition-all duration-300",
                    openComments === record.id 
                      ? "bg-orange-50 shadow-lg shadow-orange-500/10 scale-110" 
                      : "bg-neutral-50 group-hover:bg-orange-50 group-hover:scale-110"
                  )}>
                    <Icon icon="solar:chat-line-linear" className="text-2xl" />
                  </div>
                  <span className="text-base font-black">{record.comments_count}</span>
                </button>
              </div>

              {/* Comment Feed */}
              <AnimatePresence>
                {openComments === record.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                  >
                    <CommentSection recordId={record.id} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl bg-neutral-50 flex items-center justify-center mb-6">
            <Icon icon="solar:dialog-bold" className="text-4xl text-neutral-200" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Общая лента пуста</h2>
          <p className="text-sm text-neutral-400 max-w-xs leading-relaxed">
            Похоже, никто еще не сделал свои истории публичными. Станьте первым!
          </p>
        </div>
      )}
    </div>
  );
}
