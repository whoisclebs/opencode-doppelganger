import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

export const defaultExcludedDirectories = new Set([
  '.git',
  'node_modules',
  '.doppelganger',
  '_doppelganger_sdd',
  'dist',
  'build',
  'coverage',
  '.cache',
]);

export interface ProjectSurface {
  root: string;
  files: string[];
  directories: string[];
  extensionCounts: Record<string, number>;
}

export async function scanProjectSurface(
  root: string
): Promise<ProjectSurface> {
  const files: string[] = [];
  const directories: string[] = [];
  const extensionCounts: Record<string, number> = {};

  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && defaultExcludedDirectories.has(entry.name))
        continue;

      const absolute = path.join(current, entry.name);
      const relative = path.relative(root, absolute).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        directories.push(relative);
        await walk(absolute);
        continue;
      }

      if ((await stat(absolute)).isFile()) {
        files.push(relative);
        const extension = path.extname(entry.name) || '[no extension]';
        extensionCounts[extension] = (extensionCounts[extension] ?? 0) + 1;
      }
    }
  }

  await walk(root);

  return {
    root,
    files: files.sort(),
    directories: directories.sort(),
    extensionCounts,
  };
}
