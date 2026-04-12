/**
 * @file ProblemSection component
 * @description Problem statement with three pain point cards
 * @module components/landing/ProblemSection
 */

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

const PAIN_POINTS = [
  {
    icon: 'solar:gallery-bold',
    iconBg: 'bg-orange-50',
    iconColor: 'text-brand',
    title: 'Тысячи фотографий',
    description:
      'Терабайты фото и видео, но ни одна фотография не передаст, как человек смеялся или рассказывал историю своим голосом.',
  },
  {
    icon: 'solar:ghost-bold',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    title: 'Исчезающие голоса',
    description:
      'Когда близкого нет рядом, мы понимаем — не записали его голос. Через три поколения о нём не останется воспоминаний.',
  },
  {
    icon: 'solar:pen-new-round-bold',
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-500',
    title: 'Никто не пишет мемуары',
    description:
      'Написать книгу о жизни — пугающе сложно. А поговорить голосом за чашкой чая — естественно и просто.',
  },
] as const;

const STATS = [
  { value: '92%', label: 'жалеют о незаписанных голосах' },
  { value: '3Gen', label: 'срок потери живой памяти' },
  { value: '1 тап', label: 'чтобы начать запись' },
] as const;

export function ProblemSection() {
  return (
    <section className="py-32 md:py-44 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand mb-4">
            Проблема
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-neutral-900">
            Сохраняем фото.<br />
            <span className="gradient-text">Теряем голоса.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="sketch-block divide-soft"
        >
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-soft">
            {PAIN_POINTS.map((point) => (
              <div
                key={point.title}
                className="p-10 md:p-14 group hover:bg-white transition-colors duration-500"
              >
                <div className={`w-12 h-12 rounded-2xl ${point.iconBg} flex items-center justify-center mb-8 feat-icon`}>
                  <Icon icon={point.icon} className={`text-2xl ${point.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-neutral-900 mb-3">
                  {point.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="grid grid-cols-3 gap-8 mt-14 max-w-2xl mx-auto text-center"
        >
          {STATS.map((stat) => (
            <div key={stat.value}>
              <p className="text-3xl sm:text-4xl font-black gradient-text mb-1">
                {stat.value}
              </p>
              <p className="text-[11px] text-neutral-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
