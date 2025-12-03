import * as fs from 'fs';
import * as path from 'path';
import { McpYamlConfig, McpJsonConfig } from './types';

export class JsonTranspiler {
  static yamlToJson(yamlConfig: McpYamlConfig): McpJsonConfig {
    const jsonConfig: McpJsonConfig = {
      mcpServers: {}
    };

    for (const server of yamlConfig.servers) {
      jsonConfig.mcpServers[server.name] = {
        command: server.command,
        ...(server.args && { args: server.args }),
        ...(server.env && { env: server.env }),
        ...(server.cwd && { cwd: server.cwd })
      };
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
    const filteredConfig: McpYamlConfig = {
      ...yamlConfig,
      servers: yamlConfig.servers.filter(server =>
        runningServerNames.has(server.name)
      )
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
