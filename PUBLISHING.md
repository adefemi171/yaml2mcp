# Publishing Guide for YAML2MCP Extension

## Prerequisites

1. **Create a Publisher Account**
   - Go to [Visual Studio Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
   - Sign in with your Microsoft account (or create one)
   - Click "Create publisher"
   - Fill in:
     - Publisher ID: (choose a unique ID, e.g., your GitHub username)
     - Publisher name: (your name or organization)
     - Email: (your email)
   - Accept the terms and create

2. **Get a Personal Access Token (PAT)**
   - Go to [Azure DevOps](https://dev.azure.com/)
   - Sign in with the same Microsoft account
   - Click on your profile → Security → Personal access tokens
   - Click "New Token"
   - Name: "VS Code Extension Publishing"
   - Organization: "All accessible organizations"
   - Expiration: Choose your preference (90 days recommended)
   - Scopes: Select "Marketplace" → "Manage"
   - Click "Create"
   - **Copy the token immediately** (you won't see it again!)

   Visual studio extension Token
   
   1Jww8xaIRNBdvEi6B7jTYpneC3CZDvJ4p8dryifvlGxv2SepVK
   x5JQQJ99BLACAAAAAAAAAAAAAGAZDO4fYG

   Token for VsX Registry
   ovsxp_adc73855-bdc3-451c-8ae0-7ae3bf2006b1
   
3. **Set up Open VSX Registry Account**
   - Go to [Open VSX Registry](https://open-vsx.org/)
   - Sign in with your GitHub account (or create an account)
   - **Create an Eclipse Account**: Register at [eclipse.org](https://www.eclipse.org/) and ensure your GitHub username is included in your account information
   - **Link Accounts**: On your Open VSX profile page, click "Log in with Eclipse" to link your accounts
   - **Sign Publisher Agreement**: Access and sign the Eclipse Foundation Open VSX Publisher Agreement from your Open VSX profile page
   - **Get Access Token**: Click on your profile → Access Tokens → "Create Token"
     - Name: "YAML2MCP Publishing"
     - Copy the token (format: `ovsxp_...`)
   - **Create Namespace**: The namespace in Open VSX is determined by the `publisher` field in your `package.json`. 
     - Check your `package.json` to see your publisher ID (e.g., `"publisher": "adefemi171"`)
     - The namespace must match the publisher ID exactly
     - Create the namespace using this command (replace `<publisher>` with your exact publisher ID):
       ```bash
       npx ovsx create-namespace <publisher> --pat <your-token>
       ```
     - Example: If your publisher is `"adefemi171"`, run:
       ```bash
       npx ovsx create-namespace adefemi171 --pat ovsxp_your_token_here
       ```
     - **Important**: The namespace must be created before your first publish. After creation, all future publishes will use this namespace automatically.
   - Add the token as `OVSX_PAT` secret in your GitHub repository settings

## Installation

Install the publishing tools:

```bash
# VS Code Extension Manager (for VS Code Marketplace)
npm install -g @vscode/vsce

# Open VSX CLI (for Open VSX Registry)
npm install -g ovsx
```

## Update package.json

Before publishing, make sure your `package.json` has:
- ✅ `publisher` field (your publisher ID) - **This determines your Open VSX namespace!**
- ✅ `repository` field (GitHub repo URL)
- ✅ `license` field
- ✅ `keywords` for discoverability
- ✅ `icon` field pointing to `assets/yaml2mcp.png` (recommended - 128x128 PNG)

**Important for Open VSX**: The `publisher` field in `package.json` is used as the namespace in Open VSX. For example:
- If `"publisher": "adefemi171"` → Your extension will be published as `adefemi171.yaml2mcp` in Open VSX
- The namespace must be created in Open VSX before publishing (see step 3 above)
- To change the namespace, update the `publisher` field and create a new namespace with the new name

The icon file should be placed in the `assets/` folder and referenced in `package.json` as:
```json
"icon": "assets/yaml2mcp.png"
```

## Publishing Steps

### 1. Login to your publisher account

```bash
vsce login YOUR-PUBLISHER-ID
```

When prompted, paste your Personal Access Token.

### 2. Package your extension (test first)

**Important:** Make sure dependencies are installed before packaging:

```bash
npm install
npm run compile
vsce package
```

This creates a `.vsix` file that you can:
- Test locally by installing it: `code --install-extension yaml2mcp-0.1.0.vsix`
- Share with others for testing

**Note:** The `bundledDependencies` field in `package.json` ensures that `js-yaml` is included in the package. If you add more runtime dependencies, add them to `bundledDependencies` as well.

**Troubleshooting:** If you get "Cannot find module 'js-yaml'" errors after installing the extension:
1. Verify the `.vsix` includes `node_modules`: `unzip -l yaml2mcp-0.1.0.vsix | grep node_modules`
2. If `node_modules` is missing, ensure `npm install` was run before packaging
3. Make sure you're using a compatible Node.js version (>=20.18.1 recommended for `vsce`)
4. Try packaging with: `npx @vscode/vsce package` to use the latest version

### 3. Publish to VS Code Marketplace

```bash
vsce publish
```

This will:
- Validate your extension
- Package it
- Upload it to the VS Code Marketplace
- Make it available for installation

### 4. Publish to Open VSX Registry

```bash
ovsx publish
```

Or with a personal access token:

```bash
ovsx publish --pat YOUR_OVSX_PAT
```

This will:
- Validate your extension
- Package it (if not already packaged)
- Upload it to the Open VSX Registry under the namespace specified in your `package.json` `publisher` field
- Make it available for VSCode forks like VSCodium

**Namespace Verification**: 
- Your extension will be published as `<publisher>.<name>` (e.g., `adefemi171.yaml2mcp`)
- Verify the namespace matches by checking your `package.json` `publisher` field
- The namespace must exist in Open VSX (created in step 3) before publishing

**Note:** The GitHub Actions workflow automatically publishes to both registries when you create a release or manually trigger the publish workflow.

### 5. Update your extension

For future updates:

1. Update the `version` in `package.json` (use semantic versioning: 0.1.0 → 0.1.1 → 0.2.0)
2. Run `vsce publish` again

## Publishing Options

### Minor/Patch Update (0.1.0 → 0.1.1)
```bash
vsce publish minor
# or
vsce publish patch
```

### Major Update (0.1.0 → 1.0.0)
```bash
vsce publish major
```

## Verification

After publishing:

**VS Code Marketplace:**
1. Go to [VS Code Marketplace](https://marketplace.visualstudio.com/vscode)
2. Search for your extension name
3. It may take a few minutes to appear
4. Test installation: `code --install-extension YOUR-PUBLISHER-ID.yaml2mcp`

**Open VSX Registry:**
1. Go to [Open VSX Registry](https://open-vsx.org/)
2. Search for your extension name
3. It may take a few minutes to appear
4. Test installation: `ovsx install YOUR-PUBLISHER-ID.yaml2mcp`

## Troubleshooting

**Error: Extension name already exists**
- Change the `name` field in package.json to something unique

**Error: Invalid publisher**
- Make sure the `publisher` field matches your publisher ID exactly

**Error: Missing repository**
- Add a `repository` field to package.json pointing to your GitHub repo

**Error: Missing license**
- Add a `license` field (e.g., "MIT") to package.json

## Best Practices

1. **Versioning**: Use semantic versioning (MAJOR.MINOR.PATCH)
2. **Changelog**: Consider adding a CHANGELOG.md file
3. **README**: Make sure README.md is comprehensive
4. **Testing**: Test the .vsix file locally before publishing
5. **Icons**: Add an icon (128x128 PNG) for better visibility
6. **Keywords**: Add relevant keywords for discoverability

## GitHub Actions Auto-Publishing

The repository includes GitHub Actions workflows that automatically publish to both registries:

1. **CI Workflow** (`.github/workflows/ci.yml`): Runs tests on all branches
2. **Publish Workflow** (`.github/workflows/publish.yml`): Publishes to both VS Code Marketplace and Open VSX Registry

### Setting up GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `VSCE_PAT`: Your VS Code Marketplace Personal Access Token
- `OVSX_PAT`: Your Open VSX Personal Access Token

### Triggering Auto-Publish

The publish workflow runs automatically when:
- A GitHub release is published (extracts version from tag)
- Manually triggered via `workflow_dispatch` (requires version input)

The workflow will:
1. Validate the semantic version
2. Update `package.json` version
3. Compile TypeScript
4. Package the extension
5. Publish to VS Code Marketplace
6. Publish to Open VSX Registry
7. Upload the `.vsix` file as an artifact

## Resources

- [VS Code Extension Publishing Docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Open VSX Publishing Guide](https://github.com/open-vsx/publish-extensions)
- [Semantic Versioning](https://semver.org/)

