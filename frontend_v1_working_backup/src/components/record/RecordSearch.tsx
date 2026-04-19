import { Icon } from '@iconify/react';

interface RecordSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function RecordSearch({ value, onChange }: RecordSearchProps) {
  return (
    <div className="relative mb-6">
      <Icon
        icon="solar:magnifer-linear"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[14px] border-[1.5px] border-[#f0f0f0] bg-[#fafafa] py-3.5 pl-11 pr-4 text-sm text-[#1a1a1a] outline-none transition-all placeholder:text-[#b0b0b0] focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-500/[0.08]"
        placeholder="Поиск по историям..."
      />
    </div>
  );
}
