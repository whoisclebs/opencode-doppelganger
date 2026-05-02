import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin';
import { createInitialArtifacts } from './core/artifact-writer';

const commandTemplate = `Você é o opencode-doppelganger. Gere uma especificação do projeto atual já pensando em reconstrução/novo projeto.

Regras obrigatórias:
- Escreva somente em \`.doppelganger/\` e \`_doppelganger_sdd/\` durante a análise.
- Marque afirmações com 🟢 CONFIRMADO, 🟡 INFERIDO ou 🔴 LACUNA.
- Use a tool \`generate_doppelganger_spec\` para criar os artefatos iniciais determinísticos antes de aprofundar a análise.
- Preserve arquivos existentes e registre lacunas que precisem de validação humana.`;

export const DoppelgangerPlugin: Plugin = async ({ worktree, directory }) => {
  const projectRoot = worktree ?? directory;

  const generateDoppelgangerSpec = tool({
    description:
      'Create the initial .doppelganger and _doppelganger_sdd artifacts for the current project',
    args: {
      projectName: tool.schema
        .string()
        .optional()
        .describe('Project name to use in generated specs'),
      docLanguage: tool.schema
        .string()
        .optional()
        .describe('Language for generated documents'),
      docLevel: tool.schema
        .enum(['essencial', 'completo', 'detalhado'])
        .optional()
        .describe('Documentation depth'),
    },
    async execute(args) {
      const files = await createInitialArtifacts({
        root: projectRoot,
        projectName: args.projectName,
        docLanguage: args.docLanguage,
        docLevel: args.docLevel,
      });

      return JSON.stringify(
        {
          status: 'created',
          root: projectRoot,
          files,
        },
        null,
        2
      );
    },
  });

  return {
    tool: {
      generate_doppelganger_spec: generateDoppelgangerSpec,
    },
    async config(config) {
      config.command = config.command ?? {};
      config.command.doppelganger = {
        description:
          'Generate reconstruction-ready specifications for the current project',
        template: commandTemplate,
      };
    },
  };
};

export default DoppelgangerPlugin;
