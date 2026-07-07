import { hasReadWritePermission } from './file-system-permission';

export { isLikelyTextFile, getFileExtension, TEXT_FILE_EXTENSIONS } from './text-file-types';

export async function readFileHandleText(handle: FileSystemFileHandle): Promise<string> {
  const file = await handle.getFile();
  return file.text();
}

export async function writeFileHandleText(handle: FileSystemFileHandle, content: string): Promise<void> {
  if ((await hasReadWritePermission(handle)) !== true) {
    throw new Error('Write permission is missing. Re-open the file from the workspace tree.');
  }

  const writable = await handle.createWritable();
  try {
    await writable.write(content);
  } finally {
    await writable.close();
  }
}
