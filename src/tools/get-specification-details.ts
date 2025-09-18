import { APIManager } from '../api';

export interface GetSpecificationDetailsArgs {
  specification_id: string;
  include_content?: boolean;
  include_dependencies?: boolean;
  format?: 'detailed' | 'summary' | 'agent_ready';
}

export class GetSpecificationDetailsTool {
  private apiManager: APIManager;

  constructor(apiManager: APIManager) {
    this.apiManager = apiManager;
  }

  getDefinition() {
    return {
      name: 'get_specification_details',
      description: 'Get comprehensive details about a specific 3GPP specification including metadata, content, dependencies, and related information.',
      inputSchema: {
        type: 'object',
        properties: {
          specification_id: {
            type: 'string',
            description: 'The specification ID (e.g., "TS 32.290", "TS 38.331", "TS 33.501")'
          },
          include_content: {
            type: 'boolean',
            description: 'Include detailed content from TSpec-LLM dataset (default: true)',
            default: true
          },
          include_dependencies: {
            type: 'boolean',
            description: 'Include information about specification dependencies (default: true)',
            default: true
          },
          format: {
            type: 'string',
            enum: ['detailed', 'summary', 'agent_ready'],
            description: 'Response format - agent_ready provides structured JSON for AI agents',
            default: 'agent_ready'
          }
        },
        required: ['specification_id']
      }
    };
  }

  async execute(args: GetSpecificationDetailsArgs) {
    try {
      const details = await this.apiManager.getSpecificationDetails(args.specification_id);

      const format = args.format || 'agent_ready';

      switch (format) {
        case 'agent_ready':
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(this.formatForAgent(details, args), null, 2)
              }
            ]
          };

        case 'summary':
          return {
            content: [
              {
                type: 'text',
                text: this.formatSummary(details, args)
              }
            ]
          };

