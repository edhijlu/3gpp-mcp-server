import { APIManager } from '../api';

export interface FindImplementationRequirementsArgs {
  feature: string;
  domain?: string;
  complexity_level?: 'basic' | 'intermediate' | 'advanced';
  include_dependencies?: boolean;
  include_testing_guidance?: boolean;
  format?: 'detailed' | 'summary' | 'agent_ready';
}

export class FindImplementationRequirementsTool {
  private apiManager: APIManager;

  constructor(apiManager: APIManager) {
    this.apiManager = apiManager;
  }

  getDefinition() {
    return {
      name: 'find_implementation_requirements',
      description: 'Extract detailed implementation requirements for specific 3GPP features, including mandatory/optional requirements, dependencies, and implementation guidance.',
      inputSchema: {
        type: 'object',
        properties: {
          feature: {
            type: 'string',
            description: 'The feature or functionality to analyze (e.g., "CHF implementation", "5G handover", "SUCI privacy protection")'
          },
          domain: {
            type: 'string',
            description: 'Specific domain context (e.g., "charging", "security", "mobility", "radio")'
          },
          complexity_level: {
            type: 'string',
            enum: ['basic', 'intermediate', 'advanced'],
            description: 'Implementation complexity level (default: intermediate)',
            default: 'intermediate'
          },
          include_dependencies: {
            type: 'boolean',
            description: 'Include dependency analysis and prerequisite requirements (default: true)',
            default: true
          },
          include_testing_guidance: {
            type: 'boolean',
            description: 'Include testing and validation guidance (default: true)',
            default: true
          },
          format: {
            type: 'string',
            enum: ['detailed', 'summary', 'agent_ready'],
            description: 'Response format - agent_ready provides structured JSON for AI agents',
            default: 'agent_ready'
          }
        },
        required: ['feature']
      }
    };
  }

  async execute(args: FindImplementationRequirementsArgs) {
    try {
      const context = {
        domain: args.domain,
        complexity_level: args.complexity_level || 'intermediate'
      };

      const requirements = await this.apiManager.findImplementationRequirements(args.feature, context);

      const format = args.format || 'agent_ready';

      switch (format) {
        case 'agent_ready':
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(this.formatForAgent(requirements, args), null, 2)
              }
            ]
          };

        case 'summary':
          return {
            content: [
              {
                type: 'text',
                text: this.formatSummary(requirements, args)
              }
            ]
          };

