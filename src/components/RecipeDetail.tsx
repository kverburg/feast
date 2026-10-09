import { localizeRecipe, Language } from '../services/localizeRecipe';
import React, { useState } from 'react';
import { Recipe, IngredientItem } from '../types/recipe';
import { convertCupToMetric } from '../services/unitConverterService';
import { Clock, Users, Flame, Heart, Edit, Trash2, ShoppingBag, Play, ArrowLeft, ExternalLink, Timer, CheckSquare, Square, Layers, RefreshCw } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  language: Language;
  onBack: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onStartCookMode: (recipe: Recipe, targetServings: number) => void;
  onAddToShoppingList: (items: any[]) => void;
}

// Convert decimal to nice cooking fraction representation
function formatAmount(amount: number): string {
  if (!amount || amount === 0) return '';

  const whole = Math.floor(amount);
  const remainder = amount - whole;

  let fraction = '';
  if (Math.abs(remainder - 0.25) < 0.05) fraction = '¼';
  else if (Math.abs(remainder - 0.33) < 0.05) fraction = '⅓';
  else if (Math.abs(remainder - 0.5) < 0.05) fraction = '½';
  else if (Math.abs(remainder - 0.66) < 0.05) fraction = '⅔';
  else if (Math.abs(remainder - 0.75) < 0.05) fraction = '¾';

  if (fraction) {
    return whole > 0 ? `${whole} ${fraction}` : fraction;
  }

  // Format clean decimal up to 2 places
  return parseFloat(amount.toFixed(2)).toString();
}

