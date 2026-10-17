import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Users, X } from 'lucide-react';
import { usePeople, addPerson, renamePerson, updatePerson, deletePerson, Person } from '../services/peopleService';

interface Props {
  onBack: () => void;
}

// A list of terms (ingredients) as chips with an input to add more
const TermList: React.FC<{ label: string; hint: string; terms: string[]; tone: 'allergy' | 'dislike'; onChange: (terms: string[]) => void }> = ({
  label,
  hint,
  terms,
  tone,
  onChange,
}) => {
  const [draft, setDraft] = useState('');
  const add = () => {
    // several at once with commas: "noten, pinda, koriander"
    const added = draft.split(',').map((t) => t.trim()).filter(Boolean);
    if (added.length === 0) return;
    const known = new Set(terms.map((t) => t.toLowerCase()));
    onChange([...terms, ...added.filter((t, i) => !known.has(t.toLowerCase()) && added.findIndex((x) => x.toLowerCase() === t.toLowerCase()) === i)]);
    setDraft('');
  };
  return (
    <div className="people-terms">
      <span className="people-terms-label">{label}</span>
      <div className="people-chips">
        {terms.map((t) => (
          <span key={t} className={`people-chip ${tone}`}>
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(terms.filter((x) => x !== t))}>
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          className="input-field people-term-input"
          placeholder={hint}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
        />
      </div>
    </div>
  );
};

export const PeopleSettings: React.FC<Props> = ({ onBack }) => {
  const people = usePeople();
  const [newName, setNewName] = useState('');

  const remove = (p: Person) => {
    if (confirm(`Remove ${p.name}? They are taken off the meals they were at.`)) deletePerson(p.id);
  };

  return (
    <div className="people-page">
      <div className="people-head">
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <h2><Users size={20} /> People</h2>
      </div>
      <p className="setting-desc">
        Who can be at a meal. Fill in what someone must not eat or does not like: Meals warns you when a recipe in a meal has that
        ingredient. It reads ingredient names only, so check sauces and ready-made products yourself.
      </p>

      {people.map((p) => (
        <div key={p.id} className="people-card card">
          <div className="people-card-head">
            <input
              className="input-field people-name"
              defaultValue={p.name}
              aria-label="Name"
              onBlur={(e) => (e.target.value.trim() ? renamePerson(p.id, e.target.value) : (e.target.value = p.name))}
            />
            <button className="btn btn-outline btn-icon danger" aria-label={`Remove ${p.name}`} onClick={() => remove(p)}>
              <Trash2 size={16} />
            </button>
          </div>
          <TermList
            label="Allergies"
            hint="e.g. noten, pinda"
            tone="allergy"
            terms={p.allergies || []}
            onChange={(allergies) => updatePerson(p.id, { allergies })}
          />
          <TermList
            label="Does not like"
            hint="e.g. koriander, olijven"
            tone="dislike"
            terms={p.dislikes || []}
            onChange={(dislikes) => updatePerson(p.id, { dislikes })}
          />
        </div>
      ))}
      {people.length === 0 && <p className="setting-desc">Nobody yet.</p>}

      <form
        className="people-add card"
        onSubmit={(e) => {
          e.preventDefault();
          if (addPerson(newName)) setNewName('');
        }}
      >
        <input className="input-field" placeholder="Add a person" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button type="submit" className="btn btn-secondary btn-sm" disabled={!newName.trim()}>
          <Plus size={16} />
          <span>Add</span>
        </button>
      </form>

      <style>{`
        .people-page { display: flex; flex-direction: column; gap: 1rem; }
        .people-head { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .people-head h2 { display: flex; align-items: center; gap: 0.4rem; margin: 0; font-size: 1.2rem; }
        .people-card { padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .people-card-head, .people-add { display: flex; gap: 0.5rem; align-items: center; }
        .people-add { padding: 0.75rem 1rem; }
        .people-name { font-weight: 700; }
        .people-terms { display: flex; flex-direction: column; gap: 0.35rem; }
        .people-terms-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-dim); }
        .people-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; }
        .people-chip { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-size: 0.85rem; font-weight: 600; }
        .people-chip.allergy { background: rgba(239, 68, 68, 0.14); color: #dc2626; }
        .people-chip.dislike { background: rgba(245, 158, 11, 0.18); color: #b45309; }
        .people-chip button { background: none; border: none; color: inherit; display: flex; padding: 0; cursor: pointer; }
        .people-term-input { width: 170px; padding: 0.3rem 0.5rem; font-size: 0.85rem; }
      `}</style>
    </div>
  );
};
