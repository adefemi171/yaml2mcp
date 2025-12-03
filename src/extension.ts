import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigParser } from './configParser';
import { JsonTranspiler } from './jsonTranspiler';
import { ProcessManager } from './processManager';
import { McpTreeDataProvider, ServerTreeItem } from './treeDataProvider';
import { McpYamlConfig, McpServerConfig } from './types';

let processManager: ProcessManager;
let treeDataProvider: McpTreeDataProvider;
let configWatcher: vscode.FileSystemWatcher | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('YAML2MCP extension is now active');

  processManager = new ProcessManager();
  treeDataProvider = new McpTreeDataProvider(processManager);

  const treeView = vscode.window.createTreeView('yaml2mcp', {
    treeDataProvider: treeDataProvider,
    showCollapseAll: false
  });

  const config = vscode.workspace.getConfiguration('yaml2mcp');
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  
  let yamlPath: string | undefined;
  let jsonPath: string | undefined;
  
  if (workspaceFolder) {
    yamlPath = resolvePath(config.get<string>('configPath', '${workspaceFolder}/mcp.yaml'), workspaceFolder);
    jsonPath = resolvePath(config.get<string>('mcpJsonPath', '${workspaceFolder}/.vscode/mcp.json'), workspaceFolder);

    loadAndSyncConfig(yamlPath, jsonPath);
    setupConfigWatcher(yamlPath, jsonPath);
  } else {
    vscode.window.showInformationMessage('YAML2MCP: Open a workspace folder to use the extension');
    treeDataProvider.refresh();
  }

  const getPaths = (): { yamlPath: string; jsonPath: string } | null => {
    const currentWorkspace = vscode.workspace.workspaceFolders?.[0];
    if (!currentWorkspace) {
      vscode.window.showWarningMessage('YAML2MCP: Please open a workspace folder first');
      return null;
    }
    const yaml = resolvePath(config.get<string>('configPath', '${workspaceFolder}/mcp.yaml'), currentWorkspace);
    const json = resolvePath(config.get<string>('mcpJsonPath', '${workspaceFolder}/.vscode/mcp.json'), currentWorkspace);
    return { yamlPath: yaml, jsonPath: json };
  };

  const startCommand = vscode.commands.registerCommand('yaml2mcp.startServer', async (item: ServerTreeItem) => {
    if (!item || item.isPlaceholder) {
      return;
    }

    const paths = getPaths();
    if (!paths) return;
    await startServer(item.label, paths.yamlPath, paths.jsonPath);
  });

  const stopCommand = vscode.commands.registerCommand('yaml2mcp.stopServer', async (item: ServerTreeItem) => {
    if (!item || item.isPlaceholder) {
      return;
    }

    const paths = getPaths();
    if (!paths) return;
    await stopServer(item.label, paths.yamlPath, paths.jsonPath);
  });

  const refreshCommand = vscode.commands.registerCommand('yaml2mcp.refresh', () => {
    const paths = getPaths();
    if (!paths) return;
    loadAndSyncConfig(paths.yamlPath, paths.jsonPath);
    treeDataProvider.refresh();
  });

  const openConfigCommand = vscode.commands.registerCommand('yaml2mcp.openConfig', () => {
    const paths = getPaths();
    if (!paths) return;
    
    if (fs.existsSync(paths.yamlPath)) {
      vscode.window.showTextDocument(vscode.Uri.file(paths.yamlPath));
    } else {
      const defaultConfig = ConfigParser.createDefaultConfig();
      ConfigParser.saveYamlConfig(paths.yamlPath, defaultConfig);
      vscode.window.showTextDocument(vscode.Uri.file(paths.yamlPath));
      vscode.window.showInformationMessage('Created default MCP YAML configuration');
    }
  });

  context.subscriptions.push(
    treeView,
    startCommand,
    stopCommand,
    refreshCommand,
    openConfigCommand
  );

  if (configWatcher) {
    context.subscriptions.push(configWatcher);
  }
}

