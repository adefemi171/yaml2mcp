import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ConfigParser } from '../configParser';
import { McpYamlConfig } from '../types';

suite('ConfigParser Tests', () => {
  let tempDir: string;

  setup(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yaml2mcp-test-'));
  });

  teardown(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('should load valid YAML config', () => {
    const configPath = path.join(tempDir, 'mcp.yaml');
    const yamlContent = `version: "1.0"
servers:
  test-server:
    type: stdio
    command: node
    args:
      - server.js
    env:
      NODE_ENV: test
inputs: []
`;
    fs.writeFileSync(configPath, yamlContent, 'utf8');

    const config = ConfigParser.loadYamlConfig(configPath);
    assert.ok(config);
    assert.strictEqual(config.version, '1.0');
    assert.ok(config.servers);
    assert.ok(config.servers['test-server']);
    assert.strictEqual(config.servers['test-server'].type, 'stdio');
    if (config.servers['test-server'].type === 'stdio') {
      assert.strictEqual(config.servers['test-server'].command, 'node');
    }
    assert.ok(Array.isArray(config.inputs));
  });

  test('should return null for non-existent file', () => {
    const config = ConfigParser.loadYamlConfig('/nonexistent/path/mcp.yaml');
    assert.strictEqual(config, null);
  });

  test('should throw error for invalid YAML structure', () => {
    const configPath = path.join(tempDir, 'invalid.yaml');
    fs.writeFileSync(configPath, 'invalid: yaml: content:', 'utf8');

    assert.throws(() => {
      ConfigParser.loadYamlConfig(configPath);
    }, /Failed to parse YAML config/);
  });

  test('should create default config', () => {
    const config = ConfigParser.createDefaultConfig();
    assert.ok(config);
    assert.strictEqual(config.version, '1.0');
    assert.ok(config.servers);
    assert.strictEqual(typeof config.servers, 'object');
    assert.ok(config.servers['example-server']);
    assert.ok(Array.isArray(config.inputs));
  });

  test('should save YAML config', () => {
    const configPath = path.join(tempDir, 'output.yaml');
    const config: McpYamlConfig = {
      version: '1.0',
      servers: {
        test: {
          type: 'stdio',
          command: 'node',
          args: ['server.js']
        }
      },
      inputs: []
    };

    ConfigParser.saveYamlConfig(configPath, config);
    assert.ok(fs.existsSync(configPath));

    const loaded = ConfigParser.loadYamlConfig(configPath);
    assert.ok(loaded);
    assert.ok(loaded.servers.test);
  });
});

