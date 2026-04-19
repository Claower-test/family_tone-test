import { useState } from 'react';
import { Outlet, Link } from 'react-router';
import { Icon } from '@iconify/react';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { DevColorPicker } from '@/components/dev/DevColorPicker'; // TODO delete after agreed color
import { RecordingPanel } from '@/components/record/RecordingPanel';
import { useProfile } from '@/hooks/useProfile';
import { API_URL } from '@/utils/constants';

export function AppLayout() {
  const [isRecordingOpen, setIsRecordingOpen] = useState(false);
  const { data: profile } = useProfile();
  const baseUrl = new URL(API_URL).origin;

  return (
    <div className="min-h-screen bg-white">
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/records" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg cta-btn flex items-center justify-center">
              <Icon icon="solar:microphone-3-bold" className="text-white text-xs" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-neutral-900">
              FamilyTone
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden"
            >
              {profile?.avatar_url ? (
                <img
                  src={`${baseUrl}${profile.avatar_url}`}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Icon icon="solar:user-bold" className="text-sm text-brand-600" />
              )}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-5 pt-20 pb-32">
        <Outlet />
      </main>

      <BottomNavBar onRecord={() => setIsRecordingOpen(true)} />
      <RecordingPanel isOpen={isRecordingOpen} onClose={() => setIsRecordingOpen(false)} />
      <DevColorPicker /> {/* TODO delete after agreed color */}
    </div>
  );
}
