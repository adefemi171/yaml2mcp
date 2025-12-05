// Server configuration for stdio type
export interface StdioServerConfig {
  type: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
  disabled?: boolean;
  autoApprove?: string[];
  disabledTools?: string[];
}

// Server configuration for http type
export interface HttpServerConfig {
  type: 'http';
  url: string;
  disabled?: boolean;
  autoApprove?: string[];
  disabledTools?: string[];
}

// Union type for server configs
export type ServerConfig = StdioServerConfig | HttpServerConfig;

// YAML config structure (servers as object with server names as keys)
export interface McpYamlConfig {
  servers: Record<string, ServerConfig>;
  inputs?: any[];
  version?: string;
}

// JSON config structure (matches MCP server format)
export interface McpJsonConfig {
  servers: Record<string, ServerConfig>;
  inputs?: any[];
}

// Internal representation with name for processing
export interface McpServerConfig {
  name: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  type?: 'stdio' | 'http';
  url?: string;
  disabled?: boolean;
  autoApprove?: string[];
  disabledTools?: string[];
}

export interface ServerStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  process?: any;
  error?: string;
}
