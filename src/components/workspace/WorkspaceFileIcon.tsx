import type { ReactNode } from 'react';
import type { WorkspaceFileIconKind } from './workspace-file-icon';
import { getWorkspaceFileIconKind } from './workspace-file-icon';

interface WorkspaceFileIconProps {
  fileName: string;
  className?: string;
}

function FileBadge({
  label,
  bg,
  fg = '#fff',
}: {
  label: string;
  bg: string;
  fg?: string;
}) {
  return (
    <>
      <path
        d="M4.5 1.5h5.2L13 4.8V13.5a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V2.5a1 1 0 0 1 1-1z"
        fill="#f8fafc"
        stroke="#cbd5e1"
        strokeWidth="0.6"
      />
      <path d="M9.5 1.5V4.8H13" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" />
      <rect x="3.5" y="9" width="9" height="4.5" rx="0.8" fill={bg} />
      <text
        x="8"
        y="12.1"
        textAnchor="middle"
        fontSize="3.2"
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill={fg}
      >
        {label}
      </text>
    </>
  );
}

const ICON_RENDERERS: Record<WorkspaceFileIconKind, () => ReactNode> = {
  typescript: () => <FileBadge label="TS" bg="#3178c6" />,
  javascript: () => <FileBadge label="JS" bg="#f7df1e" fg="#111827" />,
  json: () => <FileBadge label="{}" bg="#f59e0b" fg="#111827" />,
  markdown: () => <FileBadge label="MD" bg="#2563eb" />,
  stylesheet: () => <FileBadge label="CSS" bg="#663399" />,
  html: () => <FileBadge label="HTM" bg="#e34f26" />,
  python: () => <FileBadge label="PY" bg="#3776ab" />,
  php: () => <FileBadge label="PHP" bg="#777bb4" />,
  java: () => <FileBadge label="JV" bg="#b07219" />,
  go: () => <FileBadge label="GO" bg="#00add8" fg="#042f3a" />,
  rust: () => <FileBadge label="RS" bg="#dea584" fg="#4a2c17" />,
  sql: () => <FileBadge label="SQL" bg="#336791" />,
  vue: () => <FileBadge label="VU" bg="#42b883" />,
  yaml: () => <FileBadge label="YML" bg="#cb171e" />,
  toml: () => <FileBadge label="TML" bg="#9c4221" />,
  xml: () => <FileBadge label="XML" bg="#f97316" />,
  shell: () => <FileBadge label="$" bg="#4ade80" fg="#14532d" />,
  config: () => (
    <>
      <path
        d="M4.5 1.5h5.2L13 4.8V13.5a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V2.5a1 1 0 0 1 1-1z"
        fill="#f8fafc"
        stroke="#cbd5e1"
        strokeWidth="0.6"
      />
      <path d="M9.5 1.5V4.8H13" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" />
      <circle cx="8" cy="10.5" r="2.2" fill="#64748b" />
      <path
        d="M8 8.8v1.4M8 11.8v1.4M6.2 10.5h1.4M8.4 10.5h1.4"
        stroke="#fff"
        strokeWidth="0.65"
        strokeLinecap="round"
      />
    </>
  ),
  image: () => (
    <>
      <rect x="3" y="3" width="10" height="10" rx="1.2" fill="#fce7f3" stroke="#f472b6" strokeWidth="0.7" />
      <circle cx="6" cy="6.5" r="1" fill="#ec4899" />
      <path d="M4.5 11.5l2.4-2.2 1.8 1.6 2-2.4 2.3 2.8" stroke="#db2777" strokeWidth="0.8" fill="none" />
    </>
  ),
  pdf: () => <FileBadge label="PDF" bg="#ef4444" />,
  text: () => <FileBadge label="TXT" bg="#94a3b8" fg="#1e293b" />,
  default: () => (
    <>
      <path
        d="M4.5 1.5h5.2L13 4.8V13.5a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V2.5a1 1 0 0 1 1-1z"
        fill="#f8fafc"
        stroke="#cbd5e1"
        strokeWidth="0.6"
      />
      <path d="M9.5 1.5V4.8H13" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" />
      <path d="M5.5 8h5M5.5 10h3.5" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />
    </>
  ),
};

export function WorkspaceFileIcon({ fileName, className = '' }: WorkspaceFileIconProps) {
  const kind = getWorkspaceFileIconKind(fileName);
  const render = ICON_RENDERERS[kind];

  return (
    <span className={`ws-file-icon ws-file-icon--${kind} ${className}`.trim()} aria-hidden>
      <svg viewBox="0 0 16 16" width={16} height={16}>
        {render()}
      </svg>
    </span>
  );
}
