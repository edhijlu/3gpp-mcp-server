# Quick Start Guide - V2 Guidance Approach

Get the 3GPP MCP Server v2 up and running in 3 minutes! This guide will have you receiving intelligent 3GPP research guidance through Claude Desktop with minimal setup.

## Prerequisites

- **Node.js 18+** installed on your system
- **Claude Desktop** application (download from [claude.ai](https://claude.ai))
- **Git** for cloning the repository

## 1. Install the V2 Server (1 minute)

```bash
# Clone the repository
git clone https://github.com/your-org/3gpp-mcp-server.git
cd 3gpp-mcp-server/3gpp-mcp-server-v2

# Install dependencies (uses root package.json)
npm install

# Build the v2 server
npm run build

# Test the server (should show "3GPP Guidance MCP Server initialized")
npm start
```

*Press Ctrl+C to stop the test server.*

**Note**: V2 requires no dataset downloads! The server includes all necessary knowledge for intelligent guidance.

## 2. Configure Claude Desktop (1 minute)

### Find Your Configuration File

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

### Add the V2 Server Configuration

Replace `/path/to` with your actual installation path:

```json
{
  "mcpServers": {
    "3gpp-guidance": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/3gpp-mcp-server/3gpp-mcp-server-v2",
      "description": "Lightweight 3GPP research guidance"
    }
  }
}
```

**Example for macOS/Linux**:
```json
{
  "mcpServers": {
    "3gpp-guidance": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/Users/username/3gpp-mcp-server/3gpp-mcp-server-v2"
    }
  }
}
```

**Example for Windows**:
```json
{
  "mcpServers": {
    "3gpp-guidance": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "C:\\Users\\Username\\3gpp-mcp-server\\3gpp-mcp-server-v2"
    }
  }
}
```

## 3. Restart Claude Desktop (1 minute)

1. **Close Claude Desktop completely**
2. **Reopen Claude Desktop**
3. **Look for the 🔧 tools icon** in the interface (indicates MCP tools are available)

## 4. Test Your V2 Setup

Try these example queries in Claude Desktop to see the guidance approach in action:

### Research Guidance Request
```
I need to understand 5G NAS authentication. Can you guide me on how to research this effectively?
```

**Expected V2 Response**: Strategic research guidance including:
- Recommended specifications (TS 24.501, TS 33.501)
- Research methodology and reading order
- Key concepts to understand first
- Search strategies for 3GPP.org
- Next steps for deeper learning

### Learning Path Request
```
I'm new to 3GPP. Help me learn about mobility management in a structured way.
```

**Expected V2 Response**: Educational guidance including:
- Foundational concepts to understand first
- Learning progression from basic to advanced
- Relevant specification series and priorities
- Study methodology recommendations

### Comparison Strategy
```
How should I approach comparing 4G and 5G authentication mechanisms?
```

**Expected V2 Response**: Comparative research strategy including:
- Systematic comparison framework
- Key areas to analyze
- Recommended specifications for each technology
- Analysis methodology

## 5. V2 Guidance Examples

Here are conversations that demonstrate the V2 guidance approach:

### Educational Mentorship
```
User: I need to implement NAS authentication but don't know where to start.

Claude: I'll provide you with a strategic approach to researching NAS authentication implementation.

[Claude uses the V2 guidance tools]

## Research Strategy for NAS Authentication Implementation

### Foundation Phase (Week 1)
**Start with Architecture Understanding:**
- TS 33.501 (5G Security Architecture) - Chapter 6 for authentication overview
- TS 23.501 (5G System Architecture) - Understand where authentication fits

### Deep Dive Phase (Week 2)
**Study Detailed Procedures:**
- TS 24.501 (5G NAS Protocol) - Sections 4.2-4.4 for authentication procedures
- Focus on 5G-AKA vs EAP-AKA' authentication methods

### Implementation Phase (Week 3)
**Review Implementation Considerations:**
- SUCI encryption for identity protection
- Authentication vector handling
- Security context management

### Key Search Terms for 3GPP.org:
- "5G-AKA procedure"
- "SUCI encryption"
- "Authentication vector"
- "Security context establishment"

### Next Steps:
1. Start with TS 33.501 Chapter 6 for conceptual understanding
2. Create diagrams of the authentication flow
3. Study message formats in TS 24.501
4. Plan your implementation architecture

Would you like me to elaborate on any specific phase or help you formulate more targeted research questions?
```

### Methodology Transfer
```
User: How do I efficiently research 3GPP specifications? I always get lost in the documentation.

Claude: I'll teach you a systematic approach to 3GPP research that experts use.

[Claude uses the V2 guidance tools]

## Expert 3GPP Research Methodology

### 1. Research Preparation
**Before diving into specifications:**
- Clearly define what you need to understand (architecture, procedures, implementation)
- Identify your expertise level (beginner, intermediate, expert)
- Set realistic time boundaries for your research session

### 2. Strategic Specification Selection
**Use the "Three-Layer Approach":**
- **Architecture Layer** (Series 23): Start with system design
- **Protocol Layer** (Series 24, 36, 38): Study detailed procedures
- **Implementation Layer** (Series 29): Review interface specifications

### 3. Effective Reading Strategy
**Progressive Detail Approach:**
1. **Overview Reading** (15 min): Read introduction and scope
2. **Structure Mapping** (10 min): Review table of contents and major sections
3. **Targeted Deep Dive** (30-60 min): Focus on specific procedures you need

### 4. Cross-Reference Strategy
**Build Understanding Connections:**
- Start with one specification as your "anchor"
- Follow references to understand dependencies
- Create a concept map of relationships

### 5. Knowledge Validation
**Ensure Understanding:**
- Can you explain the concept to someone else?
- Can you draw the procedure or architecture?
- Do you understand where this fits in the bigger system?

This methodology typically reduces research time by 60% while improving comprehension.

Would you like me to help you apply this methodology to a specific topic you're researching?
```

## Troubleshooting

### V2 Server Not Starting
```bash
# Check Node.js version
node --version  # Should be 18.0.0+

# Verify you're in the v2 directory
pwd  # Should end with /3gpp-mcp-server-v2

# Rebuild the v2 project
npm run clean && npm run build

# Check for errors
npm start
```

### Claude Desktop Not Finding V2 Server
1. **Verify the v2 path** in the configuration (must include `3gpp-mcp-server-v2`)
2. **Check absolute paths** in the configuration
3. **Restart Claude Desktop** completely
4. **Test the v2 server runs independently**:
   ```bash
   cd /path/to/3gpp-mcp-server/3gpp-mcp-server-v2
   node dist/index.js
   ```

### Getting Data Responses Instead of Guidance
If you're getting specification text instead of guidance, you might be connected to the v1 server. Ensure:
- Your configuration points to the `3gpp-mcp-server-v2` directory
- The server name is `3gpp-guidance` (not `3gpp-server`)
- You've restarted Claude Desktop after changing configuration

## What Makes V2 Different?

### V2 Guidance Response vs V1 Data Response

**V1 Response Style** (Data Hosting):
```
Found 3 specifications matching "NAS authentication":

**TS 24.301** - Non-Access-Stratum protocol for EPS (Relevance: 85%)
Content: "4.2 Authentication procedures
The authentication procedure is initiated by the network..."
[2000+ words of specification text]
```

**V2 Response Style** (Intelligent Guidance):
```
For NAS authentication research, I recommend this strategic approach:

**Primary Specifications to Study:**
• TS 24.501 (5G NAS): Sections 4.2-4.4 for procedures
• TS 33.501 (5G Security): Chapter 6 for architecture
• TS 29.518 (AUSF Services): Authentication server functions

**Research Strategy:**
1. Start with TS 33.501 Ch.6 for conceptual overview
2. Study TS 24.501 Section 4.2 for detailed procedures
3. Use TS 29.518 for implementation details

**Key Concepts to Master:**
- SUCI/SUPI identity protection
- 5G-AKA vs EAP-AKA' methods
- Authentication vector generation

**Search Tips for 3GPP.org:**
- Use terms: 'SUCI', '5G-AKA', 'authentication vector'
- Focus on series 24 (protocols) and 33 (security)

Would you like me to explain any specific aspect or help you develop a more targeted research plan?
```

## What's Next?

### Explore V2 Guidance Features
- **Research methodology transfer**: "Teach me how to research 3GPP mobility procedures"
- **Learning path generation**: "Create a learning plan for 5G security"
- **Strategic comparisons**: "Guide me through comparing 4G vs 5G architectures"
- **Implementation planning**: "Help me plan my approach to implementing PDU sessions"

### Advanced V2 Usage
- Adapt guidance to your expertise level (beginner, intermediate, expert)
- Get methodology transfer for different research domains
- Learn systematic approaches to complex 3GPP topics
- Build transferable research skills

### Benefits You'll Experience
- **95% faster setup** - No large datasets to download
- **Educational growth** - Learn research methodology, not just get answers
- **Better understanding** - Develop strategic knowledge of 3GPP organization
- **Self-sufficiency** - Build skills that transfer to new topics

## Support

### V2-Specific Issues
- **"Getting too much text"**: You may be connected to v1 - check your configuration path
- **"Responses too basic"**: Try specifying your expertise level in questions
- **"Want more specific guidance"**: Ask follow-up questions to drill down

### Getting Help
- Check the [V2 Architecture Documentation](./architecture-v2.md) for technical details
- Review [V2 vs V1 Comparison](./v1-vs-v2-comparison.md) for understanding differences
- Review [V2 Concept Documentation](./concept-v2.md) for philosophical background

## Success! 🎉

You now have the 3GPP MCP Server v2 running with Claude Desktop! You can ask for intelligent research guidance and receive educational, strategic responses that build your 3GPP research capabilities.

**Try asking Claude**:
- "Guide me through learning 5G authentication from scratch"
- "What's the best research strategy for understanding network slicing?"
- "Help me plan my approach to studying RRC procedures"
- "Teach me how to effectively research 3GPP specifications"

The v2 server transforms Claude into a 3GPP research mentor, teaching you how to navigate the complex world of telecommunications specifications while building lasting expertise.