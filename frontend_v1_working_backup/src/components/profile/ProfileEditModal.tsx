import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { usersService } from '@/services/users.service';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../ui/Avatar';
import type { User } from '@/models/models';

interface ProfileEditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditModal({ user, isOpen, onClose }: ProfileEditModalProps) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () => usersService.updateProfile(name, bio, avatarFile || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-records'] });
      queryClient.invalidateQueries({ queryKey: ['public-records'] });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      onClose();
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-neutral-900 leading-none">Настроить профиль</h2>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors">
                  <Icon icon="solar:close-circle-bold" className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar 
                      src={avatarPreview || ''} 
                      name={name} 
                      size="2xl" 
                      className="ring-4 ring-orange-500/10 group-hover:ring-orange-500/30 transition-all" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon icon="solar:camera-bold" className="text-white text-3xl" />
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <p className="mt-4 text-[10px] font-black text-orange-500 uppercase tracking-widest">Нажмите, чтобы изменить фото</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-2 mb-2 block">Ваше имя</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 text-sm focus:bg-white focus:border-orange-500 outline-none transition-all shadow-inner"
                      placeholder="Как вас зовут?"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-2 mb-2 block">О себе (Био)</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full px-5 py-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 text-sm focus:bg-white focus:border-orange-500 outline-none transition-all shadow-inner resize-none"
                      placeholder="Расскажите что-нибудь интересное..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full py-5 rounded-[24px] cta-btn text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/30 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {updateMutation.isPending ? 'Сохранение...' : 'Обновить профиль'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
