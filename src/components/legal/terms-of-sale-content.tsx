'use client';

// Shared Terms of Sale / Gold Purchase Agreement content.
// Rendered on the /terms-of-sale page AND inside the checkout consent modal,
// so the customer always consents to exactly what is published.

const SECTIONS: { number: string; title: string; paragraphs: string[]; list?: string[] }[] = [
  {
    number: '1',
    title: 'Parties',
    paragraphs: [
      'This Gold Purchase Agreement / Terms of Sale ("Agreement") is entered into between Amira Gold Investment Limited ("Seller", "we", "us"), a company registered in Dubai, United Arab Emirates, under Unified Commercial Register number 7012655093 (Precious Metals License 30500601/11), and the customer ("Buyer", "you") who completes a purchase via amira-gdi.live (the "Website").',
      'By placing an order on the Website, you confirm that you are legally capable of entering into a binding contract and that all information you provide is accurate and complete.',
    ],
  },
  {
    number: '2',
    title: 'Product Description',
    paragraphs: [
      'Each item offered for sale on the Website is described with its karat/purity (e.g. 22K, 24K), weight in grams or troy ounces, hallmark or certification number, and applicable making charges (if any).',
      'Product images are for illustration purposes and may differ slightly from the delivered item. Purity is guaranteed in accordance with UAE assay standards, and all investment-grade bullion products are sourced from LBMA-certified manufacturers (including Heimerle + Meule).',
    ],
  },
  {
    number: '3',
    title: 'Pricing',
    paragraphs: [
      'All prices are quoted in EUR (and, where displayed, AED) and are based on the live/spot gold rate at the time of order confirmation, plus applicable markup and VAT (if any).',
      'Gold prices fluctuate in real time. The Seller reserves the right to update prices at any time due to market conditions. The price locked in at the moment of checkout confirmation is final for that transaction and will not change after the order is confirmed.',
    ],
  },
  {
    number: '4',
    title: 'VAT Treatment',
    paragraphs: [
      'Investment-grade gold (99% purity or higher, in bar or coin form) is subject to 0% VAT under UAE Cabinet Decision No. 25 of 2018.',
      'Gold jewellery and lower-purity items are subject to the standard 5% VAT rate. The reverse charge mechanism applies only to registered B2B buyers who provide a valid UAE TRN at checkout.',
    ],
  },
  {
    number: '5',
    title: 'Payment',
    paragraphs: [
      'Payment must be made in full before dispatch or collection. We accept the payment methods displayed at checkout, including bank transfer, cryptocurrency, and MoneyGram.',
      'For orders above EUR 8,000, cryptocurrency payment may be required and additional identity verification (KYC) may be undertaken in compliance with UAE AML regulations. Title to the goods passes to the Buyer only upon full and cleared payment.',
    ],
  },
  {
    number: '6',
    title: 'Delivery & Risk Transfer',
    paragraphs: [
      'Ownership and risk of loss transfer to the Buyer upon delivery or collection. Deliveries are fully insured and tracked via our logistics partners, with insured armored transport available for high-value orders.',
      'The Buyer must inspect the goods immediately upon receipt and report any discrepancy or damage within 24–48 hours of delivery. Failure to report within this window may affect eligibility for remedy.',
    ],
  },
  {
    number: '7',
    title: 'Authenticity Guarantee',
    paragraphs: [
      'All gold sold by the Seller is certified by recognised assay houses and hallmarked in accordance with UAE standards. Investment-grade bullion is exclusively LBMA-certified.',
      'In the event of a verified authenticity dispute, the Seller will repair, replace, or refund the item, subject to independent verification by a recognised assay authority.',
    ],
  },
  {
    number: '8',
    title: 'Returns & Refunds',
    paragraphs: [
      'Due to the volatility of gold prices, returns are accepted only within 3 days of delivery, in the original unaltered condition with all certification intact.',
      'Refunds are calculated based on the prevailing gold rate at the time of the return (not the original purchase price), less a handling fee of 5%. No return shall be accepted after the 3-day window or for items that have been altered, worn, or damaged.',
    ],
  },
  {
    number: '9',
    title: 'AML / KYC Compliance',
    paragraphs: [
      'The Seller operates as a Designated Non-Financial Business (DNFBP) under UAE law and fully complies with applicable Anti-Money Laundering and Know-Your-Customer requirements.',
      'Buyers may be required to provide identification documents for purchases exceeding AED 55,000 (approximately EUR 13,000) or where otherwise deemed necessary for compliance purposes. We may refuse or hold an order pending verification.',
    ],
  },
  {
    number: '10',
    title: 'Limitation of Liability',
    paragraphs: [
      "The Seller's total liability arising out of or in connection with any order is limited to the value of that transaction.",
      'The Seller is not liable for indirect, incidental, or consequential losses, including but not limited to losses arising from gold price fluctuations after the date of sale, loss of profit, or loss of data.',
    ],
  },
  {
    number: '11',
    title: 'Governing Law & Dispute Resolution',
    paragraphs: [
      'This Agreement is governed by and construed in accordance with the laws of the United Arab Emirates.',
      'Any dispute arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts of Dubai, United Arab Emirates.',
    ],
  },
  {
    number: '12',
    title: 'Amendments',
    paragraphs: [
      'The Seller reserves the right to amend these Terms of Sale at any time. The version applicable to an order is the version in force at the time the order is placed and accepted by the Buyer.',
      'Continued use of the Website after any amendment constitutes acceptance of the updated terms. Where required by law, the Buyer will be notified of material changes.',
    ],
  },
  {
    number: '13',
    title: 'Consent & Contact',
    paragraphs: [
      'By checking the consent box at checkout and placing an order, the Buyer confirms having read, understood, and accepted this Agreement. This consent is recorded together with the order for compliance and audit purposes.',
      'For questions regarding this Agreement, please contact us at sales@amira-gdi.live.',
    ],
  },
];

export default function TermsOfSaleContent({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-2">Gold Purchase Agreement / Terms of Sale</h2>
        <p className="text-sm text-text-muted">
          Version 1.0 — Effective {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.number}>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {section.number}. {section.title}
          </h3>
          {section.paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-text-muted mb-2 leading-relaxed">
              {p}
            </p>
          ))}
        </section>
      ))}

      {!compact && (
        <p className="text-xs text-text-muted pt-4 border-t border-border">
          Amira Gold Investment Limited · Dubai, United Arab Emirates · Unified Commercial Register 7012655093 ·
          Precious Metals License 30500601/11 · sales@amira-gdi.live
        </p>
      )}
    </div>
  );
}
