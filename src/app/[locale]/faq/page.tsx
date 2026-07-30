'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, Search, HelpCircle, Mail } from 'lucide-react';
import { faqCategories } from '@/data/site-content';

export default function FAQPage() {
  const t = useTranslations('faq');
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = faqCategories.filter((cat) =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.questions.some((q) => q.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
        {t('title')}
      </h1>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search FAQ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        />
      </div>

      {/* FAQ Sections */}
      <div className="space-y-4">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white border border-border rounded-xl overflow-hidden"
          >
            <button
              onClick={() =>
                setOpenSection(openSection === category.id ? null : category.id)
              }
              className="w-full flex items-center justify-between p-5 text-left hover:bg-surface transition-colors"
            >
              <span className="font-semibold text-foreground text-sm">
                {category.title}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-text-muted transition-transform ${
                  openSection === category.id ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSection === category.id && (
              <div className="px-5 pb-5 space-y-3 border-t border-border pt-3">
                {category.questions.map((question, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{question}</p>
                      <p className="text-xs text-text-muted mt-1">
                        Click to reveal the answer. Contact us for detailed information.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-12 bg-linear-to-br from-primary to-primary-dark text-white rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Still have questions?</h2>
        <p className="text-white/80 mb-6">
          We&apos;re here to help you. Reach out to us anytime.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:sales@amira-gdi.live"
            className="inline-flex items-center gap-2 bg-white text-primary font-medium px-6 py-2.5 rounded-lg hover:bg-gold-light transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email Us
          </a>
          <span className="text-sm text-gray-400">
            or use the live chat widget
          </span>
        </div>
      </div>
    </div>
  );
}
