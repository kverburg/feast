import { useEffect, useState } from 'react';

const STORAGE_KEY_PEOPLE = 'gourmet_craft_people_v1';
const CHANGE_EVENT = 'feast-people-changed';

// Someone who can be at a meal. Managed in Settings, picked in Meals.
export interface Person {
  id: string;
  name: string;
  allergies?: string[]; // ingredients this person must not eat
  dislikes?: string[]; // ingredients this person does not like
}

export const getPeople = (): Person[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PEOPLE);
    const list = data ? JSON.parse(data) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const savePeople = (people: Person[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_PEOPLE, JSON.stringify(people));
  } catch (e) {
    console.error('Error saving people to localStorage', e);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

/** Adds a person (or returns the one that already has this name, ignoring case). Null for an empty name. */
export const addPerson = (name: string): Person | null => {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const people = getPeople();
  const existing = people.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) return existing;
  const person = { id: `person-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: trimmed };
  savePeople([...people, person]);
  return person;
};

export const renamePerson = (id: string, name: string): void => {
  const trimmed = name.trim();
  if (!trimmed) return;
  savePeople(getPeople().map((p) => (p.id === id ? { ...p, name: trimmed } : p)));
};

export const updatePerson = (id: string, patch: Partial<Omit<Person, 'id'>>): void =>
  savePeople(getPeople().map((p) => (p.id === id ? { ...p, ...patch } : p)));

// Meals that still list a removed person simply ignore the unknown id.
export const deletePerson = (id: string): void => savePeople(getPeople().filter((p) => p.id !== id));

/** The people list, kept current when it changes here or after a sync from another device. */
export function usePeople(): Person[] {
  const [people, setPeople] = useState<Person[]>(getPeople);
  useEffect(() => {
    const refresh = () => setPeople(getPeople());
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('focus', refresh);
    refresh();
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  return people;
}
