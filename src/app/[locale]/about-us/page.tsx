import { useTranslations } from 'next-intl';
import { Shield, Award, Users, Globe, Quote } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('about');
  const s = useTranslations('site');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
        {t('title')}
      </h1>

      {/* Hero Section */}
      <div className="bg-linear-to-br from-secondary to-primary-dark text-white rounded-xl p-8 md:p-12 mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {t('heading')}
        </h2>
        <p className="text-gold-light/90 leading-relaxed">
          {s('tagline')}
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6 text-text-muted leading-relaxed">
        <p>{t('p1')}</p>
        <p>{t('p2')}</p>
        <p>{t('p3')}</p>
        <p>{t('p4')}</p>
      </div>

      {/* Meet the Founder */}
      <div className="mt-16 bg-linear-to-br from-secondary/5 to-gold/5 rounded-2xl p-8 md:p-12 border border-gold/20">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="shrink-0 w-full md:w-72">
            <div className="relative">
              <div className="absolute inset-0 bg-gold/20 rounded-2xl blur-3xl" />
              <img
                src="/images/amiraceo.jpg"
                alt="Amira Aldahab - Founder"
                className="relative w-full h-auto rounded-xl object-cover border-4 border-gold/30 shadow-2xl"
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Quote className="w-8 h-8 text-gold rotate-180" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Meet the Founder: Amira Aldahab
              </h2>
            </div>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>
                Amira Aldahab is an internationally recognized Egyptian spokeswoman and the force behind the Amira Al-Dahab Gold Enterprise based in Dubai. Known globally as the &ldquo;Gold Princess,&rdquo; she has built an empire on trust, quality, and prestige.
              </p>
              <p>
                Guided by a profound commitment to human progress, Amira is now investing her resources back into the global community.
              </p>
              <p>
                Through this official humanitarian initiative, she is providing direct financial grants to help individuals, farmers, logistics workers, schools, churches, health facilities, and businesses scale new heights and overcome hardships.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
        <div className="bg-surface rounded-xl p-6 border border-border">
          <Shield className="w-10 h-10 text-gold mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Trust & Security</h3>
          <p className="text-sm text-text-muted">
            All products are LBMA-certified, ensuring the highest purity and ethical sourcing.
          </p>
        </div>
        <div className="bg-surface rounded-xl p-6 border border-border">
          <Award className="w-10 h-10 text-gold mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Premium Quality</h3>
          <p className="text-sm text-text-muted">
            Direct partnerships with leading mints worldwide guarantee exceptional quality.
          </p>
        </div>
        <div className="bg-surface rounded-xl p-6 border border-border">
          <Users className="w-10 h-10 text-gold mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Personal Service</h3>
          <p className="text-sm text-text-muted">
            Tailored consultation and dedicated support for every client.
          </p>
        </div>
        <div className="bg-surface rounded-xl p-6 border border-border">
          <Globe className="w-10 h-10 text-gold mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Global Network</h3>
          <p className="text-sm text-text-muted">
            International reach with operations in Dubai and partnerships worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}
