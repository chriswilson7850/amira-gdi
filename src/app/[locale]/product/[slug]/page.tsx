'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ShoppingCart, Star, ChevronRight, Loader2 } from 'lucide-react';
import { getCatalog, type Catalog } from '@/lib/catalog';
import { formatPrice } from '@/lib/utils';
import { addToCart } from '@/lib/cart';
import { CURRENCY } from '@/lib/constants';
import { toast } from 'sonner';

export default function ProductDetailPage({
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

  const product = catalog?.products.find((p) => p.slug === slug);

  if (!catalog) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link
          href={`/${locale}/shop`}
          className="text-primary hover:underline"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const relatedProducts = catalog.products
    .filter(
      (p) =>
        p.categories.some((c) => product.categories.includes(c)) &&
        p.id !== product.id
    )
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href={`/${locale}`} className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/${locale}/shop`} className="hover:text-primary">
          Shop
        </Link>
        {product.categories.map((cat) => (
          <span key={cat} className="flex items-center gap-2">
            <ChevronRight className="w-3 h-3" />
            <span>{cat}</span>
          </span>
        ))}
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Product Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center p-8 overflow-hidden">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-gold-light to-gold/30 rounded-lg flex items-center justify-center">
              <span className="text-6xl font-bold text-primary-dark opacity-30">
                {product.name.split(' ')[0]}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {product.name}
          </h1>

          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i <= product.rating
                        ? 'fill-gold text-gold'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-text-muted">
                ({product.reviewCount} {t('reviews')})
              </span>
            </div>
          )}

          <p className="text-3xl font-bold text-primary mb-4">
            {formatPrice(product.price, CURRENCY.code)}
          </p>

          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              {t('inStock')}
            </span>
          </div>

          <p className="text-text-muted mb-6 whitespace-pre-line">
            {product.shortDescription}
          </p>

          <button
            onClick={() => {
              addToCart(product.id);
              toast.success('Added to cart');
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white font-medium px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors mb-6"
          >
            <ShoppingCart className="w-5 h-5" />
            {t('addToCart')}
          </button>

          <div className="space-y-2 text-sm text-text-muted border-t border-border pt-4">
            <p>
              <span className="font-medium text-foreground">{t('sku')}:</span>{' '}
              {product.sku}
            </p>
            <p>
              <span className="font-medium text-foreground">{t('categories')}:</span>{' '}
              {product.categories.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Description Tabs */}
      <div className="border-t border-border pt-8 mb-12">
        <h2 className="text-xl font-bold text-foreground mb-4">
          {t('description')}
        </h2>
        <p className="text-text-muted whitespace-pre-line">
          {product.description}
        </p>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-border pt-8">
          <h2 className="text-xl font-bold text-foreground mb-6">
            {t('relatedProducts')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.id}
                href={`/${locale}/product/${rp.slug}`}
                className="group bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center p-4 overflow-hidden">
                  {rp.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={rp.images[0]} alt={rp.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-gold-light to-gold/30 rounded-lg flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary-dark opacity-30">
                        {rp.name.split(' ')[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {rp.name}
                  </h3>
                  <p className="text-lg font-bold text-primary">
                    {formatPrice(rp.price, CURRENCY.code)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
