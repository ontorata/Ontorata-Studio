import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { DecisionModelSummary } from '../../src/domain/decisions/decision-model-types';
import {
  DecisionModelPicker,
  formatDecisionModelOptionLabel,
} from '../../src/presentation/decisions/DecisionModelPicker';

const seedModel: DecisionModelSummary = {
  id: 'ontorata-internal-v1',
  version: '1.0.0',
  displayName: 'Ontorata Internal',
  stability: 'experimental',
  executionProfileName: 'analysis',
  capabilities: ['strategic-session'],
};

describe('DecisionModelPicker', () => {
  it('formats option labels with id and stability', () => {
    expect(formatDecisionModelOptionLabel(seedModel)).toBe(
      'Ontorata Internal (experimental) — ontorata-internal-v1@1.0.0',
    );
  });

  it('renders authorized models from props', () => {
    const html = renderToStaticMarkup(
      <DecisionModelPicker models={[seedModel]} selectedId={seedModel.id} onSelect={() => {}} />,
    );
    expect(html).toContain('ontorata-internal-v1');
    expect(html).toContain('Ontorata Internal (experimental)');
  });

  it('shows empty-state guidance when no models authorized', () => {
    const html = renderToStaticMarkup(
      <DecisionModelPicker models={[]} selectedId={null} onSelect={() => {}} />,
    );
    expect(html).toContain('DECISION_MODEL_ALLOWLIST');
  });

  it('shows loading copy while models fetch', () => {
    const html = renderToStaticMarkup(
      <DecisionModelPicker models={[]} selectedId={null} onSelect={() => {}} loading />,
    );
    expect(html).toContain('Loading decision models');
  });
});
