# 3GPP MCP Server V3.0.0 - Direct Specification Access

**Transform your AI assistant into a 3GPP specification expert with direct access to TSpec-LLM's 535M word dataset!**

[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-brightgreen)](https://modelcontextprotocol.io/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What This Does

**Before**: Ask AI about 3GPP specifications - Get generic responses based on training data
**After**: Ask AI + 3GPP MCP Server V3.0.0 - Get direct access to current specification content with structured, agent-ready responses

## Revolutionary V3.0.0 Architecture

V3.0.0 represents the **True MCP** approach - lightweight API bridge providing direct specification data:

```
Agent Query → MCP Tools → External APIs → Real Specification Data
```

### Key Benefits:
- **True MCP Architecture** - Lightweight API bridge (~10MB vs 15GB+)
- **Sub-500ms responses** - Intelligent caching with external API integration
- **Agent-optimized** - Structured JSON responses for AI agent consumption
- **Real specification data** - Direct access to TSpec-LLM's 535M word dataset
- **External API integration** - Hugging Face + 3GPP.org APIs
- **Infinite scalability** - Stateless API calls, no local storage limits

## Quick Start (30 Seconds!)

### Direct MCP Setup (Recommended)

**Claude Desktop users:**
```bash
claude mcp add 3gpp-server npx 3gpp-mcp-charging@latest serve
```

**For other MCP clients:**
Add this to your MCP configuration:
```json
{
  "mcpServers": {
    "3gpp-server": {
      "command": "npx",
      "args": ["3gpp-mcp-charging@latest", "serve"],
      "description": "3GPP MCP Server - Direct access to TSpec-LLM and 3GPP specifications",
      "env": {
        "HUGGINGFACE_TOKEN": "optional-for-enhanced-access"
      }
    }
  }
}
```

### Alternative: Auto-Configuration

```bash
# One-command installation with auto-configuration
npx 3gpp-mcp-charging@latest init

# Client-specific installation
npx 3gpp-mcp-charging@latest init --client claude
npx 3gpp-mcp-charging@latest init --client vscode
npx 3gpp-mcp-charging@latest init --client cursor
```

### Test It Works

Ask your AI assistant: *"Search for 5G CHF implementation requirements in TS 32.290"*

You should get structured specification content with implementation guidance, dependencies, and testing considerations!

## Available Tools (V3.0.0)

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `search_specifications` | Direct TSpec-LLM search | Query + filters | Structured spec results + relevance scores |
| `get_specification_details` | Comprehensive spec details | Specification ID | Full metadata + implementation guidance |
| `compare_specifications` | Multi-spec comparison | Array of spec IDs | Comparison matrix + migration analysis |
| `find_implementation_requirements` | Requirements extraction | Spec scope + focus | Technical requirements + testing guidance |

## Example Queries

**Direct Specification Search:**
```
"Find charging procedures in 5G service-based architecture"
→ Returns: TS 32.290 excerpts, CHF implementation details, Nchf interface specifications
```

**Implementation Requirements:**
```
"Extract implementation requirements for converged charging in Release 17"
→ Returns: Technical requirements, dependencies, testing considerations, compliance notes
```

**Specification Comparison:**
```
"Compare charging evolution from TS 32.240 to TS 32.290"
→ Returns: Evolution timeline, migration analysis, implementation impact assessment
```

## What You Get

### **Direct Specification Content**
- Real-time access to TSpec-LLM's comprehensive 3GPP dataset
- Structured content excerpts with relevance scoring
- Official specification metadata integration

### **Agent-Ready Responses**
- JSON-formatted responses optimized for AI agent consumption
- Consistent schema across all tool responses
- Rich metadata embedded in all responses

### **Implementation Intelligence**
- Technical requirements extraction from specifications
- Dependency analysis and implementation guidance
- Testing considerations and compliance mapping

### **Performance Benefits**
- <500ms cached response times
- <2s fresh API call responses
- <10MB memory footprint (stateless design)
- Unlimited concurrent users (external API scaling)

## Architecture

### Core Components

#### External API Integration Layer
- **TSpec-LLM Client**: Direct integration with TSpec-LLM dataset via Hugging Face APIs
- **3GPP API Client**: Integration with official 3GPP.org APIs for metadata
- **API Manager**: Unified orchestration layer for all external APIs

#### MCP Tool Layer
- **search_specifications.ts**: Direct specification search implementation
- **get_specification_details.ts**: Comprehensive specification details
- **compare_specifications.ts**: Multi-specification comparison
- **find_implementation_requirements.ts**: Requirements extraction

#### Caching & Performance
- **NodeCache**: Intelligent API response caching
- **Rate Limiting**: Respectful external API usage
- **Error Handling**: Robust API integration with fallbacks

## Project Structure

```
3gpp-mcp-server-v2/
├── src/                          # V3.0.0 source code
│   ├── api/                      # External API integration layer
│   │   ├── tspec-llm-client.ts   # TSpec-LLM Hugging Face client
│   │   ├── tgpp-api-client.ts    # 3GPP.org official API client
│   │   ├── api-manager.ts        # Unified API orchestration
│   │   └── index.ts              # API exports
│   ├── tools/                    # MCP tool implementations
│   │   ├── search-specifications.ts           # Direct specification search
│   │   ├── get-specification-details.ts       # Comprehensive spec details
│   │   ├── compare-specifications.ts          # Multi-spec comparison
│   │   ├── find-implementation-requirements.ts # Requirements extraction
│   │   └── index.ts              # Tool exports
│   ├── types/                    # TypeScript interfaces
│   └── index.ts                  # MCP server implementation
├── bin/                          # CLI installation tools
├── docs/                         # Documentation
├── tests/                        # Test suite
└── package.json                  # NPM package configuration
```

## Requirements

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **MCP-compatible AI assistant** (Claude Desktop, VS Code, Cursor, or others)
- **Internet connection** - For external API access
- **Optional: Hugging Face token** - For enhanced API access

## Installation Options

### Option 1: Direct MCP Configuration (Recommended)
No local installation needed! Server runs directly from NPM.

### Option 2: Development Setup
```bash
# Clone and setup for development
git clone <repository-url>
cd 3gpp-mcp-server/3gpp-mcp-server-v2
npm install
npm run build
npm run start
```

### Option 3: Auto-Configuration
```bash
npx 3gpp-mcp-charging@latest init
```

## Environment Variables

```bash
# Optional: Enhanced API access
export HUGGINGFACE_TOKEN="your-huggingface-token"

# Optional: Custom cache settings
export CACHE_TIMEOUT="3600"  # seconds
export ENABLE_CACHING="true"
```

## Version Evolution

| Version | Approach | Storage | Architecture |
|---------|----------|---------|-------------|
| V1 | Data Hosting | 15GB+ local dataset | Heavy, non-MCP compliant |
| V2 | Guidance Templates | <100MB knowledge base | Lightweight, guidance-only |
| **V3.0.0** | **Direct Data Access** | **<10MB (stateless)** | **True MCP API bridge** |

## Development

### Available Scripts
```bash
npm run build      # Build TypeScript
npm run dev        # Development with watch
npm run start      # Run the server
npm run test       # Run tests
npm run lint       # Lint code
npm run clean      # Clean build artifacts
```

### Adding New Tools
1. Create tool class in `src/tools/`
2. Define tool schema with input/output types
3. Implement `execute()` method with API integration
4. Export tool and register in `src/index.ts`

### API Integration
- Extend `TSpecLLMClient` for new TSpec-LLM capabilities
- Extend `TGPPApiClient` for additional 3GPP.org endpoints
- Add orchestration methods to `APIManager`

## Contributing

Contributions welcome! Please focus on:
- API integration improvements
- Performance optimizations
- New MCP tool implementations
- Documentation enhancements

## License

MIT License - see LICENSE file for details.

## Acknowledgments

### Research Foundation
This project's V3.0.0 architecture was fundamentally inspired by the TSpec-LLM research:

**TSpec-LLM: A Large Language Model for 3GPP Specifications**
- Paper: https://arxiv.org/abs/2406.01768
- Authors: Rasoul Nikbakht, et al.
- Dataset: [TSpec-LLM on Hugging Face](https://huggingface.co/datasets/rasoul-nikbakht/TSpec-LLM)

Originally planned as a document reference MCP, discovery of the TSpec-LLM research paper fundamentally changed our approach. The paper's demonstration of significant accuracy improvements (25+ percentage points) through direct LLM access to 3GPP specifications convinced us to pivot from document hosting to external API integration with their comprehensive 535M word dataset.

### Technical Foundation
- Built using the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Integrates with [TSpec-LLM dataset](https://huggingface.co/datasets/rasoul-nikbakht/TSpec-LLM)
- Supports 3GPP specifications from [3GPP.org](https://www.3gpp.org/)

---

**V3.0.0: True MCP architecture providing direct specification access through external API integration.**