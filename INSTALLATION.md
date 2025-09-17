# 3GPP Charging MCP Server - Installation Guide

## 🚀 Direct MCP Setup (30 Seconds - Recommended!)

### Claude Desktop (Simplest Method)
```bash
claude mcp add 3gpp-charging npx 3gpp-mcp-charging@latest serve
```
**Done!** No installation, no configuration files, no git repositories. The MCP server runs directly from NPM on-demand.

### Manual MCP Configuration (All Clients)
Add this to your MCP client's configuration file:

**Claude Desktop** (`~/.config/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "3gpp-charging": {
      "command": "npx",
      "args": ["3gpp-mcp-charging@latest", "serve"],
      "description": "3GPP Charging & Billing Expert Guidance"
    }
  }
}
```

**VS Code** (settings.json):
```json
{
  "mcp.servers": {
    "3gpp-charging": {
      "command": "npx",
      "args": ["3gpp-mcp-charging@latest", "serve"],
      "description": "3GPP Charging & Billing Expert Guidance"
    }
  }
}
```

**Cursor IDE** (MCP configuration):
```json
{
  "mcpServers": {
    "3gpp-charging": {
      "command": "npx",
      "args": ["3gpp-mcp-charging@latest", "serve"],
      "description": "3GPP Charging & Billing Expert Guidance"
    }
  }
}
```

## 🎯 Alternative: Auto-Configuration Setup

### One Command Setup
```bash
npx 3gpp-mcp-charging@latest init
```

### Platform-Specific Installation
```bash
# Claude Desktop
npx 3gpp-mcp-charging@latest init --client claude

# VS Code with MCP Extension
npx 3gpp-mcp-charging@latest init --client vscode

# Cursor IDE
npx 3gpp-mcp-charging@latest init --client cursor
```

This auto-configuration method will:
- ✅ Auto-detect your AI client
- ✅ Configure your AI client automatically
- ✅ Test the connection
- ✅ No local installation needed (uses NPX)

## 🔍 System Information
```bash
npx 3gpp-mcp-charging@latest info
```

Shows:
- Detected AI clients
- Configuration paths
- System compatibility

## 🛠️ Backup Methods (If NPX Fails)

### Manual Source Installation
```bash
git clone https://github.com/edhijlu/3gpp-mcp-server.git
cd 3gpp-mcp-server/3gpp-mcp-server-v2
npm install
npm run build

# Then configure manually in your MCP client:
# Command: node
# Args: ["dist/index.js"]
# Working Directory: [full path to this directory]
```

### Global NPM Installation
```bash
npm install -g 3gpp-mcp-charging
3gpp-mcp-charging init
```

## ✅ Testing Your Installation

### Verify MCP Connection
```bash
# Check if server is connected (Claude Desktop users)
claude mcp list  # Should show "3gpp-charging: ✓ Connected"

# Test server directly
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | npx 3gpp-mcp-charging@latest serve
```

### Example Queries to Try

**Beginner Queries:**
- "What is 3GPP charging architecture?"
- "Explain online vs offline charging"
- "How do CDRs work in telecom billing?"

**Advanced Queries:**
- "Guide me through CHF implementation"
- "How to migrate from 4G PCRF to 5G PCF?"
- "Design a converged charging system architecture"

## 🔧 Troubleshooting

### Connection Issues

**MCP Server Not Connected**
```bash
# Check MCP server status
claude mcp list

# Remove and re-add if needed
claude mcp remove 3gpp-charging
claude mcp add 3gpp-charging npx 3gpp-mcp-charging@latest serve
```

**NPX Package Issues**
```bash
# Clear NPX cache
npx clear-npx-cache

# Use specific version
claude mcp add 3gpp-charging npx 3gpp-mcp-charging@2.0.5 serve
```

### System Requirements

**Node.js Version**
- Requires Node.js 18+
- Check: `node --version`
- Install from: https://nodejs.org

**Permission Issues**
```bash
# NPX handles permissions automatically
# No global installation needed
```

**Configuration Not Applied**
- Restart your AI client after configuration
- Check with: `npx 3gpp-mcp-charging@latest info`

### Get Help

- GitHub Issues: https://github.com/edhijlu/3gpp-mcp-server/issues
- Check system status: `npx 3gpp-mcp-charging@latest info`
- Reinstall: `npx 3gpp-mcp-charging@latest init --force`

## 🎉 What's Next?

After successful installation:

1. **Restart your AI client**
2. **Test with a charging query**
3. **Explore the charging specifications knowledge**
4. **Try implementation guidance queries**

Welcome to expert 3GPP charging guidance! 🚀