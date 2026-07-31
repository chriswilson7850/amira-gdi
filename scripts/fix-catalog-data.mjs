// Fixes catalog data in Supabase:
// 1. Repairs mojibake (mis-encoded UTF-8) in product name/description/short_description
// 2. Sets parent_id + sort_order on categories so the shop filter shows only top-level (Gold/Silver)
//
// Run from the project root:
//   node --env-file=.env.local scripts/fix-catalog-data.mjs
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

/** Repair UTF-8 mis-decode artifacts (order matters: longest sequences first). */
function fixText(input) {
  if (typeof input !== 'string' || !input) return input;
  const replacements = [
    ['â€“', '\u2013'], // – en dash
    ['â€”', '\u2014'], // — em dash
    ['â€™', '\u2019'], // ’ right single quote
    ['â€œ', '\u201c'], // “ left double quote
    ['â€\u009d', '\u201d'], // ” right double quote
    ['â€', '\u201d'], // ” right double quote (fallback)
    ['Ã—', '\u00d7'], // × multiplication sign
    ['Ã©', '\u00e9'], // é
    ['Ã¨', '\u00e8'], // è
    ['Ã¼', '\u00fc'], // ü
    ['Ã¶', '\u00f6'], // ö
    ['Ã¤', '\u00e4'], // ä
    ['Â ', ' '],
    ['Â', ''],
  ];
  let out = input;
  for (const [from, to] of replacements) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  return out;
}

async function main() {
  // ---- 1. Fix product text ----
  const { data: products, error: pErr } = await supabase.from('products').select('id, name, description, short_description');
  if (pErr) {
    console.error('Failed to load products:', pErr.message);
    process.exit(1);
  }
  console.log(`Loaded ${products.length} products`);

  let updated = 0;
  for (const p of products) {
    const name = fixText(p.name);
    const description = fixText(p.description);
    const short_description = fixText(p.short_description);
    if (name !== p.name || description !== p.description || short_description !== p.short_description) {
      const { error } = await supabase
        .from('products')
        .update({ name, description, short_description })
        .eq('id', p.id);
      if (error) {
        console.error(`  ! Failed to update ${p.id}: ${error.message}`);
      } else {
        updated++;
        console.log(`  * Fixed: ${name}`);
      }
    }
  }
  console.log(`Updated ${updated} products`);

  // ---- 2. Fix category hierarchy ----
  const { data: cats, error: cErr } = await supabase.from('categories').select('id, slug');
  if (cErr) {
    console.error('Failed to load categories:', cErr.message);
    process.exit(1);
  }
  const bySlug = Object.fromEntries((cats ?? []).map((c) => [c.slug, c.id]));

  const plan = [
    { slug: 'gold', parent: null, sort_order: 1 },
    { slug: 'gold-bars', parent: 'gold', sort_order: 2 },
    { slug: 'silver', parent: null, sort_order: 3 },
    { slug: 'silver-bars', parent: 'silver', sort_order: 4 },
    { slug: 'silver-coins', parent: 'silver', sort_order: 5 },
  ];

  for (const item of plan) {
    const id = bySlug[item.slug];
    if (!id) {
      console.log(`  ! Category "${item.slug}" not found, skipping`);
      continue;
    }
    const { error } = await supabase
      .from('categories')
      .update({ parent_id: item.parent ? bySlug[item.parent] : null, sort_order: item.sort_order })
      .eq('id', id);
    if (error) {
      console.error(`  ! Failed to set parent for ${item.slug}: ${error.message}`);
    } else {
      console.log(`  * ${item.slug} -> parent ${item.parent ?? '(none)'} (sort ${item.sort_order})`);
    }
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
