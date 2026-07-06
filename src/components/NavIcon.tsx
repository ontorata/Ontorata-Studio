import type { NavIconName } from '../config/navigation';

const paths: Record<NavIconName, string> = {
  home: 'M3 10.5L12 4l9 6.5V19a1.5 1.5 0 01-1.5 1.5H15v-5.5H9V20.5H4.5A1.5 1.5 0 013 19v-8.5z',
  memory:
    'M5 5.5h14v13H5V5.5zm2 2v9h10v-9H7zm2 2h6v2H9v-2zm0 3h4v2H9v-2z',
  search: 'M10.5 4a6.5 6.5 0 104.09 11.59l3.52 3.52 1.06-1.06-3.52-3.52A6.5 6.5 0 0010.5 4zm0 2a4.5 4.5 0 110 9 4.5 4.5 0 010-9z',
  graph:
    'M6 18V8.5l4-2.3L14 8.5V18h2V7.2l-6-3.46L4 7.2V18h2zm2 0v-5h2v5H8zm4 0v-3h2v3h-2z',
  knowledge:
    'M5 6.5h14v11H5v-11zm2 2v7h10v-7H7zm2 1.5h6v1.5H9V10zm0 3h4v1.5H9V13z',
  chat: 'M5 5.5h14v8H9l-3 3v-3H5v-8zm2 2v4h10v-4H7zm2 1.5h6v1.5H9V9z',
  agents:
    'M8 5.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm8 0a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM4 17.5c0-2.2 2.5-3.5 5-3.5s5 1.3 5 3.5v1H4v-1zm10 0c.3-1.4 2.2-2.5 4-2.5 1.9 0 3.5.9 3.5 2.5v1h-7.5v-1z',
  mcp: 'M6 7.5h12v9H6v-9zm2 2v5h8v-5H8zm1.5 1.5h5v2h-5v-2z',
  profiles: 'M10 5.5a3 3 0 110 6 3 3 0 010-6zm-5 12c0-2.8 3.1-4.5 5-4.5s5 1.7 5 4.5v1H5v-1z',
  stacks:
    'M5 8.5l7-3.5 7 3.5-7 3.5-7-3.5zm0 4.5l7 3.5 7-3.5M5 17.5l7 3.5 7-3.5',
  composer:
    'M5 6.5h14v2H5v-2zm0 4h10v2H5v-2zm0 4h6v2H5v-2zm9.5-1.5L18 16l-3.5 2v-4z',
  models:
    'M6 8.5h12v7H6v-7zm2 2v3h8v-3H8zm-1 6.5h12v2H7v-2z',
  code: 'M8.5 7.5L5 11l3.5 3.5 1-1.1L7.1 11l2.4-2.4-1-1.1zm7 0l-1 1.1 2.4 2.4-2.4 2.4 1 1.1L19 11l-3.5-3.5z',
  workspaces:
    'M4 6.5h7v5H4v-5zm9 0h7v5h-7v-5zM4 13.5h7v5H4v-5zm9 0h7v5h-7v-5z',
  organization:
    'M5 6.5h14v11H5v-11zm2 2v7h4v-7H7zm6 0v7h4v-7h-4z',
  security:
    'M12 4.5l7 3.5v5c0 4.2-3 6.8-7 8.5-4-1.7-7-4.3-7-8.5v-5l7-3.5zm0 2.3L7 8.9v4.1c0 3 2.1 5 5 6.4 2.9-1.4 5-3.4 5-6.4V8.9l-5-2.1z',
  health:
    'M12 5.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zm0 2a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm-.75 2.25v2.5l2.15 1.25.75-1.25-1.4-.8V9.75h-1.5z',
  deployment:
    'M6 7.5h12v9H6v-9zm2 2v5h8v-5H8zm1.5 1.5h5v2h-5v-2z',
};

interface NavIconProps {
  name: NavIconName;
  className?: string;
}

export function NavIcon({ name, className = '' }: NavIconProps) {
  return (
    <svg
      className={`nav-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      width={18}
      height={18}
      aria-hidden
    >
      <path d={paths[name]} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
