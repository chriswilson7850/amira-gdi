import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase/server';

function serviceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

/** Returns the authenticated admin user, or an error response payload. */
async function requireAdmin() {
  const supabase = await createServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 };
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  if (!profile?.is_admin) {
    return { error: 'Forbidden', status: 403 };
  }
  return { user };
}

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const admin = serviceRoleClient();
    const { data: orders, error } = await admin
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ orders });
  } catch (err) {
    console.error('Admin orders GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const body = await request.json();
    const { order_id, status, payment_status, tracking_number, carrier, shipment_status, shipment_event } = body;
    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    const admin = serviceRoleClient();

    // Normalize new scalar values against allowed lists (allow clearing with '')
    const patch: Record<string, unknown> = {};
    if (status !== undefined) {
      if (status && !STATUSES.includes(status)) {
        return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
      }
      patch.status = status || null;
    }
    if (payment_status !== undefined) {
      if (payment_status && !PAYMENT_STATUSES.includes(payment_status)) {
        return NextResponse.json({ error: `Invalid payment_status: ${payment_status}` }, { status: 400 });
      }
      patch.payment_status = payment_status || null;
    }
    if (tracking_number !== undefined) patch.tracking_number = tracking_number || null;
    if (carrier !== undefined) patch.carrier = carrier || null;
    if (shipment_status !== undefined) patch.shipment_status = shipment_status || 'pending';

    // Fetch current order to append the new shipment event onto the JSONB array
    if (shipment_event) {
      const { data: existing } = await admin
        .from('orders')
        .select('shipment_events')
        .eq('id', order_id)
        .single();

      const events = Array.isArray(existing?.shipment_events) ? existing.shipment_events : [];
      const newEvent = {
        id: crypto.randomUUID(),
        status: shipment_event.status || 'shipped',
        description: shipment_event.description || '',
        location: shipment_event.location || '',
        created_at: new Date().toISOString(),
        created_by: auth.user.id,
      };
      events.push(newEvent);
      patch.shipment_events = events;

      // Keep shipment_status in sync with the latest event's status
      if (shipment_status === undefined && newEvent.status) {
        patch.shipment_status = newEvent.status;
      }
    }

    const { data: updated, error } = await admin
      .from('orders')
      .update(patch)
      .eq('id', order_id)
      .select('*, order_items(*)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ order: updated });
  } catch (err) {
    console.error('Admin orders PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
