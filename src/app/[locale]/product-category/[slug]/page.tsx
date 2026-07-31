'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Star, ShoppingCart, ChevronRight, Loader2 } from 'lucide-react';
import { getCatalog, type Catalog } from '@/lib/catalog';
import { formatPrice } from '@/lib/utils';
import { addToCart } from '@/lib/cart';
import { CURRENCY } from '@/lib/constants';
import { toast } from 'sonner';

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = use(params);
  const t = useTranslations('shop');
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  useEffect(() => {
    let mounted = true;
    getCatalog().then((c) => {
      if (mounted) setCatalog(c);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const categories = catalog?.categories ?? [];
  const category = categories.find((c) => c.slug === slug);
  const categoryProducts = (catalog?.products ?? []).filter((p) =>
    p.categories.some((c) => c.toLowerCase().replace(/\s+/g, '-') === slug)
  );

  if (!catalog) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto" />
      </div>
    );
  }

  if (!category || categoryProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <Link
          href={`/${locale}/shop`}
          className="text-primary hover:underline"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href={`/${locale}`} className="hover:text-primary">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/${locale}/shop`} className="hover:text-primary">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{category.name}</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-text-muted mb-8">{category.description}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categoryProducts.map((product) => (
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
