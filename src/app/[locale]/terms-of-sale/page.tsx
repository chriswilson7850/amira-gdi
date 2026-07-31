import { FileText, ShieldCheck, ScrollText } from 'lucide-react';
import TermsOfSaleContent from '@/components/legal/terms-of-sale-content';

export default function TermsOfSalePage() {

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full bg-gold-light/20 flex items-center justify-center">
          <FileText className="w-6 h-6 text-gold" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Terms of Sale</h1>
      </div>
      <p className="text-text-muted mb-8 max-w-2xl">
        This page sets out the complete contract terms that apply to every purchase made on this
        website. You will be asked to read and accept these terms at checkout.
      </p>

      <div className="bg-white border border-border rounded-xl p-6 md:p-10 mb-8">
        <TermsOfSaleContent />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4 flex gap-3">
          <ShieldCheck className="w-6 h-6 text-gold shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground text-sm">Your consent is recorded</h3>
            <p className="text-xs text-text-muted mt-1">
              When you check the consent box at checkout, your acceptance is stored with your order
              for audit and compliance purposes.
            </p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 flex gap-3">
          <ScrollText className="w-6 h-6 text-gold shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground text-sm">Questions?</h3>
            <p className="text-xs text-text-muted mt-1">
              Contact us at sales@amira-gdi.live — we are happy to explain any clause before you order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
