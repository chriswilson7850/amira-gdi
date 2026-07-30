-- ============================================
-- Seed Data: Demo Products & Categories
-- Run AFTER 00001_initial_schema.sql
-- ============================================

-- Categories
INSERT INTO categories (id, name, slug, description, sort_order) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Gold', 'gold', 'Gold bullion bars and coins', 1),
  ('a0000000-0000-4000-8000-000000000002', 'Gold bars', 'gold-bars', 'Premium gold bars in various weights', 2),
  ('a0000000-0000-4000-8000-000000000003', 'Silver', 'silver', 'Silver bullion bars and coins', 3),
  ('a0000000-0000-4000-8000-000000000004', 'Silver bars', 'silver-bars', 'Investment-grade silver bars', 4),
  ('a0000000-0000-4000-8000-000000000005', 'Silver coins', 'silver-coins', 'Collectible and investment silver coins', 5)
ON CONFLICT (slug) DO NOTHING;

-- Gold Products
INSERT INTO products (id, name, slug, description, short_description, price, sku, in_stock, featured, metadata) VALUES
  ('b0000000-0000-4000-8000-000000000001',
   '5 gram gold bar â€“ Heimerle + Meule minted',
   '5-gram-gold-bar-heimerle-meule-minted',
   'Freshly minted gold bars, sourced directly from the production facility!\n\nDimensions of the blister: 60Ã—90 mm\nThe bars are supplied in a plastic capsule.\nThese bars are LBMA-certified (London Bullion Market Association). This guarantees the highest purity, ethical sourcing, and unrestricted global tradability.',
   'New â€“ Freshly minted gold bars, sourced directly from the production facility! Blister size: 60 x 90 mm. Supplied in plastic capsule. LBMA-certified bars.',
   2556, '1HM100000050000', true, true,
   '{"weight":"5 gram","material":"Gold","brand":"Heimerle + Meule","type":"minted","blisterSize":"60 x 90 mm"}'),
  ('b0000000-0000-4000-8000-000000000002',
   '10 gram gold bar â€“ Heimerle + Meule minted',
   '10-gram-gold-bar-heimerle-meule-minted',
   'Freshly minted gold bars, sourced directly from the production facility!\n\nThe bars are supplied in a plastic capsule.\nThese bars are LBMA-certified (London Bullion Market Association). This guarantees the highest purity, ethical sourcing, and unrestricted global tradability.',
   'New â€“ Freshly minted gold bars, sourced directly from the production facility! Supplied in plastic capsule. LBMA-certified bars.',
   5037, '1HM100000100000', true, true,
   '{"weight":"10 gram","material":"Gold","brand":"Heimerle + Meule","type":"minted"}'),
  ('b0000000-0000-4000-8000-000000000003',
   '20 gram gold bar â€“ Heimerle + Meule minted',
   '20-gram-gold-bar-heimerle-meule-minted',
   'Freshly minted gold bars, sourced directly from the production facility!\n\nThe bars are supplied in a plastic capsule.\nThese bars are LBMA-certified (London Bullion Market Association). This guarantees the highest purity, ethical sourcing, and unrestricted global tradability.',
   'New â€“ Freshly minted gold bars, sourced directly from the production facility! Supplied in plastic capsule. LBMA-certified bars.',
   9949, '1HM100000200000', true, true,
   '{"weight":"20 gram","material":"Gold","brand":"Heimerle + Meule","type":"minted"}'),
  ('b0000000-0000-4000-8000-000000000004',
   '50 gram gold bar â€“ Heimerle + Meule minted',
   '50-gram-gold-bar-heimerle-meule-minted',
   'Freshly minted gold bars, sourced directly from the production facility!\n\nThe bars are supplied in a plastic capsule.\nThese bars are LBMA-certified (London Bullion Market Association). This guarantees the highest purity, ethical sourcing, and unrestricted global tradability.',
   'New â€“ Freshly minted gold bars, sourced directly from the production facility! Supplied in plastic capsule. LBMA-certified bars.',
   24716, '1HM100000500000', true, true,
   '{"weight":"50 gram","material":"Gold","brand":"Heimerle + Meule","type":"minted"}'),
  ('b0000000-0000-4000-8000-000000000005',
   '100 gram gold bar â€“ Heimerle + Meule minted',
   '100-gram-gold-bar-heimerle-meule-minted',
   'Freshly minted gold bars, sourced directly from the production facility!\n\nThe bars are supplied in a plastic capsule.\nThese bars are LBMA-certified (London Bullion Market Association). This guarantees the highest purity, ethical sourcing, and unrestricted global tradability.',
   'New â€“ Freshly minted gold bars, sourced directly from the production facility! Supplied in plastic capsule. LBMA-certified bars.',
   48816, '1HM100001000000', true, true,
   '{"weight":"100 gram","material":"Gold","brand":"Heimerle + Meule","type":"minted"}'),
  ('b0000000-0000-4000-8000-000000000006',
   '1 oz gold bar â€“ Heimerle + Meule minted',
   '1-oz-gold-bar-heimerle-meule-minted',
   'Freshly minted gold bars, sourced directly from the production facility!\n\nThe bars are supplied in a plastic capsule.\nThese bars are LBMA-certified (London Bullion Market Association). This guarantees the highest purity, ethical sourcing, and unrestricted global tradability.',
   'New â€“ Freshly minted gold bars, sourced directly from the production facility! Supplied in plastic capsule. LBMA-certified bars.',
   15728, '1HM100310000000', true, true,
   '{"weight":"1 oz","material":"Gold","brand":"Heimerle + Meule","type":"minted"}')
