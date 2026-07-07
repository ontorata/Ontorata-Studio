interface WorkspacePanelIconProps {
  className?: string;
}

export function WorkspaceIconNewFile({ className = '' }: WorkspacePanelIconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" width={16} height={16} aria-hidden>
      <path
        d="M12.5 2H5.707L4.5.793 4.207.5H2.5A1.5 1.5 0 0 0 1 2v12a1.5 1.5 0 0 0 1.5 1.5h10A1.5 1.5 0 0 0 14 14V3.5A1.5 1.5 0 0 0 12.5 2zm0 1a.5.5 0 0 1 .5.5V14a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5h1.293L4.207 2.5 4.5 2.793 5.707 4H12.5zM8 6.5v3H5.5v1H8v3h1v-3h2.5v-1H9v-3H8z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WorkspaceIconNewFolder({ className = '' }: WorkspacePanelIconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" width={16} height={16} aria-hidden>
      <path
        d="M6.5 2h2.707L10.207.5 10.5 1h3A1.5 1.5 0 0 1 15 2.5v11A1.5 1.5 0 0 1 13.5 15h-11A1.5 1.5 0 0 1 1 13.5v-9A1.5 1.5 0 0 1 2.5 3H6.5zm0 1H2.5a.5.5 0 0 0-.5.5V13.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5H10.5l-.793-.793L9.207 2H6.5zm4.25 5.75v1H8v1h2.75v1h1v-1H14v-1h-2.25V9.5h-1z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WorkspaceIconRefresh({ className = '' }: WorkspacePanelIconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" width={16} height={16} aria-hidden>
      <path
        d="M8 2.5a5.5 5.5 0 0 0-4.78 2.75H1v1h3.21A5.5 5.5 0 1 0 8 2.5zm0 1a4.5 4.5 0 1 1-3.88 6.75H5.5V9H2.5v3h3v-1H4.4A4.5 4.5 0 0 0 8 3.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WorkspaceIconCollapseAll({ className = '' }: WorkspacePanelIconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" width={16} height={16} aria-hidden>
      <path
        d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8a1.5 1.5 0 0 1 1.5 1.5v2A1.5 1.5 0 0 1 12 7H4A1.5 1.5 0 0 1 2.5 5.5v-2zM4 3a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-2A.5.5 0 0 0 12 3H4zm8.5 6A1.5 1.5 0 0 1 14 10.5v2A1.5 1.5 0 0 1 12.5 14h-9A1.5 1.5 0 0 1 2 12.5v-2A1.5 1.5 0 0 1 3.5 9h9zm-9 1a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-9z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WorkspaceIconRename({ className = '' }: WorkspacePanelIconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" width={14} height={14} aria-hidden>
      <path
        d="M11.853 2.146a.5.5 0 0 1 .707 0l1.294 1.294a.5.5 0 0 1 0 .708L5.707 12.293 3 13l.707-2.707 9.146-9.147zM4.09 11.41l.55-.183 6.12-6.12.183-.55-.733-.733-.55.183-6.12 6.12-.183.55.733.733z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WorkspaceIconTrash({ className = '' }: WorkspacePanelIconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" width={14} height={14} aria-hidden>
      <path
        d="M6.5 2.5h3l.5 1H14v1H2V3.5h3.5l.5-1zM3.5 5.5h9l-.75 8.25A1.25 1.25 0 0 1 10.5 15h-5a1.25 1.25 0 0 1-1.24-1.25L3.5 5.5zm1.6 1 .65 7h4.5l.65-7H5.1z"
        fill="currentColor"
      />
    </svg>
  );
}
