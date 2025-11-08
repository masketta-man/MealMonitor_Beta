/*
  # Fix Incomplete Recipes - Add Missing Instructions

  This migration adds complete cooking instructions for recipes that are missing them:
  - Simple Omelette
  - Quinoa Bowl  
  - Grilled Salmon

  ## Changes
  - Add step-by-step instructions for each incomplete recipe
  - Include timer information for time-sensitive steps
  
  ## Security
  - No RLS changes needed (inherits from existing policies)
*/

-- Simple Omelette Instructions (recipe_id: '550e8400-e29b-41d4-a716-446655440004')
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440004', 1, 'Crack 3 eggs into a bowl and beat them well with a fork or whisk. Season with a pinch of salt and black pepper.', NULL),
  ('550e8400-e29b-41d4-a716-446655440004', 2, 'Heat a non-stick pan over medium heat and add 1 tablespoon of butter. Let it melt and coat the pan evenly.', 1),
  ('550e8400-e29b-41d4-a716-446655440004', 3, 'Pour the beaten eggs into the pan. Let them sit for about 30 seconds without stirring.', NULL),
  ('550e8400-e29b-41d4-a716-446655440004', 4, 'As the eggs begin to set at the edges, gently push them towards the center with a spatula, tilting the pan to let uncooked egg flow to the edges.', 2),
  ('550e8400-e29b-41d4-a716-446655440004', 5, 'When the eggs are mostly set but still slightly runny on top, add your choice of fillings (cheese, herbs, vegetables) to one half of the omelette.', NULL),
  ('550e8400-e29b-41d4-a716-446655440004', 6, 'Using a spatula, carefully fold the omelette in half over the fillings.', NULL),
  ('550e8400-e29b-41d4-a716-446655440004', 7, 'Cook for another 30 seconds to 1 minute until the cheese melts and the omelette is cooked through.', 1),
  ('550e8400-e29b-41d4-a716-446655440004', 8, 'Slide the omelette onto a plate and serve immediately. Garnish with fresh herbs if desired.', NULL)
ON CONFLICT DO NOTHING;

-- Quinoa Bowl Instructions (recipe_id: '550e8400-e29b-41d4-a716-446655440005')
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440005', 1, 'Rinse 1 cup of quinoa thoroughly under cold water using a fine-mesh strainer.', NULL),
  ('550e8400-e29b-41d4-a716-446655440005', 2, 'In a medium saucepan, combine the rinsed quinoa with 2 cups of water or vegetable broth. Bring to a boil over high heat.', 5),
  ('550e8400-e29b-41d4-a716-446655440005', 3, 'Once boiling, reduce heat to low, cover, and simmer for 15 minutes or until all liquid is absorbed.', 15),
  ('550e8400-e29b-41d4-a716-446655440005', 4, 'Remove from heat and let sit covered for 5 minutes. Then fluff with a fork.', 5),
  ('550e8400-e29b-41d4-a716-446655440005', 5, 'While quinoa cooks, prepare your toppings: dice avocado, halve cherry tomatoes, drain and rinse black beans, and chop cilantro.', NULL),
  ('550e8400-e29b-41d4-a716-446655440005', 6, 'For the dressing, whisk together lime juice, olive oil, minced garlic, salt, and cumin in a small bowl.', NULL),
  ('550e8400-e29b-41d4-a716-446655440005', 7, 'Divide the cooked quinoa among serving bowls.', NULL),
  ('550e8400-e29b-41d4-a716-446655440005', 8, 'Top each bowl with black beans, cherry tomatoes, avocado, and any other desired toppings.', NULL),
  ('550e8400-e29b-41d4-a716-446655440005', 9, 'Drizzle with the prepared dressing and garnish with fresh cilantro. Serve warm or at room temperature.', NULL)
ON CONFLICT DO NOTHING;

-- Grilled Salmon Instructions (recipe_id: '550e8400-e29b-41d4-a716-446655440006')
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440006', 1, 'Remove salmon fillets from refrigerator 15 minutes before cooking to bring to room temperature. Pat dry with paper towels.', NULL),
  ('550e8400-e29b-41d4-a716-446655440006', 2, 'Preheat your grill or grill pan to medium-high heat (about 375-400°F).', 5),
  ('550e8400-e29b-41d4-a716-446655440006', 3, 'In a small bowl, mix together olive oil, minced garlic, lemon juice, dill, salt, and black pepper to create a marinade.', NULL),
  ('550e8400-e29b-41d4-a716-446655440006', 4, 'Brush both sides of the salmon fillets generously with the marinade.', NULL),
  ('550e8400-e29b-41d4-a716-446655440006', 5, 'Lightly oil the grill grates to prevent sticking. Place salmon fillets skin-side down on the grill.', NULL),
  ('550e8400-e29b-41d4-a716-446655440006', 6, 'Grill for 4-5 minutes on the first side without moving the fish. The salmon should develop nice grill marks.', 5),
  ('550e8400-e29b-41d4-a716-446655440006', 7, 'Carefully flip the salmon using a wide spatula. Grill for another 3-4 minutes on the second side.', 4),
  ('550e8400-e29b-41d4-a716-446655440006', 8, 'Check for doneness - the salmon should flake easily with a fork and reach an internal temperature of 145°F. The flesh should be opaque and slightly pink in the center.', NULL),
  ('550e8400-e29b-41d4-a716-446655440006', 9, 'Remove from grill and let rest for 2 minutes. Serve with lemon wedges and fresh dill.', 2)
ON CONFLICT DO NOTHING;
