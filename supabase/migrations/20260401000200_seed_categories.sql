-- Insert default categories
INSERT INTO public.categories (name, slug, description, icon) VALUES
  ('Clothing', 'clothing', 'Garments and wearable items', 'shirt'),
  ('Accessories', 'accessories', 'Bags, hats, scarves and more', 'bag'),
  ('Home Decor', 'home-decor', 'Pillows, curtains, and home items', 'home'),
  ('Quilting', 'quilting', 'Quilt patterns and blocks', 'grid'),
  ('Toys & Dolls', 'toys-dolls', 'Stuffed animals and doll clothes', 'heart'),
  ('Bags & Pouches', 'bags-pouches', 'Totes, pouches, and storage', 'shopping-bag')
ON CONFLICT (slug) DO NOTHING;
