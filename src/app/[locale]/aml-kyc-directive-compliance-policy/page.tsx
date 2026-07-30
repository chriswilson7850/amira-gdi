import { useTranslations } from 'next-intl';

export default function AMLKYCPage() {
  const t = useTranslations('legal');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">{t('aml')}</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-text-muted">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Policy Statement</h2>
          <p>
            Amira Gold Investment Limited is committed to complying with all applicable
            Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations. We
            maintain robust procedures to prevent, detect, and report money laundering
            and terrorist financing activities.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Customer Due Diligence</h2>
          <p>
            We conduct thorough due diligence on all our customers. This includes verifying
            identity, understanding the nature of the customer&apos;s business, and assessing
            the source of funds for all transactions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Identity Verification</h2>
          <p>
            All customers are required to provide valid identification documents before
            completing a purchase. We use advanced identity verification systems to ensure
            compliance with regulatory requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Record Keeping</h2>
          <p>
            We maintain detailed records of all transactions and customer identification
            documents for the period required by applicable laws and regulations. These
            records are securely stored and protected.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Reporting</h2>
          <p>
            We report any suspicious transactions or activities to the relevant authorities
            in accordance with UAE law. Our staff is trained to identify and report
            potential money laundering indicators.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Compliance Officer</h2>
          <p>
            For any questions regarding our AML/KYC policies, please contact our
            Compliance Officer at sales@amira-gdi.live.
          </p>
        </section>
      </div>
    </div>
  );
}