        case 'detailed':
        default:
          return {
            content: [
              {
                type: 'text',
                text: this.formatDetailed(requirements, args)
              }
            ]
          };
      }

    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error finding implementation requirements: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  }

  private formatForAgent(requirements: any, args: FindImplementationRequirementsArgs): any {
    const result: any = {
      feature_analysis: {
        feature_name: args.feature,
        domain: args.domain || 'general',
        complexity_level: args.complexity_level || 'intermediate',
        total_requirements: requirements.requirements.length
      },

      requirements_breakdown: {
        mandatory_requirements: requirements.requirements.filter((req: any) => req.mandatory),
        recommended_requirements: requirements.requirements.filter((req: any) => !req.mandatory && req.type === 'recommended'),
        optional_requirements: requirements.requirements.filter((req: any) => req.type === 'optional'),
        informational_items: requirements.requirements.filter((req: any) => req.type === 'informational')
      },

      implementation_details: {
        primary_specifications: requirements.related_specifications.slice(0, 3).map((spec: any) => ({
          id: spec.id,
          title: spec.title,
          release: spec.release,
          relevance: 'primary'
        })),
        supporting_specifications: requirements.related_specifications.slice(3).map((spec: any) => ({
          id: spec.id,
          title: spec.title,
          release: spec.release,
          relevance: 'supporting'
        })),
        implementation_guidance: requirements.implementation_guidance
      },

      technical_requirements: this.extractTechnicalRequirements(requirements.requirements),
      interface_requirements: this.extractInterfaceRequirements(requirements.requirements),
      performance_requirements: this.extractPerformanceRequirements(requirements.requirements)
    };

    if (args.include_dependencies !== false) {
      result.dependencies = {
        specification_dependencies: this.extractSpecificationDependencies(requirements.related_specifications),
        implementation_dependencies: this.extractImplementationDependencies(requirements.requirements),
        prerequisite_features: this.identifyPrerequisiteFeatures(args.feature, requirements)
      };
    }

    if (args.include_testing_guidance !== false) {
      result.testing_guidance = {
        test_categories: this.identifyTestCategories(args.feature, requirements),
        compliance_testing: this.getComplianceTesting(requirements.related_specifications),
        performance_testing: this.getPerformanceTesting(args.feature),
        interoperability_testing: this.getInteroperabilityTesting(requirements.related_specifications)
      };
    }

    result.implementation_timeline = this.estimateImplementationTimeline(args.feature, requirements);
    result.risk_assessment = this.assessImplementationRisks(args.feature, requirements);

    return result;
  }

  private formatSummary(requirements: any, args: FindImplementationRequirementsArgs): string {
    let summary = `# Implementation Requirements: ${args.feature}\n\n`;

    summary += `## Overview\n`;
    summary += `- **Feature**: ${args.feature}\n`;
    summary += `- **Domain**: ${args.domain || 'General'}\n`;
    summary += `- **Complexity**: ${args.complexity_level || 'Intermediate'}\n`;
    summary += `- **Total Requirements**: ${requirements.requirements.length}\n\n`;

    const mandatoryReqs = requirements.requirements.filter((req: any) => req.mandatory);
    if (mandatoryReqs.length > 0) {
      summary += `## Mandatory Requirements (${mandatoryReqs.length})\n`;
      mandatoryReqs.slice(0, 5).forEach((req: any, index: number) => {
        summary += `${index + 1}. **${req.source}** - ${req.description}\n`;
      });
      if (mandatoryReqs.length > 5) {
        summary += `... and ${mandatoryReqs.length - 5} more mandatory requirements\n`;
      }
      summary += '\n';
    }

    summary += `## Key Specifications\n`;
    requirements.related_specifications.slice(0, 5).forEach((spec: any) => {
      summary += `- **${spec.id}**: ${spec.title}\n`;
    });
    summary += '\n';

    summary += `## Implementation Guidance\n`;
    requirements.implementation_guidance.forEach((guidance: string, index: number) => {
      summary += `${index + 1}. ${guidance}\n`;
    });

    return summary;
  }

  private formatDetailed(requirements: any, args: FindImplementationRequirementsArgs): string {
    let detailed = `# Comprehensive Implementation Requirements Analysis\n\n`;
    detailed += `## Feature: ${args.feature}\n\n`;

    detailed += `### Analysis Parameters\n`;
    detailed += `- **Domain**: ${args.domain || 'General'}\n`;
    detailed += `- **Complexity Level**: ${args.complexity_level || 'Intermediate'}\n`;
    detailed += `- **Total Requirements Found**: ${requirements.requirements.length}\n`;
    detailed += `- **Related Specifications**: ${requirements.related_specifications.length}\n\n`;

    detailed += `## Requirements Breakdown\n\n`;

    const reqsByType = this.groupRequirementsByType(requirements.requirements);

    Object.entries(reqsByType).forEach(([type, reqs]) => {
      if (Array.isArray(reqs) && reqs.length > 0) {
        detailed += `### ${type.charAt(0).toUpperCase() + type.slice(1)} Requirements (${reqs.length})\n\n`;
        reqs.forEach((req: any, index: number) => {
          detailed += `#### ${index + 1}. ${req.source} - ${req.section}\n`;
          detailed += `**Description**: ${req.description}\n\n`;
          if (req.technical_details.length > 0) {
            detailed += `**Technical Details**:\n`;
            req.technical_details.forEach((detail: string) => {
              detailed += `- ${detail}\n`;
            });
            detailed += '\n';
          }
          detailed += `---\n\n`;
        });
      }
    });

    detailed += `## Related Specifications\n\n`;
    requirements.related_specifications.forEach((spec: any, index: number) => {
      detailed += `### ${index + 1}. ${spec.id}: ${spec.title}\n`;
      detailed += `- **Release**: ${spec.release}\n`;
      detailed += `- **Working Group**: ${spec.working_group}\n`;
      detailed += `- **Status**: ${spec.status}\n`;
      detailed += `- **Keywords**: ${spec.keywords.join(', ')}\n\n`;
      detailed += `**Summary**: ${spec.summary}\n\n`;
    });

    detailed += `## Implementation Guidance\n\n`;
    requirements.implementation_guidance.forEach((guidance: string, index: number) => {
      detailed += `### Step ${index + 1}\n`;
      detailed += `${guidance}\n\n`;
    });

    return detailed;
  }

  private extractTechnicalRequirements(requirements: any[]): any {
    const technical = requirements.filter(req =>
      req.description.toLowerCase().includes('technical') ||
      req.technical_details.length > 0
    );

    return {
      total_technical_requirements: technical.length,
      hardware_requirements: this.extractHardwareRequirements(technical),
      software_requirements: this.extractSoftwareRequirements(technical),
      protocol_requirements: this.extractProtocolRequirements(technical)
    };
  }

  private extractInterfaceRequirements(requirements: any[]): any {
    const interfaces = requirements.filter(req =>
      req.description.toLowerCase().includes('interface') ||
      req.description.toLowerCase().includes('api') ||
      req.description.toLowerCase().includes('protocol')
    );

    return {
      total_interface_requirements: interfaces.length,
      rest_api_requirements: interfaces.filter(req => req.description.toLowerCase().includes('rest')),
      service_based_interfaces: interfaces.filter(req => req.description.toLowerCase().includes('service')),
      legacy_interfaces: interfaces.filter(req => req.description.toLowerCase().includes('diameter'))
    };
  }

  private extractPerformanceRequirements(requirements: any[]): any {
    const performance = requirements.filter(req =>
      req.description.toLowerCase().includes('performance') ||
      req.description.toLowerCase().includes('latency') ||
      req.description.toLowerCase().includes('throughput') ||
      req.description.toLowerCase().includes('capacity')
    );

    return {
      total_performance_requirements: performance.length,
      latency_requirements: performance.filter(req => req.description.toLowerCase().includes('latency')),
      throughput_requirements: performance.filter(req => req.description.toLowerCase().includes('throughput')),
      scalability_requirements: performance.filter(req => req.description.toLowerCase().includes('scalability'))
    };
  }

  private extractSpecificationDependencies(specs: any[]): any {
    const dependencies = new Set<string>();
    specs.forEach(spec => {
      spec.dependencies.forEach((dep: string) => dependencies.add(dep));
    });

    return {
      total_dependencies: dependencies.size,
      dependency_list: Array.from(dependencies),
      critical_dependencies: this.identifyCriticalDependencies(Array.from(dependencies))
    };
  }

  private extractImplementationDependencies(requirements: any[]): string[] {
    const dependencies: string[] = [];

    requirements.forEach(req => {
      if (req.description.toLowerCase().includes('requires')) {
        dependencies.push(`${req.source}: ${req.description}`);
      }
    });

    return dependencies;
  }

  private identifyPrerequisiteFeatures(feature: string, requirements: any): string[] {
    const prerequisites: string[] = [];

    const featureLower = feature.toLowerCase();

    if (featureLower.includes('chf')) {
      prerequisites.push('Service-based architecture implementation');
      prerequisites.push('HTTP/2 protocol stack');
      prerequisites.push('OAuth 2.0 authentication');
    }

    if (featureLower.includes('handover')) {
      prerequisites.push('RRC connection management');
      prerequisites.push('Measurement configuration');
      prerequisites.push('Radio resource management');
    }

    if (featureLower.includes('security') || featureLower.includes('authentication')) {
      prerequisites.push('PKI infrastructure');
      prerequisites.push('Key management system');
      prerequisites.push('SUCI/SUPI privacy mechanisms');
    }

    return prerequisites;
  }

  private identifyTestCategories(feature: string, requirements: any): string[] {
    const categories: string[] = [];

    categories.push('Unit testing');
    categories.push('Integration testing');
    categories.push('System testing');

    const featureLower = feature.toLowerCase();

    if (featureLower.includes('charging')) {
      categories.push('Charging scenario testing');
      categories.push('Billing integration testing');
      categories.push('Rating accuracy testing');
    }

    if (featureLower.includes('security')) {
      categories.push('Security vulnerability testing');
      categories.push('Penetration testing');
      categories.push('Authentication flow testing');
    }

    if (featureLower.includes('handover') || featureLower.includes('mobility')) {
      categories.push('Mobility scenario testing');
      categories.push('Performance under mobility testing');
      categories.push('Service continuity testing');
    }

    return categories;
  }

  private getComplianceTesting(specs: any[]): any {
    return {
      conformance_testing: 'Test implementation against specification requirements',
      interoperability_testing: 'Validate interoperability with other network functions',
      protocol_compliance: 'Verify protocol message formats and procedures',
      test_specifications: specs.map(spec => `Test compliance with ${spec.id}`).slice(0, 3)
    };
  }

  private getPerformanceTesting(feature: string): any {
    const tests: any = {
      load_testing: 'Test under expected traffic loads',
      stress_testing: 'Test beyond normal operating conditions',
      scalability_testing: 'Validate horizontal and vertical scaling'
    };

    const featureLower = feature.toLowerCase();

    if (featureLower.includes('charging')) {
      tests.charging_performance = 'Test charging session processing rates';
      tests.billing_accuracy = 'Validate billing calculation accuracy under load';
    }

    if (featureLower.includes('handover')) {
      tests.handover_performance = 'Measure handover completion times';
      tests.service_continuity = 'Test service interruption minimization';
    }

    return tests;
  }

  private getInteroperabilityTesting(specs: any[]): any {
    return {
      multi_vendor_testing: 'Test with equipment from different vendors',
      cross_release_testing: 'Validate compatibility across 3GPP releases',
      interface_testing: 'Test all specified interfaces and protocols',
      end_to_end_testing: 'Complete workflow validation across network functions'
    };
  }

  private estimateImplementationTimeline(feature: string, requirements: any): any {
    const complexityFactor = requirements.requirements.length > 10 ? 1.5 : 1.0;
    const specCount = requirements.related_specifications.length;

    const baseWeeks = 8;
    const totalWeeks = Math.ceil(baseWeeks * complexityFactor + specCount * 2);

    return {
      estimated_duration_weeks: totalWeeks,
      phases: {
        requirements_analysis: Math.ceil(totalWeeks * 0.2),
        design_and_architecture: Math.ceil(totalWeeks * 0.3),
        implementation: Math.ceil(totalWeeks * 0.4),
        testing_and_validation: Math.ceil(totalWeeks * 0.1)
      },
      milestones: this.getImplementationMilestones(feature, totalWeeks)
    };
  }

  private assessImplementationRisks(feature: string, requirements: any): any {
    const risks: any = {
      technical_risks: [],
      integration_risks: [],
      compliance_risks: [],
      timeline_risks: []
    };

    const mandatoryCount = requirements.requirements.filter((req: any) => req.mandatory).length;
    if (mandatoryCount > 5) {
      risks.compliance_risks.push('High number of mandatory requirements - compliance complexity');
    }

    const specCount = requirements.related_specifications.length;
    if (specCount > 3) {
      risks.technical_risks.push('Multiple specifications involved - integration complexity');
    }

    const featureLower = feature.toLowerCase();

    if (featureLower.includes('security')) {
      risks.technical_risks.push('Security-critical implementation - requires specialized expertise');
      risks.compliance_risks.push('Security compliance requirements - extensive validation needed');
    }

    if (featureLower.includes('charging')) {
      risks.integration_risks.push('Billing system integration - revenue impact of errors');
      risks.compliance_risks.push('Regulatory compliance requirements for charging accuracy');
    }

    return risks;
  }

  private groupRequirementsByType(requirements: any[]): any {
    return requirements.reduce((acc, req) => {
      const type = req.type || 'general';
      if (!acc[type]) acc[type] = [];
      acc[type].push(req);
      return acc;
    }, {});
  }

  private extractHardwareRequirements(requirements: any[]): string[] {
    return requirements
      .filter(req => req.description.toLowerCase().includes('hardware') ||
                    req.description.toLowerCase().includes('memory') ||
                    req.description.toLowerCase().includes('cpu'))
      .map(req => req.description);
  }

  private extractSoftwareRequirements(requirements: any[]): string[] {
    return requirements
      .filter(req => req.description.toLowerCase().includes('software') ||
                    req.description.toLowerCase().includes('library') ||
                    req.description.toLowerCase().includes('framework'))
      .map(req => req.description);
  }

  private extractProtocolRequirements(requirements: any[]): string[] {
    return requirements
      .filter(req => req.description.toLowerCase().includes('protocol') ||
                    req.description.toLowerCase().includes('http') ||
                    req.description.toLowerCase().includes('diameter'))
      .map(req => req.description);
  }

  private identifyCriticalDependencies(dependencies: string[]): string[] {
    const critical: string[] = [];

    dependencies.forEach(dep => {
      if (dep.startsWith('TS 23')) critical.push(dep); // Architecture dependencies
      if (dep.startsWith('TS 33')) critical.push(dep); // Security dependencies
    });

    return critical;
  }

  private getImplementationMilestones(feature: string, totalWeeks: number): any[] {
    return [
      {
        milestone: 'Requirements Analysis Complete',
        week: Math.ceil(totalWeeks * 0.2),
        deliverables: ['Requirements specification', 'Dependency analysis', 'Risk assessment']
      },
      {
        milestone: 'Design and Architecture Complete',
        week: Math.ceil(totalWeeks * 0.5),
        deliverables: ['System design', 'Interface specifications', 'Implementation plan']
      },
      {
        milestone: 'Implementation Complete',
        week: Math.ceil(totalWeeks * 0.9),
        deliverables: ['Feature implementation', 'Unit tests', 'Integration tests']
      },
      {
        milestone: 'Validation and Deployment Ready',
        week: totalWeeks,
        deliverables: ['Compliance validation', 'Performance testing', 'Documentation']
      }
    ];
  }
}