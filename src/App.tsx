import React, { useState, useEffect, useRef } from 'react';
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
import { retryTranslation, startTranslationQueue, subscribeTranslationChange, subscribeTranslationError } from './services/translationService';
import { ErrorBanner } from './components/ErrorBanner';
import { Toasts } from './components/Toasts';
import { ActivityLog } from './components/ActivityLog';
import { BenchmarkResults } from './components/BenchmarkResults';
import { PeopleSettings } from './components/PeopleSettings';
import { showToast } from './services/toast';
import { getImportJobs, startImportQueue, subscribeImportEvents, subscribeImportJobs } from './services/importQueue';
import { pullActivity } from './services/activityLog';
import { Meal, getStoredMeals, saveStoredMeals } from './services/mealService';

export function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const [importCounts, setImportCounts] = useState({ busy: 0, failed: 0 });
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentTab, setCurrentTab] = useState<'recipes' | 'meals' | 'shopping' | 'settings'>('recipes');
  const [settingsSub, setSettingsSub] = useState<'activity' | 'benchmark' | 'people' | null>(null); // sub page of Settings
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

  // ---- Browser history: Back/Forward move between the list, a recipe, tabs and the import dialog ----
  type Tab = 'recipes' | 'meals' | 'shopping' | 'settings';
  interface NavState {
    tab: Tab;
    recipeId: string | null;
    modal: 'form' | 'import' | 'cook' | null;
    sub: 'activity' | 'benchmark' | 'people' | null;
  }
  interface HistoryEntry {
    nav: NavState;
    idx: number;
    prevKey: string | null;
  }
  const nav: NavState = {
    tab: currentTab,
    recipeId: selectedRecipe?.id ?? null,
    modal: isFormOpen ? 'form' : isImportOpen ? 'import' : cookModeState ? 'cook' : null,
    sub: currentTab === 'settings' ? settingsSub : null,
  };
  const navKey = JSON.stringify(nav);
  const initialHashRef = useRef(window.location.hash); // read before the history effect rewrites the URL
  const deepLinkHandledRef = useRef(false);
  // State a Back/Forward (or the deep link) is about to apply; the history effect must not react to it
  const expectedNavRef = useRef<{ key: string; until: number } | null>(null);
  const expectNav = (key: string) => {
    expectedNavRef.current = { key, until: Date.now() + 600 };
  };
  const recipesRef = useRef<Recipe[]>([]);
  recipesRef.current = recipes;

  const hashFor = (n: NavState) =>
    n.recipeId ? `#/recipe/${n.recipeId}` : n.tab === 'recipes' ? '#/' : n.sub ? `#/${n.tab}/${n.sub}` : `#/${n.tab}`;

  // State -> history: new views push an entry; going back to the previous view uses history.back()
  useEffect(() => {
    const expected = expectedNavRef.current;
    if (expected) {
      if (Date.now() < expected.until) {
        if (expected.key === navKey) expectedNavRef.current = null;
        return;
      }
      expectedNavRef.current = null;
    }
    const cur = window.history.state as HistoryEntry | null;
    if (!cur || !cur.nav) {
      window.history.replaceState({ nav, idx: 0, prevKey: null } as HistoryEntry, '', hashFor(nav));
      return;
    }
    if (JSON.stringify(cur.nav) === navKey) return;
    if (cur.prevKey === navKey) {
      expectNav(navKey);
      window.history.back();
      return;
    }
    window.history.pushState(
      { nav, idx: cur.idx + 1, prevKey: JSON.stringify(cur.nav) } as HistoryEntry,
      '',
      hashFor(nav)
    );
  }, [navKey]);

  // History -> state: Back/Forward
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const target: NavState = (e.state as HistoryEntry | null)?.nav ?? { tab: 'recipes', recipeId: null, modal: null, sub: null };
      const recipe = target.recipeId ? recipesRef.current.find((r) => r.id === target.recipeId) ?? null : null;
      // Forms and cook mode need data that history cannot restore, so they close; the import dialog reopens.
      const applied: NavState = {
        tab: target.tab,
        recipeId: recipe?.id ?? null,
        modal: target.modal === 'import' ? 'import' : null,
        sub: target.tab === 'settings' ? target.sub ?? null : null,
      };
      expectNav(JSON.stringify(applied));
      setCurrentTab(applied.tab);
      setSettingsSub(applied.sub);
      setSelectedRecipe(recipe);
      setIsImportOpen(applied.modal === 'import');
      setIsFormOpen(false);
      setCookModeState(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Opening a recipe starts at its top
  useEffect(() => {
    if (selectedRecipe?.id) window.scrollTo(0, 0);
  }, [selectedRecipe?.id]);

  // Load stored data on initial mount
  useEffect(() => {
    const loadedRecipes = getStoredRecipes();
    setRecipes(loadedRecipes);

    // Opened on a deep link (#/recipe/<id> or #/meals ...): the list stays one Back away
    const hash = initialHashRef.current;
    const recipeMatch = hash.match(/^#\/recipe\/(.+)$/);
    const tabMatch = hash.match(/^#\/(meals|shopping|settings(?:\/(?:activity|benchmark|people))?)$/);
    const deepRecipe = recipeMatch ? loadedRecipes.find((r) => r.id === decodeURIComponent(recipeMatch[1])) : undefined;
    if ((deepRecipe || tabMatch) && !deepLinkHandledRef.current) {
      deepLinkHandledRef.current = true;
      const listNav: NavState = { tab: 'recipes', recipeId: null, modal: null, sub: null };
      const target: NavState = deepRecipe
        ? { tab: 'recipes', recipeId: deepRecipe.id, modal: null, sub: null }
        : {
            tab: tabMatch![1].split('/')[0] as Tab,
            recipeId: null,
            modal: null,
            sub: tabMatch![1].endsWith('/activity') ? 'activity' : tabMatch![1].endsWith('/benchmark') ? 'benchmark' : tabMatch![1].endsWith('/people') ? 'people' : null,
          };
      window.history.replaceState({ nav: listNav, idx: 0, prevKey: null } as HistoryEntry, '', '#/');
      window.history.pushState({ nav: target, idx: 1, prevKey: JSON.stringify(listNav) } as HistoryEntry, '', hashFor(target));
      expectNav(JSON.stringify(target));
      setCurrentTab(target.tab);
      setSettingsSub(target.sub);
      if (deepRecipe) setSelectedRecipe(deepRecipe);
    }

    const loadedShopping = getStoredShoppingList();
    setShoppingList(loadedShopping);

    setMeals(getStoredMeals());

    const loadedTheme = getStoredTheme();
    setTheme(loadedTheme);
    document.documentElement.setAttribute('data-theme', loadedTheme);

    // Background queue: translates recipes that are waiting for a Dutch version (needs a Gemini key)
    const unsubscribeChange = subscribeTranslationChange(() => setRecipes(getStoredRecipes()));
    const unsubscribeError = subscribeTranslationError((m) => {
      setTranslationError(m);
      if (!m) setDismissedError(null);
    });
    startTranslationQueue();

    // Background imports: notify when done or failed, resume anything still queued from last time
    const updateImportCounts = () => {
      const jobs = getImportJobs();
      setImportCounts({
        busy: jobs.filter((j) => j.status !== 'failed').length,
        failed: jobs.filter((j) => j.status === 'failed').length,
      });
    };
    const unsubscribeJobs = subscribeImportJobs(updateImportCounts);
    const unsubscribeImports = subscribeImportEvents((event) => {
      if (event.type === 'done') {
        setRecipes(getStoredRecipes());
        startTranslationQueue();
        showToast({
          kind: 'success',
          message: `Imported "${event.recipe.title}"`,
          actionLabel: 'Open',
          onAction: () => {
            setCurrentTab('recipes');
            setSelectedRecipe(event.recipe);
          },
        });
      } else if (event.type === 'failed') {
        showToast({
          kind: 'error',
          message: `Import failed (${event.job.label.slice(0, 50)}): ${event.error}`,
          actionLabel: 'Details',
          onAction: () => {
            setCurrentTab('settings');
            setSettingsSub('activity');
            setSelectedRecipe(null);
          },
        });
      }
    });
    updateImportCounts();
    startImportQueue();
    void pullActivity();

    const loadedVoice = getStoredVoiceEnabled();
    setVoiceEnabled(loadedVoice);

    return () => {
      unsubscribeChange();
      unsubscribeError();
      unsubscribeJobs();
      unsubscribeImports();
    };
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

    if (recipe.translationPending) startTranslationQueue(); // e.g. after an AI re-parse

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
          setSettingsSub(null);
          setSelectedRecipe(null);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenImportModal={() => setIsImportOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        language={language}
        setLanguage={setLanguage}
        importBusy={importCounts.busy}
        importFailed={importCounts.failed}
        onOpenActivity={() => {
          setCurrentTab('settings');
          setSettingsSub('activity');
          setSelectedRecipe(null);
        }}
      />

      {translationError && dismissedError !== translationError && (
        <ErrorBanner
          message={translationError}
          secondaryLabel="Retry"
          onSecondary={() => void retryTranslation()}
          onDismiss={() => setDismissedError(translationError)}
          actionLabel="Open Settings"
          onAction={() => {
            setCurrentTab('settings');
            setSettingsSub(null);
            setSelectedRecipe(null);
          }}
        />
      )}

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
              meals={meals}
              onOpenMeals={() => setCurrentTab('meals')}
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
            onOpenRecipe={(recipe) => {
              setCurrentTab('recipes');
              setSelectedRecipe(recipe);
            }}
          />
        )}

        {currentTab === 'shopping' && (
          <ShoppingList
            items={shoppingList}
            onUpdateItems={handleUpdateShoppingList}
          />
        )}

        {currentTab === 'settings' && settingsSub === 'activity' && (
          <ActivityLog
            onBack={() => setSettingsSub(null)}
            onOpenRecipe={(id) => {
              const recipe = getStoredRecipes().find((r) => r.id === id);
              if (!recipe) {
                showToast({ kind: 'info', message: 'That recipe no longer exists.' });
                return;
              }
              setSettingsSub(null);
              setCurrentTab('recipes');
              setSelectedRecipe(recipe);
            }}
          />
        )}

        {currentTab === 'settings' && settingsSub === 'benchmark' && (
          <BenchmarkResults onBack={() => setSettingsSub(null)} />
        )}

        {currentTab === 'settings' && settingsSub === 'people' && <PeopleSettings
            onBack={() => setSettingsSub(null)}
            meals={meals}
            recipes={recipes}
            onOpenMeals={() => {
              setSettingsSub(null);
              setCurrentTab('meals');
            }}
          />}

        {currentTab === 'settings' && settingsSub === null && (
          <SettingsModal
            onOpenActivityLog={() => setSettingsSub('activity')}
            onOpenBenchmark={() => setSettingsSub('benchmark')}
            onOpenPeople={() => setSettingsSub('people')}
            recipes={recipes}
            onImportBackup={(newRecipes) => {
              setRecipes(newRecipes);
              saveStoredRecipes(newRecipes);
              startTranslationQueue(); // imported English recipes may be waiting for translation
            }}
            onResetSeed={handleResetSeed}
            theme={theme}
            toggleTheme={toggleTheme}
            voiceEnabled={voiceEnabled}
            onToggleVoice={handleToggleVoice}
          />
        )}
      </main>

      <Toasts />

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
