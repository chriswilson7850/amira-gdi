'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { products } from '@/data/site-content';
import { formatPrice } from '@/lib/utils';
import { CURRENCY } from '@/lib/constants';

export default function ProductCarousel() {
  const locale = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0);
  const featured = products.filter((p) => p.featured);
  const itemsPerSlide = 4;
  const totalSlides = Math.ceil(featured.length / itemsPerSlide);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  const getSlideItems = (slideIndex: number) => {
    const start = slideIndex * itemsPerSlide;
    return featured.slice(start, start + itemsPerSlide);
  };

  return (
    <section className="py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white border border-border rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white border border-border rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>

          {/* Product Carousel Track */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="flex gap-6 min-w-0 shrink-0" style={{ width: '100%' }}>
                  {getSlideItems(slideIndex).map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/product/${product.slug}`}
                      className="group bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow flex-1 min-w-0"
                      style={{ width: '25%' }}
                    >
                      <div className="aspect-square bg-gray-100 flex items-center justify-center p-4">
                        <div className="w-full h-full bg-linear-to-br from-gold-light to-gold/30 rounded-lg flex items-center justify-center">
                          <span className="text-4xl font-bold text-primary-dark opacity-50">
                            {product.name.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        {product.rating > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-4 h-4 fill-gold text-gold" />
                            <span className="text-xs text-text-muted">★★★★★</span>
                          </div>
                        )}
                        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(product.price, CURRENCY.code)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentSlide ? 'bg-primary' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
