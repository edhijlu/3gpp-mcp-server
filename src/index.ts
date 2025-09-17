#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import { GuidanceEngine } from './utils/guidance-engine';
import {
  UserQuery,
  GuidanceResponse,
  SpecificationMetadata,
  SearchPattern
} from './types/guidance';

class ThreeGPPMCPServer {
  private server: Server;
  private guidanceEngine: GuidanceEngine;

  constructor() {
    this.server = new Server(
      {
        name: '3gpp-guidance',
        version: '2.0.0',
        description: 'Lightweight 3GPP research guidance MCP server'
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        }
      }
    );

    this.guidanceEngine = new GuidanceEngine();
    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'guide_specification_search',
            description: 'Helps users formulate effective specification searches and provides targeted guidance for finding relevant 3GPP specifications',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The search query or topic of interest'
                },
                userLevel: {
                  type: 'string',
                  enum: ['beginner', 'intermediate', 'expert'],
                  description: 'User expertise level for tailored guidance'
                },
                domain: {
                  type: 'string',
                  description: 'Specific domain or area of focus (optional)'
                }
              },
              required: ['query']
            }
          },
          {
            name: 'explain_3gpp_structure',
            description: 'Provides educational content about 3GPP organization, specification series, and working groups',
            inputSchema: {
              type: 'object',
              properties: {
                focus: {
                  type: 'string',
                  enum: ['overview', 'series', 'working_groups', 'releases'],
                  description: 'Specific aspect of 3GPP structure to explain'
                }
              }
            }
          },
          {
            name: 'map_requirements_to_specs',
            description: 'Maps technical requirements to appropriate 3GPP specifications with reading order and implementation guidance',
            inputSchema: {
              type: 'object',
              properties: {
                requirements: {
                  type: 'string',
                  description: 'Technical requirements or use case description'
                },
                implementationFocus: {
                  type: 'boolean',
                  description: 'Whether to focus on implementation aspects'
                }
              },
              required: ['requirements']
            }
          },
          {
            name: 'generate_research_strategy',
            description: 'Creates comprehensive research approaches for complex 3GPP topics with phased methodology',
            inputSchema: {
              type: 'object',
              properties: {
                topic: {
                  type: 'string',
                  description: 'Research topic or area of investigation'
                },
                complexity: {
                  type: 'string',
                  enum: ['basic', 'intermediate', 'advanced'],
                  description: 'Complexity level of the research'
                },
                timeframe: {
                  type: 'string',
                  description: 'Available timeframe for research (optional)'
                }
              },
              required: ['topic']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'guide_specification_search':
            return await this.handleSpecificationSearch(args);

          case 'explain_3gpp_structure':
            return await this.handleExplain3GPPStructure(args);

          case 'map_requirements_to_specs':
            return await this.handleMapRequirementsToSpecs(args);

          case 'generate_research_strategy':
            return await this.handleGenerateResearchStrategy(args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: '3gpp://knowledge/series',
            name: '3GPP Specification Series Guide',
            description: 'Comprehensive guide to 3GPP specification series (21-38) with descriptions and focus areas',
            mimeType: 'text/markdown'
          },
          {
            uri: '3gpp://knowledge/protocols',
            name: 'Protocol Relationship Mapping',
            description: 'Protocol relationship mapping and guidance for NAS, RRC, PDCP, and other 3GPP protocols',
            mimeType: 'text/markdown'
          },
          {
            uri: '3gpp://knowledge/research-patterns',
            name: 'Research Methodology Patterns',
            description: 'Common research methodologies and patterns for effective 3GPP specification study',
            mimeType: 'text/markdown'
          }
        ]
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case '3gpp://knowledge/series':
          return await this.handleSeriesResource();

        case '3gpp://knowledge/protocols':
          return await this.handleProtocolsResource();

        case '3gpp://knowledge/research-patterns':
          return await this.handleResearchPatternsResource();

        default:
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Unknown resource: ${uri}`
          );
      }
    });

    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'explain_3gpp_procedure',
            description: 'Template for explaining specific 3GPP procedures in detail with context and examples',
            arguments: [
              {
                name: 'procedure_name',
                description: 'Name of the 3GPP procedure to explain',
                required: true
              },
              {
                name: 'specification',
                description: 'Relevant specification (e.g., TS 24.501)',
                required: false
              },
              {
                name: 'detail_level',
                description: 'Level of detail: overview, detailed, or implementation',
                required: false
              }
            ]
          },
          {
            name: 'compare_specifications',
            description: 'Template for comparing two specifications with structured analysis of differences and relationships',
            arguments: [
              {
                name: 'spec_a',
                description: 'First specification to compare',
                required: true
              },
              {
                name: 'spec_b',
                description: 'Second specification to compare',
                required: true
              },
              {
                name: 'comparison_aspects',
                description: 'Specific aspects to compare (e.g., functionality, architecture, evolution)',
                required: false
              }
            ]
          }
        ]
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'explain_3gpp_procedure':
          return await this.handleExplainProcedurePrompt(args);

        case 'compare_specifications':
          return await this.handleCompareSpecificationsPrompt(args);

        default:
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Unknown prompt: ${name}`
          );
      }
    });
  }

  private async handleSpecificationSearch(args: any) {
    const query: UserQuery = {
      text: args.query,
      userLevel: args.userLevel || 'intermediate',
      domain: args.domain
    };

    const analysis = await this.guidanceEngine.analyzeQuery(query);
    const guidance = await this.guidanceEngine.generateGuidance(query, analysis);

    return {
      content: [
        {
          type: 'text',
          text: this.formatGuidanceResponse(guidance)
        }
      ]
    };
  }

  private async handleExplain3GPPStructure(args: any) {
    const focus = args?.focus || 'overview';

    let content = '';
    switch (focus) {
      case 'overview':
        content = this.generate3GPPOverview();
        break;
      case 'series':
        content = this.generate3GPPSeries();
        break;
      case 'working_groups':
        content = this.generate3GPPWorkingGroups();
        break;
      case 'releases':
        content = this.generate3GPPReleases();
        break;
      default:
        content = this.generate3GPPOverview();
    }

    return {
      content: [
        {
          type: 'text',
          text: content
        }
      ]
    };
  }

  private async handleMapRequirementsToSpecs(args: any) {
    const requirements = args.requirements;
    const implementationFocus = args.implementationFocus || false;

    const query: UserQuery = {
      text: requirements,
      userLevel: implementationFocus ? 'expert' : 'intermediate'
    };

    const analysis = await this.guidanceEngine.analyzeQuery(query);
    analysis.intent = 'implementation';

    const guidance = await this.guidanceEngine.generateGuidance(query, analysis);

    return {
      content: [
        {
          type: 'text',
          text: this.formatGuidanceResponse(guidance)
        }
      ]
    };
  }

  private async handleGenerateResearchStrategy(args: any) {
    const topic = args.topic;
    const complexity = args.complexity || 'intermediate';
    const timeframe = args.timeframe;

    const query: UserQuery = {
      text: `Research strategy for ${topic}`,
      userLevel: complexity === 'basic' ? 'beginner' : complexity === 'advanced' ? 'expert' : 'intermediate'
    };

    const analysis = await this.guidanceEngine.analyzeQuery(query);
    analysis.intent = 'learning';

    const guidance = await this.guidanceEngine.generateGuidance(query, analysis);

    let formattedResponse = this.formatGuidanceResponse(guidance);

    if (timeframe) {
      formattedResponse += `\n\n### Timeframe Considerations\n`;
      formattedResponse += `Given your ${timeframe} timeframe, prioritize the most critical specifications and focus on practical understanding over exhaustive coverage.\n`;
    }

    return {
      content: [
        {
          type: 'text',
          text: formattedResponse
        }
      ]
    };
  }

  private async handleSeriesResource() {
    const content = `# 3GPP Specification Series Guide

## Overview
The 3rd Generation Partnership Project (3GPP) organizes its specifications into numbered series, each covering different aspects of mobile telecommunications systems.

## Specification Series

### Core Network and Protocols (20s)
- **Series 21**: Requirements
- **Series 22**: Service aspects
- **Series 23**: Technical realization and architecture
- **Series 24**: Core network protocols and procedures
- **Series 25**: Radio access network protocols
- **Series 26**: Codecs and media processing
- **Series 27**: Data and charging
- **Series 28**: Network management and orchestration
- **Series 29**: Core network and service interfaces

### Security and Testing (30s)
- **Series 31**: Subscriber Identity Module (SIM/USIM)
- **Series 32**: Telecommunication management and charging
- **Series 33**: Security architecture and procedures
- **Series 34**: Test specifications for UE conformance
- **Series 35**: Cryptographic algorithms and security features
- **Series 36**: LTE (Long Term Evolution) radio access
- **Series 37**: Multiple radio access technologies
- **Series 38**: 5G NR (New Radio) access technology

## How to Use This Guide
1. **Start with Architecture (23.xxx)** - Understand system overview
2. **Move to Protocols (24.xxx, 25.xxx)** - Learn detailed procedures
3. **Add Security (33.xxx)** - Understand protection mechanisms
4. **Validate with Testing (34.xxx)** - Ensure correct implementation

## Finding the Right Series
- **System Architecture**: Series 23
- **Core Network Protocols**: Series 24
- **Radio Protocols**: Series 25 (4G), Series 38 (5G)
- **Security**: Series 33
- **Testing**: Series 34
- **Interfaces**: Series 29`;

    return {
      contents: [
        {
          uri: '3gpp://knowledge/series',
          mimeType: 'text/markdown',
          text: content
        }
      ]
    };
  }

  private async handleProtocolsResource() {
    const protocols = this.guidanceEngine['knowledgeBase'].getAllProtocols();

    let content = `# 3GPP Protocol Relationship Mapping

## Protocol Stack Overview

### Non-Access Stratum (NAS)
- **Purpose**: Communication between UE and core network
- **Key Protocols**: 5G NAS (TS 24.501), EPS NAS (TS 24.301)
- **Main Functions**: Authentication, session management, mobility

### Radio Resource Control (RRC)
- **Purpose**: Control of radio resources and UE connections
- **Key Protocols**: 5G RRC (TS 38.331), LTE RRC (TS 36.331)
- **Main Functions**: Connection management, mobility, measurements

## Protocol Relationships

`;

    for (const [name, protocol] of protocols) {
      content += `### ${protocol.fullName} (${name})\n`;
      content += `- **Layer**: ${protocol.layer}\n`;
      content += `- **Purpose**: ${protocol.purpose}\n`;
      content += `- **Defining Specs**: ${protocol.definingSpecs.join(', ')}\n`;
      content += `- **Related Protocols**: ${protocol.relatedProtocols.join(', ')}\n`;
      content += `- **Common Use Cases**: ${protocol.commonUseCases.join(', ')}\n\n`;
    }

    return {
      contents: [
        {
          uri: '3gpp://knowledge/protocols',
          mimeType: 'text/markdown',
          text: content
        }
      ]
    };
  }

  private async handleResearchPatternsResource() {
    const patterns = this.guidanceEngine['knowledgeBase'].getAllPatterns();

    let content = `# 3GPP Research Methodology Patterns

## Research Approach Philosophy
Effective 3GPP research follows systematic patterns that build understanding progressively from architecture to implementation.

`;

    for (const [name, pattern] of patterns) {
      content += `## ${pattern.name}\n\n`;
      content += `**Description**: ${pattern.description}\n\n`;
      content += `**When to Use**: ${pattern.applicableFor.join(', ')}\n\n`;
      content += `**Time Estimate**: ${pattern.timeEstimate}\n\n`;

      content += `### Methodology Steps:\n`;
      pattern.steps.forEach(step => {
        content += `#### ${step.phase}\n`;
        content += `**Tasks**: ${step.tasks.join(', ')}\n`;
        content += `**Deliverables**: ${step.deliverables.join(', ')}\n`;
        content += `**Tips**: ${step.tips.join(', ')}\n\n`;
      });

      content += `**Expected Outputs**: ${pattern.expectedOutputs.join(', ')}\n\n`;
      content += `**Common Pitfalls**: ${pattern.commonPitfalls.join(', ')}\n\n`;
      content += `---\n\n`;
    }

    return {
      contents: [
        {
          uri: '3gpp://knowledge/research-patterns',
          mimeType: 'text/markdown',
          text: content
        }
      ]
    };
  }

  private async handleExplainProcedurePrompt(args: any) {
    const procedureName = args?.procedure_name || '[PROCEDURE_NAME]';
    const specification = args?.specification || '[RELEVANT_SPEC]';
    const detailLevel = args?.detail_level || 'detailed';

    const prompt = `You are explaining the ${procedureName} procedure from 3GPP specification ${specification}.

Structure your explanation as follows:

## ${procedureName} Procedure Overview

### Purpose and Context
- Explain why this procedure exists
- Describe when it is triggered
- Identify the network entities involved

### High-Level Flow
- Provide step-by-step sequence
- Highlight key decision points
- Note error conditions and handling

${detailLevel === 'implementation' ? `
### Implementation Considerations
- Key algorithm requirements
- Performance considerations
- Common implementation challenges
- Testing and validation approaches
` : ''}

### References and Related Procedures
- Reference the relevant 3GPP specifications
- Connect to related procedures
- Suggest further reading

Focus on clarity and practical understanding. Use examples where helpful.`;

    return {
      description: `Template for explaining ${procedureName} procedure`,
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt
          }
        }
      ]
    };
  }

  private async handleCompareSpecificationsPrompt(args: any) {
    const specA = args?.spec_a || '[SPECIFICATION_A]';
    const specB = args?.spec_b || '[SPECIFICATION_B]';
    const aspects = args?.comparison_aspects || 'functionality, architecture, evolution';

    const prompt = `Compare 3GPP specifications ${specA} and ${specB}, focusing on: ${aspects}

Structure your comparison as follows:

## Specification Comparison: ${specA} vs ${specB}

### Overview
- Brief description of each specification's purpose
- Target use cases and scope

### Key Differences
- **Functional Scope**: What each specification covers
- **Technical Approach**: Different implementation strategies
- **Architecture Impact**: How each affects system design
- **Evolution Context**: How they relate to previous/future versions

### Detailed Analysis
For each comparison aspect (${aspects}):
- **${specA} Approach**: [Describe approach]
- **${specB} Approach**: [Describe approach]
- **Trade-offs**: [Analyze advantages/disadvantages]

### Implementation Guidance
- When to use each specification
- Migration considerations
- Interoperability requirements
- Best practices for implementation

### Conclusion
- Summary of key insights
- Recommendations for different use cases

Focus on practical insights that help with implementation decisions.`;

    return {
      description: `Template for comparing ${specA} and ${specB}`,
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt
          }
        }
      ]
    };
  }

  private formatGuidanceResponse(guidance: GuidanceResponse): string {
    let formatted = `# ${guidance.summary}\n\n`;

    guidance.sections.forEach(section => {
      formatted += `## ${section.title}\n\n`;
      formatted += `${section.content}\n\n`;
    });

    if (guidance.nextSteps && guidance.nextSteps.length > 0) {
      formatted += `## Next Steps\n\n`;
      guidance.nextSteps.forEach(step => {
        formatted += `- ${step}\n`;
      });
      formatted += '\n';
    }

    if (guidance.relatedTopics && guidance.relatedTopics.length > 0) {
      formatted += `## Related Topics\n\n`;
      guidance.relatedTopics.forEach(topic => {
        formatted += `- ${topic}\n`;
      });
      formatted += '\n';
    }

    formatted += `---\n*Confidence: ${Math.round(guidance.confidence * 100)}%*\n`;
    formatted += `*Generated by 3GPP MCP Server v2 - Intelligent Guidance*`;

    return formatted;
  }

  private generate3GPPOverview(): string {
    return `# 3GPP Organization Overview

## What is 3GPP?
The 3rd Generation Partnership Project (3GPP) is a global initiative that develops technical specifications for mobile telecommunications systems, including 4G LTE and 5G technologies.

## Key Components

### Working Groups
- **SA (Service and System Aspects)**: Architecture and requirements
- **CT (Core Network and Terminals)**: Core network protocols
- **RAN (Radio Access Network)**: Radio interface specifications

### Specification Process
1. **Requirements** - Define what needs to be achieved
2. **Architecture** - Design system structure
3. **Protocols** - Define detailed procedures
4. **Testing** - Ensure interoperability

### Release Cycle
3GPP follows a regular release cycle, with major releases every 2-3 years introducing significant new capabilities.

## How to Navigate 3GPP
1. Start with architecture specifications (23.xxx series)
2. Move to protocol specifications (24.xxx, 38.xxx series)
3. Understand security requirements (33.xxx series)
4. Review testing specifications (34.xxx series)

The key is progressive learning - build understanding layer by layer.`;
  }

  private generate3GPPSeries(): string {
    return `# 3GPP Specification Series Detailed Guide

## Navigation Strategy
Each series serves a specific purpose in the 3GPP ecosystem:

### Requirements and Architecture (20s)
- **21.xxx**: High-level requirements and use cases
- **22.xxx**: Service requirements and capabilities
- **23.xxx**: System architecture and procedures
- **24.xxx**: Core network signaling protocols
- **25.xxx**: Radio access network protocols

### Implementation and Testing (30s)
- **31.xxx**: SIM/USIM specifications
- **32.xxx**: Network management and charging
- **33.xxx**: Security architecture and algorithms
- **34.xxx**: Protocol conformance testing
- **35.xxx**: Cryptographic algorithms

### Technology-Specific (36-38)
- **36.xxx**: LTE/4G radio access specifications
- **37.xxx**: Multi-RAT and interworking
- **38.xxx**: 5G NR radio access specifications

## Reading Strategy
1. **Architecture First**: Always start with 23.xxx specs
2. **Protocol Deep Dive**: Move to 24.xxx or 38.xxx for details
3. **Security Understanding**: Review relevant 33.xxx specs
4. **Implementation Validation**: Use 34.xxx for testing guidance

Each series builds upon others - understand the dependencies for effective research.`;
  }

  private generate3GPPWorkingGroups(): string {
    return `# 3GPP Working Groups Structure

## Service and System Aspects (SA)
- **SA1**: Services and requirements
- **SA2**: Architecture and overall system design
- **SA3**: Security architecture and procedures
- **SA4**: Codec and media specifications
- **SA5**: Network management and orchestration
- **SA6**: Mission-critical applications

## Core Network and Terminals (CT)
- **CT1**: Core network protocols and terminal interfaces
- **CT3**: Interworking with external networks
- **CT4**: Core network protocols and charging
- **CT6**: Smart card applications and platforms

## Radio Access Network (RAN)
- **RAN1**: Physical layer specifications
- **RAN2**: Radio interface protocols and procedures
- **RAN3**: Base station and core network interfaces
- **RAN4**: Radio performance and protocol testing
- **RAN5**: Mobile terminal conformance testing

## How Working Groups Collaborate
Each working group focuses on specific aspects but coordinates closely:
- SA defines requirements and architecture
- CT develops core network solutions
- RAN creates radio access solutions
- All groups ensure consistency and interoperability

Understanding which working group owns which specifications helps navigate the standards more effectively.`;
  }

  private generate3GPPReleases(): string {
    return `# 3GPP Release Evolution

## Major Release Timeline

### 4G Era
- **Release 8** (2008): Initial LTE specifications
- **Release 9** (2009): Enhanced LTE features
- **Release 10** (2011): LTE-Advanced introduction
- **Release 11-12** (2012-2014): LTE-Advanced enhancements

### 5G Era
- **Release 15** (2018): Initial 5G NR specifications
- **Release 16** (2020): Enhanced 5G features and industrial IoT
- **Release 17** (2022): 5G evolution with new capabilities
- **Release 18** (2023): 5G-Advanced introduction

## What Each Release Brings
- **Requirements**: New use cases and performance targets
- **Architecture**: Enhanced system design and network functions
- **Protocols**: New and updated signaling procedures
- **Features**: Advanced capabilities and optimizations

## Understanding Release Impact
- **Backward Compatibility**: How new releases work with existing systems
- **Migration Path**: Steps to upgrade from previous releases
- **Implementation Timeline**: Industry adoption patterns
- **Feature Dependencies**: Which features require others

## Research Strategy by Release
When researching specific topics, always consider:
1. Which release introduced the feature
2. How it evolved in subsequent releases
3. What dependencies exist with other features
4. Current industry implementation status

This timeline perspective helps understand both current capabilities and future evolution paths.`;
  }

  async run() {
    console.log('Starting 3GPP MCP Server v2...');

    try {
      await this.guidanceEngine.initialize();
      console.log('Guidance engine initialized successfully');

      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.log('3GPP MCP Server v2 is running');

    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Check if this file is being run directly
if (require.main === module) {
  const server = new ThreeGPPMCPServer();
  server.run().catch(console.error);
}

export { ThreeGPPMCPServer };