'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  CreditCard,
  Settings,
  DollarSign,
  Bitcoin,
  Banknote,
  Plus,
  Save,
  Trash2,
  Edit3,
  X,
  Image,
  Loader2,
  LogOut,
  FolderTree,
  Check,
  Upload,
  Mail,
  Lock,
  LogIn,
  Users,
  Truck,
  PackageCheck,
  MapPin,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// ---------- Types ----------
interface WalletEntry {
  coin: string;
  network: string;
  address: string;
}

interface PaymentDetails {
  // crypto — list of {coin, network, address} so e.g. USDT can appear on both TRC-20 and ERC-20
  wallet_addresses?: WalletEntry[];
  // bank
  bank?: {
    account_name?: string;
    account_number?: string;
    iban?: string;
    swift?: string;
    bank_name?: string;
  };
  // moneygram
  moneygram?: {
    receiver_name?: string;
    receiver_details?: string;
  };
  // generic note appended to instructions
  instructions?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  icon: string;
  description: string;
  slug?: string;
  details?: PaymentDetails;
}

interface ProductForm {
  id?: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  compare_price: string;
  sku: string;
  in_stock: boolean;
  featured: boolean;
  images: string[];
  category_ids: string[];
  metadata: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
}

const emptyProduct: ProductForm = {
  name: '',
  slug: '',
  description: '',
  short_description: '',
  price: '',
  compare_price: '',
  sku: '',
  in_stock: true,
  featured: false,
  images: [],
  category_ids: [],
  metadata: '{}',
};

