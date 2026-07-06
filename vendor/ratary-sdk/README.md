# @ratary/sdk

TypeScript client for the [Ratary REST API](https://github.com/ontorata/ratary).

```bash
npm install @ratary/sdk@1.1.0
```

**npm:** [@ratary/sdk@1.1.0](https://www.npmjs.com/package/@ratary/sdk) · **Scope:** `@ratary` ([Ontorata](https://ontorata.com))

---

## Usage

```typescript
import { RataryClient } from '@ratary/sdk';

const client = new RataryClient({
  baseUrl: process.env.RATARY_BASE_URL ?? 'http://localhost:9876',
  apiKey: process.env.RATARY_API_KEY!,
  workspaceId: process.env.RATARY_WORKSPACE_ID,
});

await client.memory.create({
  title: 'Handoff',
  content: 'Session notes…',
  tags: ['handoff'],
});

const { results } = await client.memory.search({ query: 'auth' });
const ctx = await client.context.build({ task: 'Implement feature X' });

// v1.1.0 — admin / operator surfaces (requires server flags where applicable)
await client.admin.cloud.getStatus();
await client.admin.knowledgeFabric.listConnectors();
await client.admin.knowledgeFabric.ingest('notion', { mode: 'incremental', dryRun: true });
```

Legacy env aliases `AI_BRAIN_*` are still accepted by server-side tooling; prefer `RATARY_*` in new code.

### Admin namespaces (`client.admin`)

| Namespace | Examples |
|-----------|----------|
| `admin.cloud` | `getStatus()` |
| `admin.observability` | metrics / SLO helpers |
| `admin.infrastructure` | adapter status |
| `admin.platform` | edition, webhooks |
| `admin.knowledgeFabric` | connectors, ingest, sync jobs |
| `admin.federation` | federation control plane |

Full operator CLI: `@ratary/cli` — `ratary admin ...` · `ratary connectors sync`.

---

## Requirements

- Node.js ≥ 20
- A running Ratary Server (self-host or hosted) and API key (`aic_...`)

Bootstrap the first key when no identities exist:

```bash
curl -X POST "$RATARY_BASE_URL/api/v1/auth/bootstrap" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-app"}'
```

---

## Examples

Runnable examples in the monorepo: [SDK/](../../SDK/README.md).

---

## License

MIT · [ontorata/ratary](https://github.com/ontorata/ratary)
