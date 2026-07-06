import type { ConnectionMode, RataryConnection } from '../../domain/connection/connection';

const CONNECTIONS_KEY = 'ontorata-studio-connections';
const ACTIVE_CONNECTION_KEY = 'ontorata-studio-active-connection';
const SECRETS_SESSION_KEY = 'ontorata-studio-connection-secrets-session';
const SECRETS_PERSIST_KEY = 'ontorata-studio-connection-secrets-persist';

interface SecretRecord {
  apiKey: string;
  mode: ConnectionMode;
}

function readJson<T>(key: string, storage: Storage): T | null {
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, storage: Storage, value: unknown): void {
  storage.setItem(key, JSON.stringify(value));
}

function obfuscate(value: string): string {
  return btoa(value);
}

function deobfuscate(value: string): string {
  return atob(value);
}

export function listStoredConnections(): RataryConnection[] {
  return readJson<RataryConnection[]>(CONNECTIONS_KEY, localStorage) ?? [];
}

export function saveStoredConnection(connection: RataryConnection): void {
  const list = listStoredConnections().filter((c) => c.id !== connection.id);
  list.push(connection);
  writeJson(CONNECTIONS_KEY, localStorage, list);
}

export function removeStoredConnection(connectionId: string): void {
  const list = listStoredConnections().filter((c) => c.id !== connectionId);
  writeJson(CONNECTIONS_KEY, localStorage, list);
  removeConnectionSecret(connectionId);
  const active = getActiveConnectionId();
  if (active === connectionId) {
    clearActiveConnection();
  }
}

export function getActiveConnectionId(): string | null {
  return sessionStorage.getItem(ACTIVE_CONNECTION_KEY);
}

export function setActiveConnectionId(connectionId: string): void {
  sessionStorage.setItem(ACTIVE_CONNECTION_KEY, connectionId);
}

export function clearActiveConnection(): void {
  sessionStorage.removeItem(ACTIVE_CONNECTION_KEY);
}

function readSecrets(storage: Storage): Record<string, SecretRecord> {
  const key = storage === sessionStorage ? SECRETS_SESSION_KEY : SECRETS_PERSIST_KEY;
  return readJson<Record<string, SecretRecord>>(key, storage) ?? {};
}

function writeSecrets(storage: Storage, secrets: Record<string, SecretRecord>): void {
  const key = storage === sessionStorage ? SECRETS_SESSION_KEY : SECRETS_PERSIST_KEY;
  writeJson(key, storage, secrets);
}

export function saveConnectionSecret(connectionId: string, apiKey: string, mode: ConnectionMode): void {
  const record: SecretRecord = { apiKey: obfuscate(apiKey), mode };
  const storage = mode === 'temporary' ? sessionStorage : localStorage;
  const secrets = readSecrets(storage);
  secrets[connectionId] = record;
  writeSecrets(storage, secrets);
}

export function getConnectionSecret(connectionId: string): string | null {
  for (const storage of [sessionStorage, localStorage]) {
    const secrets = readSecrets(storage);
    const record = secrets[connectionId];
    if (record) {
      try {
        return deobfuscate(record.apiKey);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function removeConnectionSecret(connectionId: string): void {
  for (const storage of [sessionStorage, localStorage]) {
    const secrets = readSecrets(storage);
    if (secrets[connectionId]) {
      delete secrets[connectionId];
      writeSecrets(storage, secrets);
    }
  }
}

export function clearAllConnectionData(): void {
  localStorage.removeItem(CONNECTIONS_KEY);
  localStorage.removeItem(SECRETS_PERSIST_KEY);
  sessionStorage.removeItem(ACTIVE_CONNECTION_KEY);
  sessionStorage.removeItem(SECRETS_SESSION_KEY);
}
