/**
 * @file AudienceSection component
 * @description Four target audience cards in 2x2 grid
 * @module components/landing/AudienceSection
 */

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

const AUDIENCES = [
  {
    icon: 'solar:elderly-bold',
    title: 'Пожилые люди',
    description: 'Остаться с семьёй навсегда и передать мудрость потомкам своим настоящим голосом.',
  },
  {
    icon: 'solar:users-group-two-rounded-bold',
    title: 'Взрослые дети',
    description: 'Записать родителей и сохранить их истории, пока это ещё возможно.',
  },
  {
    icon: 'solar:baby-bold',
    title: 'Молодые родители',
    description: 'Сохранить первые слова, смех и голоса детей на каждом этапе взросления.',
  },
  {
    icon: 'solar:star-shine-bold',
    title: 'Все, кто боится быть забытым',
    description: 'Оставить после себя живой голос и настоящие эмоции, а не сухой список фактов.',
  },
] as const;

export function AudienceSection() {
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
            Для кого
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-neutral-900">
            Каждый голос<br />
            <span className="gradient-text">имеет значение</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="sketch-block divide-soft"
        >
          <div className="grid sm:grid-cols-2 divide-y sm:divide-x divide-soft">
            {AUDIENCES.map((audience) => (
              <div
                key={audience.title}
                className="p-10 md:p-14 group hover:bg-white transition-colors duration-500"
              >
                <Icon
                  icon={audience.icon}
                  className="text-3xl text-neutral-300 mb-6 block group-hover:text-brand transition-colors"
                />
                <h3 className="text-lg font-bold tracking-tight text-neutral-900 mb-2">
                  {audience.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {audience.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
