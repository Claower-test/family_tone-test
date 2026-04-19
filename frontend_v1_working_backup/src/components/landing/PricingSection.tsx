/**
 * @file PricingSection component
 * @description Three pricing plan cards with featured highlight
 * @module components/landing/PricingSection
 */

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { cn } from "@/utils/cn";

interface PlanFeature {
  text: string;
  included: boolean;
  bold?: boolean;
}

interface Plan {
  name: string;
  badge?: string;
  discount?: string;
  price: string;
  period: string;
  features: PlanFeature[];
  cta: string;
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Бесплатный",
    price: "0 ₽",
    period: "/навсегда",
    features: [
      { text: "До 5 историй", included: true },
      { text: "До 3 минут каждая", included: true },
      { text: "Базовая очистка шума", included: true },
      { text: "Хранение 6 месяцев", included: false },
      { text: "Физический накопитель", included: false },
    ],
    cta: "Начать бесплатно",
  },
  {
    name: "Подписка",
    badge: "Популярный",
    price: "299 ₽",
    period: "/мес",
    featured: true,
    features: [
      { text: "Безлимит записей", included: true },
      { text: "Любая длительность", included: true },
      { text: "ИИ + музыка + картинки", included: true },
      { text: "Вечное хранение", included: true, bold: true },
      { text: "Физический накопитель", included: false },
    ],
    cta: "Оформить подписку",
  },
  {
    name: "Годовой",
    discount: "−17%",
    price: "2 990 ₽",
    period: "/год",
    features: [
      { text: "Всё из подписки", included: true },
      { text: "USB в стильном корпусе", included: true, bold: true },
      { text: "Ежегодная архивация", included: true },
      { text: "Приоритетная поддержка", included: true },
      { text: "Доступ для семьи", included: true, bold: true },
    ],
    cta: "Выбрать годовой",
  },
];

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.1,
      }}
      className={cn(
        "price-card p-8 md:p-10 relative",
        plan.featured && "price-card-featured md:-mt-4 md:mb-[-16px]",
      )}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 cta-btn text-white text-[9px] font-bold uppercase tracking-[0.15em] px-3.5 py-1 rounded-full">
          {plan.badge}
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
          {plan.name}
        </p>
        {plan.discount && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-brand-600 bg-brand-100 px-2 py-0.5 rounded-md">
            {plan.discount}
          </span>
        )}
      </div>

      <div className="mb-6">
        <span className="text-4xl font-black text-neutral-900">
          {plan.price}
        </span>
        <span className="text-neutral-400 text-sm">{plan.period}</span>
      </div>

      <ul className="space-y-3 mb-8 text-sm">
        {plan.features.map((feature) => (
          <li
            key={feature.text}
            className={cn(
              "flex items-center gap-2.5",
              feature.included
                ? feature.bold
                  ? "text-neutral-900 font-semibold"
                  : "text-neutral-600"
                : "text-neutral-300",
            )}
          >
            <Icon
              icon={
                feature.included
                  ? "solar:check-circle-bold"
                  : "solar:close-circle-bold"
              }
              className={cn(
                feature.included
                  ? plan.featured
                    ? "text-brand-500"
                    : "text-green-500"
                  : "text-neutral-200",
              )}
            />
            {feature.text}
          </li>
        ))}
      </ul>

      <button
        className={cn(
          "w-full py-3 rounded-xl text-sm font-semibold transition-colors",
          plan.featured
            ? "text-white cta-btn"
            : "text-neutral-700 bg-neutral-100 hover:bg-neutral-200",
        )}
      >
        {plan.cta}
      </button>
    </motion.div>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-32 md:py-44 px-6 relative">
      <div className="orb orb-gradient-brand-faint w-[500px] h-[500px] bottom-0 left-1/2 -translate-x-1/2" />
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          {/* <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand mb-4">
            Тарифы
          </p> */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-neutral-900">
            Начните <span className="gradient-text">бесплатно</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 text-center"
        >
          <p className="text-[11px] text-neutral-400 flex items-center justify-center gap-2">
            <Icon icon="solar:shield-check-bold" className="text-green-500" />
            Безопасная оплата · Отмена в любой момент · Данные зашифрованы
          </p>
        </motion.div>
      </div>
    </section>
  );
}
