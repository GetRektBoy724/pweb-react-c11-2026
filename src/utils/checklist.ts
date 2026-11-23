import type { ChecklistItem } from "../types";

/** Semua operasi immutable: selalu mengembalikan array baru. */
export function addChecklistItem(
  checklist: ChecklistItem[],
  text: string,
): ChecklistItem[] {
  const trimmed = text.trim();
  if (trimmed === "") return checklist;
  return [...checklist, { id: crypto.randomUUID(), text: trimmed, done: false }];
}

export function toggleChecklistItem(
  checklist: ChecklistItem[],
  id: string,
): ChecklistItem[] {
  return checklist.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item,
  );
}

export function removeChecklistItem(
  checklist: ChecklistItem[],
  id: string,
): ChecklistItem[] {
  return checklist.filter((item) => item.id !== id);
}

export function checklistProgress(checklist: ChecklistItem[]): {
  done: number;
  total: number;
  percent: number;
} {
  const total = checklist.length;
  const done = checklist.filter((item) => item.done).length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}