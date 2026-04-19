/**
 * @file TestimonialsSection component
 * @description Three testimonial cards with ratings
 * @module components/landing/TestimonialsSection
 */

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

const TESTIMONIALS = [
  {
    quote: 'Мама записала 45 историй за год. Когда слушаю, как она рассказывает о знакомстве с папой — плачу. Это бесценно.',
    initials: 'АК',
    name: 'Анна Козлова',
    city: 'Москва',
    avatarBg: 'bg-brand-100',
    avatarColor: 'text-brand-600',
  },
  {
    quote: 'USB стал главным подарком на Новый год. Дед слушал истории в машине и говорил — не знал, что я помню так много.',
    initials: 'ДМ',
    name: 'Дмитрий Михайлов',
    city: 'Санкт-Петербург',
    avatarBg: 'bg-blue-100',
    avatarColor: 'text-blue-600',
  },
  {
    quote: 'Ребёнку 8 месяцев, а у него уже 12 аудио-историй. Представляю, что будет через 10 лет. Спасибо за этот продукт.',
    initials: 'ЕС',
    name: 'Елена Соколова',
    city: 'Казань',
    avatarBg: 'bg-green-100',
    avatarColor: 'text-green-600',
  },
] as const;

function Stars() {
  return (
    <div className="flex gap-0.5 mb-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} icon="solar:star-bold" className="text-amber-400" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-bg-soft py-32 md:py-44 px-6 grid-bg relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand mb-4">
            Отзывы
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-neutral-900">
            Голоса, которые<br />
            <span className="gradient-text">меняют жизни</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="sketch-block-white divide-soft"
        >
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-soft">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.name} className="p-10 md:p-12">
                <Stars />
                <p className="text-sm text-neutral-600 leading-relaxed mb-8">
                  «{testimonial.quote}»
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${testimonial.avatarBg} flex items-center justify-center text-xs font-bold ${testimonial.avatarColor}`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-900">
                      {testimonial.name}
                    </p>
                    <p className="text-[10px] text-neutral-400">{testimonial.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
