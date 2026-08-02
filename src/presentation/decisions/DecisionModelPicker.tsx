import type { DecisionModelSummary } from '../../domain/decisions/decision-model-types';

/** Canonical picker key for PI-P6-D2 version-aware selection. */
export function decisionModelRefKey(
  model: Pick<DecisionModelSummary, 'id' | 'version'>,
): string {
  return `${model.id}@${model.version}`;
}

export function findDecisionModelByRefKey(
  models: readonly DecisionModelSummary[],
  refKey: string | null,
): DecisionModelSummary | null {
  if (!refKey) return null;
  return models.find((entry) => decisionModelRefKey(entry) === refKey) ?? null;
}

type DecisionModelPickerProps = Readonly<{
  models: readonly DecisionModelSummary[];
  selectedRef: string | null;
  onSelect: (model: DecisionModelSummary | null) => void;
  loading?: boolean;
}>;

export function formatDecisionModelOptionLabel(model: DecisionModelSummary): string {
  const computedTag = model.computedPlugin ? ' · computed' : '';
  const deprecatedTag = model.stability === 'deprecated' ? ' · deprecated' : '';
  return `${model.displayName} (${model.stability})${computedTag}${deprecatedTag} — ${model.id}@${model.version}`;
}

/** PI-P6-D0/D2 — authorized decision model picker with version-aware ref keys. */
export function DecisionModelPicker({
  models,
  selectedRef,
  onSelect,
  loading,
}: DecisionModelPickerProps) {
  if (loading) {
    return <p className="muted">Loading decision models…</p>;
  }

  if (models.length === 0) {
    return (
      <p className="muted">
        No authorized decision models. Set <code>DECISION_MODEL_ALLOWLIST</code> on Ratary.
      </p>
    );
  }

  return (
    <label className="field">
      <span className="field-label">Decision model (optional)</span>
      <select
        className="input"
        value={selectedRef ?? ''}
        onChange={(event) => {
          const refKey = event.target.value;
          onSelect(findDecisionModelByRefKey(models, refKey || null));
        }}
      >
        <option value="">Default (no custom model)</option>
        {models.map((model) => (
          <option key={decisionModelRefKey(model)} value={decisionModelRefKey(model)}>
            {formatDecisionModelOptionLabel(model)}
          </option>
        ))}
      </select>
      {selectedRef &&
        models.some(
          (m) => decisionModelRefKey(m) === selectedRef && m.stability === 'deprecated',
        ) && (
          <p className="muted warning">
            Selected model is deprecated — prefer a newer version when available.
          </p>
        )}
    </label>
  );
}
