import React, { useEffect } from 'react';
import { Timer, X } from 'lucide-react';
import { CookingEntry, formatMinutes } from '../services/cookingTimes';

interface CookingTimePopupProps {
  entry: CookingEntry;
  language: 'nl' | 'en';
  onClose: () => void;
}

const TEXT = {
  nl: {
    boil: 'Koken in kokend water',
    simmer: 'Zacht laten sudderen',
    guidance: 'Richttijden: de verpakking en proeven gaan voor.',
    close: 'Sluiten',
  },
  en: {
    boil: 'Boil in boiling water',
    simmer: 'Simmer gently',
    guidance: 'Typical times: the package and tasting come first.',
    close: 'Close',
  },
};

// Small sheet with the boil/simmer times of an ingredient. Click outside or press Escape to close.
export const CookingTimePopup: React.FC<CookingTimePopupProps> = ({ entry, language, onClose }) => {
  const text = TEXT[language];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="ct-overlay" onClick={onClose}>
      <div className="ct-sheet card" role="dialog" aria-label={entry.display[language]} onClick={(e) => e.stopPropagation()}>
        <div className="ct-head">
          <Timer size={18} color="var(--accent-primary)" />
          <h4>{entry.display[language]}</h4>
          <button className="ct-close" onClick={onClose} aria-label={text.close}>
            <X size={16} />
          </button>
        </div>
        <p className="ct-method">{text[entry.method]}</p>
        <ul className="ct-times">
          {entry.times.map((time) => (
            <li key={time.label.en}>
              <span>{time.label[language]}</span>
              <strong>{formatMinutes(time)}</strong>
            </li>
          ))}
        </ul>
        {entry.note && <p className="ct-note">{entry.note[language]}</p>}
        <p className="ct-guidance">{text.guidance}</p>
      </div>
      <style>{`
        .ct-overlay {
          position: fixed;
          inset: 0;
          z-index: 3000;
          background: rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 1rem;
        }
        @media (min-width: 768px) {
          .ct-overlay { align-items: center; }
        }
        .ct-sheet {
          width: min(100%, 360px);
          padding: 1rem 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 70px;
        }
        @media (min-width: 768px) {
          .ct-sheet { margin-bottom: 0; }
        }
        .ct-head { display: flex; align-items: center; gap: 0.5rem; }
        .ct-head h4 { flex: 1; font-size: 1rem; color: var(--text-main); }
        .ct-close { background: none; border: none; color: var(--text-dim); cursor: pointer; display: flex; padding: 0.25rem; }
        .ct-method { color: var(--text-muted); font-size: 0.85rem; }
        .ct-times { list-style: none; margin: 0.25rem 0; padding: 0; display: flex; flex-direction: column; gap: 0.35rem; }
        .ct-times li {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.5rem 0.75rem; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-sm);
          color: var(--text-main); font-size: 0.92rem;
        }
        .ct-times strong { color: var(--accent-primary); }
        .ct-note { font-size: 0.82rem; color: var(--text-main); }
        .ct-guidance { font-size: 0.74rem; color: var(--text-dim); }
      `}</style>
    </div>
  );
};
