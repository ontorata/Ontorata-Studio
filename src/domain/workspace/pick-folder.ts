/** Pick a local workspace folder via the File System Access API (with fallback). */
export async function pickWorkspaceFolder(): Promise<string | null> {
  if ('showDirectoryPicker' in window) {
    try {
      const handle = await (
        window as Window & {
          showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
        }
      ).showDirectoryPicker();
      return handle.name;
    } catch {
      return null;
    }
  }
  return 'Ontorata Studio';
}
