# Snippet: MCP Server Template

**Źródło:** `educational-sales-site/mcp-integrations/index.js`
**Zastosowanie:** Tworzenie własnych MCP serverów dla współpracy między agentami AI

## Czym jest MCP?

Model Context Protocol (MCP) pozwala agentom AI (Manus, Claude, itp.) wywoływać narzędzia
zdefiniowane przez Ciebie. Idealny do:
- Synchronizacji kodu między agentami (git_sync)
- Udostępniania plików przez Google Drive
- Automatyzacji powtarzalnych operacji

## Snippet — Bazowy MCP Server

```javascript
// mcp-integrations/index.js
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");

const server = new Server(
  { name: "my-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Definicja narzędzi
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "git_sync",
      description: "Commit and push changes to GitHub",
      inputSchema: {
        type: "object",
        properties: {
          message: { type: "string", description: "Commit message" },
          branch: { type: "string", description: "Branch name", default: "main" },
        },
        required: ["message"],
      },
    },
    {
      name: "gdrive_upload",
      description: "Upload file to shared Google Drive folder",
      inputSchema: {
        type: "object",
        properties: {
          filePath: { type: "string" },
          folderId: { type: "string" },
        },
        required: ["filePath"],
      },
    },
  ],
}));

// Obsługa wywołań narzędzi
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "git_sync": {
      // git add, commit, push
      const { message, branch = "main" } = args;
      // ... implementacja
      return { content: [{ type: "text", text: `Synced: ${message}` }] };
    }
    case "gdrive_upload": {
      // Google Drive upload
      const { filePath, folderId } = args;
      // ... implementacja
      return { content: [{ type: "text", text: `Uploaded: ${filePath}` }] };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running");
}
main().catch(console.error);
```

## package.json dla MCP

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": { "start": "node index.js" },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "isomorphic-git": "^1.27.0",
    "@octokit/rest": "^21.0.0",
    "googleapis": "^144.0.0",
    "fs-extra": "^11.0.0",
    "dotenv": "^16.0.0"
  }
}
```

## Konfiguracja w claude_desktop_config.json / manus

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/mcp-integrations/index.js"],
      "env": {
        "GITHUB_TOKEN": "...",
        "GDRIVE_FOLDER_ID": "..."
      }
    }
  }
}
```

## Narzędzia z educational-sales-site

| Narzędzie | Opis |
|---|---|
| `git_sync` | Commit + push do GitHub |
| `gdrive_upload` | Upload pliku do Google Drive |
| `github_setup_repo` | Inicjalizacja/linkowanie repo |
| `read_file` | Odczyt pliku z workspace |
| `write_file` | Zapis pliku do workspace |
| `list_files` | Lista plików w katalogu |
