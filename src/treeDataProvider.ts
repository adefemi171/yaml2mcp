import * as vscode from 'vscode';
import { ServerStatus } from './types';
import { ProcessManager } from './processManager';

export class McpTreeDataProvider implements vscode.TreeDataProvider<ServerTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ServerTreeItem | undefined | null | void> =
    new vscode.EventEmitter<ServerTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ServerTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  constructor(private processManager: ProcessManager) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ServerTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ServerTreeItem): Thenable<ServerTreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const statuses = this.processManager.getAllStatuses();
    const items = statuses.map(status => {
      const item = new ServerTreeItem(
        status.name,
        status.status,
        status.error
      );
      item.contextValue = status.status;
      return item;
    });

    if (items.length === 0) {
      const placeholder = new ServerTreeItem('No servers configured', 'stopped', undefined, true);
      placeholder.contextValue = 'placeholder';
      return Promise.resolve([placeholder]);
    }

    return Promise.resolve(items);
  }
}

export class ServerTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly status: 'running' | 'stopped' | 'error',
    public readonly error?: string,
    public readonly isPlaceholder: boolean = false
  ) {
    super(
      label,
      isPlaceholder
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.None
    );

    this.tooltip = error || `${label} - ${status}`;
    this.description = status;

    if (isPlaceholder) {
      this.iconPath = undefined;
    } else {
      switch (status) {
        case 'running':
          this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.green'));
          break;
        case 'stopped':
          this.iconPath = new vscode.ThemeIcon('circle-outline');
          break;
        case 'error':
          this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
          break;
      }
    }
  }
}
