import React, { useState } from 'react';
import { getStoredApiKey, saveStoredApiKey } from '../services/storageService';
import { Settings, Sun, Moon, Download, Upload, Key, RefreshCcw, Check, Sparkles } from 'lucide-react';
import { Recipe } from '../types/recipe';

interface SettingsModalProps {
  recipes: Recipe[];
  onImportBackup: (recipes: Recipe[]) => void;
  onResetSeed: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  recipes,
  onImportBackup,
  onResetSeed,
  theme,
  toggleTheme,
}) => {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredApiKey(apiKey.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recipes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gourmet_craft_recipes_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedRecipes = JSON.parse(event.target?.result as string);
          if (Array.isArray(importedRecipes)) {
            onImportBackup(importedRecipes);
            alert(`Successfully restored ${importedRecipes.length} recipes!`);
          } else {
            alert('Invalid backup JSON format.');
          }
        } catch (err) {
          alert('Error parsing backup JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header card">
        <div className="header-icon-title">
          <div className="icon-box">
            <Settings size={24} color="#ffffff" />
          </div>
          <div>
            <h2>App Settings & Backup</h2>
            <p className="sub-text">Customize your preferences and backup your recipe library.</p>
          </div>
        </div>
      </div>

      <div className="settings-grid">
        {/* Appearance Section */}
        <div className="settings-card card">
          <div className="card-sec-header">
            {theme === 'dark' ? <Moon size={20} color="var(--accent-primary)" /> : <Sun size={20} color="var(--accent-primary)" />}
            <h3>Appearance</h3>
          </div>

          <div className="setting-row">
            <div>
              <span className="setting-name">Theme Mode</span>
              <p className="setting-desc">Switch between dark mode and warm gourmet light mode.</p>
            </div>
            <button className="btn btn-secondary" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>

        {/* Data Backup & Restore */}
        <div className="settings-card card">
          <div className="card-sec-header">
            <Download size={20} color="var(--accent-primary)" />
            <h3>Backup & Export</h3>
          </div>

          <div className="setting-row">
            <div>
              <span className="setting-name">Export Recipe Library (JSON)</span>
              <p className="setting-desc">Save a backup file of all your {recipes.length} recipes.</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleExportBackup}>
              <Download size={16} />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="setting-row">
            <div>
              <span className="setting-name">Restore Backup</span>
              <p className="setting-desc">Import recipes from a Cookmate or GourmetCraft JSON file.</p>
            </div>
            <label className="btn btn-secondary btn-sm file-label">
              <Upload size={16} />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden-file-input" />
            </label>
          </div>

          <div className="setting-row">
            <div>
              <span className="setting-name">Reset Sample Recipes</span>
              <p className="setting-desc">Restore original sample recipes with multi-part ingredients.</p>
            </div>
            <button className="btn btn-outline btn-sm danger" onClick={() => { if (confirm('Reset to sample recipes?')) onResetSeed(); }}>
              <RefreshCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Gemini AI API Key (Optional) */}
        <div className="settings-card card">
          <div className="card-sec-header">
            <Sparkles size={20} color="var(--accent-primary)" />
            <h3>Advanced Gemini AI Integration (Optional)</h3>
          </div>

          <form onSubmit={handleSaveApiKey} className="api-key-form">
            <p className="setting-desc">
              Provide your optional Gemini API key to unlock zero-shot vision OCR and intelligent web URL recipe parsing.
            </p>

            <div className="input-group">
              <label className="input-label">Gemini API Key</label>
              <div className="input-with-icon">
                <Key size={18} className="key-icon" />
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="input-field key-input"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-secondary btn-sm">
              {savedSuccess ? <Check size={16} color="#10b981" /> : null}
              <span>{savedSuccess ? 'API Key Saved!' : 'Save Key'}</span>
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .settings-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .settings-header {
          padding: 1.5rem;
        }
        .header-icon-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .icon-box {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sub-text {
          color: var(--text-muted);
          font-size: 0.88rem;
        }
        .settings-grid {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .settings-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .card-sec-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }
        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .setting-name {
          font-weight: 700;
          color: var(--text-main);
        }
        .setting-desc {
          font-size: 0.84rem;
          color: var(--text-muted);
        }
        .file-label {
          position: relative;
          cursor: pointer;
        }
        .hidden-file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .api-key-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .input-with-icon {
          position: relative;
        }
        .key-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }
        .key-input {
          padding-left: 2.75rem;
        }
      `}</style>
    </div>
  );
};
