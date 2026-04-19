interface RecordStatsProps {
  count: number;
  totalSeconds: number;
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function RecordStats({ count, totalSeconds }: RecordStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="rounded-2xl border border-[#f0f0f0] bg-[#fafafa] p-3 text-center transition-all hover:border-[#e8e8e8] hover:bg-white">
        <p className="text-lg font-black gradient-text">{count}</p>
        <p className="text-[9px] font-medium uppercase tracking-wider text-neutral-400">
          Записей
        </p>
      </div>
      <div className="rounded-2xl border border-[#f0f0f0] bg-[#fafafa] p-3 text-center transition-all hover:border-[#e8e8e8] hover:bg-white">
        <p className="text-lg font-black gradient-text">{formatDuration(totalSeconds)}</p>
        <p className="text-[9px] font-medium uppercase tracking-wider text-neutral-400">
          Часов
        </p>
      </div>
    </div>
  );
}
