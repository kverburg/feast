import React, { useState } from 'react';
import { getStoredApiKey, saveStoredApiKey } from '../services/storageService';
import { verifyGeminiKey } from '../services/geminiService';
import { Settings, Sun, Moon, Download, Upload, Key, RefreshCcw, Check, Sparkles, Mic, MicOff, FileCode } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { parseCookmateXml } from '../services/cookmateImportService';

interface SettingsModalProps {
  recipes: Recipe[];
  onImportBackup: (recipes: Recipe[]) => void;
  onResetSeed: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  voiceEnabled: boolean;
  onToggleVoice: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  recipes,
  onImportBackup,
  onResetSeed,
  theme,
  toggleTheme,
  voiceEnabled,
  onToggleVoice,
}) => {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleVerifyKey = async () => {
    setVerifying(true);
    setVerifyResult(null);
    setVerifyResult(await verifyGeminiKey(apiKey.trim()));
    setVerifying(false);
  };

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
    downloadAnchor.setAttribute("download", `feast_recipes_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        try {
          if (file.name.endsWith('.xml') || text.trim().startsWith('<?xml') || text.includes('<cookbook')) {
            const imported = await parseCookmateXml(text);
            if (imported.length > 0) {
              const combined = [...recipes, ...imported];
              onImportBackup(combined);
              alert(`Successfully imported ${imported.length} recipes from Cookmate XML!`);
              return;
            } else {
              alert('No valid recipes found in Cookmate XML file.');
              return;
            }
          }

          const importedRecipes = JSON.parse(text);
          if (Array.isArray(importedRecipes)) {
            onImportBackup(importedRecipes);
            alert(`Successfully restored ${importedRecipes.length} recipes!`);
          } else {
            alert('Invalid backup JSON format.');
          }
        } catch (err) {
          alert('Error parsing file: ' + (err as any)?.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImportCookmateXml = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          const imported = await parseCookmateXml(text);
          if (imported.length > 0) {
            const combined = [...recipes, ...imported];
            onImportBackup(combined);
            alert(`🎉 Successfully imported ${imported.length} recipes from Cookmate!`);
          } else {
            alert('No valid recipes found in the selected Cookmate XML file.');
          }
        } catch (err: any) {
          alert('Failed to parse Cookmate XML: ' + (err?.message || 'Unknown error'));
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
        {/* Appearance & Preferences */}
        <div className="settings-card card">
          <div className="card-sec-header">
            {theme === 'dark' ? <Moon size={20} color="var(--accent-primary)" /> : <Sun size={20} color="var(--accent-primary)" />}
            <h3>Appearance & Preferences</h3>
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

          <div className="setting-row">
            <div>
              <span className="setting-name">Voice Assistant & Hands-Free Commands</span>
              <p className="setting-desc">Enable spoken step reading and voice controls in Cook Mode (disabled by default).</p>
            </div>
            <button
              className={`btn ${voiceEnabled ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onToggleVoice(!voiceEnabled)}
            >
              {voiceEnabled ? <Mic size={18} /> : <MicOff size={18} />}
              <span>{voiceEnabled ? 'Voice Enabled' : 'Voice Disabled'}</span>
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
              <span className="setting-name">Import Cookmate Export (.xml)</span>
              <p className="setting-desc">Import all recipes directly from your Cookmate XML file.</p>
            </div>
            <label className="btn btn-primary btn-sm file-label">
              <FileCode size={16} />
              <span>Import Cookmate XML</span>
              <input type="file" accept=".xml" onChange={handleImportCookmateXml} className="hidden-file-input" />
            </label>
          </div>

          <div className="setting-row">
            <div>
              <span className="setting-name">Restore Backup</span>
              <p className="setting-desc">Import recipes from a Cookmate or Feast JSON/XML backup.</p>
            </div>
            <label className="btn btn-secondary btn-sm file-label">
              <Upload size={16} />
              <span>Import JSON / XML</span>
              <input type="file" accept=".json,.xml" onChange={handleImportBackup} className="hidden-file-input" />
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
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setVerifyResult(null);
                  }}
                  className="input-field key-input"
                />
              </div>
            </div>

            <p className="setting-desc">The key is shared across your devices.</p>

            <div className="key-actions">
              <button type="submit" className="btn btn-secondary btn-sm">
                {savedSuccess ? <Check size={16} color="#10b981" /> : null}
                <span>{savedSuccess ? 'API Key Saved!' : 'Save Key'}</span>
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleVerifyKey} disabled={verifying || !apiKey.trim()}>
                <span>{verifying ? 'Checking...' : 'Verify key'}</span>
              </button>
              {verifyResult && (
                <span className={`verify-result ${verifyResult.ok ? 'ok' : 'fail'}`}>
                  {verifyResult.ok ? '✓' : '✗'} {verifyResult.message}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .key-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .verify-result { font-size: 0.85rem; }
        .verify-result.ok { color: #10b981; }
        .verify-result.fail { color: #ef4444; }
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
