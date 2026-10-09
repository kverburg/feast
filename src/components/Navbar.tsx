import React from 'react';
import { UtensilsCrossed, PlusCircle, ShoppingBag, Settings, Sun, Moon, Search, Sparkles, CalendarDays } from 'lucide-react';

interface NavbarProps {
  currentTab: 'recipes' | 'meals' | 'shopping' | 'settings';
  setCurrentTab: (tab: 'recipes' | 'meals' | 'shopping' | 'settings') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  language: 'nl' | 'en';
  setLanguage: (language: 'nl' | 'en') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery,
  onOpenAddModal,
  onOpenImportModal,
  theme,
  toggleTheme,
  language,
  setLanguage,
}) => {
  return (
    <>
      {/* Desktop & Header Bar */}
      <header className="navbar-header">
        <div className="navbar-container">
          <div className="brand" onClick={() => setCurrentTab('recipes')}>
            <div className="brand-icon">
              <UtensilsCrossed size={24} color="#ffffff" />
            </div>
            <span className="brand-name">Feast</span>
            {(import.meta as any).env?.VITE_APP_ENV === 'preview' && <span className="env-badge">TEST</span>}
          </div>

          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search recipes, ingredients, or parts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="nav-actions">
            <button className={`btn btn-secondary btn-sm ${currentTab === 'meals' ? 'active' : ''}`} onClick={() => setCurrentTab('meals')} title="Meals">
              <CalendarDays size={16} />
              <span>Meals</span>
            </button>
            <button className={`btn btn-secondary btn-sm ${currentTab === 'shopping' ? 'active' : ''}`} onClick={() => setCurrentTab('shopping')} title="Shopping List">
              <ShoppingBag size={16} />
              <span>Shopping</span>
            </button>
            <button className="btn btn-outline btn-sm" onClick={onOpenImportModal}>
              <Sparkles size={16} />
              <span>Import Recipe</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={onOpenAddModal}>
              <PlusCircle size={16} />
              <span>New Recipe</span>
            </button>
            <div className="lang-toggle-group">
              <button
                className={`lang-btn ${language === 'nl' ? 'active' : ''}`}
                onClick={() => setLanguage('nl')}
                title="Toon recepten in het Nederlands"
              >
                🇳🇱 NL
              </button>
              <button
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
                title="Show recipes in English"
              >
                🇬🇧 EN
              </button>
            </div>
            <button className="btn btn-secondary btn-icon" onClick={toggleTheme} title="Toggle Dark/Light Mode">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className={`btn btn-secondary btn-icon ${currentTab === 'settings' ? 'active' : ''}`} onClick={() => setCurrentTab('settings')} title="Settings & Backup">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Bar */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-item ${currentTab === 'recipes' ? 'active' : ''}`}
          onClick={() => setCurrentTab('recipes')}
        >
          <UtensilsCrossed size={20} />
          <span>Recipes</span>
        </button>

        <button
          className="mobile-nav-item highlight"
          onClick={onOpenImportModal}
        >
          <Sparkles size={22} />
          <span>Import</span>
        </button>

        <button
          className="mobile-nav-item"
          onClick={onOpenAddModal}
        >
          <PlusCircle size={22} />
          <span>Add</span>
        </button>

        <button
          className={`mobile-nav-item ${currentTab === 'meals' ? 'active' : ''}`}
          onClick={() => setCurrentTab('meals')}
        >
          <CalendarDays size={20} />
          <span>Meals</span>
        </button>

        <button
          className={`mobile-nav-item ${currentTab === 'shopping' ? 'active' : ''}`}
          onClick={() => setCurrentTab('shopping')}
        >
          <ShoppingBag size={20} />
          <span>Shopping</span>
        </button>

        <button
          className={`mobile-nav-item ${currentTab === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentTab('settings')}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </nav>

      <style>{`
        .navbar-header {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(12px);
        }
        .navbar-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0.85rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          user-select: none;
        }
        .brand-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px var(--accent-glow);
        }
        .brand-name {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-main);
        }
        .brand-highlight {
          color: var(--accent-primary);
        }
        .env-badge {
          background: #dc2626;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-full);
          letter-spacing: 0.05em;
        }
        .lang-toggle-group {
          display: flex;
          gap: 0.25rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 0.25rem;
          border-radius: var(--radius-md);
        }
        .lang-btn {
          padding: 0.3rem 0.6rem;
          border-radius: var(--radius-sm);
          border: none;
          background: none;
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .lang-btn.active {
          background: var(--accent-primary);
          color: #ffffff;
        }
        .lang-btn:hover:not(.active) {
          background: var(--bg-card-hover);
        }
        .search-box {
          position: relative;
          flex: 1;
          max-width: 480px;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }
        .search-input {
          width: 100%;
          padding: 0.6rem 1rem 0.6rem 2.75rem;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          color: var(--text-main);
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .search-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .mobile-bottom-nav {
          display: none;
        }

        @media (max-width: 767px) {
          .nav-actions .btn span {
            display: none;
          }
          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 70px;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border-color);
            align-items: center;
            justify-content: space-around;
            z-index: 900;
            box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.3);
          }
          .mobile-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.25rem;
            background: none;
            border: none;
            color: var(--text-muted);
            font-size: 0.72rem;
            font-weight: 500;
            cursor: pointer;
            width: 16%;
            height: 100%;
          }
          .mobile-nav-item.active {
            color: var(--accent-primary);
          }
          .mobile-nav-item.highlight {
            color: #ffffff;
            background: var(--accent-gradient);
            border-radius: var(--radius-full);
            width: 48px;
            height: 48px;
            margin-bottom: 14px;
            box-shadow: 0 4px 14px var(--accent-glow);
          }
          .mobile-nav-item.highlight span {
            display: none;
          }
        }
      `}</style>
    </>
  );
};
