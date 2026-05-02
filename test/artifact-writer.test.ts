import { describe, expect, test } from 'bun:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import {
  createInitialArtifacts,
  writeTextArtifact,
} from '../src/core/artifact-writer';

async function tempProject(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), 'opencode-doppelganger-'));
}

describe('artifact writer', () => {
  test('creates initial artifacts only in allowed output folders', async () => {
    const root = await tempProject();

    try {
      const files = await createInitialArtifacts({ root, projectName: 'demo' });

      expect(files).toContain('.doppelganger/state.json');
      expect(files).toContain('_doppelganger_sdd/inventory.md');

      const state = await readFile(
        path.join(root, '.doppelganger/state.json'),
        'utf8'
      );
      expect(state).toContain('"project": "demo"');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  test('rejects writes outside allowed roots', async () => {
    const root = await tempProject();

    try {
      await expect(
        writeTextArtifact({
          root,
          relativePath: 'src/index.ts',
          content: 'unsafe',
        })
      ).rejects.toThrow('allowed roots');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  test('does not overwrite existing artifacts by default', async () => {
    const root = await tempProject();

    try {
      const target = path.join(root, '_doppelganger_sdd/inventory.md');
      await Bun.write(target, 'user content');

      await writeTextArtifact({
        root,
        relativePath: '_doppelganger_sdd/inventory.md',
        content: 'new content',
      });

      await expect(readFile(target, 'utf8')).resolves.toBe('user content');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
