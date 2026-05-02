import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type FileManifest = Record<string, string>;

export const manifestPath = '.doppelganger/_config/files-manifest.json';

export function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

export async function loadManifest(root: string): Promise<FileManifest> {
  try {
    const content = await readFile(path.join(root, manifestPath), 'utf8');
    return JSON.parse(content) as FileManifest;
  } catch {
    return {};
  }
}

export async function saveManifest(
  root: string,
  manifest: FileManifest
): Promise<void> {
  const absolute = path.join(root, manifestPath);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

export async function addFileToManifest(
  root: string,
  relativePath: string
): Promise<void> {
  const manifest = await loadManifest(root);
  const content = await readFile(path.join(root, relativePath));
  manifest[relativePath.replace(/\\/g, '/')] = sha256(content);
  await saveManifest(root, manifest);
}