// Metric <-> Imperial conversion helper using ingredient density
function convertUnit(amount: number, unit: string, system: 'metric' | 'imperial', itemName: string = ''): { amount: number; unit: string } {
  if (!amount || !unit) return { amount, unit };
  const u = unit.toLowerCase().trim();

  if (system === 'metric') {
    if (['cup', 'cups', 'tbsp', 'tsp', 'oz', 'lbs'].includes(u)) {
      const converted = convertCupToMetric(amount, unit, itemName);
      return { amount: converted.amount, unit: converted.unit };
    }
  } else if (system === 'imperial') {
    if (u === 'g') return { amount: parseFloat((amount * 0.035274).toFixed(1)), unit: 'oz' };
    if (u === 'kg') return { amount: parseFloat((amount * 2.20462).toFixed(1)), unit: 'lbs' };
    if (u === 'ml') return { amount: parseFloat((amount * 0.00422675).toFixed(2)), unit: 'cups' };
    if (u === 'l') return { amount: parseFloat((amount * 4.22675).toFixed(2)), unit: 'cups' };
  }

  return { amount, unit };
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  language,
  onBack,
  onEdit,
  onDelete,
  onToggleFavorite,
  onStartCookMode,
  onAddToShoppingList,
}) => {
  // Displayed fields based on selected language
  const displayTitle = language === 'en' && recipe.titleEn ? recipe.titleEn : recipe.title;
  const displayDescription = language === 'en' && recipe.descriptionEn ? recipe.descriptionEn : recipe.description;
  const displaySections = language === 'en' && recipe.ingredientSectionsEn ? recipe.ingredientSectionsEn : recipe.ingredientSections;
  const displayInstructions = language === 'en' && recipe.instructionsEn ? recipe.instructionsEn : recipe.instructions;

  // Portion Scaling State
  const [currentServings, setCurrentServings] = useState<number>(recipe.servings || 4);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [activeTimer, setActiveTimer] = useState<{ stepId: string; secondsLeft: number } | null>(null);

  const scaleRatio = currentServings / (recipe.servings || 1);


  const toggleIngredientCheck = (id: string) => {
    setCheckedIngredients(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStepCheck = (id: string) => {
    setCheckedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartTimer = (stepId: string, minutes: number) => {
    setActiveTimer({ stepId, secondsLeft: minutes * 60 });
  };

  const handleAddAllToShopping = () => {
    const itemsToAdd: any[] = [];
    displaySections.forEach(section => {
      section.items.forEach(item => {
        const scaledAmt = item.amount * scaleRatio;
        const converted = convertUnit(scaledAmt, item.unit, unitSystem, item.name);
        itemsToAdd.push({
          id: `shop-${Math.random().toString(36).substr(2, 7)}`,
          name: item.name,
          amount: converted.amount,
          unit: converted.unit,
          recipeTitle: recipe.title,
          sectionTitle: section.title,
          checked: false,
          category: recipe.category
        });
      });
    });
    onAddToShoppingList(itemsToAdd);
  };


  return (
    <div className="recipe-detail-container">
      {/* Top Action Navigation */}
      <div className="detail-nav">
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Recipes</span>
        </button>

        <div className="detail-nav-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(recipe)}>
            <Edit size={16} />
            <span>Edit</span>
          </button>
          <button className="btn btn-outline btn-sm danger" onClick={() => onDelete(recipe.id)}>
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="hero-card card">
        <div className="hero-image-container">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="hero-image"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.triedFallback) {
                target.dataset.triedFallback = 'true';
                target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80';
              }
            }}
          />
          <div className="hero-overlay-gradient"></div>

          <div className="hero-badge-group">
            <span className="badge category-badge">{recipe.category}</span>
            <button
              className={`favorite-btn ${recipe.isFavorite ? 'active' : ''}`}
              onClick={(e) => onToggleFavorite(recipe.id, e)}
            >
              <Heart size={20} fill={recipe.isFavorite ? '#ef4444' : 'none'} color={recipe.isFavorite ? '#ef4444' : '#ffffff'} />
            </button>
          </div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">{displayTitle}</h1>
          <p className="hero-description">{displayDescription}</p>

          <div className="hero-stats">
            <div className="stat-card">
              <Clock size={20} color="var(--accent-primary)" />
              <div className="stat-info">
                <span className="stat-label">Total Time</span>
                <span className="stat-val">{recipe.prepTime + recipe.cookTime} mins</span>
              </div>
            </div>

            <div className="stat-card">
              <Flame size={20} color="#f97316" />
              <div className="stat-info">
                <span className="stat-label">Prep / Cook</span>
                <span className="stat-val">{recipe.prepTime}m / {recipe.cookTime}m</span>
              </div>
            </div>

            <div className="stat-card highlight">
              <Users size={20} color="var(--accent-primary)" />
              <div className="stat-info">
                <span className="stat-label">Portions</span>
                <span className="stat-val">{currentServings} servings</span>
              </div>
            </div>
          </div>

          <div className="hero-cta-bar">
            <button className="btn btn-primary btn-cook-mode" onClick={() => onStartCookMode(localizeRecipe(recipe, language), currentServings)}>
              <Play size={20} fill="#ffffff" />
              <span>Start Cook Mode</span>
            </button>

            {recipe.sourceUrl && (
              <a href={recipe.sourceUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                <ExternalLink size={16} />
                <span>Source Link</span>
              </a>
            )}

          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Ingredients (Split by Part) & Right Steps */}
      <div className="detail-body-grid">
        {/* Left Column: Ingredients Split by Part & Scaler Controls */}
        <div className="ingredients-column card">
          <div className="column-header">
            <div className="column-title-group">
              <Layers size={22} color="var(--accent-primary)" />
              <h2>Ingrediënten <span className="parts-tag">({displaySections?.length || 1} parts)</span></h2>
            </div>

            <button className="btn btn-outline btn-sm" onClick={handleAddAllToShopping}>
              <ShoppingBag size={15} />
              <span>Add to List</span>
            </button>
          </div>

          {/* Dynamic Portion Scaler Control Bar */}
          <div className="portion-scaler-box">
            <div className="scaler-label">
              <Users size={16} />
              <span>Portions / Servings:</span>
            </div>

            <div className="scaler-controls">
              <button
                className="scaler-btn"
                onClick={() => setCurrentServings(Math.max(1, currentServings - 1))}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="50"
                value={currentServings}
                onChange={(e) => setCurrentServings(Math.max(1, parseInt(e.target.value) || 1))}
                className="scaler-input"
              />
              <button
                className="scaler-btn"
                onClick={() => setCurrentServings(currentServings + 1)}
              >
                +
              </button>
            </div>

            {currentServings !== recipe.servings && (
              <button
                className="reset-scaler-btn"
                onClick={() => setCurrentServings(recipe.servings)}
                title={`Reset to original ${recipe.servings} portions`}
              >
                <RefreshCw size={14} /> Reset ({recipe.servings})
              </button>
            )}
          </div>

          {/* Sections List */}
          <div className="sections-container">
            {displaySections && displaySections.map((section) => (
              <div key={section.id} className="ingredient-section">
                <h3 className="section-title">
                  <span className="title-bullet"></span>
                  {section.title}
                </h3>

                <ul className="ingredient-list">
                  {section.items.map((item) => {
                    const isChecked = !!checkedIngredients[item.id];
                    const scaledAmt = item.amount * scaleRatio;
                    const converted = convertUnit(scaledAmt, item.unit, unitSystem, item.name);
                    const formattedAmt = formatAmount(converted.amount);

                    return (
                      <li
                        key={item.id}
                        className={`ingredient-item ${isChecked ? 'checked' : ''}`}
                        onClick={() => toggleIngredientCheck(item.id)}
                      >
                        <div className="check-box">
                          {isChecked ? <CheckSquare size={18} color="var(--accent-primary)" /> : <Square size={18} color="var(--text-dim)" />}
                        </div>

                        <div className="item-details">
                          <span className="item-amount">{formattedAmt} {converted.unit}</span>
                          <span className="item-name">{item.name}</span>
                          {item.notes && <span className="item-notes">({item.notes})</span>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Step-by-Step Instructions */}
        <div className="instructions-column card">
          <div className="column-header">
            <h2>Stap voor Stap</h2>
            <span className="badge badge-secondary">{displayInstructions?.length || 0} Stappen</span>
          </div>

          <div className="steps-container">
            {displayInstructions && displayInstructions.map((step) => {
              const isChecked = !!checkedSteps[step.id];

              return (
                <div key={step.id} className={`step-card ${isChecked ? 'completed' : ''}`}>
                  <div className="step-header" onClick={() => toggleStepCheck(step.id)}>
                    <span className="step-num">{step.stepNumber}</span>
                    <div className="step-check">
                      {isChecked ? <CheckSquare size={20} color="var(--accent-primary)" /> : <Square size={20} color="var(--text-dim)" />}
                    </div>
                  </div>

                  <div className="step-content">
                    <p className="step-text">{step.text}</p>

                    {step.timerMinutes && (
                      <div className="step-timer-row">
                        <button
                          className="btn btn-outline btn-sm timer-btn"
                          onClick={() => handleStartTimer(step.id, step.timerMinutes!)}
                        >
                          <Timer size={15} />
                          <span>Start {step.timerMinutes} min Timer</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      <style>{`
        .recipe-detail-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .detail-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .detail-nav-actions {
          display: flex;
          gap: 0.5rem;
        }
        .btn-outline.danger {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.4);
        }
        .btn-outline.danger:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
        }
        .hero-card {
          display: grid;
          grid-template-columns: 1fr;
          overflow: hidden;
        }
        @media (min-width: 800px) {
          .hero-card {
            grid-template-columns: 420px 1fr;
          }
        }
        .hero-image-container {
          position: relative;
          min-height: 280px;
          background: var(--bg-input);
        }
        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero-overlay-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%);
        }
        .hero-badge-group {
          position: absolute;
          top: 1rem;
          left: 1rem;
          right: 1rem;
          display: flex;
          justify-content: space-between;
        }
        .hero-content {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .hero-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 0.5rem;
        }
        .hero-description {
          color: var(--text-muted);
          font-size: 1rem;
          margin-bottom: 1.5rem;
        }
        .hero-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }
        .stat-card.highlight {
          border-color: var(--accent-primary);
          background: var(--badge-bg);
        }
        .stat-info {
          display: flex;
          flex-direction: column;
        }
        .stat-label {
          font-size: 0.72rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat-val {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-main);
        }
        .hero-cta-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .btn-cook-mode {
          padding: 0.85rem 1.75rem;
          font-size: 1.05rem;
        }
        .detail-body-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 900px) {
          .detail-body-grid {
            grid-template-columns: 420px 1fr;
          }
        }
        .ingredients-column, .instructions-column {
          padding: 1.5rem;
        }
        .column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 1.25rem;
        }
        .column-title-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .parts-tag {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 400;
        }
        .portion-scaler-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .scaler-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .scaler-controls {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .scaler-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          font-weight: 700;
          cursor: pointer;
        }
        .scaler-btn:hover {
          background: var(--accent-primary);
          color: #ffffff;
        }
        .scaler-input {
          width: 48px;
          height: 32px;
          text-align: center;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-main);
          font-weight: 700;
        }
        .reset-scaler-btn {
          background: none;
          border: none;
          color: var(--accent-primary);
          font-size: 0.78rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }
        .sections-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .ingredient-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .section-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .title-bullet {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--accent-primary);
        }
        .ingredient-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .ingredient-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-md);
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .ingredient-item:hover {
          background: var(--bg-card-hover);
        }
        .ingredient-item.checked {
          opacity: 0.5;
          text-decoration: line-through;
        }
        .check-box {
          margin-top: 2px;
        }
        .item-details {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
          font-size: 0.92rem;
        }
        .item-amount {
          font-weight: 700;
          color: var(--accent-primary);
        }
        .item-name {
          color: var(--text-main);
        }
        .item-notes {
          color: var(--text-dim);
          font-size: 0.82rem;
        }
        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .step-card {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          transition: border-color 0.2s ease;
        }
        .step-card.completed {
          opacity: 0.6;
          border-color: var(--border-color);
        }
        .step-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .step-num {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: var(--accent-primary);
          color: #ffffff;
          font-family: var(--font-heading);
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }
        .step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .step-text {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text-main);
        }
        .timer-btn {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

      `}</style>
    </div>
  );
};
