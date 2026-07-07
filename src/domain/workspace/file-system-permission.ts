type FsPermissionMode = 'read' | 'readwrite';

type FsPermissionHandle = {
  queryPermission: (descriptor: { mode: FsPermissionMode }) => Promise<PermissionState>;
  requestPermission: (descriptor: { mode: FsPermissionMode }) => Promise<PermissionState>;
};

const READ_WRITE = { mode: 'readwrite' as const };

function asPermissionHandle(handle: FileSystemHandle): FsPermissionHandle {
  return handle as unknown as FsPermissionHandle;
}

/** Ensure read-write access; call during a user gesture (folder pick, file open). */
export async function ensureReadWritePermission(handle: FileSystemHandle): Promise<void> {
  const permission = asPermissionHandle(handle);
  if ((await permission.queryPermission(READ_WRITE)) === 'granted') return;

  const next = await permission.requestPermission(READ_WRITE);
  if (next !== 'granted') {
    throw new Error('Write permission was not granted.');
  }
}

/** Returns true when write can proceed without showing a permission prompt. */
export async function hasReadWritePermission(handle: FileSystemHandle): Promise<boolean> {
  return (await asPermissionHandle(handle).queryPermission(READ_WRITE)) === 'granted';
}
