import { describe, expect, test } from 'bun:test';
import { mergePlugin } from '../src/core/opencode-config-merge';

const packageName = '@whoisclebs/opencode-doppelganger';

describe('mergePlugin', () => {
  test('adds plugin field when missing', () => {
    const result = mergePlugin({ model: 'test-model' }, packageName);

    expect(result.changed).toBe(true);
    expect(result.config).toEqual({
      model: 'test-model',
      plugin: [packageName],
    });
  });

  test('preserves existing string plugin and appends package', () => {
    const result = mergePlugin({ plugin: 'existing-plugin' }, packageName);

    expect(result.changed).toBe(true);
    expect(result.config.plugin).toEqual(['existing-plugin', packageName]);
  });

  test('does not duplicate plugin in array', () => {
    const result = mergePlugin({ plugin: [packageName] }, packageName);

    expect(result.changed).toBe(false);
    expect(result.config.plugin).toEqual([packageName]);
  });

  test('preserves unrelated configuration fields', () => {
    const input = {
      $schema: 'https://opencode.ai/config.json',
      permission: { edit: 'ask' },
      command: { test: { template: 'hello' } },
    };

    const result = mergePlugin(input, packageName);

    expect(result.config.$schema).toBe(input.$schema);
    expect(result.config.permission).toEqual(input.permission);
    expect(result.config.command).toEqual(input.command);
  });
});
