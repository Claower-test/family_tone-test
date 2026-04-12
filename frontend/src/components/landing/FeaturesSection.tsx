/**
 * @file FeaturesSection component
 * @description Six feature cards in a responsive grid
 * @module components/landing/FeaturesSection
 */

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

const FEATURES = [
  {
    icon: 'solar:microphone-3-bold',
    iconBg: 'bg-orange-50',
    iconColor: 'text-brand-500',
    title: 'Запись в один тап',
    description: 'Нажали — и говорите. Без настроек, без обучения.',
  },
  {
    icon: 'solar:magic-stick-3-bold',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    title: 'ИИ-очистка звука',
    description: 'Убирает шум, эхо, гул. Голос звучит чисто и близко.',
  },
  {
    icon: 'solar:music-notes-bold',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    title: 'Фоновая музыка',
    description: 'Подбирается под настроение. Ненавязчиво и атмосферно.',
  },
  {
    icon: 'solar:chat-round-dots-bold',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
    title: '500+ вопросов',
    description: 'О детстве, любви, работе, мечтах. Адаптируются по ходу.',
  },
  {
    icon: 'solar:users-group-two-rounded-bold',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    title: 'Семейный доступ',
    description: 'Делитесь историями. У каждого — свой профиль.',
  },
  {
    icon: 'solar:headphones-round-bold',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    title: 'Подкаст вашей жизни',
    description: 'Истории в хронологии. Включайте как аудиокнигу.',
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 md:py-44 px-6 grid-bg relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand mb-4">
            Возможности
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-neutral-900">
            Всё для того,<br />
            <span className="gradient-text">чтобы голос жил</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.1,
              }}
              className="sketch-block p-8 md:p-10 group"
            >
              <div className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center mb-6 feat-icon`}>
                <Icon icon={feature.icon} className={`text-xl ${feature.iconColor}`} />
              </div>
              <h3 className="font-bold tracking-tight text-neutral-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
