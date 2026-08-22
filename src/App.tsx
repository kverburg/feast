import React, { useState, useEffect } from 'react';
import { Recipe, ShoppingItem } from './types/recipe';
import {
  getStoredRecipes,
  saveStoredRecipes,
  getStoredShoppingList,
  saveStoredShoppingList,
  getStoredTheme,
  saveStoredTheme,
  INITIAL_RECIPES
} from './services/storageService';
import { Navbar } from './components/Navbar';
import { RecipeList } from './components/RecipeList';
import { RecipeDetail } from './components/RecipeDetail';
import { RecipeForm } from './components/RecipeForm';
import { RecipeImportModal } from './components/RecipeImportModal';
import { CookModeModal } from './components/CookModeModal';
import { ShoppingList } from './components/ShoppingList';
import { SettingsModal } from './components/SettingsModal';

export function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentTab, setCurrentTab] = useState<'recipes' | 'shopping' | 'settings'>('recipes');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Overlay States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [cookModeState, setCookModeState] = useState<{ recipe: Recipe; servings: number } | null>(null);

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load stored data on initial mount
  useEffect(() => {
    const loadedRecipes = getStoredRecipes();
    setRecipes(loadedRecipes);

    const loadedShopping = getStoredShoppingList();
    setShoppingList(loadedShopping);

    const loadedTheme = getStoredTheme();
    setTheme(loadedTheme);
    document.documentElement.setAttribute('data-theme', loadedTheme);
  }, []);

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
        onOpenAddModal={() => {
          setEditingRecipe(null);
          setIsFormOpen(true);
        }}
        onOpenImportModal={() => setIsImportOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Body */}
      <main className="main-content">
        {currentTab === 'recipes' && (
          selectedRecipe ? (
            <RecipeDetail
              recipe={selectedRecipe}
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
              searchQuery={searchQuery}
              onSelectRecipe={(rec) => setSelectedRecipe(rec)}
              onToggleFavorite={handleToggleFavorite}
              onOpenImportModal={() => setIsImportOpen(true)}
            />
          )
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
          onClose={() => setIsImportOpen(false)}
        />
      )}

      {cookModeState && (
        <CookModeModal
          recipe={cookModeState.recipe}
          initialServings={cookModeState.servings}
          onClose={() => setCookModeState(null)}
        />
      )}
    </div>
  );
}

export default App;
