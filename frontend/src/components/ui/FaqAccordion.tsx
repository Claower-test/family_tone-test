/**
 * @file FaqAccordion component
 * @description Single-open accordion with smooth expand/collapse animation
 * @module components/ui/FaqAccordion
 */

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/utils/cn';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="sketch-block-white divide-soft">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="faq-item">
            <button
              className="w-full flex items-center justify-between p-6 md:p-8 text-left"
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span className="font-semibold text-sm text-neutral-900 pr-4">
                {item.question}
              </span>
              <Icon
                icon="solar:add-linear"
                className={cn(
                  'text-neutral-300 text-lg flex-shrink-0 transition-transform duration-400',
                  isOpen && 'rotate-45',
                )}
              />
            </button>
            <div className={cn('faq-content', isOpen && 'open')}>
              <div>
                <p className="px-6 md:px-8 pb-6 md:pb-8 text-sm text-neutral-500 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
