import { useTranslations } from 'next-intl';

export default function GTCPage() {
  const t = useTranslations('legal');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">{t('gtc')}</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-text-muted">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Scope</h2>
          <p>
            These General Terms and Conditions (GTC) govern all business relations
            between Amira Gold Investment Limited and its customers. By placing
            an order, the customer accepts these GTC.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Offers & Pricing</h2>
          <p>
            All prices are quoted in EUR and include applicable taxes unless otherwise
            stated. Prices are subject to change based on market conditions. The price
            valid at the time of order confirmation shall apply.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Order Process</h2>
          <p>
            Orders are placed through our online shop. After placing an order, you will
            receive an order confirmation. The contract is concluded upon our acceptance
            of the order. All orders are subject to verification and compliance checks.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Payment Terms</h2>
          <p>
            Payment is due immediately upon order confirmation. We accept various payment
            methods including bank transfer, cryptocurrency, and other methods as displayed
            at checkout. Title to the goods passes only upon full payment.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Right of Withdrawal</h2>
          <p>
            Due to the nature of our products as investment-grade precious metals, there
            is no right of withdrawal once an order has been confirmed. All sales are final.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Governing Law</h2>
          <p>
            These GTC shall be governed by and construed in accordance with the laws of
            the United Arab Emirates. Any disputes shall be subject to the exclusive
            jurisdiction of the courts of Dubai.
          </p>
        </section>
      </div>
    </div>
  );
}
