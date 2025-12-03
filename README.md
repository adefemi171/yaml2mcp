# 🔄⚙️ YAML2MCP

A VS Code extension that helps you manage MCP (Model Context Protocol) servers using YAML configuration files. This extension provides a user-friendly interface to start, stop, and monitor MCP servers, automatically transpiling your YAML configuration to the JSON format required by IDEs.

## Features

- 📝 **YAML Configuration**: Manage your MCP servers using a clean, readable YAML format instead of JSON
- 🚀 **Dynamic Server Management**: Start and stop MCP servers on-demand through the VS Code UI
- 🔄 **Auto-Sync**: Automatically transpiles YAML to `mcp.json` format for IDE compatibility
- 👀 **Visual Status**: See server status (running/stopped/error) at a glance in the sidebar
- 📊 **Multiple Configurations**: Manage multiple MCP server configurations in a single YAML file
- 🔍 **File Watching**: Automatically detects changes to your YAML configuration file

## Installation

1. Clone or download this repository
2. Open the project in VS Code
3. Run `npm install` to install dependencies
4. Press `F5` to launch a new Extension Development Host window
5. In the new window, the extension will be active

## Configuration

### YAML Configuration Format

Create a `mcp.yaml` file in your workspace root (or configure a custom path):

```yaml
version: "1.0"
servers:
  - name: my-mcp-server
    command: node
    args:
      - server.js
    env:
      NODE_ENV: production
      API_KEY: your-api-key
    cwd: ./server-directory

  - name: another-server
    command: python
    args:
      - -m
      - mcp_server
    env:
      PYTHONPATH: /path/to/python
```

### Configuration Fields

- **name** (required): Unique identifier for the server
- **command** (required): Command to execute (e.g., `node`, `python`, `npm`)
- **args** (optional): Array of command-line arguments
- **env** (optional): Environment variables as key-value pairs
- **cwd** (optional): Working directory for the server process

### VS Code Settings

You can customize the paths in VS Code settings:

```json
{
  "yaml2mcp.configPath": "${workspaceFolder}/mcp.yaml",
  "yaml2mcp.mcpJsonPath": "${workspaceFolder}/.vscode/mcp.json"
}
```

## Usage

### Starting a Server

1. Open the **MCP Servers** view (click the YAML2MCP icon in the Activity Bar)
2. Right-click on a stopped server
3. Select **Start MCP Server**

The server will start, and the `mcp.json` file will be automatically updated to include it.

### Stopping a Server

1. In the **MCP Servers** view, right-click on a running server
2. Select **Stop MCP Server**

The server will be stopped, and it will be removed from `mcp.json`.

### Refreshing the View

Click the refresh icon in the **MCP Servers** view header to reload the configuration.

### Opening Configuration

Click the config icon in the **MCP Servers** view header to open or create the YAML configuration file.

## How It Works

1. **YAML Configuration**: You define all your MCP servers in a YAML file (`mcp.yaml`)
2. **Runtime Management**: The extension manages server processes independently
3. **JSON Transpilation**: Only running servers are included in the generated `mcp.json` file
4. **IDE Compatibility**: Your IDE reads the `mcp.json` file as usual, but you manage it through YAML

## Project Structure

```
yaml2mcp/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── types.ts              # TypeScript type definitions
│   ├── configParser.ts       # YAML configuration parser
│   ├── jsonTranspiler.ts     # YAML to JSON transpiler
│   ├── processManager.ts     # Process management (start/stop)
│   └── treeDataProvider.ts   # Tree view UI provider
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Building

```bash
npm run compile
```

### Watching for Changes

```bash
npm run watch
```

### Testing

1. Press `F5` in VS Code to launch the Extension Development Host
2. Test the extension in the new window

## Troubleshooting

### Server Won't Start

- Check that the command and arguments are correct in your YAML config
- Verify that the command is available in your PATH
- Check the VS Code Output panel for error messages

### Configuration Not Loading

- Ensure the YAML file is valid (check for syntax errors)
- Verify the file path in VS Code settings matches your actual file location
- Try refreshing the view or reloading the window

### JSON Not Updating

- Make sure you have write permissions to the directory containing `mcp.json`
- Check that the path in settings is correct
- Look for errors in the VS Code Output panel

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

