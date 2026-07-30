import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data: orders, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { items, email, full_name, phone, address_line1, address_line2, city, country, payment_method, notes } = body;

    const total = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);

    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        email,
        full_name,
        phone,
        address_line1,
        address_line2,
        city,
        country,
        total,
        payment_method,
        notes,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Create order items
    const orderItems = items.map((item: { product_id?: string; name: string; price: number; quantity: number; image?: string }) => ({
      order_id: order.id,
      product_id: item.product_id || null,
      product_name: item.name,
      product_price: item.price,
      product_image: item.image || null,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 400 });

    // Clear cart if user is logged in
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
