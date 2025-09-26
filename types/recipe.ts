export interface Ingredient {
  name: string;
  amount: string;
}

export interface Recipe {
  id: string;
  title?: string;  // Make title optional since edit screen uses 'name'
  name?: string;   // Make name optional since detail screen uses 'title'
  image?: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string[];
  difficulty?: string;
  mealType?: string;
  prepTime?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  points?: number;
  isFavorite?: boolean;
  nutritionScore?: number;
}

export interface RecipeCollection {
  [key: string]: Recipe;
}
