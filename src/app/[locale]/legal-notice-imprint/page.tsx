import { useTranslations } from 'next-intl';

export default function LegalNoticePage() {
  const t = useTranslations('legal');
  const s = useTranslations('site');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">{t('legalNotice')}</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-text-muted">
        <section>
          <h2 className="text-xl font-semibold text-foreground">Company Information</h2>
          <p>Amira Gold Investment Limited</p>
          <p>Dubai, United Arab Emirates</p>
          <p>Email: sales@amira-gdi.live</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Business Registration</h2>
          <p>
            Amira Gold Investment Limited is a registered business operating in Dubai,
            United Arab Emirates, in compliance with all applicable laws and regulations.
          </p>
          <div className="mt-4 space-y-2 bg-gray-50 border border-border rounded-lg p-4">
            <p className="text-foreground font-medium">Official Business Identifiers</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Unified Commercial Register:</span>
                <p className="text-foreground font-semibold">7012655093</p>
              </div>
              <div>
                <span className="text-text-muted">Precious Metals License:</span>
                <p className="text-foreground font-semibold">30500601/11</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Disclaimer</h2>
          <p>
            The information provided on this website is for general informational purposes
            only and does not constitute investment advice. All investments carry risk,
            and past performance does not guarantee future results. We recommend consulting
            with a qualified financial advisor before making investment decisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Intellectual Property</h2>
          <p>
            All content, trademarks, and intellectual property on this website are owned
            by or licensed to Amira Gold Investment Limited. Unauthorized use is
            prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Contact</h2>
          <p>
            For any questions regarding this legal notice, please contact us at:
            <br />
            Email: sales@amira-gdi.live
          </p>
        </section>
      </div>
    </div>
  );
}
