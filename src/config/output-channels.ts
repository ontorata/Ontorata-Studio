/** VS Code-style output channels for the bottom panel. */

export type OutputChannelId = 'studio' | 'tasks' | 'ratary' | 'terminal';

export interface OutputChannel {
  id: OutputChannelId;
  label: string;
}

export const OUTPUT_CHANNELS: OutputChannel[] = [
  { id: 'studio', label: 'Ontorata Studio' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'ratary', label: 'Ratary Memory' },
  { id: 'terminal', label: 'Terminal' },
];

export const DEFAULT_OUTPUT_CHANNEL: OutputChannelId = 'studio';

export function getOutputChannelLabel(id: OutputChannelId): string {
  return OUTPUT_CHANNELS.find((c) => c.id === id)?.label ?? id;
}
