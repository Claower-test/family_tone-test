import { Icon } from '@iconify/react';
import type { Record } from '@/types/record.types';
import { RecordItem, RUSSIAN_MONTHS } from './RecordItem';

interface RecordListProps {
  records: Record[];
  playingId: number | null;
  onTogglePlay: (id: number) => void;
}

interface GroupedRecords {
  year: string;
  months: { month: string; records: Record[] }[];
}

function groupByYearMonth(records: Record[]): GroupedRecords[] {
  const sorted = [...records].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const yearMap = new Map<string, Map<number, Record[]>>();

  for (const record of sorted) {
    const d = new Date(record.created_at);
    const year = String(d.getFullYear());
    const month = d.getMonth();

    if (!yearMap.has(year)) yearMap.set(year, new Map());
    const monthMap = yearMap.get(year)!;
    if (!monthMap.has(month)) monthMap.set(month, []);
    monthMap.get(month)!.push(record);
  }

  return Array.from(yearMap.entries()).map(([year, monthMap]) => ({
    year,
    months: Array.from(monthMap.entries()).map(([monthIdx, recs]) => ({
      month: RUSSIAN_MONTHS[monthIdx],
      records: recs,
    })),
  }));
}

export function RecordList({ records, playingId, onTogglePlay }: RecordListProps) {
  if (records.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
          <Icon icon="solar:microphone-3-bold" className="text-3xl text-neutral-300" />
        </div>
        <p className="text-sm font-medium text-neutral-500">Ничего не найдено</p>
        <p className="text-xs text-neutral-400">Попробуйте другой запрос</p>
      </div>
    );
  }

  const groups = groupByYearMonth(records);

  return (
    <div>
      {groups.map((group) => (
        <div key={group.year}>
          <div className="sticky top-14 z-10 bg-white/92 py-3 px-1 mb-1 backdrop-blur-xl">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
              {group.year}
            </span>
          </div>
          {group.months.map((monthGroup) => (
            <div key={monthGroup.month}>
              <div className="px-1 mb-2 mt-4 first:mt-0">
                <span className="text-sm font-semibold text-neutral-700">
                  {monthGroup.month}
                </span>
              </div>
              {monthGroup.records.map((record) => (
                <RecordItem
                  key={record.id}
                  record={record}
                  isPlaying={playingId === record.id}
                  onTogglePlay={onTogglePlay}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
