import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { McpYamlConfig, ServerConfig } from './types';

export class ConfigParser {
  static loadYamlConfig(filePath: string): McpYamlConfig | null {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const fileContents = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(fileContents) as any;

      if (!data) {
        throw new Error('Invalid YAML structure: empty file');
      }

      // Ensure servers is an object
      if (!data.servers || typeof data.servers !== 'object' || Array.isArray(data.servers)) {
        throw new Error('Invalid YAML structure: expected "servers" to be an object');
      }

      // Ensure inputs is an array (or initialize as empty array)
      if (data.inputs === undefined) {
        data.inputs = [];
      } else if (!Array.isArray(data.inputs)) {
        throw new Error('Invalid YAML structure: expected "inputs" to be an array');
      }

      return data as McpYamlConfig;
    } catch (error: any) {
      throw new Error(`Failed to parse YAML config: ${error.message}`);
    }
  }

  static saveYamlConfig(filePath: string, config: McpYamlConfig): void {
    try {
      const yamlContent = yaml.dump(config, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false,
        flowLevel: -1
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
      servers: {
        'example-server': {
          type: 'stdio',
          command: 'node',
          args: [
            '-e',
            "console.log('MCP Server Running'); setInterval(() => {}, 1000);"
          ],
          env: {}
        }
      },
      inputs: []
    };
  }
}
