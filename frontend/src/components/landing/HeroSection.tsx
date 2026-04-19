/**
 * @file HeroSection component
 * @description Landing page hero with phone mockup and parallax orbs
 * @module components/landing/HeroSection
 */

import { useRef, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/stores/auth.store';

const WAVE_BARS = [
  { color: 'bg-brand-400/50', delay: '0s', h: '28px' },
  { color: 'bg-brand-400/60', delay: '0.08s', h: '40px' },
  { color: 'bg-brand-400/70', delay: '0.16s', h: '20px' },
  { color: 'bg-brand-400/80', delay: '0.12s', h: '48px' },
  { color: 'bg-brand-200/80', delay: '0.24s', h: '36px' },
  { color: 'bg-brand-400/90', delay: '0.04s', h: '44px' },
  { color: 'bg-brand-200/70', delay: '0.2s', h: '24px' },
  { color: 'bg-brand-400/60', delay: '0.28s', h: '38px' },
  { color: 'bg-brand-400/80', delay: '0.1s', h: '32px' },
  { color: 'bg-brand-400/50', delay: '0.32s', h: '16px' },
  { color: 'bg-brand-200/60', delay: '0.18s', h: '42px' },
  { color: 'bg-brand-400/70', delay: '0.06s', h: '26px' },
  { color: 'bg-brand-400/80', delay: '0.22s', h: '46px' },
  { color: 'bg-brand-400/50', delay: '0.3s', h: '18px' },
  { color: 'bg-brand-200/70', delay: '0.14s', h: '34px' },
] as const;

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  function handleMouseMove(e: MouseEvent<HTMLElement>) {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const orbs = el.querySelectorAll<HTMLElement>('.orb');
    orbs.forEach((orb, i) => {
      const f = (i + 1) * 25;
      orb.style.transform = `translate(${x * f}px, ${y * f}px)`;
    });
  }

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 grid-bg pt-20"
    >
      <div className="orb orb-gradient-brand w-[600px] h-[600px] top-[-150px] left-1/2 -translate-x-1/2" />
      <div className="orb orb-gradient-red-subtle w-[300px] h-[300px] top-[300px] -right-[50px]" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs font-semibold uppercase tracking-[0.25em] text-brand mb-6"
        >
          Живой голос навсегда
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-black tracking-tighter leading-[0.85] text-neutral-900 mb-8"
        >
          Family<br /><span className="gradient-text">Tone</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="text-lg sm:text-xl text-neutral-500 max-w-xl mx-auto leading-relaxed font-light mb-10"
        >
          Записывайте истории голосом — с эмоциями и интонациями. За год соберётся подкаст вашей жизни.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <button
            onClick={() => navigate(token ? '/records' : '/register')}
            className="cta-btn inline-flex items-center gap-2 text-sm font-semibold text-white px-7 py-3.5 rounded-full"
          >
            {token ? 'Записать историю' : 'Записать первую историю'}
            <Icon icon="solar:arrow-right-linear" />
          </button>
          <a
            href="#how"
            className="cta-btn-outline inline-flex items-center gap-2 text-sm font-medium text-neutral-700 px-7 py-3.5 rounded-full"
          >
            <Icon icon="solar:play-bold" className="text-brand" />
            Смотреть демо
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        className="relative max-w-[280px] w-full mx-auto float-slow"
      >
        <div className="hero-shadow absolute -inset-16 rounded-full" />
        <div className="phone-frame relative z-10">
          <div className="phone-inner">
            <div className="flex items-center justify-between px-5 pt-3 pb-1">
              <span className="text-[9px] text-neutral-600 font-medium">9:41</span>
              <div className="w-16 h-4 bg-black rounded-full" />
              <Icon icon="solar:battery-full-bold" className="text-[9px] text-neutral-600" />
            </div>
            <div className="px-4 pb-5 pt-3">
              <p className="text-[9px] text-brand-400 font-bold uppercase tracking-[0.15em] mb-1.5">
                Вопрос #47
              </p>
              <p className="text-[13px] font-semibold leading-snug mb-5 text-neutral-100">
                Расскажите о самом счастливом дне вашего детства…
              </p>
              <div className="flex items-end justify-center gap-[2px] h-12 mb-3">
                {WAVE_BARS.map((bar, i) => (
                  <div
                    key={i}
                    className={`wave-bar w-[2px] ${bar.color} rounded-full`}
                    style={{ '--h': bar.h, animationDelay: bar.delay } as React.CSSProperties}
                  />
                ))}
              </div>
              <p className="text-center text-[10px] text-neutral-600 mb-4">02:34</p>
              <div className="flex items-center justify-center gap-5">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Icon icon="solar:restart-bold" className="text-neutral-600 text-sm" />
                </div>
                <div className="relative w-14 h-14 rounded-full cta-btn flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full cta-btn pulse-soft" />
                  <Icon icon="solar:pause-bold" className="text-white text-xl relative z-10" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Icon icon="solar:check-circle-bold" className="text-neutral-600 text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30">
        <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-400">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-neutral-300 to-transparent" />
      </div>
    </section>
  );
}
