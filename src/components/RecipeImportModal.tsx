import React, { useState } from 'react';
import { enqueueImport } from '../services/importQueue';
import { photoToScanDataUrl } from '../services/imageService';
import { showToast } from '../services/toast';
import { Globe, Camera, Upload, Sparkles, X, Clipboard, PenLine } from 'lucide-react';

interface RecipeImportModalProps {
  onManualAdd: () => void;
  onClose: () => void;
}

// The dialog only queues the import: it closes at once, the work happens in the background
// (see importQueue) and a notification tells you when the recipe is in.
export const RecipeImportModal: React.FC<RecipeImportModalProps> = ({ onManualAdd, onClose }) => {
  const [activeTab, setActiveTab] = useState<'url' | 'paste' | 'photo' | 'manual'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [pasteInput, setPasteInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const queued = (label: string) => {
    showToast({ kind: 'info', message: `Import started: ${label}. You can keep using the app; you'll get a notification when it's done.` });
    onClose();
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlInput.trim();
    if (!url) return;
    enqueueImport({ kind: 'url', url });
    queued(url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 60));
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteInput.trim()) return;
    enqueueImport({ kind: 'text', text: pasteInput });
    queued('pasted text');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    setSelectedFile(file);
    try {
      setImagePreview(await photoToScanDataUrl(file));
    } catch (err) {
      setSelectedFile(null);
      setErrorMsg(err instanceof Error ? err.message : 'Could not read that photo.');
    }
  };

  const handlePhotoSubmit = async () => {
    if (!selectedFile || !imagePreview) return;
    setBusy(true);
    enqueueImport({ kind: 'photo', dataUrl: imagePreview, fileName: selectedFile.name });
    setBusy(false);
    queued(selectedFile.name);
  };

  const switchTab = (tab: 'url' | 'paste' | 'photo' | 'manual') => {
    setActiveTab(tab);
    setErrorMsg('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content import-modal">
        <div className="modal-header">
          <div className="import-modal-title">
            <Sparkles size={22} color="var(--accent-primary)" />
            <h2>Import / Add Recipe</h2>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tab Selection */}
          <div className="import-tabs">
            <button className={`import-tab ${activeTab === 'url' ? 'active' : ''}`} onClick={() => switchTab('url')}>
              <Globe size={18} />
              <span>Web URL</span>
            </button>

            <button className={`import-tab ${activeTab === 'paste' ? 'active' : ''}`} onClick={() => switchTab('paste')}>
              <Clipboard size={18} />
              <span>Paste HTML / Text</span>
            </button>

            <button className={`import-tab ${activeTab === 'photo' ? 'active' : ''}`} onClick={() => switchTab('photo')}>
              <Camera size={18} />
              <span>Photo / OCR</span>
            </button>

            <button className={`import-tab ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => switchTab('manual')}>
              <PenLine size={18} />
              <span>Add manually</span>
            </button>
          </div>

          {/* Manual Tab Content */}
          {activeTab === 'manual' && (
            <div className="tab-content">
              <p className="tab-hint">Type in a recipe yourself: title, ingredients and steps.</p>
              <button className="btn btn-primary" onClick={onManualAdd}>
                <PenLine size={18} />
                <span>Start a blank recipe</span>
              </button>
            </div>
          )}

          {/* URL Tab Content */}
          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="tab-content">
              <p className="tab-hint">
                Paste a recipe link from websites like Sally's Baking Addiction, Cookmate, BBC Good Food, AllRecipes, or any blog.
                The recipe is imported in the background and saved when it is ready.
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

              <button type="submit" className="btn btn-primary w-full">
                <Sparkles size={18} />
                <span>Import Recipe</span>
              </button>
            </form>
          )}

          {/* Paste HTML / Text Tab Content */}
          {activeTab === 'paste' && (
            <form onSubmit={handlePasteSubmit} className="tab-content">
              <p className="tab-hint">
                Paste copied webpage HTML or recipe text directly. This also works for sites that block automated access.
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

              <button type="submit" className="btn btn-primary w-full">
                <Sparkles size={18} />
                <span>Import Pasted Content</span>
              </button>
            </form>
          )}

          {/* Photo OCR Tab Content */}
          {activeTab === 'photo' && (
            <div className="tab-content">
              <p className="tab-hint">Upload a clear photo or screenshot of a cookbook page or recipe card.</p>

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
                    <input type="file" accept="image/*" onChange={handleFileChange} className="file-input-hidden" />
                  </label>
                )}
              </div>

              <button
                type="button"
                disabled={!selectedFile || !imagePreview || busy}
                onClick={handlePhotoSubmit}
                className="btn btn-primary w-full"
              >
                <Camera size={18} />
                <span>Import Photo</span>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="error-box card">
              <p>{errorMsg}</p>
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
