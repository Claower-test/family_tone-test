/**
 * @file CtaSection component
 * @description Final call-to-action with heading and store badges
 * @module components/landing/CtaSection
 */

import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/stores/auth.store";

export function CtaSection() {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  return (
    <section className="py-32 md:py-48 px-6 relative overflow-hidden">
      <div className="orb orb-gradient-brand-cta w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-neutral-900 mb-6"
        >
          Не
          <br />
          откладывайте<span className="gradient-text">.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-lg text-neutral-500 font-light leading-relaxed max-w-md mx-auto mb-10"
        >
          Каждое утро уникальных голосов становится меньше. Начните записывать
          сегодня.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <button
            onClick={() => navigate(token ? '/records' : '/register')}
            className="cta-btn inline-flex items-center gap-2.5 text-base font-semibold text-white px-9 py-4 rounded-full"
          >
            {token ? 'Записать историю' : 'Записать первую историю'}
            <Icon icon="solar:arrow-right-linear" />
          </button>
          {/* <a
            href="#"
            className="cta-btn-outline inline-flex items-center gap-2 text-sm font-medium text-neutral-700 px-7 py-4 rounded-full"
          >
            Скачать приложение
            <Icon icon="solar:download-minimalistic-linear" />
          </a> */}
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="store-badge inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl cursor-pointer">
            <Icon icon="mdi:apple" className="text-xl text-neutral-400" />
            <div className="text-left">
              <p className="text-[8px] text-neutral-400 leading-none">
                Загрузите в
              </p>
              <p className="text-xs font-semibold text-neutral-700 leading-tight">
                App Store
              </p>
            </div>
          </div>
          <div className="store-badge inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl cursor-pointer">
            <Icon icon="mdi:google-play" className="text-xl text-neutral-400" />
            <div className="text-left">
              <p className="text-[8px] text-neutral-400 leading-none">
                Доступно в
              </p>
              <p className="text-xs font-semibold text-neutral-700 leading-tight">
                Google Play
              </p>
            </div>
          </div>
        </motion.div> */}
      </div>
    </section>
  );
}
