export interface McpServerConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
}

export interface McpYamlConfig {
  servers: McpServerConfig[];
  version?: string;
}

export interface McpJsonConfig {
  mcpServers: Record<string, {
    command: string;
    args?: string[];
    env?: Record<string, string>;
    cwd?: string;
  }>;
}

export interface ServerStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  process?: any;
  error?: string;
}
