import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase/server';

/**
 * Service-role client. Bypasses RLS — only use in server code AFTER
 * requireAdmin() has verified the caller is an authenticated admin.
 */
export function serviceRoleClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

type AuthResult = { user: { id: string } } | { error: string; status: number };

/**
 * Returns the authenticated admin user, or an error payload. The admin check
 * reads `is_admin` from the caller's own profile row (RLS-respecting client),
 * so it stays safe even for writes that run through the service-role client.
 */
export async function requireAdmin(): Promise<AuthResult> {
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

/** Convenience guard for route handlers. */
export function authErrorResponse(auth: AuthResult): NextResponse | null {
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  return null;
}
