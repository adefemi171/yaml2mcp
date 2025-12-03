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
  - name: test-server
    command: node
    args:
      - server.js
    env:
      NODE_ENV: test
`;
    fs.writeFileSync(configPath, yamlContent, 'utf8');

    const config = ConfigParser.loadYamlConfig(configPath);
    assert.ok(config);
    assert.strictEqual(config.version, '1.0');
    assert.strictEqual(config.servers.length, 1);
    assert.strictEqual(config.servers[0].name, 'test-server');
    assert.strictEqual(config.servers[0].command, 'node');
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
    assert.ok(Array.isArray(config.servers));
    assert.strictEqual(config.servers.length, 1);
  });

  test('should save YAML config', () => {
    const configPath = path.join(tempDir, 'output.yaml');
    const config: McpYamlConfig = {
      version: '1.0',
      servers: [
        {
          name: 'test',
          command: 'node',
          args: ['server.js']
        }
      ]
    };

    ConfigParser.saveYamlConfig(configPath, config);
    assert.ok(fs.existsSync(configPath));

    const loaded = ConfigParser.loadYamlConfig(configPath);
    assert.ok(loaded);
    assert.strictEqual(loaded.servers.length, 1);
  });
});

