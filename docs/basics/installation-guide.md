# Installation Guide - 30 Seconds to Expert Guidance

**Goal**: Get the 3GPP MCP Server running and integrated with your AI assistant in 30 seconds

**Result**: Transform any compatible AI from generic responses to expert-level 3GPP guidance

---

## Quick Prerequisites Check

Before starting, make sure you have:
- **Node.js 18+** - [Download here](https://nodejs.org/) if needed (NPX included automatically)
- **MCP-compatible AI assistant** (Claude Desktop recommended)
- **30 seconds** of focused time
- **Terminal/Command prompt** access

**Don't worry if you're not technical** - this is one simple command!

---

## Step 1: Direct MCP Setup (30 seconds)

### Option A: Claude Desktop (Simplest Method)

**Just one command - no installation, no git clone, no configuration files:**
```bash
claude mcp add 3gpp-charging npx 3gpp-mcp-charging@latest serve
```

**Done!** That's it. The MCP server runs directly from NPM on-demand.

### Option B: Manual MCP Configuration (All Clients)

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

---

## Step 2: Auto-Configuration Alternative (1 minute)

**If you prefer guided installation:**
```bash
npx 3gpp-mcp-charging@latest init

# Or client-specific
npx 3gpp-mcp-charging@latest init --client claude
```

---

## Step 3: Backup Method (If NPX Fails)

**Manual installation from source:**

```bash
# Download the source code
git clone https://github.com/edhijlu/3gpp-mcp-server.git
cd 3gpp-mcp-server/3gpp-mcp-server-v2

# Install and build
npm install
npm run build

# Build the server
npm run build

# Test the MCP server
npm run mcp
```

**You should see**:
```
Starting 3GPP MCP Server v2...
Guidance engine initialized successfully
3GPP MCP Server v2 is running
```

**Success!** Press `Ctrl+C` to stop the test. Your server is ready.

---

## Step 2: Connect to Your AI Assistant (2 minutes)

### Find Your AI Assistant Configuration

**For Claude Desktop:**

**On Windows**:
- File location: `%APPDATA%\Claude\claude_desktop_config.json`
- Or open Claude Desktop → Settings → Developer

**On Mac**:
- File location: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Or open Claude Desktop → Settings → Developer

**On Linux**:
- File location: `~/.config/Claude/claude_desktop_config.json`

### Add the 3GPP MCP Server

**For Claude Desktop:**

**Option A: Use Generated Configuration (Recommended)**

If you used the setup script, it created a configuration file with the correct paths for your system. For Claude Desktop users:

1. Copy the contents of `claude_desktop_config_generated.json`
2. Paste into your Claude Desktop configuration file

**For other MCP-compatible AI assistants:**
1. Use the generated configuration as a reference
2. Follow your AI assistant's specific MCP server setup instructions
3. Adapt the configuration format as needed for your platform

**Option B: Manual Configuration**

Open the configuration file and add this (replace `/path/to/` with your actual path):

```json
{
  "mcpServers": {
    "3gpp-guidance": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/3gpp-mcp-server/3gpp-mcp-server-v2",
      "description": "Expert 3GPP telecommunications guidance"
    }
  }
}
```

**Real example for Windows**:
```json
{
  "mcpServers": {
    "3gpp-guidance": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "C:\\Users\\YourName\\3gpp-mcp-server\\3gpp-mcp-server-v2",
      "description": "Expert 3GPP telecommunications guidance"
    }
  }
}
```

**Real example for Mac/Linux**:
```json
{
  "mcpServers": {
    "3gpp-guidance": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/Users/yourname/3gpp-mcp-server/3gpp-mcp-server-v2",
      "description": "Expert 3GPP telecommunications guidance"
    }
  }
}
```

**Additional Options:**

For development mode with extra logging:
```json
{
  "mcpServers": {
    "3gpp-guidance": {
      "command": "npm",
      "args": ["run", "mcp:dev"],
      "cwd": "/path/to/3gpp-mcp-server/3gpp-mcp-server-v2",
      "description": "3GPP MCP Server (Development Mode)",
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

### Restart Claude Desktop
Close and reopen Claude Desktop to load the new configuration.

---

## Step 3: Verify It's Working (1 minute)

### Test Query
In your AI assistant, ask this exact question:

```
Can you give me a strategic learning path for understanding 5G authentication, suitable for someone with technical background but new to 3GPP?
```

### What Success Looks Like
You should get a detailed response that includes:
- **Specific specification sections** (like "TS 33.501 Section 6")
- **Structured learning phases** with timeframes
- **Implementation components** and requirements
- **Next steps** and related topics
- **Expert methodology** and best practices

### What Failure Looks Like
If you get a generic response like "5G authentication uses various methods...", the MCP server isn't connected properly.

---

## Troubleshooting Common Issues

### Issue: "Command not found: node"
**Problem**: Node.js isn't installed or not in PATH
**Solution**: Install Node.js from [nodejs.org](https://nodejs.org/) and restart terminal

### Issue: "npm install fails"
**Problem**: Network issues or permissions
**Solution**:
```bash
# Try with clean cache
npm cache clean --force
npm install
```

### Issue: "Build fails with TypeScript errors"
**Problem**: Version compatibility issues
**Solution**:
```bash
# Update dependencies
npm update
npm run build
```

### Issue: "AI assistant doesn't show enhanced responses"
**Problem**: MCP server not connected properly
**Solutions**:
1. Check the configuration file path is correct
2. Verify the `cwd` path points to your actual installation
3. Restart your AI assistant completely
4. Test that `npm start` works in the server directory

### Issue: "Server starts but no improvement in responses"
**Problem**: Query not triggering 3GPP domain recognition
**Solution**: Make sure your questions include 3GPP-related terms like:
- "5G", "3GPP", "LTE", "NAS", "RRC"
- "specifications", "TS 24.501", "authentication"
- "mobile network", "telecommunications"

---

## Advanced Configuration (Optional)

### Multiple AI Assistants
You can connect the same MCP server to multiple AI assistants. The configuration format may vary by platform:

**General MCP Configuration Pattern:**
```json
{
  "mcpServers": {
    "3gpp-guidance": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/3gpp-mcp-server/3gpp-mcp-server-v2"
    }
  }
}
```

**Note:** Consult your AI assistant's documentation for the exact configuration format and MCP support details.

### Custom Port (if needed)
```json
{
  "mcpServers": {
    "3gpp-guidance": {
      "command": "node",
      "args": ["dist/index.js", "--port", "3001"],
      "cwd": "/path/to/3gpp-mcp-server/3gpp-mcp-server-v2"
    }
  }
}
```

### Logging (for debugging)
```json
{
  "mcpServers": {
    "3gpp-guidance": {
      "command": "node",
      "args": ["dist/index.js", "--verbose"],
      "cwd": "/path/to/3gpp-mcp-server/3gpp-mcp-server-v2"
    }
  }
}
```

---

## What You've Just Accomplished

### Before Installation:
- Generic AI responses to 3GPP questions
- No guidance on where to start learning
- Random information without methodology
- Hours of confused searching

### After Installation:
- Expert-level 3GPP guidance on demand
- Structured learning paths for any topic
- Specific specification sections and roadmaps
- Professional methodology and best practices
- Implementation guidance and pitfall avoidance

### You Now Have Access To:
1. **Expert Research Methodology** - How telecommunications professionals approach learning
2. **Specification Navigation** - Direct guidance to relevant sections of 3GPP documents
3. **Implementation Roadmaps** - Step-by-step approaches to building real systems
4. **Industry Best Practices** - Accumulated wisdom from years of professional experience
5. **Current Standards** - Always up-to-date guidance based on latest specifications

---

## Your Next Steps

### Immediate (Next 10 minutes):
1. **[Try Your First Queries](first-steps.md)** - Test different types of 3GPP questions
2. **[See the Difference](../comparisons/side-by-side-examples.md)** - Compare before/after responses
3. **[Pick a Learning Path](../user-journeys/)** - Find guidance for your background

### This Week:
1. **[Complete a Workflow](../how-to/research-5g-authentication/)** - Full example from start to finish
2. **[Explore Advanced Features](../how-to/)** - Discover all available tools and resources
3. **[Share with Colleagues](#)** - Help others transform their 3GPP learning

### This Month:
1. **[Master Your Specialization](../user-journeys/)** - Deep dive into your area of interest
2. **[Apply to Real Projects](#)** - Use expert guidance for actual work
3. **[Contribute Feedback](#)** - Help improve the system for everyone

---

## Getting Help

### If Something Goes Wrong:
1. **Check this guide** - Most issues have solutions above
2. **Test basic functionality** - Ensure `npm start` works
3. **Verify configuration** - Double-check file paths and JSON syntax
4. **Restart everything** - Close AI assistant, restart server, try again

### For Advanced Support:
- **Documentation**: Comprehensive guides in the `/docs` folder
- **Community**: Join telecommunications professionals using MCP
- **Issues**: Report problems to help improve the system

### Success Indicators:
- **Immediate difference** in response quality for 3GPP questions
- **Specific guidance** instead of generic information
- **Learning paths** that feel manageable and structured
- **Implementation insights** that save time and prevent mistakes

---

**Congratulations! You've just transformed your AI assistant into a 3GPP expert consultant.**

*Ready to experience the difference? Try asking about any 3GPP topic and prepare to be amazed by the quality of guidance you receive!*

---

## Quick Test Queries to Try Right Now

```
1. "Give me a beginner's learning path for understanding 5G network architecture"

2. "What specifications should I read to understand NAS protocol implementation?"

3. "How does 5G handover work and which specs define the procedures?"

4. "I need to implement 5G authentication - what components do I need to build?"

5. "Explain the difference between 4G and 5G mobility management"
```

**Each of these should give you structured, expert-level guidance with specific specification references and actionable next steps!**