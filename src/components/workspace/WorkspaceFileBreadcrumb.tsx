import { buildWorkspaceBreadcrumbSegments } from '../../domain/workspace/build-workspace-breadcrumb';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';
import { WorkspaceFileIcon } from './WorkspaceFileIcon';

interface WorkspaceFileBreadcrumbProps {
  workspaceName: string;
  relativePath: string;
}

export function WorkspaceFileBreadcrumb({ workspaceName, relativePath }: WorkspaceFileBreadcrumbProps) {
  const { focusWorkspaceFolderPath } = useWorkspaceTabs();
  const segments = buildWorkspaceBreadcrumbSegments(workspaceName, relativePath);
  const fullPath = segments.map((segment) => segment.label).join('/');

  return (
    <nav className="ws-file-breadcrumb" aria-label="File path" title={fullPath}>
      <ol className="ws-file-breadcrumb-list">
        {segments.map((segment, index) => {
          const isFile = segment.kind === 'file';

          return (
            <li key={`${segment.kind}-${segment.folderPath}-${segment.label}`} className="ws-file-breadcrumb-item">
              {index > 0 && <span className="ws-file-breadcrumb-sep" aria-hidden>›</span>}
              {isFile ? (
                <span className="ws-file-breadcrumb-current">
                  <WorkspaceFileIcon fileName={segment.label} className="ws-file-breadcrumb-icon" />
                  <span className="ws-file-breadcrumb-label">{segment.label}</span>
                </span>
              ) : (
                <button
                  type="button"
                  className={`ws-file-breadcrumb-link${segment.kind === 'root' ? ' ws-file-breadcrumb-root' : ''}`}
                  onClick={() => focusWorkspaceFolderPath(segment.folderPath)}
                  title={segment.folderPath || workspaceName}
                >
                  {segment.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
