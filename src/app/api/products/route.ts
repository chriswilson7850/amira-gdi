import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { authErrorResponse, requireAdmin, serviceRoleClient } from '@/lib/admin';

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images(url, sort_order),
        product_categories!inner(category_id, categories(name, slug))
      `)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ products });
  } catch (err) {
    console.error('Products GET error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  const authErr = authErrorResponse(auth);
  if (authErr) return authErr;

  try {
    const supabase = serviceRoleClient();

    const body = await request.json();
    const { name, slug, description, short_description, price, compare_price, sku, in_stock, featured, metadata, images, category_ids } = body;

    // Insert product
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        description: description || '',
        short_description: short_description || '',
        price,
        compare_price: compare_price || null,
        sku: sku || '',
        in_stock: in_stock ?? true,
        featured: featured ?? false,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Insert images
    if (images && Array.isArray(images)) {
      const imageRows = images.map((url: string, idx: number) => ({
        product_id: product.id,
        url,
        sort_order: idx,
      }));
      const { error: imgError } = await supabase.from('product_images').insert(imageRows);
      if (imgError) console.error('Failed to insert images:', imgError);
    }

    // Insert category associations
    if (category_ids && Array.isArray(category_ids)) {
      const catRows = category_ids.map((category_id: string) => ({
        product_id: product.id,
        category_id,
      }));
      const { error: catError } = await supabase.from('product_categories').insert(catRows);
      if (catError) console.error('Failed to insert categories:', catError);
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
