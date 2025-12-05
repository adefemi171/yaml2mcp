import * as fs from 'fs';
import * as path from 'path';
import { McpYamlConfig, McpJsonConfig, ServerConfig } from './types';

export class JsonTranspiler {
  static yamlToJson(yamlConfig: McpYamlConfig): McpJsonConfig {
    const jsonConfig: McpJsonConfig = {
      servers: {},
      inputs: yamlConfig.inputs || []
    };

    // Copy servers object directly (already in correct format)
    for (const [serverName, serverConfig] of Object.entries(yamlConfig.servers)) {
      jsonConfig.servers[serverName] = { ...serverConfig };
    }

    return jsonConfig;
  }

  static writeJsonConfig(filePath: string, jsonConfig: McpJsonConfig): void {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const jsonContent = JSON.stringify(jsonConfig, null, 2);
      fs.writeFileSync(filePath, jsonContent, 'utf8');
    } catch (error: any) {
      throw new Error(`Failed to write JSON config: ${error.message}`);
    }
  }

  static updateJsonWithRunningServers(
    filePath: string,
    yamlConfig: McpYamlConfig,
    runningServerNames: Set<string>
  ): void {
    // Filter servers to only include running ones
    const filteredServers: Record<string, ServerConfig> = {};
    for (const [serverName, serverConfig] of Object.entries(yamlConfig.servers)) {
      if (runningServerNames.has(serverName)) {
        filteredServers[serverName] = serverConfig;
      }
    }

    const filteredConfig: McpYamlConfig = {
      ...yamlConfig,
      servers: filteredServers
    };

    const jsonConfig = this.yamlToJson(filteredConfig);
    this.writeJsonConfig(filePath, jsonConfig);
  }

  static readJsonConfig(filePath: string): McpJsonConfig | null {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const fileContents = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContents) as McpJsonConfig;
    } catch (error: any) {
      throw new Error(`Failed to read JSON config: ${error.message}`);
    }
  }
}
