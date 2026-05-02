export interface OpencodeConfig {
  plugin?: string | string[];
  command?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface MergePluginResult {
  config: OpencodeConfig;
  changed: boolean;
}

export function mergePlugin(
  config: OpencodeConfig,
  packageName: string
): MergePluginResult {
  const next: OpencodeConfig = JSON.parse(
    JSON.stringify(config)
  ) as OpencodeConfig;
  const current = next.plugin;

  if (current === undefined) {
    next.plugin = [packageName];
    return { config: next, changed: true };
  }

  if (typeof current === 'string') {
    if (current === packageName) return { config: next, changed: false };
    next.plugin = [current, packageName];
    return { config: next, changed: true };
  }

  if (Array.isArray(current)) {
    if (current.includes(packageName)) return { config: next, changed: false };
    next.plugin = [...current, packageName];
    return { config: next, changed: true };
  }

  throw new Error('Unsupported opencode.json plugin field type');
}
