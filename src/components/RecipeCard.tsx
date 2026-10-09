import React from 'react';
import { Clock, Users, Heart, Layers } from 'lucide-react';
import { Recipe } from '../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect,
  onToggleFavorite,
}) => {
  const totalParts = recipe.ingredientSections ? recipe.ingredientSections.length : 1;
  const totalIngredientsCount = recipe.ingredientSections
    ? recipe.ingredientSections.reduce((acc, sec) => acc + sec.items.length, 0)
    : 0;

  return (
    <div className="card recipe-card card-hover" onClick={() => onSelect(recipe)}>
      <div className="card-image-wrapper">
        <img
          src={recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1000&q=80'}
          alt={recipe.title}
          className="card-image"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.triedFallback) {
              target.dataset.triedFallback = 'true';
              target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80';
            }
          }}
        />
        <div className="card-overlay">
          <span className="badge category-badge">{recipe.category}</span>
          <button
            className={`favorite-btn ${recipe.isFavorite ? 'active' : ''}`}
            onClick={(e) => onToggleFavorite(recipe.id, e)}
            title={recipe.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <Heart size={18} fill={recipe.isFavorite ? '#ef4444' : 'none'} color={recipe.isFavorite ? '#ef4444' : '#ffffff'} />
          </button>
        </div>
      </div>

      <div className="card-content">
        <h3 className="card-title">{recipe.title}</h3>
        <p className="card-description">{recipe.description}</p>

        <div className="card-meta">
          <div className="meta-item" title="Prep & Cook Time">
            <Clock size={15} />
            <span>{recipe.prepTime + recipe.cookTime} mins</span>
          </div>

          <div className="meta-item" title="Base Portion Count">
            <Users size={15} />
            <span>{recipe.servings} portions</span>
          </div>

          <div className="meta-item" title="Ingredient Parts">
            <Layers size={15} />
            <span>{totalParts} {totalParts === 1 ? 'part' : 'parts'} ({totalIngredientsCount} items)</span>
          </div>
        </div>
      </div>

      <style>{`
        .recipe-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .card-image-wrapper {
          position: relative;
          width: 100%;
          padding-top: 60%; /* 16:9 - 4:3 aspect ratio */
          overflow: hidden;
          background: var(--bg-input);
        }
        .card-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .recipe-card:hover .card-image {
          transform: scale(1.05);
        }
        .card-overlay {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          right: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 2;
        }
        .category-badge {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(8px);
        }
        .favorite-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-full);
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .favorite-btn:hover {
          transform: scale(1.1);
          background: rgba(0, 0, 0, 0.7);
        }
        .card-content {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .card-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.4rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-description {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        .card-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.85rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color);
          font-size: 0.78rem;
          color: var(--text-dim);
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
      `}</style>
    </div>
  );
};
