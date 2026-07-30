import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Mail, MapPin } from 'lucide-react';
import Script from 'next/script';
import { SITE_NAME } from '@/lib/constants';

export default function Footer() {
  const t = useTranslations('footer');
  const s = useTranslations('site');

  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <img src="/images/logo.png" alt={SITE_NAME} className="h-10 w-auto" />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {s('tagline')}
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <span>{t('address')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <a href={`mailto:${t('email')}`} className="hover:text-gold transition-colors">
                  {t('email')}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gold-light">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/shop" className="hover:text-gold transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/secure-storage-solutions" className="hover:text-gold transition-colors">
                  Storage
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gold transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/my-account" className="hover:text-gold transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gold-light">
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/legal-notice-imprint" className="hover:text-gold transition-colors">
                  {t('legalNotice')}
                </Link>
              </li>
              <li>
                <Link href="/general-terms-and-conditions-gtc" className="hover:text-gold transition-colors">
                  {t('gtc')}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy-cookie-policy" className="hover:text-gold transition-colors">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/aml-kyc-directive-compliance-policy" className="hover:text-gold transition-colors">
                  {t('aml')}
                </Link>
              </li>
              <li>
                <Link href="/shipping-payment-terms" className="hover:text-gold transition-colors">
                  {t('shipping')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gold transition-colors">
                  {t('faq')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-500">
          <div className="mb-6">
            <div className="gtranslate_wrapper"></div>
            <Script id="gtranslate-settings" strategy="lazyOnload">
              {`window.gtranslateSettings = {"default_language":"en","native_language_names":true,"wrapper_selector":".gtranslate_wrapper"}`}
            </Script>
            <Script src="https://cdn.gtranslate.net/widgets/latest/float.js" strategy="lazyOnload" />
          </div>
          <p>
            {t('copyright')} - {t('poweredBy')}{' '}
            <span className="text-gold">Amira GDI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
