import { isOidcEnabled } from '../config/env';
import { useCapabilities } from '../hooks/useCapabilities';
import { Card, PageHeader } from '../presentation/design-system/primitives';

const PRODUCTION_CHECKLIST = [
  { id: 'oidc', label: 'OIDC PKCE (no implicit flow)', done: isOidcEnabled() },
  { id: 'csp', label: 'CSP allows Zitadel issuer (*.zitadel.cloud)', done: true },
  { id: 'no-key-bundle', label: 'No API key in production bundle', done: true },
  { id: 'studio-oidc', label: 'Ratary STUDIO_OIDC_ENABLED on server', done: false },
  { id: 'https', label: 'HTTPS on studio.ontorata.com + ratary.ontorata.com', done: true },
  { id: 'session', label: 'Tokens in sessionStorage (tab-scoped)', done: true },
  { id: 'e2e', label: 'E2E: login → workspace → memory CRUD', done: false },
];

/** Phase 20 — Production hardening checklist and security posture. */
export function SecurityPage() {
  const { manifest } = useCapabilities();
  const studioOidc = manifest?.transport?.rest?.studioOidc?.enabled;

  const items = PRODUCTION_CHECKLIST.map((item) =>
    item.id === 'studio-oidc' ? { ...item, done: Boolean(studioOidc) } : item,
  );
  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="page">
      <PageHeader
        title="Security & Production"
        description="Phase 20 hardening checklist — verify before GA marketing."
      />
      <Card>
        <p>
          <strong>{doneCount}</strong> / {items.length} checks passing (server flags read live from Ratary).
        </p>
        <ul className="checklist">
          {items.map((item) => (
            <li key={item.id} className={item.done ? 'check-done' : 'check-pending'}>
              {item.done ? '✓' : '○'} {item.label}
            </li>
          ))}
        </ul>
        <p className="muted">
          Release flow: <code>staging</code> → PR → <code>main</code> → Vercel. Rotate Zitadel client
          secrets via console; revoke compromised <code>aic_</code> keys via Ratary admin.
        </p>
      </Card>
    </div>
  );
}
