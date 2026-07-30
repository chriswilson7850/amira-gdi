'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Star } from 'lucide-react';

export default function HeroSection() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="relative bg-linear-to-br from-secondary via-secondary to-primary-dark text-white overflow-hidden">
      {/* Hero background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-linear-to-r from-secondary/90 via-secondary/80 to-primary-dark/80" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-gold-light mb-4 font-medium">
            {t('hero.subtitle')}
          </p>

          {/* Trust badges */}
          <div className="flex items-center gap-1 text-sm mb-8">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-gold text-gold" />
              ))}
            </div>
            <span className="text-gray-300">{t('reviews')}</span>
          </div>

          <Link
            href={`/${locale}/shop`}
            className="inline-flex items-center gap-2 bg-gold text-secondary font-semibold px-8 py-3.5 rounded-lg hover:bg-gold-light transition-colors text-lg"
          >
            {t('hero.cta')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
