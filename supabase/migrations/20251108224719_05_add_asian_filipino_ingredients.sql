/*
  # Add Asian and Filipino Cuisine Ingredients

  This migration adds a comprehensive collection of ingredients commonly used in
  Asian and Filipino cuisines, categorized appropriately.

  ## New Ingredients Added
  
  ### Vegetables (Asian/Filipino)
  - Bok choy, Chinese cabbage, Bitter melon (Ampalaya), Eggplant, Water spinach (Kangkong)
  - Bean sprouts, Mushrooms (shiitake), Green beans (Sitaw), Radish (Labanos)
  
  ### Protein (Asian/Filipino)
  - Pork belly, Chicken thighs, Shrimp, Fish sauce, Dried anchovies
  - Ground pork, Pork liver, Beef sirloin, Squid
  
  ### Pantry (Asian/Filipino)
  - Soy sauce, Fish sauce (Patis), Oyster sauce, Vinegar (Suka), Coconut milk
  - Shrimp paste (Bagoong), Tamarind paste, Palm sugar, Rice vinegar
  - Sesame seeds, Miso paste, Gochugaru, Thai basil, Lemongrass
  - Kaffir lime leaves, Galangal, Star anise, Five-spice powder
  
  ### Grains (Asian/Filipino)
  - Jasmine rice, Sticky rice, Rice noodles, Glass noodles, Egg noodles
  - Rice paper, Panko breadcrumbs
  
  ### Fruits (Asian/Filipino)
  - Calamansi, Mango, Papaya, Pineapple, Banana (Saba)
  
  ### Dairy (Asian/Filipino)
  - Condensed milk, Evaporated milk
  
  ## Security
  - No RLS changes needed (inherits from existing policies)
*/

-- Add Asian/Filipino Vegetables
INSERT INTO ingredients (name, category) VALUES
  ('Bok choy', 'Vegetables'),
  ('Chinese cabbage', 'Vegetables'),
  ('Napa cabbage', 'Vegetables'),
  ('Bitter melon', 'Vegetables'),
  ('Eggplant', 'Vegetables'),
  ('Water spinach', 'Vegetables'),
  ('Bean sprouts', 'Vegetables'),
  ('Shiitake mushrooms', 'Vegetables'),
  ('Enoki mushrooms', 'Vegetables'),
  ('Green beans', 'Vegetables'),
  ('Long beans', 'Vegetables'),
  ('Daikon radish', 'Vegetables'),
  ('Carrots', 'Vegetables'),
  ('Bell peppers', 'Vegetables'),
  ('Thai chilies', 'Vegetables'),
  ('Green onions', 'Vegetables'),
  ('Shallots', 'Vegetables'),
  ('Tomatoes', 'Vegetables'),
  ('Okra', 'Vegetables'),
  ('Bamboo shoots', 'Vegetables')
ON CONFLICT (name) DO NOTHING;

-- Add Asian/Filipino Protein
INSERT INTO ingredients (name, category) VALUES
  ('Pork belly', 'Protein'),
  ('Chicken thighs', 'Protein'),
  ('Chicken breast', 'Protein'),
  ('Shrimp', 'Protein'),
  ('Dried anchovies', 'Protein'),
  ('Ground pork', 'Protein'),
  ('Pork liver', 'Protein'),
  ('Beef sirloin', 'Protein'),
  ('Beef short ribs', 'Protein'),
  ('Squid', 'Protein'),
  ('Mussels', 'Protein'),
  ('Milkfish', 'Protein'),
  ('Tilapia', 'Protein'),
  ('Pork chops', 'Protein'),
  ('Duck', 'Protein'),
  ('Beef tripe', 'Protein'),
  ('Pork intestines', 'Protein')
ON CONFLICT (name) DO NOTHING;

-- Add Asian/Filipino Pantry Items
INSERT INTO ingredients (name, category) VALUES
  ('Fish sauce', 'Pantry'),
  ('Oyster sauce', 'Pantry'),
  ('Rice vinegar', 'Pantry'),
  ('White vinegar', 'Pantry'),
  ('Coconut milk', 'Pantry'),
  ('Shrimp paste', 'Pantry'),
  ('Tamarind paste', 'Pantry'),
  ('Palm sugar', 'Pantry'),
  ('Brown sugar', 'Pantry'),
  ('Sesame seeds', 'Pantry'),
  ('Miso paste', 'Pantry'),
  ('Gochugaru', 'Pantry'),
  ('Thai basil', 'Pantry'),
  ('Cilantro', 'Pantry'),
  ('Lemongrass', 'Pantry'),
  ('Kaffir lime leaves', 'Pantry'),
  ('Galangal', 'Pantry'),
  ('Star anise', 'Pantry'),
  ('Five-spice powder', 'Pantry'),
  ('Hoisin sauce', 'Pantry'),
  ('Sriracha', 'Pantry'),
  ('Chili oil', 'Pantry'),
  ('Annatto seeds', 'Pantry'),
  ('Bay leaves', 'Pantry'),
  ('Black peppercorns', 'Pantry'),
  ('Coriander', 'Pantry'),
  ('Cumin', 'Pantry'),
  ('Turmeric', 'Pantry'),
  ('Paprika', 'Pantry'),
  ('Onions', 'Pantry')
ON CONFLICT (name) DO NOTHING;

-- Add Asian/Filipino Grains
INSERT INTO ingredients (name, category) VALUES
  ('Jasmine rice', 'Grains'),
  ('Sticky rice', 'Grains'),
  ('Rice noodles', 'Grains'),
  ('Glass noodles', 'Grains'),
  ('Egg noodles', 'Grains'),
  ('Rice paper', 'Grains'),
  ('Panko breadcrumbs', 'Grains'),
  ('Spring roll wrappers', 'Grains'),
  ('Wonton wrappers', 'Grains'),
  ('Flour', 'Grains'),
  ('Cornstarch', 'Grains')
ON CONFLICT (name) DO NOTHING;

-- Add Asian/Filipino Fruits
INSERT INTO ingredients (name, category) VALUES
  ('Calamansi', 'Fruits'),
  ('Mango', 'Fruits'),
  ('Papaya', 'Fruits'),
  ('Pineapple', 'Fruits'),
  ('Banana', 'Fruits'),
  ('Coconut', 'Fruits')
ON CONFLICT (name) DO NOTHING;

-- Add Asian/Filipino Dairy
INSERT INTO ingredients (name, category) VALUES
  ('Condensed milk', 'Dairy'),
  ('Evaporated milk', 'Dairy')
ON CONFLICT (name) DO NOTHING;
