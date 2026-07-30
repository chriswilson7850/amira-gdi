export const SITE_NAME = 'Amira Gold Investment Limited';
export const SITE_DESCRIPTION = 'Your trusted partner for investment-grade precious metals in Dubai';
export const SITE_URL = 'https://amira-gdi.live';

export const CONTACT = {
  email: 'sales@amira-gdi.live',
  phone: null as string | null,
  whatsapp: null as string | null,
  address: {
    line1: 'Dubai',
    line2: 'United Arab Emirates',
  },
};

export const CURRENCY = {
  code: 'EUR',
  symbol: '€',
  locale: 'de-DE',
};

export const DEFAULT_LOCALE = 'en';
export const LOCALES = ['en', 'ar', 'de'] as const;
export type Locale = (typeof LOCALES)[number];
