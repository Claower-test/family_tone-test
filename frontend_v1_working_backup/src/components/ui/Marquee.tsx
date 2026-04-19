/**
 * @file Marquee component
 * @description Infinite horizontal scroll ticker
 * @module components/ui/Marquee
 */

import type { ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
}

export function Marquee({ children }: MarqueeProps) {
  return (
    <div className="marquee-wrap py-4">
      <div className="marquee-track">
        {children}
        {children}
      </div>
    </div>
  );
}
