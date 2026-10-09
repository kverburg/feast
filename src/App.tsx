import React, { useState, useEffect } from 'react';
import { Recipe, ShoppingItem } from './types/recipe';
import {
  getStoredRecipes,
  saveStoredRecipes,
  getStoredShoppingList,
  saveStoredShoppingList,
  getStoredTheme,
  saveStoredTheme,
  getStoredVoiceEnabled,
  getStoredLanguage,
  saveStoredLanguage,
  saveStoredVoiceEnabled,
  INITIAL_RECIPES
} from './services/storageService';
import { Language } from './services/localizeRecipe';
import { Navbar } from './components/Navbar';
import { RecipeList } from './components/RecipeList';
import { RecipeDetail } from './components/RecipeDetail';
import { RecipeForm } from './components/RecipeForm';
import { RecipeImportModal } from './components/RecipeImportModal';
import { CookModeModal } from './components/CookModeModal';
import { ShoppingList } from './components/ShoppingList';
import { SettingsModal } from './components/SettingsModal';
import { Meals } from './components/Meals';
import { upgradeKeywordTranslations } from './services/translationService';
import { Meal, getStoredMeals, saveStoredMeals } from './services/mealService';

export function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentTab, setCurrentTab] = useState<'recipes' | 'meals' | 'shopping' | 'settings'>('recipes');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Overlay States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [cookModeState, setCookModeState] = useState<{ recipe: Recipe; servings: number } | null>(null);

  // Theme & Voice Settings State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguageState] = useState<Language>(() => getStoredLanguage());
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveStoredLanguage(lang);
  };
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);

  // Load stored data on initial mount
  useEffect(() => {
    const loadedRecipes = getStoredRecipes();
    setRecipes(loadedRecipes);

    const loadedShopping = getStoredShoppingList();
    setShoppingList(loadedShopping);

    setMeals(getStoredMeals());

    const loadedTheme = getStoredTheme();
    setTheme(loadedTheme);
    document.documentElement.setAttribute('data-theme', loadedTheme);

    // Quietly re-translate older keyword-translated recipes with Gemini (needs a saved key)
    upgradeKeywordTranslations().then((changed) => {
      if (changed) setRecipes(getStoredRecipes());
    });

    const loadedVoice = getStoredVoiceEnabled();
    setVoiceEnabled(loadedVoice);
  }, []);

  const handleToggleVoice = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    saveStoredVoiceEnabled(enabled);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    saveStoredTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Recipe Handlers
  const handleSaveRecipe = (recipe: Recipe) => {
    let updated: Recipe[];
    const exists = recipes.some(r => r.id === recipe.id);

    if (exists) {
      updated = recipes.map(r => r.id === recipe.id ? recipe : r);
    } else {
      updated = [recipe, ...recipes];
    }

    setRecipes(updated);
    saveStoredRecipes(updated);

    if (selectedRecipe && selectedRecipe.id === recipe.id) {
      setSelectedRecipe(recipe);
    }

    setIsFormOpen(false);
    setEditingRecipe(null);
  };

  const handleDeleteRecipe = (id: string) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      const updated = recipes.filter(r => r.id !== id);
      setRecipes(updated);
      saveStoredRecipes(updated);

      if (selectedRecipe && selectedRecipe.id === id) {
        setSelectedRecipe(null);
      }
    }
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recipes.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r);
    setRecipes(updated);
    saveStoredRecipes(updated);

    if (selectedRecipe && selectedRecipe.id === id) {
      setSelectedRecipe(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  // Import Handler
  const handleImportComplete = (importedRecipe: Recipe) => {
    const updated = [importedRecipe, ...recipes];
    setRecipes(updated);
    saveStoredRecipes(updated);
    setIsImportOpen(false);
    setSelectedRecipe(importedRecipe);
    setCurrentTab('recipes');
  };

  // Shopping List Handlers
  const handleUpdateShoppingList = (items: ShoppingItem[]) => {
    setShoppingList(items);
    saveStoredShoppingList(items);
  };

  const handleAddItemsToShoppingList = (newItems: ShoppingItem[]) => {
    const updated = [...shoppingList, ...newItems];
    setShoppingList(updated);
    saveStoredShoppingList(updated);
    alert(`Added ${newItems.length} ingredients to your Shopping List!`);
  };

  // Meals Handler
  const handleUpdateMeals = (updated: Meal[]) => {
    setMeals(updated);
    saveStoredMeals(updated);
  };

  // Reset Seed Recipes
  const handleResetSeed = () => {
    setRecipes(INITIAL_RECIPES);
    saveStoredRecipes(INITIAL_RECIPES);
    setSelectedRecipe(null);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setSelectedRecipe(null);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenImportModal={() => setIsImportOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Content Body */}
      <main className="main-content">
        {currentTab === 'recipes' && (
          selectedRecipe ? (
            <RecipeDetail
              recipe={selectedRecipe}
              language={language}
              onBack={() => setSelectedRecipe(null)}
              onEdit={(rec) => {
                setEditingRecipe(rec);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteRecipe}
              onToggleFavorite={handleToggleFavorite}
              onStartCookMode={(rec, srv) => setCookModeState({ recipe: rec, servings: srv })}
              onAddToShoppingList={handleAddItemsToShoppingList}
            />
          ) : (
            <RecipeList
              recipes={recipes}
              language={language}
              searchQuery={searchQuery}
              onSelectRecipe={(rec) => setSelectedRecipe(rec)}
              onToggleFavorite={handleToggleFavorite}
              onOpenImportModal={() => setIsImportOpen(true)}
            />
          )
        )}

        {currentTab === 'meals' && (
          <Meals
            recipes={recipes}
            meals={meals}
            onUpdateMeals={handleUpdateMeals}
            onAddToShoppingList={handleAddItemsToShoppingList}
          />
        )}

        {currentTab === 'shopping' && (
          <ShoppingList
            items={shoppingList}
            onUpdateItems={handleUpdateShoppingList}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsModal
            recipes={recipes}
            onImportBackup={(newRecipes) => {
              setRecipes(newRecipes);
              saveStoredRecipes(newRecipes);
            }}
            onResetSeed={handleResetSeed}
            theme={theme}
            toggleTheme={toggleTheme}
            voiceEnabled={voiceEnabled}
            onToggleVoice={handleToggleVoice}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      {isFormOpen && (
        <RecipeForm
          initialRecipe={editingRecipe || undefined}
          onSave={handleSaveRecipe}
          onClose={() => {
            setIsFormOpen(false);
            setEditingRecipe(null);
          }}
        />
      )}

      {isImportOpen && (
        <RecipeImportModal
          onImportComplete={handleImportComplete}
          onManualAdd={() => {
            setIsImportOpen(false);
            setEditingRecipe(null);
            setIsFormOpen(true);
          }}
          onClose={() => setIsImportOpen(false)}
        />
      )}

      {cookModeState && (
        <CookModeModal
          recipe={cookModeState.recipe}
          initialServings={cookModeState.servings}
          voiceEnabled={voiceEnabled}
          onClose={() => setCookModeState(null)}
        />
      )}
    </div>
  );
}

export default App;
