import type { DecisionModelSummary } from '../../domain/decisions/decision-model-types';

type DecisionModelAttributionProps = Readonly<{
  model: DecisionModelSummary | null;
  sandboxOutcome?: string;
  pluginDigestPrefix?: string;
}>;

/** Shared disclosure for selected decision model (PI-P6-D2). */
export function DecisionModelAttribution({
  model,
  sandboxOutcome,
  pluginDigestPrefix,
}: DecisionModelAttributionProps) {
  if (!model) return null;

  return (
    <p className="muted">
      Decision model: <code>{model.id}@{model.version}</code> · profile{' '}
      <code>{model.executionProfileName}</code> · {model.stability}
      {model.computedPlugin && (
        <>
          {' '}
          · Computed plugin
          {pluginDigestPrefix ? (
            <>
              {' '}
              (digest prefix <code>{pluginDigestPrefix}</code>)
            </>
          ) : (
            <>
              {' '}
              (digest prefix <code>{model.computedPlugin.artifactDigestPrefix}</code>)
            </>
          )}
        </>
      )}
      {sandboxOutcome && <> · sandbox {sandboxOutcome}</>}
    </p>
  );
}
