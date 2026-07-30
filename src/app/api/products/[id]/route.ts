import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images(url, sort_order),
        product_categories!inner(category_id)
      `)
      .eq('id', id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, short_description, price, compare_price, sku, in_stock, featured, metadata, images, category_ids } = body;

    // Update product
    const { data: product, error } = await supabase
      .from('products')
      .update({
        name,
        slug,
        description,
        short_description,
        price,
        compare_price,
        sku,
        in_stock,
        featured,
        metadata,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Replace images
    if (images && Array.isArray(images)) {
      await supabase.from('product_images').delete().eq('product_id', id);
      const imageRows = images.map((url: string, idx: number) => ({
        product_id: id,
        url,
        sort_order: idx,
      }));
      await supabase.from('product_images').insert(imageRows);
    }

    // Replace categories
    if (category_ids && Array.isArray(category_ids)) {
      await supabase.from('product_categories').delete().eq('product_id', id);
      const catRows = category_ids.map((category_id: string) => ({
        product_id: id,
        category_id,
      }));
      await supabase.from('product_categories').insert(catRows);
    }

    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
