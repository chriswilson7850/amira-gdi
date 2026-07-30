'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { products } from '@/data/site-content';
import { formatPrice } from '@/lib/utils';
import { CURRENCY } from '@/lib/constants';

interface CartItem {
  productId: string;
  quantity: number;
}

export default function CartPage() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const cartProducts = cartItems
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { ...product, quantity: item.quantity } : null;
    })
    .filter(Boolean) as (typeof products[number] & { quantity: number })[];

  const subtotal = cartProducts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  if (cartProducts.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-full bg-gold-light/20 flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gold" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('title')}</h1>
        <p className="text-text-muted mb-8 text-center max-w-md">{t('empty')}</p>
        <Link
          href={`/${locale}/shop`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors"
        >
          {t('continueShopping') || 'Continue Shopping'}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">{t('title')}</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartProducts.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 bg-white border border-border rounded-lg">
              <div className="w-24 h-24 shrink-0 bg-linear-to-br from-gold-light to-gold/30 rounded-md flex items-center justify-center">
                <span className="text-lg font-bold text-primary-dark opacity-40">
                  {item.name.split(' ')[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/${locale}/product/${item.slug}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-text-muted mt-1">
                  {formatPrice(item.price, CURRENCY.code)}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-2 hover:bg-surface transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-12 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-2 hover:bg-surface transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label={t('remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-foreground text-lg">
                  {formatPrice(item.price * item.quantity, CURRENCY.code)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-lg p-6 sticky top-24">
            <h2 className="text-lg font-bold text-foreground mb-4">
              {t('orderSummary') || 'Order Summary'}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">{t('subtotal') || 'Subtotal'}</span>
                <span className="font-semibold">{formatPrice(subtotal, CURRENCY.code)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between text-base">
                <span className="font-bold text-foreground">{t('total')}</span>
                <span className="font-bold text-foreground">
                  {formatPrice(subtotal, CURRENCY.code)}
                </span>
              </div>
            </div>
            <button className="w-full mt-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              {t('checkout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
