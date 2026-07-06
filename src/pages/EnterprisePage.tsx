import { isOidcCloudAutoConnect, isOidcEnabled } from '../config/env';
import { useConnection } from '../hooks/useConnection';
import { Card, PageHeader } from '../presentation/design-system/primitives';

/** Phase 19 — Enterprise self-hosted and offline deployment guidance. */
export function EnterprisePage() {
  const { activeConnection } = useConnection();
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  return (
    <div className="page">
      <PageHeader
        title="Enterprise & Offline"
        description="Self-hosted Ratary, advanced connections, and offline operator guidance."
      />
      <div className="grid two">
        <Card>
          <h2>Deployment modes</h2>
          <dl className="kv">
            <dt>Cloud SaaS</dt>
            <dd>{isOidcCloudAutoConnect() ? 'Active (OIDC + cloud Ratary)' : 'Not configured'}</dd>
            <dt>Self-hosted Ratary</dt>
            <dd>
              Use <strong>/connect</strong> with <code>aic_...</code> API key and custom base URL
            </dd>
            <dt>OIDC</dt>
            <dd>{isOidcEnabled() ? 'Zitadel (production)' : 'Legacy API key login'}</dd>
            <dt>Active connection</dt>
            <dd>{activeConnection?.baseUrl ?? 'OIDC cloud auto-connect'}</dd>
          </dl>
        </Card>
        <Card>
          <h2>Offline status</h2>
          <p className={online ? 'ok-text' : 'error'}>
            Browser: {online ? 'Online' : 'Offline'}
          </p>
          <p className="muted">
            Studio requires network access to Ratary REST API. Cached UI only — no offline memory sync.
            For air-gapped deployments, run Ratary on-premises and point Studio via connection wizard.
          </p>
          <h3>Self-hosted checklist</h3>
          <ul className="checklist">
            <li>Deploy Ratary (`docker` or `npm run dev`)</li>
            <li>Bootstrap API key (`aic_...`)</li>
            <li>Studio → Connect → custom URL + key</li>
            <li>Optional: own Zitadel instance + `VITE_AUTH_ISSUER`</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
