import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// One-time admin setup endpoint
// The registered user can call this to promote their account to admin
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const supabase = await createServerSupabase();

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated. Please login first.' }, { status: 401 });
    }

    // Only allow setting admin for your own account
    if (user.email !== email) {
      return NextResponse.json({ error: 'You can only set admin for your own account.' }, { status: 403 });
    }

    // Check current is_admin value first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile error: ' + profileError.message }, { status: 500 });
    }

    if (profile?.is_admin) {
      return NextResponse.json({ success: true, message: 'Already an admin.' });
    }

    // Update the profile to set is_admin = true
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Update error: ' + updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Admin access granted!' });
  } catch (err) {
    console.error('Setup admin error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
