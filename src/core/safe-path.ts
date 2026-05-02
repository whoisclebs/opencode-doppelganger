import path from 'node:path';

export interface SafePathOptions {
  root: string;
  relativePath: string;
  allowedRoots: readonly string[];
}

export function normalizeRelativePath(relativePath: string): string {
  return relativePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

export function assertSafeRelativePath(options: SafePathOptions): string {
  const normalized = normalizeRelativePath(options.relativePath);

  if (
    path.isAbsolute(normalized) ||
    normalized.startsWith('../') ||
    normalized === '..'
  ) {
    throw new Error(
      `Unsafe path outside project root: ${options.relativePath}`
    );
  }

  const firstSegment = normalized.split('/')[0];
  if (!options.allowedRoots.includes(firstSegment)) {
    throw new Error(
      `Path '${options.relativePath}' is not under allowed roots: ${options.allowedRoots.join(', ')}`
    );
  }

  const root = path.resolve(options.root);
  const absolute = path.resolve(root, normalized);
  const relativeFromRoot = path.relative(root, absolute);

  if (relativeFromRoot.startsWith('..') || path.isAbsolute(relativeFromRoot)) {
    throw new Error(
      `Resolved path escapes project root: ${options.relativePath}`
    );
  }

  return absolute;
}
