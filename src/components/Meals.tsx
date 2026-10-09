import React, { useMemo, useState } from 'react';
import { UtensilsCrossed, Plus, Minus, X, ShoppingBag, Search, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { Recipe, ShoppingItem } from '../types/recipe';
import { Meal, combineIngredients, toShoppingItems } from '../services/mealService';

interface MealsProps {
  recipes: Recipe[];
  meals: Meal[];
  onUpdateMeals: (meals: Meal[]) => void;
  onAddToShoppingList: (items: ShoppingItem[]) => void;
}

const formatAmount = (n: number): string => String(Math.round(n * 100) / 100);

export const Meals: React.FC<MealsProps> = ({ recipes, meals, onUpdateMeals, onAddToShoppingList }) => {
  const [view, setView] = useState<'active' | 'archived'>('active');
  const [newName, setNewName] = useState('');
  const [pickerMealId, setPickerMealId] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [excluded, setExcluded] = useState<Set<string>>(new Set()); // active meals left out of the combined list

  const recipeById = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);
  const activeMeals = meals.filter((m) => !m.archived);
  const archivedMeals = meals.filter((m) => m.archived);
  const shown = view === 'active' ? activeMeals : archivedMeals;

  const included = activeMeals.filter((m) => !excluded.has(m.id));
  const ingredients = useMemo(() => combineIngredients(included, recipes), [included, recipes]);

  const updateMeal = (id: string, patch: (m: Meal) => Meal) =>
    onUpdateMeals(meals.map((m) => (m.id === id ? patch(m) : m)));

  const createMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    onUpdateMeals([
      {
        id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        recipes: [],
        archived: false,
        createdAt: new Date().toISOString(),
      },
      ...meals,
    ]);
    setNewName('');
    setView('active');
  };

  const deleteMeal = (meal: Meal) => {
    if (confirm(`Delete "${meal.name}" permanently?`)) onUpdateMeals(meals.filter((m) => m.id !== meal.id));
  };

  const addRecipe = (mealId: string, recipe: Recipe) => {
    updateMeal(mealId, (m) => ({
      ...m,
      recipes: [...m.recipes, { recipeId: recipe.id, servings: recipe.servings || 1 }],
    }));
    setPickerMealId(null);
    setPickerSearch('');
  };

  const changeServings = (mealId: string, index: number, delta: number) =>
    updateMeal(mealId, (m) => ({
      ...m,
      recipes: m.recipes.map((r, i) => (i === index ? { ...r, servings: Math.max(1, r.servings + delta) } : r)),
    }));

  const removeRecipe = (mealId: string, index: number) =>
    updateMeal(mealId, (m) => ({ ...m, recipes: m.recipes.filter((_, i) => i !== index) }));

  const toggleIncluded = (id: string) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const pickerRecipes = recipes.filter((r) => r.title.toLowerCase().includes(pickerSearch.trim().toLowerCase()));

  return (
    <div className="meals-container">
      <div className="meals-header card">
        <div className="meals-title-box">
          <div className="meals-icon">
            <UtensilsCrossed size={24} color="#ffffff" />
          </div>
          <div>
            <h2>Meals</h2>
            <p className="meals-sub">Group recipes into meals you name yourself</p>
          </div>
        </div>
        <form className="meals-new" onSubmit={createMeal}>
          <input
            className="input-field"
            placeholder="New meal name (e.g. Sunday dinner)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={!newName.trim()}>
            <Plus size={16} />
            <span>Create</span>
          </button>
        </form>
      </div>

      <div className="meals-tabs">
        <button className={`btn btn-sm ${view === 'active' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('active')}>
          Active ({activeMeals.length})
        </button>
        <button className={`btn btn-sm ${view === 'archived' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('archived')}>
          Archived ({archivedMeals.length})
        </button>
      </div>

      {shown.length === 0 ? (
        <p className="meals-empty card">
          {view === 'active' ? 'No meals yet. Create one above.' : 'Nothing archived.'}
        </p>
      ) : (
        <div className="meals-list">
          {shown.map((meal) => (
            <div key={meal.id} className="meals-meal card">
              <div className="meals-meal-head">
                {view === 'active' && (
                  <input
                    type="checkbox"
                    checked={!excluded.has(meal.id)}
                    onChange={() => toggleIncluded(meal.id)}
                    title="Include in combined ingredients"
                  />
                )}
                <input
                  className="meals-name-input"
                  value={meal.name}
                  onChange={(e) => updateMeal(meal.id, (m) => ({ ...m, name: e.target.value }))}
                  onBlur={(e) => {
                    if (!e.target.value.trim()) updateMeal(meal.id, (m) => ({ ...m, name: 'Untitled meal' }));
                  }}
                  aria-label="Meal name"
                />
                <div className="meals-meal-actions">
                  {view === 'active' ? (
                    <button className="btn btn-secondary btn-sm" onClick={() => updateMeal(meal.id, (m) => ({ ...m, archived: true }))}>
                      <Archive size={14} />
                      <span>Archive</span>
                    </button>
                  ) : (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => updateMeal(meal.id, (m) => ({ ...m, archived: false }))}>
                        <ArchiveRestore size={14} />
                        <span>Restore</span>
                      </button>
                      <button className="btn btn-outline btn-sm danger" onClick={() => deleteMeal(meal)}>
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {meal.recipes.length === 0 && <p className="meals-empty">No recipes in this meal yet.</p>}
              {meal.recipes.map((entry, index) => {
                const recipe = recipeById.get(entry.recipeId);
                return (
                  <div key={`${entry.recipeId}-${index}`} className="meals-entry">
                    <span className="meals-entry-title">{recipe ? recipe.title : 'Deleted recipe'}</span>
                    <div className="meals-entry-controls">
                      <button className="meals-mini-btn" onClick={() => changeServings(meal.id, index, -1)} aria-label="Fewer servings">
                        <Minus size={12} />
                      </button>
                      <span className="meals-servings">{entry.servings}p</span>
                      <button className="meals-mini-btn" onClick={() => changeServings(meal.id, index, 1)} aria-label="More servings">
                        <Plus size={12} />
                      </button>
                      <button className="meals-mini-btn" onClick={() => removeRecipe(meal.id, index)} aria-label="Remove recipe">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {view === 'active' && (
                <button
                  className="btn btn-outline btn-sm meals-add"
                  onClick={() => {
                    setPickerMealId(meal.id);
                    setPickerSearch('');
                  }}
                >
                  <Plus size={14} />
                  <span>Add recipe</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {view === 'active' && (
        <div className="meals-ingredients card">
          <div className="meals-ingredients-head">
            <h3>
              Combined ingredients ({ingredients.length}) · {included.length} of {activeMeals.length} meals
            </h3>
            <button
              className="btn btn-primary btn-sm"
              disabled={ingredients.length === 0}
              onClick={() => onAddToShoppingList(toShoppingItems(ingredients))}
            >
              <ShoppingBag size={16} />
              <span>Add to shopping list</span>
            </button>
          </div>
          {ingredients.length === 0 ? (
            <p className="meals-empty">Tick meals above and add recipes to see the combined ingredients.</p>
          ) : (
            <ul className="meals-ingredient-list">
              {ingredients.map((ing) => (
                <li key={ing.key}>
                  <span className="meals-ing-amount">
                    {formatAmount(ing.amount)} {ing.unit}
                  </span>
                  <span className="meals-ing-name">{ing.name}</span>
                  <span className="meals-ing-from">{ing.recipes.join(', ')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {pickerMealId && (
        <div className="meals-overlay" onClick={() => setPickerMealId(null)}>
          <div className="meals-picker card" onClick={(e) => e.stopPropagation()}>
            <div className="meals-picker-head">
              <h3>Pick a recipe</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setPickerMealId(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="meals-picker-search">
              <Search size={16} />
              <input
                autoFocus
                className="input-field"
                placeholder="Search recipes..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
              />
            </div>
            <ul className="meals-picker-list">
              {pickerRecipes.map((r) => (
                <li key={r.id}>
                  <button onClick={() => addRecipe(pickerMealId, r)}>
                    <span>{r.title}</span>
                    <small>{r.servings} servings · {r.category}</small>
                  </button>
                </li>
              ))}
              {pickerRecipes.length === 0 && <li className="meals-empty">No recipes found.</li>}
            </ul>
          </div>
        </div>
      )}

      <style>{`
        .meals-container { display: flex; flex-direction: column; gap: 1.25rem; }
        .meals-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding: 1.25rem; }
        .meals-title-box { display: flex; align-items: center; gap: 1rem; }
        .meals-icon { width: 48px; height: 48px; border-radius: 14px; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; }
        .meals-sub { color: var(--text-muted); font-size: 0.9rem; margin: 0; }
        .meals-new { display: flex; gap: 0.5rem; flex: 1; max-width: 460px; min-width: 240px; }
        .meals-tabs { display: flex; gap: 0.5rem; }
        .meals-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
        .meals-meal { padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
        .meals-meal-head { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
        .meals-name-input { flex: 1; min-width: 120px; background: transparent; border: 1px solid transparent; border-radius: var(--radius-sm); color: var(--text-main); font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; padding: 0.25rem 0.4rem; }
        .meals-name-input:hover, .meals-name-input:focus { border-color: var(--border-color); outline: none; background: var(--bg-input); }
        .meals-meal-actions { display: flex; gap: 0.4rem; }
        .meals-entry { background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.5rem 0.6rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
        .meals-entry-title { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
        .meals-entry-controls { display: flex; align-items: center; gap: 0.4rem; }
        .meals-servings { font-size: 0.8rem; color: var(--text-muted); min-width: 2rem; text-align: center; }
        .meals-mini-btn { background: var(--bg-card-hover); border: 1px solid var(--border-color); color: var(--text-main); border-radius: var(--radius-full); width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
        .meals-mini-btn:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
        .meals-add { justify-content: center; }
        .meals-ingredients { padding: 1.25rem; }
        .meals-ingredients-head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
        .meals-ingredient-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
        .meals-ingredient-list li { display: grid; grid-template-columns: 110px 1fr 1.2fr; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); font-size: 0.92rem; }
        .meals-ing-amount { color: var(--accent-primary); font-weight: 600; }
        .meals-ing-name { color: var(--text-main); }
        .meals-ing-from { color: var(--text-dim); font-size: 0.8rem; }
        .meals-empty { color: var(--text-muted); font-size: 0.9rem; }
        .card.meals-empty { padding: 1.25rem; }
        .meals-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .meals-picker { width: 100%; max-width: 460px; max-height: 80vh; display: flex; flex-direction: column; gap: 0.75rem; padding: 1.25rem; }
        .meals-picker-head { display: flex; justify-content: space-between; align-items: center; }
        .meals-picker-search { display: flex; align-items: center; gap: 0.5rem; color: var(--text-dim); }
        .meals-picker-list { list-style: none; margin: 0; padding: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 0.4rem; }
        .meals-picker-list button { width: 100%; text-align: left; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.6rem 0.8rem; color: var(--text-main); cursor: pointer; display: flex; flex-direction: column; gap: 0.15rem; }
        .meals-picker-list button:hover { border-color: var(--accent-primary); }
        .meals-picker-list small { color: var(--text-muted); }
        @media (max-width: 767px) {
          .meals-ingredient-list li { grid-template-columns: 90px 1fr; }
          .meals-ing-from { grid-column: 1 / -1; }
        }
      `}</style>
    </div>
  );
};
