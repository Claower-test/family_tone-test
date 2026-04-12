/**
 * @file Landing page
 * @description Public landing page with all sections
 * @module app/(landing)/LandingPage
 */

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { MarqueeSection } from '@/components/landing/MarqueeSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { UsbSection } from '@/components/landing/UsbSection';
import { AudienceSection } from '@/components/landing/AudienceSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { CtaSection } from '@/components/landing/CtaSection';

export function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <MarqueeSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <UsbSection />
        <AudienceSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
