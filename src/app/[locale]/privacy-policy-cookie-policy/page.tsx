import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
  const t = useTranslations('legal');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">{t('privacy')}</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-text-muted">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Data Protection at a Glance</h2>
          <p>
            We take the protection of your personal data very seriously. This privacy
            policy informs you about how we collect, process, and use your personal data
            when you visit our website or use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Data Collection</h2>
          <p>
            We collect personal data that you voluntarily provide to us when placing an
            order, creating an account, or contacting us. This may include your name,
            email address, phone number, and shipping address.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Cookies</h2>
          <p>
            Our website uses cookies to enhance your browsing experience. Cookies are
            small text files stored on your device. You can configure your browser to
            reject cookies, but this may affect website functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to
            protect your personal data against unauthorized access, alteration, disclosure,
            or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data at any
            time. For any data-related requests, please contact us at sales@amira-gdi.live.
          </p>
        </section>
      </div>
    </div>
  );
}
