import React, { useState } from 'react';
import { ShoppingItem } from '../types/recipe';
import { ShoppingBag, CheckSquare, Square, Trash2, Plus, Share2, Printer, Check } from 'lucide-react';

interface ShoppingListProps {
  items: ShoppingItem[];
  onUpdateItems: (items: ShoppingItem[]) => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  onUpdateItems,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('');

  const toggleCheck = (id: string) => {
    const updated = items.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
    onUpdateItems(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: `shop-custom-${Date.now()}`,
      name: newItemName.trim(),
      amount: parseFloat(newItemAmount) || 1,
      unit: newItemUnit.trim(),
      recipeTitle: 'Custom Item',
      checked: false,
      category: 'Pantry'
    };

    onUpdateItems([...items, newItem]);
    setNewItemName('');
    setNewItemAmount('1');
    setNewItemUnit('');
  };

  const handleClearCompleted = () => {
    onUpdateItems(items.filter(i => !i.checked));
  };

  const handleClearAll = () => {
    if (confirm('Clear entire shopping list?')) {
      onUpdateItems([]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Group items by category
  const categoriesMap: Record<string, ShoppingItem[]> = {};
  items.forEach(item => {
    const cat = item.category || 'Other';
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(item);
  });

  return (
    <div className="shopping-container">
      <div className="shopping-header card">
        <div className="shopping-title-box">
          <div className="shopping-icon">
            <ShoppingBag size={24} color="#ffffff" />
          </div>
          <div>
            <h2>Grocery Shopping List</h2>
            <p className="shopping-sub">{items.filter(i => i.checked).length} of {items.length} items checked</p>
          </div>
        </div>

        <div className="shopping-actions">
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print List</span>
          </button>
          <button className="btn btn-outline btn-sm danger" onClick={handleClearCompleted}>
            <Trash2 size={16} />
            <span>Clear Checked</span>
          </button>
          <button className="btn btn-outline btn-sm danger" onClick={handleClearAll}>
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Add Custom Item Form */}
      <form onSubmit={handleAddItem} className="add-item-form card">
        <input
          type="text"
          placeholder="Add custom item (e.g. Olive Oil, Garlic)"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="input-field item-name-input"
        />
        <input
          type="number"
          step="any"
          placeholder="Qty"
          value={newItemAmount}
          onChange={(e) => setNewItemAmount(e.target.value)}
          className="input-field item-qty-input"
        />
        <input
          type="text"
          placeholder="Unit (g, bottle)"
          value={newItemUnit}
          onChange={(e) => setNewItemUnit(e.target.value)}
          className="input-field item-unit-input"
        />
        <button type="submit" className="btn btn-primary">
          <Plus size={18} />
          <span>Add</span>
        </button>
      </form>

      {/* Items List grouped by Category */}
      {Object.keys(categoriesMap).length > 0 ? (
        <div className="shopping-groups">
          {Object.entries(categoriesMap).map(([category, catItems]) => (
            <div key={category} className="category-group card">
              <h3 className="cat-group-title">{category} ({catItems.length})</h3>

              <ul className="shopping-items-list">
                {catItems.map((item) => (
                  <li
                    key={item.id}
                    className={`shopping-item ${item.checked ? 'checked' : ''}`}
                    onClick={() => toggleCheck(item.id)}
                  >
                    <div className="item-checkbox">
                      {item.checked ? <CheckSquare size={20} color="var(--accent-primary)" /> : <Square size={20} color="var(--text-dim)" />}
                    </div>

                    <div className="item-text">
                      <span className="item-qty-badge">{item.amount} {item.unit}</span>
                      <span className="item-name-text">{item.name}</span>
                      {item.recipeTitle && <span className="item-recipe-tag">from {item.recipeTitle}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-shopping card">
          <ShoppingBag size={48} color="var(--text-dim)" />
          <h3>Your Shopping List is Empty</h3>
          <p>Go to your recipes and click "Add to List" or add custom grocery items above.</p>
        </div>
      )}

      <style>{`
        .shopping-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .shopping-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .shopping-title-box {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .shopping-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px var(--accent-glow);
        }
        .shopping-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
        }
        .shopping-actions {
          display: flex;
          gap: 0.5rem;
        }
        .add-item-form {
          padding: 1rem;
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .item-name-input { flex: 3; min-width: 180px; }
        .item-qty-input { width: 80px; }
        .item-unit-input { width: 120px; }
        .shopping-groups {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .category-group {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .cat-group-title {
          font-size: 1.05rem;
          color: var(--accent-primary);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }
        .shopping-items-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .shopping-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .shopping-item:hover {
          background: var(--bg-card-hover);
        }
        .shopping-item.checked {
          opacity: 0.5;
          text-decoration: line-through;
        }
        .item-text {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
          font-size: 0.95rem;
        }
        .item-qty-badge {
          font-weight: 700;
          color: var(--accent-primary);
        }
        .item-name-text {
          color: var(--text-main);
        }
        .item-recipe-tag {
          font-size: 0.78rem;
          color: var(--text-dim);
          background: var(--badge-bg);
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
        }
        .empty-shopping {
          padding: 3rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};
