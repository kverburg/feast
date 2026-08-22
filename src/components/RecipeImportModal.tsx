import React, { useState } from 'react';
import { Recipe } from '../types/recipe';
import { parseUrlToRecipe, parsePhotoToRecipe, parseHtmlContentToRecipe, parseRawTextToRecipe } from '../services/recipeParserService';
import { parseRecipeWithGemini } from '../services/geminiService';
import { getStoredApiKey } from '../services/storageService';
import { Globe, Camera, Upload, Sparkles, X, Check, Loader2, FileText, Layers, Clipboard } from 'lucide-react';

interface RecipeImportModalProps {
  onImportComplete: (recipe: Recipe) => void;
  onClose: () => void;
}

export const RecipeImportModal: React.FC<RecipeImportModalProps> = ({
  onImportComplete,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'paste' | 'photo'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [pasteInput, setPasteInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const [parsedResult, setParsedResult] = useState<Partial<Recipe> | null>(null);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setProgressStatus('Fetching & Extracting JSON-LD Recipe Data...');

    try {
      const apiKey = getStoredApiKey();
      let recipeData: Partial<Recipe>;

      if (apiKey) {
        recipeData = await parseRecipeWithGemini(urlInput, apiKey, false);
      } else {
        recipeData = await parseUrlToRecipe(urlInput);
      }

      setParsedResult(recipeData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse URL.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteInput.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setProgressStatus('Parsing HTML & Text Content...');

    try {
      let recipeData = parseHtmlContentToRecipe(pasteInput, urlInput || 'Pasted Recipe');
      if (!recipeData || (recipeData.ingredientSections?.length === 0 && recipeData.instructions?.length === 0)) {
        recipeData = parseRawTextToRecipe(pasteInput);
      }
      setParsedResult(recipeData);
    } catch (err: any) {
      setErrorMsg('Failed to parse pasted text.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setErrorMsg('');
    setProgressPercent(10);
    setProgressStatus('Starting OCR Scanner...');

    try {
      const apiKey = getStoredApiKey();
      let recipeData: Partial<Recipe>;

      if (apiKey && imagePreview) {
        recipeData = await parseRecipeWithGemini(imagePreview, apiKey, true);
      } else {
        recipeData = await parsePhotoToRecipe(selectedFile, (pct, status) => {
          setProgressPercent(pct);
          setProgressStatus(status);
        });
      }

      if (imagePreview) {
        recipeData.image = imagePreview;
      }

      setParsedResult(recipeData);
    } catch (err: any) {
      setErrorMsg(err.message || 'OCR parsing failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveImported = () => {
    if (!parsedResult) return;

    const finalRecipe: Recipe = {
      id: `imported-${Date.now()}`,
      title: parsedResult.title || 'Imported Recipe',
      description: parsedResult.description || 'Imported using GourmetCraft Parser.',
      category: parsedResult.category || 'Main',
      prepTime: parsedResult.prepTime || 15,
      cookTime: parsedResult.cookTime || 20,
      servings: parsedResult.servings || 4,
      image: parsedResult.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80',
      sourceUrl: parsedResult.sourceUrl || (activeTab === 'url' ? urlInput : undefined),
      ingredientSections: parsedResult.ingredientSections || [],
      instructions: parsedResult.instructions || [],
      tags: parsedResult.tags || ['Imported'],
      isFavorite: false,
      createdAt: new Date().toISOString()
    };

    onImportComplete(finalRecipe);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content import-modal">
        <div className="modal-header">
          <div className="import-modal-title">
            <Sparkles size={22} color="var(--accent-primary)" />
            <h2>Import Recipe</h2>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tab Selection */}
          <div className="import-tabs">
            <button
              className={`import-tab ${activeTab === 'url' ? 'active' : ''}`}
              onClick={() => { setActiveTab('url'); setParsedResult(null); setErrorMsg(''); }}
            >
              <Globe size={18} />
              <span>Web URL</span>
            </button>

            <button
              className={`import-tab ${activeTab === 'paste' ? 'active' : ''}`}
              onClick={() => { setActiveTab('paste'); setParsedResult(null); setErrorMsg(''); }}
            >
              <Clipboard size={18} />
              <span>Paste HTML / Text</span>
            </button>

            <button
              className={`import-tab ${activeTab === 'photo' ? 'active' : ''}`}
              onClick={() => { setActiveTab('photo'); setParsedResult(null); setErrorMsg(''); }}
            >
              <Camera size={18} />
              <span>Photo / OCR</span>
            </button>
          </div>

          {/* URL Tab Content */}
          {activeTab === 'url' && !parsedResult && (
            <form onSubmit={handleUrlSubmit} className="tab-content">
              <p className="tab-hint">
                Paste a recipe link from websites like Sally's Baking Addiction, Cookmate, BBC Good Food, AllRecipes, or any blog.
              </p>

              <div className="input-group">
                <label className="input-label">Recipe Web URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://sallysbakingaddiction.com/homemade-pizza-crust-recipe/"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="sample-urls">
                <span className="sample-label">Try recipe link:</span>
                <button
                  type="button"
                  className="sample-btn"
                  onClick={() => setUrlInput('https://sallysbakingaddiction.com/homemade-pizza-crust-recipe/')}
                >
                  Sally's Homemade Pizza Dough
                </button>
              </div>

              {loading ? (
                <div className="loading-box card">
                  <Loader2 size={32} className="spin-icon" color="var(--accent-primary)" />
                  <p>{progressStatus}</p>
                </div>
              ) : (
                <button type="submit" className="btn btn-primary w-full">
                  <Sparkles size={18} />
                  <span>Parse Web Recipe</span>
                </button>
              )}
            </form>
          )}

          {/* Paste HTML / Text Tab Content */}
          {activeTab === 'paste' && !parsedResult && (
            <form onSubmit={handlePasteSubmit} className="tab-content">
              <p className="tab-hint">
                Paste copied webpage HTML or recipe text directly. Supports standard schema tags and recipe parts!
              </p>

              <div className="input-group">
                <label className="input-label">Recipe HTML or Text Content</label>
                <textarea
                  required
                  placeholder="Paste copied text or HTML from website here..."
                  value={pasteInput}
                  onChange={(e) => setPasteInput(e.target.value)}
                  className="textarea-field paste-area"
                />
              </div>

              {loading ? (
                <div className="loading-box card">
                  <Loader2 size={32} className="spin-icon" color="var(--accent-primary)" />
                  <p>{progressStatus}</p>
                </div>
              ) : (
                <button type="submit" className="btn btn-primary w-full">
                  <Sparkles size={18} />
                  <span>Parse Pasted Content</span>
                </button>
              )}
            </form>
          )}

          {/* Photo OCR Tab Content */}
          {activeTab === 'photo' && !parsedResult && (
            <div className="tab-content">
              <p className="tab-hint">
                Upload a clear photo or screenshot of a cookbook page or recipe card.
              </p>

              <div className="file-dropzone card">
                {imagePreview ? (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Recipe Preview" className="uploaded-preview" />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm change-img-btn"
                      onClick={() => { setSelectedFile(null); setImagePreview(null); }}
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <label className="dropzone-label">
                    <Upload size={40} color="var(--accent-primary)" />
                    <span className="dropzone-title">Click or Drop Photo Here</span>
                    <span className="dropzone-sub">Supports JPG, PNG, WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input-hidden"
                    />
                  </label>
                )}
              </div>

              {loading ? (
                <div className="loading-box card">
                  <Loader2 size={32} className="spin-icon" color="var(--accent-primary)" />
                  <p>{progressStatus}</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!selectedFile}
                  onClick={handlePhotoSubmit}
                  className="btn btn-primary w-full"
                >
                  <Camera size={18} />
                  <span>Scan & Parse Photo (OCR)</span>
                </button>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="error-box">
              <p>{errorMsg}</p>
              {activeTab === 'url' && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm switch-tab-btn"
                  onClick={() => {
                    setActiveTab('paste');
                    setErrorMsg('');
                  }}
                >
                  Switch to Paste HTML / Text Mode
                </button>
              )}
            </div>
          )}

          {/* Preview Parsed Result */}
          {parsedResult && (
            <div className="parsed-preview-box card">
              <div className="preview-header">
                <Check size={20} color="#10b981" />
                <h3>Recipe Parsed Successfully!</h3>
              </div>

              <div className="preview-body">
                <div className="preview-title-row">
                  <h4>{parsedResult.title}</h4>
                  <span className="badge">{parsedResult.servings} portions</span>
                </div>

                <p className="preview-desc">{parsedResult.description}</p>

                <div className="preview-sections">
                  <h5><Layers size={16} color="var(--accent-primary)" /> Detected Ingredient Parts ({parsedResult.ingredientSections?.length || 0}):</h5>
                  {parsedResult.ingredientSections?.map((sec) => (
                    <div key={sec.id} className="preview-sec-item">
                      <strong>{sec.title}:</strong>
                      <span> {sec.items.map(i => `${i.amount} ${i.unit} ${i.name}`).join(', ')}</span>
                    </div>
                  ))}
                </div>

                <div className="preview-steps">
                  <h5>Detected Steps ({parsedResult.instructions?.length || 0}):</h5>
                  <ol className="preview-steps-list">
                    {parsedResult.instructions?.slice(0, 4).map((st) => (
                      <li key={st.id}>{st.text.slice(0, 100)}...</li>
                    ))}
                    {(parsedResult.instructions?.length || 0) > 4 && (
                      <li className="more-steps">+ {(parsedResult.instructions?.length || 0) - 4} more steps</li>
                    )}
                  </ol>
                </div>
              </div>

              <div className="preview-actions">
                <button className="btn btn-secondary" onClick={() => setParsedResult(null)}>
                  Re-parse
                </button>
                <button className="btn btn-primary" onClick={handleSaveImported}>
                  <Check size={18} />
                  <span>Save to My Recipes</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .import-modal {
          max-width: 660px;
        }
        .import-modal-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .import-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          background: var(--bg-primary);
          padding: 0.35rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }
        .import-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.6rem 0.85rem;
          border: none;
          background: none;
          color: var(--text-muted);
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.88rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .import-tab.active {
          background: var(--bg-card);
          color: var(--accent-primary);
          box-shadow: var(--shadow-sm);
        }
        .tab-content {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .tab-hint {
          font-size: 0.88rem;
          color: var(--text-muted);
        }
        .paste-area {
          min-height: 160px;
        }
        .sample-urls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }
        .sample-label {
          color: var(--text-dim);
        }
        .sample-btn {
          background: var(--badge-bg);
          color: var(--accent-primary);
          border: 1px solid var(--border-color);
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          font-size: 0.8rem;
        }
        .file-dropzone {
          border: 2px dashed var(--border-color);
          padding: 2rem 1.5rem;
          text-align: center;
          cursor: pointer;
          position: relative;
        }
        .file-input-hidden {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .dropzone-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .dropzone-title {
          font-weight: 700;
          color: var(--text-main);
        }
        .dropzone-sub {
          font-size: 0.8rem;
          color: var(--text-dim);
        }
        .image-preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .uploaded-preview {
          max-height: 200px;
          border-radius: var(--radius-md);
          object-fit: cover;
        }
        .w-full {
          width: 100%;
        }
        .loading-box {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .progress-bar {
          width: 100%;
          height: 6px;
          background: var(--bg-input);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--accent-gradient);
          transition: width 0.3s ease;
        }
        .error-box {
          padding: 0.85rem 1rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .switch-tab-btn {
          align-self: flex-start;
        }
        .parsed-preview-box {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .preview-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
        }
        .preview-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .preview-sections {
          margin-top: 0.75rem;
          font-size: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .preview-sec-item {
          background: var(--bg-primary);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
        }
        .preview-steps {
          margin-top: 0.75rem;
          font-size: 0.85rem;
        }
        .preview-steps-list {
          padding-left: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-top: 0.35rem;
        }
        .more-steps {
          font-style: italic;
          color: var(--text-dim);
          list-style: none;
        }
        .preview-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
      `}</style>
    </div>
  );
};
