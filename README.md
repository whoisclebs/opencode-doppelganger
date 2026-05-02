# opencode-doppelganger

OpenCode plugin that generates reconstruction-ready specifications for the current project.

## Install from GitHub Packages

The package is scoped for GitHub Packages:

```json
{
  "plugin": ["@whoisclebs/opencode-doppelganger"]
}
```

## Use

Inside OpenCode, run:

```text
/doppelganger
```

The command creates initial artifacts in:

- `.doppelganger/`
- `_doppelganger_sdd/`

The plugin must not modify analyzed project files outside those output folders during analysis.

## Development

```bash
bun install
bun test
bun run build
bun run typecheck
```

## Publishing

Releases are managed by Release Please. Published GitHub releases trigger `.github/workflows/publish.yml`, which publishes `@whoisclebs/opencode-doppelganger` to GitHub Packages using `GITHUB_TOKEN`.
