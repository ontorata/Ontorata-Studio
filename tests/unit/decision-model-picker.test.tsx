import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { DecisionModelSummary } from '../../src/domain/decisions/decision-model-types';
import {
  DecisionModelPicker,
  decisionModelRefKey,
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
  it('uses composite ref keys', () => {
    expect(decisionModelRefKey(seedModel)).toBe('ontorata-internal-v1@1.0.0');
  });

  it('formats option labels with id@version', () => {
    expect(formatDecisionModelOptionLabel(seedModel)).toBe(
      'Ontorata Internal (experimental) — ontorata-internal-v1@1.0.0',
    );
  });

  it('formats computed and deprecated badges', () => {
    const computed: DecisionModelSummary = {
      ...seedModel,
      id: 'ontorata-computed-scorer-v1',
      version: '1.1.0',
      displayName: 'Ontorata Computed Scorer v1.1',
      computedPlugin: { kind: 'worker', artifactDigestPrefix: '0ea83038d929' },
    };
    const deprecated: DecisionModelSummary = {
      ...computed,
      version: '1.0.0',
      stability: 'deprecated',
    };
    expect(formatDecisionModelOptionLabel(computed)).toContain('· computed');
    expect(formatDecisionModelOptionLabel(deprecated)).toContain('· deprecated');
  });

  it('renders authorized models from props with ref keys', () => {
    const html = renderToStaticMarkup(
      <DecisionModelPicker
        models={[seedModel]}
        selectedRef={decisionModelRefKey(seedModel)}
        onSelect={() => {}}
      />,
    );
    expect(html).toContain('ontorata-internal-v1@1.0.0');
  });

  it('shows empty-state guidance when no models authorized', () => {
    const html = renderToStaticMarkup(
      <DecisionModelPicker models={[]} selectedRef={null} onSelect={() => {}} />,
    );
    expect(html).toContain('DECISION_MODEL_ALLOWLIST');
  });

  it('shows loading copy while models fetch', () => {
    const html = renderToStaticMarkup(
      <DecisionModelPicker models={[]} selectedRef={null} onSelect={() => {}} loading />,
    );
    expect(html).toContain('Loading decision models');
  });
});
