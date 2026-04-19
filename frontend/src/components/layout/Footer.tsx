/**
 * @file Footer component
 * @description Site footer with branding, links, and social icons
 * @module components/layout/Footer
 */

import { Icon } from "@iconify/react";

const PRODUCT_LINKS = [
  { href: "#how", label: "Как работает" },
  { href: "#features", label: "Возможности" },
  /* { href: '#pricing', label: 'Тарифы' },
  { href: '#', label: 'Скачать' }, */
] as const;

const SUPPORT_LINKS = [
  { href: "#", label: "Помощь" },
  { href: "#", label: "Контакты" },
  /* { href: "#", label: "Партнёрам" }, */
] as const;

const SOCIAL_LINKS = [
  { href: "#", icon: "mdi:telegram", label: "Telegram" },
  { href: "#", icon: "mdi:vk", label: "VK" },
  { href: "#", icon: "mdi:youtube", label: "YouTube" },
] as const;

export function Footer() {
  return (
    <footer className="bg-bg-soft footer-top py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-14">
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md cta-btn flex items-center justify-center">
                <Icon
                  icon="solar:microphone-3-bold"
                  className="text-white text-xs"
                />
              </div>
              <span className="font-semibold text-sm tracking-tight text-neutral-900">
                FamilyTone
              </span>
            </a>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mb-5">
              Живой голос навсегда. Записывайте истории и сохраните их для
              будущих поколений.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-all"
                >
                  <Icon icon={social.icon} className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-4">
              Продукт
            </h4>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-4">
              Поддержка
            </h4>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-neutral-300">© 2025 Family Tone</p>
          <div className="flex items-center gap-5">
            <a
              href="#"
              className="text-[10px] text-neutral-300 hover:text-neutral-500 transition-colors"
            >
              Конфиденциальность
            </a>
            <a
              href="#"
              className="text-[10px] text-neutral-300 hover:text-neutral-500 transition-colors"
            >
              Условия
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
