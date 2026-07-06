import type { AIStackRef } from '../../domain/stack/stack';

const STORAGE_KEY = 'ontorata-studio-stacks';

function readAll(): AIStackRef[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as AIStackRef[];
  } catch {
    return [];
  }
}

function writeAll(stacks: AIStackRef[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stacks));
}

export function listStacks(): AIStackRef[] {
  return readAll();
}

export function saveStack(stack: AIStackRef): void {
  const list = readAll().filter((s) => s.id !== stack.id);
  list.push(stack);
  writeAll(list);
}

export function deleteStack(id: string): void {
  writeAll(readAll().filter((s) => s.id !== id));
}
