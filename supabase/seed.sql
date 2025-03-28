-- Seed data for categories table
INSERT INTO categories (id, emoji, name, keywords)
VALUES
  (1, '🍕', 'pizza', ARRAY['italian', 'pepperoni', 'cheese', 'pasta', 'calzone']),
  (2, '🍺', 'beer', ARRAY['brewery', 'pub', 'ale', 'lager', 'bar']),
  (3, '🍣', 'sushi', ARRAY['japanese', 'sashimi', 'roll', 'tempura', 'miso']),
  (4, '☕️', 'coffee', ARRAY['cafe', 'espresso', 'latte', 'pastry', 'mocha']),
  (5, '🍔', 'burger', ARRAY['fries', 'diner', 'cheeseburger', 'shake', 'grill']),
  (6, '🌮', 'mexican', ARRAY['taco', 'burrito', 'salsa', 'guacamole', 'enchilada']),
  (7, '🍜', 'ramen', ARRAY['noodle', 'broth', 'japanese', 'miso', 'tonkotsu']),
  (8, '🥗', 'salad', ARRAY['healthy', 'greens', 'dressing', 'veggie', 'bowl']),
  (9, '🍦', 'dessert', ARRAY['cake', 'ice cream', 'pastry', 'sweet', 'cookie']),
  (10, '🍷', 'wine', ARRAY['vineyard', 'bar', 'red', 'white', 'tasting']),
  (11, '🍲', 'asian_fusion', ARRAY['thai', 'vietnamese', 'korean', 'chinese', 'noodle']),
  (12, '🥪', 'sandwich', ARRAY['deli', 'sub', 'bread', 'panini', 'bodega']),
  (13, '🍝', 'italian', ARRAY['pasta', 'pizza', 'risotto', 'lasagna', 'gelato']),
  (14, '🥩', 'steak', ARRAY['grill', 'beef', 'ribeye', 'sirloin', 'barbecue']),
  (15, '🍗', 'chicken', ARRAY['fried', 'grilled', 'wings', 'nuggets', 'roast']),
  (16, '🍤', 'seafood', ARRAY['shrimp', 'fish', 'crab', 'lobster', 'oyster']),
  (17, '🍛', 'indian', ARRAY['curry', 'naan', 'tandoori', 'biryani', 'samosa']),
  (18, '🥘', 'spanish', ARRAY['paella', 'tapas', 'chorizo', 'sangria', 'churros']),
  (19, '🍱', 'japanese', ARRAY['sushi', 'ramen', 'tempura', 'teriyaki', 'sake']),
  (20, '🥟', 'chinese', ARRAY['dumpling', 'noodle', 'fried rice', 'dim sum', 'sweet and sour']),
  (21, '🧆', 'middle_eastern', ARRAY['falafel', 'hummus', 'kebab', 'shawarma', 'baklava']),
  (22, '🥐', 'bakery', ARRAY['bread', 'pastry', 'croissant', 'cake', 'muffin']),
  (23, '🍨', 'ice_cream', ARRAY['gelato', 'sundae', 'frozen yogurt', 'sorbet', 'cone']),
  (24, '🍹', 'cocktail', ARRAY['bar', 'mixology', 'mojito', 'martini', 'margarita']),
  (25, '🍽️', 'place', ARRAY['restaurant', 'eatery', 'diner', 'cafe', 'bistro'])
ON CONFLICT (id) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  name = EXCLUDED.name,
  keywords = EXCLUDED.keywords;
