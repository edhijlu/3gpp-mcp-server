import { APIManager, EnhancedSearchRequest } from '../api';

export interface SearchSpecificationsArgs {
  query: string;
  max_results?: number;
  series_filter?: string[];
  release_filter?: string[];
  include_content?: boolean;
  format?: 'detailed' | 'summary' | 'agent_ready';
}

export class SearchSpecificationsTool {
  private apiManager: APIManager;

  constructor(apiManager: APIManager) {
    this.apiManager = apiManager;
  }

  getDefinition() {
    return {
      name: 'search_specifications',
      description: 'Search 3GPP specifications using TSpec-LLM dataset and official metadata. Returns actual specification content and structured metadata for agent consumption.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (e.g., "5G charging CHF implementation", "handover procedures", "authentication security")'
          },
          max_results: {
            type: 'number',
            description: 'Maximum number of results to return (default: 5)',
            default: 5
          },
          series_filter: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter by specification series (e.g., ["32", "33", "38"])'
          },
          release_filter: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter by 3GPP release (e.g., ["Rel-16", "Rel-17"])'
          },
          include_content: {
            type: 'boolean',
            description: 'Include detailed specification content from TSpec-LLM (default: true)',
            default: true
          },
          format: {
            type: 'string',
            enum: ['detailed', 'summary', 'agent_ready'],
            description: 'Response format - agent_ready provides structured JSON optimized for AI agents',
            default: 'agent_ready'
          }
        },
        required: ['query']
      }
    };
  }

  async execute(args: SearchSpecificationsArgs) {
    try {
      const request: EnhancedSearchRequest = {
        query: args.query,
        include_tspec_content: args.include_content !== false,
        include_official_metadata: true,
        max_results: args.max_results || 5,
        series_filter: args.series_filter,
        release_filter: args.release_filter
      };

      const searchResults = await this.apiManager.enhancedSearch(request);

      const format = args.format || 'agent_ready';

      switch (format) {
        case 'agent_ready':
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(this.formatForAgent(searchResults), null, 2)
              }
            ]
          };

        case 'summary':
          return {
            content: [
              {
                type: 'text',
                text: this.formatSummary(searchResults)
              }
            ]
          };

        case 'detailed':
        default:
          return {
            content: [
              {
                type: 'text',
                text: this.formatDetailed(searchResults)
              }
            ]
          };
      }

    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error searching specifications: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  }

  private formatForAgent(results: any): any {
    return {
      search_results: {
        total_found: results.tspec_results?.total_found || 0,
        query_processed: results.tspec_results?.query_processed || '',
        search_time_ms: results.tspec_results?.search_time_ms || 0,

        specification_content: results.tspec_results?.results?.map((result: any) => ({
          content: result.content,
          source_specification: result.source_specification,
          release: result.release,
          section: result.section,
          relevance_score: result.relevance_score,
          specification_details: {
            id: result.metadata.specification_id,
            working_group: result.metadata.working_group,
            document_type: result.metadata.document_type,
            keywords: result.metadata.keywords
          }
        })) || [],

        official_metadata: results.official_metadata?.map((spec: any) => ({
          id: spec.id,
          title: spec.title,
          version: spec.version,
          release: spec.release,
          working_group: spec.working_group,
          status: spec.status,
          publication_date: spec.publication_date,
          summary: spec.summary,
          dependencies: spec.dependencies,
          keywords: spec.keywords
        })) || [],

        related_specifications: results.related_specifications?.map((spec: any) => ({
          id: spec.id,
          title: spec.title,
          release: spec.release,
          working_group: spec.working_group,
          relevance: 'related'
        })) || [],

        working_groups: results.working_group_info?.map((wg: any) => ({
          name: wg.name,
          full_name: wg.full_name,
          focus_area: wg.focus_area,
          specifications: wg.specifications
        })) || [],

        releases: results.release_info?.map((rel: any) => ({
          release: rel.release,
          freeze_date: rel.freeze_date,
          status: rel.status,
          major_features: rel.major_features
        })) || []
      },

      agent_guidance: {
        implementation_priority: this.determineImplementationPriority(results),
        recommended_reading_order: this.getRecommendedReadingOrder(results),
        key_concepts: this.extractKeyConcepts(results),
        next_actions: this.suggestNextActions(results)
      }
    };
  }

  private formatSummary(results: any): string {
    let summary = `# 3GPP Specification Search Results\n\n`;
    summary += `**Query**: ${results.tspec_results?.query_processed || 'N/A'}\n`;
    summary += `**Results Found**: ${results.tspec_results?.total_found || 0}\n`;
    summary += `**Search Time**: ${results.tspec_results?.search_time_ms || 0}ms\n\n`;

    if (results.tspec_results?.results?.length > 0) {
      summary += `## Key Findings\n\n`;
      results.tspec_results.results.slice(0, 3).forEach((result: any, index: number) => {
        summary += `### ${index + 1}. ${result.source_specification} - ${result.section}\n`;
        summary += `**Relevance**: ${Math.round(result.relevance_score * 100)}%\n`;
        summary += `${result.content.substring(0, 200)}...\n\n`;
      });
    }

    if (results.official_metadata?.length > 0) {
      summary += `## Related Specifications\n\n`;
      results.official_metadata.forEach((spec: any) => {
        summary += `- **${spec.id}**: ${spec.title} (${spec.release})\n`;
      });
    }

    return summary;
  }

  private formatDetailed(results: any): string {
    let detailed = `# Comprehensive 3GPP Specification Analysis\n\n`;

    detailed += `## Search Overview\n`;
    detailed += `- **Query Processed**: ${results.tspec_results?.query_processed || 'N/A'}\n`;
    detailed += `- **Total Results**: ${results.tspec_results?.total_found || 0}\n`;
    detailed += `- **Search Performance**: ${results.tspec_results?.search_time_ms || 0}ms\n\n`;

    if (results.tspec_results?.results?.length > 0) {
      detailed += `## Specification Content (TSpec-LLM)\n\n`;
      results.tspec_results.results.forEach((result: any, index: number) => {
        detailed += `### Result ${index + 1}: ${result.source_specification}\n`;
        detailed += `- **Section**: ${result.section}\n`;
        detailed += `- **Release**: ${result.release}\n`;
        detailed += `- **Relevance**: ${Math.round(result.relevance_score * 100)}%\n`;
        detailed += `- **Working Group**: ${result.metadata.working_group}\n`;
        detailed += `- **Keywords**: ${result.metadata.keywords.join(', ')}\n\n`;
        detailed += `**Content**:\n`;
        detailed += `${result.content}\n\n`;
        detailed += `---\n\n`;
      });
    }

    if (results.official_metadata?.length > 0) {
      detailed += `## Official Specification Metadata\n\n`;
      results.official_metadata.forEach((spec: any) => {
        detailed += `### ${spec.id}: ${spec.title}\n`;
        detailed += `- **Version**: ${spec.version}\n`;
        detailed += `- **Release**: ${spec.release}\n`;
        detailed += `- **Working Group**: ${spec.working_group}\n`;
        detailed += `- **Status**: ${spec.status}\n`;
        detailed += `- **Publication Date**: ${spec.publication_date}\n`;
        detailed += `- **Dependencies**: ${spec.dependencies.join(', ')}\n`;
        detailed += `- **Keywords**: ${spec.keywords.join(', ')}\n\n`;
        detailed += `**Summary**: ${spec.summary}\n\n`;
      });
    }

    if (results.working_group_info?.length > 0) {
      detailed += `## Working Group Information\n\n`;
      results.working_group_info.forEach((wg: any) => {
        detailed += `### ${wg.name}: ${wg.full_name}\n`;
        detailed += `- **Focus Area**: ${wg.focus_area}\n`;
        detailed += `- **Key Specifications**: ${wg.specifications.join(', ')}\n\n`;
      });
    }

    if (results.release_info?.length > 0) {
      detailed += `## Release Information\n\n`;
      results.release_info.forEach((rel: any) => {
        detailed += `### ${rel.release}\n`;
        detailed += `- **Freeze Date**: ${rel.freeze_date}\n`;
        detailed += `- **Status**: ${rel.status}\n`;
        detailed += `- **Major Features**: ${rel.major_features.join(', ')}\n\n`;
      });
    }

    return detailed;
  }

  private determineImplementationPriority(results: any): string[] {
    const priorities: string[] = [];

    if (results.tspec_results?.results?.length > 0) {
      const topResult = results.tspec_results.results[0];

      if (topResult.source_specification.startsWith('TS 32')) {
        priorities.push('charging_systems');
      }
      if (topResult.source_specification.startsWith('TS 33')) {
        priorities.push('security_implementation');
      }
      if (topResult.source_specification.startsWith('TS 38')) {
        priorities.push('radio_procedures');
      }
      if (topResult.source_specification.startsWith('TS 23')) {
        priorities.push('system_architecture');
      }
    }

    return priorities.length > 0 ? priorities : ['general_implementation'];
  }

  private getRecommendedReadingOrder(results: any): string[] {
    const specs = new Set<string>();

    // Add specs from TSpec results
    results.tspec_results?.results?.forEach((result: any) => {
      specs.add(result.source_specification);
    });

    // Add specs from official metadata
    results.official_metadata?.forEach((spec: any) => {
      specs.add(spec.id);
    });

    // Sort by logical reading order (architecture -> procedures -> implementation)
    const sortedSpecs = Array.from(specs).sort((a, b) => {
      const orderMap: { [key: string]: number } = {
        'TS 23': 1, // Architecture first
        'TS 33': 2, // Security concepts
        'TS 38': 3, // Radio procedures
        'TS 32': 4, // Management and charging
        'TS 29': 5  // Protocols and APIs
      };

      const aPrefix = a.substring(0, 5);
      const bPrefix = b.substring(0, 5);
      return (orderMap[aPrefix] || 999) - (orderMap[bPrefix] || 999);
    });

    return sortedSpecs;
  }

  private extractKeyConcepts(results: any): string[] {
    const concepts = new Set<string>();

    // Extract from TSpec content
    results.tspec_results?.results?.forEach((result: any) => {
      result.metadata.keywords.forEach((keyword: string) => {
        concepts.add(keyword);
      });
    });

    // Extract from official specs
    results.official_metadata?.forEach((spec: any) => {
      spec.keywords.forEach((keyword: string) => {
        concepts.add(keyword);
      });
    });

    return Array.from(concepts).slice(0, 10); // Top 10 concepts
  }

  private suggestNextActions(results: any): string[] {
    const actions: string[] = [];

    if (results.tspec_results?.results?.length > 0) {
      const topResult = results.tspec_results.results[0];

      if (topResult.content.toLowerCase().includes('implementation')) {
        actions.push('Review implementation requirements in detail');
      }
      if (topResult.content.toLowerCase().includes('procedure')) {
        actions.push('Analyze procedure flows and message sequences');
      }
      if (topResult.content.toLowerCase().includes('interface')) {
        actions.push('Study interface specifications and APIs');
      }
    }

    actions.push('Compare with related specifications for consistency');
    actions.push('Validate against latest release requirements');

    return actions;
  }
}