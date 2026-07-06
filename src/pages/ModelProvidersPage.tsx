import { Card, PageHeader } from '../presentation/design-system/primitives';

/** Phase 15 — Model provider settings (configuration stub). */
export function ModelProvidersPage() {
  return (
    <div className="page">
      <PageHeader
        title="Model Providers"
        description="LLM routing is configured on Ratary server — Studio displays policy placeholders."
      />
      <Card>
        <dl className="kv">
          <dt>Default provider</dt>
          <dd>Ratary server policy</dd>
          <dt>Studio role</dt>
          <dd>Operator console — no embedded inference</dd>
        </dl>
      </Card>
    </div>
  );
}
