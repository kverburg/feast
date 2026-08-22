import React, { useState } from 'react';
import { Recipe, IngredientSection, InstructionStep } from '../types/recipe';
import { Plus, Trash2, Layers, Clock, Users, X, Save, Sparkles, Image as ImageIcon } from 'lucide-react';

interface RecipeFormProps {
  initialRecipe?: Partial<Recipe>;
  onSave: (recipe: Recipe) => void;
  onClose: () => void;
}

const CATEGORIES = ['Main', 'Appetizer', 'Dessert', 'Baking', 'Breakfast', 'Beverage', 'Side', 'Sauce'];

export const RecipeForm: React.FC<RecipeFormProps> = ({
  initialRecipe,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [category, setCategory] = useState<any>(initialRecipe?.category || 'Main');
  const [prepTime, setPrepTime] = useState(initialRecipe?.prepTime || 15);
  const [cookTime, setCookTime] = useState(initialRecipe?.cookTime || 20);
  const [servings, setServings] = useState(initialRecipe?.servings || 4);
  const [image, setImage] = useState(initialRecipe?.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1000&q=80');
  const [tagsInput, setTagsInput] = useState(initialRecipe?.tags ? initialRecipe.tags.join(', ') : '');

  // Sections (Parts) State
  const [sections, setSections] = useState<IngredientSection[]>(
    initialRecipe?.ingredientSections && initialRecipe.ingredientSections.length > 0
      ? initialRecipe.ingredientSections
      : [
          {
            id: 'sec-init-1',
            title: 'Main Ingredients',
            items: [
              { id: 'ing-init-1', amount: 400, unit: 'g', name: 'Main Ingredient Name', notes: '' }
            ]
          }
        ]
  );

  // Instructions State
  const [instructions, setInstructions] = useState<InstructionStep[]>(
    initialRecipe?.instructions && initialRecipe.instructions.length > 0
      ? initialRecipe.instructions
      : [
          { id: 'st-init-1', stepNumber: 1, text: 'First step instructions here.', timerMinutes: 5 }
        ]
  );

  // Section handlers
  const handleAddSection = () => {
    setSections(prev => [
      ...prev,
      {
        id: `sec-${Date.now()}`,
        title: `Section ${prev.length + 1} (e.g. For the Sauce)`,
        items: [
          { id: `ing-${Date.now()}`, amount: 1, unit: 'tbsp', name: '', notes: '' }
        ]
      }
    ]);
  };

  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, title } : s));
  };

  const handleRemoveSection = (sectionId: string) => {
    if (sections.length <= 1) return;
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };

  const handleAddIngredient = (sectionId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          items: [
            ...s.items,
            { id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, amount: 1, unit: '', name: '', notes: '' }
          ]
        };
      }
      return s;
    }));
  };

  const handleUpdateIngredient = (sectionId: string, itemId: string, field: string, value: any) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          items: s.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
        };
      }
      return s;
    }));
  };

  const handleRemoveIngredient = (sectionId: string, itemId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          items: s.items.filter(item => item.id !== itemId)
        };
      }
      return s;
    }));
  };

  // Instruction handlers
  const handleAddStep = () => {
    setInstructions(prev => [
      ...prev,
      {
        id: `st-${Date.now()}`,
        stepNumber: prev.length + 1,
        text: '',
        timerMinutes: undefined
      }
    ]);
  };

  const handleUpdateStep = (stepId: string, field: string, value: any) => {
    setInstructions(prev => prev.map(st => st.id === stepId ? { ...st, [field]: value } : st));
  };

  const handleRemoveStep = (stepId: string) => {
    setInstructions(prev => {
      const filtered = prev.filter(st => st.id !== stepId);
      return filtered.map((st, idx) => ({ ...st, stepNumber: idx + 1 }));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const recipe: Recipe = {
      id: initialRecipe?.id || `recipe-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      prepTime: Number(prepTime) || 0,
      cookTime: Number(cookTime) || 0,
      servings: Number(servings) || 4,
      image,
      ingredientSections: sections,
      instructions,
      tags,
      isFavorite: initialRecipe?.isFavorite || false,
      createdAt: initialRecipe?.createdAt || new Date().toISOString()
    };

    onSave(recipe);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content recipe-form-modal">
        <div className="modal-header">
          <h2>{initialRecipe?.id ? 'Edit Recipe' : 'Create New Recipe'}</h2>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body form-body">
          {/* General Information */}
          <div className="form-section">
            <h3>General Details</h3>
            
            <div className="input-group">
              <label className="input-label">Recipe Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Creamy Truffle & Wild Mushroom Tagliatelle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-row grid-2">
              <div className="input-group">
                <label className="input-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="select-field"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Base Servings / Portions *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-row grid-2">
              <div className="input-group">
                <label className="input-label">Prep Time (mins)</label>
                <input
                  type="number"
                  min="0"
                  value={prepTime}
                  onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Cook Time (mins)</label>
                <input
                  type="number"
                  min="0"
                  value={cookTime}
                  onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Image URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea
                placeholder="Short mouth-watering description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea-field"
              />
            </div>
          </div>

          {/* Ingredient Sections (Parts) */}
          <div className="form-section">
            <div className="section-header-row">
              <h3><Layers size={18} color="var(--accent-primary)" /> Ingredients Split by Part/Section</h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddSection}>
                <Plus size={16} />
                <span>Add Part / Section</span>
              </button>
            </div>

            {sections.map((sec, secIdx) => (
              <div key={sec.id} className="section-editor-card">
                <div className="section-title-row">
                  <input
                    type="text"
                    placeholder={`Section Name (e.g. For the Sauce)`}
                    value={sec.title}
                    onChange={(e) => handleUpdateSectionTitle(sec.id, e.target.value)}
                    className="input-field section-title-input"
                  />
                  {sections.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline btn-icon danger"
                      onClick={() => handleRemoveSection(sec.id)}
                      title="Remove Section"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="items-list-editor">
                  {sec.items.map((item) => (
                    <div key={item.id} className="item-row">
                      <input
                        type="number"
                        step="any"
                        placeholder="Qty"
                        value={item.amount || ''}
                        onChange={(e) => handleUpdateIngredient(sec.id, item.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="input-field item-qty"
                      />
                      <input
                        type="text"
                        placeholder="Unit (g, ml, tbsp)"
                        value={item.unit}
                        onChange={(e) => handleUpdateIngredient(sec.id, item.id, 'unit', e.target.value)}
                        className="input-field item-unit"
                      />
                      <input
                        type="text"
                        placeholder="Ingredient Name"
                        value={item.name}
                        onChange={(e) => handleUpdateIngredient(sec.id, item.id, 'name', e.target.value)}
                        className="input-field item-name"
                      />
                      <input
                        type="text"
                        placeholder="Notes (diced, cold)"
                        value={item.notes || ''}
                        onChange={(e) => handleUpdateIngredient(sec.id, item.id, 'notes', e.target.value)}
                        className="input-field item-notes"
                      />
                      <button
                        type="button"
                        className="btn btn-outline btn-icon danger"
                        onClick={() => handleRemoveIngredient(sec.id, item.id)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-outline btn-sm add-item-btn"
                    onClick={() => handleAddIngredient(sec.id)}
                  >
                    <Plus size={14} />
                    <span>Add Ingredient to {sec.title || 'Section'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Instruction Steps */}
          <div className="form-section">
            <div className="section-header-row">
              <h3>Method / Instruction Steps</h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddStep}>
                <Plus size={16} />
                <span>Add Step</span>
              </button>
            </div>

            <div className="steps-editor-list">
              {instructions.map((st, stIdx) => (
                <div key={st.id} className="step-editor-row">
                  <span className="step-badge">{st.stepNumber}</span>
                  <textarea
                    placeholder={`Describe Step ${st.stepNumber}...`}
                    value={st.text}
                    onChange={(e) => handleUpdateStep(st.id, 'text', e.target.value)}
                    className="textarea-field step-text-input"
                  />
                  <div className="step-timer-input">
                    <Clock size={14} />
                    <input
                      type="number"
                      placeholder="Timer (m)"
                      value={st.timerMinutes || ''}
                      onChange={(e) => handleUpdateStep(st.id, 'timerMinutes', parseInt(e.target.value) || undefined)}
                      className="input-field"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-icon danger"
                    onClick={() => handleRemoveStep(st.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              <span>Save Recipe</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .recipe-form-modal {
          max-width: 820px;
        }
        .form-body {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-color);
        }
        .form-section h3 {
          font-size: 1.1rem;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .section-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .section-editor-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .section-title-row {
          display: flex;
          gap: 0.5rem;
        }
        .section-title-input {
          font-weight: 700;
          color: var(--accent-primary);
        }
        .items-list-editor {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .item-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .item-qty { width: 75px; }
        .item-unit { width: 110px; }
        .item-name { flex: 2; }
        .item-notes { flex: 1; }
        .add-item-btn {
          align-self: flex-start;
          margin-top: 0.25rem;
        }
        .steps-editor-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .step-editor-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .step-badge {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          background: var(--accent-primary);
          color: #ffffff;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 4px;
        }
        .step-text-input {
          flex: 1;
          min-height: 60px;
        }
        .step-timer-input {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          width: 110px;
        }
      `}</style>
    </div>
  );
};