ON CONFLICT (slug) DO NOTHING;

-- Silver Products
INSERT INTO products (id, name, slug, description, short_description, price, sku, in_stock, featured, metadata) VALUES
  ('b0000000-0000-4000-8000-000000000007',
   '1000 gram silver bar â€“ Heimerle + Meule minted',
   '1000-gram-silver-bar-heimerle-meule-minted',
   'Freshly minted silver bars, sourced directly from the production facility!\n\nThese bars are LBMA-certified, guaranteeing the highest purity and unrestricted global tradability.',
   'New â€“ Freshly minted 1000g silver bar. LBMA-certified. Premium investment quality.',
   15409, '1HM100001000000S', true, false,
   '{"weight":"1000 gram","material":"Silver 9999+","brand":"Heimerle + Meule","type":"minted"}'),
  ('b0000000-0000-4000-8000-000000000008',
   '100 x 1 gram silver UnityBox â€“ Heimerle + Meule',
   '100-x-1-gram-silver-unitybox-heimerle-meule',
   'UnityBox containing 100 bars of 1 gram silver from Heimerle + Meule.\n9999+ pure silver.\nCompact and stackable packaging for easy storage.',
   'UnityBox â€“ 100 x 1 gram silver bars. Heimerle + Meule. 9999+ purity.',
   2839, 'HMUNITY100S', true, false,
   '{"weight":"100 x 1 gram","material":"Silver 9999+","brand":"Heimerle + Meule","type":"unitybox"}'),
  ('b0000000-0000-4000-8000-000000000009',
   'Tube â€“ 25 Coins â€“ 1 oz Silver Maple Leaf 2026',
   'tube-25-coins-1-oz-silver-maple-leaf-2026',
   'Tube containing 25 coins of 1 oz Silver Maple Leaf 2026.\nRoyal Canadian Mint.\n9999+ pure silver.',
   'Tube â€“ 25 Coins â€“ 1 oz Silver Maple Leaf 2026. Royal Canadian Mint.',
   8488, 'RCMTUBE252026', true, false,
   '{"weight":"25 x 1 oz","material":"Silver 9999+","brand":"Royal Canadian Mint","type":"coin tube","year":"2026"}'),
  ('b0000000-0000-4000-8000-00000000000a',
   '4 Tubes â€“ 100 Coins â€“ 1 oz Silver Maple Leaf 2026',
   '100-4-x-25-tube-1-oz-silver-maple-leaf-2026',
   '4 Tubes containing 100 coins of 1 oz Silver Maple Leaf 2026.\nRoyal Canadian Mint.\n9999+ pure silver.',
   '4 Tubes â€“ 100 Coins â€“ 1 oz Silver Maple Leaf 2026. Royal Canadian Mint.',
   34165, 'RCM100MAPLE2026', true, false,
   '{"weight":"100 x 1 oz","material":"Silver 9999+","brand":"Royal Canadian Mint","type":"4 tubes","year":"2026"}'),
  ('b0000000-0000-4000-8000-00000000000b',
   'Masterbox â€“ 500 Coins â€“ 1 oz Silver Maple Leaf 2026',
   '500-masterbox-1-oz-silver-maple-leaf-2026',
   'Masterbox containing 500 coins of 1 oz Silver Maple Leaf 2026.\nRoyal Canadian Mint.\n9999+ pure silver.',
   'Masterbox â€“ 500 Coins â€“ 1 oz Silver Maple Leaf 2026. Royal Canadian Mint.',
   169238, 'RCMMASTER5002026', true, false,
   '{"weight":"500 x 1 oz","material":"Silver 9999+","brand":"Royal Canadian Mint","type":"masterbox","year":"2026"}')
