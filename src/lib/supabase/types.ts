// Database types matching Supabase schema

export interface DbProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_price: number | null;
  sku: string;
  in_stock: boolean;
  rating: number;
  review_count: number;
  featured: boolean;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface DbProductImage {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface DbCartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface DbOrder {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  country: string | null;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  product_image: string | null;
  quantity: number;
  created_at: string;
}

export interface DbPaymentMethod {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  enabled: boolean;
  sort_order: number;
  created_at: string;
}

export interface DbSiteSetting {
  key: string;
  value: unknown;
  updated_at: string;
}
