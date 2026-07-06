import type { AIProfileRef } from '../../domain/profile/profile';

const STORAGE_KEY = 'ontorata-studio-profiles';

function readAll(): AIProfileRef[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as AIProfileRef[];
  } catch {
    return [];
  }
}

function writeAll(profiles: AIProfileRef[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function listProfiles(): AIProfileRef[] {
  return readAll();
}

export function saveProfile(profile: AIProfileRef): void {
  const list = readAll().filter((p) => p.id !== profile.id);
  list.push(profile);
  writeAll(list);
}

export function deleteProfile(id: string): void {
  writeAll(readAll().filter((p) => p.id !== id));
}
