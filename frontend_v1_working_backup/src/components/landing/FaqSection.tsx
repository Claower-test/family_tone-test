/**
 * @file FaqSection component
 * @description FAQ section with accordion
 * @module components/landing/FaqSection
 */

import { motion } from 'framer-motion';
import { FaqAccordion } from '@/components/ui/FaqAccordion';

const FAQ_ITEMS = [
  {
    question: 'Куда сохраняются мои записи?',
    answer: 'В зашифрованном закрытом облаке на серверах в России. На годовом тарифе — дополнительно на USB-накопителе, который отправляем по почте.',
  },
  {
    question: 'Смогут ли бабушка или дедушка пользоваться?',
    answer: 'Да. Один экран, одна кнопка, крупный шрифт. Можно включить режим озвучивания вопросов голосом — не нужно даже читать с экрана.',
  },
  {
    question: 'Что происходит с моими данными?',
    answer: 'Ничего. Мы не продаём, не передаём и не используем их для обучения ИИ. Данные зашифрованы, доступ только у вас и тех, кому вы сами дадите его.',
  },
  {
    question: 'Как выглядит физический накопитель?',
    answer: 'USB в корпусе из натурального дерева и металла с гравировкой имени и года. Выглядит как предмет на полке — не как флешка из магазина.',
  },
  {
    question: 'Можно ли отменить подписку?',
    answer: 'В любой момент из настроек. Записи останутся до конца оплаченного периода. На бесплатном тарифе хранятся 6 месяцев.',
  },
] as const;

export function FaqSection() {
  return (
    <section className="bg-bg-soft py-32 md:py-44 px-6 relative">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[0.9] text-neutral-900">
            Частые <span className="gradient-text">вопросы</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <FaqAccordion items={[...FAQ_ITEMS]} />
        </motion.div>
      </div>
    </section>
  );
}
