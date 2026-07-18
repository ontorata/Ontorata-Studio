import type { AssembledPrompt } from '../ai/prompt-assembler';

export type Cdsb001FormInput = Readonly<{
  projectId: string;
  weekRange: string;
  projectNotes: string;
  workspaceId?: string;
}>;

/**
 * CDSB-001 prompt assembly — project notes only (no Ratary recall / P1-A path).
 */
export function assembleCdsb001Prompt(input: Cdsb001FormInput): AssembledPrompt {
  const user = `Generate the weekly Client Delivery Status Brief for project "${input.projectId}" (${input.weekRange}).`;

  const system = [
    'You generate a Client Delivery Status Brief (CDSB-001) for Ontorata Tech pilot operations.',
    'Respond in markdown with sections:',
    '1. Executive summary',
    '2. Completed this week',
    '3. In progress',
    '4. Blockers / risks',
    '5. Next week plan',
    'Use only facts from the project notes. Do not invent deliverables or dates.',
    input.workspaceId ? `Workspace: ${input.workspaceId}` : 'Workspace: (unspecified)',
  ].join('\n');

  const context = [
    `Project ID: ${input.projectId}`,
    `Reporting week: ${input.weekRange}`,
    '',
    'Project notes:',
    input.projectNotes.trim(),
  ].join('\n');

  return Object.freeze({
    system,
    context,
    user,
    sourceLabels: Object.freeze(['cdsb-001:project-notes']),
    packageId: `cdsb-001-${input.projectId}`,
    query: user,
  });
}