export function deactivate() {
  if (processManager) {
    processManager.stopAll();
  }
  configWatcher?.dispose();
}

function resolvePath(pathTemplate: string, workspaceFolder: vscode.WorkspaceFolder): string {
  return pathTemplate
    .replace(/\${workspaceFolder}/g, workspaceFolder.uri.fsPath)
    .replace(/\${workspaceRoot}/g, workspaceFolder.uri.fsPath);
}

function loadAndSyncConfig(yamlPath: string, jsonPath: string): void {
  try {
    const yamlConfig = ConfigParser.loadYamlConfig(yamlPath);
    
    if (!yamlConfig) {
      const jsonConfig = JsonTranspiler.readJsonConfig(jsonPath);
      if (jsonConfig) {
        Object.keys(jsonConfig.mcpServers).forEach(name => {
          processManager.initializeStatus({
            name,
            command: jsonConfig.mcpServers[name].command,
            args: jsonConfig.mcpServers[name].args,
            env: jsonConfig.mcpServers[name].env,
            cwd: jsonConfig.mcpServers[name].cwd
          });
        });
      }
      return;
    }

    yamlConfig.servers.forEach(server => {
      processManager.initializeStatus(server);
    });

    const runningServers = new Set(processManager.getRunningServers());
    JsonTranspiler.updateJsonWithRunningServers(jsonPath, yamlConfig, runningServers);

    treeDataProvider.refresh();
  } catch (error: any) {
    vscode.window.showErrorMessage(`YAML2MCP: ${error.message}`);
  }
}

async function startServer(serverName: string, yamlPath: string, jsonPath: string): Promise<void> {
  try {
    const yamlConfig = ConfigParser.loadYamlConfig(yamlPath);
    if (!yamlConfig) {
      vscode.window.showErrorMessage('MCP YAML configuration not found');
      return;
    }

    const serverConfig = yamlConfig.servers.find(s => s.name === serverName);
    if (!serverConfig) {
      vscode.window.showErrorMessage(`Server ${serverName} not found in configuration`);
      return;
    }

    await processManager.startServer(serverConfig, (name) => {
      loadAndSyncConfig(yamlPath, jsonPath);
      treeDataProvider.refresh();
    });

    const runningServers = new Set(processManager.getRunningServers());
    JsonTranspiler.updateJsonWithRunningServers(jsonPath, yamlConfig, runningServers);

    treeDataProvider.refresh();
    vscode.window.showInformationMessage(`Started MCP server: ${serverName}`);
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to start server: ${error.message}`);
    treeDataProvider.refresh();
  }
}

async function stopServer(serverName: string, yamlPath: string, jsonPath: string): Promise<void> {
  try {
    await processManager.stopServer(serverName);

    const yamlConfig = ConfigParser.loadYamlConfig(yamlPath);
    if (yamlConfig) {
      const runningServers = new Set(processManager.getRunningServers());
      JsonTranspiler.updateJsonWithRunningServers(jsonPath, yamlConfig, runningServers);
    }

    treeDataProvider.refresh();
    vscode.window.showInformationMessage(`Stopped MCP server: ${serverName}`);
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to stop server: ${error.message}`);
    treeDataProvider.refresh();
  }
}

function setupConfigWatcher(yamlPath: string, jsonPath: string): void {
  const pattern = new vscode.RelativePattern(
    path.dirname(yamlPath),
    path.basename(yamlPath)
  );

  configWatcher = vscode.workspace.createFileSystemWatcher(pattern);
  
  configWatcher.onDidChange(() => {
    loadAndSyncConfig(yamlPath, jsonPath);
  });

  configWatcher.onDidCreate(() => {
    loadAndSyncConfig(yamlPath, jsonPath);
  });

  configWatcher.onDidDelete(() => {
    treeDataProvider.refresh();
  });
}
