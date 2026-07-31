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
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// ---------- Types ----------
interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  icon: string;
  description: string;
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

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'payments' | 'settings'>('products');
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
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '' });
  const [savingCategory, setSavingCategory] = useState(false);

  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 'bank-transfer', name: 'Bank Transfer', enabled: true, icon: 'banknote', description: 'Direct bank transfer to our account' },
    { id: 'crypto', name: 'Cryptocurrency', enabled: true, icon: 'bitcoin', description: 'Bitcoin, Ethereum, USDT, and other major cryptocurrencies' },
    { id: 'moneygram', name: 'MoneyGram', enabled: true, icon: 'banknote', description: 'MoneyGram money transfer' },
  ]);
  const [newPaymentName, setNewPaymentName] = useState('');
  const [newPaymentDesc, setNewPaymentDesc] = useState('');

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
  }, [activeTab]);

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
    setCategoryForm({ name: '', slug: '', description: '' });
    setShowCategoryForm(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditCategoryId(cat.id);
    setCategoryForm({ name: cat.name, slug: cat.slug, description: cat.description || '' });
    setShowCategoryForm(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCategory(true);
    try {
      if (editCategoryId) {
        // Update category via PUT
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...categoryForm, sort_order: 0 }),
        });
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...categoryForm, sort_order: 0 }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error); return; }
      }
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

  // ---------- Payment Handlers ----------
  const togglePayment = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((pm) => (pm.id === id ? { ...pm, enabled: !pm.enabled } : pm))
    );
  };

  const addPaymentMethod = () => {
    if (!newPaymentName.trim()) return;
    const id = newPaymentName.toLowerCase().replace(/\s+/g, '-');
    setPaymentMethods((prev) => [
      ...prev,
      { id, name: newPaymentName, enabled: true, icon: 'banknote', description: newPaymentDesc || 'Custom payment method' },
    ]);
    setNewPaymentName('');
    setNewPaymentDesc('');
  };

  const removePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
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
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="flex items-center justify-between p-4 bg-white border border-border rounded-lg">
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
                  <button onClick={() => removePaymentMethod(pm.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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
