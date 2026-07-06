import type { AgentConfigRef } from '../../domain/agent/agent-config';

const STORAGE_KEY = 'ontorata-studio-agent-configs';

function readAll(): AgentConfigRef[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as AgentConfigRef[];
  } catch {
    return [];
  }
}

function writeAll(configs: AgentConfigRef[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

export function listAgentConfigs(): AgentConfigRef[] {
  return readAll();
}

export function saveAgentConfig(config: AgentConfigRef): void {
  const list = readAll().filter((c) => c.id !== config.id);
  list.push(config);
  writeAll(list);
}

export function deleteAgentConfig(id: string): void {
  writeAll(readAll().filter((c) => c.id !== id));
}
