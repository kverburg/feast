import { Recipe, ShoppingItem } from '../types/recipe';

const STORAGE_KEY_RECIPES = 'gourmet_craft_recipes_v1';
const STORAGE_KEY_SHOPPING = 'gourmet_craft_shopping_v1';
const STORAGE_KEY_THEME = 'gourmet_craft_theme_v1';
const STORAGE_KEY_API_KEY = 'gourmet_craft_gemini_key_v1';

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'seed-1',
    title: 'Creamy Truffle & Wild Mushroom Tagliatelle',
    description: 'Rich, velvet truffle cream pasta cooked al dente, topped with sautéed wild mushrooms and aged Parmigiano-Reggiano.',
    category: 'Main',
    prepTime: 15,
    cookTime: 20,
    servings: 4, // 4 Portions
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281318?auto=format&fit=crop&w=1000&q=80',
    sourceName: 'Gourmet Kitchen',
    sourceUrl: 'https://cookmate.online/example/truffle-pasta',
    isFavorite: true,
    createdAt: new Date().toISOString(),
    tags: ['Italian', 'Pasta', 'Vegetarian', 'Quick Dinner'],
    ingredientSections: [
      {
        id: 'sec-pasta-1',
        title: 'For the Fresh Tagliatelle Pasta',
        items: [
          { id: 'ing-1', amount: 400, unit: 'g', name: 'Fresh Tagliatelle Pasta' },
          { id: 'ing-2', amount: 4, unit: 'l', name: 'Water' },
          { id: 'ing-3', amount: 2, unit: 'tbsp', name: 'Sea Salt', notes: 'for pasta water' }
        ]
      },
      {
        id: 'sec-sauce-1',
        title: 'For the Truffle Cream Sauce',
        items: [
          { id: 'ing-4', amount: 3, unit: 'tbsp', name: 'Unsalted Butter' },
          { id: 'ing-5', amount: 300, unit: 'g', name: 'Wild Mushrooms', notes: 'chanterelles & cremini, sliced' },
          { id: 'ing-6', amount: 3, unit: 'cloves', name: 'Garlic', notes: 'minced' },
          { id: 'ing-7', amount: 200, unit: 'ml', name: 'Heavy Cream' },
          { id: 'ing-8', amount: 2, unit: 'tbsp', name: 'Black Truffle Oil' },
          { id: 'ing-9', amount: 80, unit: 'g', name: 'Parmigiano-Reggiano', notes: 'freshly grated' },
          { id: 'ing-10', amount: 0.5, unit: 'tsp', name: 'Freshly Ground Black Pepper' }
        ]
      },
      {
        id: 'sec-garnish-1',
        title: 'For the Garnish & Serving',
        items: [
          { id: 'ing-11', amount: 2, unit: 'tbsp', name: 'Fresh Parsley', notes: 'chopped' },
          { id: 'ing-12', amount: 20, unit: 'g', name: 'Shaved Black Truffle', notes: 'optional' }
        ]
      }
    ],
    instructions: [
      {
        id: 'st-1',
        stepNumber: 1,
        text: 'Bring a large pot of salted water to a rolling boil.',
        timerMinutes: 8
      },
      {
        id: 'st-2',
        stepNumber: 2,
        text: 'Melt butter in a skillet over medium-high heat. Add sliced wild mushrooms and sauté until golden brown (approx 6 mins). Add garlic and cook for another minute.',
        timerMinutes: 7
      },
      {
        id: 'st-3',
        stepNumber: 3,
        text: 'Pour in heavy cream and lower heat to simmer. Stir in freshly grated Parmigiano-Reggiano until melted and thick.',
        timerMinutes: 4
      },
      {
        id: 'st-4',
        stepNumber: 4,
        text: 'Cook fresh Tagliatelle pasta in boiling water for 3-4 minutes until al dente. Reserve 1/2 cup pasta water, then drain pasta.',
        timerMinutes: 4
      },
      {
        id: 'st-5',
        stepNumber: 5,
        text: 'Toss pasta into truffle cream sauce with a splash of pasta water. Drizzle black truffle oil and top with chopped fresh parsley and shaved truffle.',
        timerMinutes: 2
      }
    ]
  },
  {
    id: 'seed-2',
    title: 'Artisanal Wood-Fired Margherita Pizza',
    description: 'Classic Neapolitan pizza with slow-fermented dough, San Marzano tomato sauce, fresh buffalo mozzarella, and aromatic basil leaves.',
    category: 'Main',
    prepTime: 25,
    cookTime: 12,
    servings: 2, // 2 Portions (2 Pizzas)
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80',
    sourceName: 'Neapolitan Tradition',
    isFavorite: true,
    createdAt: new Date().toISOString(),
    tags: ['Baking', 'Italian', 'Pizza', 'Comfort Food'],
    ingredientSections: [
      {
        id: 'sec-dough-2',
        title: 'For the Pizza Dough (2 balls)',
        items: [
          { id: 'ing-21', amount: 350, unit: 'g', name: 'Tipo 00 Flour' },
          { id: 'ing-22', amount: 230, unit: 'ml', name: 'Lukewarm Water' },
          { id: 'ing-23', amount: 1, unit: 'tsp', name: 'Active Dry Yeast' },
          { id: 'ing-24', amount: 1.5, unit: 'tsp', name: 'Fine Sea Salt' }
        ]
      },
      {
        id: 'sec-sauce-2',
        title: 'For the San Marzano Tomato Sauce',
        items: [
          { id: 'ing-25', amount: 250, unit: 'g', name: 'San Marzano Whole Peeled Tomatoes' },
          { id: 'ing-26', amount: 1, unit: 'clove', name: 'Garlic', notes: 'crushed' },
          { id: 'ing-27', amount: 1, unit: 'tbsp', name: 'Extra Virgin Olive Oil' },
          { id: 'ing-28', amount: 0.5, unit: 'tsp', name: 'Dried Oregano' }
        ]
      },
      {
        id: 'sec-toppings-2',
        title: 'For the Cheese & Toppings',
        items: [
          { id: 'ing-29', amount: 200, unit: 'g', name: 'Fresh Buffalo Mozzarella', notes: 'torn & drained' },
          { id: 'ing-30', amount: 10, unit: 'leaves', name: 'Fresh Basil' },
          { id: 'ing-31', amount: 2, unit: 'tbsp', name: 'Extra Virgin Olive Oil' }
        ]
      }
    ],
    instructions: [
      { id: 'st-21', stepNumber: 1, text: 'Dissolve yeast in warm water. Mix flour and salt, then pour yeast water and knead for 10 minutes into a smooth dough ball. Let rise for 2 hours.', timerMinutes: 120 },
      { id: 'st-22', stepNumber: 2, text: 'Hand-crush San Marzano tomatoes with crushed garlic, olive oil, oregano, and salt to create raw tomato sauce.' },
      { id: 'st-23', stepNumber: 3, text: 'Preheat oven with pizza stone to maximum temperature (250°C / 480°F).', timerMinutes: 30 },
      { id: 'st-24', stepNumber: 4, text: 'Stretch dough into two 10-inch rounds. Spread tomato sauce evenly, arrange mozzarella pieces.' },
      { id: 'st-25', stepNumber: 5, text: 'Bake for 8-10 minutes until crust is charred and cheese bubbles. Garnish with fresh basil and olive oil.', timerMinutes: 10 }
    ]
  },
  {
    id: 'seed-3',
    title: 'Berry Parfait with Honey Granola',
    description: 'Refreshing layered Greek yogurt parfait with roasted almond oat granola and wild berries.',
    category: 'Breakfast',
    prepTime: 10,
    cookTime: 0,
    servings: 2, // 2 Portions
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1000&q=80',
    sourceName: 'Healthy Morning',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    tags: ['Breakfast', 'Quick', 'Healthy', 'Vegetarian'],
    ingredientSections: [
      {
        id: 'sec-base-3',
        title: 'For the Yogurt Base',
        items: [
          { id: 'ing-31', amount: 300, unit: 'g', name: 'Greek Yogurt' },
          { id: 'ing-32', amount: 2, unit: 'tbsp', name: 'Wildflower Honey' },
          { id: 'ing-33', amount: 0.5, unit: 'tsp', name: 'Vanilla Extract' }
        ]
      },
      {
        id: 'sec-fruit-3',
        title: 'For the Berry Compote & Crunch',
        items: [
          { id: 'ing-34', amount: 150, unit: 'g', name: 'Mixed Fresh Berries', notes: 'strawberries & blueberries' },
          { id: 'ing-35', amount: 100, unit: 'g', name: 'Honey Almond Granola' },
          { id: 'ing-36', amount: 1, unit: 'tbsp', name: 'Chia Seeds' }
        ]
      }
    ],
    instructions: [
      { id: 'st-31', stepNumber: 1, text: 'Whisk Greek yogurt, wildflower honey, and vanilla extract together in a bowl.' },
      { id: 'st-32', stepNumber: 2, text: 'In glasses, alternate layers of honey yogurt, granola, and fresh mixed berries.' },
      { id: 'st-33', stepNumber: 3, text: 'Top with chia seeds and serve immediately.' }
    ]
  }
];

export const getStoredRecipes = (): Recipe[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_RECIPES);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(INITIAL_RECIPES));
      return INITIAL_RECIPES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading recipes from localStorage', e);
    return INITIAL_RECIPES;
  }
};

export const saveStoredRecipes = (recipes: Recipe[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(recipes));
  } catch (e) {
    console.error('Error saving recipes to localStorage', e);
  }
};

export const getStoredShoppingList = (): ShoppingItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SHOPPING);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredShoppingList = (items: ShoppingItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_SHOPPING, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving shopping list to localStorage', e);
  }
};

export const getStoredTheme = (): 'dark' | 'light' => {
  return (localStorage.getItem(STORAGE_KEY_THEME) as 'dark' | 'light') || 'dark';
};

export const saveStoredTheme = (theme: 'dark' | 'light'): void => {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
};

export const getStoredApiKey = (): string => {
  return localStorage.getItem(STORAGE_KEY_API_KEY) || '';
};

export const saveStoredApiKey = (key: string): void => {
  localStorage.setItem(STORAGE_KEY_API_KEY, key);
};
