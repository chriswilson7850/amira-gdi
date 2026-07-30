import { useTranslations } from 'next-intl';
import { Shield, Lock, Building, Truck, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { storageComparison } from '@/data/site-content';

export default function StoragePage() {
  const t = useTranslations('storage');

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
        {t('title')}
      </h1>
      <p className="text-text-muted mb-8">{t('p1')}</p>
      <p className="text-text-muted mb-12">{t('p2')}</p>

      {/* Two Storage Options */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Vintage Vaults */}
        <div className="bg-white border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Building className="w-8 h-8 text-gold" />
            <div>
              <h2 className="text-xl font-bold text-foreground">{t('vintageVaults.title')}</h2>
              <p className="text-sm text-text-muted">{t('vintageVaults.location')}</p>
            </div>
          </div>
          <p className="text-text-muted text-sm mb-4">
            {t('vintageVaults.description')}
          </p>
          <ul className="space-y-2 mb-6">
            {[
              'vintageVaults.features.0',
              'vintageVaults.features.1',
              'vintageVaults.features.2',
              'vintageVaults.features.3',
              'vintageVaults.features.4',
              'vintageVaults.features.5',
            ].map((key, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                <CheckCircle className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span>{t(key as any)}</span>
              </li>
            ))}
          </ul>
          <a
            href="https://www.vintage-vaults.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
          >
            {t('vintageVaults.cta')} →
          </a>
        </div>

        {/* Loomis Storage */}
        <div className="bg-white border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-gold" />
            <div>
              <h2 className="text-xl font-bold text-foreground">{t('loomis.title')}</h2>
              <p className="text-sm text-text-muted">{t('loomis.location')}</p>
            </div>
          </div>
          <p className="text-text-muted text-sm mb-4">
            {t('loomis.description')}
          </p>
          <ul className="space-y-2 mb-6">
            {[
              'loomis.features.0',
              'loomis.features.1',
              'loomis.features.2',
              'loomis.features.3',
              'loomis.features.4',
            ].map((key, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                <CheckCircle className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span>{t(key as any)}</span>
              </li>
            ))}
          </ul>
          <a
            href="mailto:sales@amira-gdi.live"
            className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
          >
            {t('loomis.cta')} →
          </a>
        </div>
      </div>

      {/* Comparison Table */}
      <h2 className="text-2xl font-bold text-foreground mb-6">{t('comparisonTitle')}</h2>
      <div className="overflow-x-auto mb-16">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary text-white">
              {storageComparison.headers.map((header, i) => (
                <th key={i} className="text-left p-3 text-sm font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {storageComparison.rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-surface' : 'bg-white'}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`p-3 text-sm ${
                      j === 0 ? 'font-medium text-foreground' : 'text-text-muted'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Features Grid */}
      <h2 className="text-2xl font-bold text-foreground mb-6">{t('beyondStorage')}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {['source', 'lbma', 'delivery', 'regulated'].map((key) => (
          <div key={key} className="bg-surface rounded-xl p-6 border border-border text-center">
            <Lock className="w-8 h-8 text-gold mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">
              {t(`features.${key}.title` as any)}
            </h3>
            <p className="text-sm text-text-muted">
              {t(`features.${key}.desc` as any)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
