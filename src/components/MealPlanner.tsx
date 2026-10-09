import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Minus, X, ShoppingBag, Search } from 'lucide-react';
import { Recipe, ShoppingItem } from '../types/recipe';
import {
  MealPlanEntry,
  combineIngredients,
  toDateKey,
  toShoppingItems,
} from '../services/mealPlanService';

interface MealPlannerProps {
  recipes: Recipe[];
  entries: MealPlanEntry[];
  onUpdateEntries: (entries: MealPlanEntry[]) => void;
  onAddToShoppingList: (items: ShoppingItem[]) => void;
}

const startOfWeek = (d: Date): Date => {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const offset = (out.getDay() + 6) % 7; // Monday first
  out.setDate(out.getDate() - offset);
  return out;
};

const addDays = (d: Date, n: number): Date => {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
};

const formatAmount = (n: number): string => String(Math.round(n * 100) / 100);

export const MealPlanner: React.FC<MealPlannerProps> = ({
  recipes,
  entries,
  onUpdateEntries,
  onAddToShoppingList,
}) => {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [pickerDate, setPickerDate] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [range, setRange] = useState<'week' | 'upcoming'>('week');

  const todayKey = toDateKey(new Date());
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekKeys = days.map(toDateKey);
  const recipeById = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  const rangeEntries = entries.filter((e) =>
    range === 'week' ? weekKeys.includes(e.date) : e.date >= todayKey,
  );
  const ingredients = useMemo(() => combineIngredients(rangeEntries, recipes), [rangeEntries, recipes]);

  const addMeal = (date: string, recipe: Recipe) => {
    onUpdateEntries([
      ...entries,
      {
        id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date,
        recipeId: recipe.id,
        servings: recipe.servings || 1,
      },
    ]);
    setPickerDate(null);
    setPickerSearch('');
  };

  const removeMeal = (id: string) => onUpdateEntries(entries.filter((e) => e.id !== id));

  const changeServings = (id: string, delta: number) =>
    onUpdateEntries(
      entries.map((e) => (e.id === id ? { ...e, servings: Math.max(1, e.servings + delta) } : e)),
    );

  const pickerRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(pickerSearch.trim().toLowerCase()),
  );

  const weekLabel = `${days[0].toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – ${days[6].toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="meals-container">
      <div className="meals-header card">
        <div className="meals-title-box">
          <div className="meals-icon">
            <CalendarDays size={24} color="#ffffff" />
          </div>
          <div>
            <h2>Meal Planner</h2>
            <p className="meals-sub">{weekLabel}</p>
          </div>
        </div>
        <div className="meals-week-nav">
          <button className="btn btn-secondary btn-icon" onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="Previous week">
            <ChevronLeft size={18} />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            Today
          </button>
          <button className="btn btn-secondary btn-icon" onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="Next week">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="meals-days">
        {days.map((day) => {
          const key = toDateKey(day);
          const dayEntries = entries.filter((e) => e.date === key);
          return (
            <div key={key} className={`meals-day card ${key === todayKey ? 'today' : ''}`}>
              <div className="meals-day-head">
                <strong>{day.toLocaleDateString(undefined, { weekday: 'long' })}</strong>
                <span>{day.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
              </div>

              {dayEntries.map((entry) => {
                const recipe = recipeById.get(entry.recipeId);
                return (
                  <div key={entry.id} className="meals-entry">
                    <span className="meals-entry-title">{recipe ? recipe.title : 'Deleted recipe'}</span>
                    <div className="meals-entry-controls">
                      <button className="meals-mini-btn" onClick={() => changeServings(entry.id, -1)} aria-label="Fewer servings">
                        <Minus size={12} />
                      </button>
                      <span className="meals-servings">{entry.servings}p</span>
                      <button className="meals-mini-btn" onClick={() => changeServings(entry.id, 1)} aria-label="More servings">
                        <Plus size={12} />
                      </button>
                      <button className="meals-mini-btn danger" onClick={() => removeMeal(entry.id)} aria-label="Remove meal">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                className="btn btn-outline btn-sm meals-add"
                onClick={() => {
                  setPickerDate(key);
                  setPickerSearch('');
                }}
              >
                <Plus size={14} />
                <span>Add recipe</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="meals-ingredients card">
        <div className="meals-ingredients-head">
          <h3>Combined ingredients ({ingredients.length})</h3>
          <div className="meals-ingredients-actions">
            <select
              className="select-field"
              value={range}
              onChange={(e) => setRange(e.target.value as 'week' | 'upcoming')}
            >
              <option value="week">This week</option>
              <option value="upcoming">All upcoming meals</option>
            </select>
            <button
              className="btn btn-primary btn-sm"
              disabled={ingredients.length === 0}
              onClick={() => onAddToShoppingList(toShoppingItems(ingredients))}
            >
              <ShoppingBag size={16} />
              <span>Add to shopping list</span>
            </button>
          </div>
        </div>

        {ingredients.length === 0 ? (
          <p className="meals-empty">No meals planned for this range yet.</p>
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

      {pickerDate && (
        <div className="meals-overlay" onClick={() => setPickerDate(null)}>
          <div className="meals-picker card" onClick={(e) => e.stopPropagation()}>
            <div className="meals-picker-head">
              <h3>Pick a recipe</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setPickerDate(null)} aria-label="Close">
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
                  <button onClick={() => addMeal(pickerDate, r)}>
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
        .meals-week-nav { display: flex; align-items: center; gap: 0.5rem; }
        .meals-days { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 1rem; }
        .meals-day { padding: 0.9rem; display: flex; flex-direction: column; gap: 0.6rem; }
        .meals-day.today { border-color: var(--accent-primary); box-shadow: 0 0 0 2px var(--accent-glow); }
        .meals-day-head { display: flex; justify-content: space-between; align-items: baseline; color: var(--text-main); }
        .meals-day-head span { color: var(--text-muted); font-size: 0.8rem; }
        .meals-entry { background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.5rem 0.6rem; display: flex; flex-direction: column; gap: 0.4rem; }
        .meals-entry-title { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
        .meals-entry-controls { display: flex; align-items: center; gap: 0.4rem; }
        .meals-servings { font-size: 0.8rem; color: var(--text-muted); min-width: 2rem; text-align: center; }
        .meals-mini-btn { background: var(--bg-card-hover); border: 1px solid var(--border-color); color: var(--text-main); border-radius: var(--radius-full); width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
        .meals-mini-btn.danger { margin-left: auto; }
        .meals-mini-btn:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
        .meals-add { justify-content: center; margin-top: auto; }
        .meals-ingredients { padding: 1.25rem; }
        .meals-ingredients-head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
        .meals-ingredients-actions { display: flex; align-items: center; gap: 0.6rem; }
        .meals-ingredient-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
        .meals-ingredient-list li { display: grid; grid-template-columns: 110px 1fr 1.2fr; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); font-size: 0.92rem; }
        .meals-ing-amount { color: var(--accent-primary); font-weight: 600; }
        .meals-ing-name { color: var(--text-main); }
        .meals-ing-from { color: var(--text-dim); font-size: 0.8rem; }
        .meals-empty { color: var(--text-muted); font-size: 0.9rem; }
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
