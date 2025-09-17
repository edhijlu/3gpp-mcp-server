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
  GuideSpecificationSearchTool,
  Explain3GPPStructureTool,
  MapRequirementsToSpecsTool,
  GenerateResearchStrategyTool
} from './tools';
import {
  SeriesKnowledgeResource,
  ProtocolMappingResource,
  ResearchPatternsResource
} from './resources';
import {
  ExplainProcedurePrompt,
  CompareSpecificationsPrompt
} from './prompts';

class ThreeGPPMCPServer {
  private server: Server;
  private guidanceEngine: GuidanceEngine;

  // Tool instances
  private guideSpecSearchTool!: GuideSpecificationSearchTool;
  private explain3GPPTool!: Explain3GPPStructureTool;
  private mapRequirementsTool!: MapRequirementsToSpecsTool;
  private researchStrategyTool!: GenerateResearchStrategyTool;

  // Resource instances
  private seriesResource!: SeriesKnowledgeResource;
  private protocolResource!: ProtocolMappingResource;
  private patternsResource!: ResearchPatternsResource;

  // Prompt instances
  private explainPrompt!: ExplainProcedurePrompt;
  private comparePrompt!: CompareSpecificationsPrompt;

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
    this.initializeComponents();
    this.setupHandlers();
  }

  private initializeComponents() {
    // Initialize tools
    this.guideSpecSearchTool = new GuideSpecificationSearchTool(this.guidanceEngine);
    this.explain3GPPTool = new Explain3GPPStructureTool();
    this.mapRequirementsTool = new MapRequirementsToSpecsTool(this.guidanceEngine);
    this.researchStrategyTool = new GenerateResearchStrategyTool(this.guidanceEngine);

    // Initialize resources
    this.seriesResource = new SeriesKnowledgeResource();
    this.protocolResource = new ProtocolMappingResource(this.guidanceEngine);
    this.patternsResource = new ResearchPatternsResource(this.guidanceEngine);

    // Initialize prompts
    this.explainPrompt = new ExplainProcedurePrompt();
    this.comparePrompt = new CompareSpecificationsPrompt();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          this.guideSpecSearchTool.getDefinition(),
          this.explain3GPPTool.getDefinition(),
          this.mapRequirementsTool.getDefinition(),
          this.researchStrategyTool.getDefinition()
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'guide_specification_search':
            return await this.guideSpecSearchTool.execute(args);

          case 'explain_3gpp_structure':
            return await this.explain3GPPTool.execute(args);

          case 'map_requirements_to_specs':
            return await this.mapRequirementsTool.execute(args);

          case 'generate_research_strategy':
            return await this.researchStrategyTool.execute(args);

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
          this.seriesResource.getDefinition(),
          this.protocolResource.getDefinition(),
          this.patternsResource.getDefinition()
        ]
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case '3gpp://knowledge/series':
          return await this.seriesResource.getContent();

        case '3gpp://knowledge/protocols':
          return await this.protocolResource.getContent();

        case '3gpp://knowledge/research-patterns':
          return await this.patternsResource.getContent();

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
          this.explainPrompt.getDefinition(),
          this.comparePrompt.getDefinition()
        ]
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'explain_3gpp_procedure':
          return await this.explainPrompt.generate(args);

        case 'compare_specifications':
          return await this.comparePrompt.generate(args);

        default:
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Unknown prompt: ${name}`
          );
      }
    });
  }

  async run() {
    try {
      await this.guidanceEngine.initialize();
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
    } catch (error) {
      process.exit(1);
    }
  }
}

// Check if this file is being run directly
if (require.main === module) {
  const server = new ThreeGPPMCPServer();
  server.run().catch(() => process.exit(1));
}

export { ThreeGPPMCPServer };