ON CONFLICT (slug) DO NOTHING;

-- Product Images
INSERT INTO product_images (product_id, url, sort_order) VALUES
  -- 5g Gold
  ('b0000000-0000-4000-8000-000000000001', '/images/products/5-gram-gold-bar.jpg', 0),
  ('b0000000-0000-4000-8000-000000000001', '/images/products/5-gram-gold-bar-back.jpg', 1),
  -- 10g Gold
  ('b0000000-0000-4000-8000-000000000002', '/images/products/10-gram-gold-bar.jpg', 0),
  -- 20g Gold
  ('b0000000-0000-4000-8000-000000000003', '/images/products/20-gram-gold-bar.jpg', 0),
  -- 50g Gold
  ('b0000000-0000-4000-8000-000000000004', '/images/products/50-gram-gold-bar.jpg', 0),
  -- 100g Gold
  ('b0000000-0000-4000-8000-000000000005', '/images/products/100-gram-gold-bar.jpg', 0),
  -- 1oz Gold
  ('b0000000-0000-4000-8000-000000000006', '/images/products/1-oz-gold-bar.jpg', 0),
  -- 1000g Silver
  ('b0000000-0000-4000-8000-000000000007', '/images/products/1000-gram-silver-bar.jpg', 0),
  -- UnityBox Silver
  ('b0000000-0000-4000-8000-000000000008', '/images/products/100x1g-silver-front.jpg', 0),
  -- Tube Maple Leaf
  ('b0000000-0000-4000-8000-000000000009', '/images/products/tube-maple-leaf-front.jpg', 0),
  ('b0000000-0000-4000-8000-000000000009', '/images/products/tube-maple-leaf-back.jpg', 1),
  -- 4 Tubes
  ('b0000000-0000-4000-8000-00000000000a', '/images/products/4-tubes-maple-leaf-front.jpg', 0),
  -- Masterbox
  ('b0000000-0000-4000-8000-00000000000b', '/images/products/masterbox-maple-leaf-front.jpg', 0)
ON CONFLICT DO NOTHING;

-- Product-Category Associations
INSERT INTO product_categories (product_id, category_id) VALUES
  -- Gold products -> Gold + Gold bars
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002'),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002'),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000002'),
  -- Silver products -> Silver + Silver bars/coins
  ('b0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000003'),
  ('b0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000004'),
  ('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000003'),
  ('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000004'),
  ('b0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000003'),
  ('b0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000005'),
  ('b0000000-0000-4000-8000-00000000000a', 'a0000000-0000-4000-8000-000000000003'),
  ('b0000000-0000-4000-8000-00000000000a', 'a0000000-0000-4000-8000-000000000005'),
  ('b0000000-0000-4000-8000-00000000000b', 'a0000000-0000-4000-8000-000000000003'),
  ('b0000000-0000-4000-8000-00000000000b', 'a0000000-0000-4000-8000-000000000005')
ON CONFLICT DO NOTHING;

-- Default Payment Methods
INSERT INTO payment_methods (name, slug, description, icon, sort_order) VALUES
  ('Bank Transfer', 'bank-transfer', 'Direct bank transfer to our account', 'banknote', 1),
  ('Cryptocurrency', 'cryptocurrency', 'Bitcoin, Ethereum, USDT, and other major cryptocurrencies', 'bitcoin', 2),
  ('MoneyGram', 'moneygram', 'MoneyGram money transfer', 'banknote', 3)
ON CONFLICT (slug) DO NOTHING;
