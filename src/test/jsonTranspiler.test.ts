import * as assert from 'assert';
import { JsonTranspiler } from '../jsonTranspiler';
import { McpYamlConfig } from '../types';

suite('JsonTranspiler Tests', () => {
  test('should convert YAML config to JSON format', () => {
    const yamlConfig: McpYamlConfig = {
      version: '1.0',
      servers: [
        {
          name: 'server1',
          command: 'node',
          args: ['server.js'],
          env: { NODE_ENV: 'production' },
          cwd: './server'
        },
        {
          name: 'server2',
          command: 'python',
          args: ['-m', 'mcp_server']
        }
      ]
    };

    const jsonConfig = JsonTranspiler.yamlToJson(yamlConfig);

    assert.ok(jsonConfig.mcpServers);
    assert.ok(jsonConfig.mcpServers.server1);
    assert.strictEqual(jsonConfig.mcpServers.server1.command, 'node');
    assert.deepStrictEqual(jsonConfig.mcpServers.server1.args, ['server.js']);
    assert.strictEqual(jsonConfig.mcpServers.server1.env?.NODE_ENV, 'production');
    assert.strictEqual(jsonConfig.mcpServers.server1.cwd, './server');

    assert.ok(jsonConfig.mcpServers.server2);
    assert.strictEqual(jsonConfig.mcpServers.server2.command, 'python');
  });

  test('should filter servers by running status', () => {
    const yamlConfig: McpYamlConfig = {
      version: '1.0',
      servers: [
        { name: 'server1', command: 'node', args: ['server.js'] },
        { name: 'server2', command: 'python', args: ['-m', 'mcp'] },
        { name: 'server3', command: 'npm', args: ['start'] }
      ]
    };

    const runningServers = new Set(['server1', 'server3']);
    const jsonConfig = JsonTranspiler.yamlToJson({
      ...yamlConfig,
      servers: yamlConfig.servers.filter(s => runningServers.has(s.name))
    });

    assert.ok(jsonConfig.mcpServers.server1);
    assert.ok(jsonConfig.mcpServers.server3);
    assert.strictEqual(jsonConfig.mcpServers.server2, undefined);
  });

  test('should handle optional fields', () => {
    const yamlConfig: McpYamlConfig = {
      version: '1.0',
      servers: [
        {
          name: 'minimal',
          command: 'node'
        }
      ]
    };

    const jsonConfig = JsonTranspiler.yamlToJson(yamlConfig);
    assert.ok(jsonConfig.mcpServers.minimal);
    assert.strictEqual(jsonConfig.mcpServers.minimal.command, 'node');
    assert.strictEqual(jsonConfig.mcpServers.minimal.args, undefined);
    assert.strictEqual(jsonConfig.mcpServers.minimal.env, undefined);
  });
});

