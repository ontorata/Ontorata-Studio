export interface PickedWorkspaceFolder {
  name: string;
  handle: FileSystemDirectoryHandle | null;
}

/** Pick a local workspace folder via the File System Access API (with fallback). */
export async function pickWorkspaceFolder(): Promise<PickedWorkspaceFolder | null> {
  if ('showDirectoryPicker' in window) {
    try {
      const handle = await (
        window as Window & {
          showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
        }
      ).showDirectoryPicker();
      return { name: handle.name, handle };
    } catch {
      return null;
    }
  }
  return { name: 'Ontorata Studio', handle: null };
}
