import { localizeRecipe, Language } from '../services/localizeRecipe';
import React, { useEffect, useState } from 'react';
import { Recipe, IngredientItem } from '../types/recipe';
import { convertUnit, displayName, formatAmount, formatUnit } from '../services/amounts';
import { StepText } from './StepText';
import { Meal, formatMealDate, mealsWithRecipe } from '../services/mealService';
import { usePeople } from '../services/peopleService';
import { exportRecipePdf } from '../services/pdfExport';
import { Clock, Users, Flame, Heart, Edit, Trash2, ShoppingBag, Play, ArrowLeft, ExternalLink, FileDown, Image as ImageIcon, Timer, Pause, RotateCcw, X, CheckSquare, Square, Layers, RefreshCw } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  language: Language;
  onBack: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onStartCookMode: (recipe: Recipe, targetServings: number) => void;
  onAddToShoppingList: (items: any[]) => void;
  meals: Meal[];
  onOpenMeals: () => void;
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
  meals,
  onOpenMeals,
}) => {
  const people = usePeople();
  const recipeMeals = mealsWithRecipe(meals, recipe.id);
  // Displayed fields based on selected language
  const displayTitle = language === 'en' && recipe.titleEn ? recipe.titleEn : recipe.title;
  const displayDescription = language === 'en' && recipe.descriptionEn ? recipe.descriptionEn : recipe.description;
  const displaySections = language === 'en' && recipe.ingredientSectionsEn ? recipe.ingredientSectionsEn : recipe.ingredientSections;
  const displayInstructions = language === 'en' && recipe.instructionsEn ? recipe.instructionsEn : recipe.instructions;

  // Portion Scaling State
  const [currentServings, setCurrentServings] = useState<number>(recipe.servings || 4);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  // One step timer at a time. It counts down to a moment in time (not ticks), so it stays right when the tab sleeps.
  const [activeTimer, setActiveTimer] = useState<{ stepId: string; stepNumber: number; total: number; endsAt: number; pausedLeft?: number } | null>(null);
  const [now, setNow] = useState(Date.now());
  const timerLeft = !activeTimer ? 0 : activeTimer.pausedLeft !== undefined ? activeTimer.pausedLeft : Math.max(0, Math.ceil((activeTimer.endsAt - now) / 1000));
  const timerRunning = !!activeTimer && activeTimer.pausedLeft === undefined && timerLeft > 0;
  const timerDone = !!activeTimer && activeTimer.pausedLeft === undefined && timerLeft === 0;

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  useEffect(() => {
    if (!timerDone) return;
    // Time is up: a short beep and a buzz, and the bar turns into "done" until it is dismissed
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      [0, 0.35, 0.7].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        gain.gain.value = 0.15;
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.2);
      });
    } catch {
      // no audio available
    }
    navigator.vibrate?.([300, 150, 300, 150, 300]);
  }, [timerDone]);

  // A timer belongs to the recipe that is open
  useEffect(() => setActiveTimer(null), [recipe.id]);

  const scaleRatio = currentServings / (recipe.servings || 1);
  const allItems: IngredientItem[] = (displaySections || []).flatMap((sec) => sec.items);


  const toggleStepCheck = (id: string) => {
    setCheckedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartTimer = (stepId: string, stepNumber: number, minutes: number) => {
    setNow(Date.now());
    setActiveTimer({ stepId, stepNumber, total: minutes * 60, endsAt: Date.now() + minutes * 60000 });
  };

  const pauseOrResumeTimer = () =>
    setActiveTimer((t) => {
      if (!t) return t;
      if (t.pausedLeft === undefined) return { ...t, pausedLeft: Math.max(0, Math.ceil((t.endsAt - Date.now()) / 1000)) };
      return { ...t, endsAt: Date.now() + t.pausedLeft * 1000, pausedLeft: undefined };
    });

  const restartTimer = () => {
    setNow(Date.now());
    setActiveTimer((t) => (t ? { ...t, endsAt: Date.now() + t.total * 1000, pausedLeft: undefined } : t));
  };

  const formatClock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

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
          <span>Back<span className="nav-wide"> to Recipes</span></span>
        </button>

        <div className="detail-nav-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportRecipePdf(recipe, language, currentServings, unitSystem)}
            title="Opens the print dialog: choose Save as PDF"
          >
            <FileDown size={16} />
            <span>PDF</span>
          </button>
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
          {recipe.translationPending && (
            <p className="hero-description" style={{ fontSize: '0.85rem', opacity: 0.7 }}>
              {language === 'nl' ? 'Vertaling volgt… (staat in de wachtrij)' : 'Translation pending… (in the queue)'}
            </p>
          )}

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
          </div>

          <div className="hero-cta-bar">
            <button className="btn btn-primary btn-cook-mode" onClick={() => onStartCookMode(localizeRecipe(recipe, language), currentServings)}>
              <Play size={20} fill="#ffffff" />
              <span>Start Cook Mode</span>
            </button>

            {recipe.sourceImage && (
              <a href={recipe.sourceImage} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                <ImageIcon size={16} />
                <span>Source photo</span>
              </a>
            )}

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
                    const scaledAmt = item.amount * scaleRatio;
                    const converted = convertUnit(scaledAmt, item.unit, unitSystem, item.name);
                    const formattedAmt = formatAmount(converted.amount);

                    return (
                      <li key={item.id} className="ingredient-item">
                        <div className="item-details">
                          <span className="item-amount">{formattedAmt} {formatUnit(converted.unit, converted.amount, language)}</span>
                          <span className="item-name">{displayName(item, converted.amount, converted.unit)}</span>
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
                    <StepText
                      step={step}
                      items={allItems}
                      scaleRatio={scaleRatio}
                      unitSystem={unitSystem}
                      language={language}
                    />

                    {step.timerMinutes && (
                      <div className="step-timer-row">
                        <button
                          className="btn btn-outline btn-sm timer-btn"
                          onClick={() => handleStartTimer(step.id, step.stepNumber, step.timerMinutes!)}
                        >
                          <Timer size={15} />
                          <span>{activeTimer?.stepId === step.id ? `Restart ${step.timerMinutes} min timer` : `Start ${step.timerMinutes} min timer`}</span>
                        </button>
                        {activeTimer?.stepId === step.id && (
                          <span className={`step-timer-clock ${timerDone ? 'done' : ''}`}>{timerDone ? 'Time is up!' : formatClock(timerLeft)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {recipeMeals.length > 0 && (
        <div className="recipe-meals card">
          <h3>{language === 'nl' ? 'Maaltijden met dit recept' : 'Meals with this recipe'}</h3>
          {recipeMeals.map((m) => {
            const names = (m.attendeeIds || []).map((id) => people.find((p) => p.id === id)?.name).filter(Boolean) as string[];
            return (
              <button type="button" key={m.id} className="recipe-meal" onClick={onOpenMeals} title="Open Meals">
                <span className="recipe-meal-name">{m.name}{m.archived ? ' (archived)' : ''}</span>
                {formatMealDate(m) && <span className="recipe-meal-date">{formatMealDate(m)}</span>}
                <span className="recipe-meal-people">{names.length > 0 ? names.join(', ') : language === 'nl' ? 'Geen gasten ingevuld' : 'No attendees listed'}</span>
              </button>
            );
          })}
        </div>
      )}

      {activeTimer && (
        <div className={`timer-bar ${timerDone ? 'done' : ''}`} role="timer" aria-live={timerDone ? 'assertive' : 'off'}>
          <Timer size={18} />
          <span className="timer-bar-label">Step {activeTimer.stepNumber}</span>
          <span className="timer-bar-clock">{timerDone ? 'Time is up!' : formatClock(timerLeft)}</span>
          {!timerDone && (
            <button type="button" className="timer-bar-btn" onClick={pauseOrResumeTimer} aria-label={activeTimer.pausedLeft !== undefined ? 'Resume' : 'Pause'}>
              {activeTimer.pausedLeft !== undefined ? <Play size={16} /> : <Pause size={16} />}
            </button>
          )}
          <button type="button" className="timer-bar-btn" onClick={restartTimer} aria-label="Restart"><RotateCcw size={16} /></button>
          <button type="button" className="timer-bar-btn" onClick={() => setActiveTimer(null)} aria-label="Stop timer"><X size={16} /></button>
        </div>
      )}

      <style>{`
        .recipe-meals { padding: 1.25rem 1.5rem; margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .recipe-meals h3 { margin: 0 0 0.25rem; }
        .recipe-meal { display: flex; flex-wrap: wrap; gap: 0.1rem 0.75rem; align-items: baseline; text-align: left; width: 100%; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.55rem 0.8rem; color: var(--text-main); cursor: pointer; font: inherit; }
        .recipe-meal:hover { border-color: var(--accent-primary); }
        .recipe-meal-name { font-weight: 700; }
        .recipe-meal-date { color: var(--text-muted); font-size: 0.85rem; }
        .recipe-meal-people { flex-basis: 100%; color: var(--text-muted); font-size: 0.85rem; }
        .step-timer-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .step-timer-clock { font-family: var(--font-heading); font-weight: 700; font-size: 1.1rem; color: var(--accent-primary); font-variant-numeric: tabular-nums; }
        .step-timer-clock.done { color: #ef4444; }
        .timer-bar { position: fixed; left: 50%; transform: translateX(-50%); bottom: 5.5rem; z-index: 60; display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.9rem; background: var(--accent-primary); color: #fff; border-radius: var(--radius-full); box-shadow: 0 6px 24px rgba(0,0,0,0.25); max-width: calc(100vw - 2rem); }
        .timer-bar.done { background: #ef4444; animation: timer-pulse 0.8s ease-in-out infinite; }
        .timer-bar-label { font-size: 0.85rem; opacity: 0.9; }
        .timer-bar-clock { font-family: var(--font-heading); font-weight: 800; font-size: 1.15rem; font-variant-numeric: tabular-nums; }
        .timer-bar-btn { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; border: none; background: rgba(255,255,255,0.2); color: #fff; cursor: pointer; }
        @keyframes timer-pulse { 50% { transform: translateX(-50%) scale(1.05); } }
        .recipe-detail-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .detail-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        /* One row, equal height, labels never wrap */
        .detail-nav .btn {
          height: 38px;
          padding-top: 0;
          padding-bottom: 0;
          white-space: nowrap;
          flex-shrink: 0;
          justify-content: center;
        }
        @media (max-width: 600px) {
          .nav-wide { display: none; }
          .detail-nav, .detail-nav-actions { gap: 0.4rem; }
          .detail-nav .btn { padding-left: 0.6rem; padding-right: 0.6rem; }
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
        /* Stats and buttons form one 2x2 block: equal columns, equal heights */
        .hero-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          max-width: 460px;
          margin-bottom: 1rem;
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
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          max-width: 460px;
        }
        .hero-cta-bar .btn {
          width: 100%;
          justify-content: center;
          box-sizing: border-box;
          min-height: 52px;
          font-size: 1rem;
        }
        .hero-cta-bar .btn:only-child { grid-column: 1 / -1; }
        .scaler-input::-webkit-inner-spin-button,
        .scaler-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        @media (max-width: 600px) {
          .hero-content {
            padding: 1.25rem;
          }
          .hero-title {
            font-size: 1.6rem;
          }
          .ingredients-column, .instructions-column {
            padding: 1.1rem;
          }
          .stat-label {
            white-space: nowrap;
          }
          .stat-val {
            white-space: nowrap;
            font-size: 0.95rem;
          }
          /* Two by two: stats side by side, then Cook Mode and Source Link side by side */
          .hero-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }
          .stat-card {
            padding: 0.65rem 0.85rem;
            gap: 0.6rem;
            min-width: 0;
          }
          .hero-cta-bar {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }
          .hero-cta-bar .btn {
            width: 100%;
            justify-content: center;
            padding: 0.75rem 0.5rem;
            font-size: 0.95rem;
            text-align: center;
          }
          .hero-cta-bar .btn:only-child {
            grid-column: 1 / -1;
          }
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
          box-sizing: border-box;
          width: 36px;
          height: 36px;
          padding: 0;
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
          box-sizing: border-box;
          -moz-appearance: textfield;
          appearance: textfield;
          width: 52px;
          height: 36px;
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
        }
        .item-details {
          /* Plain inline text flow: amount, name and notes wrap like a sentence, not as separate boxes */
          display: block;
          font-size: 0.92rem;
          line-height: 1.5;
        }
        .item-details > span + span {
          margin-left: 0.4rem;
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
