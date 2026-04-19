import { NavLink } from 'react-router';
import { Icon } from '@iconify/react';
import { cn } from '@/utils/cn';

interface BottomNavBarProps {
  onRecord: () => void;
}

export function BottomNavBar({ onRecord }: BottomNavBarProps) {
  return (
    <div className="bottom-bar">
      <div className="max-w-2xl mx-auto flex items-end justify-around px-4 pt-1 pb-2">
        <NavLink
          to="/records"
          className={({ isActive }) => cn('tab-btn', isActive && 'active')}
        >
          <Icon icon="solar:headphones-round-bold" className="text-xl" />
          <span className="text-[9px] font-semibold tracking-wide">Записи</span>
        </NavLink>

        <button type="button" className="tab-btn" onClick={onRecord}>
          <div className="record-btn-float">
            <Icon icon="solar:microphone-3-bold" className="text-white text-xl relative z-10" />
          </div>
          <span className="text-[9px] font-semibold tracking-wide text-brand-500 mt-1">
            Запись
          </span>
        </button>

        <NavLink
          to="/profile"
          className={({ isActive }) => cn('tab-btn', isActive && 'active')}
        >
          <Icon icon="solar:user-bold" className="text-xl" />
          <span className="text-[9px] font-semibold tracking-wide">Профиль</span>
        </NavLink>
      </div>
    </div>
  );
}
