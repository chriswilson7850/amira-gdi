'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package, Search, Loader2, MapPin, Truck, CheckCircle2, XCircle, Clock,
  Mail, Phone, User, Home, PackageCheck, CreditCard, ArrowRight,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number | string;
  product_image: string | null;
  quantity: number;
}

interface ShipmentEvent {
  id: string;
  status: string;
  description: string;
  location: string;
  created_at: string;
  created_by?: string;
}

interface Order {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  country: string | null;
  total: number | string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  tracking_number: string | null;
  carrier: string | null;
  shipment_status: string | null;
  shipment_events: ShipmentEvent[] | null;
  order_items: OrderItem[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PAYMENT_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

const EVENT_ICON: Record<string, typeof Truck> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  in_transit: Truck,
  out_for_delivery: Truck,
  delivered: PackageCheck,
  cancelled: XCircle,
};

function TrackForm() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [ref, setRef] = useState(initialRef);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(!!initialRef);

  const track = async (value?: string) => {
    const q = (value ?? ref).trim();
    if (!q) {
      setError('Please enter your order reference.');
      return;
    }
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = await fetch(`/api/track?ref=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setOrder(null);
        setError(data.error || 'Could not track that order.');
        return;
      }
      setOrder(data.order);
    } catch {
      setOrder(null);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) track(initialRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const events = Array.isArray(order?.shipment_events) && order.shipment_events.length
    ? [...order.shipment_events].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-2">
        <Package className="w-6 h-6 text-gold" />
        Track your order
      </h1>
      <p className="text-sm text-text-muted mb-6">
        Enter your order reference (e.g. <span className="font-mono font-semibold text-foreground">B45859BA</span>)
        to see its status, products and shipment progress.
      </p>

      {/* Search box */}
      <form
        onSubmit={(e) => { e.preventDefault(); track(); }}
        className="flex gap-2 mb-8"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="Order reference"
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          Track
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {!searched && !error && (
        <div className="border border-dashed border-border rounded-xl p-10 text-center text-text-muted text-sm">
          No order searched yet. Enter a reference above to get started.
        </div>
      )}

      {order && (
        <div className="space-y-6">
          {/* Order summary */}
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Order <span className="font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
                </h2>
                <p className="text-sm text-text-muted mt-0.5">
                  Placed on {new Date(order.created_at).toLocaleDateString()} · {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-700'}`}>
                  <span className="opacity-70">Order:</span>
                  {order.status}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${PAYMENT_STYLES[order.payment_status] || 'bg-gray-100 text-gray-700'}`}>
                  <span className="opacity-70">Payment:</span>
                  {order.payment_status}
                </span>
              </div>
            </div>

            {/* Shipment progress */}
            {(order.tracking_number || order.carrier || order.shipment_status) && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-gold-light/10 border border-gold/20 rounded-lg px-4 py-3 text-sm mb-5">
                {order.shipment_status && (
                  <span className="flex items-center gap-2 font-medium text-foreground capitalize">
                    <Truck className="w-4 h-4 text-gold" />
                    {order.shipment_status.replace(/_/g, ' ')}
                  </span>
                )}
                {order.carrier && (
                  <span className="text-text-muted">Carrier: <span className="text-foreground">{order.carrier}</span></span>
                )}
                {order.tracking_number && (
                  <span className="text-text-muted">Tracking: <span className="font-mono text-foreground">{order.tracking_number}</span></span>
                )}
              </div>
            )}

            {/* Products */}
            <div className="divide-y divide-border">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover rounded-lg border border-border" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-text-muted" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{item.product_name}</p>
                    <p className="text-xs text-text-muted mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{formatPrice(Number(item.product_price) * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border mt-2">
              <span className="text-sm text-text-muted">Total</span>
              <span className="text-lg font-bold text-foreground">{formatPrice(Number(order.total))}</span>
            </div>
          </div>

          {/* Billing information */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Home className="w-4 h-4 text-gold" />
              Billing information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide">Customer</p>
                  <p className="text-foreground font-medium">{order.full_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide">Email</p>
                  <p className="text-foreground">{order.email}</p>
                </div>
              </div>
              {order.phone && (
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide">Phone</p>
                    <p className="text-foreground">{order.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2.5 sm:col-span-2">
                <MapPin className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide">Shipping address</p>
                  <p className="text-foreground">
                    {[order.address_line1, order.address_line2].filter(Boolean).join(', ')}
                    {[order.city, order.country].filter(Boolean).join(', ') && (
                      <> · {[order.city, order.country].filter(Boolean).join(', ')}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipment timeline */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-gold" />
              Shipment history
            </h3>
            {events.length === 0 ? (
              <p className="text-sm text-text-muted">No shipment updates yet. The order is awaiting processing.</p>
            ) : (
              <ol className="relative border-l-2 border-gold/30 ml-2 space-y-6">
                {events.map((event) => {
                  const Icon = EVENT_ICON[event.status] || Package;
                  return (
                    <li key={event.id} className="relative pl-8">
                      <span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-white border-2 border-gold flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-gold" />
                      </span>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-foreground text-sm capitalize">{event.status.replace(/_/g, ' ')}</p>
                        <span className="text-xs text-text-muted">
                          {new Date(event.created_at).toLocaleDateString()} · {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {event.description && <p className="text-sm text-text-muted mt-0.5">{event.description}</p>}
                      {event.location && (
                        <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>}>
      <TrackForm />
    </Suspense>
  );
}
