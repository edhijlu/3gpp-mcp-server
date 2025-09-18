import { APIManager } from '../api';

export interface CompareSpecificationsArgs {
  specification_ids: string[];
  comparison_criteria?: string[];
  include_evolution_analysis?: boolean;
  format?: 'detailed' | 'summary' | 'agent_ready';
}

export class CompareSpecificationsTool {
  private apiManager: APIManager;

  constructor(apiManager: APIManager) {
    this.apiManager = apiManager;
  }

  getDefinition() {
    return {
      name: 'compare_specifications',
      description: 'Compare multiple 3GPP specifications across various criteria including architecture, procedures, evolution, and implementation differences.',
      inputSchema: {
        type: 'object',
        properties: {
          specification_ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of specification IDs to compare (e.g., ["TS 32.251", "TS 32.290"])',
            minItems: 2,
            maxItems: 5
          },
          comparison_criteria: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific criteria to compare (e.g., ["architecture", "procedures", "interfaces", "evolution"])'
          },
          include_evolution_analysis: {
            type: 'boolean',
            description: 'Include analysis of specification evolution across releases (default: true)',
            default: true
          },
          format: {
            type: 'string',
            enum: ['detailed', 'summary', 'agent_ready'],
            description: 'Response format - agent_ready provides structured JSON for AI agents',
            default: 'agent_ready'
          }
        },
        required: ['specification_ids']
      }
    };
  }

  async execute(args: CompareSpecificationsArgs) {
    try {
      if (args.specification_ids.length < 2) {
        throw new Error('At least 2 specifications are required for comparison');
      }

      const comparison = await this.apiManager.compareSpecifications(args.specification_ids);

      const format = args.format || 'agent_ready';

      switch (format) {
        case 'agent_ready':
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(this.formatForAgent(comparison, args), null, 2)
              }
            ]
          };

        case 'summary':
          return {
            content: [
              {
                type: 'text',
                text: this.formatSummary(comparison, args)
              }
            ]
          };

        case 'detailed':
        default:
          return {
            content: [
              {
                type: 'text',
                text: this.formatDetailed(comparison, args)
              }
            ]
          };
      }

    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error comparing specifications: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  }

  private formatForAgent(comparison: any, args: CompareSpecificationsArgs): any {
    const result: any = {
      comparison_overview: {
        specifications_compared: comparison.specifications.map((spec: any) => ({
          id: spec.id,
          title: spec.title,
          release: spec.release,
          working_group: spec.working_group,
          version: spec.version
        })),
        total_specifications: comparison.specifications.length,
        comparison_criteria: args.comparison_criteria || ['general']
      },

      comparison_matrix: {
        working_groups: this.analyzeWorkingGroups(comparison.comparison_matrix.working_groups),
        releases: this.analyzeReleases(comparison.comparison_matrix.releases),
        dependencies: this.analyzeDependencies(comparison.comparison_matrix.dependencies),
        focus_areas: this.analyzeFocusAreas(comparison.comparison_matrix.focus_areas)
      },

      key_differences: this.identifyKeyDifferences(comparison.specifications),
      similarities: this.identifySimilarities(comparison.specifications),
      migration_analysis: this.generateMigrationAnalysis(comparison.specifications),
      implementation_impact: this.assessImplementationImpact(comparison.specifications)
    };

    if (args.include_evolution_analysis !== false && comparison.evolution_analysis) {
      result.evolution_analysis = {
        evolutionary_changes: comparison.evolution_analysis,
        release_progression: this.analyzeReleaseProgression(comparison.evolution_analysis),
        feature_evolution: this.analyzeFeatureEvolution(comparison.evolution_analysis)
      };
    }

    return result;
  }

  private formatSummary(comparison: any, args: CompareSpecificationsArgs): string {
    let summary = `# Specification Comparison Summary\n\n`;

    summary += `## Specifications Compared\n`;
    comparison.specifications.forEach((spec: any, index: number) => {
      summary += `${index + 1}. **${spec.id}**: ${spec.title} (${spec.release})\n`;
    });
    summary += '\n';

    summary += `## Key Differences\n`;
    const differences = this.identifyKeyDifferences(comparison.specifications);
    Object.entries(differences).forEach(([category, diffs]) => {
      if (Array.isArray(diffs) && diffs.length > 0) {
        summary += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
        diffs.forEach((diff: string) => {
          summary += `- ${diff}\n`;
        });
        summary += '\n';
      }
    });

    summary += `## Working Group Distribution\n`;
    const wgAnalysis = this.analyzeWorkingGroups(comparison.comparison_matrix.working_groups);
    Object.entries(wgAnalysis.distribution).forEach(([wg, count]) => {
      summary += `- **${wg}**: ${count} specifications\n`;
    });
    summary += '\n';

    summary += `## Release Coverage\n`;
    const releaseAnalysis = this.analyzeReleases(comparison.comparison_matrix.releases);
    Object.entries(releaseAnalysis.distribution).forEach(([release, count]) => {
      summary += `- **${release}**: ${count} specifications\n`;
    });

    return summary;
  }

  private formatDetailed(comparison: any, args: CompareSpecificationsArgs): string {
    let detailed = `# Comprehensive Specification Comparison\n\n`;

    detailed += `## Specifications Overview\n`;
    comparison.specifications.forEach((spec: any, index: number) => {
      detailed += `### ${index + 1}. ${spec.id}\n`;
      detailed += `- **Title**: ${spec.title}\n`;
      detailed += `- **Version**: ${spec.version}\n`;
      detailed += `- **Release**: ${spec.release}\n`;
      detailed += `- **Working Group**: ${spec.working_group}\n`;
      detailed += `- **Status**: ${spec.status}\n`;
      detailed += `- **Publication Date**: ${spec.publication_date}\n`;
      detailed += `- **Keywords**: ${spec.keywords.join(', ')}\n`;
      detailed += `- **Dependencies**: ${spec.dependencies.join(', ')}\n\n`;
      detailed += `**Summary**: ${spec.summary}\n\n`;
    });

    detailed += `## Detailed Comparison Matrix\n\n`;

    detailed += `### Working Group Analysis\n`;
    const wgAnalysis = this.analyzeWorkingGroups(comparison.comparison_matrix.working_groups);
    detailed += `- **Distribution**: ${JSON.stringify(wgAnalysis.distribution, null, 2)}\n`;
    detailed += `- **Cross-WG Specifications**: ${wgAnalysis.cross_wg_count}\n\n`;

    detailed += `### Release Analysis\n`;
    const releaseAnalysis = this.analyzeReleases(comparison.comparison_matrix.releases);
    detailed += `- **Distribution**: ${JSON.stringify(releaseAnalysis.distribution, null, 2)}\n`;
    detailed += `- **Release Span**: ${releaseAnalysis.span}\n\n`;

    detailed += `### Dependency Analysis\n`;
    const depAnalysis = this.analyzeDependencies(comparison.comparison_matrix.dependencies);
    detailed += `- **Common Dependencies**: ${depAnalysis.common_dependencies.join(', ')}\n`;
    detailed += `- **Unique Dependencies**: ${depAnalysis.unique_dependencies.join(', ')}\n\n`;

    if (args.include_evolution_analysis !== false && comparison.evolution_analysis) {
      detailed += `## Evolution Analysis\n\n`;
      comparison.evolution_analysis.forEach((evolution: any) => {
        detailed += `### ${evolution.specification}\n`;
        evolution.evolution.forEach((item: any) => {
          detailed += `- **${item.release}** (${item.version}): ${item.major_changes.join(', ')}\n`;
        });
        detailed += '\n';
      });
    }

    return detailed;
  }

  private analyzeWorkingGroups(wgData: any[]): any {
    const distribution: { [key: string]: number } = {};
    let crossWgCount = 0;

    wgData.forEach(item => {
      const wg = item.working_group;
      distribution[wg] = (distribution[wg] || 0) + 1;
    });

    const uniqueWgs = Object.keys(distribution);
    if (uniqueWgs.length > 1) {
      crossWgCount = wgData.length;
    }

    return {
      distribution,
      unique_working_groups: uniqueWgs.length,
      cross_wg_count: crossWgCount,
      dominant_wg: uniqueWgs.reduce((a, b) => distribution[a] > distribution[b] ? a : b, uniqueWgs[0])
    };
  }

  private analyzeReleases(releaseData: any[]): any {
    const distribution: { [key: string]: number } = {};

    releaseData.forEach(item => {
      const release = item.release;
      distribution[release] = (distribution[release] || 0) + 1;
    });

    const releases = Object.keys(distribution).sort();
    return {
      distribution,
      unique_releases: releases.length,
      span: releases.length > 1 ? `${releases[0]} to ${releases[releases.length - 1]}` : releases[0],
      latest_release: releases[releases.length - 1]
    };
  }

  private analyzeDependencies(depData: any[]): any {
    const allDeps = new Set<string>();
    const depCounts: { [key: string]: number } = {};

    depData.forEach(item => {
      item.dependencies.forEach((dep: string) => {
        allDeps.add(dep);
        depCounts[dep] = (depCounts[dep] || 0) + 1;
      });
    });

    const commonDeps = Object.entries(depCounts)
      .filter(([_, count]) => count > 1)
      .map(([dep, _]) => dep);

    const uniqueDeps = Object.entries(depCounts)
      .filter(([_, count]) => count === 1)
      .map(([dep, _]) => dep);

    return {
      total_unique_dependencies: allDeps.size,
      common_dependencies: commonDeps,
      unique_dependencies: uniqueDeps,
      most_referenced: Object.entries(depCounts)
        .reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0]
    };
  }

  private analyzeFocusAreas(focusData: any[]): any {
    const allKeywords = new Set<string>();
    const keywordCounts: { [key: string]: number } = {};

    focusData.forEach(item => {
      item.keywords.forEach((keyword: string) => {
        allKeywords.add(keyword);
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      });
    });

    const commonKeywords = Object.entries(keywordCounts)
      .filter(([_, count]) => count > 1)
      .map(([keyword, _]) => keyword);

    return {
      total_keywords: allKeywords.size,
      common_focus_areas: commonKeywords,
      dominant_themes: Object.entries(keywordCounts)
        .sort(([_, a], [__, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([keyword, _]) => keyword)
    };
  }

  private identifyKeyDifferences(specifications: any[]): any {
    const differences: any = {
      working_groups: [],
      releases: [],
      complexity: [],
      focus_areas: []
    };

    // Working group differences
    const wgs = [...new Set(specifications.map(spec => spec.working_group))];
    if (wgs.length > 1) {
      differences.working_groups.push(`Spans ${wgs.length} working groups: ${wgs.join(', ')}`);
    }

    // Release differences
    const releases = [...new Set(specifications.map(spec => spec.release))];
    if (releases.length > 1) {
      differences.releases.push(`Covers ${releases.length} releases: ${releases.sort().join(', ')}`);
    }

    // Complexity differences
    specifications.forEach(spec => {
      const complexity = spec.dependencies.length > 5 ? 'high' : spec.dependencies.length > 2 ? 'medium' : 'low';
      differences.complexity.push(`${spec.id}: ${complexity} complexity (${spec.dependencies.length} dependencies)`);
    });

    return differences;
  }

  private identifySimilarities(specifications: any[]): any {
    const similarities: any = {
      common_keywords: [],
      shared_dependencies: [],
      same_working_group: false,
      same_release: false
    };

    // Common keywords
    const keywordSets = specifications.map(spec => new Set(spec.keywords));
    const intersection = keywordSets.reduce((acc, set) =>
      new Set([...acc].filter(x => set.has(x)))
    );
    similarities.common_keywords = Array.from(intersection);

    // Shared dependencies
    const depSets = specifications.map(spec => new Set(spec.dependencies));
    const sharedDeps = depSets.reduce((acc, set) =>
      new Set([...acc].filter(x => set.has(x)))
    );
    similarities.shared_dependencies = Array.from(sharedDeps);

    // Same working group
    const wgs = [...new Set(specifications.map(spec => spec.working_group))];
    similarities.same_working_group = wgs.length === 1;

    // Same release
    const releases = [...new Set(specifications.map(spec => spec.release))];
    similarities.same_release = releases.length === 1;

    return similarities;
  }

  private generateMigrationAnalysis(specifications: any[]): any {
    // Identify potential migration paths based on releases and dependencies
    const sortedSpecs = specifications.sort((a, b) => a.release.localeCompare(b.release));

    return {
      migration_path: sortedSpecs.map(spec => ({
        specification: spec.id,
        release: spec.release,
        migration_complexity: this.assessMigrationComplexity(spec),
        breaking_changes: this.identifyBreakingChanges(spec)
      })),
      recommended_approach: this.getRecommendedMigrationApproach(sortedSpecs)
    };
  }

  private assessImplementationImpact(specifications: any[]): any {
    return {
      implementation_complexity: this.calculateOverallComplexity(specifications),
      resource_requirements: this.estimateResourceRequirements(specifications),
      timeline_estimate: this.estimateImplementationTimeline(specifications),
      risk_factors: this.identifyRiskFactors(specifications)
    };
  }

  private analyzeReleaseProgression(evolutionData: any[]): any {
    return evolutionData.map(evolution => ({
      specification: evolution.specification,
      progression: evolution.evolution.map((item: any) => item.release),
      change_frequency: evolution.evolution.length,
      stability: evolution.evolution.length < 3 ? 'stable' : 'evolving'
    }));
  }

  private analyzeFeatureEvolution(evolutionData: any[]): any {
    const allChanges = evolutionData.flatMap(evolution =>
      evolution.evolution.flatMap((item: any) => item.major_changes)
    );

    const changeFrequency: { [key: string]: number } = {};
    allChanges.forEach(change => {
      changeFrequency[change] = (changeFrequency[change] || 0) + 1;
    });

    return {
      most_common_changes: Object.entries(changeFrequency)
        .sort(([_, a], [__, b]) => (b as number) - (a as number))
        .slice(0, 5),
      total_unique_changes: Object.keys(changeFrequency).length,
      evolution_patterns: this.identifyEvolutionPatterns(evolutionData)
    };
  }

  private assessMigrationComplexity(spec: any): string {
    if (spec.dependencies.length > 5) return 'high';
    if (spec.dependencies.length > 2) return 'medium';
    return 'low';
  }

  private identifyBreakingChanges(spec: any): string[] {
    // This would be enhanced with actual change analysis
    const changes: string[] = [];
    if (spec.release === 'Rel-17') {
      changes.push('Service-based architecture changes');
    }
    return changes;
  }

  private getRecommendedMigrationApproach(specs: any[]): string {
    if (specs.length === 2) {
      return 'Direct migration with comprehensive testing';
    }
    return 'Phased migration following release order';
  }

  private calculateOverallComplexity(specs: any[]): string {
    const avgDeps = specs.reduce((sum, spec) => sum + spec.dependencies.length, 0) / specs.length;
    if (avgDeps > 5) return 'high';
    if (avgDeps > 2) return 'medium';
    return 'low';
  }

  private estimateResourceRequirements(specs: any[]): any {
    return {
      development_team_size: Math.ceil(specs.length * 1.5),
      estimated_duration_weeks: specs.length * 4,
      specialist_roles_needed: this.identifySpecialistRoles(specs)
    };
  }

  private estimateImplementationTimeline(specs: any[]): string {
    const weeks = specs.length * 4;
    return `${weeks} weeks (${Math.ceil(weeks / 4)} months)`;
  }

  private identifyRiskFactors(specs: any[]): string[] {
    const risks: string[] = [];

    const wgs = [...new Set(specs.map(spec => spec.working_group))];
    if (wgs.length > 2) {
      risks.push('Multiple working groups involved - coordination complexity');
    }

    const releases = [...new Set(specs.map(spec => spec.release))];
    if (releases.length > 1) {
      risks.push('Cross-release implementation - compatibility concerns');
    }

    if (specs.some(spec => spec.keywords.includes('security'))) {
      risks.push('Security-critical components - extensive testing required');
    }

    return risks;
  }

  private identifySpecialistRoles(specs: any[]): string[] {
    const roles = new Set<string>();

    specs.forEach(spec => {
      if (spec.keywords.includes('charging')) roles.add('charging_specialist');
      if (spec.keywords.includes('security')) roles.add('security_architect');
      if (spec.keywords.includes('radio')) roles.add('radio_engineer');
      if (spec.working_group === 'SA2') roles.add('system_architect');
    });

    return Array.from(roles);
  }

  private identifyEvolutionPatterns(evolutionData: any[]): string[] {
    const patterns: string[] = [];

    evolutionData.forEach(evolution => {
      if (evolution.evolution.length > 3) {
        patterns.push(`${evolution.specification}: Rapid evolution pattern`);
      }
      if (evolution.evolution.some((item: any) => item.major_changes.length > 3)) {
        patterns.push(`${evolution.specification}: Major feature additions`);
      }
    });

    return patterns;
  }
}