// ---------- Component ----------
export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'payments' | 'orders' | 'users' | 'settings'>('products');
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', parent_id: '' });
  const [savingCategory, setSavingCategory] = useState(false);

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [newPaymentName, setNewPaymentName] = useState('');
  const [newPaymentDesc, setNewPaymentDesc] = useState('');
  const [editingDetailsId, setEditingDetailsId] = useState<string | null>(null);
  const [detailsDrafts, setDetailsDrafts] = useState<Record<string, PaymentDetails>>({});
  const [savingDetails, setSavingDetails] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderDraft, setOrderDraft] = useState<any | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [eventForm, setEventForm] = useState({ status: 'shipped', description: '', location: '' });
  const [addingEvent, setAddingEvent] = useState(false);

  // ---------- Auth Check ----------
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckingAuth(false);
        return;
      }

      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        toast.error('Admin access required. Please contact the administrator.');
        await supabase.auth.signOut();
        setUser(null);
        setCheckingAuth(false);
        return;
      }

      setUser(user);
      setCheckingAuth(false);
    };
    check();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }
      // Sync session to client-side Supabase
      if (data.session) {
        await supabase.auth.setSession(data.session);
      }

      // Check admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();

      if (!profile?.is_admin) {
        toast.error('Admin access required. Please contact the administrator.');
        await supabase.auth.signOut();
        setUser(null);
        return;
      }

      setUser(data.user);
      toast.success('Logged in as admin');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      await supabase.auth.signOut();
      setUser(null);
      setProducts([]);
      setCategories([]);
      setActiveTab('products');
      toast.success('Logged out');
    } catch {
      toast.error('Failed to log out');
    }
  };

  // ---------- Load Products ----------
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'products') loadProducts();
  }, [activeTab, user]);

  // ---------- Load Categories ----------
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (user && (activeTab === 'categories' || activeTab === 'products')) loadCategories();
  }, [activeTab, user]);

  // ---------- Product Handlers ----------
  const openNewProduct = () => {
    setEditProductId(null);
    setProductForm(emptyProduct);
    setShowProductForm(true);
  };

  const openEditProduct = (product: any) => {
    setEditProductId(product.id);
    setProductForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      short_description: product.short_description || '',
      price: String(product.price),
      compare_price: product.compare_price ? String(product.compare_price) : '',
      sku: product.sku || '',
      in_stock: product.in_stock,
      featured: product.featured,
      images: product.product_images?.map((img: any) => img.url) || [],
      category_ids: product.product_categories?.map((pc: any) => pc.category_id) || [],
      metadata: JSON.stringify(product.metadata || {}, null, 2),
    });
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const body = {
        ...productForm,
        price: parseFloat(productForm.price),
        compare_price: productForm.compare_price ? parseFloat(productForm.compare_price) : null,
        metadata: (() => { try { return JSON.parse(productForm.metadata); } catch { return {}; } })(),
      };

      const url = editProductId ? `/api/products/${editProductId}` : '/api/products';
      const method = editProductId ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      toast.success(editProductId ? 'Product updated' : 'Product created');
      setShowProductForm(false);
      loadProducts();
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Failed to delete'); return; }
      toast.success('Product deleted');
      loadProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setProductForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const removeImage = (url: string) => {
    setProductForm((prev) => ({ ...prev, images: prev.images.filter((i) => i !== url) }));
  };

  // ---------- Category Handlers ----------
  const openNewCategory = () => {
    setEditCategoryId(null);
    setCategoryForm({ name: '', slug: '', description: '', parent_id: '' });
    setShowCategoryForm(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditCategoryId(cat.id);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      parent_id: cat.parent_id || '',
    });
    setShowCategoryForm(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCategory(true);
    try {
      const body = {
        name: categoryForm.name,
        slug: categoryForm.slug,
        description: categoryForm.description || '',
        parent_id: categoryForm.parent_id || null,
        sort_order: 0,
      };
      const res = await fetch('/api/categories', {
        method: editCategoryId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCategoryId ? { id: editCategoryId, ...body } : body),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(editCategoryId ? 'Category updated' : 'Category created');
      setShowCategoryForm(false);
      loadCategories();
    } catch {
      toast.error('Failed to save category');
    } finally {
      setSavingCategory(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await fetch('/api/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!res.ok) { toast.error('Failed to delete'); return; }
      toast.success('Category deleted');
      loadCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  // ---------- Load Users ----------
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to load users'); return; }
      setUsers(data.users || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'users') loadUsers();
  }, [activeTab, user]);

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeletingUser(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userToDelete.id }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to delete user'); return; }
      toast.success('User account deleted');
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeletingUser(false);
    }
  };

  // ---------- Load Payment Methods ----------
  const loadPaymentMethods = async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch('/api/payment-methods');
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to load payment methods'); return; }
      setPaymentMethods(
        (data.methods || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          enabled: m.enabled,
          icon: m.icon || 'banknote',
          description: m.description || '',
          slug: m.slug,
          details: m.details || {},
        }))
      );
    } catch {
      toast.error('Failed to load payment methods');
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'payments') loadPaymentMethods();
  }, [activeTab, user]);

  // ---------- Load Orders ----------
  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to load orders'); return; }
      setOrders(data.orders || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'orders') loadOrders();
  }, [activeTab, user]);

  // ---------- Order Handlers ----------
  const openOrder = (order: any) => {
    setSelectedOrder(order);
    setOrderDraft({
      status: order.status || 'pending',
      payment_status: order.payment_status || 'pending',
      tracking_number: order.tracking_number || '',
      carrier: order.carrier || '',
      shipment_status: order.shipment_status || 'pending',
    });
    setEventForm({ status: 'shipped', description: '', location: '' });
  };

  const closeOrder = () => {
    setSelectedOrder(null);
    setOrderDraft(null);
  };

  const saveOrder = async () => {
    if (!selectedOrder || !orderDraft) return;
    setSavingOrder(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          status: orderDraft.status,
          payment_status: orderDraft.payment_status,
          tracking_number: orderDraft.tracking_number,
          carrier: orderDraft.carrier,
          shipment_status: orderDraft.shipment_status,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to save order'); return; }
      toast.success('Order updated');
      setSelectedOrder(data.order);
      setOrderDraft({
        status: data.order.status || 'pending',
        payment_status: data.order.payment_status || 'pending',
        tracking_number: data.order.tracking_number || '',
        carrier: data.order.carrier || '',
        shipment_status: data.order.shipment_status || 'pending',
      });
      loadOrders();
    } catch {
      toast.error('Failed to save order');
    } finally {
      setSavingOrder(false);
    }
  };

  const addShipmentEvent = async () => {
    if (!selectedOrder) return;
    if (!eventForm.status) { toast.error('Select a shipment status'); return; }
    setAddingEvent(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          shipment_event: {
            status: eventForm.status,
            description: eventForm.description,
            location: eventForm.location,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to add update'); return; }
      toast.success('Shipment update added');
      setSelectedOrder(data.order);
      setOrderDraft((prev: any) => prev ? { ...prev, shipment_status: data.order.shipment_status || 'pending' } : prev);
      setEventForm({ status: 'shipped', description: '', location: '' });
      loadOrders();
    } catch {
      toast.error('Failed to add shipment update');
    } finally {
      setAddingEvent(false);
    }
  };

  // ---------- Payment Handlers ----------
  const togglePayment = async (id: string) => {
    const pm = paymentMethods.find((p) => p.id === id);
    if (!pm) return;
    // optimistic update
    setPaymentMethods((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled: !pm.enabled }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to update payment method');
        setPaymentMethods((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: pm.enabled } : p)));
      } else {
        toast.success(pm.enabled ? 'Payment method disabled' : 'Payment method enabled');
      }
    } catch {
      toast.error('Failed to update payment method');
      setPaymentMethods((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: pm.enabled } : p)));
    }
  };

  const addPaymentMethod = async () => {
    if (!newPaymentName.trim()) return;
    try {
      const slug = newPaymentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPaymentName.trim(),
          slug,
          description: newPaymentDesc.trim() || 'Custom payment method',
          icon: 'banknote',
          enabled: true,
          sort_order: paymentMethods.length + 1,
          details: {},
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to add payment method'); return; }
      toast.success('Payment method added');
      setNewPaymentName('');
      setNewPaymentDesc('');
      loadPaymentMethods();
    } catch {
      toast.error('Failed to add payment method');
    }
  };

  const removePaymentMethod = async (id: string) => {
    if (!confirm('Delete this payment method?')) return;
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { toast.error('Failed to delete payment method'); return; }
      toast.success('Payment method deleted');
      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
      if (editingDetailsId === id) setEditingDetailsId(null);
    } catch {
      toast.error('Failed to delete payment method');
    }
  };

  // ---------- Payment Details Editor ----------
  const openDetailsEditor = (pm: PaymentMethod) => {
    setDetailsDrafts((prev) => ({ ...prev, [pm.id]: JSON.parse(JSON.stringify(pm.details || {})) }));
    setEditingDetailsId((prev) => (prev === pm.id ? null : pm.id));
  };

  const patchDetailsDraft = (id: string, patch: Partial<PaymentDetails>) => {
    setDetailsDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));
  };

  const patchNestedDetailsDraft = (id: string, section: 'bank' | 'moneygram', key: string, value: string) => {
    setDetailsDrafts((prev) => {
      const draft = prev[id] || {};
      return {
        ...prev,
        [id]: { ...draft, [section]: { ...(draft[section] || {}), [key]: value } },
      };
    });
  };

  const patchWalletEntry = (id: string, index: number, field: keyof WalletEntry, value: string) => {
    setDetailsDrafts((prev) => {
      const draft = prev[id] || {};
      const wallets = [...(draft.wallet_addresses || [])];
      if (!wallets[index]) wallets[index] = { coin: '', network: '', address: '' };
      wallets[index] = { ...wallets[index], [field]: value };
      return { ...prev, [id]: { ...draft, wallet_addresses: wallets } };
    });
  };

  const addWalletEntry = (id: string) => {
    setDetailsDrafts((prev) => {
      const draft = prev[id] || {};
      const wallets = [...(draft.wallet_addresses || []), { coin: '', network: '', address: '' }];
      return { ...prev, [id]: { ...draft, wallet_addresses: wallets } };
    });
  };

  const removeWalletEntry = (id: string, index: number) => {
    setDetailsDrafts((prev) => {
      const draft = prev[id] || {};
      const wallets = [...(draft.wallet_addresses || [])];
      wallets.splice(index, 1);
      return { ...prev, [id]: { ...draft, wallet_addresses: wallets } };
    });
  };

  const savePaymentDetails = async (id: string) => {
    setSavingDetails(true);
    try {
      const draft = detailsDrafts[id] || {};
      // prune empty wallet entries before saving
      const details: PaymentDetails = {
        ...draft,
        wallet_addresses: (draft.wallet_addresses || []).filter((w) => w.coin.trim() && w.address.trim()),
        bank: (draft.bank && Object.values(draft.bank).some((v) => v)) ? draft.bank : undefined,
        moneygram: (draft.moneygram && Object.values(draft.moneygram).some((v) => v)) ? draft.moneygram : undefined,
        instructions: draft.instructions?.trim() || undefined,
      };
      const res = await fetch('/api/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, details }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to save payment details'); return; }
      toast.success('Payment details saved');
      setPaymentMethods((prev) => prev.map((p) => (p.id === id ? { ...p, details: data.method?.details || details } : p)));
      setEditingDetailsId(null);
    } catch {
      toast.error('Failed to save payment details');
    } finally {
      setSavingDetails(false);
    }
  };

  // ---------- Loading ----------
  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  // ---------- Login Form (not authenticated) ----------
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
              <p className="text-sm text-text-muted mt-2">Sign in to manage your store</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
              >
                {loginLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                Sign in to Admin
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-text-muted hover:bg-gray-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border pb-2 flex-wrap">
        <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package className="w-4 h-4" />} label="Products" />
        <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={<FolderTree className="w-4 h-4" />} label="Categories" />
        <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<CreditCard className="w-4 h-4" />} label="Payment Methods" />
        <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<Truck className="w-4 h-4" />} label="Orders" />
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users className="w-4 h-4" />} label="Users" />
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-4 h-4" />} label="Settings" />
      </div>

      {/* ========== PRODUCTS TAB ========== */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-text-muted">{products.length} products</p>
            <button onClick={openNewProduct} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-12 overflow-y-auto">
              <div className="bg-white rounded-xl w-full max-w-2xl mx-4 p-6 mb-12">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold">{editProductId ? 'Edit Product' : 'New Product'}</h2>
                  <button onClick={() => setShowProductForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                      <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Slug *</label>
                      <input type="text" required value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Price (EUR) *</label>
                      <input type="number" step="0.01" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Compare Price</label>
                      <input type="number" step="0.01" value={productForm.compare_price} onChange={(e) => setProductForm({ ...productForm, compare_price: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">SKU</label>
                      <input type="text" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="flex items-end gap-4 pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={productForm.in_stock} onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.checked })}
                          className="rounded border-border text-primary focus:ring-primary" />
                        <span className="text-sm">In Stock</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={productForm.featured} onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                          className="rounded border-border text-primary focus:ring-primary" />
                        <span className="text-sm">Featured</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Short Description</label>
                    <input type="text" value={productForm.short_description} onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                    <textarea rows={4} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>

                  {/* Categories Selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button key={cat.id} type="button" onClick={() => {
                          setProductForm((prev) => ({
                            ...prev,
                            category_ids: prev.category_ids.includes(cat.id)
                              ? prev.category_ids.filter((id) => id !== cat.id)
                              : [...prev.category_ids, cat.id],
                          }));
                        }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            productForm.category_ids.includes(cat.id)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-text-muted border-border hover:border-primary'
                          }`}>
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Images</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {productForm.images.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-border" />
                          <button type="button" onClick={() => removeImage(url)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-text-muted">
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Metadata (JSON)</label>
                    <textarea rows={3} value={productForm.metadata} onChange={(e) => setProductForm({ ...productForm, metadata: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={savingProduct}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors">
                      {savingProduct && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Save className="w-4 h-4" />
                      {editProductId ? 'Update Product' : 'Create Product'}
                    </button>
                    <button type="button" onClick={() => setShowProductForm(false)}
                      className="px-6 py-2.5 border border-border rounded-lg text-sm text-text-muted hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Product List */}
          {loadingProducts ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Package className="w-12 h-12 mx-auto mb-4 text-gold" />
              <p>No products yet.</p>
              <p className="text-sm mt-2">Click "Add Product" to create your first product.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 bg-white border border-border rounded-lg">
                  <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {product.product_images?.[0] ? (
                      <img src={product.product_images[0].url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Image className="w-6 h-6 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{product.name}</p>
                    <p className="text-xs text-text-muted">SKU: {product.sku || '—'} | €{product.price?.toFixed(2)}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${product.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      {product.featured && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold">Featured</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEditProduct(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== CATEGORIES TAB ========== */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-text-muted">{categories.length} categories</p>
            <button onClick={openNewCategory} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          {showCategoryForm && (
            <div className="bg-white border border-border rounded-xl p-6 mb-6">
              <h3 className="font-semibold mb-4">{editCategoryId ? 'Edit Category' : 'New Category'}</h3>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                    <input type="text" required value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Slug *</label>
                    <input type="text" required value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <input type="text" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Parent Category (optional)</label>
                  <select
                    value={categoryForm.parent_id}
                    onChange={(e) => setCategoryForm({ ...categoryForm, parent_id: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  >
                    <option value="">— Top-level category —</option>
                    {categories
                      .filter((c) => c.id !== editCategoryId)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                  </select>
                  <p className="text-xs text-text-muted mt-1">Top-level categories appear as filters in the shop (e.g. Gold, Silver).</p>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={savingCategory}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors">
                    {savingCategory && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Save className="w-4 h-4" />
                    {editCategoryId ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={() => setShowCategoryForm(false)}
                    className="px-6 py-2.5 border border-border rounded-lg text-sm text-text-muted hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loadingCategories ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-4 bg-white border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground text-sm">{cat.name}</p>
                    <p className="text-xs text-text-muted">/{cat.slug}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditCategory(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== PAYMENTS TAB ========== */}
      {activeTab === 'payments' && (
        <div>
          <div className="space-y-3 mb-8">
            {loadingPayments && paymentMethods.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            ) : (
              paymentMethods.map((pm) => {
                const isEditing = editingDetailsId === pm.id;
                const draft = detailsDrafts[pm.id] || {};
                const isCrypto = pm.slug === 'cryptocurrency' || pm.icon === 'bitcoin';
                const isBank = pm.slug === 'bank-transfer';
                const isMoneyGram = pm.slug === 'moneygram';
                return (
                  <div key={pm.id} className="p-4 bg-white border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {pm.icon === 'bitcoin' ? <Bitcoin className="w-8 h-8 text-orange-500" /> : <Banknote className="w-8 h-8 text-gold" />}
                        <div>
                          <p className="font-medium text-foreground text-sm">{pm.name}</p>
                          <p className="text-xs text-text-muted">{pm.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => togglePayment(pm.id)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${pm.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${pm.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                        <button
                          onClick={() => openDetailsEditor(pm)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground border border-border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Close' : 'Payment details'}
                        </button>
                        <button onClick={() => removePaymentMethod(pm.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-4 border-t border-border pt-4">
                        <div className="space-y-4">
                          {isCrypto && (
                            <div>
                              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Crypto wallet addresses</p>
                              <p className="text-xs text-text-muted mb-3">
                                Add each wallet with its coin, network and address. The network is shown to customers so they
                                send funds on the correct chain (e.g. USDT on TRC-20 vs ERC-20).
                              </p>
                              <div className="space-y-2">
                                {(draft.wallet_addresses || []).map((entry, i) => (
                                  <div key={i} className="grid grid-cols-1 md:grid-cols-[110px_140px_1fr_auto] gap-2 items-center">
                                    <input
                                      type="text"
                                      value={entry.coin || ''}
                                      onChange={(e) => patchWalletEntry(pm.id, i, 'coin', e.target.value)}
                                      placeholder="Coin (USDT)"
                                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <input
                                      type="text"
                                      value={entry.network || ''}
                                      onChange={(e) => patchWalletEntry(pm.id, i, 'network', e.target.value)}
                                      placeholder="Network (TRC-20)"
                                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <input
                                      type="text"
                                      value={entry.address || ''}
                                      onChange={(e) => patchWalletEntry(pm.id, i, 'address', e.target.value)}
                                      placeholder="Wallet address"
                                      className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <button
                                      onClick={() => removeWalletEntry(pm.id, i)}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Remove wallet"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => addWalletEntry(pm.id)}
                                  className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-text-muted hover:bg-gray-50 transition-colors"
                                >
                                  <Plus className="w-4 h-4" /> Add wallet address
                                </button>
                              </div>
                            </div>
                          )}

                          {isBank && (
                            <div>
                              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Bank account details</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {([
                                  ['account_name', 'Account name'],
                                  ['account_number', 'Account number'],
                                  ['iban', 'IBAN'],
                                  ['swift', 'SWIFT / BIC'],
                                  ['bank_name', 'Bank name'],
                                ] as const).map(([key, label]) => (
                                  <div key={key}>
                                    <label className="block text-xs text-text-muted mb-1">{label}</label>
                                    <input
                                      type="text"
                                      value={draft.bank?.[key] || ''}
                                      onChange={(e) => patchNestedDetailsDraft(pm.id, 'bank', key, e.target.value)}
                                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {isMoneyGram && (
                            <div>
                              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">MoneyGram details</p>
                              <div className="grid grid-cols-1 gap-3">
                                {([
                                  ['receiver_name', 'Receiver name'],
                                ] as const).map(([key, label]) => (
                                  <div key={key}>
                                    <label className="block text-xs text-text-muted mb-1">{label}</label>
                                    <input
                                      type="text"
                                      value={draft.moneygram?.[key] || ''}
                                      onChange={(e) => patchNestedDetailsDraft(pm.id, 'moneygram', key, e.target.value)}
                                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                  </div>
                                ))}
                                <div>
                                  <label className="block text-xs text-text-muted mb-1">Receiver details / instructions</label>
                                  <textarea
                                    value={draft.moneygram?.receiver_details || ''}
                                    onChange={(e) => patchNestedDetailsDraft(pm.id, 'moneygram', 'receiver_details', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-xs text-text-muted mb-1">Additional instructions (optional)</label>
                            <textarea
                              value={draft.instructions || ''}
                              onChange={(e) => patchDetailsDraft(pm.id, { instructions: e.target.value })}
                              rows={2}
                              placeholder="e.g. Transfer must be completed within 1 hour…"
                              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingDetailsId(null)}
                              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-text-muted hover:bg-gray-50 transition-colors"
                            >
                              <X className="w-4 h-4" /> Cancel
                            </button>
                            <button
                              onClick={() => savePaymentDetails(pm.id)}
                              disabled={savingDetails}
                              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
                            >
                              {savingDetails ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save details
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="bg-surface rounded-lg p-6 border border-border">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Payment Method
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="text" value={newPaymentName} onChange={(e) => setNewPaymentName(e.target.value)}
                placeholder="Payment name (e.g., Credit Card)" className="flex-1 px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input type="text" value={newPaymentDesc} onChange={(e) => setNewPaymentDesc(e.target.value)}
                placeholder="Description (optional)" className="flex-1 px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <button onClick={addPaymentMethod} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                <Save className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== ORDERS TAB ========== */}
      {activeTab === 'orders' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-text-muted">{orders.length} orders</p>
          </div>

          {loadingOrders ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <PackageCheck className="w-12 h-12 mx-auto mb-4 text-gold" />
              <p>No orders yet.</p>
              <p className="text-sm mt-2">Orders placed through checkout will appear here.</p>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-text-muted">
                      <th className="px-4 py-3 font-medium">Order</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Shipment</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono font-semibold text-foreground">#{order.id.slice(0, 8).toUpperCase()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-foreground font-medium">{order.full_name || 'Guest'}</p>
                          {order.email && <p className="text-xs text-text-muted">{order.email}</p>}
                        </td>
                        <td className="px-4 py-3 text-text-muted whitespace-nowrap">{formatDate(order.created_at)}</td>
                        <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">€{Number(order.total)?.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                            {order.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-text-muted capitalize">
                            {(order.shipment_status || 'pending').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => openOrder(order)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors">
                            <Truck className="w-3.5 h-3.5" /> Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Order detail modal */}
          {selectedOrder && orderDraft && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-8 overflow-y-auto">
              <div className="bg-white rounded-xl w-full max-w-3xl mx-4 p-6 mb-12">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-bold text-foreground">
                    Order <span className="font-mono">#{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
                  </h2>
                  <button onClick={closeOrder} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                </div>

                {/* Items */}
                <div className="divide-y divide-border mb-5">
                  {Array.isArray(selectedOrder.order_items) && selectedOrder.order_items.length > 0 ? (
                    selectedOrder.order_items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 py-3">
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_name} className="w-14 h-14 object-cover rounded-lg border border-border" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-text-muted" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{item.product_name}</p>
                          <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">€{Number(item.product_price * item.quantity)?.toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-sm text-text-muted">No items recorded.</p>
                  )}
                </div>

                {/* Customer / billing summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface rounded-lg p-4 border border-border text-sm mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-text-muted mb-0.5">Customer</p>
                    <p className="font-medium text-foreground">{selectedOrder.full_name || 'Guest'}</p>
                    <p className="text-text-muted text-xs">{selectedOrder.email}</p>
                  </div>
                  {selectedOrder.phone && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-text-muted mb-0.5">Phone</p>
                      <p className="text-foreground">{selectedOrder.phone}</p>
                    </div>
                  )}
                  {(selectedOrder.address_line1 || selectedOrder.city || selectedOrder.country) && (
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-text-muted mb-0.5">Address</p>
                      <p className="text-foreground">
                        {[selectedOrder.address_line1, selectedOrder.address_line2].filter(Boolean).join(', ')}
                        {[selectedOrder.city, selectedOrder.country].filter(Boolean).join(', ') && (
                          <> · {[selectedOrder.city, selectedOrder.country].filter(Boolean).join(', ')}</>
                        )}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wide text-text-muted mb-0.5">Payment method</p>
                    <p className="text-foreground capitalize">{selectedOrder.payment_method || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-text-muted mb-0.5">Total</p>
                    <p className="font-bold text-foreground">€{Number(selectedOrder.total)?.toFixed(2)}</p>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Order status</label>
                    <select value={orderDraft.status} onChange={(e) => setOrderDraft({ ...orderDraft, status: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Payment status</label>
                    <select value={orderDraft.payment_status} onChange={(e) => setOrderDraft({ ...orderDraft, payment_status: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Carrier</label>
                    <input type="text" value={orderDraft.carrier} onChange={(e) => setOrderDraft({ ...orderDraft, carrier: e.target.value })}
                      placeholder="e.g. DHL, FedEx" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Tracking number</label>
                    <input type="text" value={orderDraft.tracking_number} onChange={(e) => setOrderDraft({ ...orderDraft, tracking_number: e.target.value })}
                      placeholder="Courier tracking ID" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">Shipment status</label>
                    <select value={orderDraft.shipment_status} onChange={(e) => setOrderDraft({ ...orderDraft, shipment_status: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="in_transit">In Transit</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mb-6">
                  <button onClick={saveOrder} disabled={savingOrder}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors">
                    {savingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Save className="w-4 h-4" /> Save changes
                  </button>
                </div>

                {/* Shipment history */}
                <div className="border-t border-border pt-5">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-gold" /> Shipment history
                  </h3>

                  {/* Add event form */}
                  <div className="bg-surface rounded-lg p-4 border border-border mb-4">
                    <p className="text-xs uppercase tracking-wide text-text-muted mb-3 font-medium">Add shipment update</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <select value={eventForm.status} onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                        className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="in_transit">In Transit</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      <input type="text" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                        placeholder="Location (optional)" className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      <input type="text" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        placeholder="Description (optional)" className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <button onClick={addShipmentEvent} disabled={addingEvent}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors">
                      {addingEvent && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Plus className="w-4 h-4" /> Add update
                    </button>
                  </div>

                  {/* Timeline */}
                  {Array.isArray(selectedOrder.shipment_events) && selectedOrder.shipment_events.length > 0 ? (
                    <ol className="relative border-l-2 border-gold/30 ml-2 space-y-5">
                      {[...selectedOrder.shipment_events]
                        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        .map((event: any) => (
                          <li key={event.id} className="relative pl-7">
                            <span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-white border-2 border-gold flex items-center justify-center">
                              <PackageCheck className="w-3.5 h-3.5 text-gold" />
                            </span>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-semibold text-foreground text-sm capitalize">{event.status.replace(/_/g, ' ')}</p>
                              <span className="text-xs text-text-muted">{formatDate(event.created_at)}</span>
                            </div>
                            {event.description && <p className="text-sm text-text-muted mt-0.5">{event.description}</p>}
                            {event.location && (
                              <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" /> {event.location}
                              </p>
                            )}
                          </li>
                        ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-text-muted">No shipment updates yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== USERS TAB ========== */}
      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-text-muted">{users.length} registered users</p>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Users className="w-12 h-12 mx-auto mb-4 text-gold" />
              <p>No users yet.</p>
              <p className="text-sm mt-2">Users who create an account at checkout or in My Account will appear here.</p>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-text-muted">
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Signed up</th>
                      <th className="px-4 py-3 font-medium">Last sign-in</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const isSelf = u.id === user?.id;
                      return (
                        <tr key={u.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gold-light/30 flex items-center justify-center text-primary-dark font-semibold text-sm">
                                {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-foreground">{u.full_name || '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-text-muted">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[11px] px-2 py-0.5 rounded ${u.email_confirmed_at ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {u.email_confirmed_at ? 'Confirmed' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {u.is_admin ? (
                              <span className="text-[11px] px-2 py-0.5 rounded bg-gold/10 text-gold font-medium">Admin</span>
                            ) : (
                              <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-text-muted">Customer</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-text-muted">{formatDate(u.created_at)}</td>
                          <td className="px-4 py-3 text-text-muted">{formatDate(u.last_sign_in_at)}</td>
                          <td className="px-4 py-3 text-right">
                            {isSelf ? (
                              <span className="text-xs text-text-muted">(you)</span>
                            ) : (
                              <button
                                onClick={() => setUserToDelete(u)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Delete confirmation dialog */}
          {userToDelete && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl w-full max-w-md p-6">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Delete user account?</h3>
                <p className="text-sm text-text-muted mb-2">
                  This will permanently delete the account and sign-up profile for:
                </p>
                <p className="text-sm font-semibold text-foreground mb-4 break-all">{userToDelete.email}</p>
                <p className="text-xs text-text-muted mb-5 bg-amber-50 border border-amber-100 rounded-lg p-3">
                  Their order history will be kept but will no longer be linked to an account. This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setUserToDelete(null)}
                    disabled={deletingUser}
                    className="px-4 py-2 border border-border rounded-lg text-sm text-text-muted hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteUser}
                    disabled={deletingUser}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {deletingUser && <Loader2 className="w-4 h-4 animate-spin" />}
                    Delete account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== SETTINGS TAB ========== */}
      {activeTab === 'settings' && (
        <div className="text-center py-12 text-text-muted">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gold" />
          <p>Site settings will be available soon.</p>
          <p className="text-sm mt-2">Configure currency, contact info, and other settings.</p>
        </div>
      )}
    </div>
  );
}

// ---------- Date formatting helper ----------
function formatDate(iso?: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

// ---------- Tab Button Component ----------
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
        active ? 'bg-primary text-white' : 'text-text-muted hover:text-foreground'
      }`}>
      {icon}
      {label}
    </button>
  );
}
