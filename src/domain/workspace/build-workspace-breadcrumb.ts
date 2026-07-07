export type WorkspaceBreadcrumbSegmentKind = 'root' | 'folder' | 'file';

export interface WorkspaceBreadcrumbSegment {
  label: string;
  folderPath: string;
  kind: WorkspaceBreadcrumbSegmentKind;
}

export function buildWorkspaceBreadcrumbSegments(
  workspaceName: string,
  relativePath: string,
): WorkspaceBreadcrumbSegment[] {
  const normalized = relativePath.replace(/\\/g, '/');
  const segments: WorkspaceBreadcrumbSegment[] = [
    { label: workspaceName, folderPath: '', kind: 'root' },
  ];

  const parts = normalized.split('/').filter(Boolean);
  if (parts.length === 0) return segments;

  const fileName = parts[parts.length - 1]!;
  const folderParts = parts.slice(0, -1);

  let cumulative = '';
  for (const part of folderParts) {
    cumulative = cumulative ? `${cumulative}/${part}` : part;
    segments.push({ label: part, folderPath: cumulative, kind: 'folder' });
  }

  segments.push({ label: fileName, folderPath: '', kind: 'file' });
  return segments;
}
