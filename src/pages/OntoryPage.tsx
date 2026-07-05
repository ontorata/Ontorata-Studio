const DEFAULT_ONTORY_URL = 'https://ontorata.com';

export function OntoryPage() {
  const ontoryUrl = import.meta.env.VITE_ONTORY_URL ?? DEFAULT_ONTORY_URL;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Ontory</h1>
        <p>
          <strong>Ontorata Studio</strong> is the operator console. <strong>Ontory</strong> is the
          end-user assistant experience — chat and daily workflows live there, not in Studio.
        </p>
      </header>
      <section className="card">
        <p>Studio does not embed agent loops or chat orchestration (Phase 26 non-goal).</p>
        <a className="btn primary" href={ontoryUrl} target="_blank" rel="noreferrer">
          Open Ontory ↗
        </a>
      </section>
    </div>
  );
}
