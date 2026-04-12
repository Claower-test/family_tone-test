/**
 * @file Records page
 * @description Dashbord view for user's audio stories
 * @module app/(app)/RecordsPage
 */

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { recordsService } from '@/services/records.service';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/stores/auth.store';
import { VoiceRecorder } from '@/components/ui/VoiceRecorder';
import { Avatar } from '@/components/ui/Avatar';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { API_URL } from '@/utils/constants';
import { cn } from '@/utils/cn';

function SaveModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialTitle 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (title: string, isPublic: boolean) => void;
  initialTitle: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [isPublic, setIsPublic] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 w-full max-w-md rounded-[32px] shadow-2xl border border-neutral-100"
      >
        <h3 className="text-xl font-black text-neutral-900 mb-6">Сохранение истории</h3>
        
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 block">
              Название
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-neutral-50 border-2 border-neutral-100 focus:border-orange-500 outline-none transition-all font-medium"
              placeholder="Назовите вашу историю..."
              autoFocus
            />
          </div>

          <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-all">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 rounded-lg accent-orange-500"
            />
            <div className="flex-1">
              <span className="text-sm font-bold text-neutral-900 block">Опубликовать публично</span>
              <span className="text-[10px] text-neutral-400">Вашу историю смогут услышать другие пользователи</span>
            </div>
            <Icon icon="solar:globus-bold" className={cn("text-xl transition-colors", isPublic ? "text-orange-500" : "text-neutral-300")} />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border-2 border-neutral-100 text-sm font-bold text-neutral-400 hover:bg-neutral-50 transition-all"
            >
              Отмена
            </button>
            <button
              onClick={() => onSave(title, isPublic)}
              disabled={!title.trim()}
              className="flex-[2] py-4 rounded-2xl cta-btn text-sm font-bold text-white shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              Сохранить историю
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function RecordsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user: authUser } = useAuthStore();
  const [saveModalData, setSaveModalData] = useState<{ blob: Blob; duration: number } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: records, isLoading } = useQuery({
    queryKey: ['records'],
    queryFn: recordsService.getRecords,
  });

  const { data: userProfile } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: usersService.getProfile,
    enabled: !!authUser,
  });

  const displayUser = userProfile || authUser;

  const uploadMutation = useMutation({
    mutationFn: ({ title, duration, isPublic, blob }: { title: string; duration: number; isPublic: boolean; blob: Blob }) => 
      recordsService.uploadRecord(title, duration, isPublic, blob),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      setSaveModalData(null);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      alert('Ошибка при сохранении записи. Пожалуйста, попробуйте снова.');
    }
  });

  async function handleRecordingUpload(blob: Blob, duration: number) {
    setSaveModalData({ blob, duration });
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // We can't easily get duration of uploaded file without an audio element
    // Setting 0 for now as it's secondary
    setSaveModalData({ blob: file, duration: 0 });
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  async function performUpload(title: string, isPublic: boolean) {
    if (saveModalData) {
      await uploadMutation.mutateAsync({ 
        title, 
        duration: saveModalData.duration, 
        isPublic, 
        blob: saveModalData.blob 
      });
    }
  }

  const togglePublicMutation = useMutation({
    mutationFn: ({ id, isPublic }: { id: number; isPublic: boolean }) => 
      recordsService.togglePublic(id, isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });

  // Base URL for audio files
  const audioBaseUrl = API_URL.replace('/api', '');

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {displayUser && (
        <ProfileEditModal 
          user={displayUser} 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
        />
      )}

      {/* Profile Header section */}
      <div className="mb-16 bg-white rounded-[40px] p-8 md:p-12 border border-neutral-100 shadow-xl shadow-neutral-900/[0.02] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <Avatar 
            src={displayUser?.avatar_url} 
            name={displayUser?.name} 
            size="2xl" 
            className="ring-8 ring-orange-500/5 shadow-2xl" 
          />
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-4xl font-black tracking-tight text-neutral-900">
                {displayUser?.name}
              </h1>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg active:scale-95"
              >
                <Icon icon="solar:user-speak-bold" className="text-sm" />
                Настроить профиль
              </button>
            </div>
            
            <p className="text-neutral-500 font-medium max-w-lg leading-relaxed mb-6">
              {displayUser?.bio || 'Поделитесь своей историей с миром. Добавьте описание своего профиля в настройках.'}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-neutral-900">{records?.length || 0}</span>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Истории</span>
              </div>
              <div className="w-px h-8 bg-neutral-100 hidden md:block" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-neutral-900">0</span>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Подписчики</span>
              </div>
              <div className="w-px h-8 bg-neutral-100 hidden md:block" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-neutral-900">0</span>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Подписки</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <Icon icon="solar:microphone-bold" className="text-orange-500" />
          Создать запись
        </h2>
        
        <div className="flex flex-col gap-6">
          <VoiceRecorder 
            onUpload={handleRecordingUpload} 
            isUploading={uploadMutation.isPending} 
          />

          <div className="flex flex-col items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-orange-500 transition-all px-6 py-3 rounded-2xl hover:bg-orange-50"
            >
              <Icon icon="solar:upload-bold" className="text-xl" />
              Загрузить аудиофайл с компьютера
            </button>
          </div>
        </div>
      </div>

      <SaveModal
        isOpen={!!saveModalData}
        onClose={() => setSaveModalData(null)}
        onSave={performUpload}
        initialTitle={`История от ${new Date().toLocaleDateString()}`}
      />

      <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
        <Icon icon="solar:library-bold" className="text-orange-500" />
        Архив записей
      </h2>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">Загрузка архива...</p>
        </div>
      ) : records && records.length > 0 ? (
        <div className="grid gap-4">
          {[...records].reverse().map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group flex flex-col p-5 rounded-2xl border border-neutral-100 bg-white hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all"
            >
              <div className="flex items-center gap-5 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Icon icon="solar:music-note-bold" className="text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-neutral-900 truncate mb-0.5">
                    {record.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span>{new Date(record.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => togglePublicMutation.mutate({ id: record.id, isPublic: !record.is_public })}
                  disabled={togglePublicMutation.isPending}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                    record.is_public 
                      ? "bg-green-50 text-green-600 border border-green-100" 
                      : "bg-neutral-50 text-neutral-400 border border-neutral-100"
                  )}
                >
                  <Icon icon={record.is_public ? "solar:globus-bold" : "solar:lock-bold"} className="text-sm" />
                  {record.is_public ? "Публичная" : "Приватная"}
                </button>
              </div>
              
                <audio 
                controls 
                preload="metadata"
                className="w-full h-10 custom-audio" 
                src={`${audioBaseUrl}${record.file_path}`} 
                onError={(e) => console.error('Audio load error:', e)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 px-10 rounded-[32px] border-2 border-dashed border-neutral-100"
        >
          <div className="w-20 h-20 rounded-3xl bg-neutral-50 flex items-center justify-center mb-6">
            <Icon icon="solar:ghost-bold" className="text-4xl text-neutral-200" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Архив пуст</h2>
          <p className="text-sm text-neutral-400 text-center max-w-xs leading-relaxed">
            Ваши записи появятся здесь после того, как вы закончите свою первую историю.
          </p>
        </motion.div>
      )}
    </div>
  );
}
