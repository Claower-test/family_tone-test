/**
 * @file MarqueeSection component
 * @description Social proof ticker with metrics
 * @module components/landing/MarqueeSection
 */

import { Marquee } from '@/components/ui/Marquee';

const METRICS = [
  '4.9 ★ App Store',
  '12 000+ семей',
  '340 000+ историй',
  '97% рекомендуют',
  'Приложение года',
  'iOS и Android',
] as const;

function MarqueeContent() {
  return (
    <div className="flex items-center gap-10 px-5 text-xs text-neutral-400">
      {METRICS.map((metric) => (
        <span key={metric} className="flex items-center gap-10">
          {metric}
          <span className="text-neutral-200">·</span>
        </span>
      ))}
    </div>
  );
}

export function MarqueeSection() {
  return (
    <Marquee>
      <MarqueeContent />
    </Marquee>
  );
}
