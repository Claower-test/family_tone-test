import { Icon } from '@iconify/react';
import { cn } from '@/utils/cn';
import { API_URL } from '@/utils/constants';
import type { Record } from '@/types/record.types';

const RUSSIAN_MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
] as const;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${RUSSIAN_MONTHS[d.getMonth()]}`;
}

interface RecordItemProps {
  record: Record;
  isPlaying: boolean;
  onTogglePlay: (id: number) => void;
}

export function RecordItem({ record, isPlaying, onTogglePlay }: RecordItemProps) {
  async function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    const baseUrl = new URL(API_URL).origin;
    const url = `${baseUrl}${record.file_path}`;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${record.title}.webm`;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  }

  return (
    <div
      className={cn(
        'mb-2 flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all',
        isPlaying
          ? 'border-brand-200 bg-brand-50'
          : 'border-[#f0f0f0] bg-[#fafafa] hover:border-[#e8e8e8] hover:bg-white',
      )}
      onClick={() => onTogglePlay(record.id)}
    >
      {/* Play button */}
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors',
          isPlaying ? 'bg-brand-100' : 'bg-neutral-100',
        )}
      >
        {isPlaying ? (
          <div className="flex items-end gap-[2px] h-4">
            <div className="play-bar" style={{ '--h': '12px', animationDelay: '0s' } as React.CSSProperties} />
            <div className="play-bar" style={{ '--h': '16px', animationDelay: '0.15s' } as React.CSSProperties} />
            <div className="play-bar" style={{ '--h': '10px', animationDelay: '0.3s' } as React.CSSProperties} />
          </div>
        ) : (
          <Icon
            icon="solar:play-bold"
            className={cn('text-lg', isPlaying ? 'text-brand-500' : 'text-neutral-400')}
          />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-800">
          {record.title}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[11px] text-neutral-400">
            {formatDate(record.created_at)}
          </span>
          <span className="text-[11px] text-neutral-300">&middot;</span>
          <span className="text-[11px] text-neutral-400">
            {formatDuration(record.duration)}
          </span>
        </div>
      </div>

      {/* Download */}
      <button onClick={handleDownload} className="flex-shrink-0">
        <Icon
          icon="solar:download-minimalistic-bold"
          className="text-lg text-neutral-300 transition-colors hover:text-neutral-500"
        />
      </button>
    </div>
  );
}

export { RUSSIAN_MONTHS };
