# YAML Configuration Samples

This directory contains example YAML configuration files for YAML2MCP.

## Files

- **`mcp.yaml.example`** - Comprehensive example showing multiple server configurations
- **`minimal.yaml`** - Minimal configuration with just the required fields
- **`full-featured.yaml`** - Shows all available configuration options

## Configuration Fields

### Required Fields

- **`name`** (string): Unique identifier for the server
- **`command`** (string): Command to execute (e.g., `node`, `python`, `npm`)

### Optional Fields

- **`args`** (array of strings): Command-line arguments
- **`env`** (object): Environment variables as key-value pairs
- **`cwd`** (string): Working directory for the server process

## Usage

1. Copy one of the example files to your workspace root as `mcp.yaml`
2. Customize the server configurations to match your setup
3. Use the YAML2MCP extension to start/stop servers

## Example Structure

```yaml
version: "1.0"

servers:
  - name: my-server
    command: node
    args:
      - server.js
    env:
      NODE_ENV: production
    cwd: ./server
```

## Notes

- Server names must be unique within a configuration file
- The `version` field is optional but recommended
- Environment variables can reference system variables using `${VAR_NAME}` syntax
- Paths in `cwd` can be relative to the workspace root or absolute

