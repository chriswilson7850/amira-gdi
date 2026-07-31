'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Star, ShoppingCart } from 'lucide-react';
import { products, categories } from '@/data/site-content';
import { formatPrice } from '@/lib/utils';
import { addToCart } from '@/lib/cart';
import { CURRENCY } from '@/lib/constants';
import { toast } from 'sonner';

export default function ShopPage() {
  const t = useTranslations('shop');
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) =>
          p.categories.some(
            (c) => c.toLowerCase().replace(/\s+/g, '-') === activeCategory
          )
        );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {t('title')}
        </h1>
        <p className="text-text-muted text-sm">
          {t('description')}
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-primary text-white'
              : 'bg-surface text-foreground/80 hover:bg-gray-200'
          }`}
        >
          {t('allProducts')}
        </button>
        {categories
          .filter((c) => !c.parentId)
          .map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-primary text-white'
                  : 'bg-surface text-foreground/80 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 mb-6">
        <label className="text-sm text-text-muted">{t('sort')}:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white"
        >
          <option value="default">{t('defaultSort')}</option>
          <option value="price-asc">{t('sortPriceLow')}</option>
          <option value="price-desc">{t('sortPriceHigh')}</option>
          <option value="rating">{t('sortRating')}</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link href={`/${locale}/product/${product.slug}`}>
              <div className="aspect-square bg-gray-100 flex items-center justify-center p-6 overflow-hidden">
                {product.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-gold-light to-gold/30 rounded-lg flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary-dark opacity-40">
                      {product.name.split(' ')[0]}
                    </span>
                  </div>
                )}
              </div>
            </Link>
            <div className="p-4">
              {product.rating > 0 && (
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-4 h-4 fill-gold text-gold" />
                  <span className="text-xs text-text-muted">★★★★★</span>
                </div>
              )}
              <Link
                href={`/${locale}/product/${product.slug}`}
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2 mb-2"
              >
                {product.name}
              </Link>
              <p className="text-lg font-bold text-primary mb-3">
                {formatPrice(product.price, CURRENCY.code)}
              </p>
              <button
                onClick={() => {
                  addToCart(product.id);
                  toast.success('Added to cart');
                }}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-medium py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                {t('addToCart')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
