import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { McpYamlConfig, McpServerConfig } from './types';

export class ConfigParser {
  static loadYamlConfig(filePath: string): McpYamlConfig | null {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const fileContents = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(fileContents) as McpYamlConfig;

      if (!data || !Array.isArray(data.servers)) {
        throw new Error('Invalid YAML structure: expected "servers" array');
      }

      return data;
    } catch (error: any) {
      throw new Error(`Failed to parse YAML config: ${error.message}`);
    }
  }

  static saveYamlConfig(filePath: string, config: McpYamlConfig): void {
    try {
      const yamlContent = yaml.dump(config, {
        indent: 2,
        lineWidth: -1,
        noRefs: true
      });

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, yamlContent, 'utf8');
    } catch (error: any) {
      throw new Error(`Failed to save YAML config: ${error.message}`);
    }
  }

  static createDefaultConfig(): McpYamlConfig {
    return {
      version: '1.0',
      servers: [
        {
          name: 'example-server',
          command: 'node',
          args: ['server.js'],
          env: {}
        }
      ]
    };
  }
}
