import { describe, expect, test } from 'bun:test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtemp } from 'node:fs/promises';
import { scanProjectSurface } from '../src/core/project-scout';

describe('scanProjectSurface', () => {
  test('excludes generated and dependency folders', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'opencode-scout-'));

    try {
      await mkdir(path.join(root, 'src'), { recursive: true });
      await mkdir(path.join(root, 'node_modules/pkg'), { recursive: true });
      await mkdir(path.join(root, '_doppelganger_sdd'), { recursive: true });
      await writeFile(path.join(root, 'src/index.ts'), 'export {}', 'utf8');
      await writeFile(path.join(root, 'node_modules/pkg/index.js'), '', 'utf8');
      await writeFile(
        path.join(root, '_doppelganger_sdd/inventory.md'),
        '',
        'utf8'
      );

      const surface = await scanProjectSurface(root);

      expect(surface.files).toEqual(['src/index.ts']);
      expect(surface.extensionCounts['.ts']).toBe(1);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
