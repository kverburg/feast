export interface IngredientItem {
  id: string;
  amount: number;
  unit: string;
  name: string;
  notes?: string;
  // Singular and plural form of the name (filled in by the annotation pass), so the list can say
  // "1 ui" or "2 uien" when the portions change
  nameSingular?: string;
  namePlural?: string;
}

export interface IngredientSection {
  id: string;
  title: string; // e.g. "For the Pasta", "For the Creamy Truffle Sauce", "Toppings"
  items: IngredientItem[];
}

// A place in a step's text where an ingredient is used; the step shows its (scaled) amount there
export interface StepRef {
  ingredientId: string;
  mention: string; // exact words in the step text, e.g. "de uien"
  fraction?: number; // share of the ingredient's amount used in this step (default 1)
}

export interface InstructionStep {
  id: string;
  stepNumber: number;
  text: string;
  timerMinutes?: number;
  refs?: StepRef[];
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
  sourceImage?: string; // the photo this recipe was read from (photo imports), kept as the source
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
  // 2 = Dutch text was written by the Gemini translation
  translationVersion?: number;
  // 1 = plural forms and step references were added (see annotationService)
  annotationVersion?: number;
  // Freshly imported or re-parsed by you: translate and annotate right away (direct calls) instead of in the
  // background batch. Cleared once annotation is done.
  liveWork?: boolean;
  // True while the recipe waits in the translation queue (Dutch -> English, anything else -> Dutch)
  translationPending?: boolean;
  // Fingerprint of the content when it was queued, to notice hand edits while waiting
  translationSourceHash?: string;
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
