'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  ShoppingBag, ShieldCheck, Lock, Loader2, X, FileText, CheckCircle2,
  Banknote, Bitcoin, Landmark, ArrowRight, ChevronRight, User, Mail, Phone, MapPin, Building2, StickyNote, Info,
} from 'lucide-react';
import { getCatalog, type Catalog } from '@/lib/catalog';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getCart, clearCart, CART_EVENT } from '@/lib/cart';
import { CURRENCY } from '@/lib/constants';
import { toast } from 'sonner';
import TermsOfSaleContent from '@/components/legal/terms-of-sale-content';

interface CartLine {
  productId: string;
  quantity: number;
}

interface WalletEntry {
  coin: string;
  network: string;
  address: string;
}

interface PaymentDetails {
  wallet_addresses?: WalletEntry[];
  bank?: {
    account_name?: string;
    account_number?: string;
    iban?: string;
    swift?: string;
    bank_name?: string;
  };
  moneygram?: {
    receiver_name?: string;
    receiver_details?: string;
  };
  instructions?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  slug?: string;
  description: string;
  icon: string;
  enabled?: boolean;
  details?: PaymentDetails;
}

const FALLBACK_METHODS: PaymentMethod[] = [
  { id: 'bank-transfer', name: 'Bank Transfer', description: 'Direct bank transfer to our account', icon: 'landmark' },
  { id: 'cryptocurrency', name: 'Cryptocurrency', description: 'Bitcoin, Ethereum, USDT, and other major cryptocurrencies', icon: 'bitcoin' },
  { id: 'moneygram', name: 'MoneyGram', description: 'MoneyGram money transfer', icon: 'banknote' },
];

const ICONS: Record<string, typeof Banknote> = {
  banknote: Banknote,
  bitcoin: Bitcoin,
  landmark: Landmark,
};

const TERMS_VERSION = '1.0';

