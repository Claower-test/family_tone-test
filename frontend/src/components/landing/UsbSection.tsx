/**
 * @file UsbSection component
 * @description USB physical product showcase
 * @module components/landing/UsbSection
 */

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

const USB_FEATURES = [
  {
    icon: 'solar:shield-check-bold',
    iconBg: 'bg-brand-50',
    iconColor: 'text-brand-500',
    title: 'Двойная защита',
    description: 'Зашифрованное облако + физическая копия. Данные переживут любую технологию.',
  },
  {
    icon: 'solar:gift-bold',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    title: 'Корпус из дерева и металла',
    description: 'Стильный предмет на полке с гравировкой имени и года. Не магазинная флешка.',
  },
  {
    icon: 'solar:calendar-bold',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    title: 'Ежегодный ритуал',
    description: 'Каждый год — новый накопитель. Соберите коллекцию семейной памяти за десятилетия.',
  },
] as const;

export function UsbSection() {
  return (
    <section id="usb" className="bg-bg-soft py-32 md:py-44 px-6 relative overflow-hidden">
      <div className="orb orb-gradient-brand-subtle w-[700px] h-[700px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand mb-4">
            Уникальная фишка
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-neutral-900 mb-4">
            Физический<br />
            <span className="gradient-text">памятный дар</span>
          </h2>
          <p className="text-base text-neutral-500 font-light leading-relaxed">
            Каждый год — стильный USB-накопитель с вашим архивом. Не бэкап. Реликвия.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="sketch-block-white"
        >
          <div className="grid lg:grid-cols-2">
            <div className="p-12 md:p-20 flex items-center justify-center relative overflow-hidden step-bg-neutral">
              <div className="relative float-slow">
                <div className="usb-device w-56 h-80 p-6 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl cta-btn flex items-center justify-center mb-6">
                    <Icon icon="solar:microphone-3-bold" className="text-white text-2xl" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-400 mb-0.5">
                    Family Tone
                  </p>
                  <p className="text-[9px] text-neutral-600 mb-6">Архив 2025</p>
                  <div className="w-full rounded-lg bg-white/[0.03] border border-white/[0.04] p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] text-neutral-600 uppercase tracking-wider">Историй</span>
                      <span className="text-xs font-bold text-brand-400">73</span>
                    </div>
                    <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full w-[73%] cta-btn rounded-full" />
                    </div>
                  </div>
                  <div className="w-full rounded-lg bg-white/[0.03] border border-white/[0.04] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-neutral-600 uppercase tracking-wider">Время</span>
                      <span className="text-xs font-bold text-neutral-300">14 ч 32 мин</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 md:p-16 flex flex-col justify-center">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-8">
                Больше, чем флешка
              </h3>
              <div className="space-y-7">
                {USB_FEATURES.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-lg ${feature.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon icon={feature.icon} className={feature.iconColor} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-neutral-900 mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
