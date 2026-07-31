import { NextResponse } from 'next/server';
import { createServerSupabase, createServiceRoleSupabase } from '@/lib/supabase/server';
import { sendOrderInvoiceEmail } from '@/lib/email/order-invoice';
import { sendWelcomeEmail } from '@/lib/email/welcome-email';

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    // Orders are private to the signed-in user — never expose all orders to guests.
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

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
    // Use the service-role client for DB writes so guests (no session) can place
    // orders without being blocked by RLS on the orders/order_items tables.
    const admin = createServiceRoleSupabase();

    const body = await request.json();
    const {
      items,
      email,
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      country,
      payment_method,
      notes,
      terms_accepted,
      terms_accepted_at,
      terms_version,
      create_account,
    } = body;

    // Clickwrap consent is mandatory
    if (!terms_accepted || !terms_accepted_at) {
      return NextResponse.json(
        { error: 'You must accept the Terms of Sale before placing an order.' },
        { status: 400 }
      );
    }

    let userId = user?.id || null;

    // Optional: create an account at checkout so the buyer can track the order.
    // Accounts are created unconfirmed via the service-role admin API (which never
    // sends emails itself); we then email the confirmation link ourselves through
    // our SMTP so the welcome email is reliably delivered.
    if (!user && create_account?.password) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password: create_account.password,
        email_confirm: false,
        user_metadata: { full_name: full_name || null },
      });

      if (createErr) {
        // If the account already exists but is unconfirmed, keep the order going
        // and (re)send a confirmation link. Confirmed or invalid duplicates fail.
        // (this supabase-js version has no admin.getUserByEmail — list & filter)
        const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const existingUser = (existing?.users || []).find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );
        if (existingUser && !existingUser.email_confirmed_at) {
          userId = existingUser.id;
        } else {
          return NextResponse.json(
            { error: createErr.message || 'Could not create account. Please try again.' },
            { status: 400 }
          );
        }
      } else {
        userId = created.user.id;
      }

      // Generate a fresh confirmation link and email it (never blocks the order).
      try {
        const { data: linkData } = await admin.auth.admin.generateLink({
          type: 'signup',
          email,
          password: create_account.password,
        });
        const link = linkData?.properties?.action_link;
        if (link) {
          await sendWelcomeEmail(email, full_name, link);
        }
      } catch (linkErr) {
        console.error('[orders] Failed to send welcome email:', linkErr);
      }
    }

    const total = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);

    // Create order
    const { data: order, error } = await admin
      .from('orders')
      .insert({
        user_id: userId,
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
        terms_accepted: true,
        terms_accepted_at,
        terms_version: terms_version || '1.0',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Create order items. The static catalog uses sequential ids ('1'…'11'), which
    // are not valid UUIDs for the order_items.product_id FK — so only pass a
    // product_id when it is a real UUID; the item is otherwise snapshotted.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const orderItems = items.map((item: { product_id?: string; name: string; price: number; quantity: number; image?: string }) => ({
      order_id: order.id,
      product_id: item.product_id && UUID_RE.test(item.product_id) ? item.product_id : null,
      product_name: item.name,
      product_price: item.price,
      product_image: item.image || null,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await admin.from('order_items').insert(orderItems);
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 400 });

    // Attach order items to the response (guests cannot re-read the order due to RLS)
    const fullOrder = { ...order, order_items: orderItems };

    // Clear cart if user is logged in
    if (userId) {
      await admin.from('cart_items').delete().eq('user_id', userId);
    }

    // Send the branded invoice email (never blocks the order response on failure)
    await sendOrderInvoiceEmail(fullOrder);

    return NextResponse.json({ order: fullOrder }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