        case 'detailed':
        default:
          return {
            content: [
              {
                type: 'text',
                text: this.formatDetailed(details, args)
              }
            ]
          };
      }

    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving specification details: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  }

  private formatForAgent(details: any, args: GetSpecificationDetailsArgs): any {
    const result: any = {
      specification: {
        id: details.metadata.id,
        title: details.metadata.title,
        version: details.metadata.version,
        release: details.metadata.release,
        working_group: details.metadata.working_group,
        status: details.metadata.status,
        publication_date: details.metadata.publication_date,
        summary: details.metadata.summary,
        keywords: details.metadata.keywords
      },

      working_group: {
        name: details.working_group.name,
        full_name: details.working_group.full_name,
        focus_area: details.working_group.focus_area,
        related_specifications: details.working_group.specifications
      },

      release_info: {
        release: details.release.release,
        freeze_date: details.release.freeze_date,
        status: details.release.status,
        major_features: details.release.major_features
      }
    };

    if (args.include_dependencies !== false) {
      result.dependencies = {
        direct_dependencies: details.metadata.dependencies,
        dependency_analysis: this.analyzeDependencies(details.metadata.dependencies)
      };
    }

    if (args.include_content !== false && details.tspec_content) {
      result.content = {
        total_sections: details.tspec_content.results.length,
        sections: details.tspec_content.results.map((section: any) => ({
          section: section.section,
          content: section.content,
          relevance_score: section.relevance_score,
          keywords: section.metadata.keywords
        }))
      };
    }

    result.implementation_guidance = {
      complexity_level: this.assessComplexity(details),
      implementation_priority: this.getImplementationPriority(details),
      recommended_prerequisites: this.getPrerequisites(details),
      common_use_cases: this.getCommonUseCases(details),
      testing_considerations: this.getTestingConsiderations(details)
    };

    return result;
  }

  private formatSummary(details: any, args: GetSpecificationDetailsArgs): string {
    let summary = `# ${details.metadata.id}: ${details.metadata.title}\n\n`;

    summary += `## Overview\n`;
    summary += `- **Version**: ${details.metadata.version}\n`;
    summary += `- **Release**: ${details.metadata.release}\n`;
    summary += `- **Working Group**: ${details.working_group.full_name} (${details.metadata.working_group})\n`;
    summary += `- **Status**: ${details.metadata.status}\n`;
    summary += `- **Publication Date**: ${details.metadata.publication_date}\n\n`;

    summary += `## Summary\n`;
    summary += `${details.metadata.summary}\n\n`;

    if (args.include_dependencies !== false && details.metadata.dependencies.length > 0) {
      summary += `## Key Dependencies\n`;
      details.metadata.dependencies.forEach((dep: string) => {
        summary += `- ${dep}\n`;
      });
      summary += '\n';
    }

    summary += `## Focus Area\n`;
    summary += `${details.working_group.focus_area}\n\n`;

    if (details.metadata.keywords.length > 0) {
      summary += `## Key Concepts\n`;
      summary += `${details.metadata.keywords.join(', ')}\n\n`;
    }

    return summary;
  }

  private formatDetailed(details: any, args: GetSpecificationDetailsArgs): string {
    let detailed = `# Complete Analysis: ${details.metadata.id}\n\n`;

    detailed += `## Specification Metadata\n`;
    detailed += `- **Full Title**: ${details.metadata.title}\n`;
    detailed += `- **Specification ID**: ${details.metadata.id}\n`;
    detailed += `- **Version**: ${details.metadata.version}\n`;
    detailed += `- **3GPP Release**: ${details.metadata.release}\n`;
    detailed += `- **Working Group**: ${details.working_group.full_name} (${details.metadata.working_group})\n`;
    detailed += `- **Publication Status**: ${details.metadata.status}\n`;
    detailed += `- **Publication Date**: ${details.metadata.publication_date}\n`;
    detailed += `- **Keywords**: ${details.metadata.keywords.join(', ')}\n\n`;

    detailed += `## Description\n`;
    detailed += `${details.metadata.summary}\n\n`;

    detailed += `## Working Group Context\n`;
    detailed += `**${details.working_group.full_name}** focuses on ${details.working_group.focus_area}.\n\n`;
    detailed += `**Related Specifications:**\n`;
    details.working_group.specifications.forEach((spec: string) => {
      detailed += `- ${spec}\n`;
    });
    detailed += '\n';

    detailed += `## Release Context: ${details.release.release}\n`;
    detailed += `- **Freeze Date**: ${details.release.freeze_date}\n`;
    detailed += `- **Status**: ${details.release.status}\n`;
    detailed += `- **Major Features**: ${details.release.major_features.join(', ')}\n\n`;

    if (args.include_dependencies !== false && details.metadata.dependencies.length > 0) {
      detailed += `## Dependencies\n`;
      details.metadata.dependencies.forEach((dep: string) => {
        detailed += `- **${dep}**: ${this.getDependencyDescription(dep)}\n`;
      });
      detailed += '\n';
    }

    if (args.include_content !== false && details.tspec_content?.results?.length > 0) {
      detailed += `## Content Sections (from TSpec-LLM)\n\n`;
      details.tspec_content.results.forEach((section: any, index: number) => {
        detailed += `### Section ${index + 1}: ${section.section}\n`;
        detailed += `**Relevance**: ${Math.round(section.relevance_score * 100)}%\n\n`;
        detailed += `${section.content}\n\n`;
        detailed += `---\n\n`;
      });
    }

    return detailed;
  }

  private analyzeDependencies(dependencies: string[]): any {
    return {
      total_dependencies: dependencies.length,
      dependency_types: this.categorizeDependencies(dependencies),
      implementation_order: this.getImplementationOrder(dependencies)
    };
  }

  private categorizeDependencies(dependencies: string[]): any {
    const categories = {
      architecture: [] as string[],
      security: [] as string[],
      protocols: [] as string[],
      management: [] as string[],
      radio: [] as string[]
    };

    dependencies.forEach(dep => {
      if (dep.startsWith('TS 23')) {
        categories.architecture.push(dep);
      } else if (dep.startsWith('TS 33')) {
        categories.security.push(dep);
      } else if (dep.startsWith('TS 29')) {
        categories.protocols.push(dep);
      } else if (dep.startsWith('TS 32')) {
        categories.management.push(dep);
      } else if (dep.startsWith('TS 38') || dep.startsWith('TS 36')) {
        categories.radio.push(dep);
      }
    });

    return categories;
  }

  private getImplementationOrder(dependencies: string[]): string[] {
    // Sort dependencies by typical implementation order
    return dependencies.sort((a, b) => {
      const orderMap: { [key: string]: number } = {
        'TS 23': 1, // Architecture first
        'TS 33': 2, // Security foundations
        'TS 29': 3, // Protocol interfaces
        'TS 38': 4, // Radio procedures
        'TS 32': 5  // Management and OAM
      };

      const aPrefix = a.substring(0, 5);
      const bPrefix = b.substring(0, 5);
      return (orderMap[aPrefix] || 999) - (orderMap[bPrefix] || 999);
    });
  }

  private getDependencyDescription(dep: string): string {
    const descriptions: { [key: string]: string } = {
      'TS 23.501': 'System architecture for 5G System',
      'TS 23.502': 'Procedures for the 5G System',
      'TS 33.501': 'Security architecture and procedures for 5G',
      'TS 32.240': 'Charging architecture and principles',
      'TS 29.500': 'Technical realization of Service Based Architecture'
    };
    return descriptions[dep] || 'Related technical specification';
  }

  private assessComplexity(details: any): string {
    const spec = details.metadata;

    if (spec.dependencies.length > 5) return 'high';
    if (spec.dependencies.length > 2) return 'medium';
    return 'low';
  }

  private getImplementationPriority(details: any): string {
    const spec = details.metadata;

    if (spec.id.startsWith('TS 23')) return 'foundational';
    if (spec.id.startsWith('TS 33')) return 'security-critical';
    if (spec.id.startsWith('TS 32')) return 'operational';
    if (spec.id.startsWith('TS 38')) return 'radio-specific';
    return 'standard';
  }

  private getPrerequisites(details: any): string[] {
    const spec = details.metadata;
    const prerequisites: string[] = [];

    if (spec.keywords.includes('5g')) {
      prerequisites.push('Understanding of 5G system architecture');
    }
    if (spec.keywords.includes('charging')) {
      prerequisites.push('Telecom charging and billing concepts');
    }
    if (spec.keywords.includes('security')) {
      prerequisites.push('Network security fundamentals');
    }
    if (spec.keywords.includes('radio')) {
      prerequisites.push('Radio communication principles');
    }

    return prerequisites;
  }

  private getCommonUseCases(details: any): string[] {
    const spec = details.metadata;
    const useCases: string[] = [];

    if (spec.id.startsWith('TS 32')) {
      useCases.push('Charging system implementation');
      useCases.push('Billing integration projects');
      useCases.push('Revenue assurance systems');
    }
    if (spec.id.startsWith('TS 33')) {
      useCases.push('Security architecture design');
      useCases.push('Authentication system implementation');
      useCases.push('Privacy protection mechanisms');
    }
    if (spec.id.startsWith('TS 38')) {
      useCases.push('5G radio network deployment');
      useCases.push('Handover optimization');
      useCases.push('Radio resource management');
    }

    return useCases;
  }

  private getTestingConsiderations(details: any): string[] {
    const spec = details.metadata;
    const considerations: string[] = [];

    considerations.push('Compliance testing with specification requirements');
    considerations.push('Interoperability testing with related systems');

    if (spec.keywords.includes('procedure')) {
      considerations.push('Procedure flow validation testing');
    }
    if (spec.keywords.includes('interface')) {
      considerations.push('Interface conformance testing');
    }
    if (spec.keywords.includes('security')) {
      considerations.push('Security vulnerability assessment');
    }

    return considerations;
  }
}