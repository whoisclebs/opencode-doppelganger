import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { addFileToManifest } from './manifest';
import { assertSafeRelativePath } from './safe-path';

export const analysisAllowedRoots = [
  '.doppelganger',
  '_doppelganger_sdd',
] as const;
export const installAllowedRoots = [
  '.opencode',
  '.doppelganger',
  '_doppelganger_sdd',
] as const;

export interface WriteTextOptions {
  root: string;
  relativePath: string;
  content: string;
  allowedRoots?: readonly string[];
  overwrite?: boolean;
  trackManifest?: boolean;
}

export async function writeTextArtifact(
  options: WriteTextOptions
): Promise<'created' | 'overwritten'> {
  const absolute = assertSafeRelativePath({
    root: options.root,
    relativePath: options.relativePath,
    allowedRoots: options.allowedRoots ?? analysisAllowedRoots,
  });

  await mkdir(path.dirname(absolute), { recursive: true });

  if (!options.overwrite && (await Bun.file(absolute).exists())) {
    return 'created';
  }

  await writeFile(absolute, options.content, 'utf8');

  if (options.trackManifest !== false) {
    await addFileToManifest(options.root, options.relativePath);
  }

  return options.overwrite ? 'overwritten' : 'created';
}

export interface InitialArtifactOptions {
  root: string;
  projectName?: string;
  docLanguage?: string;
  docLevel?: 'essencial' | 'completo' | 'detalhado';
}

export async function createInitialArtifacts(
  options: InitialArtifactOptions
): Promise<string[]> {
  const projectName = options.projectName ?? path.basename(options.root);
  const docLanguage = options.docLanguage ?? 'Português';
  const docLevel = options.docLevel ?? 'essencial';
  const created: string[] = [];

  const state = {
    version: '0.1.0',
    project: projectName,
    chat_language: 'pt-br',
    doc_language: docLanguage,
    doc_level: docLevel,
    output_folder: '_doppelganger_sdd',
    phase: 'reconhecimento',
    completed: [],
    pending: [
      'reconhecimento',
      'escavacao',
      'interpretacao',
      'geracao',
      'revisao',
    ],
    checkpoints: {},
    created_files: [],
    generator: 'opencode-doppelganger',
  };

  const files: Record<string, string> = {
    '.doppelganger/state.json': `${JSON.stringify(state, null, 2)}\n`,
    '.doppelganger/context/surface.json': `${JSON.stringify({ generated_at: new Date().toISOString(), modules: [] }, null, 2)}\n`,
    '_doppelganger_sdd/inventory.md': `# Inventário — ${projectName}\n\n🟡 INFERIDO — Inventário inicial criado pelo scaffold do opencode-doppelganger.\n`,
    '_doppelganger_sdd/dependencies.md': `# Dependências — ${projectName}\n\n🔴 LACUNA — Dependências ainda não analisadas em profundidade.\n`,
  };

  for (const [relativePath, content] of Object.entries(files)) {
    await writeTextArtifact({
      root: options.root,
      relativePath,
      content,
      overwrite: false,
    });
    created.push(relativePath);
  }

  return created;
}
