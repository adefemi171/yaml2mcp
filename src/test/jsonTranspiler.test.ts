import * as assert from 'assert';
import { JsonTranspiler } from '../jsonTranspiler';
import { McpYamlConfig } from '../types';

suite('JsonTranspiler Tests', () => {
  test('should convert YAML config to JSON format', () => {
    const yamlConfig: McpYamlConfig = {
      version: '1.0',
      servers: {
        server1: {
          type: 'stdio',
          command: 'node',
          args: ['server.js'],
          env: { NODE_ENV: 'production' }
        },
        server2: {
          type: 'stdio',
          command: 'python',
          args: ['-m', 'mcp_server']
        }
      },
      inputs: []
    };

    const jsonConfig = JsonTranspiler.yamlToJson(yamlConfig);

    assert.ok(jsonConfig.servers);
    assert.ok(jsonConfig.servers.server1);
    assert.strictEqual(jsonConfig.servers.server1.type, 'stdio');
    if (jsonConfig.servers.server1.type === 'stdio') {
      assert.strictEqual(jsonConfig.servers.server1.command, 'node');
      assert.deepStrictEqual(jsonConfig.servers.server1.args, ['server.js']);
      assert.strictEqual(jsonConfig.servers.server1.env?.NODE_ENV, 'production');
    }

    assert.ok(jsonConfig.servers.server2);
    assert.strictEqual(jsonConfig.servers.server2.type, 'stdio');
    if (jsonConfig.servers.server2.type === 'stdio') {
      assert.strictEqual(jsonConfig.servers.server2.command, 'python');
    }
    assert.ok(Array.isArray(jsonConfig.inputs));
  });

  test('should filter servers by running status', () => {
    const yamlConfig: McpYamlConfig = {
      version: '1.0',
      servers: {
        server1: { type: 'stdio', command: 'node', args: ['server.js'] },
        server2: { type: 'stdio', command: 'python', args: ['-m', 'mcp'] },
        server3: { type: 'stdio', command: 'npm', args: ['start'] }
      },
      inputs: []
    };

    const runningServers = new Set(['server1', 'server3']);
    const filteredServers: Record<string, any> = {};
    for (const [name, config] of Object.entries(yamlConfig.servers)) {
      if (runningServers.has(name)) {
        filteredServers[name] = config;
      }
    }
    const jsonConfig = JsonTranspiler.yamlToJson({
      ...yamlConfig,
      servers: filteredServers
    });

    assert.ok(jsonConfig.servers.server1);
    assert.ok(jsonConfig.servers.server3);
    assert.strictEqual(jsonConfig.servers.server2, undefined);
  });

  test('should handle optional fields', () => {
    const yamlConfig: McpYamlConfig = {
      version: '1.0',
      servers: {
        minimal: {
          type: 'stdio',
          command: 'node'
        }
      },
      inputs: []
    };

    const jsonConfig = JsonTranspiler.yamlToJson(yamlConfig);
    assert.ok(jsonConfig.servers.minimal);
    assert.strictEqual(jsonConfig.servers.minimal.type, 'stdio');
    if (jsonConfig.servers.minimal.type === 'stdio') {
      assert.strictEqual(jsonConfig.servers.minimal.command, 'node');
      assert.strictEqual(jsonConfig.servers.minimal.args, undefined);
      assert.strictEqual(jsonConfig.servers.minimal.env, undefined);
    }
  });

  test('should handle HTTP server type', () => {
    const yamlConfig: McpYamlConfig = {
      version: '1.0',
      servers: {
        httpServer: {
          type: 'http',
          url: 'http://localhost:8000'
        }
      },
      inputs: []
    };

    const jsonConfig = JsonTranspiler.yamlToJson(yamlConfig);
    assert.ok(jsonConfig.servers.httpServer);
    assert.strictEqual(jsonConfig.servers.httpServer.type, 'http');
    if (jsonConfig.servers.httpServer.type === 'http') {
      assert.strictEqual(jsonConfig.servers.httpServer.url, 'http://localhost:8000');
    }
  });

  test('should handle mixed stdio and http servers', () => {
    const yamlConfig: McpYamlConfig = {
      version: '1.0',
      servers: {
        stdioServer: {
          type: 'stdio',
          command: 'node',
          args: ['server.js']
        },
        httpServer: {
          type: 'http',
          url: 'http://localhost:8000'
        }
      },
      inputs: []
    };

    const jsonConfig = JsonTranspiler.yamlToJson(yamlConfig);
    assert.ok(jsonConfig.servers.stdioServer);
    assert.ok(jsonConfig.servers.httpServer);
    assert.strictEqual(jsonConfig.servers.stdioServer.type, 'stdio');
    assert.strictEqual(jsonConfig.servers.httpServer.type, 'http');
  });
});

