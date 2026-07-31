import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';

export default function GTCPage() {
  const t = useTranslations('legal');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">{t('gtc')}</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-text-muted">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Scope</h2>
          <p>
            These General Terms and Conditions (GTC) govern all business relations between Amira
            Gold Investment Limited and its customers. By placing an order on this website, the
            customer accepts these GTC. For the complete and binding contract applicable to each
            purchase, please refer to our{' '}
            <Link href="/terms-of-sale" className="text-primary font-medium hover:underline">
              Terms of Sale (Gold Purchase Agreement)
            </Link>
            , which you will also be asked to accept at checkout.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Offers & Pricing</h2>
          <p>
            All prices are quoted in EUR and include applicable taxes unless otherwise stated.
            Prices are subject to change based on market conditions and the live spot gold rate.
            The price valid at the time of order confirmation shall apply and is final for that
            transaction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Order Process</h2>
          <p>
            Orders are placed through our online shop. After placing an order, you will receive an
            order confirmation. The contract is concluded upon our acceptance of the order. All
            orders are subject to verification, payment clearance, and AML/KYC compliance checks.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Payment Terms</h2>
          <p>
            Payment is due in full before dispatch or collection. We accept various payment methods
            including bank transfer, cryptocurrency, and MoneyGram, as displayed at checkout. Title
            to the goods passes only upon full and cleared payment. For orders above EUR 8,000,
            cryptocurrency payment and identity verification (KYC) may be required in compliance
            with UAE AML regulations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Right of Withdrawal</h2>
          <p>
            Due to the nature of our products as investment-grade precious metals, there is no right
            of withdrawal once an order has been confirmed. Returns are accepted only within 3 days
            of delivery, in original unaltered condition with certification intact, and are subject
            to the prevailing gold rate at the time of return less a handling fee of 5%.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Governing Law</h2>
          <p>
            These GTC shall be governed by and construed in accordance with the laws of the United
            Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts
            of Dubai.
          </p>
        </section>

        <section className="mt-8 p-4 bg-surface border border-border rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-light/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Full contract terms</p>
                <p className="text-xs text-text-muted">
                  Read the complete Terms of Sale (Gold Purchase Agreement) before ordering.
                </p>
              </div>
            </div>
            <Link
              href="/terms-of-sale"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors shrink-0"
            >
              Terms of Sale
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
