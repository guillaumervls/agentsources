# agentsources

A CLI tool to manage agent documentation dependencies for your AGENTS.md file.

## Installation

```bash
npm install -g agentsources
```

Or use with npx:

```bash
npx agentsources
```

## Usage

### Generate documentation index

```bash
agentsources generate
```

Or simply:

```bash
agentsources
```

The `generate` command is the default command and will:

1. Read the `agentsources.imports` from your package.json
2. For each imported package, extract its `agentsources.exports` configuration
3. Resolve all file paths relative to your project root
4. Update the AGENTS.md file with a managed documentation index

The managed section in AGENTS.md is automatically updated. Any content above the managed section delimiter is preserved, allowing you to add custom instructions.

### Add a package

```bash
agentsources add <package-name>
```

This command will:

1. Check if the package is installed; if not, install it to devDependencies
2. Auto-detect your package manager (npm, yarn, pnpm, or bun)
3. Add the package to your package.json's `agentsources.imports` field
4. Run the `generate` command to update AGENTS.md

## Configuration

### Main package (consumer)

In your project's package.json, declare which packages you want to import documentation from:

```json
{
  "name": "my-project",
  "agentsources": {
    "imports": {
      "my-library": {},
      "another-package": {}
    }
  }
}
```

This is automatically managed when you use the `add` command.

### Library package (provider)

To make your package compatible with agentsources, add an `agentsources` field with `exports` to your package.json:

```json
{
  "name": "my-library",
  "version": "1.0.0",
  "agentsources": {
    "exports": {
      "configuration": {
        "keywords": "configuration setup",
        "location": "docs/configuration.md"
      },
      "api": {
        "keywords": "API reference",
        "location": "docs/api.md"
      }
    }
  }
}
```

**Important:** Make sure your documentation files are included in your NPM package. By default, many files are excluded when publishing. You can explicitly include them using the `files` field in package.json:

```json
{
  "name": "my-library",
  "files": ["dist", "docs"],
  "agentsources": {
    "exports": {
      "configuration": {
        "keywords": "configuration setup",
        "location": "docs/configuration.md"
      }
    }
  }
}
```

Alternatively, ensure your documentation directory is not listed in `.npmignore`.

### Configuration Schema

**For library providers:**

- `agentsources.exports`: Object mapping export names to documentation entries
  - Each export has:
    - `keywords`: String describing when to read this documentation
    - `location`: Path relative to the package root

**For consumers:**

- `agentsources.imports`: Object mapping package names to empty objects (reserved for future filtering options)

## AGENTS.md Format

The tool generates a managed section in AGENTS.md like this:

```markdown
<!-- AGENTSOURCES MANAGED SECTION - DO NOT EDIT FROM THIS LINE -->

# Documentation Index

When the user asks about these topics, consult the corresponding files for reference:

- **configuration setup** → node_modules/my-library/docs/configuration.md
- **API reference** → node_modules/my-library/docs/api.md
```

Everything above the delimiter is preserved as user-editable content. The managed section is regenerated each time you run `agentsources generate`.

## Supported Package Managers

- npm
- yarn
- pnpm
- bun

The tool automatically detects your package manager by checking for lockfiles.

## Complete Example

### Creating a library with agent documentation

Create a library package with documentation:

```json
{
  "name": "my-awesome-db",
  "version": "1.0.0",
  "agentsources": {
    "exports": {
      "getting-started": {
        "keywords": "database setup connection",
        "location": "docs/getting-started.md"
      },
      "best-practices": {
        "keywords": "database optimization performance",
        "location": "docs/best-practices.md"
      }
    }
  }
}
```

### Using the library in your project

Install and add the library:

```bash
npm install my-awesome-db
agentsources add my-awesome-db
```

This updates your package.json:

```json
{
  "name": "my-project",
  "dependencies": {
    "my-awesome-db": "^1.0.0"
  },
  "agentsources": {
    "imports": {
      "my-awesome-db": {}
    }
  }
}
```

And generates AGENTS.md:

```markdown
<!-- AGENTSOURCES MANAGED SECTION - DO NOT EDIT FROM THIS LINE -->

# Documentation Index

When the user asks about these topics, consult the corresponding files for reference:

- **database setup connection** → node_modules/my-awesome-db/docs/getting-started.md
- **database optimization performance** → node_modules/my-awesome-db/docs/best-practices.md
```

Now when you ask your AI assistant about database optimization, it will automatically reference the appropriate documentation files.

## Error Handling

If a package doesn't have the `agentsources` field configured, the tool will show a helpful error message with:

- Information about the missing configuration
- A link to the package's repository (if available)
- Contact information for the maintainer

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode
npm run dev -- add <package>

# Type check
npm run typecheck

# Lint
npm run lint
```

## License

Apache-2.0
