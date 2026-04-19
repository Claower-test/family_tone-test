/**
 * @file HowItWorksSection component
 * @description Four-step "How it works" section with alternating layouts
 * @module components/landing/HowItWorksSection
 */

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

interface Step {
  number: string;
  numberBg: string;
  numberColor: string;
  label: string;
  heading: string;
  description: string;
  note: string;
  iconBg: string;
  iconColor: string;
  icon: string;
  bgClass: string;
  reverse: boolean;
}

const STEPS: Step[] = [
  {
    number: '01',
    numberBg: 'bg-brand-100',
    numberColor: 'text-brand-600',
    label: 'Получите вопрос',
    heading: 'Интуитивные вопросы',
    description:
      '«В чём была ваша первая любовь?», «Какой совет дали вам бабушка?», «О чём вы мечтали в 20 лет?» — 500+ вопросов, которые раскрывают историю жизни.',
    note: 'Вопросы адаптируются по мере заполнения вашей хронологии.',
    icon: 'solar:chat-round-dots-bold',
    iconBg: 'bg-brand-100',
    iconColor: 'text-brand-500',
    bgClass: 'step-bg-orange',
    reverse: false,
  },
  {
    number: '02',
    numberBg: 'bg-red-100',
    numberColor: 'text-red-600',
    label: 'Запишите ответ',
    heading: 'Одна кнопка — и говорите',
    description:
      'Нажмите запись — и рассказывайте сколько хотите. Без ограничений по времени, без редактирования. Просто ваш голос.',
    note: 'Интерфейс настолько прост, что справится даже бабушка.',
    icon: 'solar:microphone-3-bold',
    iconBg: '',
    iconColor: 'text-white',
    bgClass: 'step-bg-red',
    reverse: true,
  },
  {
    number: '03',
    numberBg: 'bg-purple-100',
    numberColor: 'text-purple-600',
    label: 'ИИ улучшает запись',
    heading: 'Магия за кулисами',
    description:
      'Убирает шум телевизора и эхо комнаты. Подбирает атмосферную картинку. Добавляет фоновую музыку по настроению. Вы получаете готовую историю.',
    note: 'Музыка и картинки — по желанию. Можно отключить.',
    icon: 'solar:magic-stick-3-bold',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-500',
    bgClass: 'step-bg-purple',
    reverse: false,
  },
  {
    number: '04',
    numberBg: 'bg-green-100',
    numberColor: 'text-green-600',
    label: 'Хранится вечно',
    heading: 'Облако + физический носитель',
    description:
      'Всё в зашифрованном облаке. На годовом тарифе — ещё и на стильном USB-накопителе, который становится семейной реликвией.',
    note: 'Данные не продаём, не передаём, не используем для ИИ.',
    icon: 'solar:cloud-bold',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-500',
    bgClass: 'step-bg-green',
    reverse: true,
  },
];

function StepCard({ step }: { step: Step }) {
  const illustration = (
    <div className={`p-10 md:p-16 flex items-center justify-center min-h-[300px] relative overflow-hidden ${step.bgClass}`}>
      <div className={`absolute ${step.reverse ? 'top-8 right-8' : 'top-8 left-8'} step-number`}>
        {step.number}
      </div>
      <div className="relative text-center">
        {step.number === '02' ? (
          <div className="relative">
            <div className="w-20 h-20 rounded-full cta-btn flex items-center justify-center">
              <Icon icon={step.icon} className="text-3xl text-white" />
            </div>
            <div className="absolute inset-0 rounded-full cta-btn pulse-soft" />
          </div>
        ) : (
          <>
            <div className={`w-20 h-20 rounded-3xl ${step.iconBg} flex items-center justify-center mx-auto mb-4 float-medium`}>
              <Icon icon={step.icon} className={`text-4xl ${step.iconColor}`} />
            </div>
            <p className="text-sm text-neutral-400 max-w-[200px] mx-auto">
              {step.number === '01' && 'Приложение задаёт глубокие вопросы'}
              {step.number === '03' && 'ИИ улучшает и оформляет каждую историю'}
              {step.number === '04' && 'Защищённое хранение навсегда'}
            </p>
          </>
        )}
      </div>
    </div>
  );

  const content = (
    <div className="p-10 md:p-16 flex flex-col justify-center">
      <div className="inline-flex items-center gap-2 mb-6">
        <span className={`w-6 h-6 rounded-md ${step.numberBg} ${step.numberColor} text-[10px] font-bold flex items-center justify-center`}>
          {step.number}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          {step.label}
        </span>
      </div>
      <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-4">
        {step.heading}
      </h3>
      <p className="text-sm text-neutral-500 leading-relaxed mb-6">
        {step.description}
      </p>
      <p className="text-xs text-neutral-400">{step.note}</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className="sketch-block-white mb-6 last:mb-0"
    >
      <div className="grid lg:grid-cols-2">
        <div className={`order-2 lg:order-${step.reverse ? '1' : '1'}`}>
          {step.reverse ? content : illustration}
        </div>
        <div className={`order-1 lg:order-${step.reverse ? '2' : '2'}`}>
          {step.reverse ? illustration : content}
        </div>
      </div>
    </motion.div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how" className="bg-bg-soft py-32 md:py-44 px-6 relative">
      <div className="orb orb-gradient-brand-subtle w-[500px] h-[500px] top-[20%] -left-[100px]" />
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand mb-4">
            Как это работает
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-neutral-900">
            Четыре шага.<br />
            <span className="gradient-text">Ноль сложностей.</span>
          </h2>
        </motion.div>

        {STEPS.map((step) => (
          <StepCard key={step.number} step={step} />
        ))}
      </div>
    </section>
  );
}
