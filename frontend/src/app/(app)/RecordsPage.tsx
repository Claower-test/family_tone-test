import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRecords } from '@/hooks/useRecords';
import { recordsService } from '@/services/records.service';
import { RecordStats, RecordSearch, RecordList } from '@/components/record';
import { cn } from '@/utils/cn';
import { API_URL } from '@/utils/constants';

export function RecordsPage() {
  const { data: records, isLoading, error } = useRecords();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounterRef = useRef(0);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current = null;
      }
    };
  }, []);

  function getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        const duration = isFinite(audio.duration) ? Math.round(audio.duration) : 0;
        URL.revokeObjectURL(audio.src);
        resolve(duration);
      });
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(audio.src);
        resolve(0);
      });
      audio.src = URL.createObjectURL(file);
    });
  }

  async function uploadFile(file: File) {
    setIsUploading(true);
    try {
      const duration = await getAudioDuration(file);
      const title = file.name.replace(/\.[^.]+$/, '');
      await recordsService.upload(file, title, duration);
      await queryClient.invalidateQueries({ queryKey: ['records'] });
    } catch {
      // Error is shown via the global interceptor
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }

  const filtered = useMemo(() => {
    if (!records) return [];
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter((r) => r.title.toLowerCase().includes(q));
  }, [records, search]);

  const totalSeconds = useMemo(
    () => (records ?? []).reduce((sum, r) => sum + r.duration, 0),
    [records],
  );

  const handleTogglePlay = useCallback(
    (id: number) => {
      if (playingId === id) {
        audioRef.current?.pause();
        setPlayingId(null);
        return;
      }

      const record = records?.find((r) => r.id === id);
      if (!record) return;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current = null;
      }

      const baseUrl = new URL(API_URL).origin;
      const audio = new Audio(`${baseUrl}${record.file_path}`);

      const onEnd = () => {
        clearTimeout(timeout);
        audio.removeEventListener('ended', onEnd);
        audio.removeEventListener('error', onEnd);
        setPlayingId(null);
      };
      audio.addEventListener('ended', onEnd);
      audio.addEventListener('error', onEnd);

      // Safety timeout — short webm files may have invalid duration metadata
      const safetyMs = Math.max(record.duration * 1000 + 1000, 2000);
      const timeout = setTimeout(onEnd, safetyMs);

      audio.play();
      audioRef.current = audio;
      setPlayingId(id);
    },
    [playingId, records],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Icon icon="solar:refresh-bold" className="animate-spin text-2xl text-neutral-300" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <Icon icon="solar:danger-triangle-bold" className="text-2xl text-red-400" />
        </div>
        <p className="text-sm font-medium text-neutral-600">Не удалось загрузить записи</p>
        <p className="mt-1 text-xs text-neutral-400">Попробуйте обновить страницу</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="mb-1 text-xs text-neutral-400">Добро пожаловать</p>
        <h2 className="text-2xl font-black tracking-tight text-neutral-900">
          Мои истории
        </h2>
      </div>

      <RecordStats count={records?.length ?? 0} totalSeconds={totalSeconds} />
      <RecordSearch value={search} onChange={setSearch} />
      <RecordList
        records={filtered}
        playingId={playingId}
        onTogglePlay={handleTogglePlay}
      />

      {/* Upload drop zone */}
      <div
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 transition-all',
          isDragging
            ? 'border-brand-400 bg-brand-50'
            : 'border-[#e5e5e5] bg-transparent hover:border-[#d4d4d4] hover:bg-[#fafafa]',
          isUploading && 'pointer-events-none opacity-50',
        )}
      >
        <Icon
          icon={isUploading ? 'solar:refresh-bold' : 'solar:upload-minimalistic-bold'}
          className={cn(
            'pointer-events-none text-xl',
            isDragging ? 'text-brand-500' : 'text-neutral-300',
            isUploading && 'animate-spin',
          )}
        />
        <p className={cn('pointer-events-none text-xs', isDragging ? 'text-brand-500' : 'text-neutral-400')}>
          {isUploading ? 'Загрузка...' : 'Перетащите аудиофайл или нажмите для загрузки'}
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
