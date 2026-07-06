import { Card, EmptyState, PageHeader } from '../presentation/design-system/primitives';

/** Phase 16 — Coding workspace shell (IDE integration TBD). */
export function CodingWorkspacePage() {
  return (
    <div className="page">
      <PageHeader
        title="Coding Workspace"
        description="Agent-assisted development environment — embeds via future Ontory / IDE bridge."
      />
      <Card>
        <EmptyState
          title="Coming soon"
          description="Phase 16 shell is ready; deep IDE integration ships in a later release."
        />
      </Card>
    </div>
  );
}
