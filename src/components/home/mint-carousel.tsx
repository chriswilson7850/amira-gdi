'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mints } from '@/data/site-content';

// Only show mints with actual logo images
const logoMints = mints.filter(m => m.logo);

export default function MintCarousel() {
  const t = useTranslations('home');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerSlide(2);
      else if (window.innerWidth < 1024) setItemsPerSlide(4);
      else setItemsPerSlide(6);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = Math.ceil(logoMints.length / itemsPerSlide);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [itemsPerSlide]);

  const getSlideItems = (slideIndex: number) => {
    const start = slideIndex * itemsPerSlide;
    return logoMints.slice(start, start + itemsPerSlide);
  };

  const gridCols = itemsPerSlide === 2 ? 'grid-cols-2' : itemsPerSlide === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 md:grid-cols-6';

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-bold text-center text-foreground mb-10">
          {t('mintsTitle')}
        </h2>

        <div className="relative">
          {totalSlides > 1 && (
            <>
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
            </>
          )}

          <div className={`grid ${gridCols} gap-4`}>
            {getSlideItems(currentSlide).map((mint, i) => (
              <div
                key={i}
                className="flex items-center justify-center h-24 bg-white rounded-lg border border-border p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={mint.logo!}
                  alt={mint.name}
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {totalSlides > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentSlide ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