export default function CheckoutPage() {
  const locale = useLocale();

  const [cartItems, setCartItems] = useState<CartLine[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(FALLBACK_METHODS);
  const [selectedMethod, setSelectedMethod] = useState<string>('bank-transfer');
  const [loadingMethods, setLoadingMethods] = useState(true);

  // Billing form
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    country: '',
    notes: '',
  });

  // Clickwrap consent
  const [consented, setConsented] = useState(false);
  const [consentAt, setConsentAt] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Optional account at checkout (to track the order)
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');

  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  // ---------- Load catalog ----------
  useEffect(() => {
    let mounted = true;
    getCatalog().then((c) => {
      if (mounted) setCatalog(c);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // ---------- Load cart ----------
  useEffect(() => {
    setCartItems(getCart());
    const onUpdate = () => setCartItems(getCart());
    window.addEventListener(CART_EVENT, onUpdate);
    return () => window.removeEventListener(CART_EVENT, onUpdate);
  }, []);

  // ---------- Load payment methods ----------
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/payment-methods');
        const data = await res.json();
        if (mounted && data.methods?.length) {
          const enabled = data.methods
            .filter((m: any) => m.enabled !== false)
            .map((m: any) => ({
              id: m.slug || m.id,
              name: m.name,
              slug: m.slug,
              description: m.description || '',
              icon: m.icon || 'banknote',
              details: m.details || {},
            }));
          if (enabled.length) setPaymentMethods(enabled);
        }
      } catch {
        // fall back to defaults
      } finally {
        if (mounted) setLoadingMethods(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const cartProducts = useMemo(
    () =>
      (catalog?.products ?? [])
        .map((product) => {
          const item = cartItems.find((i) => i.productId === product.id);
          return item ? { ...product, quantity: item.quantity } : null;
        })
        .filter(Boolean) as (Product & { quantity: number })[],
    [cartItems, catalog]
  );

  const subtotal = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const selectedMethodObj = paymentMethods.find((m) => m.id === selectedMethod);

  const isFormValid =
    form.full_name.trim() &&
    form.email.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.phone.trim() &&
    form.address_line1.trim() &&
    form.city.trim() &&
    form.country.trim() &&
    selectedMethod &&
    (!createAccount || accountPassword.length >= 6);

  const canPlace = isFormValid && consented && !placing;

  // ---------- Consent handlers ----------
  const handleAcceptFromModal = () => {
    setConsented(true);
    setConsentAt(new Date().toISOString());
    setModalOpen(false);
    toast.success('Terms of Sale accepted');
  };

  const handleCheckbox = (checked: boolean) => {
    if (checked) {
      setConsented(true);
      setConsentAt(new Date().toISOString());
    } else {
      setConsented(false);
      setConsentAt(null);
    }
  };

  // ---------- Place order ----------
  const placeOrder = async () => {
    if (!canPlace) return;
    setPlacing(true);
    try {
      const payload = {
        items: cartProducts.map((item) => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.images?.[0] || null,
        })),
        email: form.email,
        full_name: form.full_name,
        phone: form.phone,
        address_line1: form.address_line1,
        address_line2: form.address_line2,
        city: form.city,
        country: form.country,
        payment_method: selectedMethod,
        notes: form.notes,
        terms_accepted: true,
        terms_accepted_at: consentAt,
        terms_version: TERMS_VERSION,
        create_account: createAccount ? { password: accountPassword } : null,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to place order');
        return;
      }
      setPlacedOrder(data.order);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  // ---------- Success screen ----------
  if (placedOrder) {
    const PaymentIcon = ICONS[selectedMethodObj?.icon || 'banknote'] || Landmark;
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="bg-green-50 px-6 py-8 text-center border-b border-border">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Order placed successfully</h1>
            <p className="text-text-muted mt-2">
              Thank you, {placedOrder.full_name || 'customer'}! Your order has been received and is
              pending payment.
            </p>
            <p className="text-sm text-text-muted mt-1">
              Order reference:{' '}
              <span className="font-mono font-semibold text-foreground">
                {placedOrder.id?.slice(0, 8).toUpperCase()}
              </span>
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Items */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">Order summary</h2>
              <div className="space-y-3">
                {placedOrder.order_items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-text-muted">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(Number(item.product_price) * Number(item.quantity), CURRENCY.code)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-3 flex justify-between text-base">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-foreground">
                  {formatPrice(Number(placedOrder.total), CURRENCY.code)}
                </span>
              </div>
            </div>

            {/* Payment details */}
            <div className="bg-surface border border-border rounded-lg p-5">
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <PaymentIcon className="w-5 h-5 text-gold" />
                Payment details — {selectedMethodObj?.name}
              </h2>
              <p className="text-sm text-text-muted mb-4">
                {selectedMethodObj?.description || 'Please complete your payment to confirm the order.'}
              </p>

              {selectedMethod === 'bank-transfer' && (
                <div className="text-sm space-y-2 text-text-muted">
                  {selectedMethodObj?.details?.bank?.iban || selectedMethodObj?.details?.bank?.account_number ? (
                    <div className="space-y-1.5">
                      {selectedMethodObj?.details?.bank?.account_name && (
                        <p><span className="font-medium text-foreground">Account name:</span> {selectedMethodObj.details.bank.account_name}</p>
                      )}
                      {selectedMethodObj?.details?.bank?.account_number && (
                        <p><span className="font-medium text-foreground">Account number:</span> {selectedMethodObj.details.bank.account_number}</p>
                      )}
                      {selectedMethodObj?.details?.bank?.iban && (
                        <p><span className="font-medium text-foreground">IBAN:</span> {selectedMethodObj.details.bank.iban}</p>
                      )}
                      {selectedMethodObj?.details?.bank?.swift && (
                        <p><span className="font-medium text-foreground">SWIFT / BIC:</span> {selectedMethodObj.details.bank.swift}</p>
                      )}
                      {selectedMethodObj?.details?.bank?.bank_name && (
                        <p><span className="font-medium text-foreground">Bank:</span> {selectedMethodObj.details.bank.bank_name}</p>
                      )}
                    </div>
                  ) : (
                    <p>Please transfer the total amount to our bank account. Our bank details will be
                      sent to <span className="font-semibold text-foreground">{placedOrder.email}</span>.</p>
                  )}
                  <p>Use your order reference <span className="font-mono font-semibold text-foreground">{placedOrder.id?.slice(0, 8).toUpperCase()}</span>
                    {' '}as the payment reference. Orders are dispatched once payment has cleared.</p>
                </div>
              )}
              {selectedMethod === 'cryptocurrency' && (
                <div className="text-sm space-y-2 text-text-muted">
                  {selectedMethodObj?.details?.wallet_addresses?.length ? (
                    <div className="space-y-2">
                      {selectedMethodObj.details.wallet_addresses
                        .filter((w) => w.coin && w.address)
                        .map((w, i) => (
                          <div key={i}>
                            <span className="font-semibold text-foreground">{w.coin}</span>
                            {w.network && (
                              <span className="ml-1.5 text-xs font-medium text-gold uppercase tracking-wide">
                                {w.network}
                              </span>
                            )}
                            <p className="font-mono text-foreground bg-surface border border-border rounded-lg px-3 py-2 mt-0.5 break-all">
                              {w.address}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p>Our crypto wallet address and the exact amount due will be sent to{' '}
                      <span className="font-semibold text-foreground">{placedOrder.email}</span>.</p>
                  )}
                  <p>Please complete the transfer within 1 hour. Orders are dispatched once the
                    transaction is confirmed on-chain.</p>
                </div>
              )}
              {selectedMethod === 'moneygram' && (
                <div className="text-sm space-y-2 text-text-muted">
                  {selectedMethodObj?.details?.moneygram?.receiver_name ? (
                    <p>Please complete the MoneyGram transfer to{' '}
                      <span className="font-semibold text-foreground">{selectedMethodObj.details.moneygram.receiver_name}</span>.</p>
                  ) : (
                    <p>Please complete the MoneyGram transfer using the details sent to{' '}
                      <span className="font-semibold text-foreground">{placedOrder.email}</span>.</p>
                  )}
                  <p>Include your order reference to match the payment to your order.</p>
                </div>
              )}
              {!['bank-transfer', 'cryptocurrency', 'moneygram'].includes(selectedMethod) && (
                <p className="text-sm text-text-muted">
                  Our team will contact you shortly with payment instructions for{' '}
                  <span className="font-semibold text-foreground">{selectedMethodObj?.name}</span>.
                </p>
              )}
              {selectedMethodObj?.details?.instructions && (
                <p className="text-sm text-text-muted pt-1 border-t border-border">{selectedMethodObj.details.instructions}</p>
              )}
            </div>

            <div className="flex items-start gap-2 text-xs text-text-muted">
              <ShieldCheck className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <p>
                Your acceptance of the Terms of Sale has been recorded with this order (version{' '}
                {placedOrder.terms_version || TERMS_VERSION}). A confirmation email has been sent to{' '}
                {placedOrder.email}.
              </p>
            </div>

            {createAccount && (
              <div className="flex items-start gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <p>
                  Your account has been created with <span className="font-semibold">{placedOrder.email}</span>.
                  Log in from <span className="font-semibold">My Account</span> to view and track this order.
                  (You may need to confirm your email address first.)
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/${locale}/shop`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors"
              >
                Continue shopping
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/${locale}/my-account`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface hover:bg-gray-100 border border-border text-foreground rounded-lg font-semibold transition-colors"
              >
                View my account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Loading catalog ----------
  if (!catalog) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  // ---------- Empty cart ----------
  if (!loadingMethods && cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-full bg-gold-light/20 flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gold" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Checkout</h1>
        <p className="text-text-muted mb-8 text-center max-w-md">Your cart is empty. Add products before proceeding to checkout.</p>
        <Link
          href={`/${locale}/shop`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors"
        >
          Continue shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const inputCls =
    'w-full px-3 py-2.5 border border-border rounded-lg bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors';
  const labelCls = 'block text-sm font-medium text-foreground mb-1.5';

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href={`/${locale}/cart`} className="hover:text-primary transition-colors">Cart</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">Checkout</span>
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          placeOrder();
        }}
        className="grid lg:grid-cols-3 gap-8"
      >
        {/* Left: form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Billing details */}
          <section className="bg-white border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-gold" />
              Billing details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Full name *</label>
                <input
                  className={inputCls}
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Email address *</label>
                <input
                  type="email"
                  className={inputCls}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Phone *</label>
                <input
                  type="tel"
                  className={inputCls}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+971 50 000 0000"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Street address *</label>
                <input
                  className={inputCls}
                  value={form.address_line1}
                  onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                  placeholder="Street and house number"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Apartment, suite, unit (optional)</label>
                <input
                  className={inputCls}
                  value={form.address_line2}
                  onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
                  placeholder="Apartment, suite, unit"
                />
              </div>
              <div>
                <label className={labelCls}>City *</label>
                <input
                  className={inputCls}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Dubai"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Country *</label>
                <input
                  className={inputCls}
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="United Arab Emirates"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Order notes (optional)</label>
                <textarea
                  className={`${inputCls} min-h-24 resize-y`}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notes about your order, e.g. preferred delivery window"
                />
              </div>
            </div>
          </section>

          {/* Payment method */}
          <section className="bg-white border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gold" />
              Payment method
            </h2>
            <p className="flex items-start gap-2.5 text-xs text-text-muted bg-gold-light/10 border border-gold/25 rounded-lg px-3.5 py-3 mb-5">
              <Info className="w-4 h-4 text-gold shrink-0 mt-px" />
              <span>
                For orders above <strong className="font-semibold text-foreground">€5,000</strong>, please use the
                crypto method to get instant confirmation and avoid any delay.
              </span>
            </p>
            {loadingMethods ? (
              <div className="flex items-center gap-2 text-sm text-text-muted py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading payment methods...
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = ICONS[method.icon] || Landmark;
                  const active = selectedMethod === method.id;
                  return (
                    <button
                      type="button"
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-start gap-3 p-4 border rounded-lg text-left transition-colors ${
                        active
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gold-light/20 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-gold" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">{method.name}</p>
                        {method.description && (
                          <p className="text-xs text-text-muted mt-0.5">{method.description}</p>
                        )}
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                          active ? 'border-primary' : 'border-border'
                        }`}
                      >
                        {active && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Clickwrap consent */}
          <section className="bg-white border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold" />
              Consent
            </h2>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-4"
            >
              <FileText className="w-4 h-4" />
              Read the full Terms of Sale
            </button>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => handleCheckbox(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-border text-primary focus:ring-primary/40 accent-primary shrink-0"
              />
              <span className="text-sm text-foreground">
                I have read and agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setModalOpen(true);
                  }}
                  className="text-primary font-medium underline underline-offset-2 hover:text-primary-dark"
                >
                  Terms of Sale
                </button>{' '}
                (Gold Purchase Agreement). I understand that my consent is recorded with my order.
              </span>
            </label>

            {consented && consentAt && (
              <p className="mt-3 text-xs text-green-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Accepted on{' '}
                {new Date(consentAt).toLocaleString(locale === 'ar' ? 'ar-AE' : locale === 'de' ? 'de-DE' : 'en-GB')}
              </p>
            )}
          </section>

          {/* Optional account — track this order */}
          <section className="bg-white border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-gold" />
              Track this order
            </h2>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={createAccount}
                onChange={(e) => setCreateAccount(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-border text-primary focus:ring-primary/40 accent-primary shrink-0"
              />
              <span className="text-sm text-foreground">
                Create an account with this email so you can view and track your order. You can also
                check out as a guest — just leave this unchecked.
              </span>
            </label>

            {createAccount && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Create a password *
                </label>
                <input
                  type="password"
                  className={inputCls}
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  autoComplete="new-password"
                />
                <p className="mt-1.5 text-xs text-text-muted">
                  We'll use <span className="font-semibold text-foreground">{form.email || 'your email'}</span> as
                  your login. No account is created unless you check the box.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right: order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-foreground mb-4">Order summary</h2>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {cartProducts.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-14 shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    {item.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-primary-dark opacity-40">
                        {item.name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{item.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground">
                      {formatPrice(item.price * item.quantity, CURRENCY.code)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border mt-5 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Subtotal</span>
                <span className="font-semibold text-foreground">{formatPrice(subtotal, CURRENCY.code)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-foreground">{formatPrice(subtotal, CURRENCY.code)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canPlace}
              onClick={placeOrder}
              className="w-full mt-6 py-3.5 bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {placing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Placing order...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Place order
                </>
              )}
            </button>

            {!consented && (
              <p className="mt-3 text-xs text-amber-600 text-center">
                Please read and accept the Terms of Sale to proceed.
              </p>
            )}
            {consented && !isFormValid && (
              <p className="mt-3 text-xs text-amber-600 text-center">
                Please complete all required billing fields.
              </p>
            )}
          </div>
        </div>
      </form>

      {/* ---------- Clickwrap modal ---------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gold" />
                <h2 className="text-lg font-bold text-foreground">Terms of Sale</h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-text-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto flex-1">
              <TermsOfSaleContent compact />
            </div>

            <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row gap-3 bg-gray-50 rounded-b-2xl">
              <Link
                href={`/${locale}/terms-of-sale`}
                target="_blank"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-surface hover:bg-gray-100 border border-border text-foreground rounded-lg text-sm font-medium transition-colors"
              >
                Open full page
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={handleAcceptFromModal}
                className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-colors"
              >
                I Accept — proceed to payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
