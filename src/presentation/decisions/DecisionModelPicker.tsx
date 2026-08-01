import type { DecisionModelSummary } from '../../domain/decisions/decision-model-types';

type DecisionModelPickerProps = Readonly<{
  models: readonly DecisionModelSummary[];
  selectedId: string | null;
  onSelect: (model: DecisionModelSummary | null) => void;
  loading?: boolean;
}>;

export function formatDecisionModelOptionLabel(model: DecisionModelSummary): string {
  const computedTag = model.computedPlugin ? ' (computed)' : '';
  return `${model.displayName}${computedTag} (${model.stability}) — ${model.id}@${model.version}`;
}

/** PI-P6-D0 — authorized declarative decision model picker. */
export function DecisionModelPicker({
  models,
  selectedId,
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
        value={selectedId ?? ''}
        onChange={(event) => {
          const id = event.target.value;
          if (!id) {
            onSelect(null);
            return;
          }
          const model = models.find((entry) => entry.id === id) ?? null;
          onSelect(model);
        }}
      >
        <option value="">Default (no custom model)</option>
        {models.map((model) => (
          <option key={`${model.id}@${model.version}`} value={model.id}>
            {formatDecisionModelOptionLabel(model)}
          </option>
        ))}
      </select>
    </label>
  );
}
