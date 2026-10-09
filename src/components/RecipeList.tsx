import React, { useState } from 'react';
import { Recipe } from '../types/recipe';
import { RecipeCard } from './RecipeCard';
import { Language } from '../services/localizeRecipe';
import { Sparkles, SlidersHorizontal, Heart, Utensils, RotateCcw } from 'lucide-react';

interface RecipeListProps {
  recipes: Recipe[];
  language: Language;
  searchQuery: string;
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenImportModal: () => void;
  onResetSeed?: () => void;
}

const CATEGORIES = ['All', 'Favorites', 'Main', 'Appetizer', 'Dessert', 'Baking', 'Breakfast', 'Beverage', 'Side', 'Sauce'];

export const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  language,
  searchQuery,
  onSelectRecipe,
  onToggleFavorite,
  onOpenImportModal,
  onResetSeed,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'time'>('newest');

  // Filter recipes based on category, search query
  const filteredRecipes = recipes.filter((recipe) => {
    // Category match
    if (selectedCategory === 'Favorites') {
      if (!recipe.isFavorite) return false;
    } else if (selectedCategory !== 'All') {
      if (recipe.category !== selectedCategory) return false;
    }

    // Search query match across title, description, category, tags, and ingredient names/parts
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = recipe.title.toLowerCase().includes(q);
      const matchDesc = recipe.description?.toLowerCase().includes(q);
      const matchCat = recipe.category?.toLowerCase().includes(q);
      const matchTags = recipe.tags?.some(t => t.toLowerCase().includes(q));
      const matchIngredients = recipe.ingredientSections?.some(sec => 
        sec.title.toLowerCase().includes(q) ||
        sec.items.some(item => item.name.toLowerCase().includes(q))
      );

      return matchTitle || matchDesc || matchCat || matchTags || matchIngredients;
    }

    return true;
  });

  // Sort recipes
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'time') {
      return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
    }
    // newest default
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="recipe-list-container">
      {/* Category Pills & Filters */}
      <div className="filter-bar">
        <div className="category-scroll">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'Favorites' && <Heart size={14} className="pill-icon" />}
              {cat}
            </button>
          ))}
        </div>

        <div className="filter-right-group">
          {onResetSeed && (
            <button
              className="btn btn-outline btn-sm reset-recipes-btn"
              onClick={() => {
                if (confirm('Are you sure you want to remove all added recipes and reset to the default ones? This cannot be undone.')) {
                  onResetSeed();
                }
              }}
              title="Remove all added recipes and keep only the default recipes"
            >
              <RotateCcw size={14} />
              <span>Reset to Defaults</span>
            </button>
          )}

          <div className="sort-controls">
            <SlidersHorizontal size={15} color="var(--text-dim)" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="title">Sort by: Name (A-Z)</option>
              <option value="time">Sort by: Quickest Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      {sortedRecipes.length > 0 ? (
        <div className="recipe-grid">
          {sortedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              language={language}
              onSelect={onSelectRecipe}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <div className="empty-icon">
            <Utensils size={48} color="var(--accent-primary)" />
          </div>
          <h3>No Recipes Found</h3>
          <p>
            {searchQuery
              ? `No recipes matching "${searchQuery}". Try a different term or clear search.`
              : 'Your recipe book is empty for this category. Import a recipe or add your own!'}
          </p>
          <div className="empty-actions">
            <button className="btn btn-primary" onClick={onOpenImportModal}>
              <Sparkles size={18} />
              <span>Import Recipe (URL / Photo)</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .recipe-list-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .category-scroll {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        .category-scroll::-webkit-scrollbar {
          display: none;
        }
        .category-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 1rem;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.88rem;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .category-pill:hover {
          background: var(--bg-card-hover);
          color: var(--text-main);
        }
        .category-pill.active {
          background: var(--accent-primary);
          color: #ffffff;
          border-color: var(--accent-primary);
          box-shadow: 0 4px 12px var(--accent-glow);
        }
        .pill-icon {
          fill: currentColor;
        }
        .filter-right-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .reset-recipes-btn {
          font-size: 0.82rem;
          gap: 0.35rem;
        }
        .sort-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .sort-select {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
        }
        .recipe-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .empty-state {
          padding: 3.5rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .empty-icon {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-full);
          background: var(--badge-bg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .empty-actions {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};
