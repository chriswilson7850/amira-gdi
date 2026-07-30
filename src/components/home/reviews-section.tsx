import { Star } from 'lucide-react';

export default function ReviewsSection() {
  return (
    <section className="py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Star className="w-12 h-12 text-gold fill-gold" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Trusted by Investors Worldwide
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto mb-8">
            We are committed to providing the highest quality investment-grade precious metals
            with complete transparency and exceptional service.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">80+</div>
              <div className="text-sm text-text-muted">5-Star Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">1998</div>
              <div className="text-sm text-text-muted">Founded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">20+</div>
              <div className="text-sm text-text-muted">Mint Partners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-text-muted">LBMA Certified</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
