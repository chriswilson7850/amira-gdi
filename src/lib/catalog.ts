import type { Product, Category } from '@/types';
import {
  products as fallbackProducts,
  categories as fallbackCategories,
} from '@/data/site-content';

export interface Catalog {
  products: Product[];
  categories: Category[];
}

interface RawProductCategory {
  category_id: string;
  categories?: { name: string; slug: string } | null;
}

interface RawProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_price: number | null;
  sku: string | null;
  in_stock: boolean;
  rating: number;
  review_count: number;
  featured: boolean;
  metadata: Record<string, string> | null;
  product_images?: { url: string; sort_order: number | null }[];
  product_categories?: RawProductCategory[];
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-');
}

/** Map a Supabase products row (from /api/products) to the storefront Product shape. */
export function mapDbProduct(raw: RawProduct): Product {
  const images = (raw.product_images ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((i) => i.url);
  const categories = (raw.product_categories ?? [])
    .map((pc) => pc.categories?.name)
    .filter(Boolean) as string[];

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? '',
    shortDescription: raw.short_description ?? '',
    price: Number(raw.price),
    comparePrice: raw.compare_price != null ? Number(raw.compare_price) : undefined,
    sku: raw.sku ?? '',
    categories,
    images,
    inStock: raw.in_stock ?? true,
    rating: Number(raw.rating ?? 0),
    reviewCount: Number(raw.review_count ?? 0),
    featured: raw.featured ?? false,
    metadata: raw.metadata ?? {},
  };
}

/** Map a Supabase categories row (from /api/categories) to the storefront Category shape. */
export function mapDbCategory(raw: {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parent_id?: string | null;
}): Category {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? undefined,
    image: raw.image ?? undefined,
    parentId: raw.parent_id ?? undefined,
  };
}

/**
 * Load the live catalog from Supabase via the API routes.
 * Falls back to the static site-content catalog if the fetch fails,
 * so the storefront never renders empty.
 */
export async function getCatalog(): Promise<Catalog> {
  try {
    const [pRes, cRes] = await Promise.all([
      fetch('/api/products', { cache: 'no-store' }),
      fetch('/api/categories', { cache: 'no-store' }),
    ]);
    const pData = await pRes.json();
    const cData = await cRes.json();
    const products = (pData.products ?? []).map(mapDbProduct);
    const categories = (cData.categories ?? []).map(mapDbCategory);
    return { products, categories };
  } catch {
    return {
      products: fallbackProducts as unknown as Product[],
      categories: fallbackCategories as unknown as Category[],
    };
  }
}
