import type { WorkspaceContextPackage } from '../recall/workspace-context-package';
import { listContextSourceLabels } from '../recall/present-context-package';

/**
 * W4 — formatting output only. No recall, ranking, or provider coupling.
 */
export type AssembledPrompt = Readonly<{
  system: string;
  context: string;
  user: string;
  sourceLabels: readonly string[];
  packageId: string;
  query: string;
}>;

export type AssembleWorkspacePromptInput = Readonly<{
  userPrompt: string;
  /** MUST be WorkspaceContextPackage */
  contextPackage: WorkspaceContextPackage;
  workspaceId?: string;
}>;

/**
 * PromptAssembler is a formatting layer over an already-assembled ContextPackage.
 * Allowed: system/context/user composition, workspace metadata, preserve package order.
 * Forbidden: fetch, semantic filter, re-rank, relevance judgment, trim/rebuild package body.
 * Input contract: WorkspaceContextPackage only.
 */
export function assembleWorkspacePrompt(input: AssembleWorkspacePromptInput): AssembledPrompt {
  const { userPrompt, contextPackage, workspaceId } = input;
  const sourceLabels = listContextSourceLabels(contextPackage);
  const workspaceLine = workspaceId ? `Workspace: ${workspaceId}` : 'Workspace: (unspecified)';

  const system = [
    'You are Ontory, an organizational memory assistant in Ontorata Studio.',
    workspaceLine,
    'Answer using the provided organizational context. Cite sources by label when relevant.',
    'Do not invent memories that are absent from the context block.',
  ].join('\n');

  const sourceBlock =
    sourceLabels.length > 0
      ? `\nSources (order preserved from recall):\n${sourceLabels.map((label, i) => `${i + 1}. ${label}`).join('\n')}`
      : '';

  const context = `${contextPackage.contextText}${sourceBlock}`;

  return Object.freeze({
    system,
    context,
    user: userPrompt,
    sourceLabels,
    packageId: contextPackage.packageId,
    query: contextPackage.query,
  });
}
