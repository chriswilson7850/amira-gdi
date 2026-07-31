import { NextResponse } from 'next/server';
import { createServiceRoleSupabase } from '@/lib/supabase/server';

/**
 * Public order tracking by order reference.
 * Accepts the full order UUID or the short 8-character reference shown on the
 * success screen / order history (e.g. "B45859BA"), case-insensitive.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = (searchParams.get('ref') || '').trim();
    if (!ref) {
      return NextResponse.json({ error: 'Order reference is required.' }, { status: 400 });
    }

    const admin = createServiceRoleSupabase();

    // Full UUID match first
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref);

    if (isUuid) {
      const { data: order, error } = await admin
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', ref)
        .single();

      if (error) {
        console.error('[track] lookup error:', error.message);
        return NextResponse.json({ error: 'Could not look up that order.' }, { status: 500 });
      }
      if (!order) {
        return NextResponse.json({ error: 'No order found with that reference.' }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    // Short reference (first 8 chars) — PostgREST can't ilike a uuid column,
    // so fetch order ids and match the prefix in JS.
    const prefix = ref.toLowerCase();
    const { data: idRows, error: idError } = await admin
      .from('orders')
      .select('id')
      .limit(1000);

    if (idError) {
      console.error('[track] id lookup error:', idError.message);
      return NextResponse.json({ error: 'Could not look up that order.' }, { status: 500 });
    }

    const matched = (idRows || []).find((o) => o.id.toLowerCase().startsWith(prefix));
    if (!matched) {
      return NextResponse.json({ error: 'No order found with that reference.' }, { status: 404 });
    }

    const { data: order, error } = await admin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', matched.id)
      .single();

    if (error) {
      console.error('[track] lookup error:', error.message);
      return NextResponse.json({ error: 'Could not look up that order.' }, { status: 500 });
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error('[track] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
