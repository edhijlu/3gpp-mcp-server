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

import { APIManager } from './api';
import type { APIConfig } from './api';
import {
  SearchSpecificationsTool,
  GetSpecificationDetailsTool,
  CompareSpecificationsTool,
  FindImplementationRequirementsTool
} from './tools';
import type {
  SearchSpecificationsArgs,
  GetSpecificationDetailsArgs,
  CompareSpecificationsArgs,
  FindImplementationRequirementsArgs
} from './tools';

class ThreeGPPMCPServer {
  private server: Server;
  private apiManager: APIManager;

  // V3 Tool instances
  private searchTool!: SearchSpecificationsTool;
  private detailsTool!: GetSpecificationDetailsTool;
  private compareTool!: CompareSpecificationsTool;
  private requirementsTool!: FindImplementationRequirementsTool;

  constructor() {
    this.server = new Server(
      {
        name: '3gpp-mcp-server',
        version: '3.0.0',
        description: '3GPP MCP Server - Direct access to TSpec-LLM and 3GPP specifications'
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        }
      }
    );

    const apiConfig: APIConfig = {
      huggingFaceToken: process.env.HUGGINGFACE_TOKEN,
      enableCaching: true,
      cacheTimeout: 3600
    };
    this.apiManager = new APIManager(apiConfig);
    this.initializeComponents();
    this.setupHandlers();
  }

  private initializeComponents() {
    // Initialize V3 data access tools
    this.searchTool = new SearchSpecificationsTool(this.apiManager);
    this.detailsTool = new GetSpecificationDetailsTool(this.apiManager);
    this.compareTool = new CompareSpecificationsTool(this.apiManager);
    this.requirementsTool = new FindImplementationRequirementsTool(this.apiManager);
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          this.searchTool.getDefinition(),
          this.detailsTool.getDefinition(),
          this.compareTool.getDefinition(),
          this.requirementsTool.getDefinition()
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_specifications':
            return await this.searchTool.execute(args as unknown as SearchSpecificationsArgs);

          case 'get_specification_details':
            return await this.detailsTool.execute(args as unknown as GetSpecificationDetailsArgs);

          case 'compare_specifications':
            return await this.compareTool.execute(args as unknown as CompareSpecificationsArgs);

          case 'find_implementation_requirements':
            return await this.requirementsTool.execute(args as unknown as FindImplementationRequirementsArgs);

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

    // V3 focuses on tools only - no resources or prompts needed
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return { resources: [] };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async () => {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Resources not supported in V3 - use tools for data access'
      );
    });

    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return { prompts: [] };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async () => {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Prompts not supported in V3 - use tools for data access'
      );
    });
  }

  async run() {
    try {
      // No initialization needed for API clients
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
    } catch (error) {
      console.error('Failed to start 3GPP MCP Server:', error);
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