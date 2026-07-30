import { useTranslations } from 'next-intl';
import { Truck, Shield, Clock, CreditCard, Banknote, Bitcoin } from 'lucide-react';

export default function ShippingPage() {
  const t = useTranslations('legal');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">{t('shipping')}</h1>

      {/* Shipping */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Truck className="w-6 h-6 text-gold" />
          Shipping Information
        </h2>
        <div className="space-y-4 text-text-muted">
          <p>
            We offer secure and insured shipping for all orders within the United Arab Emirates
            and internationally. All shipments are fully insured and tracked.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-surface rounded-lg p-4 border border-border">
              <Shield className="w-8 h-8 text-gold mb-2" />
              <h3 className="font-medium text-foreground text-sm mb-1">Insured Delivery</h3>
              <p className="text-xs">Fully insured armored truck delivery via our logistics partners.</p>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <Clock className="w-8 h-8 text-gold mb-2" />
              <h3 className="font-medium text-foreground text-sm mb-1">Delivery Time</h3>
              <p className="text-xs">Typically 2-5 business days depending on location and product availability.</p>
            </div>
          </div>
          <p>
            Shipping costs are calculated at checkout based on order value and destination.
            For large orders, free shipping may apply.
          </p>
        </div>
      </section>

      {/* Payment */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-gold" />
          Payment Terms
        </h2>
        <div className="space-y-4 text-text-muted">
          <p>
            We offer multiple payment methods to accommodate our clients&apos; preferences:
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-surface rounded-lg p-4 border border-border text-center">
              <Banknote className="w-8 h-8 text-gold mx-auto mb-2" />
              <h3 className="font-medium text-foreground text-sm mb-1">Bank Transfer</h3>
              <p className="text-xs">Direct bank transfer to our account. Processing time: 1-3 business days.</p>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border text-center">
              <Bitcoin className="w-8 h-8 text-gold mx-auto mb-2" />
              <h3 className="font-medium text-foreground text-sm mb-1">Cryptocurrency</h3>
              <p className="text-xs">Bitcoin, Ethereum, and major stablecoins accepted.</p>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border text-center">
              <Banknote className="w-8 h-8 text-gold mx-auto mb-2" />
              <h3 className="font-medium text-foreground text-sm mb-1">MoneyGram</h3>
              <p className="text-xs">MoneyGram transfers accepted for verified customers.</p>
            </div>
          </div>
          <p className="text-sm mt-4">
            Payment methods can be customized and updated via the admin panel. For specific
            payment arrangements, please contact us at sales@amira-gdi.live.
          </p>
        </div>
      </section>
    </div>
  );
}
