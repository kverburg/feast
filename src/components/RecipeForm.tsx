import React, { useRef, useState } from 'react';
import { Recipe, IngredientSection, InstructionStep } from '../types/recipe';
import { uploadRecipeImage } from '../services/imageService';
import { reparseFromSource } from '../services/reparseService';
import { withPendingTranslation } from '../services/translationService';
import { Plus, Trash2, Layers, Clock, Users, X, Save, Sparkles, Image as ImageIcon, Wand2, GripVertical } from 'lucide-react';
import {
  DndContext, DragEndEvent, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useDroppable, useSensor, useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// One draggable ingredient row; the grip is the only drag handle so inputs stay usable on touch
const SortableItem: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      className="item-row"
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1, zIndex: isDragging ? 5 : undefined, position: 'relative' }}
    >
      <button type="button" className="item-handle" aria-label="Drag to reorder" title="Drag to reorder" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </button>
      {children}
    </div>
  );
};

// Lets an ingredient be dropped on a section even when it has no rows left
const SectionDropZone: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { setNodeRef } = useDroppable({ id: `sec:${id}` });
  return <div ref={setNodeRef} className="items-list-editor">{children}</div>;
};

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
  // "Re-parse from source with AI"
  const [reparseBusy, setReparseBusy] = useState(false);
  const [reparseError, setReparseError] = useState('');
  const [reparseNote, setReparseNote] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [pastedSource, setPastedSource] = useState('');
  const reparsedRef = useRef(false); // content was replaced by the AI: the translation must be redone
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState('');
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

  const [sectionToRemove, setSectionToRemove] = useState<string | null>(null);

  const handleRemoveSection = (sectionId: string) => {
    if (sections.length <= 1) return;
    const sec = sections.find(s => s.id === sectionId);
    if (sec && sec.items.some(i => i.name.trim() || i.amount)) setSectionToRemove(sectionId);
    else setSections(prev => prev.filter(s => s.id !== sectionId));
  };

  // keepIngredients moves the rows to the general (first remaining) section
  const confirmRemoveSection = (keepIngredients: boolean) => {
    const id = sectionToRemove;
    setSectionToRemove(null);
    if (!id) return;
    setSections(prev => {
      const removed = prev.find(s => s.id === id);
      const rest = prev.filter(s => s.id !== id);
      if (!keepIngredients || !removed || rest.length === 0) return rest;
      return rest.map((s, i) => (i === 0 ? { ...s, items: [...s.items, ...removed.items] } : s));
    });
  };

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    setSections(prev => {
      const from = prev.findIndex(s => s.items.some(i => i.id === activeId));
      const to = overId.startsWith('sec:')
        ? prev.findIndex(s => `sec:${s.id}` === overId)
        : prev.findIndex(s => s.items.some(i => i.id === overId));
      if (from < 0 || to < 0) return prev;
      const item = prev[from].items.find(i => i.id === activeId)!;
      const fromItems = prev[from].items.filter(i => i.id !== activeId);
      const base = from === to ? fromItems : prev[to].items;
      let index = base.findIndex(i => i.id === overId);
      if (index < 0) index = base.length;
      else if (from !== to) {
        // dropping onto a row from another section: land after it if it was below the pointer
        const overTop = over.rect.top + over.rect.height / 2;
        const activeTop = (active.rect.current.translated?.top ?? 0) + (active.rect.current.translated?.height ?? 0) / 2;
        if (activeTop > overTop) index += 1;
      }
      const nextItems = [...base.slice(0, index), item, ...base.slice(index)];
      return prev.map((sec, i) => {
        if (from === to && i === from) {
          // same section: classic reorder
          const oldIdx = sec.items.findIndex(x => x.id === activeId);
          const newIdx = sec.items.findIndex(x => x.id === overId);
          const arr = [...sec.items];
          arr.splice(oldIdx, 1);
          arr.splice(newIdx, 0, item);
          return { ...sec, items: arr };
        }
        if (i === from) return { ...sec, items: fromItems };
        if (i === to) return { ...sec, items: nextItems };
        return sec;
      });
    });
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

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow choosing the same file again
    if (!file) return;
    setImageBusy(true);
    setImageError('');
    try {
      setImage(await uploadRecipeImage(file));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setImageBusy(false);
    }
  };

  const runReparse = async (source: { url: string } | { text: string }) => {
    setReparseBusy(true);
    setReparseError('');
    setReparseNote('');
    try {
      const parsed = await reparseFromSource(source, initialRecipe?.id);
      const ok = window.confirm(
        'Replace the title, description, times, ingredients and steps with the AI-parsed version?\n\nNothing is saved until you press Save, and closing this form discards it.'
      );
      if (!ok) return;
      if (parsed.title) setTitle(parsed.title);
      setDescription(parsed.description || '');
      if (parsed.category) setCategory(parsed.category);
      if (parsed.prepTime !== undefined) setPrepTime(parsed.prepTime);
      if (parsed.cookTime !== undefined) setCookTime(parsed.cookTime);
      if (parsed.servings) setServings(parsed.servings);
      if (parsed.ingredientSections?.length) setSections(parsed.ingredientSections);
      if (parsed.instructions?.length) setInstructions(parsed.instructions);
      reparsedRef.current = true;
      setShowPaste(false);
      setPastedSource('');
      setReparseNote('Parsed with AI. Check the result below, then press Save. The translation will be redone after saving.');
    } catch (err) {
      setReparseError(err instanceof Error ? err.message : 'Re-parse failed.');
      if (err instanceof Error && /blocks automated access|Could not fetch/.test(err.message)) setShowPaste(true);
    } finally {
      setReparseBusy(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    let recipe: Recipe = {
      ...initialRecipe, // keeps the English version, translation state and source link
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

    // Ingredient or step content changed: the plural forms and step quantities must be redone
    const contentOf = (r: { ingredientSections?: IngredientSection[]; instructions?: InstructionStep[] }) =>
      JSON.stringify([
        (r.ingredientSections || []).map((sec) => sec.items.map((i) => [i.id, i.amount, i.unit, i.name])),
        (r.instructions || []).map((st) => st.text),
      ]);
    if (initialRecipe && contentOf(initialRecipe) !== contentOf(recipe)) {
      recipe = { ...recipe, annotationVersion: undefined };
    }

    if (reparsedRef.current) {
      // New content from the AI: drop the old second language and queue a fresh translation.
      recipe = withPendingTranslation({
        ...recipe,
        titleEn: undefined,
        descriptionEn: undefined,
        ingredientSectionsEn: undefined,
        instructionsEn: undefined,
        translationVersion: undefined,
        annotationVersion: undefined,
      }, true); // you just re-parsed it: translate it now, not in the background batch
    }

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

            <div className="reparse-box">
              <div className="reparse-actions">
                {initialRecipe?.sourceUrl && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={reparseBusy}
                    onClick={() => runReparse({ url: initialRecipe.sourceUrl! })}
                  >
                    <Wand2 size={14} />
                    <span>{reparseBusy ? 'Re-parsing…' : 'Re-parse from source with AI'}</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={reparseBusy}
                  onClick={() => setShowPaste((v) => !v)}
                >
                  <span>{initialRecipe?.sourceUrl ? 'Paste source text instead' : 'Parse pasted text with AI'}</span>
                </button>
              </div>
              {showPaste && (
                <div className="reparse-paste">
                  <textarea
                    className="textarea-field"
                    placeholder="Paste the recipe page text (or HTML) here..."
                    value={pastedSource}
                    onChange={(e) => setPastedSource(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={reparseBusy || !pastedSource.trim()}
                    onClick={() => runReparse({ text: pastedSource })}
                  >
                    <Wand2 size={14} />
                    <span>{reparseBusy ? 'Parsing…' : 'Parse with AI'}</span>
                  </button>
                </div>
              )}
              {reparseError && <p className="image-edit-error">{reparseError}</p>}
              {reparseNote && <p className="reparse-note">{reparseNote}</p>}
            </div>
            
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
              <label className="input-label">Image</label>
              {image && (
                <img
                  src={image}
                  alt="Recipe"
                  className="image-edit-preview"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
                  onLoad={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'visible')}
                />
              )}
              <div className="image-edit-row">
                <input
                  type="text"
                  placeholder={image.startsWith('data:') ? 'Uploaded image in use. Paste a URL to replace it.' : 'Paste an image URL (https://...)'}
                  value={image.startsWith('data:') ? '' : image}
                  onChange={(e) => setImage(e.target.value)}
                  className="input-field"
                />
                <label className={`btn btn-outline btn-sm image-upload-btn ${imageBusy ? 'disabled' : ''}`}>
                  <ImageIcon size={16} />
                  <span>{imageBusy ? 'Uploading...' : 'Upload image'}</span>
                  <input type="file" accept="image/*" onChange={handleImageFile} disabled={imageBusy} hidden />
                </label>
              </div>
              {imageError && <p className="image-edit-error">{imageError}</p>}
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

            <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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

                <SectionDropZone id={sec.id}>
                  <SortableContext items={sec.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                  {sec.items.map((item) => (
                    <SortableItem key={item.id} id={item.id}>
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
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
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
                    </SortableItem>
                  ))}
                  </SortableContext>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm add-item-btn"
                    onClick={() => handleAddIngredient(sec.id)}
                  >
                    <Plus size={14} />
                    <span>Add Ingredient to {sec.title || 'Section'}</span>
                  </button>
                </SectionDropZone>
              </div>
            ))}
            </DndContext>
            {sectionToRemove && (
              <div className="confirm-backdrop" onClick={() => setSectionToRemove(null)}>
                <div className="confirm-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                  <h4>Remove "{sections.find(s => s.id === sectionToRemove)?.title || 'this section'}"?</h4>
                  <p>What should happen to the ingredients in it?</p>
                  <button type="button" className="btn btn-secondary" onClick={() => confirmRemoveSection(true)}>Delete section, keep ingredients</button>
                  <button type="button" className="btn btn-outline danger" onClick={() => confirmRemoveSection(false)}>Delete everything</button>
                  <button type="button" className="btn btn-outline" onClick={() => setSectionToRemove(null)}>Cancel</button>
                </div>
              </div>
            )}
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
          align-items: end;
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
        .reparse-box { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; }
        .reparse-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .reparse-paste { display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start; }
        .reparse-paste .textarea-field { width: 100%; min-height: 120px; }
        .reparse-note { color: var(--accent-primary); font-size: 0.85rem; }
        .image-edit-preview {
          width: 100%;
          max-height: 220px;
          object-fit: cover;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          margin-bottom: 0.5rem;
        }
        .image-edit-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .image-edit-row .input-field {
          flex: 1;
          min-width: 0;
        }
        .image-upload-btn {
          cursor: pointer;
          white-space: nowrap;
        }
        .image-upload-btn.disabled {
          opacity: 0.6;
          pointer-events: none;
        }
        .image-edit-error {
          color: #ef4444;
          font-size: 0.85rem;
          margin-top: 0.4rem;
        }
        .item-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .item-handle { background: none; border: none; color: var(--text-muted); cursor: grab; padding: 0.25rem; touch-action: none; display: flex; align-items: center; }
        .item-handle:active { cursor: grabbing; }
        .confirm-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .confirm-dialog { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; max-width: 380px; width: 100%; display: flex; flex-direction: column; gap: 0.6rem; }
        .confirm-dialog h4 { margin: 0; }
        .confirm-dialog p { margin: 0 0 0.4rem; color: var(--text-muted); }
        .item-qty { width: 75px; }
        .item-unit { width: 110px; }
        .item-name { flex: 2; }
        .item-notes { flex: 1; }
        @media (max-width: 600px) {
          /* One ingredient per card: qty + unit + remove on top, name and notes full width below */
          .item-row {
            display: grid;
            grid-template-columns: 28px 90px 1fr 40px;
            grid-template-areas:
              'handle qty unit remove'
              'name name name name'
              'notes notes notes notes';
            gap: 0.5rem;
            padding: 0.75rem;
            background: var(--bg-input);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
          }
          .item-row .item-handle { grid-area: handle; }
          .item-row .item-qty { grid-area: qty; width: auto; min-width: 0; }
          .item-row .item-unit { grid-area: unit; width: auto; min-width: 0; }
          .item-row .item-name { grid-area: name; }
          .item-row .item-notes { grid-area: notes; }
          .item-row > .btn { grid-area: remove; padding: 0.5rem; justify-self: end; }
          .add-item-btn { align-self: stretch; justify-content: center; text-align: center; }
        }
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
        @media (max-width: 600px) {
          /* One step per card: number + timer + remove on top, the text full width below (like ingredients) */
          .step-editor-row {
            display: grid;
            grid-template-columns: 32px 1fr 40px;
            grid-template-areas:
              'badge timer remove'
              'text text text';
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem;
            background: var(--bg-input);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
          }
          .step-editor-row .step-badge { grid-area: badge; margin-top: 0; }
          .step-editor-row .step-timer-input { grid-area: timer; width: auto; }
          .step-editor-row .step-timer-input .input-field { min-width: 0; }
          .step-editor-row > .btn { grid-area: remove; padding: 0.5rem; justify-self: end; }
          .step-editor-row .step-text-input { grid-area: text; min-height: 110px; font-size: 1rem; width: 100%; }
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
