export interface IngredientItem {
  id: string;
  amount: number;
  unit: string;
  name: string;
  notes?: string;
}

export interface IngredientSection {
  id: string;
  title: string; // e.g. "For the Pasta", "For the Creamy Truffle Sauce", "Toppings"
  items: IngredientItem[];
}

export interface InstructionStep {
  id: string;
  stepNumber: number;
  text: string;
  timerMinutes?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: 'Main' | 'Appetizer' | 'Dessert' | 'Baking' | 'Breakfast' | 'Beverage' | 'Side' | 'Sauce';
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number; // Base portions count (e.g. 4 portions)
  image: string;
  sourceUrl?: string;
  sourceName?: string;
  ingredientSections: IngredientSection[];
  instructions: InstructionStep[];
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  notes?: string;
  // Bilingual support: original English content (only present when recipe was translated to Dutch)
  titleEn?: string;
  descriptionEn?: string;
  ingredientSectionsEn?: IngredientSection[];
  instructionsEn?: InstructionStep[];
  // 2 = Dutch text was written by the Gemini translation (1/undefined = keyword translation)
  translationVersion?: number;
  // True while the Dutch version is waiting in the translation queue (shown as English meanwhile)
  translationPending?: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  recipeTitle: string;
  sectionTitle?: string;
  checked: boolean;
  category: string;
}

export type UnitSystem = 'metric' | 'imperial';
